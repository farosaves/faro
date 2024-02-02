using StructTypes, Gumbo, Cascadia
import Sentencize

include("util.jl")
Revise.track("util.jl")

struct AAA
    selectedText::String
    html::String
    uuid::String
end
saved = Ref{AAA}()
StructTypes.StructType(::Type{AAA}) = StructTypes.Struct()
t = strip ∘ Gumbo.text
splittags = Set([:p, :h1, :h3, :ul, :div, :details, :h2, :blockquote, :li])
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
sectiontags = Set([:ul, :h1, :h3, :h2, :details])
I = Iterators
_tag(e::HTMLElement) = tag(e)
_tag(::HTMLText) = :text
precedingsectiontags(e) =
    I.filter(∈(sectiontags) ∘ _tag, (I.takewhile(!=(e), e.parent.children)))

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

"""returns either a vector of nodes of which prev is member, or a node of which prev is child"""
goup(e::HTMLElement{:HTML}) = [e]
goup(v::Vector{}) = [[v]; goup(first(v).parent)]
goup(e::HTMLElement) = [e; goup(succ(e))]

using Infiltrator
try2getfullsentences(sel::Selector, e::HTMLElement; sp="_______") = try2getfullsentences(sel, [e]; sp)
try2getfullsentences(sel::Selector, v::Vector; sp="_______") =
    let (fm, lm) = (first(eachmatch(sel, first(v))), last(eachmatch(sel, last(v))))
        # we know it's text because wrapping highlight is directly above text!
        _t1 = fm.children[1].text
        fm.children[1].text = sp * _t1
        _t2 = lm.children[1].text
        lm.children[1].text = _t2 * sp
        @exfiltrate
        (pre, mid, post) = (split(join(t.(v), " "), sp))
        h(x) = isempty(x) ? [""] : x
        lm.children[1].text = _t2
        fm.children[1].text = _t1
        sss = h ∘ Sentencize.split_sentence ∘ String
        join([last(sss(pre)), mid, first(sss(post))], " ")
    end

f(args::AAA) =
    let root = parsehtml(args.html).root, sel = Selector("._$(args.uuid)")
        matches = eachmatch(sel, root)
        gen = goup(first(matches))
        contextnode = first(filter(>(2) ∘ length ∘ divsplit, gen))
        potential_quote = contextnode isa Array ? contextnode : contextnode.children
        context = join(t.(potential_quote), ". ")
        quotenodes = filter(e -> !isempty(eachmatch(sel, e)), potential_quote)
        _quote = join(t.(quotenodes), " ")
        # @infiltrate
        badlen(s) = length(split(s)) > 30 || length(split(s)) < 6
        if badlen(_quote)
            @info _quote
            _quote = try2getfullsentences(sel, quotenodes)
            @info _quote
        end
        if badlen(_quote)
            _quote = try2getfullsentences(sel, contextnode)
            @info _quote
        end
        is4highlight(s) = length(split(s)) < 6
        highlight = join(t.(matches))
        highlights = is4highlight(highlight) ? [highlight] : []

        _quote, context, highlights
    end

errh(cb) = f -> req -> try
    f(req)
catch e
    cb(e)
end
# Quote Context Highlights
@post ("/make-qch") function (req)
    a = json(req, AAA)
    saved[] = a
    (q, c, h) = f(a)
    (; q, c, h)
end |> errh(x -> (; error=string(x)))

get("/latest") do
    html(saved[].html)
end

get("/rerun") do
    @info f(saved[])
    html(saved[].html)
end
