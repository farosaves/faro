from flask import Flask, request, send_file, send_from_directory
import subprocess, uuid, os, glob
from time import sleep

if not os.path.isdir("/tmp/appey"):
    os.mkdir("/tmp/appey")
app = Flask(__name__)

mydir = "/tmp/appey/"
u = None

@app.get('/last')
def greet():
    return send_from_directory(f"{mydir}{u}.html") if u else "hello"


@app.post('/')
def run_pdf_conversion():
    pdf_data = request.data  # Get PDF data directly

    if not pdf_data:
        return "Please provide an input_file parameter"
    
    global u
    u = uuid.uuid4()

    with open(f"{mydir}{u}.pdf", "wb+") as f:
        f.write(pdf_data)

    subprocess.run(["pdf2htmlEX", "--zoom", "1.3", "--dest-dir", mydir, f"{mydir}{u}.pdf", f"{u}.html"])

    with open(f"{mydir}{u}.html", "rb+") as f:
        html = f.read()

    print(len(html))

    return "Conversion done!"


if __name__ == '__main__':
    app.run(host='0.0.0.0', port="2227", debug=True)  # Listen on all interfaces for Docker


