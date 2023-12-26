Base.@kwdef struct Cards <: AbstractModel
    cardId::Union{Int64}
    cardContentId::Union{Int64}
    userId::Union{Int64}
    due::Union{Missing, String} = missing
    stability::Union{Missing, Float64} = missing
    difficulty::Union{Missing, Float64} = missing
    elapsed_days::Union{Missing, Int64} = missing
    scheduled_days::Union{Missing, Int64} = missing
    reps::Union{Missing, Int64} = missing
    lapses::Union{Missing, Int64} = missing
    state::Union{Missing, Int64} = missing
    last_review::Union{Missing, String} = missing
end
FunnyORM.tablename(::Type{Cards}) = begin
    Symbol("Cards")
end
FunnyORM.pk(::Type{Cards}) = begin
    Symbol("cardId")
end