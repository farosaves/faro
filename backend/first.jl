using Oxygen

get("/") do
    read("backend/content/first.html", String)
end


serve()