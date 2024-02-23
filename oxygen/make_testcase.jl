using JSON3
html = read("oxygen/manual_saved/ved.html", String)

uuid = "78d59343-dc4d-4bb6-90ac-ffbc06cd7a19"

html = strip(html, '`')

selectedText = "Composed"

JSON3.write("ex_case.json", (; selectedText, html, uuid))