Base.@kwdef struct Snippet <: AbstractModel
    id::Union{Int64}
    created_at::Union{String}
    snippet_text::Union{String}
    origin_website::Union{Missing, String} = missing
    predicted_topic::Union{Missing, String} = missing
end
FunnyORM.tablename(::Type{Snippet}) = begin
    Symbol("Snippets")
end
FunnyORM.pk(::Type{Snippet}) = begin
    Symbol("id")
end