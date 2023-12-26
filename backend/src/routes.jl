# include("db.jl")
using Dates
using PyCall
# Conda.pip("install", "fsrs")
FSRS, Card, Rating, State = let fsrs = pyimport("fsrs")
    fsrs.FSRS, fsrs.Card, fsrs.Rating, fsrs.State
end

f = FSRS()
card = Card()
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


using SQLite, FunnyORM
dbpath = "src/util/local.db"
db = FunnyORM.DB{SQLite.DB}(dbpath)
include("util/dbinit.jl")

