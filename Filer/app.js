// app.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // 前端页面

// 确保目录
fs.ensureDirSync('uploads');

// 数据库初始化
const db = new sqlite3.Database('data/files.db');
db.serialize(() => {
  // 文件实体表（只存一份）
  db.run(`CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE,
            originalName TEXT,
            size INTEGER,
            type TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

  // 文件夹表
  db.run(`CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            parentId INTEGER REFERENCES folders(id) ON DELETE CASCADE
          )`);

  // 文件-文件夹多对多关系
  db.run(`CREATE TABLE IF NOT EXISTS fileFolders (
            fileUuid TEXT,
            folderId INTEGER,
            PRIMARY KEY (fileUuid, folderId)
          )`);

  // 标签表
  db.run(`CREATE TABLE IF NOT EXISTS tags (
            fileUuid TEXT,
            tag TEXT,
            PRIMARY KEY (fileUuid, tag)
          )`);
});

// 生成唯一文件名
const uuid = () => crypto.randomBytes(16).toString('hex');

// multer 配置：限制 3 MB
const upload = multer({
  dest: 'uploads/tmp',
  limits: { fileSize: 3 * 1024 * 1024 },
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads'),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, uuid() + ext);
    }
  })
});

// ---------- API 路由 ----------

// 1. 获取所有文件夹
app.get('/api/folders', (req, res) => {
  db.all(`SELECT f.id, f.name, COUNT(ff.folderId) AS fileCount
          FROM folders f
          LEFT JOIN fileFolders ff ON f.id = ff.folderId
          GROUP BY f.id`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ folders: rows });
  });
});

// POST /api/folders
app.post('/api/folders', (req, res) => {
  const { name, parentId = null } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  db.run('INSERT INTO folders (name, parentId) VALUES (?, ?)', [name, parentId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});
// GET /api/folders/tree
app.get('/api/folders/tree', (req, res) => {
  db.all(`SELECT id, name, parentId FROM folders`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const map = {};
    const roots = [];
    rows.forEach(f => {
      map[f.id] = { ...f, children: [] };
    });
    rows.forEach(f => {
      if (f.parentId) map[f.parentId].children.push(map[f.id]);
      else roots.push(map[f.id]);
    });
    res.json({ tree: roots });
  });
});
// 1. 上传：支持多文件夹
app.post('/api/files/upload', upload.array('files'), (req, res) => {
  const folders = req.body.folders || [];          // 可能为数组
  const folderArr = Array.isArray(folders) ? folders : [folders].filter(Boolean);
  const inserted = [];
  let done = 0;
  if (!req.files.length) return res.status(400).json({ error: 'no files' });

  req.files.forEach(file => {
    const uid = path.basename(file.filename, path.extname(file.filename));
    db.run(`INSERT INTO files (uuid, originalName, size, type)
            VALUES (?, ?, ?, ?)`,
      [uid, file.originalname, file.size, file.mimetype],
      function (err) {
        if (err) return ++done === req.files.length && finish();
        // 批量绑定文件夹
        const stmt = db.prepare('INSERT OR IGNORE INTO fileFolders (fileUuid, folderId) VALUES (?, ?)');
        folderArr.forEach(fid => stmt.run(uid, fid));
        stmt.finalize(() => {
          inserted.push(uid);
          ++done === req.files.length && finish();
        });
      });
  });

  function finish() {
    res.json({ count: inserted.length });
  }
});

// 2. 移动：支持多文件夹（全量替换，保持幂等）
// 1. 复制到文件夹（增量，不删除旧绑定）
app.post('/api/files/:id/copy-to-folders', (req, res) => {
  const uid = req.params.id;
  const { folderIds } = req.body;          // 要复制到的文件夹 ID 数组
  if (!Array.isArray(folderIds) || !folderIds.length)
    return res.status(400).json({ error: 'folderIds array required' });

  const stmt = db.prepare(
    'INSERT OR IGNORE INTO fileFolders (fileUuid, folderId) VALUES (?, ?)'
  );
  folderIds.forEach(fid => stmt.run(uid, fid));
  stmt.finalize(function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: 1 });
  });
});

// 2. 从指定文件夹移除（支持多文件夹）
app.post('/api/files/:id/remove-from-folder', (req, res) => {
  const uid = req.params.id;
  const { folderIds } = req.body;          // 要移除的文件夹 ID 数组
  if (!Array.isArray(folderIds) || !folderIds.length)
    return res.status(400).json({ error: 'folderIds array required' });

  const placeholders = folderIds.map(() => '?').join(',');
  db.run(
    `DELETE FROM fileFolders WHERE fileUuid = ? AND folderId IN (${placeholders})`,
    [uid, ...folderIds],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ok: 1, removed: this.changes });
    }
  );
});

// 3. 文件列表：返回多文件夹
app.get('/api/files', (req, res) => {
  const folder = req.query.folder;
  let sql = `SELECT f.uuid AS id, f.originalName AS name, f.size, f.type,
                    GROUP_CONCAT(DISTINCT t.tag) AS tags,
                    GROUP_CONCAT(DISTINCT ff.folderId || ':' || fd.name) AS folderCols
             FROM files f
             LEFT JOIN tags t ON f.uuid = t.fileUuid
             LEFT JOIN fileFolders ff ON f.uuid = ff.fileUuid
             LEFT JOIN folders fd ON ff.folderId = fd.id`;
  const params = [];
  if (folder && folder !== 'all') {
    sql += ` WHERE f.uuid IN (SELECT fileUuid FROM fileFolders WHERE folderId = ?)`;
    params.push(folder);
  }
  sql += ` GROUP BY f.uuid ORDER BY f.createdAt DESC`;
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    rows.forEach(r => {
      r.tags = r.tags ? r.tags.split(',') : [];
      // 把 "1:笔记,2:图片" 拆成对象数组
      r.folders = r.folderCols
        ? r.folderCols.split(',').map(c => {
            const [id, name] = c.split(':');
            return { id: Number(id), name };
          })
        : [];
    });
    res.json({ files: rows });
  });
});
// 获取指定文件夹的直接子文件夹
app.get('/api/folders/children/:id', (req, res) => {
  const parentId = req.params.id;
  db.all('SELECT id, name FROM folders WHERE parentId = ? ORDER BY name', [parentId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ folders: rows });
  });
});
// 5. 文件内容预览（文本直接返回，图片返回 base64）
app.get('/api/files/:id/content', (req, res) => {
  const uid = req.params.id;
  db.get('SELECT * FROM files WHERE uuid = ?', [uid], (err, file) => {
    if (err || !file) return res.status(404).json({ error: 'file not found' });

    const ext = path.extname(file.originalName).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
    const diskPath = path.join('uploads', file.uuid + ext);

    fs.readFile(diskPath, (err, data) => {
      if (err) return res.status(500).json({ error: err.message });

      if (isImage) {
        // 图片：直接二进制
        res.set('Content-Type', file.type || 'image/jpeg');
        return res.send(data); // 二进制
      } else {
        // 文本：utf-8 字符串
        res.set('Content-Type', 'text/plain; charset=utf-8');
        return res.send(data.toString('utf-8'));
      }
    });
  });
});

// 6. 重命名
app.post('/api/files/:id/rename', (req, res) => {
  const uid = req.params.id;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  db.run('UPDATE files SET originalName = ? WHERE uuid = ?', [name, uid], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: 1 });
  });
});

// 7. 删除文件（同时清理关系表 & 实体）
app.delete('/api/files/:id', (req, res) => {
  const uid = req.params.id;
  db.get('SELECT * FROM files WHERE uuid = ?', [uid], (err, file) => {
    if (err || !file) return res.status(404).json({ error: 'file not found' });
    const diskPath = path.join('uploads', file.uuid + path.extname(file.originalName));
    fs.remove(diskPath, () => { /* 忽略实体删除失败 */ });
    db.serialize(() => {
      db.run('DELETE FROM fileFolders WHERE fileUuid = ?', [uid]);
      db.run('DELETE FROM tags WHERE fileUuid = ?', [uid]);
      db.run('DELETE FROM files WHERE uuid = ?', [uid], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ ok: 1 });
      });
    });
  });
});


// 9. 标签保存（全量覆盖）
app.post('/api/files/:id/tags', (req, res) => {
  const uid = req.params.id;
  const { tags } = req.body; // 数组
  db.serialize(() => {
    db.run('DELETE FROM tags WHERE fileUuid = ?', [uid]);
    const stmt = db.prepare('INSERT OR IGNORE INTO tags (fileUuid, tag) VALUES (?, ?)');
    tags.forEach(tag => stmt.run(uid, tag));
    stmt.finalize(function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ok: 1 });
    });
  });
});

// ---------- 启动 ----------
app.listen(PORT, () => {
  console.log(`File manager server running at http://localhost:${PORT}`);
});