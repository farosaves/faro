using JSON3
html = read("supabase-sveltekit/src/lib/shared/snippetiser/896ee87b-1404-4483-b81b-7661e9e01780.html", String)

uuid = "896ee87b-1404-4483-b81b-7661e9e01780"

html = strip(html, '`')

selectedText = "Persian has features of agglutination"

JSON3.write("ex_case.json", (; selectedText, html, uuid))