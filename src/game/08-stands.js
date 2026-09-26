/* ================= stands ================= */
const DOORS=[0,1],FRONT=[0]; // reused so the loops below don't make new arrays every step
function updateStand(i,dt,D){
  const S=R.st[i],st=G.stands[i];
  if(S.out){S.out.t+=dt;const k=Math.min(1,S.out.t/2.6);S.out.offY=230*k*k;S.out.alpha=1-k;if(k>=1)S.out=null}
  if(!S.F){if((S.hold||0)>0)S.hold-=dt;else if(st.built){S.idleT=(S.idleT||0)+dt;S.F=allocFlight(i);if(S.F)S.idleT=0}if(!S.F){S.ext=clamp(S.ext-dt*1.6,0,1);return}}
  const F=S.F,pl=F.plane,g=F.geo;
  if(pl.state==='wait'){if(!F.rwyReq){F.rwyReq=true;R.rwy.q.push({type:'arr',F,stand:i})}pl.state='approach'}
  else if(pl.state==='approach'){if(F.landed&&!S.out){pl.state='inbound';pl.t=0}}
  else if(pl.state==='inbound'){pl.t+=dt;const k=Math.min(1,pl.t/D.tow);pl.offY=220*Math.pow(1-k,3);pl.alpha=Math.min(1,k*3);if(k>=1){pl.alpha=1;pl.state='deplaning';pl.offY=0;F.arr.started=G.clock}}
  else if(pl.state==='deplaning'){if(F.arr.onboard<=0){pl.state='turnaround';pl.t=D.clean}}
  else if(pl.state==='turnaround'){if(F.willFault&&!F.faultFired){F.faultFired=true;techFault(i,F)}pl.t-=dt;if(pl.t<=0){pl.state='boarding';F.boardStart=G.clock;chime()}}
  else if(pl.state==='boarding'){
    if(!F.manifest.length&&!F.straggler&&F.seated>=F.booked&&F.hold>=F.checkedTotal-1e-6&&F.arr.sent>=F.arr.bags&&!(F.xferWait>0)&&F.fault<=0&&crewReady(i,F)){pl.state='closing';pl.t=0.8;settle(i)}
  }
  else if(pl.state==='closing'){if(pol('curfew')&&nightWin()){F.curfewHeld=true;pl.t=0.2}pl.t-=dt;if(pl.t<=0){S.out={F,t:0,offY:0,alpha:1};R.rwy.q.push({type:'dep',F,stand:i});{const fl=G.fleet[F.fleetIdx];if(fl&&!fl.sold){fl.st='away';fl.dep=G.clock;const dl=CITY[F.city]?farDelay(CITY[F.city]):0;fl.late=dl;fl.back=G.clock+tripMins(CITY[F.city]||F.ac)+dl;crewAway(F,fl.back);fl.dest=F.dest[0];fl.trips=(fl.trips||0)+1;fl.gate=null}}if(STAND_KIND[i]==='remote'&&!G.lounges)repAdj(-0.1,'bus');S.F=null;S.idleT=0;return}}
  if(pl.state==='boarding'&&F.xferWait>0&&pol('xfer')==='leave'&&G.clock>=F.std){
    const m=F.xferWait;spend(m*F.fare*0.5,'costs');F.booked-=m;F.xferWait=0;F.xferCancelled=true;repAdj(-1,'missed');toW(i,0,CABIN_TOP-24);floater(`LEFT ${m} CONNECTING`,WP.x,WP.y,'#FF7A8A',true);
  }
  const docked=pl.state==='deplaning'||pl.state==='turnaround'||pl.state==='boarding'||pl.state==='closing';
  S.ext=clamp(S.ext+(docked?dt:-dt)*1.6,0,1);
  if(docked&&F.fault>0){F.fault-=dt}
  const bagRate=D.bag*(F.ac.tier>=2?1.8:1),A=F.arr;
  if(docked&&A.unloaded<A.bags){A.unloaded=Math.min(A.bags,A.unloaded+bagRate*dt);while(A.sent<Math.floor(A.unloaded+1e-6)){A.sent++;R.arrBelt.push({A,t:2.5/(1+0.3*G.lv.bagsys)})}}
  else if(docked&&F.hold<F.bagsIn){F.hold=Math.min(F.bagsIn,F.hold+bagRate*dt)}
  if(pl.state==='deplaning')deplane(i,S,F,dt,D);
  if(F.manifest.length){F.spawnT-=dt;const rate=arrivalRate(F);while(F.spawnT<=0&&F.manifest.length){const L=F.manifest.pop(),pt=[L];while(F.manifest.length&&F.manifest[F.manifest.length-1].leader===L)pt.push(F.manifest.pop());spawnParty(pt);F.spawnT+=pt.length>1?1.6/rate:1/rate}}
  if(F.straggler&&G.clock>=F.stragglerAt){spawn(F.straggler);F.straggler=null}
  if(F.straggler&&pol('late')==='close'&&pl.state==='boarding'&&F.seated>=F.booked-1&&G.clock>=F.std){
    if(F.straggler.checked)F.checkedTotal--;F.booked--;spend(F.fare,'costs');F.straggler=null;repAdj(-1.5,'missed');toW(i,0,CABIN_TOP-24);floater('DOORS CLOSED',WP.x,WP.y,'#FFC72C',true);
  }
  // gate scanners, one per door
  if(pl.state==='boarding'){
    const bus=STAND_KIND[i]==='remote'&&!G.lounges;if(bus&&S.busT>0)S.busT-=dt; // mobile lounges don't wait to fill a bus
    for(const door of (F.rear?DOORS:FRONT)){
      if(bus&&S.busT>0)continue;
      S.scanT[door]-=dt;if(S.scanT[door]>0)continue;
      const br=S.bridge[door];if(br.length&&br[br.length-1].s<SPACING)continue;
      let best=null,bk=Infinity;
      for(const p of gateQueue(i)){if(p.state==='gate'&&p.lane===door&&p.F===F){const k=keyOf(p);if(k<bk){bk=k;best=p}}}
      if(best){
        if(F.firstScan==null)F.firstScan=G.clock;
        if(best.prio)earn(F.fare*0.4,'priority',null,null,null,F);
        best.state='bridge';best.s=0;if(best.spot>=0)S.spots[best.spot]=null;best.spot=-1;br.push(best);S.scanT[door]=D.scan;
          if(bus&&(S.busN=(S.busN||0)+1)>=40){S.busN=0;S.busT=5}
      } else S.scanT[door]=0;
    }
  }
  // jet bridge and rear stairs
  for(const door of DOORS){
    const br=S.bridge[door];if(!br.length)continue;
    const path=door?F.P.rear:F.P.bridge;
    br.sort((a,b)=>b.s-a.s);let lead=Infinity;
    const bm=busMul(i);for(const p of br){p.s=Math.max(p.s,Math.min(p.s+D.walk*p.spd*bm*dt,lead-SPACING,path.len));const q=ptAt(path,p.s);p.tx=q[0];p.ty=q[1];lead=p.s}
    if(br[0].s>=path.len-0.01){
      const p=br[0],al=S.aisle[door+2*p.ais];let clear=true;
      for(const a of al){if(door===0?a.pos<g.P0+GAP:a.pos>g.P1-GAP){clear=false;break}}
      if(clear){br.shift();p.state='aisle';p.phase='walk';p.pos=door?g.P1:g.P0;al.push(p)}
    }
  }
  // aisles: lane = door + 2 × aisle
  for(let L=0;L<4;L++){
    const al=S.aisle[L];if(!al.length)continue;
    const dir=L%2,ax=g.aisleX[L>>1];
    al.sort(dir===0?(a,b)=>b.pos-a.pos:(a,b)=>a.pos-b.pos);
    let lead=dir===0?Infinity:-Infinity;
    for(const p of al){
      const v=D.aisleSpd*p.spd*dt;
      if(p.phase==='walk'){
        if(dir===0){p.pos=Math.max(p.pos,Math.min(p.pos+v,p.row,lead-GAP));if(p.pos>=p.row-1e-6)arrive(p,D)}
        else{p.pos=Math.min(p.pos,Math.max(p.pos-v,p.row,lead+GAP));if(p.pos<=p.row+1e-6)arrive(p,D)}
      } else if(p.phase!=='done'){
        p.t-=dt;
        if(p.t<=0){if(p.phase==='stow'){F.bags++;const b=blockers(p);if(b>0){p.phase='shuffle';p.t=b*D.shuffle;F.shuffles+=b}else sit(p)}else sit(p)}
      }
      if(p.phase!=='done'){const ry=rowY(F,p.pos);p.tx=wx(i,ax,ry);p.ty=wy(i,ax,ry);lead=p.pos}
    }
    S.aisle[L]=al.filter(p=>p.phase!=='done');
  }
}
// passengers waiting at each stand's gate, in their order in R.pax, gathered once per step for the scanners.
// Only updateLandside puts passengers at a gate, after the stands have run, so the lists hold for the whole stand loop.
function gateQueue(i){
  if(R.gateStep!==R.step){R.gateStep=R.step;R.gateBy=[];for(const p of R.pax)if(p.state==='gate')(R.gateBy[p.stand]||(R.gateBy[p.stand]=[])).push(p)}
  return R.gateBy[i]||[];
}
function deplane(i,S,F,dt,D){
  const A=F.arr,g=F.geo;
  if(A.pax.length){
    let any=false;
    for(const p of A.pax){
      const al=S.dAisle[p.lane+2*p.ais];let free=true;
      for(const q of al){if(Math.abs(q.pos-p.row)<GAP){free=false;break}}
      if(!free||blockers(p,F.occIn)>0)continue;
      F.occIn[p.row*g.cols+p.col]=-1;p.state='dAisle';p.pos=p.row;p.phase=p.carry?'grab':'walk';p.t=D.stow*0.55;
      {const sX=seatX(F,p.col),rY=rowY(F,p.row);p.x=wx(i,sX,rY);p.y=wy(i,sX,rY)}al.push(p);R.pax.push(p);p.up=true;any=true;
    }
    if(any)A.pax=A.pax.filter(p=>!p.up);
  }
  for(let L=0;L<4;L++){
    const al=S.dAisle[L];if(!al.length)continue;
    const door=L%2,exitPos=door?g.P1:g.P0,br=S.dBridge[door],path=door?F.P.rear:F.P.bridge,ax=g.aisleX[L>>1];
    al.sort(door===0?(a,b)=>a.pos-b.pos:(a,b)=>b.pos-a.pos);
    let lead=door===0?-Infinity:Infinity,gone=false;
    for(const p of al){
      if(p.phase==='grab'){p.t-=dt;if(p.t<=0)p.phase='walk'}
      else{const v=D.aisleSpd*p.spd*dt;
        if(door===0)p.pos=Math.min(p.pos,Math.max(p.pos-v,exitPos,lead+GAP));else p.pos=Math.max(p.pos,Math.min(p.pos+v,exitPos,lead-GAP));
        if(Math.abs(p.pos-exitPos)<1e-6&&!br.some(q=>q.s>path.len-SPACING)){p.state='dBridge';p.s=path.len;br.push(p);A.onboard--;p.gone=true;gone=true}
      }
      if(!p.gone){const ry=rowY(F,p.pos);p.tx=wx(i,ax,ry);p.ty=wy(i,ax,ry);lead=p.pos}
    }
    if(gone)S.dAisle[L]=al.filter(p=>!p.gone);
  }
}
function stepDeplaneBridges(i,D,dt){
  const S=R.st[i];
  for(const door of DOORS){
    const br=S.dBridge[door];if(!br.length)continue;
    const F=br[0].F,path=door?F.P.rear:F.P.bridge;
    br.sort((a,b)=>a.s-b.s);let lead=-Infinity,out=false;
    for(const p of br){p.s=Math.min(p.s,Math.max(p.s-D.walk*p.spd*busMul(i)*dt,lead+SPACING,0));const q=ptAt(path,p.s);p.tx=q[0];p.ty=q[1];lead=p.s;if(p.s<=0.01){p.out=true;out=true;if(!(p.xfer&&connect(p))){p.state='toArr';p.tx=ARR_DOOR.x+(rnd()-0.5)*6;p.ty=ARR_DOOR.y;p.room=STAND_ROOM[i];route(p,ROOM_MAIN())}}}
    if(out)S.dBridge[door]=br.filter(p=>!p.out);
  }
}
function connect(p){
  const q=p.xfer,F2=q.F;
  if(F2.xferCancelled||R.st[q.stand].F!==F2||F2.plane.state==='closing')return false;
  F2.xferWait--;q.xferred=true;R.pax.push(q);airside(q,p.x,STAND_ROOM[p.stand]);q.x=p.x;q.y=p.y+4;
  G.xfers=(G.xfers||0)+1;finishArrival(p);return true;
}
function afterControl(p){
  if(p.checked){p.state='toReclaim';const a=rnd()*Math.PI*2;p.tx=carX(p.stand)+Math.cos(a)*48;p.ty=carY(p.stand)+Math.sin(a)*15}
  else exitTarget(p);
}
function finishArrival(p){
  const A=p.A;p.dead=true;A.cleared++;A.waitSum+=p.wait;countPax(true);
  {const v=(A.fare||A.ac.fare*G.fare)*0.6*(p.biz?3:1);if(A.partner)earn(v*partnerCut(),'handling');else earn(v,'inbound')}
  if(G.lv.hotel&&rnd()<0.05*G.lv.hotel)earn(6*(1+0.3*A.ac.tier)*(devOn('hotels')?2:1),'landside',1360,540,'#9FC2E0');
  if(A.cleared>=A.n&&!A.done){
    A.done=true;const avg=A.waitSum/A.n,mins=G.clock-(A.started??G.clock),pat=patience();
    if(avg<8+pat)repAdj(0.8,'arrivals');else if(avg>18+pat)repAdj(-Math.min(4,(avg-18-pat)*0.2),'arrivals');
    if(isNight()&&R.reg&&R.reg.share>0.08&&!Object.values(G.lines||{}).some(L=>L.night))repAdj(-Math.min(2.5,R.reg.share*8),'stranded');
    G.arrReports[A.stand]={tag:A.code+A.no,from:A.from,n:A.n,avg,mins:Math.round(mins),bags:A.bags};
    floater(`${A.code}${A.no} CLEARED · ${Math.round(mins)} MIN`,1150,540,avg>18+pat?'#FF7A8A':'#9FC2E0',true);
  }
}
function updateArrivals(dt,D){
  for(const b of R.arrBelt){b.t-=dt;if(b.t<=0){b.A.reclaim++;b.done=true}}
  if(R.arrBelt.some(b=>b.done))R.arrBelt=R.arrBelt.filter(b=>!b.done);
  for(let i=0;i<8;i++){
    const B=R.booths[i]||(R.booths[i]={p:null,t:0});
    if(i<D.officers&&R.arrQ.length)take(B,()=>R.arrQ.shift(),'passport',D.passT);
    if(B.p){const bp=boothPos(i);serve(B,bp.x-7,bp.y,dt,afterControl,bp.x-15,bp.y)}
  }
  for(let i=0;i<8;i++){
    const E=R.egates[i]||(R.egates[i]={p:null,t:0});
    if(i<D.egates)take(E,()=>{const n=Math.min(14,R.arrQ.length);for(let j=0;j<n;j++)if(R.arrQ[j].elig)return R.arrQ.splice(j,1)[0];return null},'passport',D.egateT);
    if(E.p){const ep=egatePos(i);serve(E,ep.x-6,ep.y,dt,afterControl,ep.x-13,ep.y)}
  }
  R.arrQ.forEach((p,i)=>{p.wait+=dt;const s=arrSlot(i);moveTo(p,s.x,s.y,75*p.spd,dt)});
  for(const p of R.pax){
    if(!p.inbound)continue;
    if(p.state==='toArr'){if(walk(p,D.cwalk*p.spd*walkMul(p),dt)){p.state='arrQ';R.arrQ.push(p)}}
    else if(p.state==='toReclaim'){p.wait+=dt;if(moveTo(p,p.tx,p.ty,80*p.spd,dt))p.state='reclaim'}
    else if(p.state==='reclaim'){p.wait+=dt;if(p.A.reclaim>0){p.A.reclaim--;exitTarget(p)}}
    else if(p.state==='exitW'){if(moveTo(p,p.tx,p.ty,80*p.spd,dt))finishArrival(p)}
  }
}
function arrive(p,D){
  const F=p.F;p.pos=p.row;
  if(p.carry){p.phase='stow';p.t=D.stow*(1+0.9*F.bags/F.seatsN)}
  else{const b=blockers(p);if(b>0){p.phase='shuffle';p.t=b*D.shuffle;F.shuffles+=b}else sit(p)}
}
function sit(p){
  const F=p.F,idx=p.row*F.geo.cols+p.col;
  F.occ[idx]=groupOf(p);F.seated++;p.phase='done';p.state='sitting';
  {const sX=seatX(F,p.col),rY=rowY(F,p.row);p.tx=wx(p.stand,sX,rY);p.ty=wy(p.stand,sX,rY)}
  F.waitSum+=p.wait;F.waitN++;G.paxSeated++;countPax(false);
  if(p.type==='prm')repAdj(G.lv.assist?0.25+0.1*G.lv.assist:-0.5,'care');if(p.type==='work'&&!F.partner)G.bizFlown=(G.bizFlown||0)+1;
  {const v=(F.fare||F.ac.fare*G.fare)*(p.row<F.bRows?3:1);if(F.partner)earn(v*partnerCut(),'handling',p.tx,p.ty-4,'#9FC2E0',F);else earn(v,'fares',p.tx,p.ty-4,null,F);if(pol('ads'))earn(0.3*(1+0.4*F.ac.tier),'ads')}tick();
}
function settle(i){
  const F=R.st[i].F,late=F.curfewHeld?0:Math.max(0,Math.floor(G.clock)-F.std),onTime=late<=0,fx=wx(i,0,CABIN_TOP-40),fy=wy(i,0,CABIN_TOP-40),pat=patience();
  let bonus=0;
  if(onTime){bonus=F.partner?0:Math.round(F.rev*0.2*100)/100;if(bonus)earn(bonus,'bonus',null,null,null,F);repAdj(2.5,'punctual');G.ontime++;G.streak++;G.bestStreak=Math.max(G.bestStreak,G.streak);floater(bonus?'ON TIME  +'+money(bonus):'ON TIME',fx,fy,'#FFC72C',true);kaching()}
  else{repAdj(-Math.min(8,1.5+late*0.2),'late');G.streak=0;floater(`LATE ${late} MIN`,fx,fy,'#FF7A8A',true);tone(220,0.35,0.04,'sawtooth')}
  const wait=F.waitN?F.waitSum/F.waitN:0;
  if(F.freighter){}else if(wait<5+pat)repAdj(1,'queues');else if(wait>12+pat)repAdj(-Math.min(5,(wait-12-pat)*0.25),'queues');
  if(F.cargo)earn((F.partner?partnerCut():1)*(F.freighter?(F.cargo+F.arr.bags)*CARGO_RATE():F.cargo*F.ac.fare*0.8)*(G.lv.cargohub?2:1)*(1+devSum('cargo')+0.15*Object.values(G.lines||{}).filter(L=>L.freight).length),'cargo',null,null,null,F);
  const op=F.partner?0:(F.op??F.ac.op*fuelMul());if(op)spend(op,'costs');else earn(F.ac.op*0.6,'handling',null,null,null,F);
  {const fl=G.fleet[F.fleetIdx];if(fl)fl.wear=(fl.wear||0)+F.ac.wear*(1-0.25*G.lv.hangar)}
  if(nightWin()&&!pol('curfew')){const nz=(1-0.3*G.lv.insul)*(F.freighter?1.5:1)*(1+0.25*G.level);G.noiseDay=(G.noiseDay||0)+nz;R.noiseT=G.clock;repAdj(-0.4*nz,'noise')}
  if(!F.partner&&F.city&&!F.freighter){const rs=rsOf(F.city),lf=F.booked/F.seatsN;rs.p+=F.booked;rs.v+=F.rev;rs.n++;rs.c=(rs.c||0)+op;rs.tp+=F.booked;rs.tv+=F.rev;rs.tn++;rs.tc=(rs.tc||0)+op;rs.lf=rs.tn>1?rs.lf*0.7+lf*0.3:lf}
  G.flights++;G.flown+=F.booked;if(G.dstat){const ds=G.dstat,h=Math.floor(G.clock/60)%24;ds.flights++;if(onTime)ds.ontime++;if(!F.freighter&&F.booked>=F.seatsN)ds.full=(ds.full||0)+1;if(h>=23||h<5)ds.night=(ds.night||0)+1;if(onTime&&R.fx.snow>G.clock)ds.snowOT=(ds.snowOT||0)+1}
  const mins=Math.max(1,G.clock-(F.firstScan??F.boardStart??F.start));
  const profit=F.rev-op;
  G.gstats[i]=(G.gstats[i]||[]).concat([{p:profit,o:onTime}]).slice(-5);
  G.reports[i]={tag:F.code+F.no,plane:F.ac.short,method:G.stands[i].method,pax:F.booked,mins:Math.round(mins),rate:F.booked/mins,shuffles:F.shuffles,wait:wait,onTime,late,profit,bags:F.checkedTotal};
  const bk=F.ac.short+'-'+G.stands[i].method;G.best[bk]=Math.max(G.best[bk]||0,F.booked/mins);
  G.history.unshift({std:F.std,tag:F.code+F.no,dest:F.dest,gate:GATES[i],dep:Math.floor(G.clock),late,profit});
  G.history.length=Math.min(G.history.length,5);
  if(R.sim)return;
  renderHist();save();
  if(G.tab==='office')renderPanel();
}

