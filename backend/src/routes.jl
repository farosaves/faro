using Oxygen, HTTP, JSON3

include("db.jl")

post("/api/add_card_content") do req::HTTP.Request
    data = Oxygen.json(req)
    (; front, back, snippet_id) = data
    cc = CardContent(db)(; front, back, snippet_id, isactive=false)
    Dict(:data => Dict(topairs(cc)...))
end

post("/api/accept_card_content") do req::HTTP.Request
    data = Oxygen.json(req)
    cc = only(db[CardContent[data.card_content_id]])
    cc = db[cc](isactive=true)
    Dict(:data => Dict(topairs(cc)...))
end



post("/api/add_snippet") do req::HTTP.Request
    data = Oxygen.json(req)
    (; origin_website, snippet_text) = data
    snippet = Snippet(db)(; created_at=string(now()), origin_website, snippet_text)
    # JSON3.write()
    Dict(:data => Dict(topairs(snippet)...))
end

