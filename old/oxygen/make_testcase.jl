using JSON3
html = read("oxygen/a.html", String)

uuid = "c49d9f7e-5562-41b1-8fbf-31033a1a9c11"

html = strip(html, '`')

selectedText = "In Galo beliefs, Jimi manifests as Melo (Sky) and Sidi (Earth), out of the interaction of which all things and beings are born, including Donyi and Polo.[11] There are other myths explaining the meaning of the duality Donyi and Polo.[11][10]\n\n"

JSON3.write("ex_case.json", (; selectedText, html, uuid))

