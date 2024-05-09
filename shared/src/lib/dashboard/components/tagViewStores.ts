import type { NoteDeri } from "$lib/sync/deri"
import { desc, sum, tup } from "$lib/utils"
import { array as A, nonEmptyArray as NA, record as R, either as E } from "fp-ts"
import { flow, identity, pipe } from "fp-ts/lib/function"
import { derived } from "svelte/store"

type TC = [string, number]
type TGC = E.Either<TC, [string, number, TC[]]>

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
  // const groups = tagsCounts.map(x => x[0].split("/")).filter(x => x.length > 1).map(x => x[0])
  // const groupCounts = new Map(A.zip(A.replicate(groups.length, 0))(groups))
  // for (const [tag, cnt] of tagsCounts)
  //   groupCounts.set(tag, cnt + (groupCounts.get(tag) || 0))

