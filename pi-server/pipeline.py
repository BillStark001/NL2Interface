from parse.piparser import PIParser
import parser2.Parser as PIParser2
from clustering import clustering_query_trees

from difftree.difftree import Difftree
from difftree.param_difftree import json_to_difftree
from search_difftree import search_difftree
from search_mapping import search_mapping
from interface.interface import Interface, reset_cost_stat
import interface.interface as intf
from experiment import Experiment as Exp
import time
import random
from generalize import *

max_sample = 5


def generate_ui(sqls, catalog, db, pre_generalize):
    random.seed(0)
    # step 1: parse sql queries into trees
    # initialize a parse
    parser = PIParser("parse/sql.peg", catalog)
    trees = []
    for i, sql in enumerate(sqls):

        # parse string into tree
        # nodes' types are inferred
        tree = parser.parse(sql, i)
        tree.print()
        # finish parsing a query
        trees.append((tree, i))

    now = time.time()

    # step 2: cluster query trees
    clusters = clustering_query_trees(trees)
    sample_outputs = [db.execute(q) for q in sqls]
    parse_queries = [parser.parse(q, i) for i, q in enumerate(sqls)]
    # step 3: transform all trees by applying rules

    reset_cost_stat()
    trees, mcts_score = search_difftree(clusters, catalog, sample_outputs, parse_queries,db, pre_generalize)

    Exp.log_tmcts(time.time() - now)
    print("search difftree", time.time()-now)

    # step 4: construct, infer node schema and sql schema
    # step 5: map visualization

    difftrees = []
    for tree in trees:
        parsed = [(parse_queries[i], i) for i in sorted(list(tree.queries))]
        sample = [sample_outputs[i] for i in sorted(list(tree.queries))]

        difft = Difftree(tree, catalog, parsed, sample)

        def merge(node, base_node):
            if node == node.difftree.root:
                node.difftree.root = base_node
            else:
                node.parent.children[node.crank] = base_node

        merges = 0
        for i in range(len(difft.choices)):
            node = difft.choices[i]
            print("Looking for merge for:", i, node.depth, node, node.node_schema)
            print(node.history)
            for j in range(len(difft.choices)):
                base_node = difft.choices[j]
                if ((node.node_schema == base_node.node_schema
                        and node.history == base_node.history)
                    or
                    ((len(base_node.history) > len(node.history))
                        and (set(node.history) <= set(base_node.history)))):
                    print("  Merge:", j, base_node.node_schema, base_node.history, base_node)
                    merges += 1
                    merge(node, base_node)
                    break
            print("----")
        print(difft.select_content, [c.depth for c in difft.choices])
        print("Total merges:", merges)
        print("=============")
        difft.choices = []
        difft.unique_schemas = {}
        difft.infer_schema(difft.root)

        difftrees.append(difft)

    now = time.time()
    # f = open('mcts_cost_dist.txt', 'w')
    # f.write(repr(intf.cost_dist))
    reset_cost_stat()
    # step 6: map widget and interaction based on cost model
    if pre_generalize:
        difftrees = generalize(difftrees, db, catalog,[])
    layouts, mappings = search_mapping(difftrees, mcts_score)
    # f = open('exhaustive_cost_dist.txt', 'w')
    # f.write(repr(intf.cost_dist))

    Exp.log_tmapping(time.time() - now)
    print("search mapping", time.time()-now)
    #import pdb; pdb.set_trace()
    print("test random:", random.random())


    # step 7: construct interface
    return Interface(difftrees, layouts, mappings, Exp)


def generate_ui_from_difftree(difftrees, catalog, db):
    random.seed(0)
    # step 1: parse diffsql to difftree
    objs = [PIParser2.parse_difftree(t, compact=True) for t in difftrees]
    trees = [json_to_difftree(t, catalog, db) for t in objs]

    now = time.time()

    reset_cost_stat()
    # step 2: map widget and interaction based on cost model
    layouts, mappings = search_mapping(trees, float("inf"))

    Exp.log_tmapping(time.time() - now)
    print("search mapping", time.time()-now)
    print("test random:", random.random())

    # step 3: construct interface
    return Interface(trees, layouts, mappings, Exp)

if __name__ == "__main__":
    from dbinterface import TestCatalogue, DBCatalogue, Database
    from interface.widgets import *
    from interface.interaction import Interaction, MType, MSpace

    db = Database("data/pi.db")
    catalog = TestCatalogue()
    ui = generate_ui_from_difftree(["select date, Any{cases,deaths} from covid where state=Any{$state: default = 'New York'}"],
                              catalog, db)

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