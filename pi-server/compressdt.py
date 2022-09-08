from collections import *
from itertools import chain
import click
import json
from types import *
from engine import *



def compress_spec(node):
  children = list(chain(*map(compress_spec, node.get('children', []))))
  if node['type'] == 'ast':
    children = merge_mergables(children)
    children = list(merge_consecutive_strings(children))
    if len(children) == 1:
      return children
    node['children'] = children
  else:
    node['children'] = children

  if node['type'] == 'co-optional':
    return collapse_coopt(node)
  return [node]

# get first child
getsc = lambda n: n['children'][0]

# does node has single child and is it type t?
scoftype = lambda n, t: len(n['children']) == 1 and getsc(n)['type'] == t


def collapse_coopt(node, seen=False):
  """
  until we reach an opt node, flatten and get rid of all co-opt nodes, so

      ast -> [coopt->["a", ast->[coopt->["b"], "c"]]]

  turns into

      ast -> ["a", "b", "c"]

  if combined with merge_consecutive_strings, turns into

      ast -> ["abc"]
  """
  if node['type'] == 'opt':
    return [node]

  if scoftype(node, 'ast'):
    ast = getsc(node)
    children = []
    for c in ast['children']:
      if c['type'] == 'co-optional':
        children.extend(map(collapse_coopt, c['children']))
      else:
        children.append(c)
    ast['children'] = children
    return [ast]
  return [node]

  
def merge_mergables(cs):
  """
  flatten nested children if they are all ast/literal nodes, so

    ast -> [ ast->["a", "b"], ast->[ast->["c", "d"], ["e"]] ]

  turns into

    ast -> ["a", "b", "c", "d", "e"]

  if combined with merge_consecutive_strings, turns into

    ast -> ["abcde"]
  """
  if not all(c['type'] in ['ast', 'literal'] for c in cs):
    return cs

  f = lambda c: c['type'] == 'literal' and [c] or c['children']
  return list(chain(*map(f, cs)))



def merge_consecutive_strings(funcs):
  """
  merge child nodes that are strings, so

    ast -> ["", "", "date", "(", ANY, ")"]

  turns into

    ast -> ["date(", ANY, ")"]
  """
  f = lambda l: dict(
    type="literal",
    id=l[0]['id'],
    value="".join([o['value'] for o in l]),
    children=[])

  s = []
  for v in funcs:
    if v['type'] == 'literal':
      if v['value']:
        s.append(v)
    else:
      if s: 
        yield f(s)
      yield v
      s = []
  if s: yield f(s)



@click.command()
@click.argument("fname")
@click.option("-o", "--output", type=str, help="filename to write compressed spec")
@click.option("-t", is_flag=True, help="should we generate a query using compressed difftree?")
def main(fname, output, t):
  """
  Compresses the difftree in a PI2 spec and outputs a smaller spec.
  Will report compression ratios for each difftree.

  Usage:

    python compressdt.py spec/connect.json -o spec/connect.compressed.json
  """
  with open(fname, "r") as f:
     spec = json.loads(f.read())

  bindings = defaultdict(lambda: defaultdict(lambda: 0))

  stats = []
  for bspec in spec['backends']:
    if bspec['type'] == 'difftree':
      oldsize = float(len(json.dumps(bspec['difftree'])))
      bspec['difftree'] = compress_spec(bspec['difftree'])[0]
      newsize = float(len(json.dumps(bspec['difftree'])))
      stats.append(f"{int(100*newsize/oldsize)}%")

      if t:
        dt = DiffTree(bspec['difftree'], None)
        print(dt.tree.to_query(bindings))

  print("compressed sizes:", stats)
  
  o = output
  if not o:
    o = f"{fname}.compressed"

  with open(o, "w") as f:
    f.write(json.dumps(spec))
  print(f"written to {o}")



if __name__ == "__main__":
  main()