// @ts-ignore
import { persisted } from "svelte-persisted-store";
import type { Notes } from "../dbtypes";
import type { NoteEx, Notess, SupabaseClient } from "./first";
import { derived, get, type Writable } from "svelte/store";
import { filterSort, getNotes, logIfError, partition_by_id } from "./utils";
import { option as O, record as R, string as S, array as A } from "fp-ts";
import { groupBy } from "fp-ts/lib/NonEmptyArray";
import { pipe } from "fp-ts/lib/function";
import Semaphore from "./semaphore";

const notes: { [id: number]: Notess } = {};
export type NoteDict = typeof notes;
export const notestore = persisted("notestore", notes);
const _note_del_queue: Notess = [];
const note_del_queue = persisted("note_del_queue", _note_del_queue);

export class NoteSync {
  sb: SupabaseClient;
  notestore: Writable<{ [id: number]: Notess }>;
  user_id: string | undefined;
  note_del_queue: Writable<Notess>;
  sem: Semaphore;

  constructor(sb: SupabaseClient, user_id: string | undefined) {
    this.sb = sb;
    this.notestore = notestore;
    this.user_id = user_id;
    this.note_del_queue = note_del_queue;
    this.sem = new Semaphore();
  }
  panel(id: number) {
    return derived(this.notestore, (v) => v[id]);
  }
  alltags = () =>
    derived(this.notestore, (v) =>
      A.uniq(S.Eq)(
        Object.entries(v).flatMap(([_, notess]) =>
          notess.flatMap((n) => n.tags || []),
        ),
      ),
    );

  async update_one_page(id: number) {
    if (!this.user_id) {
      console.log("no user in NoteSync");
      return;
    }
    const newnotes = await this.sem.use(
      getNotes,
      this.sb,
      O.some(id),
      this.user_id,
    );
    if (newnotes !== null)
      this.notestore.update((s) => {
        s[id] = newnotes;
        return s;
      });
  }

  async update_all_pages() {
    if (!this.user_id) {
      console.log("no user in NoteSync");
      return;
    }
    const newnotes = await this.sem.use(
      getNotes,
      this.sb,
      O.none,
      this.user_id,
    );
    let groupnotes = (notes: Notess) =>
      pipe(
        notes,
        groupBy((n) => n.source_id.toString()),
        R.toArray,
      );
      console.log("newnotes", newnotes)
    if (newnotes !== null)
      this.notestore.update((s) => {
        let sn = {} as typeof s
        let grouped = groupnotes(newnotes);
        grouped.forEach(([x, notes]) => (sn[notes[0].source_id] = notes));
        return sn;
      });
  }

  get_groups(transform: (x: NoteEx) => NoteEx & { priority: number }) {
    // by default sort by date created
    // const aggFun = flow(A.map(tran), A.reduce(0, Math.max))
    return derived(
      this.notestore,
      (kvs) =>
        pipe(
          Object.entries(kvs), // @ts-ignore
          A.map(([k, v]) => [
            v[0] ? v[0].sources.title : "never!",
            v.map(transform),
          ]),
          R.fromEntries<(NoteEx & { priority: number })[]>,
          R.filter((m) => m.length > 0),
          R.toArray<string, (NoteEx & { priority: number })[]>,
          // prettier-ignore
          A.map(([st, nss]) => [st, nss.filter((n) => n.priority > 0)] as [string, (NoteEx & { priority: number })[]]),
          filterSort(([st, nss]) =>
            pipe(
              nss,
              A.map((x) => x.priority),
              A.reduce(0, Math.max),
            ),
          ),
        ), //.toSorted(desc())
    );
  }

  addit = async (n: NoteEx) => {
    const cache = get(this.notestore)[n.source_id];
    let { title, url } = cache[0]
      ? cache[0].sources
      : (
          await this.sem.use(
            async () =>
              await this.sb
                .from("sources")
                .select()
                .eq("id", n.source_id)
                .maybeSingle(),
          )
        ).data || {};
    title = title || "title missing";
    url = url || "";

    this.notestore.update((s) => {
      s[n.source_id] = [...s[n.source_id], { ...n, sources: { title, url } }];
      return s;
    });
    const { sources, ...reNote } = n;
    this.sem.use(
      async () =>
        await this.sb
          .from("notes")
          .insert(reNote)
          .then(logIfError)
          .then(this._restoreIE(n, cache)),
    );
  };

  restoredelete = () => {
    this.note_del_queue.update((ns) => {
      let [r, ...rs] = ns;
      if (!r) return ns; // noop
      this.addit(r);
      return rs;
    });
  };

  savedelete = (n: NoteEx) => this.note_del_queue.update((ns) => [n, ...ns]);
  deleteit = (n: Notes) => {
    const cache = get(this.notestore)[n.source_id];

    this.notestore.update((s) => {
      let parts = partition_by_id(n.id)(s[n.source_id]);
      s[n.source_id] = parts.left;
      this.savedelete(parts.right[0]);
      return s;
    });
    this.sem.use(async () =>
      this.sb
        .from("notes")
        .delete()
        .eq("id", n.id)
        .then(logIfError)
        .then(this._restoreIE(n, cache)),
    );
  };
  // @ts-ignore
  _restoreIE = (n: Notes, cache: Notess) => (r) =>
    r.error &&
    this.notestore.update((s) => {
      s[n.source_id] = cache;
      return s;
    });

  tagUpdate = (note: Notes) => (tag: string, tags: string[]) => {
    console.log(note.highlights);
    this.notestore.update((n) => {
      n[note.source_id].filter((_note) => _note.id == note.id)[0].tags = tags;
      return n;
    });
    this.sem.use(async () =>
      this.sb.from("notes").update({ tags }).eq("id", note.id).then(logIfError),
    );
  };

  sub = (handlePayload: (payload: { new: Notes | object }) => void) => {
    this.sb
      .channel("notes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `user_id=eq.${this.user_id}`,
        }, // at least url should be the same so no need to filter
        handlePayload,
      )
      .subscribe();
  };
}
