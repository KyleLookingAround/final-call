/* ================= arrivals: immigration, reclaim, customs and the way out ================= */
// Arriving passengers leave the concourse by their own door into the immigration hall (toArr). Off a domestic flight they
// walk straight through the domestic channel; everyone else queues (R.arrQ, one list with a queue for the passport desks
// and one for the e-gates, p.eg) and a desk or e-gate serves them in the wall to reclaim. Passengers with hold bags wait at
// their flight's carousel; everyone then walks through customs, where 1 in 40 has their case opened, and the arrivals hall,
// where meeters wait at the barrier, to the station, a stop, a taxi, car hire, the hotel or out (finishArrival, 08-stands.js).
const DOMESTIC=new Set(['EDI','BFS','JER']); // three of the seven short-haul cities are in the same country: no passports
const isDomestic=A=>!!(A&&A.from&&DOMESTIC.has(A.from[0]));
const DOM_X=1190,CUS_ODDS=1/40,CUS_X=[996,1026,1056,1086],CUS_Y=710,TAXI={x:1052,y:780},HIRE_X=[722,746,770];
// the e-gate queue zig-zags in front of the e-gates, the desk queue in front of the desks (arrSlot, 04-geometry.js)
function egSlot(i){if(i>=78)return slot(1004+(i%20)*8,564+((i/20|0)%3)*8);const per=13,r=Math.floor(i/per),k=i%per;return slot(r%2===0?852+k*8:852+(per-1-k)*8,584-r*10)}
const arrStat=()=>R.arrSt||(R.arrSt={dom:0,eg:0,desk:0,cus:0,met:0});
// desks call the front of their own queue, and help with the e-gate queue when theirs is empty; e-gates take only e-gate passports
function deskPick(){const Q=R.arrQ;for(let j=0;j<Q.length;j++)if(!Q[j].eg)return Q.splice(j,1)[0];return Q.length?Q.shift():null}
function egPick(){const Q=R.arrQ;for(let j=0;j<Q.length;j++)if(Q[j].eg)return Q.splice(j,1)[0];return null}
function updateImmigration(dt,D){
  for(let i=0;i<8;i++){
    const B=R.booths[i]||(R.booths[i]={p:null,t:0});
    if(i<D.officers&&R.arrQ.length)take(B,deskPick,'passport',D.passT);
    if(B.p){const bp=boothPos(i);serve(B,bp.x,bp.y-8,dt,afterDesk,bp.x,bp.y-18)}
  }
  for(let i=0;i<8;i++){
    const E=R.egates[i]||(R.egates[i]={p:null,t:0});
    if(i<D.egates)take(E,egPick,'passport',D.egateT);
    if(E.p){const ep=egatePos(i);serve(E,ep.x,ep.y-8,dt,afterGate,ep.x,ep.y-18)}
  }
  let di=0,ei=0;for(const p of R.arrQ){p.wait+=dt;const s=p.eg?egSlot(ei++):arrSlot(di++);moveTo(p,s.x,s.y,75*p.spd,dt)}
  R.arrN=[di,ei];
  if(!R.sim)updateMeeters(dt);
}
const afterDesk=p=>{arrStat().desk++;afterControl(p)},afterGate=p=>{arrStat().eg++;afterControl(p)};
// e-gate passports join the e-gate queue unless the desks would be quicker
function joinQueue(p,D){
  const [dn,en]=R.arrN||[0,0];
  p.eg=p.elig&&D.egates>0&&(en+1)*D.egateT/D.egates<=(dn+1)*D.passT/D.officers+1;
  p.state='arrQ';R.arrQ.push(p);
}
function afterControl(p){ // through the passport desk, e-gate or domestic channel into the reclaim hall
  p.y=SEC_LINE+8;p.room=hallId('rec');
  if(p.checked){p.state='toReclaim';const a=rnd()*Math.PI*2;p.tx=carX(p.stand)+Math.cos(a)*48;p.ty=carY(p.stand)+Math.sin(a)*15}
  else exitTarget(p);
}
// out of reclaim through customs first: most walk the green channel, and 1 in 40 is stopped at a table in the red one
function toCustoms(p){
  const T=R.cusT||(R.cusT=[]);p.cus=1;p.state='toCus';
  if(rnd()<CUS_ODDS){const busy=q=>q&&!q.dead&&(q.state==='toCus'||q.state==='cusChk');let k=0;while(k<CUS_X.length-1&&busy(T[k]))k++;T[k]=p;p.cus=2;p.tx=CUS_X[k];p.ty=CUS_Y+8}
  else{p.tx=920+(p.x%36);p.ty=CUS_Y+6}
  route(p,hallId('cus'));
}
function exitTarget(p){ // through customs and the arrivals hall to the station, a stop, a taxi, car hire, or the forecourt
  if(!p.cus&&p.room===hallId('rec')){toCustoms(p);return}
  p.state='exitW';if(TERM_EXIT.length&&TERM_EXIT.some(f=>f(p)))return;
  const tk=pickTransit();
  if(tk==='train'&&G.lv.rail){p.tx=40+rnd()*260;p.ty=704+LAND_DY}
  else if(tk==='tram'){p.tx=40+rnd()*260;p.ty=789+LAND_DY}
  else if(tk==='bus'){p.tx=236+rnd()*40;p.ty=641+LAND_DY}
  else{const r=rnd();
    if(r<0.4){p.tx=TAXI.x-24+rnd()*48;p.ty=TAXI.y} // the taxi rank
    else if(r<0.55&&p.room!==hallId('arh')){p.state='toHire';const k=Math.floor(rnd()*HIRE_X.length);p.tx=HIRE_X[k];p.ty=752;route(p,hallId('arh'));return}
    else{p.tx=EXIT.x+(rnd()-0.5)*18;p.ty=EXIT.y}}
  route(p,hallId('out'));
}
ARR_STEP.toArr=(p,dt,D)=>{if(walk(p,D.cwalk*p.spd*walkMul(p),dt)){
  if(isDomestic(p.A)){p.state='dom';p.tx=DOM_X+(p.x-ARR_DOOR.x)*0.8;p.ty=SEC_LINE-4}else joinQueue(p,D)}};
ARR_STEP.dom=(p,dt)=>{if(moveTo(p,p.tx,p.ty,80*p.spd,dt)){arrStat().dom++;afterControl(p)}};
ARR_STEP.toReclaim=(p,dt)=>{p.wait+=dt;if(moveTo(p,p.tx,p.ty,80*p.spd,dt))p.state='reclaim'};
ARR_STEP.reclaim=(p,dt)=>{p.wait+=dt;if(p.A.reclaim>0){p.A.reclaim--;exitTarget(p)}};
ARR_STEP.toCus=(p,dt)=>{if(walk(p,80*p.spd,dt)){if(p.cus===2){p.state='cusChk';p.t=1+rnd();arrStat().cus++}else exitTarget(p)}};
ARR_STEP.cusChk=(p,dt)=>{p.t-=dt;if(p.t<=0)exitTarget(p)};
ARR_STEP.toHire=(p,dt)=>{if(walk(p,80*p.spd,dt)){p.state='hire';p.t=0.6+rnd()*0.8}};
ARR_STEP.hire=(p,dt)=>{p.t-=dt;if(p.t<=0){p.state='exitW';const q=BAY(Math.floor(rnd()*carCap()));p.tx=q.x;p.ty=q.y;route(p,hallId('out'))}};
ARR_STEP.exitW=(p,dt)=>{if(walk(p,80*p.spd,dt))finishArrival(p)};

/* meeters and greeters: they wait at the arrivals barrier with signs, more when more flights are due, and walk off with
   their passenger when they come through. They're only drawn, so they never touch the game (their own generator, not rnd). */
const MEET_MAX=24;
const meetRnd=()=>{R.meetS=((R.meetS||7)*16807)%2147483647;return R.meetS/2147483647};
function meetSpot(k){const side=k%2,c=(k>>1)%3,r=k/6|0;return {x:side?1000+c*12:940-c*12,y:727+r*7}}
function updateMeeters(dt){
  const M=R.meet||(R.meet=[]),arh=hallId('arh');
  // flights with passengers still to come through, landed or due within half an hour
  const want=new Map();let total=0;
  for(const i of SIDX){const F=R.st[i].F,A=F&&F.arr;if(!A||A.done)continue;if(!F.landed&&A.sta-G.clock>30)continue;
    const n=Math.min(6,Math.ceil((A.n-A.cleared)*0.05));if(n>0){want.set(A,n);total+=n}}
  const come=[];for(const q of R.pax)if(q.inbound&&q.state==='exitW'&&q.room===arh&&!q.met)come.push(q);
  const have=new Map();for(const m of M)if(m.st==='in'||m.st==='wait')have.set(m.A,(have.get(m.A)||0)+1);
  R.meetT=(R.meetT||0)-dt;
  if(R.meetT<=0&&M.filter(m=>m.st!=='out').length<Math.min(MEET_MAX,total)){
    for(const [A,n] of want)if((have.get(A)||0)<n){const used=new Set(M.map(m=>m.k));let k=0;while(used.has(k)&&k<MEET_MAX)k++;if(k>=MEET_MAX)break;
      const s=meetSpot(k),col=['#E3C08A','#C9A7E0','#9FD6C0','#E0A7A7','#A7C4E0'][Math.floor(meetRnd()*5)];
      M.push({A,k,x:900+meetRnd()*140,y:EXIT.y+4,tx:s.x,ty:s.y,st:'in',col,sign:A.code,t:0});R.meetT=0.25;break}}
  for(const m of M){
    if(m.st==='in'&&m.A.done){m.st='out';m.k=-1;m.tx=970;m.ty=EXIT.y+6}
    if(m.st==='in'){if(m.y>LAND_B+2){moveTo(m,970+(m.x-970)*0.3,LAND_B-4,70,dt)}else if(moveTo(m,m.tx,m.ty,70,dt))m.st='wait'}
    else if(m.st==='wait'){const A=m.A,F=R.st[A.stand]&&R.st[A.stand].F;
      if(A.done||!F||F.arr!==A){m.st='out';m.k=-1;m.tx=970+(meetRnd()-0.5)*30;m.ty=EXIT.y+6;continue}
      const p=come.find(q=>q.A===A&&!q.met);
      if(p&&meetRnd()<0.35){p.met=1;m.p=p;m.st='meet';m.k=-1;arrStat().met++}}
    else if(m.st==='meet'){const p=m.p;if(p.dead||p.room!==arh&&p.y>LAND_B+30){m.st='out';m.tx=p.x;m.ty=p.y+8;continue}
      if(moveTo(m,p.x+5,p.y+2,120,dt)&&!m.hug){m.hug=1.2}if(m.hug>0)m.hug-=dt}
    else if(m.st==='out'){if(moveTo(m,m.tx,m.ty,80,dt))m.gone=1}
  }
  if(M.some(m=>m.gone))R.meet=M.filter(m=>!m.gone);
}
function drawMeeters(){
  for(const m of R.meet||[]){
    ctx.fillStyle=m.col;ctx.beginPath();ctx.arc(m.x,m.y,2.6,0,Math.PI*2);ctx.fill();
    if(m.st==='wait'){ctx.fillStyle='#ECE8DF';ctx.fillRect(m.x-5,m.y-9,10,5);ctx.fillStyle='#17181A';ctx.fillRect(m.x-3.5,m.y-7.2,7,1.3)} // a name board
    if(m.hug>0)mono('♥',m.x-2,m.y-5,'#FF7AB6',8,'center');
  }
}
// the arrivals part's furniture: passport desks with an officer at each open one, e-gates, the domestic channel, customs'
// channels and search tables, the barrier with meeters, car hire, the hotel desk and the taxi rank
function drawArrivals(D){
  const inWall=(x,w,y)=>{ctx.fillStyle='#191D22';ctx.fillRect(x-w,y-2,2*w,4)};
  for(let i=0;i<8;i++){const b=boothPos(i),open=i<D.officers;if(open)inWall(b.x,6,b.y);
    ctx.fillStyle=open?'#6A7580':i<OWN.officers()?'#3A424B':'#262C32';ctx.fillRect(b.x-10,b.y-3,8,5);ctx.fillRect(b.x-10,b.y+2,2,5);
    if(open){ctx.fillStyle='#2B4A73';ctx.beginPath();ctx.arc(b.x-6,b.y+6,2.6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#FFC72C';ctx.fillRect(b.x-7.2,b.y+2.6,2.4,1.4)}} // an officer, with a badge on the cap
  for(let i=0;i<8;i++){const e=egatePos(i),open=i<D.egates;if(open)inWall(e.x,4,e.y);ctx.fillStyle=open?'#5CC8FF':'#262C32';ctx.fillRect(e.x-6,e.y-4,3,9);ctx.fillRect(e.x+3,e.y-4,3,9);
    if(open){ctx.fillStyle=R.egates[i]&&R.egates[i].p?'#6BE39A':'#2A3A44';ctx.fillRect(e.x-1,e.y-6,2,2)}}
  inWall(DOM_X,12,SEC_LINE);ctx.fillStyle='#4E5964';ctx.fillRect(DOM_X-13,SEC_LINE-3,2,7);ctx.fillRect(DOM_X+11,SEC_LINE-3,2,7);mono('DOMESTIC',DOM_X,SEC_LINE+11,'#909AA4',6.5,'center');
  if(D.egates)mono('E-GATES',848+D.egates*6,SEC_LINE+11,'#5CC8FF',6.5,'center');
  // customs: a green and a red channel, with search tables in the red one
  ctx.fillStyle='rgba(107,227,154,.18)';ctx.fillRect(900,702,64,16);ctx.fillStyle='rgba(255,122,138,.16)';ctx.fillRect(976,702,124,16);
  mono('NOTHING TO DECLARE',932,708,'#6BE39A',5.5,'center');mono('GOODS TO DECLARE',1008,708,'#FF7A8A',5.5,'center');
  const T=R.cusT||[];
  CUS_X.forEach((x,k)=>{const p=T[k],on=p&&!p.dead&&p.state==='cusChk';ctx.fillStyle='#3A424B';ctx.fillRect(x-7,CUS_Y-1,14,5);
    if(on){ctx.fillStyle='#2B4A73';ctx.beginPath();ctx.arc(x,CUS_Y-4,2.4,0,Math.PI*2);ctx.fill(); // the officer
      ctx.fillStyle='#D9A066';ctx.fillRect(x-6,CUS_Y-0.5,5,4);ctx.fillRect(x+1,CUS_Y-0.5,5,4);ctx.fillStyle='#ECE8DF';ctx.fillRect(x-4,CUS_Y+0.5,2,1);ctx.fillRect(x+2,CUS_Y+1.5,3,1)}}); // the case, open
  // the arrivals hall: the barrier either side of the way through, car hire desks, the hotel desk
  ctx.fillStyle='#4E5964';ctx.fillRect(946,722,2,32);ctx.fillRect(992,722,2,32);
  HIRE_X.forEach(x=>{ctx.fillStyle='#3A424B';ctx.fillRect(x-9,757,18,5);ctx.fillStyle='#8C97A1';ctx.beginPath();ctx.arc(x,764.5,2.2,0,Math.PI*2);ctx.fill()});
  mono('CAR HIRE',746,752,'#909AA4',6.5,'center');
  if(G.lv.hotel){ctx.fillStyle='#3A424B';ctx.fillRect(1206,736,14,5);mono('HOTEL',1213,733,'#909AA4',6.5,'center')}
  // the taxi rank on the kerb outside
  ctx.fillStyle='#1A1F24';ctx.fillRect(TAXI.x-40,LAND_B+10,80,16);
  for(let k=0;k<3;k++){ctx.fillStyle='#FFC72C';rrect(TAXI.x-36+k*25,LAND_B+13,19,10,2);ctx.fill();ctx.fillStyle='#17181A';ctx.fillRect(TAXI.x-31+k*25,LAND_B+15,5,6)}
  mono('TAXIS',TAXI.x+44,LAND_B+21,'#FFC72C',7);
  drawMeeters();
}
TERM_DRAW.push(drawArrivals);
TERM_DAY.push(()=>{R.arrSt=null});
// the Terminal › Arrivals sub-tab: how immigration and customs are doing today
(TERM_PANEL.arr||(TERM_PANEL.arr=[])).push(()=>{
  const D=derived(),[dn,en]=R.arrN||[0,0],s=arrStat(),through=s.desk+s.eg+s.dom,pct=v=>through?Math.round(v*100/through):0;
  const dw=dn*D.passT/Math.max(1,D.officers),ew=D.egates?en*D.egateT/D.egates:0,w=v=>`~${Math.round(v)} min`;
  return `<div class="sec">Immigration<span>today</span></div>`
    +`<div class="row">${svg('passport')}<div><div class="rt">Passport desks</div><div class="rd"><b>${dn}</b> queuing · ${w(dw)} · ${D.officers} open · ${pct(s.desk)}% of arrivals</div></div></div>`
    +(D.egates?`<div class="row">${svg('scan')}<div><div class="rt">E-gates</div><div class="rd"><b>${en}</b> queuing · ${w(ew)} · ${pct(s.eg)}% of arrivals</div></div></div>`:'')
    +`<div class="row">${svg('plane')}<div><div class="rt">Domestic</div><div class="rd">Off flights from ${[...DOMESTIC].map(c=>CITY[c].name).join(', ').replace(/, ([^,]*)$/,' and $1')}, passengers walk straight through · ${pct(s.dom)}% of arrivals</div></div></div>`
    +`<div class="sec">Customs<span>today</span></div>`
    +`<div class="row">${svg('bag')}<div><div class="rt">Cases opened</div><div class="rd"><b>${s.cus}</b> · about 1 arriving passenger in 40</div></div></div>`
    +(s.met?`<p class="note">${s.met} passengers met at the barrier today.</p>`:'');
});
Object.assign(SIMX,{isDomestic,DOMESTIC,egSlot,arrStat,DOM_X,CUS_X});
