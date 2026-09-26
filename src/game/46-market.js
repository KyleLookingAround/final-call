/* ================= the market place: shops with people inside, gate calls, seats, and passengers' time airside ================= */
// Once through security (or off a connecting flight) a passenger stays airside until the board shows their gate. Meanwhile
// they shop, eat, sit by the windows, charge a phone or take the children to the play area. A shop has room for so many:
// when it's full they go elsewhere. Each gate is called a set time before boarding (the Gate calls policy, or the duty
// manager), and then its passengers walk to it and sit in its lounge, or stand when the seats are full.

/* ---------- gate calls ---------- */
// Boarding here lasts about an hour, so the board's departure is taken as 45 minutes after boarding starts: a standard call
// comes as boarding starts, an early one 15 minutes before and a late one 15 minutes after. Until then the plane boards no
// one. The duty manager calls gates as boarding starts, and far ones early enough that walkers don't hold boarding up.
POLICIES.push({k:'gates',name:'Gate calls',opts:[[60,'Early 60 min'],[45,'Standard 45 min'],[30,'Late 30 min']],
  get desc(){return SET().autoDuty?'The duty manager calls each gate in time for its walk from the market place. Choose one to take over.':'When the board shows each gate. Early: calmer boarding, less shopping. Late: more time in the shops, but boarding starts later.'}});
POLDEF.gates=45;
const CALL_LEAD={60:15,45:0,30:-15}; // minutes before boarding starts
const isCalled=F=>F.called!=null||F.plane.state==='closing';
// the walk from the middle of the market place to stand i's lounge, in pixels, worked out once per layout
function gateWalk(i){
  const c=R.gwalk&&R.gwalk.lay===LAY&&R.gwalk.pb===G.pierB?R.gwalk:(R.gwalk={lay:LAY,pb:G.pierB,d:[]});
  if(c.d[i]==null){const [x0,y0,x1,y1]=mktBox(),p={x:(x0+x1)/2,y:(y0+y1)/2,room:hallId('mkt'),way:null},s=spotPos(i,8);let d=0,x=p.x,y=p.y;
    route(p,STAND_ROOM[i]);const w=p.way||[];
    for(let k=0;k<w.length;k+=4){const seg=Math.hypot(w[k]-x,w[k+1]-y);d+=w[k+3]===1?TRAIN_EVERY*40+seg*80/TRAIN_V:w[k+3]===2?seg/2:seg;x=w[k];y=w[k+1]}
    c.d[i]=d+Math.hypot(s.x-x,s.y-y)}
  return c.d[i];
}
const gateWalkMin=(i,D)=>gateWalk(i)/(D.cwalk*(G.lv.mover?1.6:1));
function callLead(i,D){return SET().autoDuty?clamp(Math.round(gateWalkMin(i,D))-3,0,15):CALL_LEAD[pol('gates')]??0}
// minutes until boarding starts, as far as anyone can tell yet
function boardEta(F,D){
  const pl=F.plane,st=pl.state,dep=F.arr.onboard*0.05; // passengers leave the plane about three seconds apart
  if(st==='boarding'||st==='closing')return 0;
  if(st==='turnaround')return Math.max(0,pl.t);
  if(st==='deplaning')return dep+D.clean;
  if(st==='inbound')return Math.max(0,D.tow-pl.t)+dep+D.clean;
  if(st==='approach')return (F.landed?0:D.land*(1+R.rwy.q.length/D.runways))+D.tow+dep+D.clean;
  return Infinity;
}
// the board: 'GATE 10:15' until the call, then the gate and GO TO GATE
function gateCallText(F){
  if(isCalled(F))return 'GO TO GATE';
  const D=R.callD&&R.callD.at===R.step?R.callD.D:(R.callD={at:R.step,D:derived()}).D,i=F.arr.stand,lead=callLead(i,D),at=F.boardStart!=null?F.boardStart-lead:G.clock+boardEta(F,D)-lead;
  return at<Infinity?'GATE '+hhmm(Math.ceil(Math.max(G.clock,at)/5)*5):'CHECK-IN';
}
// every game minute: call the gates that are due, and let crowded lounges cost a little rating
TERM_MINUTE.push(()=>{
  const D=derived(),n=R.standN||(R.standN=[]);
  for(const i of SIDX){n[i]=0;const F=R.st[i].F;if(!F||F.freighter||F.called!=null)continue;const lead=callLead(i,D);if(F.boardStart!=null?G.clock-F.boardStart>=-lead:boardEta(F,D)<=lead)F.called=G.clock}
  for(const p of R.pax)if(p.state==='gate'&&p.spot<0)n[p.stand]++;
  for(const i of SIDX)if(n[i]>=15)repAdj(-0.0005*Math.min(n[i],60)/15,'lounge');
  if(R.lastMin%60===0){R.awayH=R.away||[];R.away=[]}
});

/* ---------- where things are in the market place ---------- */
function mktBox(){const P=ROOMS[hallId('mkt')].poly,xs=P.map(p=>p[0]),ys=P.map(p=>p[1]);return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]}
// The hall's furniture, from its corners: window seats and a food court at the left, the play area beside them, and at
// the right the toilets, a phone charging bar and more seats. The middle stays clear for the walk from security, and holds
// the walk-through duty free once it's built. Each kind of place has numbered spots; 'stand' is where people wait when
// the seats are taken.
function mktPlan(){
  if(R.mplan&&R.mplan.lay===LAY)return R.mplan;
  const [x0,y0,x1,y1]=mktBox(),M={lay:LAY,box:[x0,y0,x1,y1]},L=laneX(0)-10,Rt=FT_X+14;
  M.window=[];for(let k=0;k<17;k++)M.window.push([x0+116+k*9,y0+9]); // clear of the hall's name
  M.tables=[];M.food=[];for(let r=0;r<3;r++)for(let c=0;c<4;c++){const tx=x0+24+c*33,ty=y0+28+r*17;M.tables.push([tx,ty]);M.food.push([tx-6,ty],[tx+6,ty])}
  M.playR=[x0+160,y0+24,Math.min(L-12,x0+262),y1-10];M.play=[];for(let k=0;k<14;k++)M.play.push([M.playR[0]+10+(k%7)*((M.playR[2]-M.playR[0]-20)/6),M.playR[1]+12+Math.floor(k/7)*22]);
  M.playB=[];for(let k=0;k<10;k++)M.playB.push([k<5?M.playR[0]-7:M.playR[2]+7,M.playR[1]+4+(k%5)*9]); // benches either side
  M.wcR=[x1-34,y0+6,x1-4,y0+40];M.wc=[];for(let k=0;k<4;k++)M.wc.push([M.wcR[0]+8+(k%2)*14,M.wcR[1]+10+Math.floor(k/2)*14]);
  M.chargeR=[Rt+4,y0+30,x1-40,y0+36];M.charge=[];for(let k=0;k<8;k++)M.charge.push([M.chargeR[0]+4+(k%4)*((M.chargeR[2]-M.chargeR[0]-8)/3),k<4?y0+25:y0+41]);
  M.seats=[];for(let k=0;k<14;k++)M.seats.push([Rt+8+(k%7)*((x1-Rt-16)/6),y1-22+Math.floor(k/7)*9]);
  M.stand=[[x0+14,y0+20,x0+150,y1-8],[Rt+4,y0+48,x1-6,y1-28]];
  M.df=[L,y0+6,Rt,y1-2]; // the walk-through duty free, from the lanes' exits up to the market place
  return R.mplan=M;
}
const ACT_OF=p=>p.kid?'play':p.type==='fam'?'playB':p.type==='grp'?'food':p.type==='work'?(p.rand<0.6?'charge':'window'):null;
function pickAct(p){const a=ACT_OF(p);if(a)return a;const r=rnd();return r<0.4?'window':r<0.72?'food':r<0.9?'seats':'wc'}

/* ---------- who is where: each shop's and each market spot's occupants, gathered once a step ---------- */
function occ(){
  if(!R.occ||R.occStep!==R.step){R.occStep=R.step;const o=R.occ={};
    for(const p of R.pax){const k=p.state==='shop'||p.state==='toShop'?'s'+p.shop:p.state==='mkt'||p.state==='toMkt'?p.act:null;if(k&&p.sl>=0)(o[k]||(o[k]=[])).push(p.sl)}}
  return R.occ;
}
function freeSpot(key,n){const o=occ(),u=o[key]||(o[key]=[]);if(u.length>=n)return -1;for(let s=0;s<n;s++)if(!u.includes(s)){u.push(s);return s}return -1}
const shopUsed=j=>(occ()['s'+j]||[]).length;

/* ---------- shops: what each kind has inside and how many it holds ---------- */
// Browsing shops: look along the shelves, then queue at a till to pay. Sit-down places: order (or check in) at the counter,
// then sit. Spots are in rows across the floor, the counter and tills at the right-hand end, and anyone waiting for a till
// queues out of the door.
const SHOP_IN={coffee:{cap:6,up:2,sit:1},books:{cap:8,up:3},cafe:{cap:10,up:3,sit:1},bar:{cap:10,up:3,sit:1},duty:{cap:12,up:3},lounge:{cap:12,up:3,sit:1},dining:{cap:10,up:3,sit:1},luxury:{cap:6,up:2},spa:{cap:8,up:2,sit:1}};
const shopIn=j=>SHOP_IN[SHOPS[G.shops[j].type].id];
const shopCap=j=>{const s=G.shops[j];if(!s)return 0;const k=SHOP_IN[SHOPS[s.type].id];return k.cap+k.up*s.lvl};
const tills=j=>1+Math.floor(G.shops[j].lvl/2);
const inPt=(j,s)=>shopPt(j,8+(s%8)*10,15+Math.floor(s/8)*10);
// after security (into the market place), or off a connecting flight (in that stand's room)
function airside(p,x,room){
  if(room==null){p.x=x;p.y=SEC_LINE-8;p.room=hallId('mkt');if(G.lv.wtdf){p.state='df';p.di=0;p.dx=x;return}}else{p.x=x;p.y=516;p.room=room}
  p.nv=0;nextAct(p,true);
}
// what next: the gate once it's called; otherwise a shop, or somewhere to wait in the market place. Anyone through
// security after their gate is called may still stop at one shop on the way, as they did before gate calls.
function nextAct(p,first){
  p.sl=-1;const called=isCalled(p.F);
  if(called&&!first){toGate(p);return}
  const L=p.leader;
  if(L&&(L.state==='toShop'||L.state==='shop')&&G.shops[L.shop]){const s=freeSpot('s'+L.shop,shopCap(L.shop));if(s>=0){toShop(p,L.shop,s);return}}
  if(!L&&pickShop(p,first)>=0)return;
  if(called){toGate(p);return}
  if(L&&(L.state==='toMkt'||L.state==='mkt')&&!p.kid){goAct(p,L.act==='play'?'playB':L.act);return}
  goAct(p,pickAct(p));
}
// a shop, if one tempts them and has room: the first time out of security as before, and less often after that
function pickShop(p,first){
  const built=[];G.shops.forEach((s,j)=>{if(s&&shopOpen(j))built.push(j)});if(!built.length)return -1;
  for(let k=built.length-1;k>0;k--){const j=Math.floor(rnd()*(k+1));[built[k],built[j]]=[built[j],built[k]]}
  const again=first||p.away?1:0.08/(1+p.nv),try_=j=>{const s=freeSpot('s'+j,shopCap(j));if(s<0){p.away=1;(R.away||(R.away=[]))[j]=(R.away[j]||0)+1;return -1}p.away=0;toShop(p,j,s);return j};
  if(p.biz||p.prio){const L=built.find(j=>SHOPS[G.shops[j].type].vip);if(L!=null&&rnd()<0.9&&try_(L)>=0)return L}
  for(const j of built){const sh=SHOPS[G.shops[j].type];if(sh.vip)continue;
    if(rnd()<again*Math.min(0.95,sh.pull*SHOP_PULL[j]*PTYPE[p.type||'lei'].shop*(p.type==='grp'&&sh.id==='bar'?2.5:1)*(1+0.3*((p.psize||1)-1)))&&try_(j)>=0)return j}
  return -1;
}
// a place along shop j's front: t along it, e out from its back wall (47 is just outside)
function shopPt(j,t,e){const a=SHOP_A[j]*Math.PI/180,c=exact(Math.cos(a)),s=exact(Math.sin(a));WP.x=SHOP_X[j]+t*c-e*s;WP.y=SHOP_Y[j]+t*s+e*c;return WP}
function toShop(p,j,s){
  p.state='toShop';p.shop=j;p.sl=s;p.late=isCalled(p.F);const t=8+(s%8)*10;shopPt(j,t,47);p.tx=WP.x;p.ty=WP.y;p.su=t;route(p,SHOP_ROOM[j]);
}
function goAct(p,a){
  const M=mktPlan(),list=M[a]||M.seats;let s=freeSpot(a,list.length);
  p.state='toMkt';p.act=a;p.sl=s;
  if(s>=0){p.tx=list[s][0];p.ty=list[s][1]}
  else{const Z=a==='play'||a==='playB'||a==='food'||a==='window'?M.stand[0]:M.stand[1];p.tx=Z[0]+rnd()*(Z[2]-Z[0]);p.ty=Z[1]+rnd()*(Z[3]-Z[1])}
  route(p,hallId('mkt'));
}
function toGate(p){
  p.sl=-1;const S=R.st[p.stand],j=S.spots.indexOf(null);
  if(j>=0){S.spots[j]=p;p.spot=j;const s=spotPos(p.stand,j);p.tx=s.x;p.ty=s.y}
  else{p.spot=-1;const a=rnd(),b=rnd(),bg=busGate(p.stand);if(bg){p.tx=bg[0]-67+a*130;p.ty=bg[1]+bg[2]*(14+b*12)}else{faceW(p.stand,-147+a*130,FACE_Y-14-b*12);p.tx=WP.x;p.ty=WP.y}}
  p.state='toGate';route(p,STAND_ROOM[p.stand]);
}
// the walk-through duty free: in from the lanes along the bottom aisle, back along the middle one and out at the top
function dfPath(p,k){const [x0,y0,x1,y1]=mktPlan().df;return [[p.dx,y1-10],[x1-8,y1-10],[x1-8,(y0+y1)/2],[x0+8,(y0+y1)/2],[x0+8,y0+8]][k]}
PAX_STEP.df=(p,dt,D)=>{
  const q=dfPath(p,p.di);if(!moveTo(p,q[0],q[1],D.cwalk*p.spd*0.6,dt))return;
  if(++p.di<5)return;
  if(rnd()<0.3*PTYPE[p.type||'lei'].shop&&!p.kid){const v=4*(1+0.6*p.F.ac.tier)*(G.lv.mall?1.4:1);G.dfEarned=(G.dfEarned||0)+v;earn(v,'shops',p.x,p.y-6,'#F5D08A',p.F)}
  p.nv=0;nextAct(p,true);
};
PAX_STEP.toShop=(p,dt,D)=>{
  if(!G.shops[p.shop]){nextAct(p,false);return}
  if(isCalled(p.F)&&!p.late){toGate(p);return}
  if(walk(p,D.cwalk*p.spd*walkMul(p),dt)){const k=shopIn(p.shop);p.state='shop';p.ph=k.sit?'pay':'look';p.t=SHOPS[G.shops[p.shop].type].dwell;p.t0=p.t;if(k.sit)joinTill(p)}
};
function joinTill(p){const Q=(R.till||(R.till=[]))[p.shop]||(R.till[p.shop]=[]);Q.push(p);p.pt=SHOPS[G.shops[p.shop].type].id==='coffee'?0.4:0.25}
// the till queue: the first few are served, one till each; anyone else waits out of the door
function tillStep(p,dt){
  const j=p.shop,Q=R.till[j]||(R.till[j]=[]),ok=q=>q.state==='shop'&&q.shop===j&&q.ph==='pay';
  while(Q.length&&!ok(Q[0]))Q.shift();
  let k=Q.indexOf(p);if(k<0){Q.push(p);k=Q.length-1}
  const n=tills(j);
  if(k<n){shopPt(j,91,16+k*10);if(moveTo(p,WP.x,WP.y,60*p.spd,dt)&&(p.pt-=dt)<=0){Q.splice(k,1);return true}}
  else{shopPt(j,Math.max(4,84-(k-n)*8),46);moveTo(p,WP.x,WP.y,60*p.spd,dt)}
  return false;
}
PAX_STEP.shop=(p,dt)=>{
  const s=G.shops[p.shop];if(!s){nextAct(p,false);return}
  const F=p.F;if(p.late?F.plane.state==='boarding'&&G.clock>=F.std-12:isCalled(F)){leaveShop(p);return} // the call, or the last minutes, cut a visit short
  p.t-=dt;
  if(p.ph==='pay'){if(tillStep(p,dt)){if(shopIn(p.shop).sit)p.ph='sit';else leaveShop(p)}return}
  inPt(p.shop,p.sl);moveTo(p,WP.x,WP.y,60*p.spd,dt);
  if(p.t<=0){if(p.ph==='look'){p.ph='pay';joinTill(p)}else leaveShop(p)}
};
function leaveShop(p){
  const s=G.shops[p.shop];
  if(s){const F=p.F,frac=clamp(1-Math.max(0,p.t)/p.t0,0.3,1),v=SHOPS[s.type].spend*(LAY.shopBonus&&LAY.shopBonus[SHOPS[s.type].id]||1)*Math.pow(1.25,s.lvl)*(1+0.6*F.ac.tier)*frac*(G.lv.mall?1.4:1);s.earned=(s.earned||0)+v;earn(v,'shops',p.x,p.y-6,'#F5D08A',F)}
  p.nv=(p.nv||0)+1;p.state='outShop';p.sl=-1;shopPt(p.shop,p.su,47);p.tx=WP.x;p.ty=WP.y;
}
PAX_STEP.outShop=(p,dt)=>{if(moveTo(p,p.tx,p.ty,60*p.spd,dt))nextAct(p,false)};
PAX_STEP.toMkt=(p,dt,D)=>{if(isCalled(p.F)){toGate(p);return}if(walk(p,D.cwalk*p.spd*walkMul(p),dt)){p.state='mkt';p.t=6+rnd()*10}};
// waiting in the market place: children run about the play area; everyone listens for their gate
PAX_STEP.mkt=(p,dt)=>{
  if(isCalled(p.F)){toGate(p);return}
  if(p.act==='play'&&p.sl>=0){const [a,b,c,d]=mktPlan().playR,u=G.clock*0.35+p.rand*40;moveTo(p,a+8+(c-a-16)*(0.5+0.5*Math.sin(u)),b+8+(d-b-16)*(0.5+0.5*Math.sin(u*1.37+p.rand*9)),40,dt)}
  if((p.t-=dt)<=0){if(p.act==='play'||p.leader&&p.leader.state==='mkt')p.t=6+rnd()*10;else nextAct(p,false)}
};
PAX_STEP.toGate=(p,dt,D)=>{if(walk(p,D.cwalk*p.spd*walkMul(p),dt)){p.state='gate';PAX_STEP.gate(p,0)}};
// at the gate: anyone standing takes a seat as soon as one frees up
PAX_STEP.gate=(p,dt)=>{
  if(p.spot<0){const S=R.st[p.stand],j=S.spots.indexOf(null);if(j>=0){S.spots[j]=p;p.spot=j;const s=spotPos(p.stand,j);p.tx=s.x;p.ty=s.y}}
  if(p.x!==p.tx||p.y!==p.ty)moveTo(p,p.tx,p.ty,50*p.spd,dt);
};

/* ---------- walk-through duty free: a Masterplan plan, then built ---------- */
Object.assign(UPG,{wtdf:{tab:'sales',sec:'Market place',icon:'gift',name:'Walk-through duty free',max:1,base:30000,mult:1,lvl:4,build:240,fx:(l,m)=>m?'Everyone walks through it after security':'A duty free that everyone walks through after security. About 1 in 3 buy something. 4 h build.'}});
TECH.push({id:'c_walk',b:'com',t:5,c:1,d:'Everyone walks through a duty free after security.',n:'Walk-through duty free',u:['up:wtdf'],r:['c_duty']});
TECH_BY.c_walk=TECH.at(-1);NODE_OF['up:wtdf']='c_walk';
TERM_FIELDS.dfEarned=()=>0;

/* ---------- Sales › Shops: how full each shop is ---------- */
TERM_PANEL['sales:shops']=TERM_PANEL['sales:shops']||[];
TERM_PANEL['sales:shops'].push(()=>{
  const rows=[];G.shops.forEach((s,j)=>{if(!s||!shopOpen(j))return;const n=shopUsed(j),c=shopCap(j),a=(R.awayH||[])[j]||0;
    rows.push(`<div class="rd"><b>${SHOP_NAME[j]}</b> ${SHOPS[s.type].name}: <b style="color:${n>=c?'var(--bad)':'inherit'}">${n}/${c}</b> inside${a?` · ${a} turned away last hour`:''}</div>`)});
  let h=rows.length?`<div class="sec">How full<span>now</span></div><p class="note">A full shop sends people elsewhere. Each level adds room.</p>`+rows.join(''):'';
  if(G.lv.wtdf)h+=`<div class="rd"><b>Walk-through duty free</b>: ${money(G.dfEarned||0)} earned</div>`;
  return h+upSection('sales',['Market place']);
});
// a Gate calls chip hands the calls back from the duty manager
TERM_CLICK.push(d=>{if(!d.pol||!d.pol.startsWith('gates:'))return false;(G.pol||(G.pol={})).gates=JSON.parse(d.pol.slice(6));G.set.autoDuty=false;renderPanel();save();return true});

/* ---------- drawing ---------- */
TERM_DRAW.push(()=>{drawMarket();for(let i=0;i<SHOP_X.length;i++)if(shopOpen(i))drawShopUnit(i)});
function drawMarket(){
  const M=mktPlan(),[x0,y0,x1,y1]=M.box,sq=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  for(const [x,y] of M.window)sq(x-3.5,y-5,7,2,'#3A424B'),sq(x-3,y-3,6,6,'#2A3037');
  for(const [x,y] of M.tables){sq(x-3,y-3,6,6,'#3A424B');sq(x-9,y-2.5,5,5,'#262C32');sq(x+4,y-2.5,5,5,'#262C32')}
  mono('FOOD COURT',x0+16,y1-3,'#56606A',6.5);
  {const [a,b,c,d]=M.playR;sq(a,b,c-a,d-b,'#1F2A2B');ctx.strokeStyle='#6BE3C9';ctx.lineWidth=1;ctx.strokeRect(a+.5,b+.5,c-a-1,d-b-1);
    sq(a+6,b+6,10,4,'#FF9F43');sq(c-16,d-12,12,8,'#5CC8FF');ctx.fillStyle='#C39BFF';ctx.beginPath();ctx.arc((a+c)/2,(b+d)/2,5,0,Math.PI*2);ctx.fill();mono('PLAY',a+4,d-3,'#6BE3C9',6.5)}
  for(const [x,y] of M.playB)sq(x-3,y-3,6,6,'#2A3037');
  {const [a,b,c,d]=M.wcR;sq(a,b,c-a,d-b,'#232A31');ctx.strokeStyle='#4E5964';ctx.lineWidth=1.5;ctx.strokeRect(a,b,c-a,d-b);sq(a+2,d-1,10,3,'#1E2429');mono('WC',c-3,b+8,'#9FC2E0',7,'right')}
  {const [a,b,c,d]=M.chargeR;sq(a,b,c-a,d-b,'#39414A');ctx.fillStyle='#6BE39A';for(let x=a+4;x<c-2;x+=8)ctx.fillRect(x,b+2,2,2);mono('CHARGE',a,b-8,'#56606A',6)}
  for(const [x,y] of M.seats)sq(x-3,y-3,6,6,'#2A3037');
  if(G.lv.wtdf||isBuilding('up:wtdf')){const [a,b,c,d]=M.df;if(!G.lv.wtdf){hatchLabel((a+c)/2,(b+d)/2,bprog('up:wtdf'),'BUILDING DUTY FREE');return}
    sq(a,b,c-a,d-b,'#22262B');const m=(b+d)/2,cols=['#F5D08A','#C39BFF','#FF7AB6','#6FA8DC'];
    for(const [y,s,e] of [[(m+d-10)/2-2,a+2,c-18],[(m+b+8)/2-2,a+18,c-2]]){sq(s,y,e-s,4,'#3A424B');for(let x=s+3,k=0;x<e-3;x+=6,k++){ctx.fillStyle=cols[k%4];ctx.fillRect(x,y+1,3,2)}}
    mono('DUTY FREE',(a+c)/2,b+6,'#F5D08A',7,'center')}
}
// a shop unit, turned to face its concourse, with its inside: shelves and tills, tables, stools, armchairs and a buffet.
// Its name, and how many are inside out of its room, are kept the right way up.
function drawShopUnit(j){
  const s=G.shops[j],a=((SHOP_A[j]%360)+360)%360,flip=a>90&&a<=270;ctx.save();ctx.translate(SHOP_X[j],SHOP_Y[j]);ctx.rotate(a*Math.PI/180);
  const sq=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  if(s){const t=SHOPS[s.type],k=SHOP_IN[t.id],id=t.id,rows=Math.ceil(shopCap(j)/8);sq(0,0,118,40,'#242A31');sq(0,0,118,10,'#1C2126');sq(0,38,118,3,t.col);
    sq(96,11,18,27,'#39414A');for(let q=0;q<tills(j);q++)sq(99,13+q*10,5,4,'#FFC72C'); // the counter and its tills
    if(!k.sit){for(let r=0;r<rows;r++){const e=13+r*10;sq(3,e-4.5,78,2,'#3A424B');for(let x=5;x<80;x+=5){ctx.fillStyle=(x/5)%3?t.col:'#ECE8DF';ctx.fillRect(x,e-6,2,1.5)}}} // shelves behind each aisle
    else for(let r=0;r<rows;r++)for(let q=0;q<8;q++){const x=8+q*10,e=15+r*10; // a seat at every spot, and the tables, stools or buffet around them
      if(id==='lounge'||id==='spa')sq(x-4,e-4,8,8,id==='spa'?'#2F4A48':'#34465A');
      else{sq(x-3,e-3,6,6,'#2A3037');if(q%2===0)sq(x+3,e-2.5,4,5,id==='dining'?'#E6E1D6':id==='bar'?'#5A4A6E':'#4A4131')}}
    if(id==='lounge')sq(100,31,11,5,'#D9A066');else if(id==='bar')for(let q=0;q<5;q++)sq(98+q*3,12,2,4,'#C39BFF');
    if(flip){ctx.translate(118,40);ctx.rotate(Math.PI)}
    const n=shopUsed(j),c=shopCap(j),ty=flip?38:8.5;
    ctx.font='700 8px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle=t.col;ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillText(`${t.name.toUpperCase()} · ${s.lvl+1}`,4,ty);
    mono(`${n}/${c}`,114,ty,n>=c?'#FF7A8A':'#909AA4',7.5,'right')}
  else{ctx.strokeStyle='#343C45';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.strokeRect(.5,.5,117,39);ctx.setLineDash([]);if(flip){ctx.translate(118,40);ctx.rotate(Math.PI)}mono('UNIT TO LET',59,24,'#4A535D',8.5,'center')}
  ctx.restore();
}

SIMX.isCalled=isCalled;SIMX.shopCap=shopCap;SIMX.shopUsed=shopUsed;SIMX.mktPlan=mktPlan;SIMX.callLead=callLead;SIMX.gateWalkMin=gateWalkMin;SIMX.boardEta=boardEta;
