
import { flow, pipe } from "fp-ts/lib/function.js";
import { startOfDay, parse, format } from "date-fns";
import * as fd from "date-fns/fp";
const fstr = "yyyy-MM-dd"
type Date_ = [number, number, number];
export const day = (hr = 5) =>
  flow(fd.subHours(hr), fd.format(fstr));
export const fromDay =
  (hr = 5) =>
  (x: string) =>
    fd.addHours(hr)(parse(x, fstr, new Date()));
