/* ================= save ================= */
// Saving never loses an airport. It stops, and says so, when the stored save isn't this page's to overwrite (another tab
// saved since, or a newer build wrote it), when loading it failed (it stays as it was, byte for byte, with a copy under
// KEY-broken), or after an error in a frame (23-boot.js) until the player carries on. R.saveBlock names why it stopped;
// R.lastWrite is the stored text this page last read or wrote, so a different one means someone else saved.
FIELDS.ver=()=>UPDATES[0].v; // the build stamp: the What's new version of the page that wrote the save
function save(){if(R.sim||R.saveBlock||R.frameErr)return;
  let cur=null;try{cur=localStorage.getItem(KEY)}catch(e){}
  if(cur!=null&&R.lastWrite!=null&&cur!==R.lastWrite){stopSaving('tab');return}
  G.savedAt=Date.now();G.ver=UPDATES[0].v;
  try{const t=JSON.stringify(G);localStorage.setItem(KEY,t);R.lastWrite=t;R.saveFail=false}
  catch(e){if(!R.saveFail){R.saveFail=true;saveAlert('saveFull','Your airport couldn’t be saved: this browser’s storage is full. Copy its save code to keep it safe.',[{label:'Copy save',fn:()=>copySaveCode(JSON.stringify(G))}])}}}
// a save written by a newer page: a later stamp, or upgrades or cities this page doesn't know (which loading would drop)
const newerSave=s=>!!s&&s.ver!=null&&(s.ver>UPDATES[0].v||Object.keys(s.lv||{}).some(k=>!(k in UPG))||Object.keys(s.routes||{}).some(c=>!CITY[c]));
// a warning the player sees whatever Settings › Alerts says (toast() lets through a reply to a tap)
function saveAlert(id,text,choices){R.lastInput=performance.now();toast(text,choices,id,'warn',600)}
function copySaveCode(json){let code='';try{code=btoa(unescape(encodeURIComponent(json||'')))}catch(e){}
  const done=ok=>toast(ok?'Save code copied. Keep it somewhere safe.':'Couldn’t copy the save code on this device.',null,null,ok?'goal':'warn',6);
  try{navigator.clipboard.writeText(code).then(()=>done(true),()=>done(false))}catch(e){done(false)}}
const reloadChoice=[{label:'Reload',fn:()=>location.reload()},{label:'Got it',fn:()=>{}}];
function stopSaving(why){R.saveBlock=why;if(R.sim)return;
  if(why==='tab')saveAlert('saveTab','This airport is open in another tab, which saved it more recently, so this tab has stopped saving.',reloadChoice);
  else if(why==='newer')saveAlert('saveNewer','This airport was saved by a newer version of the game, so this page won’t save over it. Reload to update.',reloadChoice);
  else if(why==='broken')saveAlert('saveBroken','Your airport couldn’t be loaded. It’s kept safe as it was, and this fresh one won’t save unless you start afresh.',
    [{label:'Start afresh',fn:()=>{R.saveBlock=null;save()}},{label:'Copy save',fn:()=>{let t='';try{t=localStorage.getItem(KEY+'-broken')||localStorage.getItem(KEY)}catch(e){}copySaveCode(t)}}]);
}
setInterval(save,5000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
// saves across devices were removed: tidy away their old keys once
try{localStorage.removeItem('final-call-cloud');localStorage.removeItem('final-call-device')}catch(e){}
function migrate(o){
  const s=DEFAULT();delete s.hotelBook; // its default reads the airport it's for, so resetAll gives it one once the save is in G
  ['cash','rep','flown','flights','ontime','earned','name','clock','flightNo','sound'].forEach(k=>{if(o[k]!=null)s[k]=o[k]});
  if(o.lv)for(const k in o.lv)if(k in s.lv)s.lv[k]=Math.min(o.lv[k],UPG[k].max);
  if(o.methods)s.methods={...o.methods};
  if(o.owned){s.fleet=[];o.owned.forEach((own,t)=>{if(own)s.fleet.push({type:t})});if(!s.fleet.length)s.fleet=[{type:0}];const j=s.fleet.findIndex(f=>f.type===o.plane);s.stands[0].ac=j>=0?j:0}
  if(o.strategy)s.stands[0].method=o.strategy;
  if(o.fare)s.fare=o.fare;
  s.revBy.fares=o.earned||0;s.paxSeated=o.flown||0;
  return s;
}
const padTo=(a,f,n=NG)=>{a=Array.isArray(a)?a.slice(0,n):[];while(a.length<n)a.push(f(a.length));return a};
// Older saves, brought up to date in this order after every field has its default (FIELDS). Each step's when(state) sees
// the save as it was stored (null for a new game); up(state) changes G. Add a step at the end for a new saved field that
// needs more than a default.
const always=()=>true;
const MIGRATIONS=[
  {when:always,note:'upgrades known and within their range; money buckets, stands, shop units, reports and open counts complete',up(state){
    G.lv=Object.assign(FIELDS.lv(),(state&&state.lv)||{});for(const k in G.lv){if(!(k in UPG))delete G.lv[k];else G.lv[k]=clamp(+G.lv[k]||0,0,UPG[k].max)}
    G.revBy=Object.assign(FIELDS.revBy(),(state&&state.revBy)||{});
    G.stands=padTo(G.stands,i=>({built:false,ac:null,method:'random',rear:false,route:'mixed'}));G.stands.forEach(s=>{if(!s.route)s.route='mixed'});
    G.shops=padTo(G.shops,()=>null,NU);G.reports=padTo(G.reports,()=>null);G.arrReports=padTo(G.arrReports,()=>null);G.gstats=padTo(G.gstats,()=>[]);
    G.open=Object.assign({desks:null,lanes:null,officers:null},G.open||{});
    if(!Array.isArray(G.builds))G.builds=[];}},
  {when:always,note:'planes back at base or still away, and at least one plane',up(){
    G.fleet=(G.fleet||[]).map(f=>Object.assign({wear:0},f,{st:f.st==='away'&&f.back>G.clock?'away':'base',readyAt:G.clock,gate:null}));if(!G.fleet.some(f=>!f.sold))G.fleet.push({type:0,st:'base',readyAt:G.clock,wear:0});}},
  {when:()=>G.tab==='shops',note:'the Shops tab became Sales',up(){G.tab='sales'}},
  {when:always,note:'the region fields are objects',up(){
    G.lines=G.lines||{};G.infra=G.infra||{};G.tod=G.tod||{};G.stn=G.stn||{};G.lineSeq=G.lineSeq||0;G.dev=G.dev||{};G.pop=G.pop||{};G.evq=Array.isArray(G.evq)?G.evq:[];}},
  {when:state=>state&&!state.lines,note:'before region lines: the rail and high-speed upgrades become lines',up(state){
    if(G.lv.rail)G.lines.castle={mode:'rail',align:'old',freq:2,fare:1,exp:false,night:false,freight:false,cars:0};if(state.lv&&state.lv.hsr)G.lines.low={mode:'hsr',align:'main',freq:1,fare:1,exp:false,night:false,freight:false,cars:0}}},
  {when:always,note:'lines up to date; no line being drawn',up(){migrateLines();R.draft=null;R.ng=null}},
  {when:state=>state&&state.level==null,note:'before levels: grant the level its progress already earns, without the reward',up(){
    let lv=0;for(let n=1;n<LEVELS.length;n++){const q=LEVELS[n].req;if(G.flown>=q.pax&&builtCount()>=q.gates)lv=n;else break}G.level=Math.min(lv,4);}},
  {when:state=>state&&state.level!=null&&!state.pv,note:'before ten levels: the old level mapped to its new number',up(state){G.level=LV_MAP[clamp(state.level|0,0,LV_MAP.length-1)]}},
  {when:state=>state&&!state.pv,note:'before the Masterplan: approve every plan up to the airport\'s level, and anything already in use',up(){
    G.tech={};G.pts=0;G.ptBought=0;G.gdone={};
    const own=k=>{const [a,v]=k.split(':');return a==='up'?G.lv[v]>0:a==='ac'?G.fleet.some(f=>f.type===+v):a==='meth'?!!G.methods[v]:a==='shop'?G.shops.some(x=>x&&SHOPS[x.type].id===v):a==='mode'?Object.values(G.lines).some(L=>L.mode===v):a==='dev'?Object.values(G.dev).includes(v):a==='stn'?Object.values(G.stn).some(x=>x&&x[v]):false};
    for(const T of TECH)if(T.t<=G.level||T.u.some(own))G.tech[T.id]=1;
    G.pv=2;}},
  {when:always,note:'every setting present',up(){G.set=Object.assign(FIELDS.set(),G.set||{})}},
  {when:state=>state&&!(state.set&&'autoLines' in state.set),note:'before the transport manager: lines and fares stay in the player\'s hands',up(){G.set.autoLines=false;G.set.autoFares=false}},
  {when:always,note:'plans and goals are objects',up(){G.tech=G.tech||{};G.gdone=G.gdone||{}}},
  {when:state=>state&&!state.tour||G.tour&&!G.tour.done&&(G.level>=1||G.flights>30),note:'no guided start for an airport with progress',up(){G.tour={done:1}}},
  {when:state=>state&&!state.stamps,note:'before stamps: award those already earned',up(){G.stamps={};for(const S of STAMPS){try{if(S.t())G.stamps[S.id]=G.day||dayOf(G.clock)}catch(e){}}}},
  {when:state=>!Array.isArray(G.crews)||(state&&!state.crews),note:'before crews: hire the crews the fleet needs',up(){G.crews=[];for(let k=0;k<crewTarget();k++)G.crews.push(mkCrew(G.clock))}},
  {when:always,note:'no crew reserved; each crew has a time back',up(){G.crews.forEach(c=>{c.res=0;if(c.back==null)c.back=c.free||0})}},
  {when:state=>state&&state.set&&!('autoCrews' in state.set),note:'before the crew manager: it hires for airports that had settings',up(){G.set.autoCrews=true}},
  {when:()=>G.set.chal==null,note:'challenges on',up(){G.set.chal=true}},
  {when:state=>state&&!state.routes,note:'before routes: open the biggest cities of each tier already unlocked',up(){
    G.routes={};for(let t=0;t<5;t++){if(!has('rt:'+t))continue;CITIES.filter(c=>c[2]===t).sort((x,y)=>y[4]-x[4]).slice(0,t===0?5:4).forEach(c=>G.routes[c[0]]={f:1})}}},
  {when:always,note:'routes only to cities that exist',up(){G.routes=G.routes||{};G.rs=G.rs||{};for(const c in G.routes)if(!CITY[c])delete G.routes[c]}},
  {when:state=>state&&!state.gdone,note:'before goals: mark those already met',up(){for(const g of GOALS){try{const [v,t]=g.p();if(v>=t)G.gdone[g.id]=1}catch(e){}}}},
  {when:always,note:'the day from the clock, and its stats',up(){G.day=dayOf(G.clock);if(!G.dstat)G.dstat=dayStats()}},
  {when:()=>G.seen==null,note:'What\'s new: new games have seen everything; airports from before it see version 21\'s notes on',up(state){G.seen=state?21:UPDATES[0].v}},
];
// Loads a save (null for a new game). If a step throws on a save, the half-loaded airport is dropped for a new one that
// won't save (stopSaving), so the stored save stays as it was; raw, the stored text, is copied to KEY-broken.
function resetAll(state,raw){
  if(state&&R.saveBlock==='broken'){R.saveBlock=null;dropToast('saveBroken')} // a save that loads (Settings › Save) saves again
  try{loadState(state)}catch(e){
    if(!state||R.sim)throw e;
    console.error(e);if(raw){try{localStorage.setItem(KEY+'-broken',raw)}catch(e2){}}
    R.saveBlock='broken';loadState(null);G.tour={done:1};stopSaving('broken');return false} // not a new player: no guided start
  return true;
}
function loadState(state){
  const s=state||{};G={};for(const k in FIELDS)G[k]=s[k];Object.assign(G,s); // the table's fields first, then anything else the save holds
  for(const k in FIELDS)if(G[k]==null)G[k]=FIELDS[k](); // with G in place, as some defaults read the airport
  for(const M of MIGRATIONS)if(M.when(state))M.up(state);
  applyLayout(G.layout||'classic');
  R.rwy={q:[],act:[null,null]};R.lot=new Array(540).fill(0);R.platform=[];R.train={state:'away',t:3,x:null};R.lotFull=0;
  R.arrQ=[];R.booths=[];R.egates=[];R.arrBelt=[];
  R.pax=[];R.ciQ=[];R.secQ=[];R.ftQ=[];R.desks=[];R.kiosks=[];R.lanes=[];R.ftL={p:null,t:0};R.belt=[];R.st=[...Array(NG).keys()].map(mkStandRT);R.st.forEach((S,i)=>S.hold=i*6);R.floaters=[];R.toasts=[];weather.reset();R.autoN={};R.tram={state:'away',t:2,x:null};R.bus={state:'away',t:1,x:null};R.tramQ=[];R.busQ=[];R.reg=null;for(const P of PLOTS)scheduleEvent(P.id);regionTick();
  R.nextEvent=G.clock+60;R.lastMin=Math.floor(G.clock);R.sel=G.stands.findIndex(s=>s.built);if(R.sel<0)R.sel=0;
  if(R.sim)return;
  setView(G.tab==='region'?'region':G.tab==='routes'?'world':'airport');$('#airline').textContent=G.name;$('#lvlName').textContent=lvlName(G.level);renderPlanBtn();boardSig='';renderBoard();renderHist();renderTabs();renderPanel();renderCam();renderToasts();syncSound();save();
}

