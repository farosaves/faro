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

c = r[1].card

using SQLite, FunnyORM
dbpath = "src/util/local.db"
db = FunnyORM.DB{SQLite.DB}(dbpath)
include("util/dbinit.jl")

