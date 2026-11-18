/** Customer + serving simulation on top of CafeWorld. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {drawAvatar,HAIR_COLORS,SKIN_TONES,APRON_COLORS} from './avatar.js';
const SPOTS=[[3,3],[3,4],[3,5]],SEATS=[[6,4],[6,6],[4,6],[4,8]],DOOR=[0,9],STAFF_X=[2.2,3.6,4.4],DAY_LEN=120;
const DRINKS=[['Iced Americano',5],['Iced Latte',6],['Cappuccino',7],['Iced Mocha',8],['Matcha Latte',8]];
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const texOf=look=>{const c=document.createElement('canvas');c.width=180;c.height=220;drawAvatar(c,look);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t};
const randLook=()=>({gender:rnd(['male','female']),hairStyle:rnd(['bob','short','ponytail']),hair:rnd(HAIR_COLORS),skin:rnd(SKIN_TONES),apron:rnd(APRON_COLORS)});
export class CafeGame{
  constructor(world,save,cb){
    this.w=world;this.s=save;this.cb=cb;this.npcs=[];this.staff=[];this.speed=1;this.id=0;this.t=0;this.dayT=0;this.spawnT=2;this.today={served:0,income:0,lost:0};
    this.looks=[...Array(6)].map(()=>texOf(randLook()));
    this.bub={};['💬','😐','😠','😊','☕'].forEach(e=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.font='44px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,32,36);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;this.bub[e]=t});
    this.syncStaff();
  }
  sprite(tex,w,h){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,alphaTest:.015}));sp.scale.set(w,h,1);sp.renderOrder=4;this.w.scene.add(sp);return sp}
  syncStaff(){while(this.staff.length<this.s.staff){const i=this.staff.length,sp=this.sprite(texOf({...randLook(),apron:APRON_COLORS[(i+1)%4]}),1.2,1.46);sp.position.set(STAFF_X[i],.88,1.15);this.staff.push({cd:2})}}
  setB(n,e){n.bs.material.map=this.bub[e];n.bs.material.needsUpdate=true;n.bs.visible=true}
  spawn(){const n={id:++this.id,x:DOOR[0]+.5,z:DOOR[1]+.5,cell:{x:DOOR[0],z:DOOR[1]},path:[],st:'toQueue',pat:30,goal:-1,seat:null,t:0,drink:rnd(DRINKS),sp:this.sprite(rnd(this.looks),1.1,1.34),bs:this.sprite(this.bub['💬'],.5,.5)};n.bs.visible=false;this.npcs.push(n)}
  leave(n,e){n.st='leave';n.seat=null;n.path=this.w.findPath(n.cell,{x:DOOR[0],z:DOOR[1]});this.setB(n,e)}
  atFront(n){return n.st==='toQueue'&&n.qi===0&&n.cell.x===SPOTS[0][0]&&n.cell.z===SPOTS[0][1]&&!n.path.length}
  serve(by){
    const n=this.npcs.find(n=>this.atFront(n));if(!n)return false;
    const pc=this.w.playerCell;if(by==='you'&&!(pc.z<=4&&pc.x>=1&&pc.x<=5))return 'far';
    const [name,p0]=n.drink,s=this.s,price=Math.round(p0*(1+.15*(s.machine-1)));s.wallet+=price;s.served++;s.xp+=10;if(s.xp>=100*s.lvl){s.xp-=100*s.lvl;s.lvl++;s.wallet+=50*s.lvl;this.cb.toast('Level '+s.lvl+'! Bonus $'+50*s.lvl+' ✦')}this.today.served++;this.today.income+=price;
    s.rep=Math.min(5,s.rep+(n.pat>12?.06:.02));this.cb.toast(`+$${price} · ${name} ☕`);
    const seat=SEATS.find(p=>!this.npcs.some(o=>o.seat===p));
    if(seat){n.st='toSeat';n.seat=seat;n.path=this.w.findPath(n.cell,{x:seat[0],z:seat[1]});this.setB(n,'😊')}else this.leave(n,'😊');
    this.cb.changed();return true;
  }
  walk(n,dt){
    if(n.path.length){const p=n.path[0],tx=p.x+.5,tz=p.z+.5,dx=tx-n.x,dz=tz-n.z,d=Math.hypot(dx,dz),st=2.7*dt;
      if(d<=st){n.x=tx;n.z=tz;n.cell={x:p.x,z:p.z};n.path.shift()}else{n.x+=dx/d*st;n.z+=dz/d*st}n.bob=Math.sin(this.t*12)*.03}else n.bob=0;
    n.sp.position.set(n.x,.8+n.bob,n.z);n.bs.position.set(n.x,1.75,n.z);
  }
  update(dt){
    dt*=this.speed;this.t+=dt;this.dayT+=dt;const s=this.s;if(s.promo>0)s.promo=Math.max(0,s.promo-dt);
    const q=this.npcs.filter(n=>n.st==='toQueue').sort((a,b)=>a.id-b.id);
    this.spawnT-=dt;if(this.spawnT<=0){this.spawnT=(1/((.1+s.rep*.04)*(s.promo>0?1.8:1)))*(.6+Math.random()*.8);if(q.length<SPOTS.length)this.spawn()}
    q.forEach((n,i)=>{n.qi=i;if(n.goal!==i){n.goal=i;n.path=this.w.findPath(n.cell,{x:SPOTS[i][0],z:SPOTS[i][1]})}
      n.pat-=dt;if(this.atFront(n)||n.pat<10)this.setB(n,n.pat>18?'💬':n.pat>8?'😐':'😠');
      if(n.pat<=0){s.rep=Math.max(0,s.rep-.15);this.today.lost++;this.leave(n,'😠')}});
    s.staff&&this.staff.forEach(st=>{st.cd-=dt;if(st.cd<=0)st.cd=this.serve('staff')===true?4.5/(1+.1*s.staff+.2*(s.machine-1)):.5});
    for(const n of this.npcs){
      this.walk(n,dt);
      if(n.st==='toSeat'&&!n.path.length){n.st='sit';n.t=8+Math.random()*6;this.setB(n,'☕')}
      else if(n.st==='sit'){n.t-=dt;if(n.t<=0){const tip=1+Math.floor(s.rep);s.wallet+=tip;this.today.income+=tip;this.leave(n,'😊');this.cb.changed()}}
      else if(n.st==='leave'&&!n.path.length)n.dead=true;
    }
    this.npcs=this.npcs.filter(n=>{if(n.dead){this.w.scene.remove(n.sp,n.bs);n.sp.material.dispose();n.bs.material.dispose()}return!n.dead});
    if(this.dayT>=DAY_LEN)this.endDay();
  }
  endDay(){const wages=this.s.staff*40;this.s.wallet=Math.max(0,this.s.wallet-wages);const r={day:this.s.day,...this.today,wages};this.s.day++;this.today={served:0,income:0,lost:0};this.dayT=0;this.cb.dayEnd(r);this.cb.changed()}
  snapshot(){return {queue:this.npcs.filter(n=>n.st==='toQueue').length,seated:this.npcs.filter(n=>n.st==='sit').length,left:Math.max(0,Math.round(DAY_LEN-this.dayT)),...this.today}}
}
