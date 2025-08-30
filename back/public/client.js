// 获取目录树
async function loadTree() {
  const res = await fetch('/api/tree');
  const rows = await res.json();

  // 构造嵌套结构
  const root = {name:'/',children:[],type:'folder',path:'/'};
  const map  = {'/':root};
  for (const n of rows) {
    if (n.type === 'folder' && !map[n.path]) {
      map[n.path] = {name:n.name, children:[], type:'folder', path:n.path};
    }
  }
  for (const n of rows) {
    if (n.type === 'file') {
      const parentPath = n.parent + '/';
      const parent = map[parentPath];
      if (parent) parent.children.push({...n, type:'file'});
    } else {
      const parentPath = (n.path.endsWith('/') ? n.path.slice(0,-1) : n.path).split('/').slice(0,-1).join('/') + '/';
      const parent = map[parentPath];
      if (parent) parent.children.push(map[n.path]);
    }
  }
  renderTree(root, document.getElementById('tree'));
}

function renderTree(node, container) {
  const ul = document.createElement('ul');
  const li = document.createElement('li');
  li.textContent = node.name;
  li.className   = node.type === 'folder' ? 'folder' : '';
  if (node.type === 'file') {
    li.onclick = () => window.open(`/api/file/${node.fileId}`);
  }
  ul.appendChild(li);
  if (node.children && node.children.length) {
    const inner = document.createElement('ul');
    node.children.forEach(c => renderTree(c, inner));
    li.appendChild(inner);
  }
  container.appendChild(ul);
}

// 新建文件夹
async function createFolder() {
  const name = document.getElementById('newFolderName').value;
  const parent = document.getElementById('newFolderParent').value || '/';
  await fetch('/api/folder', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name, parentPath: parent})
  });
  document.getElementById('newFolderName').value='';
  loadTree();
}

// 上传
document.getElementById('uploadForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  await fetch('/api/upload', {method:'POST', body:fd});
  form.reset();
  loadTree();
});

// 初始加载
loadTree();