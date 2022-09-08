import time
import random
import sys
import os
import json
import pandas as pd

from sqlalchemy import create_engine
from flask import Flask, render_template
from flask_socketio import SocketIO, emit

from dbinterface import TestCatalogue, DBCatalogue, Database
from pipeline import generate_ui

from engine import * 
from experiment import Experiment as Exp
from interface.widgets import *
from interface.interaction import Interaction, MType, MSpace

tmpl_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
app = Flask(__name__, template_folder=tmpl_dir)

socketio = SocketIO(app, async_mode='threading', cors_allowed_origins="*")

sessions = {}
class Session:
  def __init__(self, name):
    self.name = name

  query_log = []
  engine = None
  spec = None


@app.after_request
def add_header(r):
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r


@app.route('/')
def main():
    return render_template('demo_index.html')

def get_session(session):
  global sessions
  if not session in sessions:
    sessions[session] = Session(session)
  return sessions[session]

def deserialize_msg(msg):
  if isinstance(msg, str):
    return get_session("default"), msg

  if not msg.get("payload"):
    # Backwards compatibility for demo app
    # which has no session and naked payloads
    return get_session(msg.get("session")), msg
  return get_session(msg.get("session")), msg.get("payload")

@socketio.on("reset")
def reset(msg):
  session, _ = deserialize_msg(msg)
  session.query_log = []

@socketio.on("runq")
def runq(msg):
  print(msg)
  session, text = deserialize_msg(msg)
  qs = [l.strip() for l in text.split("\n") if l.strip()]
  if not qs: return
  if len(qs) > 1:
    session.query_log.extend(qs[:-1])
  q = qs[-1]

  db = create_engine("sqlite:///data/pi.db")

  cur = db.execute(q)
  #cur = db.execute(q + " limit 100")
  data = []
  keys = cur.keys()
  for i, row in enumerate(cur):
    row = dict(list(zip(keys, list(row))))
    row['id'] = i+1
    data.append(row)
  session.query_log.append(q)

  emit("table", dict(rows=data, columns=list(keys)))
  emit("log", session.query_log)
  time.sleep(0.01)
  run_pi(session, session.query_log)

@socketio.on('log')
def recv_log(msg):
    session, q = deserialize_msg(msg)
    print("Got query log", q)
    log = list(filter(lambda s: len(s)>0, map(lambda s: s.strip(), q['log'].split("\n"))))
    try:
      run_pi(session, log)
    except:
      print("Failed to generate interface")
      emit('failed', { "session": session.name })

@socketio.on("runpi")
def on_runpi(msg):
    session, _ = deserialize_msg(msg)
    run_pi(session, session.query_log)

def run_pi(session, log):
  """
  log: list of query strings
  """
  log = list(map(lambda s: " ".join(filter(lambda s: s.strip(), s.strip().split())), log))

  db = Database("data/pi.db")
  #catalog = TestCatalogue()

  catalog = DBCatalogue("sqlite:///data/pi.db")
  ui = generate_ui(log, catalog, db, pre_generalize=False)

  difftrees = "\n".join([t.root.get_text() for t in ui.difftrees])
  print(difftrees)
  shorthand = []
  for t in ui.difftrees:
      shorthand.append(t.vis.get_text() + " " + str(t.vis.cost))
  for item in ui.mappings:
      if isinstance(item, Interaction):
          t = {MType.SINGLE: "SINGLE", MType.MULTI: "MULTI",
               MType.BRUSHX: "BRUSHX", MType.BRUSHY: "BRUSHY", MType.BRUSHXY: "BRUSHXY",
               MType.PANX: "PANX", MType.PANY: "PANY", MType.PANXY: "PANXY",
               MType.ZOOMX: "ZOOMX", MType.ZOOMY: "ZOOMY", MType.ZOOMXY: "ZOOMXY"}[item.mtype]
          s = {MSpace.PIXEL: "pixel", MSpace.MARK: "mark", MSpace.DATA: "data"}[item.mspace]
          shorthand.append(t + "-" + s + ' ' + str(item.cost()))
      else:
          shorthand.append(item.get_text() + " " + str(item.cost()))

  print("\n".join(shorthand))
  print(ui.cost()[0], ui.cost()[1])


  def f(node, k):
      print('+'*k, node.wtype(),  "height="+ str(node.height), 'width='+ str(node.width))
      if  (isinstance(node, Vertical) or isinstance(node, Horizontal)) \
          and node.widget is not None: 
          print(' '*k+'@',  node.widget.wtype(), 'height='+ str(node.widget.height), 'width='+ str(node.widget.width) )
      if not hasattr(node, 'children'): return
      for i in node.children: 
          f(i, k+2)

  f(ui.layouts, 0)

  Exp.record()
  print(ui.to_spec())
  print("Setting up session", session.name)
  session.spec = json.loads(ui.to_spec())
  session.engine = Engine(session.spec)
  emit('spec', session.spec)


@socketio.on('tosql')
def tosql(msg):
    session, q = deserialize_msg(msg)
    queries = []
    for bid, backend in session.engine.backends.items():
        if isinstance(backend, DiffTree):
            queries.append((bid, backend.last_query))
    query = "\n".join(map(lambda s: s[1], sorted(queries)))
    emit("sql", dict(sql=query))

@socketio.on('previewsql')
def previewsql(msg):
    session, q = deserialize_msg(msg)

    queries = []
    for bid, backend in session.engine.backends.items():
        if isinstance(backend, DiffTree):
            if bid == q['query']['backend']:
                queries.append((bid, session.engine.to_preview(q['query'])))
            else:
                queries.append((bid, backend.last_query))

    emit("preview", dict(preview=[q[1] for q in sorted(queries)]))

@socketio.on('execute')
def execute(msg):
    session, q = deserialize_msg(msg)
    if session.engine is None:
      print("Execute for no engine", session.name)
    qid = q["qid"]
    print(q)
    data = session.engine.query(q["query"])

    queries = []
    for bid, backend in session.engine.backends.items():
        if isinstance(backend, DiffTree):
            queries.append((bid, backend.last_query))

    query = "".join(map(lambda s: f"<p>{s[1]}</p>", sorted(queries)))

    emit("sql", dict(sql=[q[1] for q in sorted(queries)]))
    emit(f"data#{qid}", dict(
      sql=query,
      data=data
    ))

@socketio.on('restore')
def restore(msg):
  session, interface_spec = deserialize_msg(msg)
  spec = interface_spec.get("spec")
  session.spec = spec
  session.engine = Engine(spec)
  print("Restoring session", session.name, interface_spec.get("id"))

if __name__ == "__main__":

    Exp.init_config(dict(
      usecase='demo', 
      run=1,
      log_db="wu.db",
      mcts=dict(
        uct_c=10000, 
        iteration_per_merge=20,
        iteration_number=200,#1000, 
        rand_map=5,
        process_number=1,
        early_stop=20)))
    seed = 0
    random.seed(0)
    Exp.log_seed(seed)
    print("http://0.0.0.0:8000")
    socketio.run(app, host='0.0.0.0', port=8000, processes=1, debug=True)
