Base.@kwdef struct CardContents <: AbstractModel
    cardContentId::Union{Int64}
    front::Union{String}
    back::Union{String}
end
FunnyORM.tablename(::Type{CardContents}) = begin
    Symbol("CardContents")
end
FunnyORM.pk(::Type{CardContents}) = begin
    Symbol("cardContentId")
end