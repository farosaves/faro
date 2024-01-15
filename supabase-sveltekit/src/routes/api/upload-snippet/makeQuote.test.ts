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
			'Ever After',
			"Several chick flicks have been patterned after the story of Cinderella and other fairy tales (e.g. A Cinderella Story, Ever After and Pretty Woman), or even Shakespeare in the case of She's the Man and 10 Things I Hate About You. In addition, a large number are adapted from popular novels (e.g. The Princess Diaries and The Devil Wears Prada) and literary classics (e.g. Little Women). While most films that are considered chick flicks are lighthearted, some suspense films also fall under this category, such as What Lies Beneath (2000)."
		)
	).toBe(
		"Several chick flicks have been patterned after the story of Cinderella and other fairy tales (e.g. A Cinderella Story, Ever After and Pretty Woman), or even Shakespeare in the case of She's the Man and 10 Things I Hate About You."
	);
});
test('oh boy', () => {
	expect(
		makeQuote(
			'6kB',
			'HotKeys.js is an input capture library with some very special features, it is easy to pick up and use, has a reasonable footprint (~6kB) (gzipped: 2.8kB), and has no dependencies.'
		)
	).toBe(
		'HotKeys.js is an input capture library with some very special features, it is easy to pick up and use, has a reasonable footprint (~6kB) (gzipped: 2.8kB), and has no dependencies.'
	);
});
test('oh yeah', () => {
	expect(
		makeQuote(
			'garza',
			'Kimitachi wa Dō Ikiru ka (君たちはどう生きるか? lit. ¿Cómo vives?), El niño y la garza (en Hispanoamérica), El chico y la garza (en España), es una película de animación de 2023 escrita y dirigida por Hayao Miyazaki,[3] con producción de animación de Studio Ghibli.[4] La cinta está basada en la novela homónima de 1937 escrita por Yoshino Genzaburō, pero la película presenta una historia original que no guarda relación con la novela. La película se estrenó el 14 de julio del 2023 en Japón, a pesar de haber sido fijada inicialmente para antes de los Juegos Olímpicos de Tokio 2020.5​'
		)
	).toBe(
		'), El niño y la garza (en Hispanoamérica), El chico y la garza (en España), es una película de animación de 2023 escrita y dirigida por Hayao Miyazaki, con producción de animación de Studio Ghibli.'
	);
});
