Base.@kwdef struct CardContent <: AbstractModel
    cardContentId::Union{Int64}
    front::Union{String}
    back::Union{String}
end
FunnyORM.tablename(::Type{CardContent}) = begin
    Symbol("CardContents")
end
FunnyORM.pk(::Type{CardContent}) = begin
    Symbol("cardContentId")
end