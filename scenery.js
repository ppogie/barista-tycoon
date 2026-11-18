/** Warm brick-café styling, glass wall, neighbour shops and street around the café. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.85,...o});
const B=(g,w,h,d,c,x,y,z,o={})=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c,o));m.position.set(x,y,z);m.castShadow=!o.transparent;m.receiveShadow=true;g.add(m);return m};
const Cy=(g,rt,rb,h,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,14),M(c));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m};
const Sp=(g,r,c,x,y,z,sy=1)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),M(c));m.position.set(x,y,z);m.scale.y=sy;m.castShadow=true;g.add(m);return m};
const tex=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t};
const pl=(g,t,w,h,x,y,z,ry=0)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));m.position.set(x,y,z);m.rotation.y=ry;g.add(m);return m};
const light=(g,x,y,z,c,i,d)=>{const l=new THREE.PointLight(c,i,d);l.position.set(x,y,z);g.add(l)};
const text=(w,h,bg,fg,font,lines)=>tex(w,h,(x,W,H)=>{if(bg){x.fillStyle=bg;x.fillRect(0,0,W,H)}x.fillStyle=fg;x.font=font;x.textAlign='center';x.textBaseline='middle';lines.forEach(([t,y])=>x.fillText(t,W/2,y))});
const SHOPS=[['BOOKS','#2f4858','#ffd9a0',0x7a4e3a],['BAKERY','#a4533c','#fff1d6',0xe3b9a0],['RAMEN','#3a2a3f','#ff9b7a',0x5f4b6e],['FLOWERS','#3f6b52','#ffe3ec',0xb7d1b0],['ARCADE','#2b2f6b','#7df9ff',0x4a4e9a],['TEA HOUSE','#5a6b3a','#fff6cf',0xa9b57d]];

export function buildWalls(g,size){
  const bt=tex(128,64,(x,w,h)=>{x.fillStyle='#7a432c';x.fillRect(0,0,w,h);for(let r=0;r<4;r++)for(let c=-1;c<4;c++){x.fillStyle=['#a45f3f','#9a5638','#b26a47'][(r+c+4)%3];x.fillRect(c*32+(r%2?16:0)+1,r*16+1,30,14)}});
  bt.wrapS=bt.wrapT=THREE.RepeatWrapping;bt.repeat.set(size*.55,1.7);
  const wall=new THREE.Mesh(new THREE.PlaneGeometry(size+.3,2.5),new THREE.MeshStandardMaterial({map:bt,roughness:.9}));wall.position.set(size/2,1.25,.03);wall.receiveShadow=true;g.add(wall);
  B(g,size+.3,2.5,.2,0x7a432c,size/2,1.25,-.1);B(g,size+.5,.16,.4,0x3b2f33,size/2,2.55,-.1);
  // neon sign + menu board
  const nx=size*.72;
  pl(g,tex(512,200,(x,w,h)=>{x.font='italic 700 120px Fredoka,sans-serif';x.textAlign='center';x.textBaseline='middle';x.shadowColor='#ff8a2a';x.shadowBlur=30;x.fillStyle='#ffe2b0';x.fillText('Coffee',w/2,h/2);x.shadowBlur=10;x.fillText('Coffee',w/2,h/2)}),3.6,1.4,nx,1.55,.06);
  light(g,nx,1.7,1.4,0xff9a4a,10,9);
  const items=[['Americano','$5'],['Latte','$6'],['Cappuccino','$7'],['Mocha','$8'],['Matcha Latte','$8']];
  B(g,1.7,1.45,.08,0x4a3a2f,4.9,1.55,.07);
  pl(g,tex(256,230,(x,w,h)=>{x.fillStyle='#262226';x.fillRect(0,0,w,h);x.fillStyle='#f2c46d';x.font='700 30px Fredoka,sans-serif';x.fillText('MENU',24,34);x.fillStyle='#f4efe6';x.font='22px Fredoka,sans-serif';items.forEach(([n,p],i)=>{x.textAlign='left';x.fillText(n,24,76+i*30);x.textAlign='right';x.fillText(p,w-24,76+i*30)})}),1.55,1.3,4.9,1.55,.12);
  // shelves with jars
  for(const y of [.95,1.65]){B(g,2.8,.07,.45,0x7a4e2d,2.4,y,.3);for(let k=0;k<8;k++)Cy(g,.09,.09,.26,['#d9b27a','#c97f5a','#8a6a4a','#e8d6b8'][k%4],1.2+k*.34,y+.17,.3)}
  B(g,.07,1.2,.4,0x5a3a22,1.0,1.3,.3);B(g,.07,1.2,.4,0x5a3a22,3.8,1.3,.3);
  // pendant lamps
  for(const x of [2.6,4.6]){Cy(g,.012,.012,.7,0x222222,x,2.2,2.2);const c=new THREE.Mesh(new THREE.ConeGeometry(.28,.28,16,1,true),M(0x2b2b2f,{side:THREE.DoubleSide}));c.position.set(x,1.8,2.2);g.add(c);Sp(g,.09,0xfff0c0,x,1.72,2.2);light(g,x,1.6,2.4,0xffd9a0,5,7)}
  // glass left wall with door gap (z 8 to 9.8)
  for(const [a,b] of [[0,8],[9.8,size]]){if(b<=a)continue;const len=b-a,mid=(a+b)/2;
    B(g,.05,2.3,len,0xa9dcef,-.03,1.2,mid,{transparent:true,opacity:.2,roughness:.1});B(g,.14,.12,len,0x2b2e36,-.03,2.45,mid);B(g,.14,.12,len,0x2b2e36,-.03,.06,mid)}
  for(let z=0;z<=size;z+=2)if(z<7.9||z>9.9)B(g,.12,2.45,.1,0x2b2e36,-.03,1.22,z);
  B(g,.14,2.45,.12,0x2b2e36,-.03,1.22,8);B(g,.14,2.45,.12,0x2b2e36,-.03,1.22,9.8);B(g,.14,.14,1.9,0x2b2e36,-.03,2.4,8.9);
  B(g,1.1,.03,1.6,0x8c3b3b,.9,.08,8.9);
}
function shop(g,win,i,cx,cz,w,d,h,face){
  const [n,bg,fg,col]=SHOPS[i%SHOPS.length],z=face==='z',ry=z?0:Math.PI/2,wd=z?w:d,fx=cx+(z?0:w/2+.03),fz=cz+(z?d/2+.03:0);
  B(g,w,h,d,col,cx,h/2,cz);B(g,w+.2,.25,d+.2,0x3a3036,cx,h+.12,cz);
  pl(g,text(256,80,bg,fg,'700 38px Fredoka,sans-serif',[[n,42]]),Math.min(wd*.7,3.4),1,fx,h*.62,fz,ry);
  for(const k of [-.27,.27])pl(g,win,wd*.4,1.3,fx+(z?k*wd:0),1.1,fz+(z?0:k*wd),ry);
  z?B(g,wd*.9,.12,.9,parseInt(fg.slice(1),16),fx,2.1,fz+.4):B(g,.9,.12,wd*.9,parseInt(fg.slice(1),16),fx+.4,2.1,fz);
}
export function buildSurroundings(g,size){
  const win=tex(64,64,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#ffe2a8');gr.addColorStop(1,'#ffb86b');x.fillStyle=gr;x.fillRect(0,0,w,h);x.fillStyle='#3a2c28';x.fillRect(w/2-2,0,4,h);x.fillRect(0,h/2-2,w,4)});
  B(g,size+16,.2,size+16,0xcdbfa8,size/2,-.18,size/2);
  B(g,size+9.5,.06,4.6,0x454854,(size+4.5)/2,-.06,size+5.6);
  for(let x=-2;x<size+7;x+=2)B(g,1,.02,.14,0xf3e6b0,x,-.02,size+5.6);
  let xx=-7,i=0;while(xx<size+7){const w=3.6+(i%3)*.7;shop(g,win,i,xx+w/2,-4.7,w,4.4,4.2+(i*7%3),'z');xx+=w+.15;i++}
  let zz=-2.5;while(zz<size+2.8){const d=3.4+(i%3)*.6;shop(g,win,i+2,-4.7,zz+d/2,4.4,d,4.2+(i*5%3),'x');zz+=d+.15;i++}
  const tree=(x,z,s=1)=>{Cy(g,.1*s,.14*s,1.3*s,0x6b4a35,x,.65*s,z);Sp(g,.9*s,0x6f9a5f,x,2.1*s,z,.9);Sp(g,.65*s,0x86ad6c,x+.3*s,2.6*s,z-.1,.9)};
  const lamp=(x,z)=>{Cy(g,.04,.05,2.2,0x2b2e36,x,1.1,z);Sp(g,.14,0xfff0c0,x,2.3,z);light(g,x,2.3,z,0xffd9a0,4,6)};
  for(let x=-1;x<size+6;x+=3.5)tree(x,size+2.6,.9+(x*3%3)*.05);
  for(let z=0;z<size;z+=3.5)tree(size+2.6,z,.9+(z%3)*.05);
  for(let x=1;x<size+5;x+=7)lamp(x,size+2.1);for(let z=3;z<size;z+=7)lamp(size+2.1,z);
  B(g,size,.45,.08,0x2d2a31,size/2,.3,size+.05);B(g,.08,.45,size,0x2d2a31,size+.05,.3,size/2);
  const pot=(x,z)=>{B(g,.9,.4,.5,0x5a4636,x,.25,z);for(let k=-1;k<=1;k++)Sp(g,.2,k?0x6f9a5f:0x86ad6c,x+k*.28,.55,z,.9);Sp(g,.07,0xf29bb4,x+.2,.72,z+.1)};
  for(let x=1.2;x<size;x+=2.6)pot(x,size-.35);for(let z=1.2;z<size;z+=2.6)pot(size-.3,z);
}
export function buildDecor(w){
  const g=w.furniture;
  // glass pastry display next to the counter
  B(g,.95,.5,.7,0x7a4e2d,5.65,.28,2.2);B(g,.9,.5,.65,0xcfe8f2,5.65,.78,2.2,{transparent:true,opacity:.35,roughness:.1});
  for(let k=0;k<4;k++)Sp(g,.12,['#e8b878','#d99a5a'][k%2]==='#e8b878'?0xe8b878:0xd99a5a,5.4+k*.16,.6,2.2,.6);
  // sofa + coffee table
  B(g,.9,.35,1.9,0x8a4b34,.8,.3,4.2);B(g,.25,.75,1.9,0x7a3f2b,.35,.62,4.2);B(g,.9,.55,.18,0x7a3f2b,.8,.45,3.2);B(g,.9,.55,.18,0x7a3f2b,.8,.45,5.2);B(g,.8,.3,1,0x6b4a35,1.9,.28,4.2);
  // A-frame chalkboard near the door
  B(g,.9,1,.07,0x2b2e36,1.5,.55,7.4).rotation.y=Math.PI/4;
  pl(g,text(180,200,'#262226','#f4efe6','600 26px Fredoka,sans-serif',[['Good',60],['Coffee',100],['Good Mood',140]]),.8,.9,1.53,.55,7.43,Math.PI/4);
  [[5,2],[0,3],[1,3],[0,4],[1,4],[1,7]].forEach(([x,z])=>w.blocked.add(`${x},${z}`));
}
