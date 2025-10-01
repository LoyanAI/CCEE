const fs=require('fs')
const Femd = require('femd');
const Femdconfig={
  block:[[/<mermaid>(([\S\s]+?)+)<\/mermaid>/g,(e)=>`<pre class="mermaid">${e[1]}</pre>`]]
}

const { readdirSync, statSync } = require('fs');
const { join } = require('path');

function collectMdSync(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) collectMdSync(full, files);
    else if (st.isFile() && name.endsWith('.md')) files.push([full,name.slice(0,name.indexOf('.'))]);
  }
  return files;
}

var g=collectMdSync('./uploads');
for(var i=0;i<g.length;i++){
    var t=String(fs.readFileSync(g[i][0]));
    fs.writeFileSync(join("./mds/"+g[i][1]+'.html'),(new Femd(t.split('\n').map(e=>e.trim())).toDOM(Femdconfig)).n.join(''))
console.log(i)

}