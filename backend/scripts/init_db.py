"""Build problems.db from atcoder_tags.csv. Run once after install."""
import csv
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  
CSV_PATH = ROOT / "data" / "atcoder_tags.csv"
DB_PATH  = ROOT / "data" / "problems.db"

if not CSV_PATH.exists():
    raise SystemExit(f"CSV missing at {CSV_PATH}")

if DB_PATH.exists():
    DB_PATH.unlink()

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("""
CREATE TABLE problems (
    problem_index INT PRIMARY KEY,
    Problem_Link TEXT NOT NULL,
    Editorial_Link TEXT NOT NULL,
    Tags TEXT NOT NULL
)
""")

cur.execute("CREATE INDEX idx_problems_tags ON problems(Tags)")

with open(CSV_PATH, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    rows = [
        (int(r["Index"]), r["Problem_Link"], r["Editorial_Link"], r["Tags"])
        for r in reader
    ]

cur.executemany(
    "INSERT INTO problems (problem_index, Problem_Link, Editorial_Link, Tags) VALUES (?, ?, ?, ?)",
    rows,
)
conn.commit()
conn.close()
print(f"Built {DB_PATH} with {len(rows)} rows")