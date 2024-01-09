import { expect, test } from 'vitest'
import { makeSnippet } from './fun'

test('normal', () => {
    expect(makeSnippet(
        "conjugação", "O verbo vir é um verbo muito irregular. Na sua conjugação, ocorrem alterações no seu radical (eu venho, que eu venha) e nas suas terminações (eu vim, ele vem, ele veio). Vem, sem acento gráfico, está na 3.ª pessoa do singular e vêm, com acento circunflexo, está na 3.ª pessoa do plural: ele vem, eles vêm. É frequentemente confundido com o verbo ver: quando ele vir (verbo ver), quando ele vier (verbo vir), eles veem (verbo ver), eles vêm (verbo vir)."
      )).toBe("Na sua conjugação, ocorrem alterações no seu radical (eu venho, que eu venha) e nas suas terminações (eu vim, ele vem, ele veio).")
    })
    test('nasty', () => {
    expect(makeSnippet(
      "vêm. É frequentemente", "O verbo vir é um verbo muito irregular. Na sua conjugação, ocorrem alterações no seu radical (eu venho, que eu venha) e nas suas terminações (eu vim, ele vem, ele veio). Vem, sem acento gráfico, está na 3.ª pessoa do singular e vêm, com acento circunflexo, está na 3.ª pessoa do plural: ele vem, eles vêm. É frequentemente confundido com o verbo ver: quando ele vir (verbo ver), quando ele vier (verbo vir), eles veem (verbo ver), eles vêm (verbo vir)."
    )).toBe("Vem, sem acento gráfico, está na 3.ª pessoa do singular e vêm, com acento circunflexo, está na 3.ª pessoa do plural: ele vem, eles vêm. É frequentemente confundido com o verbo ver: quando ele vir (verbo ver), quando ele vier (verbo vir), eles veem (verbo ver), eles vêm (verbo vir).")
    })