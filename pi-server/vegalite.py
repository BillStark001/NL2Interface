import os
import json
import pandas as pd
import sqlite3

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

tmpl_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
app = Flask(__name__, template_folder=tmpl_dir)

socketio = SocketIO(app, cors_allowed_origins="*")

query_log = []

@app.after_request
def add_header(r):
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r

@app.route('/')
def main():
    return render_template('vega-lite.html')

@socketio.on("data")
def request_data(srcs):
    db = sqlite3.connect("data/pi.db")
    datasets = {}
    for src in srcs:
        data = pd.read_sql(f"select * from {src} limit 1000", db)
        values = []
        for i, d in data.iterrows():
            values.append(d.to_dict())
        datasets[src] = values

    emit("data", datasets)

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=8000, processes=1)
