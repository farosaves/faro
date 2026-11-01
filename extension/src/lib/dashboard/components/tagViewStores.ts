import type { NoteDeri } from "$lib/sync/deri"
import { desc, sum, tup } from "$lib/utils"
import { array as A, nonEmptyArray as NA, record as R, either as E } from "fp-ts"
import { flow, identity, pipe } from "fp-ts/lib/function"
import { derived } from "svelte/store"

type TC = [string, number]
type TG = [string, number, TC[]]
export type TGC = E.Either<TC, TG>

export const getGroupTagCounts = (noteDeri: NoteDeri) => derived(noteDeri.noteArr, x =>
  pipe(x,
    A.flatMap(note => note.tags || []),
    NA.groupBy(identity),
    R.map(x => x.length),
    R.toArray,
    A.append(tup(["", pipe(x, A.filter(note => !note.tags.length), A.size)])),
    groupTagsCounts,
  ),
)
export const groupTagsCounts = (tagsCounts: TC[]): TGC[] =>
  pipe(tagsCounts,
    NA.groupBy(([a, b]) => a.split("/")[0]),
    // check if not group
    R.map(xs => xs.length == 1 && !xs[0][0].includes("/")
      ? E.left(xs[0])
      : E.right(tup([xs[0][0].split("/")[0], sum(xs.map(x => x[1])), xs.toSorted(desc(([x, y]) => y))])),
    ),
    R.toEntries,
    A.map(t => t[1]),
  ).toSorted(desc(flow(E.toUnion, t => t[1])))

export const groupize = <T>(f1: (a: string) => T, f2: (as: string[]) => T) =>
  flow(
    E.bimap(
      (tc: TC) => f1(tc[0]),
      ([_1, _2, tcs]: TG) => f2(tcs.map(x => x[0]))),
    E.toUnion)
