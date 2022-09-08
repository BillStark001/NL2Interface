# Run Experiment

```python3 RunExp.py configs/covid.yaml```

# Render Interface

```python3 server.py spec/covid.json```

config/: store the experiment config

data/logs: input logs

spec/: output interface spec

# Run demo

Install dependencies with ```pip install -r requirements.txt ```

Then run: ```python3 demo.py```

The input log can only query on the table in src/pi-server/pi.db

# Supported Interactions
Interaction | FDs | Vis Interactions Supported
--- | --- | --- 
Table(*) |  | Click, Multi-click
Point/Circle/Square(x:Q, y:Q, [shape:C, size:C, color:C]) | | Click, Multi-click, Brush-x/y/xy, Pan, Zoom
Bar(x:C, y:Q, [color:C]) | (x, color) &rarr; y | Click, Multi-click, Brush-x
Line(x:C, y:Q, [shape:C, size:C, color:C]) | (x, shape, size, color) &rarr; y | Click, Multi-click, Brush-x, Pan, Zoom

# Test generate_ui_from_difftree()

Modify the difftree input in `__main__` of `pipeline.py`, then run

```python3 pipeline.py```

### workflow of generate_ui_from_difftree():
- parse the input difftree string to json representation using the parser from Jade (located in `parser2/Parser.py`).
- call `json_to_difftree()` in `difftree/param_difftree.py` to convert the json objects to `Difftree` objects.
- call existing `search_mapping()` to map visualization/interaction/widget to the difftrees

### workflow of `json_to_difftree()`:
- create `Node`s from json with no type/schema/domain information (call `to_difftree()` of `param_difftree.py`)
- convert domain nodes (e.g. `Any{$col}`) and range nodes (e.g. `Any{[1,10]}`) to normal Any node with children
  + For domain nodes, infer the table name and attribute name of the domain, then execute `SELECT {attribute} FROM {table}` to obtain the domain values as the children of the Any node
  + For range nodes, convert it to an Any node with two children: start value and end value
- infer node type similar to `infer_type()` of `parse/piparser.py`
- sample queries from difftrees and execute sample queries to obtain `sample_outputs`
- build `Difftree()` using the difftree with inferred type and sampled queries and outputs. `Diffree()` will infer schema/domain/sql_schema.

## TODO
- [ ] Build a demo which is aware of the default value for input difftrees. 
- [ ] (Optional) Support default values for more choice node. Now we only support paring default values of Any and Optinal nodes. Should further support parsing Multi and FXMulti nodes.

