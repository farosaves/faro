import { expect, test } from 'vitest';
import { readFile } from 'fs/promises';
import { pipe } from 'fp-ts/lib/function';
import { JSDOM } from 'jsdom';
import { f } from './main';
type MakeQCH = {
	html: string;
	selectedText: string;
	uuid: string;
};

const l = async (s: string): Promise<MakeQCH> => pipe(
	await readFile(__dirname + s, {}),
	(x) => x.toString(),
	JSON.parse
);

//new DOMParser() .parseFromString(l.html, "text/html")
test('aa 3', async () => {
	const r = await l( '/input1.json')
	const document = new JSDOM(r.html).window.document;
	expect(f(document, r.uuid, r.selectedText).quote).toBe(
		'An option could be looked at as a collection or foldable structure with either one or zero elements.'
	);
});
test('aa 4', async () => {
	const r = await l( '/input2.json')
	const document = new JSDOM(r.html).window.document;
	// console.log(r.selectedText)
	expect(f(document, r.uuid, r.selectedText).quote).toBe(
		'The remains of over 80 individual animals of this genus have been found.'
	);
});
test('aa 5', async () => {
	const r = await l( '/input3.json')
	const document = new JSDOM(r.html).window.document;
	console.log(r.selectedText)
	expect(f(document, r.uuid, r.selectedText).quote).toBe(
		"Jiminy Glick in Lalawood starts off as an Entertainment Tonight or Access Hollywood spoof, but develops into a murder mystery, with David Lynch played by Martin Short as a makeshift Hercule Poirot."
	);
});


