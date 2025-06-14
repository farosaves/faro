using Pkg
Pkg.instantiate()
using HTTP, Oxygen, Revise, CodecZlib
cd(@__DIR__)
include("routes.jl")
__revise_mode__ = :eval
Revise.track("routes.jl")

function CorsHandler(handle)
    allowed_origins = ["Access-Control-Allow-Origin" => "*"]
    cors_headers = [
        allowed_origins...,
        "Access-Control-Allow-Headers" => "*",
        "Access-Control-Allow-Methods" => "GET, POST"
    ]
    return function (req::HTTP.Request)
        # return headers on OPTIONS request
        if HTTP.method(req) == "OPTIONS"
            return HTTP.Response(200, cors_headers)
        else
            r = handle(req)
            append!(r.headers, allowed_origins)
            return r
        end
    end
end

function ReviseHandler(handle)
    req -> begin
        Revise.revise()
        invokelatest(handle, req)
    end
end

run(; port=2227, async=true) = (!isdefined(Main, :s) || !isopen(Main.s)) && (Main.s = serve(middleware=[CorsHandler, ReviseHandler]; port, async, catch_errors=false))
run()


# bin = parse.(UInt8, split(saved[].html, ","))
# if false
#     using PythonCall
#     YTTA = pyimport("youtube_transcript_api").YouTubeTranscriptApi
#     t = YTTA.get_transcript("GyYME8btMHE")
#     @kwdef struct TranscriptElement{T}
#         text::String
#         start::T
#         duration::T
#     end
#     PythonCall.pyconvert(::Type{NamedTuple}, t) = (; map(kv -> Symbol(first(kv)) => last(kv), collect(pyconvert(Dict, t)))...)
#     pyconvert(NamedTuple, t[0])
# end
# # TranscriptElement(;map(kv -> Symbol(first(kv))=>last(kv), collect(pyconvert(Dict, t[0])))...)
struct MakeQCHQuery
    selectedText::String
    html::String
    uuid::String
end
using Serialization
a = deserialize("saved/2024-02-11T20:04:52.473.jls")
a = deserialize("manual_saved/lynch.jls")
JSON3.write("ex_case.json", a)
## write some to json here as test cases