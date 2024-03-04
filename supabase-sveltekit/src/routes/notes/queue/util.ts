import { flow, pipe } from "fp-ts/lib/function.js";
import { startOfDay, parse, format } from "date-fns";
import * as fd from "date-fns/fp";
import type { Cards } from "$lib/dbtypes";
import { State } from "fsrs.js";
import type { SupabaseClient } from "shared";
import { logIfError } from "shared";
const fstr = "yyyy-MM-dd";
export const day = (hr = 5) => flow(fd.subHours(hr), fd.format(fstr));
export const fromDay =
  (hr = 5) =>
  (x: string) =>
    fd.addHours(hr)(parse(x, fstr, new Date()));

export const nextIntervals = (card: Cards) => {
  const mins = [1, 3, 9]; // days
  const today = day()(Date.now());
  if (card.state == State.Learning) {
    return mins;
  }
  const lastInterval = fd.differenceInCalendarDays(
    day()(Date.parse(card.last_review)),
  )(today);
  const mults = [1.5, 2, 3];
  return mults.map((m) => Math.floor(m * lastInterval));
};

export const schedule$ = (sb: SupabaseClient) => (card: Cards, n: number) => {
  const now = new Date().toUTCString();
  card.last_review = now;
  card.due = fd.addDays(n)(day()(now)).toUTCString();
  card.state = State.Review;
  updateCard(sb)(card);
};
export const dequeue$ = (sb: SupabaseClient) => (card: Cards) => {
  card.state = State.New;
  updateCard(sb)(card);
};
export const enqueue$ = (sb: SupabaseClient) => (card: Cards) => {
  card.state = State.Learning;
  updateCard(sb)(card);
};

const updateCard = (sb: SupabaseClient) => (card: Cards) =>
  sb.from("cards").update(card).then(logIfError);
