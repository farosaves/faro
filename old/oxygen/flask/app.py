import json
from flask import Flask, request, send_file, send_from_directory
import subprocess, uuid, os, boto3, re


if not os.path.isdir("/tmp/appey"):
    os.mkdir("/tmp/appey")
app = Flask(__name__)

mydir = "/tmp/appey/"

s3 = boto3.resource('s3',
  endpoint_url = 'https://362e2d4a4b780aab43b3c82f2a779a47.r2.cloudflarestorage.com',
  region_name = 'eeur'
)

@app.get('/hey')
def greet():
    return "hi"


@app.post('/')
def run_pdf_conversion():
    pdf_data = request.data  # Get PDF data directly

    u = uuid.uuid4()
    if not pdf_data:
        return json.dumps({"error": "no input file"})

    try:
        with open(f"{mydir}{u}.pdf", "wb+") as f:
            f.write(pdf_data)

        subprocess.run(["pdf2htmlEX", "--zoom", "1.3", "--dest-dir", mydir, f"{mydir}{u}.pdf", f"{u}.html"])
        fname = f"{mydir}{u}.html"
        comment = f'<!-- farosUUID={u}-->'
        with open(fname, 'r+') as f:
            commented: str = re.sub(r"(<html.*?>)", fr"\1\n{comment}\n", open(fname).read())
            f.write(commented)

        s3.Bucket("pdf2html").upload_file(fname, f"{u}.html")

        return json.dumps({"pdf_id": str(u)})
    except FileNotFoundError:
        return json.dumps({"error": "conversion failed... not all pdfs are supported"})
    except Exception as e:
        return json.dumps({"error": str(e)})







if __name__ == '__main__':
    app.run(host='0.0.0.0', port=2227, debug=True)  # Listen on all interfaces for Docker


