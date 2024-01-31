using HTTP, Oxygen, Revise
cd("oxygen")
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

run(; port=2227, async=true) = (!isdefined(Main, :s) || !isopen(Main.s)) && (Main.s = serve(middleware=[CorsHandler, ReviseHandler]; port, async))
run()

t = Gumbo.text