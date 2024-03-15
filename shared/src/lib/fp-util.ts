import type { LazyArg } from "fp-ts/lib/function"
import { option as O } from "fp-ts"

export const getOrElse: <A>(onNone: LazyArg<NoInfer<A>>) => (ma: O.Option<A>) => A = O.getOrElse
