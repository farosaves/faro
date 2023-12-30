using Dates
using PyCall


fsrs = pyimport("fsrs")
FSRS, Rating, State = let
    fsrs.FSRS, fsrs.Rating, fsrs.State
end
# utility
topairs(t::PyObject) = map(p -> Symbol(first(p)) => last(p), collect(pairs(t.__dict__)))
dtime2string(c::Vector{Pair{Symbol}}) =
    let onsecond(f) = pair -> first(pair) => f(last(pair))
        f(dt::DateTime) = string(dt)
        f(not_dt) = not_dt
        map(onsecond(f), c)
    end
# db connection

userId = 0
# create card
cardContentId = 0
card = Card(db)(; userId, cardContentId, dtime2string(topairs(fsrs.Card()))...)



Card(userId,)



f = FSRS()
r = f.repeat(card, now())

c = r[4].card
c.stability
c.difficulty

r = f.repeat(c, now() + Minute(10))
c = r[3].card
c.stability  # doesnt do anytihng
c.difficulty

r = f.repeat(c, now() + Day(1))
c = r[3].card
c.stability  # increase only stability and negligible impact on difficulty
c.difficulty


