import json
from flask import Flask, request, send_file, send_from_directory
import subprocess, uuid, os, glob, boto3

if not os.path.isdir("/tmp/appey"):
    os.mkdir("/tmp/appey")
app = Flask(__name__)

mydir = "/tmp/appey/"
u = uuid.uuid4()


s3 = boto3.resource('s3',
  endpoint_url = 'https://362e2d4a4b780aab43b3c82f2a779a47.r2.cloudflarestorage.com',
  region_name = 'eeur'
)

@app.get('/last')
def greet():
    return send_from_directory(mydir, f"{u}.html") if u else "jey"


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
    s3.Bucket("pdf2html").upload_file(f"{mydir}{u}.html", f"{u}.html")

    return json.dumps({"pdf_id": str(u)})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=2227, debug=True)  # Listen on all interfaces for Docker


