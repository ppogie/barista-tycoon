import {drawAvatar,HAIR_COLORS,SKIN_TONES,APRON_COLORS} from './avatar.js';
import {CafeWorld} from './world.js';

const $=(selector)=>document.querySelector(selector);
const $$=(selector)=>Array.from(document.querySelectorAll(selector));
const KEY='barista-tycoon-alpha-v1';
const money=(value)=>'$'+Number(value||0).toLocaleString('en-US');
const costs={10:2000,15:5000,20:12000,25:25000};
const drinks=[['☕','Iced Americano',5],['🥛','Iced Latte',6],['☁️','Cappuccino',7],['🍫','Iced Mocha',8],['🍵','Matcha Latte',8]];
const look={gender:'female',hairStyle:'bob',hair:HAIR_COLORS[0],skin:SKIN_TONES[0],apron:APRON_COLORS[0]};
let saveData=readSave();let world=null;let toastTimeout=null;
const avatarCanvas=$('#avatar-preview');
function readSave(){try{const d=JSON.parse(localStorage.getItem(KEY));return d&&d.version===1&&d.player?.name&&Number.isFinite(d.wallet)?d:null}catch{return null}}
function writeSave(){if(!saveData)return;try{localStorage.setItem(KEY,JSON.stringify(saveData))}catch{toast('Save tidak dapat disimpan dalam browser ini.')};refreshContinue()}
function refreshContinue(){$('#continue-game').hidden=!saveData}
function showScreen(name){for(const node of $$('.screen'))node.hidden=node.id!==`${name}-screen`;if(world)world.setActive(name==='game')}
function toast(message){const node=$('#toast');node.textContent=message;node.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>node.classList.remove('show'),3200)}
function paintAvatar(){drawAvatar(avatarCanvas,look);$('#preview-name').textContent=$('#player-name').value.trim()||'New Barista'}
function selectGroup(selector,attribute,value){$$(selector).forEach(el=>el.classList.toggle('active',el.dataset[attribute]===value))}
function makeSwatches(id,values,prop){const target=$('#'+id);values.forEach((color,i)=>{const btn=document.createElement('button');btn.className='swatch'+(look[prop]===color?' selected':'');btn.type='button';btn.style.backgroundColor=color;btn.title=`Pilihan ${i+1}`;btn.setAttribute('aria-label',`${prop} color ${i+1}`);btn.setAttribute('aria-pressed',String(look[prop]===color));btn.addEventListener('click',()=>{look[prop]=color;target.querySelectorAll('.swatch').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false')});btn.classList.add('selected');btn.setAttribute('aria-pressed','true');paintAvatar()});target.appendChild(btn)})}
makeSwatches('hair-swatches',HAIR_COLORS,'hair');makeSwatches('skin-swatches',SKIN_TONES,'skin');makeSwatches('apron-swatches',APRON_COLORS,'apron');
$$('[data-gender]').forEach(button=>button.addEventListener('click',()=>{look.gender=button.dataset.gender;selectGroup('[data-gender]','gender',look.gender);paintAvatar()}));
$$('[data-hair-style]').forEach(button=>button.addEventListener('click',()=>{look.hairStyle=button.dataset.hairStyle;selectGroup('[data-hair-style]','hairStyle',look.hairStyle);paintAvatar()}));
$('#player-name').addEventListener('input',paintAvatar);
$('#start-new').addEventListener('click',()=>{showScreen('creator');paintAvatar()});
$('#creator-back').addEventListener('click',()=>showScreen('start'));
$('#continue-game').addEventListener('click',()=>{if(saveData)enterCafe()});
$('#create-confirm').addEventListener('click',()=>{
  const name=$('#player-name').value.trim();const cafe=$('#cafe-name').value.trim();
  if(!name){$('#player-name').focus();return toast('Masukkan nama karakter dahulu ✿')}
  if(!cafe){$('#cafe-name').focus();return toast('Masukkan nama café dahulu ✿')}
  saveData={version:1,player:{name,cafe,look:{...look}},wallet:3500,savings:0,shopSize:10,position:{x:7,z:8},createdAt:new Date().toISOString()};
  writeSave();enterCafe(true);
});
function enterCafe(isNew=false){
  if(!saveData)return;
  showScreen('game');
  const player=saveData.player;$('#hud-cafe-name').textContent=player.cafe;$('#world-greeting').textContent=`Welcome home, ${player.name}!`;
  // redraw the saved player look, not whatever was last selected in the editor
  const textureCanvas=document.createElement('canvas');textureCanvas.width=360;textureCanvas.height=440;
  drawAvatar(textureCanvas,player.look);
  if(world){world.destroy();world=null}
  world=new CafeWorld($('#world-canvas'),{onMove:(x,z)=>{if(!saveData)return;saveData.position={x,z};writeSave()}});
  world.updateAvatar(textureCanvas);
  if(saveData.shopSize>10)world.expand(saveData.shopSize);
  world.setPlayerCell(saveData.position.x,saveData.position.z,false);
  world.setActive(true);updateHud();setPanel('shop',false);
  if(isNew)toast(`Selamat datang ke ${player.cafe}! ♡`);
}
function updateHud(){
  if(!saveData)return;
  $('#hud-wallet').textContent=money(saveData.wallet);$('#hud-savings').textContent=money(saveData.savings);
  $('#savings-panel-balance').textContent=money(saveData.savings);
  $('#saving-progress').style.width=Math.min(100,saveData.savings/5000*100)+'%';
  const size=saveData.shopSize;$('#tile-size').textContent=`${size} × ${size} Tiles`;$('#tile-count').textContent=`${size*size} total tiles`;
  $('#current-size').textContent=`${size}×${size}`;$('#next-size').textContent=costs[size]?`${size+5}×${size+5}`:'MAX';
  $('#expansion-cost').textContent=costs[size]?money(costs[size]):'—';
  const button=$('#expand-button');const available=costs[size]!=null;
  button.disabled=!available||saveData.wallet<costs[size];button.textContent=!available?'Maximum Size Reached':saveData.wallet<costs[size]?'Not Enough Money':'Unlock More Space ✦';
  $('#expansion-message').textContent=!available?'Your café has reached the prototype maximum size.':saveData.wallet<costs[size]?'Earn more café income when drink sales are added.':'Increase the café floor and keep all your furniture.';
}
$('#expand-button').addEventListener('click',()=>{
  if(!saveData||!world)return;const price=costs[saveData.shopSize];if(price==null||saveData.wallet<price)return;
  saveData.wallet-=price;saveData.shopSize+=5;world.expand(saveData.shopSize);writeSave();updateHud();
  toast(`Café berkembang ke ${saveData.shopSize}×${saveData.shopSize} tiles! ✦`);
});
$('#game-home').addEventListener('click',()=>{writeSave();showScreen('start');toast('Progress disimpan ✓')});
$('#zoom-in').addEventListener('click',()=>world?.zoom(.14));$('#zoom-out').addEventListener('click',()=>world?.zoom(-.14));
function setPanel(id,openOnMobile=true){
  $$('.detail-view').forEach(node=>node.hidden=node.id!==`panel-${id}`);
  $$('.nav-item').forEach(node=>node.classList.toggle('active',node.dataset.panel===id));
  const mobile=window.matchMedia('(max-width:760px)').matches;
  const panel=$('.details-panel');if(mobile){if(openOnMobile)panel.classList.toggle('open',true);else panel.classList.remove('open')}else panel.classList.remove('open');
}
$$('.nav-item').forEach(item=>item.addEventListener('click',()=>{
  const panel=$('.details-panel');const isCurrent=item.classList.contains('active');
  if(window.matchMedia('(max-width:760px)').matches&&isCurrent&&panel.classList.contains('open')){panel.classList.remove('open');return}
  setPanel(item.dataset.panel,true);
}));
document.addEventListener('keydown',ev=>{if(ev.key==='Escape')$('.details-panel').classList.remove('open')});
$('#drink-list').innerHTML=drinks.map(([emoji,name,price])=>`<div class="drink-card"><div class="drink-emoji">${emoji}</div><div class="drink-desc"><strong>${name}</strong><small>Starter recipe</small></div><b>${money(price)}</b></div>`).join('');
refreshContinue();paintAvatar();showScreen('start');
