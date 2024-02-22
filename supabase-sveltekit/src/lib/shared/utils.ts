import type { Notess, SupabaseClient } from "$lib/shared/first";
import { array as A } from "fp-ts";
import type { Option } from "fp-ts/lib/Option";
import { option as O } from "fp-ts";
import { identity, pipe } from "fp-ts/lib/function";

export let safeGet =
  <T extends string | number | symbol, U>(record: {
    [id in T]: U[];
  }) =>
  (idx: T) =>
    idx in record ? record[idx] : ([] as U[]);

export let partition_by_id = (id: number) =>
  A.partition((v: { id: number }) => v.id == id);
export let delete_by_id = (id: number) =>
  A.filter((v: { id: number }) => v.id !== id);

export function desc<T>(f: (t: T) => number): (t1: T, t2: T) => number {
  return (t1, t2) => f(t2) - f(t1);
}
export const asc =
  <T>(f: (t: T) => number) =>
  (t1: T, t2: T) =>
    f(t1) - f(t2);

export function logIfError<T extends { error: any }>(r: T): T {
  const { error } = r;
  error && console.log("error from logIfError util function\n", error);
  return r;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// sort descendingly but for negative scores filter out
export const filterSort =
  <T>(f: (x: T) => number) =>
  (xs: T[]) =>
    xs.filter((x) => f(x) > 0).toSorted(desc(f));

export async function getNotes(
  supabase: SupabaseClient,
  source_id: Option<number>,
  user_id: string,
  prevnotes = [],
): Promise<Notess> {
  let q = supabase
    .from("notes")
    .select("*, sources (title, url)")
    .eq("user_id", user_id);
  q = O.match(
    () => q,
    (id: number) => q.eq("source_id", id),
  )(source_id);

  const { data } = await q;

  if (data === null) return prevnotes;
  let _get = (v: (typeof data)[0], fld: "title" | "url", missing: string) =>
    pipe(
      v.sources,
      O.fromNullable,
      O.chain((v) => O.fromNullable(v[fld])),
      O.fold(() => missing, identity),
    );
  return data.map((v) => {
    const title = _get(v, "title", "missing Title");
    const url = _get(v, "url", "");
    return { ...v, sources: { title, url } };
  });
}
