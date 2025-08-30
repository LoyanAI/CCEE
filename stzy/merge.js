// merge.js
const sqlite3 = require('sqlite3');

const TARGET = 'merged.db';
const SRC1   = 'stzy193.db';
const SRC2   = 'stzy194.db';
const SRC3   = 'stzy195.db';
const SRC4   = 'stzy196.db';
const SRC5   = 'stzy197.db';

const db = new sqlite3.Database(TARGET);

// 1. 挂接源库
db.exec(`ATTACH DATABASE '${SRC1}' AS src1`);
db.exec(`ATTACH DATABASE '${SRC2}' AS src2`);
db.exec(`ATTACH DATABASE '${SRC3}' AS src3`);
db.exec(`ATTACH DATABASE '${SRC4}' AS src4`);
db.exec(`ATTACH DATABASE '${SRC5}' AS src5`);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      qid        TEXT    NOT NULL,
      q          TEXT    NOT NULL,
      d          TEXT,
      k          TEXT,   
      f          TEXT,
      m          TEXT
    )
  `);
});

db.exec(`
  INSERT INTO main.questions(qid, q, d, k, f, m)
  SELECT qid, q, d, k, f, m FROM src1.questions;
  INSERT INTO main.questions(qid, q, d, k, f, m)
  SELECT qid, q, d, k, f, m FROM src2.questions;
  INSERT INTO main.questions(qid, q, d, k, f, m)
  SELECT qid, q, d, k, f, m FROM src3.questions;
  INSERT INTO main.questions(qid, q, d, k, f, m)
  SELECT qid, q, d, k, f, m FROM src4.questions;
  INSERT INTO main.questions(qid, q, d, k, f, m)
  SELECT qid, q, d, k, f, m FROM src5.questions;
`);

db.exec("DETACH DATABASE src1");
db.exec("DETACH DATABASE src2");
db.exec("DETACH DATABASE src3");
db.exec("DETACH DATABASE src5");
db.exec("DETACH DATABASE src4");
db.exec("VACUUM");
db.close();

console.log('合并完成！');