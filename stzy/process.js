const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// 1. 如果已存在 cleaned.db，先删除，确保每次都是全新
const newDbFile = 'cleaned.db';
if (fs.existsSync(newDbFile)) fs.unlinkSync(newDbFile);

// 2. 连接两个库：原库只读，新库可写
const srcDb = new sqlite3.Database('merged.db', sqlite3.OPEN_READONLY);
const dstDb = new sqlite3.Database(newDbFile);

// 3. 初始化新库表结构（与原表一致即可）
dstDb.serialize(() => {
  // 复制原表结构最简单的方法：先建表，列顺序和类型与原表保持一致
  // 如果原表还有其他索引，可在此一并创建
  dstDb.run(`
    CREATE TABLE questions (
      qid INTEGER PRIMARY KEY,
      q   TEXT,
      d   TEXT,
      k   TEXT,
      f   TEXT,
      m   TEXT
    )
  `);

  // 4. 预编译写入语句
  const stmtInsert = dstDb.prepare(`
    INSERT INTO questions (qid, q, d, k, f, m)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // 5. 从原库读取并写入新库
  let cnt = 0;
  srcDb.each(
    'SELECT qid, q, d, k, f, m FROM questions',
    (err, row) => {
      if (err) {console.log(row.qid);throw err};
      stmtInsert.run(
        row.qid,
        de(row.q),
        row.d,
        row.k,
        row.f,
        row.m
      );

      process.stdout.write(`\r已处理 ${++cnt} 行`);
    },
    (err) => {
      if (err) throw err;

      // 6. 完成
      stmtInsert.finalize(() => {
        dstDb.close();
        srcDb.close();
        console.log(`\n全部 ${cnt} 行已写入 ${newDbFile}`);
        fs.writeFileSync("img.json",JSON.stringify(imgs));
      });
    }
  );
});

// ====== 下面是与原文件相同的 de 函数 ======
var w=0;
var imgs=[];
function de(str0) {
  const entityMap = {
    amp:  '&',
    lt:   '<',
    gt:   '>',
    quot: '"',
    apos: "'"
  };
  var str=str0.replaceAll(/<img.*?src=\"([^ ]+?)\".*?>/g,(a,b)=>{imgs.push(b);return `###img${w++}###`});
  str = str.replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (_, name) =>
    entityMap.hasOwnProperty(name) ? entityMap[name] : _);
  str = str.replace(/&#(\d+);/g, (_, dec) =>
    String.fromCodePoint(parseInt(dec, 10)));
  str = str.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16)));
  return str.replaceAll(/\$[\s\S]+?\$/g,r=>r.replace(/\\[A-z]+/g,'').replaceAll(/[{}]/g,'').slice(1,-1).replaceAll(' ','')).replaceAll(/\<.+?\>/g,' ').replaceAll(/[\s]+/g,' ').replaceAll(/\&.+?\;/g,'');
}