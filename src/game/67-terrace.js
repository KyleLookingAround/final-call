/* ================= THE ROOF TERRACE: a third floor over the concourse, where waiting passengers watch the planes ================= */
// A Terminal upgrade from level 3, hidden before (G.lv.terrace; docs/systems/terrace.md, spec docs/specs/terminal-place.md).
// The terrace is a room, ter (fl 2), in the layouts that have one (Classic's term table, 42-terminal.js): cut into the roof
// over the concourse at the apron edge, reached from the market place by stairs and a lift (floor links, 66-floors.js), and
// drawn only on the Roof stop. Two sides split by a glass screen: the passengers' side, which is the room, and the public
// side (its pub box), drawn but never walked, where spotters stand as a count (R.spot, runtime).
// Who goes up: when the market place would seat a waiting passenger (nextAct, 46-market.js), 1 in 6 goes up instead while
// it's open (06:00-22:00, dry) and has room (40), 1 in 4 while a wide-body is at a stand; their party follows. They stay
// 10-30 minutes and come down when their gate is called, like shoppers. A dawdler (61-late-runners.js) stays up until final
// call and runs down the stairs. A famous face with 40 minutes or more before their gate call goes up for 10-20 (64-famous-faces.js).
// It earns a little (a café kiosk per passenger up, a charge per spotter), gives a small rating line (cause 'terrace': +0.01
// for each passenger who went up and made their gate, at most +0.4 a day; -0.1 an hour at capacity) and says nothing:
// the crowd is the only sign.
const TER_CAP=40,TER_ODDS=1/6,TER_WIDE=1/4,TER_STAY=[10,20],TER_OPEN=[6,22],TER_CAFE=7,TER_FEE=6,TER_REP=0.01,TER_REP_DAY=0.4,TER_FULL=-0.1;
const TER_BEEN=new WeakSet(); // passengers who reached the deck, until they reach their gate (the rating line, and counted once a visit to the airport)
const TER_WET=['rain','snow','storm'];
Object.assign(UPG,{terrace:{get tab(){return G.level>=2&&terRoom()!=null?'terminal':null},sec:'Concourse',icon:'glass',name:'Roof terrace',max:1,base:6000,mult:1,lvl:2,build:120,
  req:()=>G.level>=2&&terRoom()!=null,reqText:'Needs a terminal with a roof terrace.',
  fx:(l,m)=>m?'Waiting passengers watch the planes from the roof':'A terrace on the roof for waiting passengers, with a café, and a public side for spotters. 2 h build.'}});
TERM_FIELDS.terrace=()=>({d:0,up:0,take:0}); // today: passengers up and takings (the card), and the day they count
Object.assign(REPWHY,{terrace:['a crowded roof terrace',[]]});REPLBL.terrace='The roof terrace';
const terRoom=()=>ROOMS?hallId('ter'):null; // the terrace's room in this layout, if it has one
const terHall=()=>LAY.term.halls.find(h=>h.id==='ter');
const terBuilt=()=>!!G.lv.terrace&&terRoom()!=null;
// the terrace's box, both sides: [x0, y0, x1, y1] (null until it's built)
function terraceBox(){if(!terBuilt())return null;const h=terHall(),[x0,y0]=h.poly[0],[x1,y1]=h.poly[2],p=h.pub;return [Math.min(x0,p[0]),Math.min(y0,p[1]),Math.max(x1,p[2]),Math.max(y1,p[3])]}
const terDay=()=>{const T=G.terrace||(G.terrace={d:0,up:0,take:0}),d=dayOf(G.clock);if(T.d!==d){T.d=d;T.up=0;T.take=0}return T};
// who is up or on the way: passengers in state toTer or ter, looked over once a minute
function terList(){const L=R.terL;if(L&&L.pax===R.pax&&L.G===G)return L.list;return (R.terL={pax:R.pax,G,list:[]}).list}
const onTer=p=>p.state==='toTer'||p.state==='ter';
const terOn=()=>R.terOpen&&terBuilt(); // open, and built in this layout (a rebuild or a load can come between two minutes)
const terUp=p=>ROOMS&&p.room!=null&&p.room===terRoom(); // on the terrace itself

/* ---------- where people stand ---------- */
// forty places on the passengers' side: the rail along the apron, the benches, the café tables and the kiosk's queue; with a
// famous face up, everyone packs towards the glass at their end. The famous face has a place of their own (k -2)
function terSpot(k){
  const h=terHall(),[x0,y0]=h.poly[0],[x1,y1]=h.poly[2];
  if(k===-2)return [x1-12,y0+38];
  if(R.terFam)return [x1-4-(k%12)*6,y0+6+Math.floor(k/12)*7];
  if(k<18)return [x0+6+k*8.5,y0+6];
  if(k<30){const b=(k-18)>>2,s=(k-18)&3;return [x0+16+b*44+s*7,y0+34]}
  if(k<36)return [x0+10+(k-30)*9,y1-14];
  return [x1-18,y0+16+(k-36)*6];
}
function terFree(){const used=new Set();for(const q of terList())if(onTer(q))used.add(q.sl);for(let k=0;k<TER_CAP;k++)if(!used.has(k))return k;return -1}

/* ---------- going up and coming down ---------- */
// open while it's built, from 06:00 to 22:00, and dry (worked out each minute, R.terOpen)
function terOpenNow(){if(!terBuilt())return false;const h=(G.clock/60)%24;if(h<TER_OPEN[0]||h>=TER_OPEN[1])return false;return !TER_WET.some(k=>weather.on(k))}
// send p up for stay minutes, to place k
function roofGo(p,stay,k){
  p.sl=k;p.state='toTer';p.t=G.clock+stay;const [x,y]=terSpot(k);p.tx=x;p.ty=y;route(p,terRoom());terList().push(p);
}
// nextAct's hook (46-market.js): a waiting passenger the market place would seat goes up instead, now and then; a party
// follows its leader up. One rnd() draw decides both whether and how long
NEXT_ACT.push(p=>{
  if(!terOn()||terUp(p))return false;const L=p.leader;
  if(L){if(!onTer(L)||L.dead)return false;const k=terFree();if(k<0)return false;roofGo(p,Math.max(1,L.t-G.clock),k);return true}
  if(p.kid)return false;const k=terFree();if(k<0)return false;
  const odds=R.terWide?TER_WIDE:TER_ODDS,r=rnd();if(r>=odds)return false;
  roofGo(p,TER_STAY[0]+TER_STAY[1]*r/odds,k);return true;
});
// up the stairs (or the lift): once there, a coffee from the kiosk for about half of them
PAX_STEP.toTer=(p,dt,D)=>{
  if(isCalled(p.F)&&!p.late){toGate(p);return}
  if(!terOn()){nextAct(p,false);return}
  if(walk(p,D.cwalk*p.spd*walkMul(p),dt)){p.state='ter';if(!TER_BEEN.has(p)){TER_BEEN.add(p);terDay().up++}note(p,'ter',0,0.6);terraceCafe(p)}
};
function terraceCafe(p){
  if((p.rand*7919)%1>=0.5)return;const f=R.famous,v=TER_CAFE*(1+0.3*p.F.ac.tier)*(f&&f.p&&terUp(f.p)?1.6:1),h=terHall();
  terDay().take+=v;earn(v,'shops',roofA()?h.poly[2][0]-12:null,h.poly[2][1]-26,'#F5D08A',p.F,p.stand);
}
// on the terrace: to their place and there until their time is up or their gate is called; a dawdler stays until final call
// sends them (finalCall, 61-late-runners.js), or the plane is about to go
PAX_STEP.ter=(p,dt)=>{
  const F=p.F;
  if(p.late){if(F.plane.state==='closing'||G.clock>=F.std-RUN_AT&&F.plane.state==='boarding'){toGate(p);return}
    if(G.clock>=p.t){if(F.plane.state==='boarding')startRun(p,tale(p),F);toGate(p);return}} // as one lingering in the market place remembers
  else if(isCalled(F)){toGate(p);return}
  if(!terOn()){nextAct(p,false);return}
  const [x,y]=terSpot(p.sl);if(p.x!==x||p.y!==y)moveTo(p,x,y,30*p.spd,dt);
  if(!p.late&&G.clock>=p.t)nextAct(p,false);
};
// a passenger who went up and reached their gate: a small lift in the rating, at most TER_REP_DAY a day as it lands
// (effect() may scale a rise, so the day's cap is kept on what it did)
{const f=PAX_STEP.toGate;PAX_STEP.toGate=(p,dt,D)=>{f(p,dt,D);if(p.state==='gate'&&TER_BEEN.has(p)){TER_BEEN.delete(p);boardedFromRoof(p)}}}
function boardedFromRoof(p){
  const d=dayOf(G.clock),T=R.terRep&&R.terRep.d===d&&R.terRep.G===G?R.terRep:(R.terRep={d,G,v:0});if(T.v>=TER_REP_DAY-1e-9)return;
  const m=(G.lv.saf?1.25:1)*(G.dev&&devSum('green')?1.1:1),x=Math.min(TER_REP,(TER_REP_DAY-1e-9-T.v)/m);T.v+=x*m;repAdj(x,'terrace',p.stand);
}

/* ---------- each minute: open or shut, the spotters, the famous face, the charge, a crowd ---------- */
// the public side's spotters: a steady handful by day, one or two late and early, none in the small hours; a few
// die-hards in the wet; the famous face's photographers (6) and fans (10) while they're up
function terSpotters(){
  if(!terBuilt())return 0;const h=(G.clock/60)%24;
  let n=h<5||h>=23?0:h<6||h>=22?1:h<8?Math.round(2+3.5*(h-6)):h<20?9+Math.round(Math.sin(Math.PI*(h-8)/12)):Math.round(9-3.5*(h-20));
  if(TER_WET.some(k=>weather.on(k)))n=Math.min(n,Math.max(n?1:0,Math.floor(n*0.3)));
  return n+(R.terFam?16:0);
}
function terraceMinute(){
  const L=terList();R.terOpen=terOpenNow();
  const f=R.famous;R.terFam=!!(f&&f.p&&terBuilt()&&terUp(f.p)&&onTer(f.p));
  R.spot=terSpotters();
  if(!terBuilt()){if(L.length)L.length=0;R.terFull=0;return}
  let n=0;for(let k=L.length-1;k>=0;k--){const p=L[k];if(p.dead||!onTer(p))L.splice(k,1);else n++}
  R.terWide=SIDX.some(i=>{const F=R.st[i].F;return F&&!F.freighter&&F.ac.blocks.length>2});
  R.terLook=SIDX.some(i=>{const F=R.st[i].F,s=F&&F.plane.state;return s==='closing'||s==='inbound'}); // phones up as a plane comes or goes
  if(R.spot>0){const v=R.spot*TER_FEE/60;terDay().take+=v;earn(v,'landside')}
  R.terFull=n>=TER_CAP?(R.terFull||0)+1:0;if(R.terFull>=60){R.terFull=0;repAdj(TER_FULL,'terrace')}
}
TERM_MINUTE.push(terraceMinute);
// the famous face (64-famous-faces.js): up for 10-20 minutes if they're waiting in the market place with 40 or more before
// their gate is called, once. One rnd() draw
FAMOUS_MIN.push(f=>{
  const p=f.p;if(f.ter||!terOn()||!p||p.dead||(p.state!=='mkt'&&p.state!=='toMkt')||callAt(f.F)-G.clock<40)return;
  f.ter=G.clock;p.sl=-1;R.occOut=true;roofGo(p,TER_STAY[0]+10*rnd(),-2);
});
// late runners (61-late-runners.js): a passenger on the terrace can dawdle there until final call, and runs down the
// stairs; the story says so
RUN_FROM.ter=(p,list)=>{p.late=true;p.t=G.clock+LINGER_MKT;list.push(p);note(p,'linger','roof',0.3)};
TALE_KIND.run=p=>terUp(p)?'roofRun':'run';
TALE_KIND.miss=p=>terUp(p)?'roofMiss':(TALES.get(p)||{ev:[]}).ev.some(e=>e[1]==='roofRun')?'roofMissed':'miss';
Object.assign(TALE_MORE,{ter:()=>'Up on the roof terrace',roofRun:a=>`Ran from the roof for gate ${GATES[a]}`,roofMiss:a=>`Still on the roof when gate ${GATES[a]} closed`,roofMissed:a=>`Gate ${GATES[a]} closed on the run from the roof`});

/* ---------- the card, under Terminal › Staff, and the advisor's tip ---------- */
(TERM_PANEL.staff||(TERM_PANEL.staff=[])).push(()=>{
  if(!terBuilt())return '';const T=terDay(),r=(R.repWhy||{}).terrace||0,rd=R.terRep&&R.terRep.d===T.d&&R.terRep.G===G?R.terRep.v:0;
  return `<div class="sec" id="terrace">Roof terrace<span>today</span></div><div class="rd"><b>${T.up}</b> passengers went up · <b>${R.spot||0}</b> spotters on the public side${R.terOpen?'':' · closed to passengers'}</div>`+
    `<div class="rd">Café and public side took <b>${money(T.take)}</b> · rating <b>+${rd.toFixed(2)}</b> today${r<0?' (crowded at times)':''}</div>`;
});
// once a visit (R.terTip), from level 3, while the market place is packed: a terrace would give waiting passengers somewhere to go (16-advisor.js)
function terraceTip(){
  const t=R.terTip&&R.terTip.G===G?R.terTip.t:null;if(G.level<2||G.lv.terrace||terRoom()==null||isBuilding('up:terrace')||t!=null&&G.clock-t>360)return null;
  let n=0;for(const p of byState().mkt)if(p.state==='mkt'&&p.sl<0)n++;if(n<10)return null;
  const c=upCost('terrace');if(!upBuyable('terrace')||G.cash<c||tipHold('terrace',c))return null;
  if(t==null)R.terTip={G,t:G.clock};
  return {text:`The market place is packed, with ${n} standing. A roof terrace would give waiting passengers somewhere to watch the planes.`,go:['terminal','[data-buy="terrace"]'],label:'Terrace'};
}

/* ---------- drawing, on the Roof stop only ---------- */
// the deck, rail, benches, café and stair head; the passengers on it; the glass screen; the public side's spotters, and the
// famous face's crowd against the glass; flashes at night. Weather from drawnFx (photo mode dresses it too)
const TER_PUB=[];{for(let k=0;k<13;k++)TER_PUB.push([8+k*8,6]);for(let k=0;k<12;k++)TER_PUB.push([12+k*8,14]);for(let k=0;k<9;k++)TER_PUB.push([24+k*10,40]);for(let k=0;k<6;k++)TER_PUB.push([29+k*10,54])} // from the public side's corner
function drawTerrace(V){
  R.spotDrawn=0;if(!roofA()||!terBuilt())return;const B=terraceBox();if(B[2]<V.x0||B[0]>V.x1||B[3]<V.y0||B[1]>V.y1)return;
  const h=terHall(),[x0,y0]=h.poly[0],[x1,y1]=h.poly[2],P=h.pub,fx=drawnFx(),on=k=>(fx[k]||0)>G.clock,wet=on('rain')||on('storm'),snow=on('snow');
  const night=clamp(V.d/0.5,0,1),mix=(a,b)=>`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*night)).join(',')})`,k=V.k,close=k>=0.4;
  const sq=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  // the passengers' side: timber decking; the public side: paving
  sq(x0,y0,x1-x0,y1-y0,snow?mix([200,205,212],[120,126,134]):wet?mix([84,70,58],[46,40,36]):mix([118,96,74],[58,50,43]));
  sq(P[0],P[1],P[2]-P[0],P[3]-P[1],snow?mix([196,200,206],[118,122,130]):mix([98,104,112],[50,55,62]));
  if(close&&!snow){ctx.strokeStyle=wet?'rgba(150,196,230,.18)':'rgba(0,0,0,.14)';ctx.lineWidth=1;ctx.beginPath();for(let x=x0+6;x<x1;x+=6){ctx.moveTo(x,y0+2);ctx.lineTo(x,y1)}ctx.stroke()} // deck boards, or the wet sheen
  // benches, café tables (parasols up when it's dry by day), the kiosk, the stair head and the lift; the telescope and the public lift
  if(k>=0.25){
    for(let b=0;b<3;b++)sq(x0+12+b*44,y0+36,24,4,'#3A3129');
    for(let t=0;t<2;t++){const cx=x0+19+t*27,cy=y1-14;if(!wet&&!snow&&night<0.5){ctx.fillStyle=t?'#E8D9B0':'#D98C5F';ctx.beginPath();ctx.arc(cx,cy-3,7,0,Math.PI*2);ctx.fill()}else sq(cx-2,cy-2,4,4,'#2A241F')}
    sq(x1-30,y1-26,26,22,'#2F6B5E');sq(x1-30,y1-28,26,3,'#F5D08A');
    for(const d of ROOM_DOORS){if(d[1]!=='ter'&&d[0]!=='ter')continue;const x=d[2];if(d[5]==='lift'){sq(x-6,y1-12,12,12,'#39414A');continue}
      sq(x-13,y1-12,26,12,'#2A3037');ctx.strokeStyle='#4E5964';ctx.lineWidth=1;ctx.beginPath();for(let u=x-11;u<x+12;u+=3){ctx.moveTo(u,y1-11);ctx.lineTo(u,y1-1)}ctx.stroke()}
    sq(P[2]-14,P[1]+24,5,5,'#1B1F24');sq(P[2]-22,P[3]-16,16,14,'#39414A');
  }
  // the rail along the apron and round the edge, and the glass screen between the sides
  ctx.strokeStyle=night>0.3?'#C9B48A':'#9AA6B1';ctx.lineWidth=1.6;ctx.strokeRect(x0+0.8,y0+0.8,P[2]-x0-1.6,y1-y0-1.6);
  ctx.strokeStyle='rgba(150,196,230,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo((x1+P[0])/2,y0+1);ctx.lineTo((x1+P[0])/2,y1-1);ctx.stroke();
  if(night>0.3&&close){ctx.fillStyle='rgba(255,214,150,.85)';for(let x=x0+4;x<P[2];x+=12)ctx.fillRect(x-0.8,y0+1.5,1.6,1.6)} // string lights along the rail
  // the passengers up, and phones raised as a plane comes or goes
  const L=terList(),fp=R.famous&&R.famous.p,look=R.terLook&&close&&!REDUCED;
  for(const p of L){if(!terUp(p)||p.dead)continue;const x=p.ex??p.x,y=Math.min(p.ey??p.y,y1-3);
    ctx.fillStyle=paxColor(p);ctx.strokeStyle='#14171B';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,p.kid?2:3,0,Math.PI*2);ctx.fill();ctx.stroke();
    if(look&&p.state==='ter'&&(p.sl%3===0))sq(x+1.5,y-5.5,1.6,2.4,'#ECE8DF');
    if(p===fp){ctx.strokeStyle='#FFC72C';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.stroke()}}
  // the spotters (at most 40 drawn), and the famous face's photographers and fans pressed to the glass
  const now=performance.now(),crowd=R.terFam?16:0,n=Math.min(40,Math.max(0,(R.spot||0)-crowd)),flash=!REDUCED&&(night>0.3||crowd); // cosmetic
  const dot=(x,y,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,2.8,0,Math.PI*2);ctx.fill();ctx.stroke()};ctx.strokeStyle='#14171B';ctx.lineWidth=0.9;
  for(let j=0;j<n;j++){const [dx,dy]=TER_PUB[j],x=P[0]+dx,y=P[1]+dy;dot(x,y,j%3?'#6F8A9E':'#8C7A63');if(close&&j%2===0)sq(x-1.8,y-5.6,3.6,2.4,'#0E1114');
    if(flash&&((now/80+j*13)|0)%31===0){ctx.fillStyle='rgba(255,255,235,.85)';ctx.beginPath();ctx.arc(x,y-4,5,0,Math.PI*2);ctx.fill()}}
  for(let j=0;j<crowd;j++){const x=P[0]+3+(j%2)*6,y=P[1]+20+(j>>1)*6.5;dot(x,y,j<6?'#8C98A5':j%2?'#FF7AB6':'#C39BFF');
    if(j<6&&flash&&((now/70+j*11)|0)%9===0){ctx.fillStyle='rgba(255,255,235,.9)';ctx.beginPath();ctx.arc(x,y-4,6,0,Math.PI*2);ctx.fill()}}
  R.spotDrawn=n+crowd;
}
LAYER.roofs.push(drawTerrace);
Object.assign(SIMX,{terraceBox,terraceTip,terSpotters,terSpot});
