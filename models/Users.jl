Base.@kwdef struct User <: AbstractModel
    userId::Union{Int64}
    username::Union{String}
    email::Union{Missing, String} = missing
end
FunnyORM.tablename(::Type{User}) = begin
    Symbol("Users")
end
FunnyORM.pk(::Type{User}) = begin
    Symbol("userId")
end