using JSON3
html = read("oxygen/manual_saved/aa.html", String)

uuid = "2bd30b8e-f166-421c-8992-8e08322eb2f1"

html = strip(html, '`')

selectedText = "understand"

JSON3.write("ex_case.json", (; selectedText, html, uuid))

