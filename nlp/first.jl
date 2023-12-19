using HTTP, JSON3, YAML
using CondaPkg, PythonCall

dicts_to_nt(x) = x
dicts_to_nt(d::Dict) = (; (Symbol(k) => dicts_to_nt(v) for (k, v) in d)...)
config = dicts_to_nt(YAML.load_file("nlp/config.yaml"))

tokenize(s) = JSON3.read(HTTP.post(
    "$(config.API_URL)/tokenize";
    body=JSON3.write(:content => s)).body).tokens

prompt(config, message) =
    """### System:
    $(config.instruction)

    ### $(config.convo_params.User_name):
    $message

    ### $(config.convo_params.Bot_name):
    """

n_keep = length(tokenize(config.instruction))
message = "Hello! How are you?"


handle(resp) =
    let str = String(resp.body)
        ms = eachmatch(r"^data:.*(?!data)"m, str)
        datas = map(x -> JSON3.read(x.match[7:end]), ms)
        x = last(datas)
        @info "" x.tokens_predicted x.timings.predicted_per_second
        (join(x.content for x in datas))
    end

complete_one(message) = handle(HTTP.request("POST",
    "$(config.API_URL)/completion";
    body=JSON3.write(Dict(
        :prompt => prompt(config, message),
        :n_keep => n_keep,
        :stop => ["\n### Human:"],
        pairs(config.inference_params)...
    ))))

complete_one("Is Pluto a planet?")