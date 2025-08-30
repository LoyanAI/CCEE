// downloadImages.js
const fs   = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

/**
 * 下载图片到本地
 * @param {string[]} g 图片 URL 数组
 * @param {string} [dir='images'] 保存目录
 */
console.log("")
async function downloadImages(g, dir = 'img') {
  // 确保目录存在
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 并发下载
  tasks=[];
  for(var i=0;i<g.length;i+=4){
    g.slice(i,i+4).forEach((e,j)=>{process.stdout.write(`\r${i+j}/${g.length}`);tasks.push(downloadOne(e,i+j,dir))})
    await Promise.all(tasks);
  }
  return 1;
}

/**
 * 单文件下载
 */
function downloadOne(url, idx, dir) {
  return new Promise((resolve, reject) => {
    // 提取后缀：优先用 url path 中的扩展名；无扩展名时 fallback 到 .jpg
    const parsed = new URL(url);
    const ext = path.extname(parsed.pathname) || '.jpg';
    const fileName = `${idx}${ext}`;
    const filePath = path.join(dir, fileName);

    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filePath);

    client
      .get(url, (res) => {
        if (res.statusCode === 200) {
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(filePath);
          });
        } else {
          file.close();
          fs.unlinkSync(filePath); // 删除空文件
          reject(new Error(`GET ${url} failed: ${res.statusCode}`));
        }
      })
      .on('error', (err) => {
        fs.unlinkSync(filePath);
        reject(err);
      });
  });
}
var b=JSON.parse(String(fs.readFileSync("img.json")));

downloadImages(b,'img')
// ====== 使用示例 ======
// (async () => {
//   const g = [
//     'https://example.com/a.png',
//     'https://example.com/b.jpg?x=1',
//     'https://example.com/c'       // 无后缀
//   ];
//   await downloadImages(g);
//   console.log('全部下载完成');
// })();
