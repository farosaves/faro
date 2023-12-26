module LFWBackend
# THIS IS LEGACY CODE I KEPT IT TO REMEMBER HOW TO SET UP SERVERS INSIDE MODULES
using Oxygen, HTTP, JSON3, Serialization

function __init__()
    fname = (@__DIR__) * "/routes.jl"
    @eval include($fname)
end

dict(; kwargs...) = Dict(kwargs...)

include("cors.jl")
lookup = deserialize((@__DIR__) * "/esendict.jls")
fallback(s) = "hehe"  # inclde("util/pycallex.jl")

run(; port=2137, async=true) = (!isdefined(Main, :s) || !isopen(Main.s)) && (Main.s = serve(middleware=[CorsHandler]; port, async))

# @time HTTP.get("http://localhost:2137/conv/3")
# @time HTTP.get("http://localhost:2137/conv/4")
# @time HTTP.post("http://localhost:2137/rev/3/"; body="""{"sentences":[]}""")

# close(s)
end