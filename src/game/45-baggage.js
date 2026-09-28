/* ================= baggage: from the check-in belt to the hold, and from the plane to the carousel ================= */
// Bags are counts at each stage of each flight; only a sample is drawn. A departing bag rides the belt behind the check-in
// desks into the baggage hall (BAG_HALL), is screened (one in BAG_SEARCH goes to the search room), sorted, and waits in its
// flight's cart at a make-up position. A flight without a position yet (they go earliest departure first) has its bags kept
// in the early bag store, or circling the sorter, which eats its capacity. Tug trains take full carts, or the last bags,
// through the tunnel to the stand, where they count as ready for the hold (F.bagsIn); the stand loads it (08-stands.js).
// A flight that is ready to go leaves behind bags that haven't reached a tug: each costs a courier and some rating.
// An arriving flight's bags go by tug from the stand to the hall and onto its carousel (A.reclaim). Transfer bags come
// off first, and go through screening and the sorter to their next flight.
const BAG_GRACE=5,BAG_SCR=10,BAG_SEARCH=20,BAG_SEARCH_T=3,BAG_SORT=20,BAG_LOOP_T=8,BAG_TUG=30,BAG_TUGIN=25,TUG_V=260,CAR_CAP=45,CAR_FEED=18;
const bagMul=()=>1+0.35*G.lv.bagsys; // the Automated baggage system speeds the sorter, the belts and the carousels
const bagCaps=()=>({scr:(1+G.lv.screen)*BAG_SCR,sort:BAG_SORT*bagMul(),loop:40*(1+G.lv.bagsys),pos:4+2*G.lv.makeup,ebs:150*G.lv.ebs,car:Math.min(8,4+G.lv.carousels,Math.max(1,builtCount()))}); // no more carousels than stands
Object.assign(UPG,{
  screen:{tab:'terminal',sec:'Baggage',icon:'scan',name:'Hold bag screening',max:5,base:60,mult:2.2,lvl:1,fx:(l,m)=>m?`<b>${1+l}</b> machines screen <b>${(1+l)*BAG_SCR}</b> bags a minute`:`<b>${1+l}</b> → <b>${2+l}</b> machines, <b>${(1+l)*BAG_SCR}</b> → <b>${(2+l)*BAG_SCR}</b> bags a minute`},
  makeup:{tab:'terminal',sec:'Baggage',icon:'cart',name:'Make-up positions',max:6,base:150,mult:2,lvl:2,fx:(l,m)=>m?`Carts for <b>${4+2*l}</b> flights at once`:`Carts for <b>${4+2*l}</b> → <b>${6+2*l}</b> flights at once. Later flights’ bags wait.`},
  carousels:{tab:'terminal',sec:'Baggage',icon:'bag',name:'Reclaim carousels',max:4,base:120,mult:2.2,lvl:2,fx:(l,m)=>m?`<b>${4+l}</b> carousels`:`<b>${4+l}</b> → <b>${5+l}</b> carousels, so fewer flights share one`},
  ebs:{tab:'terminal',sec:'Baggage',icon:'box',name:'Early bag store',max:3,base:900,mult:2.5,lvl:3,fx:(l,m)=>m?`Holds <b>${150*l}</b> early bags`:`Holds <b>${150*l}</b> → <b>${150*(l+1)}</b> bags for flights without a make-up position, instead of circling the sorter`}
});
TERM_SUBS.push(['bag','Baggage']);TERM_SECS.bag=['Baggage'];
TERM_FIELDS.bagMiss=()=>0; // bags left behind, all time
Object.assign(REPWHY,{bags:['bags left behind',['screen','makeup','ebs','bagsys']]});REPLBL.bags='Bags left behind';
// runtime state: queues of [flight, count] groups, the search room, circling and stored totals, positions, tugs and carousels
// (made afresh when a save loads, which rebuilds R.st and starts every stand's flights afresh)
function bagRT(){return R.bag&&R.bag.st===R.st?R.bag:(R.bag={st:R.st,scr:[],sAcc:0,flag:0,srch:[],sort:[],oAcc:0,loop:0,ebs:0,pos:[],tugs:[],car:[],late:0})}
const bgOf=F=>F.bg||(F.bg={loop:0,ebs:0,mk:0,mk0:0,tug:0,cut:false,pos:false,miss:0,rdy:null});
const abOf=A=>A.bg||(A.bg={ap:0,ap0:0,hall:0,fed:0,acc:0,first:null,last:null,stall:0,xs:false});
const bagLive=F=>R.st[F.i]&&R.st[F.i].F===F&&!(F.bg&&F.bg.cut); // still at its stand and taking bags
function qPush(q,F,n){const t=q[q.length-1];if(t&&t[0]===F)t[1]+=n;else q.push([F,n])}
const qCount=q=>{let n=0;for(const g of q)n+=g[1];return n};
// the stand's baggage point, where the cart run meets the building, and a tug's time to it from the hall
const HALL_OUT={x:630,y:SEC_Y},TUNNEL={x:630,y:TERM_Y-10};
function bagPt(i){const S=R.st[i];if(S&&S.P&&S.P.cart){const q=ptAt(S.P.cart,0);return {x:q[0],y:q[1]}}toW(i,118,FACE_Y);return {x:WP.x,y:WP.y}}
function tugTime(i){const b=bagPt(i);return (HALL_OUT.y-TUNNEL.y+Math.hypot(b.x-TUNNEL.x,b.y-TUNNEL.y))/(TUG_V*(1+0.15*G.lv.bagsys))}
// every update: the belt into the hall, screening, the search room, the sorter, make-up and tugs out to the stands
function updateBelt(dt){
  const B=bagRT(),C=bagCaps(),beltV=80*(1+0.3*G.lv.bagsys);
  for(const b of R.belt){b.x+=beltV*dt;if(b.x>=BAG_HALL[0]){b.done=true;bgOf(b.F);if(bagLive(b.F))qPush(B.scr,b.F,1)}}
  if(R.belt.some(b=>b.done)) R.belt=R.belt.filter(b=>!b.done);
  // screening: one bag in BAG_SEARCH is pulled aside and opened in the search room, two at a time
  B.sAcc=B.scr.length?Math.min(B.sAcc+C.scr*dt,C.scr):0;
  while(B.sAcc>=1&&B.scr.length){const g=B.scr[0],F=g[0];if(!bagLive(F)){B.scr.shift();continue}
    B.sAcc--;if(++B.flag%BAG_SEARCH===0)B.srch.push({F,t:BAG_SEARCH_T});else qPush(B.sort,F,1);if(--g[1]<=0)B.scr.shift()}
  for(let k=0;k<Math.min(2,B.srch.length);k++){const s=B.srch[k];s.t-=dt;if(s.t<=0){if(bagLive(s.F))qPush(B.sort,s.F,1);B.srch.splice(k--,1)}}
  // the sorter: bags for a flight with a make-up position drop into its cart; the others go to the store or circle
  B.oAcc=B.sort.length?Math.min(B.oAcc+Math.max(1,C.sort-B.loop/BAG_LOOP_T)*dt,C.sort):0;
  while(B.oAcc>=1&&B.sort.length){const g=B.sort[0],F=g[0],f=F.bg;if(!bagLive(F)){B.sort.shift();continue}
    if(!f.pos&&B.pos.length<C.pos)givePos(F);
    let k=Math.min(g[1],Math.floor(B.oAcc));
    if(f.pos){if(!f.mk)f.mk0=G.clock;f.mk+=k}
    else{const e=Math.min(k,Math.max(0,C.ebs-B.ebs)),l=Math.min(k-e,Math.max(0,Math.floor(C.loop-B.loop)));f.ebs+=e;B.ebs+=e;f.loop+=l;B.loop+=l;k=e+l;if(!k)break} // full: the sorter backs up
    B.oAcc-=k;if((g[1]-=k)<=0)B.sort.shift()}
  // flights at their stands: tugs leave with a full cart, the last bags, or bags that have waited (not long once boarding,
  // and at once when the flight is ready to go). A flight ready to go after its departure time waits BAG_GRACE minutes for
  // bags still on their way, then leaves behind those that haven't reached a tug
  for(const i of SIDX){const F=R.st[i].F;if(!F||F.freighter)continue;const f=bgOf(F),pl=F.plane;
    const going=pl.state==='boarding'||pl.state==='closing',ready=pl.state==='boarding'&&G.clock>=F.std&&!F.manifest.length&&!F.straggler&&F.seated>=F.booked;
    if(ready&&f.rdy==null)f.rdy=G.clock;
    if(f.mk>0&&(f.mk>=BAG_TUG||ready||G.clock-f.mk0>=(going?2:10)||going&&f.mk>=F.checkedTotal-F.bagsIn-f.tug)){B.tugs.push({F,i,n:f.mk,t:0,T:tugTime(i),out:1});f.tug+=f.mk;f.mk=0}
    if(ready&&!f.cut&&G.clock-f.rdy>=BAG_GRACE){const n=Math.round(F.checkedTotal-F.bagsIn-f.tug);if(n>0)leaveBags(F,n)}
    if(f.pos&&(going&&!f.mk&&F.checkedTotal-F.bagsIn-f.tug<=0&&!F.manifest.length||f.cut))dropPos(F)}
  for(const T of B.tugs)if(T.out){T.t+=dt;if(T.t>=T.T){T.done=true;T.F.bg.tug-=T.n;if(R.st[T.F.i].F===T.F)T.F.bagsIn+=T.n}}
}
function givePos(F){const f=bgOf(F),B=bagRT();if(f.pos)return;f.pos=true;B.pos.push(F);
  if(f.loop){if(!f.mk)f.mk0=G.clock;f.mk+=f.loop;B.loop-=f.loop;f.loop=0}
  if(f.ebs){qPush(B.sort,F,f.ebs);B.ebs-=f.ebs;f.ebs=0}} // stored bags go back through the sorter
function dropPos(F){const f=F.bg,B=bagRT();f.pos=false;B.pos=B.pos.filter(x=>x!==F)}
// bags that won't make it: the flight goes without them, a courier takes them on, and passengers mind
function leaveBags(F,n){const f=bgOf(F),B=bagRT();f.cut=true;f.miss+=n;F.checkedTotal-=n;
  B.loop-=f.loop;B.ebs-=f.ebs;f.loop=f.ebs=f.mk=0;
  B.scr=B.scr.filter(g=>g[0]!==F);B.sort=B.sort.filter(g=>g[0]!==F);B.srch=B.srch.filter(s=>s.F!==F);
  spend(n*F.fare*2,'costs',F.i);repAdj(-0.25*n,'bags',F.i);G.bagMiss=(G.bagMiss||0)+n;dayAdd('bagMiss',n);
  toW(F.i,0,CABIN_TOP-24);floater(`${n} BAG${n>1?'S':''} LEFT BEHIND`,WP.x,WP.y,'#FF7A8A',true)}
// every update: bags off each plane onto a cart, tugs to the hall, and the hall onto the flight's carousel
function updateReclaimBelt(dt){
  const B=bagRT(),C=bagCaps();
  for(const b of R.arrBelt){const A=b.A;if(!A.n)continue;const a=abOf(A);if(!a.ap)a.ap0=G.clock;a.ap++} // freight goes to the cargo shed
  if(R.arrBelt.length)R.arrBelt.length=0;
  for(const i of SIDX){const F=R.st[i].F;if(!F||!F.arr.started||!F.arr.n)continue;const A=F.arr,a=abOf(A);
    if(A.car==null&&A.bags>0)A.car=pickCar(C.car,A);
    if(!a.xs&&A.xb){a.xs=true;B.tugs.push({A,i,xb:A.xb,n:A.xb.length,t:-1,T:tugTime(i)})} // transfer bags come off first
    if(a.ap>0&&(a.ap>=BAG_TUGIN||A.unloaded>=A.bags||G.clock-a.ap0>=1.5)){B.tugs.push({A,i,n:a.ap,t:0,T:tugTime(i)});a.ap=0}}
  for(const T of B.tugs)if(!T.out){T.t+=dt;if(T.t>=T.T){T.done=true;
    if(T.xb){for(const F2 of T.xb){bgOf(F2);if(bagLive(F2)){qPush(B.scr,F2,1);B.xin=(B.xin||0)+1}}}else abOf(T.A).hall+=T.n}}
  if(B.tugs.some(T=>T.done))B.tugs=B.tugs.filter(T=>!T.done);
  // carousels: each takes up to CAR_CAP bags; the hall feeds each flight's in turn
  const load=B.car.map(L=>L.reduce((s,A)=>s+A.reclaim,0)),rate=CAR_FEED*bagMul();
  for(let k=0;k<B.car.length;k++)for(const A of B.car[k]){const a=A.bg;if(!a||!a.hall){if(a)a.acc=0;continue}
    a.acc+=rate*dt;const n=Math.min(a.hall,Math.floor(a.acc),CAR_CAP-load[k]);if(n<=0){if(load[k]>=CAR_CAP&&A.reclaim<5)a.stall+=dt;a.acc=Math.min(a.acc,1);continue} // held up by another flight's bags
    a.stall=0;a.acc-=n;a.hall-=n;a.fed+=n;A.reclaim+=n;load[k]+=n;if(a.first==null)a.first=G.clock;if(a.fed>=A.bags&&a.last==null)a.last=G.clock}
}
dayStat('bagMiss','bags left behind');
// a carousel for an arriving flight: the one with fewest flights on it
function pickCar(n,A){const B=bagRT();while(B.car.length<n)B.car.push([]);let k=0;for(let j=1;j<n;j++)if(B.car[j].length<B.car[k].length)k=j;B.car[k].push(A);return k}
function carOf(i){const S=R.st&&R.st[i],A=S&&S.F&&S.F.arr;return A&&A.car!=null?A.car:i%bagCaps().car}
// every minute: flights take their carousels and make-up positions (earliest departure first), and give them back
TERM_MINUTE.push(()=>{
  const B=bagRT(),C=bagCaps();while(B.car.length<C.car)B.car.push([]);
  for(let k=0;k<B.car.length;k++)B.car[k]=B.car[k].filter(A=>{const a=A.bg,cur=R.st[A.stand]&&R.st[A.stand].F&&R.st[A.stand].F.arr===A;return cur&&!(a&&a.fed>=A.bags&&A.reclaim<=0)});
  B.pos=B.pos.filter(F=>R.st[F.i].F===F&&!F.bg.cut||(F.bg.pos=false));
  if(B.pos.length<C.pos){const w=SIDX.map(i=>R.st[i].F).filter(F=>F&&F.bg&&!F.bg.pos&&!F.bg.cut&&F.bg.loop+F.bg.ebs>0).sort((a,b)=>a.std-b.std);
    for(const F of w){if(B.pos.length>=C.pos)break;givePos(F)}}
  B.late=qCount(B.scr)+qCount(B.sort)>C.sort*6?B.late+1:0; // backed up: more than six minutes of sorting waiting
  if(!R.sim&&G.tab==='terminal'&&R.tSub==='bag'){const el=document.querySelector('[data-live="bags"]');if(el)el.innerHTML=bagLive2()}
});
// what the arrivals board says while bags come through
function bagStatus(A){if(A.car==null||!A.bags)return null;const a=A.bg||{},fed=a.fed||0;if(fed>=A.bags&&A.reclaim<=0)return null;
  return (a.stall||0)>2?'BAGS LATE':fed>0?'ON BELT '+(A.car+1):null}
// the Baggage sub-tab: the system at a glance, each carousel's screen, and bags left behind today
function bagLive2(){
  const B=bagRT(),C=bagCaps(),mk=B.pos.reduce((s,F)=>s+F.bg.mk,0),tugs=B.tugs.length,sq=qCount(B.scr),so=qCount(B.sort);
  let h=`<div class="report">Screening <b>${sq}</b> waiting · search room <b>${B.srch.length}</b> · sorter <b>${so}</b> waiting${B.late>=3?' · <span class="late">backed up</span>':''}<br>`;
  h+=`Make-up <b>${B.pos.length}/${C.pos}</b> flights, <b>${mk}</b> bags in carts · <b>${tugs}</b> tug train${tugs===1?'':'s'} out`;
  if(B.ebs||B.loop||C.ebs)h+=`<br>Early bags: <b>${B.ebs}</b>${C.ebs?`/${C.ebs}`:''} in the store, <b>${B.loop}</b> circling the sorter`;
  h+='</div>';
  const rows=[];for(let k=0;k<C.car;k++){const L=B.car[k]||[];for(const A of L){const a=A.bg||{};rows.push(`<b>Belt ${k+1}</b> ${A.code}${A.no} from ${A.from[1]}: first bag ${a.first!=null?hhmm(a.first):'–'}, last ${a.last!=null?hhmm(a.last):'–'}`)}}
  if(rows.length)h+=`<div class="report">${rows.join('<br>')}</div>`;
  const t=dayVal(G.dstat,'bagMiss'),y=dayVal(G.lastDay,'bagMiss');
  h+=`<div class="report">Bags left behind today <b class="${t?'late':''}">${t}</b>${G.lastDay?`, yesterday <b>${y}</b>`:''}</div>`;
  return h;
}
TERM_PANEL.bag=[()=>`<div class="sec">Baggage system</div><div data-live="bags">${bagLive2()}</div>`];
// drawing: the hall's screening machines, search room, sorter, make-up carts and early bag store, carousels and tugs
const CAR_POS=k=>({x:760+(k%4)*120,y:k<4?630:672});
TERM_DRAW.push(D=>{
  const B=bagRT(),C=bagCaps(),[x0,y0,x1,y1]=BAG_HALL,now=performance.now()/1000;
  // screening machines along the belt in, the search room below them
  for(let k=0;k<6;k++){const on=k<1+G.lv.screen;ctx.fillStyle=on?'#39414A':'#1F242A';ctx.fillRect(x0+8+k*21,692,16,12);if(on){ctx.fillStyle='#5CC8FF';ctx.fillRect(x0+13+k*21,696,6,4)}}
  ctx.fillStyle='#D9A066';for(let k=0,n=Math.min(12,qCount(B.scr));k<n;k++)ctx.fillRect(x0+4+k*10,685,4,4);
  ctx.strokeStyle='#39414A';ctx.lineWidth=1;ctx.strokeRect(x0+8,730,48,32);mono('SEARCH',x0+32,758,'#56606A',6,'center');
  ctx.fillStyle='#FF7A8A';for(let k=0;k<Math.min(4,B.srch.length);k++)ctx.fillRect(x0+14+k*10,740,5,5);
  mono('SCREENING',x0+70,716,'#56606A',6,'center');
  // the sorter: bags going round, more when it's busy or bags circle
  const so=Math.min(24,qCount(B.sort)+Math.ceil(B.loop/4)+(B.pos.length?2:0));ctx.fillStyle=B.late>=3?'#FF7A8A':'#D9A066';
  for(let k=0;k<so;k++){const t=(k/24+now*0.12)%1*Math.PI*2;ctx.fillRect(630+Math.cos(t)*44-2,640+Math.sin(t)*26-2,4,4)}
  mono('SORTER',630,643,'#56606A',6.5,'center');
  // make-up: a cart per position, filling with its flight's bags
  for(let k=0;k<Math.min(16,C.pos);k++){const F=B.pos[k],cx=x0+10+(k%4)*32,cy=550+Math.floor(k/4)*12;ctx.fillStyle='#2A3037';ctx.fillRect(cx,cy,26,9);
    if(F){ctx.fillStyle='#D9A066';ctx.fillRect(cx+1,cy+1,24*Math.min(1,F.bg.mk/BAG_TUG),7)}}
  mono('MAKE-UP',x0+70,606,'#56606A',6,'center');
  if(C.ebs){ctx.strokeStyle='#39414A';ctx.strokeRect(x1-60,730,52,32);ctx.fillStyle='#D9A066';ctx.fillRect(x1-58,760-28*Math.min(1,B.ebs/C.ebs),48,28*Math.min(1,B.ebs/C.ebs));mono('EARLY',x1-34,727,'#56606A',6,'center')}
  // carousels, each with its screen: the flights on it and their first and last bags
  for(let k=0;k<C.car;k++){const {x:cx,y:cy}=CAR_POS(k),L=B.car[k]||[];
    ctx.strokeStyle='#39414A';ctx.lineWidth=6;rrect(cx-40,cy-10,80,20,10);ctx.stroke();
    const bags=Math.min(20,L.reduce((s,A)=>s+A.reclaim,0));
    ctx.fillStyle='#D9A066';for(let j=0;j<bags;j++){const t=((j/20+now/9)%1)*2*Math.PI;ctx.fillRect(cx+Math.cos(t)*40-2,cy+Math.sin(t)*10-2,4,4)}
    mono(String(k+1),cx,cy+3,'#909AA4',9,'center');
    if(L.length){const A=L[0],a=A.bg||{};mono(`${A.code}${A.no} ${a.first!=null?hhmm(a.first):'--:--'}–${a.last!=null?hhmm(a.last):'--:--'}`,cx,cy+18,a.stall>2?'#FF7A8A':'#FFC72C',6,'center')}}
});
// tug trains out on the apron, on every floor: out through the tunnel under the concourse to the stand, and back
LAYER.terminal.push(()=>{const B=bagRT();
  for(const T of B.tugs){if(T.t<0)continue;const b=bagPt(T.i),k=clamp(T.t/T.T,0,1),dir=T.out?k:1-k,tun=(HALL_OUT.y-TUNNEL.y),all=tun+Math.hypot(b.x-TUNNEL.x,b.y-TUNNEL.y),s=dir*all;
    if(s<tun)continue; // in the tunnel
    const f=(s-tun)/Math.max(1,all-tun),x=TUNNEL.x+(b.x-TUNNEL.x)*f,y=TUNNEL.y+(b.y-TUNNEL.y)*f,a=Math.atan2(b.y-TUNNEL.y,b.x-TUNNEL.x)+(T.out?0:Math.PI);
    ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle='#FFC72C';ctx.fillRect(-3,-3,6,6);ctx.fillStyle=T.xb?'#6BE39A':'#D9A066';
    for(let j=0;j<Math.min(4,Math.ceil(T.n/10));j++)ctx.fillRect(-11-j*8,-3,7,6);ctx.restore()}
});
SIMX.bagRT=bagRT;SIMX.bagCaps=bagCaps;SIMX.leaveBags=leaveBags;SIMX.bagStatus=bagStatus;SIMX.carOf=carOf;SIMX.givePos=givePos;
