import express from 'express';
import multer from 'multer';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 初始化 SQLite
const db = new sqlite3.Database('data.sqlite');
db.run('PRAGMA journal_mode = WAL');

// 目录树表：materialized path
// path 形如 /foo/bar/，根目录是 /
db.exec(`
CREATE TABLE IF NOT EXISTS tree (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT NOT NULL,
  type      TEXT CHECK(type IN ('folder','file')) NOT NULL,
  parent    TEXT,                     -- 父目录完整 path
  path      TEXT NOT NULL UNIQUE,     -- 本节点完整 path
  fileId    TEXT,                     -- 仅文件节点有
  info      TEXT
);
`);

// 建索引方便前缀查询
db.exec(`CREATE INDEX IF NOT EXISTS idx_tree_path ON tree(path);`);

// 确保上传目录
const FILES_DIR = path.join(__dirname, 'files');
if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR);

app.use(express.json());
app.use(express.static('public'));

// 工具：根据 parentPath 生成子 path
function buildPath(parentPath, name, type) {
  const clean = parentPath.replace(/\/+$/, '');
  const next  = `${clean}/${name}`;
  return type === 'folder' ? next + '/' : next;
}

// ------------- API -----------------

// 1. 获取目录树
app.get('/api/tree', (req, res) => {
  const rows = db.prepare(`SELECT * FROM tree ORDER BY path`).all();
  res.json(rows);
});

// 2. 新建文件夹
app.post('/api/folder', (req, res) => {
  const { name, parentPath = '/' } = req.body;
  if (!name) return res.status(400).json({error:'name required'});
  const newPath = buildPath(parentPath, name, 'folder');
  const exists  = db.prepare(`SELECT 1 FROM tree WHERE path = ?`).get(newPath);
  if (exists) return res.status(400).json({error:'folder exists'});
  db.prepare(`INSERT INTO tree (name,type,parent,path) VALUES (?, 'folder', ?, ?)`)
    .run(name, parentPath, newPath);
  res.json({ok:true});
});

// 3. 上传文件
const upload = multer({ dest: FILES_DIR });
app.post('/api/upload', upload.single('file'), (req, res) => {
  const { path: dirPath, name: clientName, info } = req.body;
  console.log({ path: dirPath, name: clientName, info })
  if (!req.file) return res.status(400).json({error:'file missing'});

  // 确保目录存在
  const folderExists = db.prepare(`SELECT 1 FROM tree WHERE path = ? AND type='folder'`).get(dirPath + '/');
  if (!folderExists) return res.status(400).json({error:'directory not found'});

  const id     = uuidv4();
  const newExt = path.extname(req.file.originalname);
  const finalName = clientName || req.file.originalname;
  const newPath = buildPath(dirPath, finalName, 'file');

  // 存文件
  const target = path.join(FILES_DIR, id);
  fs.renameSync(req.file.path, target);

  // 写数据库
  db.prepare(`
    INSERT INTO tree (name,type,parent,path,fileId,info)
    VALUES (?, 'file', ?, ?, ?, ?)
  `).run(finalName, dirPath, newPath, id, info || '');
    console.log({path:newPath})
  res.json({ok:true, path:newPath});
});

// 4. 下载文件
app.get('/api/file/:id', (req, res) => {
  const id = req.params.id;

  db.get(
    'SELECT * FROM tree WHERE fileId = ?',
    [id],
    (err, row) => {
      if (err) return res.status(500).send(err.message);
      if (!row || !row.fileId) return res.status(404).send('file not found');

      const filePath = path.join(FILES_DIR, row.fileId);
      if (!fs.existsSync(filePath)) return res.status(404).send('file missing');

      /*res.setHeader(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodeURIComponent(row.name || 'download')}`
      );*/
      fs.createReadStream(filePath).pipe(res);
    }
  );
});

function gracefulClose() {
  db.close((err) => {
    if (err) console.error(err);
    else console.log('数据库已关闭');
    process.exit(0);
  });
}

// 捕获常见退出信号
process.on('SIGINT',  gracefulClose);   // Ctrl-C
process.on('SIGTERM', gracefulClose);   // kill
process.on('exit',    gracefulClose);   // process.exit()

// 启动
app.listen(PORT, () => console.log(`Server http://localhost:${PORT}`));
