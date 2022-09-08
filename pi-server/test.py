from IPython import embed
from dbinterface import *
from pipeline import generate_ui
from search_mapping import *

log_connect = open("data/logs/log_connect.txt").readlines()
log_covid = open("data/logs/log_covid.txt").readlines()
log_explore = open("data/logs/log_explore.txt").readlines()
log_filter = open("data/logs/log_filter.txt").readlines()
log_overview = open("data/logs/log_overview.txt").readlines()
log_sales = open("data/logs/log_sales.txt").readlines()
log_sdss = open("data/logs/log_sdss.txt").readlines()

CASE = "sdss"

if __name__ == "__main__":

    f = open("stat_log_sdss.txt", "a")
    f.write(CASE + "\n")
    f.close()

    catalog = TestCatalogue()
    db = Database("data/pi.db")
    ui = generate_ui(eval(f"log_{CASE}"), catalog, db)
    spec = ui.to_spec()
    f = open(f"spec/{CASE}.json", 'w')
    f.write(spec) 
    f.close()
    print(all_costs)
