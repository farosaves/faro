using StructTypes, Gumbo, Cascadia, JSON3
import Sentencize
include("util.jl")
Revise.track("util.jl")

struct PackedQCHQuery
    selectedText::String
    context::String
    uuid::String
end
saved_pre = Ref{PackedQCHQuery}()
struct UnpackedQCHQuery
    selectedText::String
    html::String
    text::String
    uuid::String
end
saved = Ref{UnpackedQCHQuery}()
StructTypes.StructType(::Type{PackedQCHQuery}) = StructTypes.Struct()
"""general text wrangle"""
t = strip ∘ wqd ∘ replace // ("\n" => " ") ∘ gtsf ∘ Gumbo.text
sss = Sentencize.split_sentence ∘ String #∘ replace // (r"(\W\w)\." => s"\g<1>…")
splittags = Set([:p, :h1, :h3, :ul, :div, :details, :h2, :blockquote, :li])
"""Should give all 'sentences' splitting on html tags, but not span, a, etc."""
divsplit(v::Vector{<:HTMLNode}) =
    let f(prev::Vector{T}, node) where {T<:AbstractString} =
            if !(node isa HTMLText) && tag(node) in splittags
                [prev..., t(node), ""]
            else
                (x..., y) = prev
                [x..., y * t(node) * " "]
            end
        [(sss ∘ gtsf ∘ strip).(filter(!isempty, foldl(f, v; init=[""])))...;] .|> identity
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
        if tag(e) ∈ sectiontags || isempty(st)
            e.parent
        else
            pseudop = lastiterate(st)
            collect(taketillnextsectiontag(pseudop))
        end
    end

"""returns either a vector of nodes of which prev is member, or a node of which prev (/s) is child"""
goup(e::HTMLElement{:HTML}) = [e]
goup(v::Vector{<:Any}) = [[v]; goup(first(v).parent)]
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
        # HERE i last modified divsplit wasnt broadcast and no flatten
        sents = _join(flatten(divsplit.(v)), ". ")
        (pre, mid, post) = (split(sents, sp))  # _join(t.(v))
        lm.children[1].text = _t2
        fm.children[1].text = _t1
        h(x) = isempty(x) ? [""] : x
        _sss = h ∘ sss
        _join([last(_sss(pre)), mid, first(_sss(post))])
    end

f(args::UnpackedQCHQuery) =
    let root = parsehtml(args.html).root, sel = Selector("._$(args.uuid)")
        matches = eachmatch(sel, root)
        gen = goup(first(matches))
        contextnode = first(filter(>(2) ∘ length ∘ divsplit, gen))
        potential_quote = contextnode isa Array ? contextnode : contextnode.children
        context = _join(divsplit(potential_quote), ". ")

        is4highlight(s) = length(split(s)) < 6
        highlight = _join(t.(matches))
        if !is4highlight(highlight)
            highlights = []
            return highlight, context, highlights
        end
        highlights = [highlight]

        quotenodes = filter(e -> !isempty(eachmatch(sel, e)), potential_quote)
        # _quote = _join(divsplit(quotenodes))

        @infiltrate
        _quote = try2getfullsentences(sel, quotenodes)
        badlen(s) = length(split(s)) > 30 || length(split(s)) < 6
        if badlen(_quote)
            # @infiltrate
            @info _quote
            _quote = try2getfullsentences(sel, contextnode)
            @info _quote
        end
        _quote, context, highlights
    end

import Dates: now
import Serialization: serialize
# Quote Context Highlights
@post ("/make-qch") function (req)
    a = json(req, PackedQCHQuery)
    saved_pre[] = a
    ((_, reqhtml), (_, reqtext)) = JSON3.read(String(transcode(GzipDecompressor, UInt8.(collect(a.context)))))
    a = UnpackedQCHQuery(a.selectedText, reqhtml, reqtext, a.uuid)
    saved[] = a
    serialize("saved/$(now()).jls", saved[])
    (q, c, h) = f(a)
    (; q, c, h)
end