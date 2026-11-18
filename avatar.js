/** Procedural 2D anime avatar: no downloaded character assets required. */
export const HAIR_COLORS=['#453043','#8e5c48','#deb57a','#d98b9c','#6c779d'];
export const SKIN_TONES=['#f8d2b8','#e7b18e','#bc8068','#86564f'];
export const APRON_COLORS=['#9e6678','#6b8779','#927a60','#6e789e'];

export function drawAvatar(canvas, p={}) {
  const ctx=canvas.getContext('2d'); const W=360,H=440;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save(); ctx.scale(canvas.width/W,canvas.height/H);
  const skin=p.skin||SKIN_TONES[0], hair=p.hair||HAIR_COLORS[0], apron=p.apron||APRON_COLORS[0];
  const isMasculine=p.gender==='male';
  const line='#614c59';
  const path=(points,fill,stroke=line,width=2)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke()}};
  const ell=(x,y,rx,ry,fill,stroke=null,lw=2)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}};
  const bez=(fn,fill,stroke=line,lw=2)=>{ctx.beginPath();fn(ctx);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}};
  // legs and cute shoes
  path([[133,340],[172,340],[168,410],[133,412]],'#504852');path([[187,340],[226,340],[226,412],[191,410]],'#504852');
  ell(145,414,30,12,'#3f3741',line);ell(215,414,30,12,'#3f3741',line);
  // shirt sleeves and hands
  path([[125,222],[103,235],[92,314],[121,319],[143,270]],'#fffaf3');path([[234,222],[258,236],[266,315],[238,318],[217,268]],'#fffaf3');
  ell(106,318,16,18,skin,line);ell(252,318,16,18,skin,line);
  // body shirt + apron
  bez(c=>{c.moveTo(135,215);c.quadraticCurveTo(174,205,224,214);c.lineTo(245,349);c.quadraticCurveTo(177,363,117,349);c.closePath()},'#fff8ed');
  bez(c=>{c.moveTo(149,244);c.lineTo(212,244);c.lineTo(231,353);c.quadraticCurveTo(176,367,129,353);c.closePath()},apron);
  path([[135,240],[146,230],[155,246],[140,258]],apron);path([[207,245],[220,229],[228,243],[220,257]],apron);
  bez(c=>{c.moveTo(145,314);c.quadraticCurveTo(182,305,215,314);c.lineTo(211,342);c.quadraticCurveTo(178,352,150,340);c.closePath()},'#ffffff27','#ffffff7c',1.5);
  ctx.fillStyle='#f9e5c7';ctx.font='28px serif';ctx.textAlign='center';ctx.fillText('☕',180,295);
  // neck and ears
  path([[164,198],[197,198],[197,237],[164,237]],skin);ell(116,160,15,22,skin,line);ell(245,160,15,22,skin,line);
  // rear hair and ponytail
  bez(c=>{c.moveTo(113,139);c.bezierCurveTo(99,48,258,50,248,146);c.lineTo(242,250);c.quadraticCurveTo(179,266,115,240);c.closePath()},hair);
  if(p.hairStyle==='ponytail'){
    bez(c=>{c.moveTo(230,99);c.bezierCurveTo(291,75,288,185,260,230);c.quadraticCurveTo(243,208,240,176);c.closePath()},hair);
    ell(249,119,12,13,'#f8b7b8');
  }
  // face
  bez(c=>{c.moveTo(119,127);c.bezierCurveTo(123,79,226,79,241,130);c.lineTo(237,183);c.bezierCurveTo(231,218,202,228,180,230);c.bezierCurveTo(154,229,126,213,120,181);c.closePath()},skin);
  // gentle cheek tint
  ell(138,183,14,7,'#ec899251');ell(224,183,14,7,'#ec899251');
  // anime eyes
  const eyes=[149,212];
  eyes.forEach(x=>{
    ell(x,168,13,17,'#fffdfb');ell(x,170,8,12,isMasculine?'#796c79':'#986d90');ell(x,172,4,8,'#302b3c');ell(x-3,164,3.5,4,'#fff');
    bez(c=>{c.moveTo(x-14,157);c.quadraticCurveTo(x,149,x+14,157);c.lineTo(x+11,160);c.quadraticCurveTo(x,155,x-12,161);c.closePath()},line,null);
  });
  // mouth + nose
  ell(182,187,2.2,1.6,'#c68c8c');bez(c=>{c.moveTo(173,201);c.quadraticCurveTo(182,210,192,201);c.quadraticCurveTo(183,214,173,201)},'#ab6b77',null);
  // front hair
  if(p.hairStyle==='short'){
    bez(c=>{c.moveTo(114,143);c.bezierCurveTo(100,86,133,83,151,80);c.bezierCurveTo(200,62,244,85,245,137);c.lineTo(233,124);c.lineTo(224,111);c.lineTo(211,129);c.lineTo(200,111);c.lineTo(174,137);c.lineTo(154,118);c.lineTo(132,148);c.closePath()},hair);
  }else{
    bez(c=>{c.moveTo(112,151);c.bezierCurveTo(105,89,134,79,163,79);c.bezierCurveTo(200,67,248,91,246,151);c.lineTo(236,139);c.lineTo(225,119);c.quadraticCurveTo(210,137,199,140);c.lineTo(191,118);c.quadraticCurveTo(166,149,132,145);c.closePath()},hair);
    if(p.hairStyle==='bob'){
      bez(c=>{c.moveTo(121,135);c.quadraticCurveTo(103,172,120,234);c.lineTo(137,228);c.quadraticCurveTo(123,177,133,148);c.closePath()},hair);
      bez(c=>{c.moveTo(237,138);c.quadraticCurveTo(256,188,241,235);c.lineTo(224,229);c.quadraticCurveTo(240,177,228,151);c.closePath()},hair);
    }
  }
  // tiny hair shine
  ctx.strokeStyle='#ffffff73';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(148,91);ctx.quadraticCurveTo(166,82,181,83);ctx.stroke();
  // small headband accent
  if(!isMasculine){ell(236,123,6,6,'#ffdc97');ell(243,119,4,4,'#fff4d3')}
  ctx.restore();
}
