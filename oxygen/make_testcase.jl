using JSON3
html = read("oxygen/manual_saved/aa.html", String)

uuid = "3f7b1a9d-fb8a-4883-b276-9b80bdc0ad17"

html = strip(html, '`')

selectedText = "Flexbox"

JSON3.write("ex_case.json", (; selectedText, html, uuid))