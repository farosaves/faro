import type { NoteDeri } from "$lib/sync/deri"
import { desc } from "$lib/utils"
import { array as A, nonEmptyArray as NA, record as R } from "fp-ts"
import { identity, pipe } from "fp-ts/lib/function"
import { derived } from "svelte/store"

export const getTagsCounts = (noteDeri: NoteDeri) => derived(noteDeri.noteArr, x =>
  pipe(x,
    A.flatMap(note => note.tags || []),
    NA.groupBy(identity),
    R.map(x => x.length),
    R.toArray,
  ).concat(
    [["", pipe(x, A.filter(note => !note.tags.length), A.size)]],
  ).toSorted(desc(([x, y]) => y)),
)

export const groupTagsCounts = (tagsCounts: [string, number][]) => {
  const groups = tagsCounts.map(x => x[0].split("/")).filter(x => x.length > 1).map(x => x[0])
  const groupCounts = new Map(A.zip(A.replicate(groups.length, 0))(groups))
  for (const [tag, cnt] of tagsCounts)
    groupCounts.set(tag, cnt + (groupCounts.get(tag) || 0))
}
