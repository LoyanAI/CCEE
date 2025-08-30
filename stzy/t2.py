import sqlite3
DB_PATH = "img.db"


def init_db(db_path: str = DB_PATH):
    conn = sqlite3.connect(db_path)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS ocr_result (
            pid  INTEGER PRIMARY KEY,
            text TEXT NOT NULL
        );
    """)
    conn.commit()
    conn.close()
init_db()
db = sqlite3.connect(DB_PATH)
data = [(0,"dfg6d4fg5f"),(13,"srtergfdg")]
db.executemany("INSERT OR REPLACE INTO ocr_result(pid, text) VALUES(?,?)", data)
db.commit()
db.close()