#!/usr/bin/env python
import pandas as pd
import sqlite3
import sys

if len(sys.argv) != 3:
    print("Usage: import.py <csv-path> <table-name>")
    print(" e.g.: import.py tables/us-states.csv covid")
    print(sys.argv)
    sys.exit(1)

csv_path = sys.argv[1]
table_name = sys.argv[2]

data = pd.read_csv(csv_path)
db = sqlite3.connect("pi.db")
cursor = db.cursor()
cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
cursor.close()
data.to_sql(table_name, db)

