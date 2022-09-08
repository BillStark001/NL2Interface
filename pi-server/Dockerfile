FROM python:3.9.12-slim-bullseye
WORKDIR /
COPY ./requirements.txt /requirements.txt
RUN pip install -r /requirements.txt
WORKDIR /pi-server
CMD python demo.py