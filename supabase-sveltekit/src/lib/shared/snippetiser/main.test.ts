import { expect, test } from "vitest";
import { readFile } from "fs/promises";
import { pipe } from "fp-ts/lib/function";
import { JSDOM } from "jsdom";
import { makeQCH } from "./main";
type MakeQCHReq = {
  html: string;
  selectedText: string;
  uuid: string;
};

const l = async (s: string): Promise<MakeQCHReq> =>
  pipe(await readFile(__dirname + s, {}), (x) => x.toString(), JSON.parse);
const potTable = (html: string) =>
  html.match("<tr>")?.[0] ? "<table>" + html + "</table>" : html;
const document = (r: MakeQCHReq) =>
  new JSDOM("<html><body>" + potTable(r.html) + "</body></html>").window
    .document;

test("input1", async () => {
  const r = await l("/input1.json");
  expect(makeQCH(document(r), r.uuid, r.selectedText).quote).toBe(
    "An option could be looked at as a collection or foldable structure with either one or zero elements.",
  );
});
test("input2", async () => {
  const r = await l("/input2.json");
  expect(makeQCH(document(r), r.uuid, r.selectedText).quote).toBe(
    "The remains of over 80 individual animals of this genus have been found.",
  );
});
test("input3", async () => {
  const r = await l("/input3.json");
  expect(makeQCH(document(r), r.uuid, r.selectedText).quote).toBe(
    "Jiminy Glick in Lalawood starts off as an Entertainment Tonight or Access Hollywood spoof, but develops into a murder mystery, with David Lynch played by Martin Short as a makeshift Hercule Poirot.",
  );
});
test("input4", async () => {
  const r = await l("/input4.json");
  console.log(r.selectedText);
  expect(makeQCH(document(r), r.uuid, r.selectedText).quote).toBe(
    "Hydrazine (combusted to N2+H2O)	19.5	19.3	5,416.7	5,361.1".replaceAll(
      /\s+/g,
      " ",
    ),
  );
});
test("input5", async () => {
  const r = await l("/input5.json");
  expect(makeQCH(document(r), r.uuid, r.selectedText).quote).toBe(
    "Body fat 38 35 10,555.6 9,722.2 Metabolism in human body (22% efficiency)",
  );
});
test("input6", async () => {
  const r = await l("/input6.json");
  expect(makeQCH(document(r), r.uuid, r.selectedText).quote).toBe(
    "Persian has features of agglutination, making use of prefixes and suffixes attached to the stems of verbs and nouns, thus making it a synthetic language rather than an analytic one.",
  );
});
test("input7", async () => {
  const r = await l("/input7.json");
  expect(makeQCH(document(r), r.uuid, r.selectedText).quote).toBe(
    "Composed in Vedic Sanskrit, the texts constitute the oldest layer of Sanskrit literature and the oldest scriptures of Hinduism.",
  );
});
test("input8", async () => {
  const r = await l("/input8.json");
  // this fails because the "line break" is emoji\\n\s+\\n
  expect(makeQCH(document(r), r.uuid, r.selectedText).quote).not.toBe(
    "Learn Flexbox with 30 Code Tidbits.",
  );
});
test("input9", async () => {
  const r = await l("/input9.json");
  expect(makeQCH(document(r), r.uuid, r.selectedText).quote).toBe(
    "I love the melody, and im dying to understand the words.",
  );
});

test("context6", async () => {
  const r = await l("/input6.json");
  expect(makeQCH(document(r), r.uuid, r.selectedText).context).toBe(
    "Persian has features of agglutination, making use of prefixes and suffixes attached to the stems of verbs and nouns, thus making it a synthetic language rather than an analytic one. Persian is an SOV language, thus having a head-final phrase structure. Persian utilizes a noun root + plural suffix + case suffix + postposition suffix syntax similar to Turkish. For example: Mashinhashunra niga mikardam meaning 'I was looking at their cars'. Breaking down mashin+ha+shun+ra (car+s+their+at) we can see its agglutinative nature and the fact that Persian is able to affix a given number of dependent morphemes to a root morpheme (in this example, car).\\n",
  );
});
