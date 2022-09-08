import yaml
from dbinterface import *
from pipeline import *
from search_mapping import *
from experiment import Experiment as Exp
import random
import os
import sys
import time

sys.setrecursionlimit(5000)

if __name__ == "__main__":
    start = time.time()

    #catalog = DBCatalogue("sqlite:///data/pi.db")

    catalog = TestCatalogue()


    cfg = os.sys.argv[1]
    cfg = yaml.load(open(cfg).read())
    Exp.init_config(cfg)


    seed = random.randint(1, 10000000000)
    #seed = int(os.sys.argv[2])
    Exp.log_seed(seed)
    random.seed(seed)

    db = Database(cfg["db"])
    log = open(cfg["input_log_path"]).readlines()

    ui = generate_ui(log, catalog, db)

    difftrees = "\n".join([t.root.get_text() for t in ui.difftrees])
    print(difftrees)
    Exp.log_difftrees(difftrees)

    Exp.log_final_cost(ui.cost())

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
            shorthand.append(t + "-" + s + " " + str(item.cost()))
        else:
            shorthand.append(item.get_text() + " " + str(item.cost()))
    Exp.log_shorthand(",".join(shorthand))

    print("COST:", ui.cost())
    print("\n".join(shorthand))

    spec = ui.to_spec()
    Exp.log_spec(spec)
    Exp.log_final_timestamp(time.time())
    Exp.log_toverall(time.time() - start)

    from interface.interface import COST_NUM, estimation_time
    Exp.log_cost_num(COST_NUM)
    print(COST_NUM)
    print(estimation_time)

    Exp.record()
    # print(spec)

