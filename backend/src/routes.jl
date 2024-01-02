using Oxygen, HTTP, JSON3

include("db.jl")
include("card.jl")

f = FSRS()


post("/api/add_card") do req::HTTP.Request
    data = Oxygen.json(req)
    @info data
    (; front, back, snippet_id) = data
    cc = CardContent(db)(; front, back, snippet_id)
    userId = 0
    # create card
    cardContentId = cc.cardContentId
    r = f.repeat(fsrs.Card(), now())
    card = Card(db)(; userId, cardContentId, dtime2string(topairs(r[1].card))..., isactive=false)
    Dict(:data => Dict(topairs(card)...))
end

post("/api/accept_card") do req::HTTP.Request
    data = Oxygen.json(req)
    card = only(db[Card[data.card_id]])
    card = db[card](isactive=true)
    Dict(:data => Dict(topairs(card)...))
end

post("/api/undo_accept_card") do req::HTTP.Request
    data = Oxygen.json(req)
    card = only(db[Card[data.card_id]])
    card = db[card](isactive=false)
    Dict(:data => Dict(topairs(card)...))
end

post("/api/add_snippet") do req::HTTP.Request
    data = Oxygen.json(req)
    (; origin_website, snippet_text) = data
    snippet = Snippet(db)(; created_at=string(now()), origin_website, snippet_text)
    Dict(:data => Dict(topairs(snippet)...))
end


