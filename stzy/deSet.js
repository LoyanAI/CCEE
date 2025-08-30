// dedup.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('merged.db');

db.serialize(() => {
  // 1. 把要保留的 id 先挑出来（每组 qid 保留最小的 id）
  db.exec(`
    DELETE FROM questions
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM questions
      GROUP BY qid
    );
  `);

  // 2. 整理空间（可选）
  db.exec('VACUUM');
  console.log('去重完成！');
});

db.close();