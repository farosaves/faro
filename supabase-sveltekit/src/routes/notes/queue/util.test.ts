import { expect, test } from "vitest";
import { day, fromDay } from "./util";
import { setHours, differenceInCalendarDays } from "date-fns";
import * as fd from "date-fns/fp";

test("aa 3", async () => {
  let x = new Date();
  x = setHours(x, 2);
  let y = day()(x);
  let z = day()(new Date());
  console.log(z, y);
  expect(differenceInCalendarDays(z, y)).toBe(1);
  z = day()(fd.addDays(1)(fromDay()(z)))
  console.log(z, y);
  expect(differenceInCalendarDays(z, y)).toBe(2);
});
