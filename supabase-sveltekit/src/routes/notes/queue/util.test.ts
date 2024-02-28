import { expect, test } from "vitest";
import {
  day,
  dequeue,
  enqueue,
  fromDay,
  nextIntervals,
  schedule,
} from "./util";
import { setHours, differenceInCalendarDays } from "date-fns";
import * as fd from "date-fns/fp";
import type { Cards } from "$lib/dbtypes";
import { State } from "fsrs.js";

test("diff", () => {
  let x = new Date();
  x = setHours(x, 2);
  let y = day()(x);
  let z = day()(new Date());
  console.log(z, y);
  expect(differenceInCalendarDays(z, y)).toBe(1);
  z = day()(fd.addDays(1)(fromDay()(z)));
  console.log(z, y);
  expect(differenceInCalendarDays(z, y)).toBe(2);
});

test("a", () => {
  const yesterday = fromDay(7)(day()(fd.subDays(1)(new Date()))).toUTCString();
  const card1: Cards = {
    last_review: yesterday,
    state: State.Learning,
  } as Cards;
  expect(nextIntervals(card1)).toStrictEqual([1, 3, 9]);
  const card2 = { ...card1, state: State.Review };
  expect(nextIntervals(card2)).toStrictEqual([1, 2, 3]);
  expect(schedule(card1, 2).state).toBe(State.Review);
  expect(nextIntervals(enqueue(dequeue(card1)))).toStrictEqual([1, 3, 9]);
});
