import { expect, test } from 'vitest';
import { readFile } from 'fs/promises';
import { pipe } from 'fp-ts/lib/function';
import { JSDOM } from 'jsdom';
import { makeQCH } from './main';
type MakeQCHReq = {
	html: string;
	selectedText: string;
	uuid: string;
};

const l = async (s: string): Promise<MakeQCHReq> => pipe(
	await readFile(__dirname + s, {}),
	(x) => x.toString(),
	JSON.parse
);
const potTable = (html: string) => html.match("<tr>")?.[0] ? "<table>" + html + "</table>" : html
const document = (r: MakeQCHReq) => new JSDOM("<html><body>"+potTable(r.html)+"</body></html>").window.document


test('aa 3', async () => {
	const r = await l( '/input1.json')
	expect(makeQCH(document(r), r.uuid, r.selectedText).quote).toBe(
		'An option could be looked at as a collection or foldable structure with either one or zero elements.'
	);
});
test('aa 4', async () => {
	const r = await l( '/input2.json')
	expect(makeQCH(document(r), r.uuid, r.selectedText).quote).toBe(
		'The remains of over 80 individual animals of this genus have been found.'
	);
});
test('aa 5', async () => {
	const r = await l( '/input3.json')
	expect(makeQCH(document(r), r.uuid, r.selectedText).quote).toBe(
		"Jiminy Glick in Lalawood starts off as an Entertainment Tonight or Access Hollywood spoof, but develops into a murder mystery, with David Lynch played by Martin Short as a makeshift Hercule Poirot."
	);
});
test('aa 6', async () => {
	const r = await l( '/input4.json')
	console.log(r.selectedText)
	// console.log(r.html)
	// console.log(document(r).body.outerHTML)
	expect(makeQCH(document(r), r.uuid, r.selectedText).quote).toBe(
		"Hydrazine (combusted to N2+H2O)	19.5	19.3	5,416.7	5,361.1"
	);
});
test('aa 7', async () => {
	const r = await l( '/input5.json')
	// console.log(document(r).body.outerHTML)
	expect(makeQCH(document(r), r.uuid, r.selectedText).quote).toBe(
		"Body fat 38 35 10,555.6 9,722.2 Metabolism in human body (22% efficiency)"
	);
});

