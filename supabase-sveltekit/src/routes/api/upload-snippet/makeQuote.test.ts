import { expect, test } from 'vitest';
import { makeQuote } from './fun';

test('normal', () => {
	expect(
		makeQuote(
			'conjugação',
			'O verbo vir é um verbo muito irregular. Na sua conjugação, ocorrem alterações no seu radical (eu venho, que eu venha) e nas suas terminações (eu vim, ele vem, ele veio). Vem, sem acento gráfico, está na 3.ª pessoa do singular e vêm, com acento circunflexo, está na 3.ª pessoa do plural: ele vem, eles vêm. É frequentemente confundido com o verbo ver: quando ele vir (verbo ver), quando ele vier (verbo vir), eles veem (verbo ver), eles vêm (verbo vir).'
		)
	).toBe(
		'Na sua conjugação, ocorrem alterações no seu radical (eu venho, que eu venha) e nas suas terminações (eu vim, ele vem, ele veio).'
	);
});
test('nasty', () => {
	expect(
		makeQuote(
			'vêm. É frequentemente',
			'O verbo vir é um verbo muito irregular. Na sua conjugação, ocorrem alterações no seu radical (eu venho, que eu venha) e nas suas terminações (eu vim, ele vem, ele veio). Vem, sem acento gráfico, está na 3.ª pessoa do singular e vêm, com acento circunflexo, está na 3.ª pessoa do plural: ele vem, eles vêm. É frequentemente confundido com o verbo ver: quando ele vir (verbo ver), quando ele vier (verbo vir), eles veem (verbo ver), eles vêm (verbo vir).'
		)
	).toBe(
		'Vem, sem acento gráfico, está na 3.ª pessoa do singular e vêm, com acento circunflexo, está na 3.ª pessoa do plural: ele vem, eles vêm. É frequentemente confundido com o verbo ver: quando ele vir (verbo ver), quando ele vier (verbo vir), eles veem (verbo ver), eles vêm (verbo vir).'
	);
});
test('another nasty', () => {
	expect(
		makeQuote(
			"Ever After",
			"Several chick flicks have been patterned after the story of Cinderella and other fairy tales (e.g. A Cinderella Story, Ever After and Pretty Woman), or even Shakespeare in the case of She's the Man and 10 Things I Hate About You. In addition, a large number are adapted from popular novels (e.g. The Princess Diaries and The Devil Wears Prada) and literary classics (e.g. Little Women). While most films that are considered chick flicks are lighthearted, some suspense films also fall under this category, such as What Lies Beneath (2000)."
		)
	).toBe(
		"Several chick flicks have been patterned after the story of Cinderella and other fairy tales (e.g. A Cinderella Story, Ever After and Pretty Woman), or even Shakespeare in the case of She's the Man and 10 Things I Hate About You."
	);
});
