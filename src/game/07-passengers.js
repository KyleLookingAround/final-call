/* ================= passengers: landside & airside ================= */
function carFee(F){return carFeeBase()*(1+0.3*F.ac.tier)}
function parkCar(){const cap=carCap();for(let b=0;b<cap;b++){if(R.lot[b]<=G.clock){R.lot[b]=G.clock+150+Math.random()*300;return b}}return -1}
function spawn(p){
  if(p.type==='prm')p.spd=G.lv.assist?0.95+0.1*G.lv.assist:0.5;
  const tk=pickTransit();
  if(tk==='train'){p.state='train';R.platform.push(p);return}
  if(tk==='tram'){p.state='tram';R.tramQ.push(p);return}
  if(tk==='bus'){p.state='bus';R.busQ.push(p);return}
  let x=null,y=0;
  if(Math.random()<0.42*(R.reg?R.reg.parkMul:1)){const b=parkCar();if(b>=0){const q=BAY(b);x=q.x;y=q.y;earn(carFee(p.F),'landside',q.x,q.y-8,'#9FC2E0')}else R.lotFull=G.clock}
  if(x==null){x=40+Math.random()*260;y=648+Math.random()*12}
  walkIn(p,x,y);
}
function spawnParty(list){const L=list[0];spawn(L);for(let k=1;k<list.length;k++){const p=list[k];if(L.state==='train'){p.state='train';R.platform.push(p)}else if(L.state==='tram'){p.state='tram';R.tramQ.push(p)}else if(L.state==='bus'){p.state='bus';R.busQ.push(p)}else walkIn(p,L.x+(k%2?6:-6)*Math.ceil(k/2),L.y+(k%2?3:-2))}}
function walkIn(p,x,y){p.x=x;p.y=y;p.state='walkIn';p.tx=DOOR.x+(Math.random()-0.5)*22;p.ty=DOOR.y-6;R.pax.push(p)}
function enterLandside(p){if(p.online)enterSecurity(p);else{p.state='queue';R.ciQ.push(p)}}
function updateTrain(dt){
  if(!G.lv.rail)return;const T=R.train,ft=vehFreq('train');
  if(!ft&&R.platform.length){R.platform.forEach(p=>walkIn(p,40+Math.random()*260,648+Math.random()*12));R.platform=[]}
  if(T.state==='away'){if(!ft)return;T.t-=dt;if(T.t<=0){T.state='in';T.t=0;const L=vehLine('train');T.col=L?shade(L.col,L.mode==='hsr'?0.85:0.62):'#3E6A8C';T.cars=L?(L.mode==='hsr'?3:2)+(L.cars||0):3;T.nose=L&&L.mode==='hsr'}}
  else if(T.state==='in'){T.t+=dt;const k=Math.min(1,T.t/1.2);T.x=-300+330*(1-Math.pow(1-k,2));if(k>=1){T.state='dwell';T.t=1.4;
    const n=R.platform.length;R.platform.forEach(p=>walkIn(p,T.x+20+Math.random()*230,712));R.platform=[]}}
  else if(T.state==='dwell'){T.t-=dt;if(T.t<=0&&syncKind('train')&&walkersTo(704)&&(T.extra=(T.extra||0)+dt)<3)T.t=0.05;if(T.t<=0){T.state='out';T.t=0;T.extra=0}}
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
function enterSecurity(p){
  const D=derived();
  const vip=p.biz||p.prio,ftW=R.ftQ.length*0.6,secW=R.secQ.length/Math.max(1,D.lanes);
  if(D.ft&&(vip?ftW<=secW+2:R.ftQ.length<8&&Math.random()<D.ftBuy*PTYPE[p.type||'lei'].ft)){
    if(!vip) earn(p.F.fare*0.6,'fast',null,null,null,p.F);
    p.fast=true;p.state='ftQ';R.ftQ.push(p);
  } else {p.state='secQ';R.secQ.push(p)}
}
function finishCheckin(p,x){
  if(p.checked){if(G.lv.bagfee>0)earn(p.F.ac.fare*0.5,'bags',x,535,'#D9A066',p.F);R.belt.push({x,F:p.F})}
  enterSecurity(p);
}
function airside(p,x){
  p.x=x;p.y=516;
  const F=p.F,left=F.std-G.clock,built=[];G.shops.forEach((s,j)=>{if(s&&standOpen(j))built.push(j)});
  if(p.leader){const L=p.leader;if((L.state==='toShop'||L.state==='shop')&&G.shops[L.shop]&&left>15){p.state='toShop';p.shop=L.shop;p.tx=clamp(L.tx+(Math.random()-0.5)*16,shopX(L.shop),shopX(L.shop)+116);p.ty=499+(Math.random()-0.5)*4;return}toGate(p);return}
  if(left>15&&built.length){
    for(let k=built.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[built[k],built[j]]=[built[j],built[k]]}
    if(p.biz||p.prio){const L=built.find(j=>SHOPS[G.shops[j].type].vip);if(L!=null&&Math.random()<0.9){p.state='toShop';p.shop=L;p.tx=shopX(L)+8+Math.random()*100;p.ty=499;return}}
    for(const j of built){const sh=SHOPS[G.shops[j].type];if(sh.vip)continue;if(Math.random()<Math.min(0.95,sh.pull*PTYPE[p.type||'lei'].shop*(p.type==='grp'&&sh.id==='bar'?2.5:1)*(1+0.3*((p.psize||1)-1)))){p.state='toShop';p.shop=j;p.tx=shopX(j)+8+Math.random()*100;p.ty=499;return}}
  }
  toGate(p);
}
function toGate(p){
  const S=R.st[p.stand],j=S.spots.indexOf(null);
  if(j>=0){S.spots[j]=p;p.spot=j;const s=spotPos(p.stand,j);p.tx=s.x;p.ty=s.y}
  else{p.spot=-1;p.tx=STAND_X[p.stand]-135+Math.random()*130;p.ty=500+Math.random()*12}
  p.state='toGate';
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
const walkMul=p=>G.lv.mover&&Math.abs(p.tx-p.x)>300?2.5:1;
function updateLandside(dt,D){
  for(let i=0;i<8;i++){
    const d=R.desks[i]||(R.desks[i]={p:null,t:0});
    if(i<D.desks&&R.ciQ.length)take(d,()=>R.ciQ.shift(),'desk',q=>D.checkin*(q.leader?0.4:1)*(q.type==='prm'?1.5:1));
    if(d.p) serve(d,deskX(i),541,dt,p=>finishCheckin(p,deskX(i)),deskX(i)+4,549);
  }
  for(let i=0;i<4;i++){
    const k=R.kiosks[i]||(R.kiosks[i]={p:null,t:0});
    if(i<D.kiosks)take(k,()=>{const n=Math.min(14,R.ciQ.length);for(let j=0;j<n;j++)if(!R.ciQ[j].checked)return R.ciQ.splice(j,1)[0];return null},'desk',D.kiosk);
    if(k.p) serve(k,kioskX(i),541,dt,p=>finishCheckin(p,kioskX(i)),kioskX(i)+3,549);
  }
  R.ciQ.forEach((p,i)=>{p.wait+=dt;const s=ciSlot(i);moveTo(p,s.x,s.y,70*p.spd,dt)});
  for(let i=0;i<8;i++){
    const L=R.lanes[i]||(R.lanes[i]={p:null,t:0});
    if(i<D.lanes&&R.secQ.length)take(L,()=>R.secQ.shift(),'sec',D.sec);
    if(L.p) serve(L,laneX(i),534,dt,p=>airside(p,laneX(i)),laneX(i),544);
  }
  if(D.ft){const L=R.ftL;if(R.ftQ.length)take(L,()=>R.ftQ.shift(),'sec',D.sec*0.6);if(L.p)serve(L,FT_X,534,dt,p=>airside(p,FT_X),FT_X,544)}
  else if(R.ftQ.length){while(R.ftQ.length){const p=R.ftQ.shift();p.state='secQ';R.secQ.push(p)}}
  R.secQ.forEach((p,i)=>{p.wait+=dt;const s=secSlot(i);moveTo(p,s.x,s.y,75*p.spd,dt)});
  R.ftQ.forEach((p,i)=>{p.wait+=dt;const s=ftSlot(i);moveTo(p,s.x,s.y,75*p.spd,dt)});
  const beltV=80*(1+0.3*G.lv.bagsys);
  for(const b of R.belt){b.x+=beltV*dt;if(b.x>=478){b.F.bagsIn++;b.done=true}}
  if(R.belt.some(b=>b.done)) R.belt=R.belt.filter(b=>!b.done);
  for(const p of R.pax){
    const sp=D.cwalk*p.spd;
    if(p.state==='walkIn'){if(moveTo(p,p.tx,p.ty,110*p.spd,dt))enterLandside(p)}
    else if(p.state==='toShop'){if(!G.shops[p.shop])toGate(p);else if(moveTo(p,p.tx,p.ty,sp*walkMul(p),dt)){p.state='shop';p.t=SHOPS[G.shops[p.shop].type].dwell;p.t0=p.t}}
    else if(p.state==='shop'){
      const F=p.F,hurry=F.plane.state==='boarding'&&G.clock>=F.std-12;
      p.t-=dt;
      if(p.t<=0||hurry){
        const s=G.shops[p.shop];
        if(s){const frac=clamp(1-Math.max(0,p.t)/p.t0,0.3,1),v=SHOPS[s.type].spend*Math.pow(1.25,s.lvl)*(1+0.6*F.ac.tier)*frac*(G.lv.mall?1.4:1);s.earned=(s.earned||0)+v;earn(v,'shops',p.x,p.y-6,'#F5D08A',F)}
        toGate(p);
      }
    }
    else if(p.state==='toGate'){if(moveTo(p,p.tx,p.ty,sp*walkMul(p),dt))p.state='gate'}
  }
}

