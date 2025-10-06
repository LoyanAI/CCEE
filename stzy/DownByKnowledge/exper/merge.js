// merge.js
const sqlite3 = require('sqlite3');

const TARGET = 'merged.db';
const SRC1   = 'stzysk0.db';
const SRC2   = 'stzysk1-2.db';
const SRC3   = 'stzysk2v0.db';
const SRC4   = 'stzysk3.db';
const SRC5   = 'stzysk3v0.db';
const SRC6   = 'stzysk4.db';
const SRC7   = 'stzysk4p0v0.db';
const SRC8   = 'stzysk5p0v0.db';
const SRC9   = 'stzyskv0.db';
const db = new sqlite3.Database(TARGET);

// 1. 挂接源库
db.exec(`ATTACH DATABASE '${SRC1}' AS src1`);
db.exec(`ATTACH DATABASE '${SRC2}' AS src2`);
db.exec(`ATTACH DATABASE '${SRC3}' AS src3`);
db.exec(`ATTACH DATABASE '${SRC4}' AS src4`);
db.exec(`ATTACH DATABASE '${SRC5}' AS src5`);
db.exec(`ATTACH DATABASE '${SRC6}' AS src6`);
db.exec(`ATTACH DATABASE '${SRC7}' AS src7`);
db.exec(`ATTACH DATABASE '${SRC8}' AS src8`);
db.exec(`ATTACH DATABASE '${SRC9}' AS src9`);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      qid        TEXT    NOT NULL,
      q          TEXT    NOT NULL,
      d          TEXT,
      k          TEXT,  
      type       TEXT,
      area       TEXT,
      f          TEXT,
      m          TEXT
    )
  `);
});

db.exec(`
  INSERT INTO main.questions(qid,q,d,k,type,area,f,m)
  SELECT qid,q,d,k,type,area,f,m FROM src1.questions;
  INSERT INTO main.questions(qid,q,d,k,type,area,f,m)
  SELECT qid,q,d,k,type,area,f,m FROM src2.questions;
  INSERT INTO main.questions(qid,q,d,k,type,area,f,m)
  SELECT qid,q,d,k,type,area,f,m FROM src3.questions;
  INSERT INTO main.questions(qid,q,d,k,type,area,f,m)
  SELECT qid,q,d,k,type,area,f,m FROM src4.questions;
  INSERT INTO main.questions(qid,q,d,k,type,area,f,m)
  SELECT qid,q,d,k,type,area,f,m FROM src5.questions;
  INSERT INTO main.questions(qid,q,d,k,type,area,f,m)
  SELECT qid,q,d,k,type,area,f,m FROM src6.questions;
  INSERT INTO main.questions(qid,q,d,k,type,area,f,m)
  SELECT qid,q,d,k,type,area,f,m FROM src7.questions;
  INSERT INTO main.questions(qid,q,d,k,type,area,f,m)
  SELECT qid,q,d,k,type,area,f,m FROM src8.questions;
  INSERT INTO main.questions(qid,q,d,k,type,area,f,m)
  SELECT qid,q,d,k,type,area,f,m FROM src9.questions;
`);

db.exec("DETACH DATABASE src1");
db.exec("DETACH DATABASE src2");
db.exec("DETACH DATABASE src3");
db.exec("DETACH DATABASE src5");
db.exec("DETACH DATABASE src4");
db.exec("DETACH DATABASE src6");
db.exec("DETACH DATABASE src7");
db.exec("DETACH DATABASE src8");
db.exec("DETACH DATABASE src9");
db.exec("VACUUM");
db.close();

console.log('合并完成！');