/* ================= departures: check-in and security ================= */
// Passengers come in from the forecourt (walkIn) and check in at an island of desks, each with its own queue, unless they
// did it online. Kiosks print boarding passes; with bag drop, anyone with hold bags then drops them at a counter, and so
// do online passengers with bags. Every bag leaves on the belt behind its desk or counter (finishCheckin → R.belt).
// Security: boarding-pass gates at the hall's entrance, then a queue (families and those who need help have their own
// lanes), then a lane: divest into trays, walk through the scanner, repack. Some bags are pulled aside and searched at a
// table. A lane is the only way into the market place, where airside() takes over.
//
// R.ciQ holds everyone queuing to check in, in the order they joined; p.isl says which queue: an island (0–3), the kiosks
// (CI_K) or bag drop (CI_B). R.secQ holds the security queue; p.famL marks families and those who need help.
const CI_K=4,CI_B=5,IX=k=>230+k*90; // the kiosk and bag drop queues; island k's centre (its desks are 2k and 2k+1)
const deskX=i=>IX(i>>1)+(i&1?19:-19),kioskX=i=>30+i*20,dropX=i=>122+i*18,laneX=i=>304+i*20,FT_X=462;
const BP_X=i=>110+i*18,BP_Y=674; // the boarding-pass gates at the security hall's entrance
const SRCH=i=>({x:498+(i%2)*38,y:614+(i>>1)*16}); // search tables, one for each open lane
const ctOn=()=>G.lv.ctscan>0,searchRate=()=>ctOn()?1/30:1/12;
// a zig-zag queue: rows of `per` places from x0, `gap` apart; past its rows, people crowd into them again, a little offset
// (rev: the front is at the right-hand end)
function zig(j,x0,per,y0,rows,gap,rev){const r=Math.floor(j/per),k=j%per,ro=r%rows,o=r>=rows?4:0;return slot(((ro%2===0)!==!!rev?x0+k*8:x0+(per-1-k)*8)+o,y0+ro*gap+(r>=rows?3:0))}
const qSlot=(q,j)=>q<CI_K?zig(j,IX(q)-36,10,734,4,9):q===CI_K?zig(j,24,10,716,3,10):zig(j,114,9,716,3,10);
const ciSlot=i=>qSlot(i%4,Math.floor(i/4)); // the islands' queues, for the fit check
// security: the queue's front rows run beneath the lanes, then it zig-zags back towards the gates; families queue beside their lanes
const secSlot=j=>j<38?zig(j,296,19,662,2,8):zig(j-38,24,21,667,6,-9,1),famSlot=j=>zig(j,200,11,658,5,-9,1);
const ftSlot=i=>slot(FT_X-12+(i%3)*7,Math.min(675,663+Math.floor(i/3)*6)),srchSlot=j=>slot(482+(j%10)*7,676-((j/10|0)%2)*4);
const LAND_ST=new Set(['new','walkIn','queue','desk','kiosk','drop','bpGate','bpTap','secQ','ftQ','divest','scan','repack','srchQ','srch','secOut','sec']);
['bpGate','scan','secOut','srchQ'].forEach(s=>BUGGY_ST.add(s));
// departures' runtime: the search queue and the family lanes. Kept beside the lanes, so a load (resetAll) starts it afresh.
const DEP=()=>{const d=R.dep;if(d&&d.of===R.lanes)return d;return R.dep={of:R.lanes,sq:[],fam:1}};
const CIN=[0,0,0,0,0,0]; // how many are in each check-in queue, counted each update
const DEP_LOG={}; // what the checks read: who checked in where, who each lane served, how many bags were searched
const logDep=k=>{DEP_LOG[k]=(DEP_LOG[k]||0)+1};

/* ---------- upgrades and the Masterplan ---------- */
Object.assign(UPG,{
  bagdrop:{tab:'terminal',sec:'Check-in',icon:'bag',name:'Bag drop',max:4,base:60,mult:2.1,lvl:1,fx:(l,m)=>m?`<b>${l}</b> bag drop counters`:`<b>${l}</b> → <b>${l+1}</b> bag drop counters. Kiosk and online passengers drop their bags in 40% of a check-in.`},
  ctscan:{tab:'terminal',sec:'Security',icon:'scan',name:'CT scanners',max:1,base:900,mult:1,lvl:4,fx:(l,m)=>m?'Liquids stay in bags: quicker trays, 1 bag in 30 searched':'Liquids stay in bags: trays 25% quicker, and 1 bag in 30 searched instead of 1 in 12'}
});
// keep each new upgrade beside its section's others, so the Terminal tab shows one heading per section
for(const [k,after] of [['bagdrop','online'],['ctscan','ftsales']]){const e=Object.entries(UPG);for(const [key] of e)delete UPG[key];
  for(const [key,u] of e){if(key!==k)UPG[key]=u;if(key===after)UPG[k]=e.find(x=>x[0]===k)[1]}}
UPG.kiosks.fx=(l,m)=>m?`<b>${l}</b> kiosks print boarding passes`:`<b>${l}</b> → <b>${l+1}</b> kiosks. They print boarding passes; with bag drop, bags go there. No wages.`;
UPG.online.fx=(l,m)=>m?`<b>${l*12}%</b> check in online`:`<b>${l*12}%</b> → <b>${(l+1)*12}%</b> check in online: straight to security, or to bag drop with bags`;
{const T=TECH_BY.t_self;T.u.push('up:bagdrop');NODE_OF['up:bagdrop']=T.id;T.d='Kiosks, online check-in and bag drop.'}
{const T={id:'t_ct',b:'term',t:4,c:1,d:'Liquids stay in bags: quicker security, fewer searches.',n:'CT scanners',u:['up:ctscan']};TECH.push(T);TECH_BY[T.id]=T;NODE_OF['up:ctscan']=T.id}

/* ---------- staff: bag drop counters are staffed and rostered like desks ---------- */
WAGE.drops=2.5;OWN.drops=()=>G.lv.bagdrop;
WAGE.srch=2; // a searcher at each open search table, one for each open lane and the fast track
const tablesOpen=D=>Math.min(8,D.lanes+(D.ft?1:0));
function dropsOpen(){if(!G.lv.bagdrop)return 0;const n=staffed('drops');return R.fx.strike>G.clock?Math.max(1,Math.ceil(n/2)):n}
const islOpen=(k,D)=>(2*k<D.desks)+(2*k+1<D.desks); // how many of island k's desks are open
function bestIsland(D){let b=0,bw=1e9;for(let k=0;k<4;k++){const o=islOpen(k,D);if(!o)continue;const w=(CIN[k]+1)/o;if(w<bw){bw=w;b=k}}return b}
TERM_MINUTE.push(()=>{
  const n=dropsOpen()*WAGE.drops+tablesOpen(derived())*WAGE.srch;if(n)spend(n*(G.wageMul||1)*payMul()*(R.reg?R.reg.wageMul:1)/60,'wages');
  if(G.lv.roster&&G.auto&&R.lastMin%2===0){R.autoN.desks=clamp(Math.ceil((CIN[0]+CIN[1]+CIN[2]+CIN[3])/6),1,OWN.desks());if(G.lv.bagdrop)R.autoN.drops=clamp(Math.ceil(CIN[CI_B]/6),1,OWN.drops())}
  // families and those who need help get as many lanes as their share of the queue, at least one when two lanes are open
  const d=DEP(),D=derived();let f=0;for(const p of R.secQ)if(p.famL)f++;
  d.fam=D.lanes<2?0:clamp(Math.round(D.lanes*f/Math.max(1,R.secQ.length)),1,D.lanes-1);
});

/* ---------- check-in ---------- */
PAX_STEP.walkIn=(p,dt,D)=>{if(walk(p,110*p.spd,dt))enterLandside(p,D)};
function joinCi(p,q){p.state='queue';p.isl=q;R.ciQ.push(p);CIN[q]++}
function enterLandside(p,D){
  D=D||derived();
  if(p.checked&&!p.online&&G.lv.bagdrop&&rnd()<D.online)p.online=true; // with bag drop, passengers with bags check in online too
  if(p.online){if(p.checked&&dropsOpen())joinCi(p,CI_B);else if(p.checked)joinCi(p,bestIsland(D));else enterSecurity(p);return}
  const L=p.leader;if(L&&L.state==='queue'&&(L.isl<CI_K?islOpen(L.isl,D):L.isl===CI_K&&D.kiosks&&(!p.checked||dropsOpen()))){joinCi(p,L.isl);return} // stay with the party
  const k=bestIsland(D),isW=(CIN[k]+1)*D.checkin/islOpen(k,D)+D.checkin,drops=dropsOpen();
  if(D.kiosks){const kW=(CIN[CI_K]+1)*D.kiosk/D.kiosks+D.kiosk;
    if(!p.checked?kW<=isW:drops&&kW+(CIN[CI_B]+1)*0.4*D.checkin/drops+0.4*D.checkin<isW){joinCi(p,CI_K);return}}
  joinCi(p,k);
}
function finishCheckin(p,x,by){
  if(by)logDep(by+(p.checked?':bag':''));
  if(p.checked){if(G.lv.bagfee>0)earn(p.F.ac.fare*0.5,'bags',x,691,'#D9A066',p.F);R.belt.push({x,F:p.F})}
  enterSecurity(p);
}
function afterKiosk(p,x){if(p.checked&&dropsOpen()){p.kiosk=true;joinCi(p,CI_B)}else finishCheckin(p,x,'kiosk')}
function pickCi(q){const j=R.ciQ.findIndex(p=>p.isl===q);return j<0?null:R.ciQ.splice(j,1)[0]}
const ciTime=(q,t)=>t*(q.leader?0.4:1)*(q.type==='prm'?1.5:1);
function updateCheckin(dt,D){
  const drops=dropsOpen();
  for(let i=0;i<8;i++){
    const d=R.desks[i]||(R.desks[i]={p:null,t:0});
    if(i<D.desks&&R.ciQ.length)take(d,()=>{const q=pickCi(i>>1);if(q&&q.isl!==i>>1)logDep('wrongIsland');return q},'desk',q=>ciTime(q,D.checkin));
    if(d.p) serve(d,deskX(i),707,dt,p=>finishCheckin(p,IX(i>>1),'desk'),deskX(i),721);
  }
  for(let i=0;i<4;i++){
    const k=R.kiosks[i]||(R.kiosks[i]={p:null,t:0});
    if(i<D.kiosks&&R.ciQ.length)take(k,()=>pickCi(CI_K),'kiosk',D.kiosk);
    if(k.p) serve(k,kioskX(i),707,dt,p=>afterKiosk(p,kioskX(i)),kioskX(i)+3,713);
  }
  for(let i=0;i<4;i++){ // bag drop counters sit beside the desks' spares, R.desks[8…11]
    const b=R.desks[8+i]||(R.desks[8+i]={p:null,t:0});
    if(i<drops&&R.ciQ.length)take(b,()=>pickCi(CI_B),'drop',q=>ciTime(q,0.4*D.checkin));
    if(b.p) serve(b,dropX(i),706,dt,p=>finishCheckin(p,dropX(i),p.kiosk?'dropK':p.online?'dropO':'drop'),dropX(i)+4,711);
  }
  CIN.fill(0);
  for(const p of R.ciQ){ // a queue whose desks have closed moves to the shortest open one
    if(p.isl==null||p.isl<CI_K&&!islOpen(p.isl,D)||p.isl===CI_K&&!D.kiosks||p.isl===CI_B&&!drops){p.isl=bestIsland(D)}
    p.wait+=dt;const s=qSlot(p.isl,CIN[p.isl]++);moveTo(p,s.x,s.y,70*p.spd,dt);
  }
}

/* ---------- security ---------- */
function enterSecurity(p){
  const D=derived();
  const vip=p.biz||p.prio,ftW=R.ftQ.length*0.6,secW=R.secQ.length/Math.max(1,D.lanes);
  if(D.ft&&(vip?ftW<=secW+2:R.ftQ.length<8&&rnd()<D.ftBuy*PTYPE[p.type||'lei'].ft)){
    if(!vip) earn(p.F.fare*0.6,'fast',null,null,null,p.F);
    p.fast=true;
  }
  p.state='bpGate';p.tx=BP_X(Math.floor(p.rand*4));p.ty=BP_Y;
}
PAX_STEP.bpGate=(p,dt)=>{if(moveTo(p,p.tx,p.ty,80*p.spd,dt)){p.state='bpTap';p.t=0.06}};
PAX_STEP.bpTap=(p,dt)=>{p.t-=dt;if(p.t>0)return;p.room=hallId('sec');
  if(p.fast&&G.lv.fasttrack){p.state='ftQ';R.ftQ.push(p)}else{p.state='secQ';p.famL=p.type==='fam'||p.type==='prm';R.secQ.push(p)}};
// family lanes (the first d.fam) take families and those who need help first, then anyone; the others never take them.
// A free lane calls whoever is nearest in the front row, which runs beneath the lanes, as a marshal would. With one lane open there are no family lanes.
function pickSec(fam,isFam,x){const Q=R.secQ;let j=-1;
  if(fam&&isFam)j=Q.findIndex(p=>p.famL);
  if(j<0){let bd=1e9;for(let k=0,n=0;k<Q.length&&n<19;k++){const p=Q[k];if(fam&&p.famL)continue;n++;const d=Math.abs(p.x-x);if(d<bd){bd=d;j=k}}}
  return j<0?null:Q.splice(j,1)[0]}
const divestT=(D,m)=>D.sec*m*(ctOn()?0.75:1);
function afterDivest(p,i){ // the tray goes through the scanner as the passenger walks through the arch, to repack
  logDep('screened');p.sl=i;p.srch=rnd()<searchRate();if(p.srch)logDep('searched');
  p.state='scan';p.tx=(i<8?laneX(i):FT_X)-5;p.ty=606;
}
const hurry=p=>p.F.plane.state==='boarding'&&G.clock>=p.F.std-12;
function clearSec(p){p.cleared=true;p.srch=false;airside(p,p.sl<8?laneX(p.sl):FT_X)}
PAX_STEP.scan=(p,dt,D)=>{if(moveTo(p,p.tx,p.ty,45*p.spd,dt)){p.state='repack';p.t=0.3+0.4*divestT(D,1)}};
PAX_STEP.repack=(p,dt)=>{p.t-=dt;if(p.t>0)return;if(p.srch&&!hurry(p)){p.state='srchQ';DEP().sq.push(p)}else clearSec(p)};
PAX_STEP.secOut=(p,dt)=>{if(moveTo(p,p.tx,p.ty,80*p.spd,dt))clearSec(p)};
function updateSecurity(dt,D){
  const d=DEP(),fam=D.lanes<2?0:d.fam||1;
  for(let i=0;i<8;i++){
    const L=R.lanes[i]||(R.lanes[i]={p:null,t:0});
    if(i<D.lanes&&R.secQ.length)take(L,()=>{const q=pickSec(fam,i<fam,laneX(i)-5);if(q&&q.famL)logDep(!fam||i<fam?'famLane':'famOther');return q},'divest',divestT(D,1));
    if(L.p) serve(L,laneX(i)-5,642,dt,p=>afterDivest(p,i),laneX(i)-5,654);
  }
  if(D.ft){const L=R.ftL;if(R.ftQ.length)take(L,()=>R.ftQ.shift(),'divest',divestT(D,0.6));if(L.p)serve(L,FT_X-5,642,dt,p=>afterDivest(p,8),FT_X-5,654)}
  else if(R.ftQ.length){while(R.ftQ.length){const p=R.ftQ.shift();p.state='secQ';p.famL=p.type==='fam'||p.type==='prm';R.secQ.push(p)}}
  // search tables: one for each open lane; a bag takes 2 minutes to open and search, unless the flight is boarding
  const nT=tablesOpen(D);
  if(d.sq.some(hurry))d.sq=d.sq.filter(p=>{if(!hurry(p))return true;p.state='secOut';p.tx=(p.sl<8?laneX(p.sl):FT_X)-5;p.ty=603;return false});
  for(let i=0;i<8;i++){
    const T=R.lanes[8+i]||(R.lanes[8+i]={p:null,t:0}),s=SRCH(i);
    if(i<nT&&d.sq.length)take(T,()=>d.sq.shift(),'srch',2);
    if(T.p) serve(T,s.x-11,s.y,dt,p=>{p.state='secOut';p.tx=(p.sl<8?laneX(p.sl):FT_X)-5;p.ty=603},s.x-11,s.y+7);
  }
  let m=0,f=0;
  for(const p of R.secQ){p.wait+=dt;const s=fam&&p.famL?famSlot(f++):secSlot(m++);moveTo(p,s.x,s.y,150*p.spd,dt)}
  R.ftQ.forEach((p,i)=>{p.wait+=dt;const s=ftSlot(i);moveTo(p,s.x,s.y,75*p.spd,dt)});
  d.sq.forEach((p,i)=>{const s=srchSlot(i);moveTo(p,s.x,s.y,70*p.spd,dt)});
}

/* ---------- the Terminal tab: Departures and Staff ---------- */
TERM_PANEL.dep=[()=>{
  const D=derived(),d=DEP(),own=OWN.desks(),row=(ic,t,s)=>`<div class="row">${svg(ic)}<div><div class="rt">${t}</div><div class="rd">${s}</div></div></div>`;
  let h=`<div class="sec">The check-in hall</div>`;
  const isl=[0,1,2,3].filter(k=>2*k<own).map(k=>`${'ABCD'[k]} <b>${islOpen(k,D)}/${Math.min(2,own-2*k)}</b>`);
  h+=row('desk',`${isl.length} island${isl.length>1?'s':''} of desks`,`${isl.join(' · ')} open. Each has its own queue.`);
  if(G.lv.kiosks)h+=row('kiosk','Kiosks',`${G.lv.kiosks} printing boarding passes${G.lv.bagdrop?'. Passengers with bags go on to bag drop.':''}`);
  if(G.lv.bagdrop)h+=row('bag','Bag drop',`${dropsOpen()} of ${G.lv.bagdrop} counters open, for kiosk and online passengers with bags`);
  h+=`<div class="sec">The security hall</div>`+row('lane','Lanes',`${D.lanes} open${D.lanes>=2?`, ${d.fam||1} for families and those who need help`:''}${D.ft?', and the fast track lane':''}`);
  h+=row('scan','Searches',`1 bag in ${ctOn()?30:12} opened at a search table, 2 min each, with a searcher (${money(WAGE.srch*(G.wageMul||1))} an hour) at each of ${tablesOpen(D)} tables${ctOn()?'. CT scanners let liquids stay in bags.':''}`);
  return h}];
TERM_PANEL.staff=[()=>{
  if(!G.lv.bagdrop)return '';const auto=G.lv.roster&&G.auto,own=OWN.drops(),n=staffed('drops');
  return `<div class="sec">Bag drop</div><div class="row">${svg('bag')}<div><div class="rt">Bag drop</div><div class="rd">${money(WAGE.drops*(G.wageMul||1))} an hour each${auto?' · set by rostering':''}</div></div><div class="lever"><button data-staff="drops:-1" ${auto||n<=1?'disabled':''} aria-label="Staff one fewer">−</button><output data-live="staff-drops">${n}</output><button data-staff="drops:1" ${auto||n>=own?'disabled':''} aria-label="Staff one more">+</button><span class="live">/ ${own}</span></div></div>`}];

/* ---------- drawing: islands, kiosks and bag drop; gates, lanes, the search tables ---------- */
TERM_DRAW.push(onFl(1,D=>{
  const d=DEP(),own=OWN.desks(),drops=dropsOpen(),dim='#262C32',off='#3A424B',lbl=(t,x,y)=>mono(t,x,y,'#56606A',6.5,'center');
  // islands: a belt down the middle into the one behind the desks, a desk either side, back to back
  for(let k=0;k<4;k++){if(2*k>=own)continue;const x=IX(k);ctx.fillStyle='#2A3037';ctx.fillRect(x-2,688,4,34);
    for(const s of [0,1]){const i=2*k+s,o=i<own,open=i<D.desks,dx=s?1:-1;ctx.fillStyle=open?'#6A7580':o?off:dim;ctx.fillRect(x+dx*9-(s?0:5),699,5,16);if(open){ctx.fillStyle='#FFC72C';ctx.fillRect(x+dx*6-2,705,4,4)}}
    lbl('ISLAND '+'ABCD'[k],x,731)}
  for(let i=0;i<4;i++){const open=i<D.kiosks;if(!open&&i>=G.lv.kiosks)continue;ctx.fillStyle=open?'#5CC8FF':dim;ctx.fillRect(kioskX(i)-4,694,8,6);ctx.fillStyle='#ECE8DF';ctx.fillRect(kioskX(i)-1.5,700,3,2)}
  for(let i=0;i<G.lv.bagdrop;i++){const open=i<drops,x=dropX(i);ctx.fillStyle=open?'#6A7580':off;ctx.fillRect(x-7,695,14,4);ctx.fillStyle='#39414A';ctx.fillRect(x-7,690,14,4);if(open){ctx.fillStyle='#FFC72C';ctx.fillRect(x+4,690,4,4)}}
  if(G.lv.bagdrop)lbl('BAG DROP',150,748);if(G.lv.kiosks)lbl('KIOSKS',60,748);
  // boarding-pass gates at the security hall's entrance
  for(let i=0;i<4;i++){const x=BP_X(i);ctx.fillStyle='#5CC8FF';ctx.fillRect(x-7,BP_Y-3,3,6);ctx.fillRect(x+4,BP_Y-3,3,6)}
  // lanes: divest tables and a roller belt, the scanner and its arch, the repack bench; family lanes are marked green
  const fam=D.lanes<2?0:d.fam||1,lane=(x,open,own,closed,col)=>{
    if(open)ctx.fillStyle='#191D22',ctx.fillRect(x-5,SEC_LINE-2,10,4);
    ctx.fillStyle=open?'#39414A':'#1F242A';ctx.fillRect(x+1,603,7,48);
    ctx.fillStyle=open?'#4E5964':dim;ctx.fillRect(x,612,9,15);ctx.fillStyle=open?col:closed?'#7A3A42':own?off:dim;ctx.fillRect(x-9,617,2,9);ctx.fillRect(x-2,617,2,9);
    if(open){ctx.fillStyle='#FFC72C';ctx.fillRect(x+9,636,4,4)}};
  for(let i=0;i<8;i++){const x=laneX(i),open=i<D.lanes;if(open&&i<fam){ctx.fillStyle='rgba(107,227,154,.12)';ctx.fillRect(x-10,603,20,58)}
    lane(x,open,i<OWN.lanes(),i===D.lanes&&R.fx.sick>G.clock,i<fam&&open?'#6BE39A':'#8C97A1')}
  if(fam)lbl('FAMILIES',242,677);
  if(D.ft){lane(FT_X,true,true,false,'#F5D08A');lbl('FAST TRACK',FT_X,660)}
  // trays: on the divest table, riding the belt with their owner, and at the repack bench; bags opened at the search tables
  ctx.fillStyle='#8C97A1';for(let i=0;i<9;i++){const L=i<8?R.lanes[i]:R.ftL;if(L&&L.p&&L.p.state==='divest'){const x=i<8?laneX(i):FT_X;ctx.fillRect(x+2,638,5,4)}}
  const nT=tablesOpen(D);
  for(let i=0;i<nT;i++){const s=SRCH(i),T=R.lanes[8+i],busy=T&&T.p&&T.p.state==='srch'&&Math.abs(T.p.x-(s.x-11))<1;ctx.fillStyle='#39414A';ctx.fillRect(s.x-6,s.y-4,12,8);
    ctx.fillStyle='#FFC72C';ctx.fillRect(s.x+8,s.y-2,4,4);if(busy){ctx.fillStyle='#D9A066';ctx.fillRect(s.x-5,s.y-3,5,6);ctx.fillStyle='#ECE8DF';ctx.fillRect(s.x+1,s.y-2,3,4)}}
  if(nT)lbl('SEARCH',517,607);
  ctx.fillStyle='#8C97A1';for(const p of R.pax)if(p.state==='scan'||p.state==='repack'){const x=p.tx+7;ctx.fillRect(x,p.state==='scan'?p.y-2:604,5,4)}
}));
SIMX.depLog=DEP_LOG;Object.assign(SIMX,{tablesOpen,WAGE,qSlot,secSlot,famSlot,ftSlot,srchSlot,deskX,kioskX,dropX,laneX,IX,dropsOpen,searchRate,DEP});
