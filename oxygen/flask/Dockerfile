
# FROM python:3.10-slim as PYTHON
# WORKDIR /app
# COPY . ./
# RUN python3 -m venv venv
# ENV PATH=/app/venv/bin/:$PATH
# RUN chmod +x /app/venv/bin/activate
# RUN activate
# RUN pip install -r ./requirements.txt

FROM pdf2htmlex/pdf2htmlex:0.18.8.rc2-master-20200820-ubuntu-20.04-x86_64

FROM python:3.10-slim
COPY --from=0 /usr /usr
COPY --from=0 /lib64 /lib64
WORKDIR /app
COPY . ./
RUN pip install -r ./requirements.txt
CMD python app.py
