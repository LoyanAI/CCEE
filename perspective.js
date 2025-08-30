/* 简化版单应矩阵，计算 src → dst 映射 */
function getTransform(src, dst){
  const A=[],b=[];
  for(let i=0;i<4;i++){
    const [sx,sy]=src[i],[dx,dy]=dst[i];
    A.push([sx,sy,1,0,0,0,-sx*dx,-sy*dx]);
    A.push([0,0,0,sx,sy,1,-sx*dy,-sy*dy]);
    b.push(dx,dy);
  }
  // 解 8×8 线性方程
  const h=solve(A,b);
  return [h[0],h[1],h[2],h[3],h[4],h[5],h[6],h[7],1];
}
function warp(srcCanvas, dstCanvas, srcQuad, dstQuad){
  const ctx=dstCanvas.getContext('2d');
  const w=dstCanvas.width, h=dstCanvas.height;
  const H=getTransform(srcQuad, dstQuad);
  ctx.clearRect(0,0,w,h);
  ctx.save();
  ctx.transform(
    H[0], H[3], H[1], H[4], H[2], H[5]
  );
  ctx.drawImage(srcCanvas, 0,0);
  ctx.restore();
}
/* 若不想引 math.js，可把上面换成手搓高斯消元（额外 20 行） */

// solve(A,b)  → 返回解向量 x
function solve(A,b){
  const n=A.length;
  for(let i=0;i<n;i++){
    // 选主元（行交换）
    let max=i;
    for(let k=i+1;k<n;k++) if(Math.abs(A[k][i])>Math.abs(A[max][i])) max=k;
    [A[i],A[max]]=[A[max],A[i]]; [b[i],b[max]]=[b[max],b[i]];
    // 消元
    for(let k=i+1;k<n;k++){
      const f=A[k][i]/A[i][i];
      for(let j=i;j<n;j++) A[k][j]-=f*A[i][j];
      b[k]-=f*b[i];
    }
  }
  // 回代
  const x=new Array(n);
  for(let i=n-1;i>=0;i--){
    x[i]=b[i];
    for(let j=i+1;j<n;j++) x[i]-=A[i][j]*x[j];
    x[i]/=A[i][i];
  }
  return x;
}