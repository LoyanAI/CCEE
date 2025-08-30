from paddleocr import PaddleOCR
import os
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


def process_folder(root_dir, fn, ext=None):
    for dirpath, _, files in os.walk(root_dir):
        for name in files:
            if ext is None or name.lower().endswith(tuple(ext)):
                #full_path = os.path.join(dirpath, name)
                fn(name)

# 调用示例
data=[]
ocr = PaddleOCR(lang='ch',device='cpu')     # 中文+方向分类
def my_ocr(path):
    global data
    f=path[0:path.index('.')]
    print("\r"+str(f),end='')
    data.append([int(f),' '.join(ocr.predict("./img/"+path)[0]['rec_texts'])])
    if len(data)>20:
        db.executemany("INSERT OR REPLACE INTO ocr_result(pid, text) VALUES(?,?)", data)
        db.commit()
        data=[]
process_folder(r'./img', my_ocr)
db.close()

