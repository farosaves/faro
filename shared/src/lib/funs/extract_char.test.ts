import { expect, test } from "vitest"
import { extractCharIdx } from "./extract_char"

test("input1", async () => {
  const inpt = "type:textContent|38183$38227$1$_0f6dff8c-0242-438f-97b8-2579869ea194$in my in$t cookie"
  expect(extractCharIdx(inpt)).toBe(
    38183,
  )
})
