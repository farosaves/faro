import { expect, test } from "vitest";
import { normalize, prepostfixes, serialize } from "./util";
import { readFile } from "fs/promises";
import { pipe } from "fp-ts/lib/function";
import { htmlstr2body } from "$lib/test_utils";
import { desc } from "$lib/shared/utils";

test("long", async () => {
  const s = "Which is 5 + 1, or 2+4.";
  expect(prepostfixes(s)).toStrictEqual(["Which ", "r 2+4."]);
});
test("short", async () => {
  const s = "hey!";
  expect(prepostfixes(s)).toStrictEqual(["hey!", "hey!"]);
});
const l = async (s: string): Promise<HTMLElement> =>
  pipe(await readFile(__dirname + s, {}), (x) => x.toString(), htmlstr2body);

test("html", async () => {
  const body = await l("/steg2.html");
  const quote = "skeletal mounts and plate";
  const [pre, post] = prepostfixes(quote);
  expect([pre, post]).toStrictEqual(["skelet", " plate"]);
  const len = normalize(quote).length;
  const matches = (xfix: string) =>
    Array.from(normalize(body.textContent).matchAll(RegExp(xfix, "gu")));
  const ss = matches(pre);
  const es = matches(post);

  const targetDiff = len - post.length;
  // prettier-ignore
  const aligned = <T extends { index: number }>(left: T[], right: T[]): T[][] => {
    if (!left.length || !right.length) return [];
    const [lf, ...lr] = left;
    const [rf, ...rr] = right;
    const diff = rf.index - lf.index;
    if (diff / targetDiff > 1.1)
      // too far apart -> right too far
      return aligned(lr, right);
    else if (diff / targetDiff < 0.9)
      // too close -> left too far
      return aligned(left, rr);
    else return [[lf, rf], ...aligned(lr, rr)];
  };

  const aligneds = aligned(ss, es).toSorted(
    desc(([lf, rf]) => -Math.abs(rf.index - lf.index - targetDiff))
  );

  console.log(
    aligneds.map(([x, y]) =>
      normalize(body.textContent).substring(x.index, y.index)
    )
  );

  //   expect(prepostfixes(body.textContent)).toStrictEqual(["hey", "hey"]);
});
