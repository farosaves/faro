using HTTP, JSON3, YAML

include("prompts.jl")

dicts_to_nt(x) = x
dicts_to_nt(d::Dict) = (; (Symbol(k) => dicts_to_nt(v) for (k, v) in d)...)
config = dicts_to_nt(YAML.load_file("nlp/config.yaml"))

tokenize(s) = JSON3.read(HTTP.post(
    "$(config.API_URL)/tokenize";
    body=JSON3.write(:content => s)).body).tokens

prompt(config, message; forcedstart="") =
    """### System:
    $(config.instruction)

    ### $(config.convo.User_name):
    $message

    ### $(config.convo.Bot_name):
    $forcedstart"""

n_keep = length(tokenize(config.instruction))

handle(resp) =
    let str = String(resp.body)
        ms = eachmatch(r"^data:.*(?!data)"m, str)
        datas = map(x -> JSON3.read(x.match[7:end]), ms)
        x = last(datas)
        @info "" x.tokens_predicted x.timings.predicted_per_second
        (join(x.content for x in datas))
    end

complete_one(message; forcedstart="") = handle(HTTP.request("POST",
    "$(config.API_URL)/completion";
    body=JSON3.write(Dict(
        :prompt => prompt(config, message; forcedstart),
        :n_keep => n_keep,
        :stop => ["\n### $(config.convo.User_name):"],
        pairs(config.inference)...
    ))))

complete_one("Is Pluto a planet?")
text = read("nlp/example_texts/huberman_ama12.txt", String)
const AString = AbstractString
a_type = "transcript of an educational podcast"

# println("text tokens: ", length(tokenize(text)))

buildmessage(text, a_type::AString, instruction; text_first=config.prompt.text_first) =
    let
        "I will give you a text which is a $a_type.\n" *
        if text_first
            "Here is the text:\n\"$text\"\nHere the text ends.\n$instruction"
        else
            "$instruction.\nHere is the text:\n\"$text\"\nHere the text ends."
        end
    end

@time begin
    ans = complete_one(buildmessage(text, a_type, Prompts.v2); forcedstart=Prompts.forcedstart_v1)
    println(ans)
end

begin
    ans = complete_one(buildmessage(text, a_type, Prompts.brevify_v1))
    println(ans)
end

begin
    ans = complete_one(buildmessage(text, a_type, Prompts.brevify_v1); forcedstart=Prompts.forcedstart_brevify)
    println(ans)
end

article_text = read("nlp/example_texts/wikipedia_article.txt", String)
println(length(split(article_text)))
article_type = "fragment of a wikipedia article"

@time begin
    ans = complete_one(buildmessage(article_text, article_type, Prompts.v3(15)); forcedstart=Prompts.forcedstart_v1)
    println(ans)
end

buildmessage(article_text, article_type, Prompts.v3(15))