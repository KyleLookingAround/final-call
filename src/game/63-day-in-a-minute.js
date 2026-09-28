/* ================= DAY IN A MINUTE: a time-lapse of yesterday, played back over the airport view ================= */
// Recording: every 5 game minutes dayRec reads what's on the airport into a small packed sample in R.dim (runtime only,
// never saved): each stand's plane, the runway, the queues, where the passengers are (a coarse grid, for the heat) and
// the day so far. Today and yesterday are kept; when the day changes today becomes yesterday. It only reads: nothing in
// G, no rnd(), and nothing at all with R.sim. Playback (R.dimT) pauses the game and draws the recording over the scene's
// layers (50-scene.js), with the hour and darkness from the recording through sceneView's override (dimFrame).
const DIM_EVERY=5,DIM_CAP=300,DIM_SECS=60,DIM_CELL=60; // minutes between samples, samples a day, seconds for a whole day, heat cell
const DIM_CABIN=new Set(['aisle','sitting','dAisle']);
function dimSample(M){
  const st=new Int16Array(NG*2).fill(-1); // per stand: aircraft (AIRCRAFT index) and colour*4+phase (1 arriving, 2 docked, 3 leaving)
  for(const i of SIDX){
    if(!G.stands[i].built)continue;const S=R.st[i];let F=null,ph=0;
    if(S.out){F=S.out.F;ph=3}else if(S.F){F=S.F;const s=F.plane.state;ph=s==='inbound'?1:s==='wait'||s==='approach'?0:2}
    if(!ph||!F)continue;
    const col=F.liv||livery();let c=M.cols.indexOf(col);if(c<0){c=M.cols.length;M.cols.push(col)}
    st[i*2]=AIRCRAFT.indexOf(F.ac);st[i*2+1]=c*4+ph;
  }
  const rw=new Int16Array(6),a=R.rwy.act;let na=0,nd=0;for(const m of R.rwy.q)m.type==='dep'?nd++:na++;
  rw[0]=na;rw[1]=nd;for(let r=0;r<2;r++)if(a[r]){rw[2+r*2]=a[r].type==='arr'?1:2;rw[3+r*2]=Math.round(clamp(a[r].t/a[r].dur,0,1)*1000)}
  const cells=new Map(),cw=Math.ceil(W/DIM_CELL);
  for(const p of R.pax){if(DIM_CABIN.has(p.state)||!(p.y>=Y0&&p.y<Y1&&p.x>=0&&p.x<W))continue;const k=Math.floor((p.y-Y0)/DIM_CELL)*cw+Math.floor(p.x/DIM_CELL);cells.set(k,(cells.get(k)||0)+1)}
  const heat=new Uint16Array(cells.size*2);let j=0;for(const [k,n] of cells){heat[j++]=k;heat[j++]=Math.min(n,65535)}
  const s=G.dstat||{},day=new Float64Array([dayVal(s,'flights'),dayVal(s,'pax'),dayVal(s,'ontime'),dayVal(s,'rev')-dayVal(s,'cost')]);
  return {c:G.clock,cw,y0:Y0,st,rw,q:new Int16Array([R.ciQ.length,R.secQ.length+R.ftQ.length,R.arrQ.length]),heat,day};
}
function dayRec(){
  if(R.sim)return;
  const d=dayOf(G.clock);let M=R.dim;const last=M&&M.cur[M.cur.length-1];
  if(!M||last&&(G.clock<last.c||G.clock-last.c>60))M=R.dim={day:d,cur:[],cols:[],prev:null}; // a new game, another save or a headless stretch: start again
  if(M.day!==d){
    const L=G.lastDay;
    M.prev=M.cur.length?{day:M.day,s:M.cur,cols:M.cols,fin:L&&L.day===M.day?[L.flights,L.pax,L.ontime,L.profit]:null}:null;
    M.day=d;M.cur=[];M.cols=[];
  }
  if(M.cur.length<DIM_CAP)M.cur.push(dimSample(M));
}
clock(MINUTE,'dayRec',DIM_EVERY,0,dayRec);
// the recording's size in bytes: the typed arrays and a little for each sample's object
function dimBytes(){const M=R.dim;if(!M)return 0;let b=0;for(const L of [M.cur,M.prev&&M.prev.s])if(L)for(const s of L)b+=96+s.st.byteLength+s.rw.byteLength+s.q.byteLength+s.heat.byteLength+s.day.byteLength;return b}
// yesterday, if enough of it was recorded to be worth watching (an hour)
function dimReady(){const P=R.dim&&R.dim.prev;return P&&P.s.length>=12?P:null}
function dimBtn(){const P=dimReady();return P?`<button class="buy dimgo" data-dim="1">&#9654;&#xFE0E; Yesterday in a minute</button>`:''}

/* ---- playback ---- */
// darkness at hour h, the way darkness() (12-drawing.js) works it out from the clock
function dimDark(h){if(h<5||h>=21)return 0.5;if(h<7)return 0.5*(7-h)/2;if(h>=19)return 0.5*(h-19)/2;return 0}
function dimPlay(){
  const P=dimReady();if(!P||R.dimT||R.photo)return false; // not while photo mode has the view
  const c0=P.s[0].c,c1=P.s[P.s.length-1].c+DIM_EVERY;
  R.dimT={P,c0,c1,dur:DIM_SECS*(c1-c0)/1440,t0:performance.now(),j:0,f:0,clk:c0,speed:R.speed,view:R.view,cam:null,txt:''};
  if(R.sim)return true;
  if(R.view!=='airport')setView('airport');
  if(document.body.classList.contains('fs'))drawer(false); // full screen: the panel slides away so the map shows
  const c=R.cam;R.dimT.cam={c,x:c.x,y:c.y,z:c.z};focus('all');
  setSpeed(0);const el=$('#dim');if(el){el.hidden=false;$('#stage').classList.add('dimming');$('#dimDay').textContent=`Day ${P.day}`}
  return true;
}
function dimStop(){
  const T=R.dimT;if(!T)return;R.dimT=null;if(R.sim)return;
  const el=$('#dim');if(el){el.hidden=true;$('#stage').classList.remove('dimming')}
  if(R.view!=='airport')setView('airport'); // the airport's own camera, even if a tab moved the view meanwhile
  if(T.cam){const c=T.cam.c;c.x=T.cam.x;c.y=T.cam.y;c.z=T.cam.z;c.tx=null;clampCam()}
  if(T.view!=='airport')setView(T.view);
  setSpeed(T.speed);
}
// where the playback is (sceneView calls this while R.dimT is set): the replayed clock sets the hour and darkness
function dimFrame(V,now){
  const T=R.dimT,s=T.P.s,p=((now??performance.now())-T.t0)/1000/Math.max(1,T.dur);
  if(p>=1){dimStop();return}
  const clk=T.c0+p*(T.c1-T.c0);let j=T.j;if(s[j].c>clk)j=0;while(j<s.length-1&&s[j+1].c<=clk)j++;
  T.j=j;T.clk=clk;T.f=clamp((clk-s[j].c)/DIM_EVERY,0,1);
  V.hour=(clk/60)%24;V.d=dimDark(V.hour);
  if(!R.sim)dimBar(T,p);
}
// the bar along the top: the clock and the day's numbers so far, rising to the day report's at the end
function dimBar(T,p){
  const s=T.P.s,a=s[T.j].day,b=s[T.j+1]?s[T.j+1].day:T.P.fin||a,v=k=>a[k]+(b[k]-a[k])*T.f;
  const fl=Math.round(v(0)),pax=Math.round(v(1)),ot=Math.round(v(2)),m=v(3),txt=`${hhmm(T.clk)}|${fl}|${pax}|${ot}|${Math.round(m)}`;
  if(txt===T.txt)return;T.txt=txt;
  $('#dimClock').textContent=hhmm(T.clk);$('#dimFl').textContent=num(fl);$('#dimPax').textContent=num(pax);
  $('#dimOt').textContent=fl?Math.round(ot/fl*100)+'%':'–';const me=$('#dimMoney');me.textContent=money(m);me.classList.toggle('neg',m<0);
  $('#dimProg').style.width=(clamp(p,0,1)*100).toFixed(1)+'%';
}
const DIM_GEO=[];
const dimGeo=a=>DIM_GEO[a]||(DIM_GEO[a]=geom(AIRCRAFT[a]));
const dimWash=(x,y,w,h,a)=>{ctx.fillStyle=`rgba(16,19,23,${a})`;ctx.fillRect(x,y,w,h)};
// the runway: a wash over what's live, then the recorded queues and the movement under way
LAYER.airfield.push(V=>{
  const T=R.dimT;if(!T)return;const rw=T.P.s[T.j].rw,HX=W-60;
  dimWash(0,AF_Y-180,W,180,0.8);
  for(let r=0;r<2;r++){const ty=rw[2+r*2];if(!ty)continue;const y=AF_Y+RWY_Y[r],k=clamp(rw[3+r*2]/1000+T.f*0.5,0,1);let x,alt;
    if(ty===1){x=W+120-(1-Math.pow(1-k,2))*(W+120-90);alt=Math.max(0,1-k/0.3)*24}else{x=HX-10-k*k*(HX+150);alt=Math.max(0,(k-0.6)/0.4)*28}
    miniPlane(x,y-alt,Math.PI,1.05+alt/60,1,'#ECE8DF')}
  for(let j=0;j<Math.min(2,rw[1]);j++)miniPlane(HX,AF_Y-40+j*28,-Math.PI/2,0.95,1,'#ECE8DF');
  for(let j=0;j<Math.min(4,rw[0]);j++){const a=V.t*0.5+j*Math.PI/2;miniPlane(W-120+Math.cos(a)*60,AF_Y-168+Math.sin(a)*6,a+Math.PI/2,0.8,1,'#ECE8DF')}
});
// the stands: each built stand washed over, then the recorded plane in its airline's colour, easing on and off
LAYER.bridges.push(V=>{
  const T=R.dimT;if(!T)return;const st=T.P.s[T.j].st,cols=T.P.cols,[ax,ay,aw,ah]=standArea(),f=T.f;
  for(const i of SIDX){
    if(!G.stands[i].built)continue;toW(i,0,ay+ah/2);if(!inView(WP.x,WP.y,ah))continue;
    ctx.save();standCtx(i);ctx.fillStyle='rgba(20,23,27,.9)';ctx.fillRect(ax-10,ay-12,aw+20,ah+22);
    ctx.strokeStyle='rgba(255,199,44,.3)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,ay+10);ctx.lineTo(0,ay+ah-10);ctx.stroke();
    const a=st[i*2],c=st[i*2+1];
    if(a>=0&&AIRCRAFT[a]){const ph=c&3,g=dimGeo(a),len=g.end-g.top+60,sc=len/30,off=ph===1?(1-f)*90:ph===3?f*120:0,al=ph===1?0.5+0.5*f:ph===3?1-0.7*f:1;
      miniPlane(0,(g.top+g.end)/2+off,-Math.PI/2,sc,al,cols[c>>2]||livery())}
    ctx.restore();
  }
});
// the halls: a wash over the live passengers, the queues' tint, then the crowd's heat, warm where it's busy
const DIM_HEAT=[];
function dimGlow(k){
  if(DIM_HEAT[k])return DIM_HEAT[k];const cv2=document.createElement('canvas');cv2.width=cv2.height=64;const x=cv2.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
  const rgb=['255,214,120','255,150,70','255,90,90'][k];g.addColorStop(0,`rgba(${rgb},1)`);g.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=g;x.fillRect(0,0,64,64);return DIM_HEAT[k]=cv2;
}
LAYER.pax.push(V=>{
  const T=R.dimT;if(!T)return;const s=T.P.s[T.j],q=s.q,h=s.heat,cw=s.cw,y0=s.y0;
  dimWash(0,TERM_Y,W,H-TERM_Y,0.7);
  const tint=n=>n>30?'rgba(255,122,138,.16)':n>15?'rgba(255,199,44,.11)':null;let tc;
  if(tc=tint(q[0])){ctx.fillStyle=tc;ctx.fillRect(8,680,552,LAND_B-680)}
  if(tc=tint(q[1])){ctx.fillStyle=tc;ctx.fillRect(8,SEC_LINE,552,80)}
  if(tc=tint(q[2])){ctx.fillStyle=tc;ctx.fillRect(700,SEC_Y,540,SEC_LINE-SEC_Y)}
  const r=DIM_CELL*1.3;
  for(let j=0;j<h.length;j+=2){const k=h[j],n=h[j+1],x=(k%cw+0.5)*DIM_CELL,y=y0+(Math.floor(k/cw)+0.5)*DIM_CELL;if(!inView(x,y,r))continue;
    ctx.globalAlpha=clamp(0.12+n*0.05,0,0.75);ctx.drawImage(dimGlow(n>=12?2:n>=5?1:0),x-r,y-r,r*2,r*2)}
  ctx.globalAlpha=1;
});
// the stands' live information cards, washed over
LAYER.signs.push(V=>{const T=R.dimT;if(!T)return;ctx.fillStyle='rgba(16,19,23,.85)';for(const i of SIDX){if(!G.stands[i].built)continue;const b=badgeAt(i);if(inView(b.x,b.y,60))ctx.fillRect(b.x-52,b.y-34,104,68)}});
if(typeof document!=='undefined'&&$('#dim')){
  $('#panel').addEventListener('click',e=>{if(e.target.closest('[data-dim]'))dimPlay()});
  $('#dim').addEventListener('pointerdown',e=>{e.preventDefault();dimStop()});
  // a tap anywhere else (a tab, the panel) stops it too, before the tap does its own thing
  document.addEventListener('pointerdown',e=>{if(R.dimT&&!e.target.closest('#dim'))dimStop()},{capture:true});
  // the game's own keys: Escape and Space stop it, the rest wait (typing in the panel and the browser's keys are left alone)
  document.addEventListener('keydown',e=>{if(!R.dimT||e.ctrlKey||e.metaKey||e.altKey||e.target.closest&&e.target.closest('input,textarea'))return;
    if(e.key==='Escape'||e.key===' '){e.preventDefault();e.stopImmediatePropagation();dimStop()}else if(e.key.length===1){e.preventDefault();e.stopImmediatePropagation()}},{capture:true});
}
Object.assign(SIMX,{dayRec,dimSample,dimBytes,dimReady,dimPlay,dimStop,dimFrame,dimBtn,DIM_CAP,DIM_EVERY});
