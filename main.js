// 1. 摄像头
navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})
  .then(s=>video.srcObject=s);

// 2. 拍照
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const video=document.getElementById('video');
const okBtn=document.getElementById('ok');
let imgData, quad=[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}], dragIndex=-1;

snap.onclick=()=>{
  canvas.width=video.videoWidth;
  canvas.height=video.videoHeight;
  ctx.drawImage(video,0,0);
  imgData=ctx.getImageData(0,0,canvas.width,canvas.height);

  // 初始化四个角
  const {width:w,height:h}=canvas;
  quad=[{x:w*0.2,y:h*0.2},{x:w*0.8,y:h*0.2},
        {x:w*0.8,y:h*0.8},{x:w*0.2,y:h*0.8}];

  canvas.style.display='inline-block';
  okBtn.style.display='inline-block';
  draw();
};

// 3. 拖拽交互
canvas.onmousedown=e=>{
  const rect=canvas.getBoundingClientRect();
  const x=(e.clientX-rect.left)*canvas.width/rect.width;
  const y=(e.clientY-rect.top)*canvas.height/rect.height;
  dragIndex=quad.findIndex(p=>Math.hypot(p.x-x,p.y-y)<30);
};
canvas.onmousemove=e=>{
  if(dragIndex<0) return;
  const rect=canvas.getBoundingClientRect();
  quad[dragIndex].x=(e.clientX-rect.left)*canvas.width/rect.width;
  quad[dragIndex].y=(e.clientY-rect.top)*canvas.height/rect.height;
  draw();
};
canvas.onmouseup=()=>dragIndex=-1;

function draw(k=true){
  ctx.putImageData(imgData,0,0);
  if(k){
    ctx.strokeStyle='red'; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(quad[0].x,quad[0].y);
    quad.forEach(p=>ctx.lineTo(p.x,p.y));
    ctx.closePath(); ctx.stroke();
    quad.forEach(p=>{
        ctx.beginPath(); ctx.arc(p.x,p.y,8,0,Math.PI*2); ctx.fill();
    });
  }
}

// 4. 纠正并上传
okBtn.onclick=()=>{
  const w=Math.hypot(quad[0].x-quad[1].x,quad[0].y-quad[1].y);
  const h=Math.hypot(quad[0].x-quad[3].x,quad[0].y-quad[3].y);
  draw(false)
  const dstCanvas=document.createElement('canvas');
  dstCanvas.width=w; dstCanvas.height=h;
  const dstQuad=[[0,0],[w,0],[w,h],[0,h]];
  warp(canvas, dstCanvas, quad.map(p=>[p.x,p.y]), dstQuad);
  draw();
  // 显示
  const result=document.getElementById('result');
  result.src=dstCanvas.toDataURL('image/jpeg',0.9);
  result.style.display='block';
  // 上传
  dstCanvas.toBlob(blob=>{
    fetch('/upload',{method:'POST',body:new FormData().append('file',blob,'corrected.jpg')})
      .then(r=>r.json()).then(r=>alert('成功：'+r.url));
  });
};