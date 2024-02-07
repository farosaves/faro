using StructTypes, Gumbo, Cascadia
import Sentencize
include("util.jl")
Revise.track("util.jl")

struct MakeQCHQuery
    selectedText::String
    html::String
    uuid::String
end
saved = Ref{MakeQCHQuery}()
StructTypes.StructType(::Type{MakeQCHQuery}) = StructTypes.Struct()
"""wikipedia_quote_delete"""
wqd = replace // (r"\[\d{1,2}\]" => "")
"""general text wrangle"""
t = strip ∘ wqd ∘ replace // ("\n" => " ") ∘ Gumbo.text
splittags = Set([:p, :h1, :h3, :ul, :div, :details, :h2, :blockquote, :li])
"""Should give all 'sentences' splitting on html tags, but not span, a, etc."""
divsplit(v::Vector{<:HTMLNode}) =
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
    let stop(e2) = e2 != e && _tag(e2) ∈ sectiontags
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

__join(ts::Vector{<:AbstractString}, with=" ") =
# we replace: closing (parentheses etc, dots)  - \yogh - could be a param but regexp couldnt be precompiled
    join(ts, 'ʒ' * with) |>
    replace // (r"ʒ\s([\p{Pe}\p{Pf}\p{Po}])" => s"\g<1>") |>
    replace // (r"ʒ(\s)" => s"\g<1>")
_join(ts::Vector{<:AbstractString}, with=" "; extra='ʒ') =
    let startpunct(s) = !isnothing(match(r"^[\p{Pe}\p{Pf}\p{Po}]", s))
        condadd(s) = startpunct(s) ? s : with * s
        (replace // (r"(\p{P})\." => s"\g<1>") ∘ chopprefix // with ∘ join ∘ map)(condadd ∘ strip, ts)
    end

# join(ts, 'ʒ' * with) |> (replace // (r"ʒ\w" => ""))
onlymatchingnodes(sel) = filter / n -> !isempty(eachmatch(sel, n))
# needs to end with n because otherwise interacts with not adding dot and then splitting sentence because of interpunction
try2getfullsentences(sel::Selector, e::HTMLElement; sp="n_______n") = try2getfullsentences(sel, [e]; sp)
try2getfullsentences(sel::Selector, v::Vector; sp="n_______n") =
    let mn = onlymatchingnodes(sel)(v)
        (fm, lm) = (first(eachmatch(sel, first(mn))), last(eachmatch(sel, last(mn))))
        # we know it's text because wrapping highlight is directly above text!
        _t1 = fm.children[1].text
        fm.children[1].text = sp * _t1
        _t2 = lm.children[1].text
        lm.children[1].text = _t2 * sp
        # HERE i last modified divsplit wasnt broadcast
        sents = _join(flatten(divsplit.(v)), ". ")
        @infiltrate
        (pre, mid, post) = (split(sents, sp))  # _join(t.(v))
        h(x) = isempty(x) ? [""] : x
        lm.children[1].text = _t2
        fm.children[1].text = _t1
        sss = h ∘ Sentencize.split_sentence ∘ String
        _join([last(sss(pre)), mid, first(sss(post))])
    end

f(args::MakeQCHQuery) =
    let root = parsehtml(args.html).root, sel = Selector("._$(args.uuid)")
        matches = eachmatch(sel, root)
        gen = goup(first(matches))
        contextnode = first(filter(>(2) ∘ length ∘ divsplit, gen))
        potential_quote = contextnode isa Array ? contextnode : contextnode.children
        context = _join(t.(potential_quote), ". ")
        @infiltrate
        quotenodes = filter(e -> !isempty(eachmatch(sel, e)), potential_quote)
        _quote = _join(t.(quotenodes))
        # @infiltrate
        badlen(s) = length(split(s)) > 30 || length(split(s)) < 6
        if badlen(_quote)
            @info _quote
            _quote = try2getfullsentences(sel, quotenodes)
            @info _quote
        end
        if badlen(_quote)
            # @infiltrate
            _quote = try2getfullsentences(sel, contextnode)
            @info _quote
        end
        is4highlight(s) = length(split(s)) < 6
        highlight = _join(t.(matches))
        highlights = is4highlight(highlight) ? [highlight] : []

        _quote, context, highlights
    end

# Quote Context Highlights
@post ("/make-qch") function (req)
    a = json(req, MakeQCHQuery)
    saved[] = a
    (q, c, h) = f(a)
    (; q, c, h)
end  # |> errh(x -> (; error=string(x)))

get("/latest") do
    html(saved[].html)
end

get("/rerun") do
    @info f(saved[])
    html(saved[].html)
end

errh(cb) = f -> req -> try
    f(req)
catch e
    cb(e)
end
