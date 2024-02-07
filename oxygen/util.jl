import Base./, Base.//
using Infiltrator, FixArgs
(f::Function) / (a) = Fix1(f, a)
(f::Function) // (a) = Fix2(f, a)
flatten = collect ∘ Iterators.flatten