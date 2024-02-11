import { expect, test } from "vitest";
import {readFile} from 'fs/promises';
import { pipe } from "fp-ts/lib/function";
import {JSDOM} from 'jsdom'
import { f } from "./main";
type MakeQCH = {
    html: string,
    selectedText: string,
    uuid: string
}
const l: MakeQCH = pipe(await readFile(__dirname + '/input1.json', {}),x=>x.toString(), JSON.parse)

test('aa 3', () => {
    //new DOMParser() .parseFromString(l.html, "text/html")
    const document = new JSDOM(l.html).window.document
    expect(f(document, l.uuid).length).toBeGreaterThan(0)
  })
  
