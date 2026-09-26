/* ================= arrivals: immigration, reclaim, customs and the way out ================= */
// Arriving passengers leave the concourse by their own door into the immigration hall (toArr), queue (R.arrQ), and a
// passport desk or e-gate serves them in the wall to reclaim. Passengers with hold bags wait at their flight's carousel;
// everyone then walks through customs and the arrivals hall to the station, a stop, or out (finishArrival in 08-stands.js).
function updateImmigration(dt,D){
  for(let i=0;i<8;i++){
    const B=R.booths[i]||(R.booths[i]={p:null,t:0});
    if(i<D.officers&&R.arrQ.length)take(B,()=>R.arrQ.shift(),'passport',D.passT);
    if(B.p){const bp=boothPos(i);serve(B,bp.x,bp.y-8,dt,afterControl,bp.x,bp.y-18)}
  }
  for(let i=0;i<8;i++){
    const E=R.egates[i]||(R.egates[i]={p:null,t:0});
    if(i<D.egates)take(E,()=>{const n=Math.min(14,R.arrQ.length);for(let j=0;j<n;j++)if(R.arrQ[j].elig)return R.arrQ.splice(j,1)[0];return null},'passport',D.egateT);
    if(E.p){const ep=egatePos(i);serve(E,ep.x,ep.y-8,dt,afterControl,ep.x,ep.y-18)}
  }
  R.arrQ.forEach((p,i)=>{p.wait+=dt;const s=arrSlot(i);moveTo(p,s.x,s.y,75*p.spd,dt)});
}
function afterControl(p){ // through the passport desk into the reclaim hall
  p.y=SEC_LINE+8;p.room=hallId('rec');
  if(p.checked){p.state='toReclaim';const a=rnd()*Math.PI*2;p.tx=carX(p.stand)+Math.cos(a)*48;p.ty=carY(p.stand)+Math.sin(a)*15}
  else exitTarget(p);
}
function exitTarget(p){ // out through customs and the arrivals hall to the station, a stop, or the forecourt
  p.state='exitW';if(TERM_EXIT.length&&TERM_EXIT.some(f=>f(p)))return;
  const tk=pickTransit();
  if(tk==='train'&&G.lv.rail){p.tx=40+rnd()*260;p.ty=704+LAND_DY}
  else if(tk==='tram'){p.tx=40+rnd()*260;p.ty=789+LAND_DY}
  else if(tk==='bus'){p.tx=236+rnd()*40;p.ty=641+LAND_DY}
  else{p.tx=EXIT.x+(rnd()-0.5)*18;p.ty=EXIT.y}
  route(p,hallId('out'));
}
ARR_STEP.toArr=(p,dt,D)=>{if(walk(p,D.cwalk*p.spd*walkMul(p),dt)){p.state='arrQ';R.arrQ.push(p)}};
ARR_STEP.toReclaim=(p,dt)=>{p.wait+=dt;if(moveTo(p,p.tx,p.ty,80*p.spd,dt))p.state='reclaim'};
ARR_STEP.reclaim=(p,dt)=>{p.wait+=dt;if(p.A.reclaim>0){p.A.reclaim--;exitTarget(p)}};
ARR_STEP.exitW=(p,dt)=>{if(walk(p,80*p.spd,dt))finishArrival(p)};
