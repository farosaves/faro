import type { Notess, SupabaseClient } from "$lib/shared/first";
import { array as A } from "fp-ts";
import type { Option } from "fp-ts/lib/Option";
import { option as O } from "fp-ts";
import { flow, identity, pipe } from "fp-ts/lib/function";
import { writable } from "svelte/store";
import type { Session } from "@supabase/supabase-js";

let _sess: O.Option<Session> = O.none;
export const sessStore = writable(_sess);

let colorScheme: "light" | "dark" = "dark";
export const themeStore = writable(colorScheme);
export const updateTheme = () =>
  themeStore.set(
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("color-scheme") as typeof colorScheme,
  );

export let safeGet =
  <T extends string | number | symbol, U>(record: {
    [id in T]: U[];
  }) =>
  (idx: T) =>
    idx in record ? record[idx] : ([] as U[]);

export const unwrap_def = <T>(o: Option<T>, def: T) =>
  pipe(
    o,
    O.match(() => def, identity),
  );

export const mapSome = <U, T>(f: (...args: [U]) => O.Option<T>) =>
  flow(A.map(f), A.flatMap(A.fromOption));

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
export const hostname = (s: string) => s && new URL(s).hostname;

export const domain_title = (url: string, title: string) =>
  [hostname(url), title].join(";");

// sort descendingly but for negative scores filter out
export const filterSort =
  <T>(f: (x: T) => number) =>
  (xs: T[]) =>
    xs.filter((x) => f(x) > 0).toSorted(desc(f));

export const fillInTitleUrl = (v: {
  sources: {
    title: string | null;
    url: string | null;
  } | null;
}) => {
  let _get = (u: typeof v, fld: "title" | "url", missing: string) =>
    pipe(
      u,
      O.fromNullable,
      O.chain((v) => O.fromNullable(v.sources)),
      O.chain((v) => O.fromNullable(v[fld])),
      O.fold(() => missing, identity),
    );
  return { title: _get(v, "title", "missing Title"), url: _get(v, "url", "") };
};

export async function getNotes(
  supabase: SupabaseClient,
  source_id: Option<number>,
  user_id: string,
  prevnotes = [],
): Promise<Notess> {
  let query = supabase
    .from("notes")
    .select("*, sources (title, url)")
    .eq("user_id", user_id);
  query = O.match(
    () => query,
    (id: number) => query.eq("source_id", id),
  )(source_id);

  const { data } = await query;

  if (data === null) return prevnotes;
  return data.map((v) => {
    return { ...v, sources: fillInTitleUrl(v) };
  });
}
