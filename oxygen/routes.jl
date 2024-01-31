using StructTypes, Gumbo, Cascadia
import Sentencize

struct AAA
    selectedText::String
    html::String
    uuid::String
end
saved = Ref{AAA}()
StructTypes.StructType(::Type{AAA}) = StructTypes.Struct()

t = Gumbo.text
splittags = Set([:p, :h1, :h3, :ul, :div, :details, :h2, :blockquote])
"""Should give all 'sentences' splitting on html tags, but not span, a, etc."""
divsplit(v::Vector{HTMLNode}) =
    let f(prev::Vector{T}, node) where {T<:AbstractString} =
            if !(node isa HTMLText) && tag(node) in splittags
                [prev..., t(node), ""]
            else
                (x..., y) = prev
                [x..., y * t(node)]
            end
        [(Sentencize.split_sentence ∘ String).(filter(!isempty, foldl(f, v; init=[""])))...;]
    end
divsplit(n::HTMLElement) = divsplit(n.children)
sectiontags = Set([:ul, :h1, :h3, :h2])
I = Iterators
precedingsectiontags(e) =
    I.filter(∈(sectiontags) ∘ tag, (I.takewhile(!=(e), e.parent.children)))

taketillnextsectiontag(e) =
    let stop(e2) = e2 != e && tag(e2) ∈ sectiontags
        Iterators.takewhile(!stop, Iterators.dropwhile(!=(e), e.parent.children))
    end
lastiterate(itr) = foldl((_, y) -> y, itr)
succ(e::HTMLElement) =
    let st = precedingsectiontags(e)
        if e ∈ sectiontags || isempty(st)
            e.parent
        else
            pseudop = lastiterate(st)
            collect(taketillnextsectiontag(pseudop))
        end
    end
# succ(e::Array{HTMLElement}) = first(e).parent
# goup(::NullNode) = []
goup(e::HTMLElement{:HTML}) = [e]
goup(v::Vector{}) = [[v]; goup(first(v).parent)]
goup(e::HTMLElement) = [e; goup(succ(e))]

f(args::AAA) =
    let root = parsehtml(args.html).root
        # find context
        # strategy one: go up until you find something resembling a paragraph
        gen = goup(first(eachmatch(Selector("._$(args.uuid)"), root)))
        context = first(filter(>(2) ∘ length ∘ divsplit, gen))
        # strategy two: 
        first(eachmatch(Selector("._$(args.uuid)"), root))
    end


# Quote Context Highlights
post("/make-qch") do req
    a = json(req, AAA)
    saved[] = a
    ()
end

get("/latest") do
    html(saved[].html)
end

get("/rerun") do
    @info f(saved[])
    html(saved[].html)
end
