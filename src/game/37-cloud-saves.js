/* ================= SAVES ACROSS DEVICES: on claude.ai the game also saves to the player's own private space ================= */
const CL={on:false,ref:null,dev:null,last:0,lastClock:null,asking:false,hold:false,busy:false};
function cloudBase(v){const k='final-call-cloud';try{if(v){localStorage.setItem(k,JSON.stringify(v));return v}return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function cloudDev(){let d=null;try{d=localStorage.getItem('final-call-device');if(!d){d=Math.random().toString(36).slice(2,10);localStorage.setItem('final-call-device',d)}}catch(e){d=d||'x'}return d} // cosmetic
async function cloudInit(){
  if(R.sim||!window.claude||typeof window.claude.use!=='function')return;
  let db=null,user=null;try{[db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')])}catch(e){}
  if(!db||!user)return;let uid=null;try{uid=await user.id()}catch(e){}if(!uid)return;
  CL.ref=db.doc('data/users/'+uid+'/save');CL.dev=cloudDev();
  let r=null;try{const sn=await CL.ref.get();r=sn.exists?sn.data():null}catch(e){return}
  CL.on=true;const base=cloudBase();
  if(!r||!r.s||r.dev===CL.dev||(base&&r.at<=base.at))await cloudPut(true);
  else if(!base&&!G.flights||base&&Math.abs(G.clock-base.clock)<1)cloudLoad(r);
  else cloudAsk(r);
  try{CL.ref.onSnapshot(sn=>{const d=sn.exists?sn.data():null;if(!d||!d.s||d.dev===CL.dev||CL.asking)return;const b=cloudBase();if(b&&d.at<=b.at)return;cloudAsk(d)},()=>{})}catch(e){}
  setInterval(()=>{if(Math.abs(G.clock-(CL.lastClock??-1e9))>0.5)cloudPut()},60000);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cloudPut()});
  if(G.tab==='office')renderPanel();
}
async function cloudPut(force){
  if(!CL.on||CL.busy||CL.asking||CL.hold)return;CL.busy=true;
  try{
    if(!force){const sn=await CL.ref.get(),d=sn.exists?sn.data():null,b=cloudBase();if(d&&d.dev!==CL.dev&&(!b||d.at>b.at)){CL.busy=false;cloudAsk(d);return}}
    const at=Date.now();await CL.ref.set({s:JSON.stringify({...G,savedAt:at}),at,clock:G.clock,dev:CL.dev,level:G.level,day:G.day});
    cloudBase({at,clock:G.clock});CL.lastClock=G.clock;CL.last=at;CL.err=null;
  }catch(e){CL.err=(e&&e.code)||'error'}
  CL.busy=false;
}
function cloudLoad(r){
  let o=null;try{o=JSON.parse(r.s)}catch(e){}if(!o||typeof o.cash!=='number'||!Array.isArray(o.stands))return false;
  resetAll(o);cloudBase({at:r.at,clock:G.clock});CL.lastClock=G.clock;CL.last=r.at;save();tourStep();
  R.lastInput=performance.now();toast(`Carried on from your other device: ${lvlName(G.level)}, day ${G.day}.`,null,null,'goal',8);return true;
}
function cloudAsk(r){
  if(CL.asking)return;CL.asking=true;const when=new Date(r.at),t=`${pad(when.getHours())}:${pad(when.getMinutes())}`;
  R.lastInput=performance.now();
  toast(`This airport was also played on another device (${lvlName(r.level|0)}, day ${r.day}, saved at ${t}). Which one do you want to keep?`,[
    {label:'The other device',fn:()=>{CL.asking=false;cloudLoad(r)}},
    {label:'This one',fn:()=>{CL.asking=false;cloudBase({at:r.at,clock:G.clock});cloudPut(true)}},
    {label:'Decide later',fn:()=>{CL.asking=false;CL.hold=true}}],'cloud','warn',900);
}
function cloudNote(){
  if(!CL.on)return 'This copy saves on this device only. When the game runs on claude.ai it also saves to your account.';
  if(CL.hold)return 'Saving to your account is paused until you choose which device’s airport to keep. Reload the game to choose.';
  const m=CL.last?Math.round((Date.now()-CL.last)/60000):null;
  return `Saved to your claude.ai account${m==null?'':m<1?' just now':` ${m} min ago`}. Open the game on another device to carry on there.${CL.err?' The last save didn’t go through; it will try again.':''}`;
}
