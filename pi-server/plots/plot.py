import matplotlib.pyplot as plt

log = open("stat_log.txt").readlines()

N = dict()

i = 0
f = 0 
while i < len(log):
    #if log[i].strip() in ['connect', 'covid', 'explore', 'filter', 'overview', 'sales', 'sdss']:
    
    if log[i].strip() in ['sales', 'sdss']:
        case = log[i].strip()
        f = 1
        i += 1
    elif f == 0: 
        i += 1
        continue

    step = int(log[i][6:].strip())
    rand = eval(log[i+2])
    print(len(rand))
    rand_fully = rand[100:]
    rand = rand[:100]
    search = eval(log[i+5])
    minx = min(search)
    maxx = max(search)
    inf = 100000
    print(minx, maxx)
    N.setdefault(case, dict())
    N[case].setdefault(step, 0)
    N[case][step] += 1
    i += 6
    if minx == maxx: continue

    plt.clf()
    fig, (ax1, ax2, ax3) = plt.subplots(3)
    ax1.hist(search, bins=int((maxx-minx)/20), range=(minx, maxx), density=True, color=(0, 0, 1, 0.5))
    ax1.hist(rand, bins=int((maxx-minx)/20), range=(minx, maxx), density=True, color=(1, 0, 0, 0.5))
    ax1.set_xlabel("cost")
    ax1.set_ylabel("heuristic")
    ax2.hist(search, bins=int((maxx-minx)/20), range=(minx, maxx), density=True, color=(0, 0, 1, 0.5))
    ax2.hist(rand_fully, bins=int((maxx-minx)/20), range=(minx, maxx), density=True, color=(1, 0, 0, 0.5))
    ax2.set_xlabel("cost")
    ax2.set_ylabel("random")
    ax3.bar(['search', 'heur_rand', 'pure_rand'], [len(search), len(rand), len(rand_fully)])
    fig.savefig(f"plots/{case}_step{step}_{N[case][step]}.pdf")
