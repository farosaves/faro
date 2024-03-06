from flask import Flask, request, send_file
import subprocess
import os

app = Flask(__name__)

@app.post('/')
def run_pdf_conversion():
    pdf_data = request.data  # Get PDF data directly

    if not pdf_data:
        return "Please provide an input_file parameter"
    with open("temp.pdf", "wb+") as f:
        f.write(pdf_data)

    # with subprocess.Popen(["docker", "run", "-i", "--rm", "sergiomtzlosa/pdf2htmlex", "pdf2htmlEX", "--zoom", "1.3"], 
    #                       stdin=subprocess.PIPE, stdout=subprocess.PIPE) as process:
    #     html_data, error = process.communicate(input=pdf_data)

    # os.system("sudo docker run -ti --rm -v ~/pdf:/pdf sergiomtzlosa/pdf2htmlex pdf2htmlEX --zoom 1.3 {} output.html".format(input_file))
    return "Conversion done!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port="2227", debug=True)  # Listen on all interfaces for Docker
