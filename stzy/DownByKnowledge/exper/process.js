const Database = require('better-sqlite3');
const fs = require('fs');

const newDbFile = 'cleaned.db';
if (fs.existsSync(newDbFile)) fs.unlinkSync(newDbFile);

const srcDb = new Database('merged.db', { readonly: true });
const dstDb = new Database(newDbFile);

dstDb.exec(`
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

const stmt = dstDb.prepare(`
  INSERT INTO questions (qid, q, d, k, type, area, f, m)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const rows = srcDb.prepare('SELECT qid,q,d,k,type,area,f,m FROM questions').all();

console.log(`共读取 ${rows.length} 行，开始写入...`);

const start = Date.now();
dstDb.exec('BEGIN TRANSACTION');
rows.forEach((row, idx) => {
  stmt.run(
    row.qid,
    de(row.q),
    row.d,
    row.k,
    row.type,
    row.area,
    row.f,
    row.m
  );
  process.stdout.write(`\r已写入 ${idx} 行`);
  
});

const end = Date.now();
console.log(`\n写入完成，耗时 ${(end - start) / 1000} 秒`);
dstDb.exec('COMMIT');
srcDb.close();
dstDb.close();
// ====== 下面是与原文件相同的 de 函数 ======
function de(str0) {
  const entityMap = {
    amp:  '&',
    lt:   '<',
    gt:   '>',
    quot: '"',
    apos: "'"
  };
  var str = str0.replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (_, name) =>
    entityMap.hasOwnProperty(name) ? entityMap[name] : _);
  str = str.replace(/&#(\d+);/g, (_, dec) =>
    String.fromCodePoint(parseInt(dec, 10)));
  str = str.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16)));
  return str.replaceAll(/\$[\s\S]+?\$/g,r=>r.replace(/\\[A-z]+/g,'').replaceAll(/[{}]/g,'').slice(1,-1).replaceAll(' ','')).replaceAll(/\<.+?\>/g,' ').replaceAll(/[\s]+/g,' ').replaceAll(/\&.+?\;/g,'').replace(/^[\s]*?[0-9]+[.．][\s]*/g,'');
}