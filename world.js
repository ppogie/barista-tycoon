/**
 * Isometric 2.5D café. The shop is actual 3D geometry, while our anime avatar
 * is a transparent 2D sprite: this is intentional 2.5D rendering.
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {buildWalls,buildSurroundings,buildDecor} from './scenery.js';

const palette={wood:0xa67458,woodDark:0x735244,cream:0xffe6c5,ceramic:0xf9f2eb,pink:0xdba5aa,leaf:0x739078,iron:0xc8c7c5};
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.85,...extra});
const box=(w,h,d,color)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));
const cyl=(rt,rb,h,color,segments=24)=>new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),mat(color));

function addBox(group,w,h,d,color,x,y,z){const m=box(w,h,d,color);m.position.set(x,y,z);group.add(m);return m}
function addCyl(group,top,bottom,height,color,x,y,z){const m=cyl(top,bottom,height,color);m.position.set(x,y,z);group.add(m);return m}

export class CafeWorld {
  constructor(container,{onMove}={}){
    this.container=container;this.onMove=onMove||(()=>{});this.size=10;
    this.active=true;this.keys=new Set();this.path=[];this.playerCell={x:7,z:8};this.walkSpeed=3.1;
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#e9cda5');this.scene.fog=new THREE.Fog('#e9cda5',34,70);
    this.camera=new THREE.OrthographicCamera(-8,8,8,-8,.1,130);
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled=true;
    this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.renderer.domElement.setAttribute('aria-label','Kedai café 3D isometric. Tap pada tiles untuk bergerak.');
    container.appendChild(this.renderer.domElement);
    this.scene.add(new THREE.HemisphereLight(0xffe9c8,0xb98f6c,2.1));
    const sun=new THREE.DirectionalLight(0xffd9a6,2.3);sun.position.set(-3,15,9);sun.castShadow=true;
    sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-19;sun.shadow.camera.right=19;sun.shadow.camera.top=19;sun.shadow.camera.bottom=-19;
    sun.shadow.normalBias=.035;this.scene.add(sun);
    const ground=box(90,.12,90,0xb9a98f);ground.position.y=-.32;ground.receiveShadow=true;this.scene.add(ground);
    this.floor=new THREE.Group();this.scene.add(this.floor);
    this.furniture=new THREE.Group();this.scene.add(this.furniture);
    this.blocked=new Set();
    this.avatarSprite=new THREE.Sprite(new THREE.SpriteMaterial({color:0xffffff,transparent:true,depthWrite:false,alphaTest:.015}));
    this.avatarSprite.scale.set(1.45,1.78,1);this.avatarSprite.renderOrder=5;this.scene.add(this.avatarSprite);
    const sh=new THREE.Mesh(new THREE.CircleGeometry(.31,24),new THREE.MeshBasicMaterial({color:0x7a4a41,transparent:true,opacity:.21,depthWrite:false}));
    sh.rotation.x=-Math.PI/2;sh.position.y=.14;this.scene.add(sh);this.shadow=sh;
    const highlight=new THREE.Mesh(new THREE.PlaneGeometry(.93,.93),new THREE.MeshBasicMaterial({color:0xf6a7bf,transparent:true,opacity:.36,side:THREE.DoubleSide,depthWrite:false}));
    highlight.rotation.x=-Math.PI/2;highlight.position.y=.166;highlight.visible=false;this.scene.add(highlight);this.highlight=highlight;
    this.pickPlane=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));
    this.pickPlane.rotation.x=-Math.PI/2;this.pickPlane.position.set(0,.175,0);this.scene.add(this.pickPlane);
    this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();
    this.buildFloor(10);this.buildFurniture();this.setPlayerCell(7,8,false);
    this._pointerMove=(ev)=>this.handlePointer(ev,false);
    this._pointerDown=(ev)=>this.handlePointer(ev,true);
    this._keyDown=(ev)=>{if(!this.active)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(ev.key)) {this.keys.add(ev.key.toLowerCase());ev.preventDefault()}};
    this._keyUp=(ev)=>this.keys.delete(ev.key.toLowerCase());
    this.renderer.domElement.addEventListener('pointermove',this._pointerMove);
    this.renderer.domElement.addEventListener('pointerdown',this._pointerDown);
    window.addEventListener('keydown',this._keyDown);window.addEventListener('keyup',this._keyUp);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);
    this._last=performance.now();this._clock=0;this._frame=requestAnimationFrame(t=>this.tick(t));this.resize();
  }
  buildFloor(size){
    this.size=size;while(this.floor.children.length){const o=this.floor.children[0];this.floor.remove(o);o.traverse(child=>{if(child.geometry)child.geometry.dispose()})}
    const frame=box(size+.55,.17,size+.55,0xb17b61);frame.position.set(size/2,-.13,size/2);frame.receiveShadow=true;this.floor.add(frame);
    const tileGeo=new THREE.BoxGeometry(.987,.11,.987);
    const m1=mat(0xe2c59a),m2=mat(0xd9b98c),m3=mat(0xe6cfa6);
    for(let z=0;z<size;z++)for(let x=0;x<size;x++){
      const mesh=new THREE.Mesh(tileGeo,(x+z)%9===0?m3:(x+z)%2?m1:m2);
      mesh.position.set(x+.5,.005,z+.5);mesh.receiveShadow=true;this.floor.add(mesh);
    }
    this.buildEnv(size);
    this.positionCamera();
  }
  buildEnv(size){if(this.env)this.scene.remove(this.env);this.env=new THREE.Group();this.scene.add(this.env);buildWalls(this.env,size);buildSurroundings(this.env,size)}
  buildFurniture(){
    // Espresso counter and machine
    const counter=new THREE.Group();counter.position.set(3.2,0,2.2);this.furniture.add(counter);
    addBox(counter,3.05,.92,1.07,palette.wood,0,.49,0);
    addBox(counter,3.24,.12,1.23,0xf6e4cb,0,1.0,0);
    for(const x of [-1.2,1.2])addBox(counter,.18,.74,.09,palette.woodDark,x,.48,.57);
    addBox(counter,.95,.55,.62,palette.iron,-.58,1.33,-.04);
    addBox(counter,.83,.08,.65,0x918c8d,-.58,1.65,-.04);
    addBox(counter,.66,.27,.15,0x56535a,-.58,1.34,.32);
    addCyl(counter,.13,.15,.2,0x3c3a42,.45,1.2,-.11);
    addCyl(counter,.13,.14,.06,0xe7d7c5,.45,1.32,-.11);
    for(let i=0;i<3;i++)addCyl(counter,.11,.075,.19,0xfaf1e7,.89+i*.18,1.17,.25);
    addBox(counter,.25,.55,.28,0x827c7b,1.18,1.33,-.15); // grinder
    // 2 little dining setups
    this.addTable(6.7,5.3);this.addTable(3.8,7.2);
    this.addPlant(8.9,1.3,1);this.addPlant(1.15,5.65,.94);this.addPlant(8.9,8.7,1.12);
    buildDecor(this);
    // walkway map - furniture should not be walked through
    [[2,2],[3,2],[4,2],[6,5],[7,5],[3,7],[4,7],[9,1],[1,5],[9,9]].forEach(([x,z])=>this.blocked.add(`${x},${z}`));
  }
  addTable(x,z){
    const t=new THREE.Group();t.position.set(x,0,z);this.furniture.add(t);
    addCyl(t,.08,.13,.56,palette.woodDark,0,.36,0);
    addCyl(t,.66,.66,.1,0xe8bc91,0,.69,0);
    addCyl(t,.17,.17,.025,0xf9f1e9,.05,.76,-.07);
    addCyl(t,.09,.09,.05,0xa77858,.05,.80,-.07);
    for(const dir of [-1,1]){const s=new THREE.Group();s.position.set(.02,0,dir*1.04);t.add(s);
      addBox(s,.65,.14,.52,0xa97962,0,.46,0);
      addBox(s,.65,.6,.12,0xad8269,0,.78,dir*.19);
      for(const side of [-.24,.24])addBox(s,.07,.46,.07,0x7e6351,side,.23,0);
    }
  }
  addPlant(x,z,scale){const p=new THREE.Group();p.position.set(x,0,z);p.scale.setScalar(scale);this.furniture.add(p);
    addCyl(p,.3,.22,.48,0xc48e76,0,.3,0);addCyl(p,.27,.27,.04,0x775c45,0,.54,0);
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const leaf=new THREE.Mesh(new THREE.SphereGeometry(.26,9,7),mat(i%2?0x72957b:0x90aa80));leaf.position.set(Math.cos(a)*.22,.83+(.1*(i%3)),Math.sin(a)*.22);leaf.scale.set(.75,1.1,.65);p.add(leaf)}
  }
  updateAvatar(canvas){
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    if(this.avatarSprite.material.map)this.avatarSprite.material.map.dispose();
    this.avatarSprite.material.map=texture;this.avatarSprite.material.needsUpdate=true;
  }
  setPlayerCell(x,z,notify=true){
    x=Math.max(0,Math.min(this.size-1,Math.floor(x)));z=Math.max(0,Math.min(this.size-1,Math.floor(z)));
    if(this.blocked.has(`${x},${z}`)){x=7;z=8}
    this.playerCell={x,z};this.avatarSprite.position.set(x+.5,1.00,z+.5);this.shadow.position.set(x+.5,.14,z+.5);this.path=[];
    if(notify)this.onMove(x,z);
  }
  setActive(active){this.active=!!active;this.keys.clear();this.highlight.visible=false;this.resize()}
  positionCamera(){
    const center=this.size/2;this.camera.position.set(center+this.size*.95,this.size*1.2,center+this.size*.95);
    this.camera.lookAt(center,.8,center);this.camera.zoom=this.size<=10?1:this.size===15?.9:.82;this.camera.updateProjectionMatrix();this.resize();
  }
  resize(){if(!this.container)return;const w=this.container.clientWidth,h=this.container.clientHeight;if(w<5||h<5)return;
    this.renderer.setSize(w,h,false);const ratio=w/h,halfH=8.75;
    this.camera.left=-halfH*ratio;this.camera.right=halfH*ratio;this.camera.top=halfH;this.camera.bottom=-halfH;this.camera.updateProjectionMatrix();
  }
  zoom(delta){this.camera.zoom=Math.min(1.55,Math.max(.58,this.camera.zoom+delta));this.camera.updateProjectionMatrix()}
  handlePointer(ev,click){if(!this.active)return;
    const r=this.renderer.domElement.getBoundingClientRect();if(!r.width||!r.height)return;
    this.pointer.set(((ev.clientX-r.left)/r.width)*2-1,-((ev.clientY-r.top)/r.height)*2+1);
    this.raycaster.setFromCamera(this.pointer,this.camera);const hits=this.raycaster.intersectObject(this.pickPlane);
    if(!hits.length){this.highlight.visible=false;return}
    const x=Math.floor(hits[0].point.x),z=Math.floor(hits[0].point.z);
    const valid=x>=0&&z>=0&&x<this.size&&z<this.size&&!this.blocked.has(`${x},${z}`);
    this.highlight.visible=valid;if(valid)this.highlight.position.set(x+.5,.145,z+.5);
    if(click&&valid){this.path=this.findPath(this.playerCell,{x,z});}
  }
  findPath(from,to){
    const key=({x,z})=>`${x},${z}`;const start=key(from),end=key(to);
    if(start===end||this.blocked.has(end))return [];
    const queue=[from],parent=new Map([[start,null]]);let ix=0;
    while(ix<queue.length){const p=queue[ix++];if(key(p)===end)break;
      for(const [dx,dz] of [[0,-1],[0,1],[-1,0],[1,0]]){const n={x:p.x+dx,z:p.z+dz},k=key(n);
        if(n.x>=0&&n.z>=0&&n.x<this.size&&n.z<this.size&&!this.blocked.has(k)&&!parent.has(k)){parent.set(k,p);queue.push(n)}}
    }
    if(!parent.has(end))return [];const result=[];let p=to;while(key(p)!==start){result.unshift(p);p=parent.get(key(p))}return result;
  }
  walkKeyboard(){if(!this.keys.size||this.path.length)return;
    let dx=0,dz=0;
    if(this.keys.has('arrowup')||this.keys.has('w'))dz=-1;
    else if(this.keys.has('arrowdown')||this.keys.has('s'))dz=1;
    else if(this.keys.has('arrowleft')||this.keys.has('a'))dx=-1;
    else if(this.keys.has('arrowright')||this.keys.has('d'))dx=1;
    const next={x:this.playerCell.x+dx,z:this.playerCell.z+dz};
    if(dx||dz)this.path=this.findPath(this.playerCell,next);
  }
  expand(size){if(size<=this.size)return;this.buildFloor(size);}
  tick(t){
    const dt=Math.min(.05,(t-this._last)/1000);this._last=t;this._clock+=dt;
    if(this.active){
      this.walkKeyboard();
      if(this.path.length){const next=this.path[0],destX=next.x+.5,destZ=next.z+.5;
        const delta=new THREE.Vector2(destX-this.avatarSprite.position.x,destZ-this.avatarSprite.position.z),distance=delta.length(),step=dt*this.walkSpeed;
        if(distance<=step+.001){this.avatarSprite.position.x=destX;this.avatarSprite.position.z=destZ;this.shadow.position.x=destX;this.shadow.position.z=destZ;
          this.playerCell={x:next.x,z:next.z};this.path.shift();this.onMove(next.x,next.z);
        }else{this.avatarSprite.position.x+=delta.x/distance*step;this.avatarSprite.position.z+=delta.y/distance*step;this.shadow.position.x=this.avatarSprite.position.x;this.shadow.position.z=this.avatarSprite.position.z}
        this.avatarSprite.position.y=1.0+Math.sin(this._clock*13)*.035;
      }else this.avatarSprite.position.y=1.0+Math.sin(this._clock*2.8)*.011;
      this.onFrame?.(dt);this.renderer.render(this.scene,this.camera);
    }
    this._frame=requestAnimationFrame(tt=>this.tick(tt));
  }
  destroy(){cancelAnimationFrame(this._frame);this.resizeObserver.disconnect();this.renderer.domElement.removeEventListener('pointermove',this._pointerMove);this.renderer.domElement.removeEventListener('pointerdown',this._pointerDown);window.removeEventListener('keydown',this._keyDown);window.removeEventListener('keyup',this._keyUp);this.renderer.dispose();this.renderer.domElement.remove()}
}
