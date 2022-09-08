import sys
import os
import json

from flask import Flask, render_template
from flask_socketio import SocketIO, emit


from engine import *

tmpl_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
app = Flask(__name__, template_folder=tmpl_dir)

engine = None
spec = None
socketio = SocketIO(app, cors_allowed_origins="*")


@app.after_request
def add_header(r):
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r


@app.route('/')
def main():
    global spec_path,  spec, engine
    spec = json.load(open(spec_path))
    engine = Engine(spec)
    return render_template('index_covid.html')


@socketio.on('spec')
def init():
    emit('spec', spec)


@socketio.on('execute')
def execute(q):
    global spec, engine
    qid = q["qid"]
    print(q)
    data = engine.query(q["query"])

    queries = []
    for bid, backend in engine.backends.items():
        if isinstance(backend, DiffTree):
            queries.append((bid, backend.last_query))
    query = "".join(map(lambda s: f"<p>{s[1]}</p>", sorted(queries)))

    emit("sql", dict(sql=[q[1] for q in sorted(queries)]))
    emit(f"data#{qid}", dict(
      sql=query,
      data=data
    ))


if __name__ == "__main__":
    global spec_path 
    spec_path = sys.argv[1]
    socketio.run(app, host='0.0.0.0', port=8001)
