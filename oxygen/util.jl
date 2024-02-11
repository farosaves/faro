import Base./, Base.//
using Infiltrator, FixArgs
(f::Function) / (a) = Fix1(f, a)
(f::Function) // (a) = Fix2(f, a)
flatten = (map / identity) ∘ collect ∘ Iterators.flatten

"""wikipedia quote delete"""
wqd = replace // (r"\[\d{1,2}\]" => "")
"""Gumbo.text space fix: see saved/2024-02-06T20:41:24.949.jls for wrong dot"""
gtsf = replace // (r"(?<=\w)\s([\p{Pe}\p{Pf}\p{Po}])(?=\s|$)" => s"\g<1>")
@assert gtsf(". .") == ". ."
@assert gtsf("h .") == "h."
@assert gtsf("and \"here\"") == "and \"here\""

errh(cb) = f -> req -> try
    f(req)
catch e
    cb(e)
end
