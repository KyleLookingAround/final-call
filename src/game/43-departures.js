/* ================= departures: check-in and security ================= */
// Passengers come in from the forecourt (walkIn), check in at a desk or kiosk unless they did it online, and queue for
// security. A lane serves them in the wall between the security hall and the market place, and airside() takes over.
PAX_STEP.walkIn=(p,dt)=>{if(walk(p,110*p.spd,dt))enterLandside(p)};
function enterLandside(p){if(p.online)enterSecurity(p);else{p.state='queue';R.ciQ.push(p)}}
function enterSecurity(p){
  const D=derived();
  const vip=p.biz||p.prio,ftW=R.ftQ.length*0.6,secW=R.secQ.length/Math.max(1,D.lanes);
  if(D.ft&&(vip?ftW<=secW+2:R.ftQ.length<8&&rnd()<D.ftBuy*PTYPE[p.type||'lei'].ft)){
    if(!vip) earn(p.F.fare*0.6,'fast',null,null,null,p.F);
    p.fast=true;p.state='ftQ';R.ftQ.push(p);
  } else {p.state='secQ';R.secQ.push(p)}
}
function finishCheckin(p,x){
  if(p.checked){if(G.lv.bagfee>0)earn(p.F.ac.fare*0.5,'bags',x,691,'#D9A066',p.F);R.belt.push({x,F:p.F})}
  enterSecurity(p);
}
function updateCheckin(dt,D){
  for(let i=0;i<8;i++){
    const d=R.desks[i]||(R.desks[i]={p:null,t:0});
    if(i<D.desks&&R.ciQ.length)take(d,()=>R.ciQ.shift(),'desk',q=>D.checkin*(q.leader?0.4:1)*(q.type==='prm'?1.5:1));
    if(d.p) serve(d,deskX(i),707,dt,p=>finishCheckin(p,deskX(i)),deskX(i)+4,715);
  }
  for(let i=0;i<4;i++){
    const k=R.kiosks[i]||(R.kiosks[i]={p:null,t:0});
    if(i<D.kiosks)take(k,()=>{const n=Math.min(14,R.ciQ.length);for(let j=0;j<n;j++)if(!R.ciQ[j].checked)return R.ciQ.splice(j,1)[0];return null},'desk',D.kiosk);
    if(k.p) serve(k,kioskX(i),707,dt,p=>finishCheckin(p,kioskX(i)),kioskX(i)+3,715);
  }
  R.ciQ.forEach((p,i)=>{p.wait+=dt;const s=ciSlot(i);moveTo(p,s.x,s.y,70*p.spd,dt)});
}
function updateSecurity(dt,D){
  for(let i=0;i<8;i++){
    const L=R.lanes[i]||(R.lanes[i]={p:null,t:0});
    if(i<D.lanes&&R.secQ.length)take(L,()=>R.secQ.shift(),'sec',D.sec);
    if(L.p) serve(L,laneX(i),SEC_LINE+12,dt,p=>airside(p,laneX(i)),laneX(i),SEC_LINE+22);
  }
  if(D.ft){const L=R.ftL;if(R.ftQ.length)take(L,()=>R.ftQ.shift(),'sec',D.sec*0.6);if(L.p)serve(L,FT_X,SEC_LINE+12,dt,p=>airside(p,FT_X),FT_X,SEC_LINE+22)}
  else if(R.ftQ.length){while(R.ftQ.length){const p=R.ftQ.shift();p.state='secQ';R.secQ.push(p)}}
  R.secQ.forEach((p,i)=>{p.wait+=dt;const s=secSlot(i);moveTo(p,s.x,s.y,75*p.spd,dt)});
  R.ftQ.forEach((p,i)=>{p.wait+=dt;const s=ftSlot(i);moveTo(p,s.x,s.y,75*p.spd,dt)});
}
