# THIS IS LEGACY CODE I KEPT IT TO REMEMBER HOW TO SET UP SERVERS INSIDE MODULES
using Oxygen, HTTP, JSON3, Serialization, FunnyORM, SQLite

function __init__()
    fname = (@__DIR__) * "/routes.jl"
    origdir = pwd()
    cd(@__DIR__)
    @eval include($fname)
    cd(origdir)
end

dict(; kwargs...) = Dict(kwargs...)
origdir = pwd()
cd(@__DIR__)

dbpath = "util/db.sqlite"
# include("util/dbinit.jl")
db = FunnyORM.DB{SQLite.DB}(dbpath)
include("routes.jl")
include("cors.jl")
cd(origdir)

run(; port=2227, async=true) = (!isdefined(Main, :s) || !isopen(Main.s)) && (Main.s = serve(middleware=[CorsHandler]; port, async))

# @time HTTP.get("http://localhost:2137/conv/3")
# @time HTTP.get("http://localhost:2137/conv/4")
# @time HTTP.post("http://localhost:2137/rev/3/"; body="""{"sentences":[]}""")

# close(s)
using DataFrames
# using CSV
# vis(v::Vector{T}) where {T<:AbstractModel} =
#     let tn = tempname()
#         CSV.write(tn, DataFrame(db[CardContent[]]))
#         tn
#     end