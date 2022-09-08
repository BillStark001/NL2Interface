import os

usecase = ['filter1', 'filter10', 'filter50', 'filter100']

iter_per_merge = [25] 
rand_map = [5]
early_stop = [30]
n_procs = [ 3]
run = range(0, 10)

for u in usecase:
    for tt in iter_per_merge:
        for r in rand_map:
            for e in early_stop:
                for p in n_procs:
                    for v in run:
                        f = open(f"{u}_merge{tt}_rand{r}_stop{e}_nproc{p}_run{v}.yaml", 'w')
                        f.write(f"usecase: {u}\n")
                        f.write(f"run: {v}\n")
                        f.write(f"input_log_path: data/logs/filter_duplicate/log_{u}.txt\n")

                        f.write("db: data/pi.db\n")
                        f.write("log_db: data/log_pi_expr.db\n")

                        f.write("mcts:\n")
                        f.write(f"  method: single\n")
                        f.write(f"  uct_c: 10000\n")
                        f.write(f"  process_number: {p}\n")
                        f.write(f"  iteration_per_merge: {tt}\n")
                        f.write(f"  iteration_number: 2000\n")
                        f.write(f"  rand_map: {r}\n")
                        f.write(f"  early_stop: {e}\n")
                        f.close()

'''
iter_per_merge = [100]
rand_map = [5]
early_stop = [150]
n_procs = range(1, 16)
run = [1, 2, 3]

for u in usecase:
    for tt in iter_per_merge:
        for r in rand_map:
            for e in early_stop:
                for p in n_procs:
                    for v in run:
                        f = open(f"core_{u}_nproc{p}_run{v}.yaml", 'w')
                        f.write(f"usecase: {u}\n")
                        f.write(f"run: {v}\n")
                        f.write(f"input_log_path: data/logs/log_{u}.txt\n")
                        f.write("db: data/pi.db\n")
                        f.write("log_db: data/log_pi_single.db\n")

                        f.write("mcts:\n")
                        f.write(f"  method: single\n")
                        f.write(f"  uct_c: 10000\n")
                        f.write(f"  process_number: {p}\n")
                        f.write(f"  iteration_per_merge: {tt}\n")
                        f.write(f"  iteration_number: 2000\n")
                        f.write(f"  rand_map: {r}\n")
                        f.write(f"  early_stop: {e}\n")
                        f.close()'''
