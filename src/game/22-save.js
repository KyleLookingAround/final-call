/* ================= save ================= */
function save(){if(R.sim)return;G.savedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(G))}catch(e){}}
setInterval(save,5000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
try{window.claude?.hot?.snapshot?.(()=>({save:JSON.parse(JSON.stringify({...G,savedAt:Date.now()}))}))}catch(e){}
function migrate(o){
  const s=DEFAULT();
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
function resetAll(state){
  const d=DEFAULT();G=Object.assign(d,state||{});
  G.lv=Object.assign(DEFAULT().lv,(state&&state.lv)||{});for(const k in G.lv){if(!(k in UPG))delete G.lv[k];else G.lv[k]=clamp(+G.lv[k]||0,0,UPG[k].max)}
  G.revBy=Object.assign(DEFAULT().revBy,(state&&state.revBy)||{});
  G.stands=padTo(G.stands,i=>({built:false,ac:null,method:'random',rear:false,route:'mixed'}));G.stands.forEach(s=>{if(!s.route)s.route='mixed'});
  G.shops=padTo(G.shops,()=>null,NU);G.reports=padTo(G.reports,()=>null);G.arrReports=padTo(G.arrReports,()=>null);G.gstats=padTo(G.gstats,()=>[]);
  G.open=Object.assign({desks:null,lanes:null,officers:null},G.open||{});
  if(!Array.isArray(G.builds))G.builds=[];
  G.fleet=(G.fleet||[]).map(f=>Object.assign({wear:0},f,{st:f.st==='away'&&f.back>G.clock?'away':'base',readyAt:G.clock,gate:null}));if(!G.fleet.some(f=>!f.sold))G.fleet.push({type:0,st:'base',readyAt:G.clock,wear:0});
  if(G.tab==='shops')G.tab='sales';
  G.lines=G.lines||{};G.infra=G.infra||{};G.tod=G.tod||{};G.stn=G.stn||{};G.lineSeq=G.lineSeq||0;G.dev=G.dev||{};G.pop=G.pop||{};G.evq=Array.isArray(G.evq)?G.evq:[];
  if(state&&!state.lines){if(G.lv.rail)G.lines.castle={mode:'rail',align:'old',freq:2,fare:1,exp:false,night:false,freight:false,cars:0};if(state.lv&&state.lv.hsr)G.lines.low={mode:'hsr',align:'main',freq:1,fare:1,exp:false,night:false,freight:false,cars:0}}
  migrateLines();R.draft=null;R.ng=null;
  if(state&&state.level==null){ // older save: grant the level its progress already earns, without the reward
    let lv=0;for(let n=1;n<LEVELS.length;n++){const q=LEVELS[n].req;if(G.flown>=q.pax&&builtCount()>=q.gates)lv=n;else break}G.level=Math.min(lv,4);
  }else if(state&&!state.pv)G.level=LV_MAP[clamp(state.level|0,0,LV_MAP.length-1)];
  if(state&&!state.pv){ // before the Masterplan: approve every plan up to the airport's level, and anything already in use
    G.tech={};G.pts=0;G.ptBought=0;G.gdone={};
    const own=k=>{const [a,v]=k.split(':');return a==='up'?G.lv[v]>0:a==='ac'?G.fleet.some(f=>f.type===+v):a==='meth'?!!G.methods[v]:a==='shop'?G.shops.some(x=>x&&SHOPS[x.type].id===v):a==='mode'?Object.values(G.lines).some(L=>L.mode===v):a==='dev'?Object.values(G.dev).includes(v):a==='stn'?Object.values(G.stn).some(x=>x&&x[v]):false};
    for(const T of TECH)if(T.t<=G.level||T.u.some(own))G.tech[T.id]=1;
    G.pv=2;
  }
  {const hadMgr=state&&state.set&&'autoLines' in state.set;G.set=Object.assign(DEFAULT().set,G.set||{});if(state&&!hadMgr){G.set.autoLines=false;G.set.autoFares=false}}
  G.tech=G.tech||{};G.gdone=G.gdone||{};
  if(state&&!state.tour||G.tour&&!G.tour.done&&(G.level>=1||G.flights>30))G.tour={done:1};
  if(state&&!state.stamps){G.stamps={};for(const S of STAMPS){try{if(S.t())G.stamps[S.id]=G.day||dayOf(G.clock)}catch(e){}}}
  if(!Array.isArray(G.crews)||(state&&!state.crews)){G.crews=[];for(let k=0;k<crewTarget();k++)G.crews.push(mkCrew(G.clock))}G.crews.forEach(c=>{c.res=0;if(c.back==null)c.back=c.free||0});if(state&&state.set&&!('autoCrews' in state.set))G.set.autoCrews=true;if(G.set.chal==null)G.set.chal=true;
  if(state&&!state.routes){G.routes={};for(let t=0;t<5;t++){if(!has('rt:'+t))continue;CITIES.filter(c=>c[2]===t).sort((x,y)=>y[4]-x[4]).slice(0,t===0?5:4).forEach(c=>G.routes[c[0]]={f:1})}}
  G.routes=G.routes||{};G.rs=G.rs||{};for(const c in G.routes)if(!CITY[c])delete G.routes[c];
  if(state&&!state.gdone){for(const g of GOALS){try{const [v,t]=g.p();if(v>=t)G.gdone[g.id]=1}catch(e){}}}
  G.day=dayOf(G.clock);if(!G.dstat)G.dstat={pax:0,arr:0,flights:0,ontime:0,rev:0,cost:0,rep0:G.rep};
  if(G.seen==null)G.seen=state?21:UPDATES[0].v; // new games have seen everything; airports from before What's new see this release's notes once
  applyLayout(G.layout||'classic');
  R.rwy={q:[],act:[null,null]};R.lot=new Array(540).fill(0);R.platform=[];R.train={state:'away',t:3,x:null};R.lotFull=0;
  R.arrQ=[];R.booths=[];R.egates=[];R.arrBelt=[];
  R.pax=[];R.ciQ=[];R.secQ=[];R.ftQ=[];R.desks=[];R.kiosks=[];R.lanes=[];R.ftL={p:null,t:0};R.belt=[];R.st=[...Array(NG).keys()].map(mkStandRT);R.st.forEach((S,i)=>S.hold=i*6);R.floaters=[];R.toasts=[];R.fx={fog:0,rush:0,sick:0,strike:0,hedge:0,fuelUp:0,fuelDown:0,snow:0,storm:0,rain:0,line:{},leaves:0,roadworks:0};R.autoN={};R.tram={state:'away',t:2,x:null};R.bus={state:'away',t:1,x:null};R.tramQ=[];R.busQ=[];R.reg=null;for(const P of PLOTS)scheduleEvent(P.id);regionTick();
  R.nextEvent=G.clock+60;R.lastMin=Math.floor(G.clock);R.sel=G.stands.findIndex(s=>s.built);if(R.sel<0)R.sel=0;
  if(R.sim)return;
  setView(G.tab==='region'?'region':G.tab==='routes'?'world':'airport');$('#airline').textContent=G.name;$('#lvlName').textContent=lvlName(G.level);renderPlanBtn();boardSig='';renderBoard();renderHist();renderTabs();renderPanel();renderCam();renderToasts();syncSound();save();
}

