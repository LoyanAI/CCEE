const Database = require('better-sqlite3');
const fs = require('fs');

const newDbFile = 'cleaned2.db';
if (fs.existsSync(newDbFile)) fs.unlinkSync(newDbFile);

const srcDb = new Database('cleaned.db', { readonly: true });
const dstDb = new Database(newDbFile);

dstDb.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      qid        TEXT    NOT NULL,
      q          TEXT    NOT NULL
    )
  `);

const stmt = dstDb.prepare(`
  INSERT INTO questions (qid, q)
  VALUES (?, ?)
`);

const rows = srcDb.prepare('SELECT qid,q FROM questions').all();

console.log(`共读取 ${rows.length} 行，开始写入...`);

const start = Date.now();
dstDb.exec('BEGIN TRANSACTION');
rows.forEach((row, idx) => {
  stmt.run(
    row.qid,
    row.q
  );
  process.stdout.write(`\r已写入 ${idx} 行`);
  
});

const end = Date.now();
console.log(`\n写入完成，耗时 ${(end - start) / 1000} 秒`);
dstDb.exec('COMMIT');
srcDb.close();
dstDb.close();