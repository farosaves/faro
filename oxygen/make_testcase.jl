using JSON3
html = read("oxygen/pdf/a.html", String)

uuid = "e0493526-f47b-459a-bb54-7b31eca4d060"

html = strip(html, '`')

selectedText = "open='<b>'"

JSON3.write("ex_case.json", (; selectedText, html, uuid))

