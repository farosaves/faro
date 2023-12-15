using JSON3
using Statistics: mean, std

jsondata = JSON3.read(read("transcriber/huberman_ama12.wav.json"))

x = jsondata.transcription[1]
fulltext = join(map(x -> x.text, jsondata.transcription))

length(split(fulltext))
split(fulltext, "So without further ado") |> last |> split |> length

