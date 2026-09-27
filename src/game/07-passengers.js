/* ================= passengers: landside & airside ================= */
function carFee(F){return carFeeBase()*(1+0.3*F.ac.tier)}
function parkCar(){const cap=carCap();for(let b=0;b<cap;b++){if(R.lot[b]<=G.clock){R.lot[b]=G.clock+150+rnd()*300;return b}}return -1}
function spawn(p){
  if(TERM_SPAWN.length&&TERM_SPAWN.some(f=>f(p)))return;
  if(p.type==='prm')p.spd=G.lv.assist?0.95+0.1*G.lv.assist:0.5;
  const tk=pickTransit();
  if(tk==='train'){p.state='train';R.platform.push(p);return}
  if(tk==='tram'){p.state='tram';R.tramQ.push(p);return}
  if(tk==='bus'){p.state='bus';R.busQ.push(p);return}
  let x=null,y=0;
  if(rnd()<0.42*(R.reg?R.reg.parkMul:1)){const b=parkCar();if(b>=0){const q=BAY(b);x=q.x;y=q.y;earn(carFee(p.F),'landside',q.x,q.y-8,'#9FC2E0')}else R.lotFull=G.clock}
  if(x==null){x=40+rnd()*260;y=648+LAND_DY+rnd()*12}
  walkIn(p,x,y);
}
function spawnParty(list){const L=list[0];spawn(L);for(let k=1;k<list.length;k++){const p=list[k];if(L.state==='train'){p.state='train';R.platform.push(p)}else if(L.state==='tram'){p.state='tram';R.tramQ.push(p)}else if(L.state==='bus'){p.state='bus';R.busQ.push(p)}else walkIn(p,L.x+(k%2?6:-6)*Math.ceil(k/2),L.y+(k%2?3:-2))}}
function walkIn(p,x,y){p.x=x;p.y=y;p.state='walkIn';p.tx=DOOR.x+(rnd()-0.5)*22;p.ty=DOOR.y-6;p.room=hallId('out');route(p,hallId('ci'));R.pax.push(p)} // in through the check-in hall's doors
function updateTrain(dt){
  if(!G.lv.rail)return;const T=R.train,ft=vehFreq('train');
  if(!ft&&R.platform.length){R.platform.forEach(p=>walkIn(p,40+rnd()*260,648+LAND_DY+rnd()*12));R.platform=[]}
  if(T.state==='away'){if(!ft)return;T.t-=dt;if(T.t<=0){T.state='in';T.t=0;const L=vehLine('train');T.col=L?shade(L.col,L.mode==='hsr'?0.85:0.62):'#3E6A8C';T.cars=L?(L.mode==='hsr'?3:2)+(L.cars||0):3;T.nose=L&&L.mode==='hsr'}}
  else if(T.state==='in'){T.t+=dt;const k=Math.min(1,T.t/1.2);T.x=-300+330*(1-Math.pow(1-k,2));if(k>=1){T.state='dwell';T.t=1.4;
    const n=R.platform.length;R.platform.forEach(p=>walkIn(p,T.x+20+rnd()*230,712+LAND_DY));R.platform=[]}}
  else if(T.state==='dwell'){T.t-=dt;if(T.t<=0&&syncKind('train')&&walkersTo(704+LAND_DY)&&(T.extra=(T.extra||0)+dt)<3)T.t=0.05;if(T.t<=0){T.state='out';T.t=0;T.extra=0}}
  else if(T.state==='out'){T.t+=dt;const k=Math.min(1,T.t/1.2);T.x=30-330*k*k;if(k>=1){T.state='away';T.t=Math.max(1.5,60/Math.max(1,vehFreq('train'))-3.8);T.x=null}}
}
function updateRunway(dt,D){
  const Q=R.rwy;
  for(let r=0;r<2;r++){
    const a=Q.act[r];
    if(a){a.t+=dt;if(a.t>=a.dur){if(a.type==='arr')a.F.landed=true;Q.act[r]=null;G.moves=(G.moves||0)+1}}
    if(r<D.runways&&!Q.act[r]&&Q.q.length&&!(R.fx.storm>G.clock)){let k=Q.q.findIndex(m=>m.type==='arr');if(k<0)k=0;const m=Q.q.splice(k,1)[0];m.t=0;m.dur=m.type==='arr'?D.land:D.takeoff;Q.act[r]=m}
  }
}
function serve(sv,x,y,dt,done,wx,wy){
  const p=sv.p;
  if(sv.n)moveTo(sv.n,wx,wy,210*sv.n.spd,dt);
  if(moveTo(p,x,y,150*p.spd,dt)){sv.t-=dt;if(sv.t<=0){sv.p=sv.n||null;sv.t=sv.tn||0;sv.n=null;done(p)}}
}
/* a counter calls the next passenger forward while it serves the current one */
function take(sv,pick,state,t){
  if(sv.p&&sv.n)return;const q=pick();if(!q)return;q.state=state;if(typeof t==='function')t=t(q);
  if(!sv.p){sv.p=q;sv.t=t}else{sv.n=q;sv.tn=t}
}
// Walking pace: one thing speeds a passenger at a time. The people mover, once bought, carries passengers on a long walk
// or on their way through the doorways at 2.5× walking pace, hidden and drawn as its car on the track (12-drawing.js);
// only a layout with its track (LAY.track) has one. A train or walkway link sets its own pace in walk() (41-airside.js).
// Otherwise connecting passengers hurry in a layout built for it (LAY.xfer), and a room with walkways speeds everyone.
const MOVER_ST=new Set(['toArr','toShop','toMkt','toGate']); // the walks the mover can carry
const onMover=p=>G.lv.mover&&G.pierB&&LAY.track&&MOVER_ST.has(p.state)&&(p.way||Math.abs(p.tx-p.x)>300);
const walkMul=p=>p.way&&p.way[p.wi+3]?1:onMover(p)?2.5:(p.xferred&&LAY.xfer||1)*roomWalk(p);
// each part of the terminal moves its own passengers: PAX_STEP[state](p,dt,D) for departing ones (42-terminal.js)
function updateLandside(dt,D){
  updateCheckin(dt,D);updateSecurity(dt,D);updateBelt(dt);
  for(const p of R.pax){const f=PAX_STEP[p.state];if(f)f(p,dt,D)}
}
