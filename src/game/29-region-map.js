/* ---------- region map drawing ---------- */
const SEA=[[0,690],[80,725],[180,800],[300,830],[420,852],[560,852],[700,822],[820,802],[905,792],[1000,802],[1150,782],[1300,764],[1450,772],[1600,744],[1600,1000],[0,1000]];
const RIVER=[[470,0],[450,120],[500,240],[470,360],[420,470],[395,560],[372,680],[360,860]];
const MOTORWAYS=[[[0,640],[250,620],[480,605],[600,648],[760,668],[900,660],[1050,662],[1250,620],[1450,520],[1600,470]],[[900,660],[790,520],[600,400],[400,290],[190,170],[0,110]],[[1050,662],[1250,420],[1450,160],[1600,60]]];
let RBLK=null;
function seeded(n){let s=n;return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646}}
function regionBlocks(){
  if(RBLK)return RBLK;RBLK={};const rnd=seeded(7);
  for(const pid in PLACES){const pl=PLACES[pid];if(pl.kind==='air'||pl.kind==='far')continue;
    const max=Math.round(pl.pop*2.2/(pl.kind==='city'?2:1)),arr=[];
    for(let i=0;i<max;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*(18+Math.sqrt(pl.pop*2.2)*(pl.kind==='city'?5.4:4.6));
      let x=pl.x+Math.cos(a)*r,y=pl.y+Math.sin(a)*r*0.8;if(inSea(x,y))continue;
      arr.push({x,y,w:pl.kind==='city'&&r<50?7+rnd()*6:3+rnd()*4,h:pl.kind==='city'&&r<50?6+rnd()*6:3+rnd()*3,r,s:rnd(),lit:rnd()})}
    arr.sort((a,b)=>a.r-b.r);RBLK[pid]=arr}
  return RBLK;
}
function seaY(x){for(let i=1;i<14;i++){const a=SEA[i-1],b=SEA[i];if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/((b[0]-a[0])||1)}return 760}
function inSea(x,y){return y>seaY(x)-4}
function lbl(t,x,y,col,px,align,bold){const k=viewK();ctx.font=`${bold?600:500} ${px/k}px "IBM Plex Mono",monospace`;ctx.fillStyle=col;ctx.textAlign=align||'center';ctx.textBaseline='middle';ctx.fillText(t,x,y)}
function lblBg(t,x,y,col,px,bg){const k=viewK();ctx.font=`600 ${px/k}px "Saira Condensed","Arial Narrow",sans-serif`;const w=ctx.measureText(t).width+8/k,h=(px+6)/k;ctx.fillStyle=bg||'rgba(10,12,15,.8)';ctx.fillRect(x-w/2,y-h/2,w,h);ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,x,y+0.5/k)}
function strokePath(pts,col,w,dash){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([])}
function drawRegion(){
  clampCam();
  const k=viewK(),s=k*R.dpr,cam=R.cam,t=performance.now()/1000,dk=darkness(),minW=1/k;
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0B1117';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(s,0,0,s,-cam.x*s,-cam.y*s);
  ctx.fillStyle='#15191C';ctx.fillRect(0,0,RW,RH);
  {const sn=seasonOf(dayOf(G.clock)).name;ctx.fillStyle=sn==='Winter'?'rgba(215,228,245,.06)':sn==='Autumn'?'rgba(190,120,50,.05)':sn==='Summer'?'rgba(120,170,70,.04)':'rgba(100,170,110,.03)';ctx.fillRect(0,0,RW,RH)}
  // fields and hills
  ctx.strokeStyle='#191E22';ctx.lineWidth=Math.max(1,minW);for(let x=0;x<RW;x+=64){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,RH);ctx.stroke()}for(let y=0;y<RH;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(RW,y);ctx.stroke()}
  ctx.strokeStyle='#20262B';for(let r=0;r<5;r++){ctx.beginPath();ctx.ellipse(1150,300,70+r*38,40+r*24,-0.3,0,Math.PI*2);ctx.stroke()}
  // sea and river
  ctx.fillStyle='#0E1A24';ctx.beginPath();SEA.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();
  strokePath(SEA.slice(0,14),'#1D3444',Math.max(1.5,minW*1.5));
  ctx.lineCap='round';strokePath(RIVER,'#0E1A24',16);strokePath(RIVER,'#16293A',2);ctx.lineCap='butt';
  // motorways and the disused railway
  for(const m of MOTORWAYS){strokePath(m,'#262C33',Math.max(5,3*minW));strokePath(m,'#323A43',Math.max(1,minW),[6,8])}
  drawRoads(k);drawTraffic(k);
  // towns: streets first, then buildings
  for(const pid in PLACES){const pl=PLACES[pid];if(pl.kind==='air'||pl.kind==='far')continue;const rr=(pl.kind==='city'?110:pl.kind==='town'?45:26)*Math.sqrt(clamp(placePop(pid)/pl.pop,1,2.2));
    ctx.strokeStyle='#22282E';ctx.lineWidth=Math.max(1.2,minW);for(let a=0;a<(pl.kind==='city'?10:5);a++){const an=a*Math.PI*2/(pl.kind==='city'?10:5)+pl.x*0.01;ctx.beginPath();ctx.moveTo(pl.x,pl.y);ctx.lineTo(pl.x+Math.cos(an)*rr,pl.y+Math.sin(an)*rr*0.8);ctx.stroke()}
    if(pl.kind==='city'){for(const r2 of [40,80]){ctx.beginPath();ctx.ellipse(pl.x,pl.y,r2,r2*0.8,0,0,Math.PI*2);ctx.stroke()}}}
  const B=regionBlocks(),lit=[]; // lit windows, kept to draw over the night tint so they shine rather than dim with it
  for(const pid in B){const pl=PLACES[pid],n=Math.round(B[pid].length*clamp(placePop(pid)/(pl.pop*2.2),0,1)*(pl.kind==='city'?2:1));
    for(let i=0;i<Math.min(n,B[pid].length);i++){const b=B[pid][i];ctx.fillStyle=b.r<40&&pl.kind==='city'?'#48515A':b.s<0.3?'#3A424B':'#323940';ctx.fillRect(b.x,b.y,b.w,b.h);
      if(dk>0.1&&b.lit<0.55)lit.push(b.x+b.w*0.3,b.y+b.h*0.3,Math.max(1,b.w*0.25),Math.max(1,b.h*0.25))}}
  {const SB=stationBlocks();for(const n in SB){const c=Math.round(SB[n].length*clamp((G.tod&&G.tod[n])||0,0,1));for(let i=0;i<c;i++){const b=SB[n][i];ctx.fillStyle=b.s<0.4?'#525C66':'#444D56';ctx.fillRect(b.x,b.y,b.w,b.h);if(dk>0.1&&b.lit<0.7)lit.push(b.x+b.w*0.25,b.y+b.h*0.25,Math.max(1,b.w*0.3),Math.max(1,b.h*0.3))}}}
  // development sites
  for(const P of PLOTS)if(plotOpen(P))drawPlot(P,t,k);
  // night falls on the land, under the network and labels so they stay readable; windows shine over it
  if(dk>0){ctx.fillStyle=`rgba(4,8,22,${dk*1.2})`;ctx.fillRect(0,0,RW,RH);
    ctx.fillStyle=`rgba(255,214,140,${Math.min(1,dk*1.8)})`;for(let i=0;i<lit.length;i+=4)ctx.fillRect(lit[i],lit[i+1],lit[i+2],lit[i+3])}
  // the network: airport, track, lines
  drawRegionAirport(t,k);drawInfra(k);drawBuilds(t,k);drawNetLines(t,k);
  // stops, places and labels
  for(const pid in PLACES){const pl=PLACES[pid];if(pid==='air')continue;
    const big=pl.kind==='city'||pl.kind==='town'||pl.kind==='far';if(!big&&k<0.34)continue;
    const pop=placePop(pid),far=pl.kind==='far',lx=far?pl.x+34:pl.x,ly=pl.y-(pl.kind==='city'?134:pl.kind==='town'?46:28),al=far?'right':'center';lbl(pl.name.toUpperCase(),lx,ly,far?'#909AA4':'#ECE8DF',big?12:10.5,al,true);
    lbl(far?'1.2M people · 140 km ↗':`${num(pop*1000)} people`,lx,ly+14/k,'#6E7883',9.5,al);
  }
  // events on the map
  for(const e of (G.evq||[])){const P=PLOTS.find(p=>p.id===e.plot),dtm=e.at-G.clock;
    if(dtm<240&&dtm>-210){const pulse=(Math.sin(t*3)+1)/2;ctx.strokeStyle=`rgba(255,199,44,${0.4+0.4*pulse})`;ctx.lineWidth=Math.max(2,2*minW);ctx.beginPath();ctx.arc(P.x,P.y,26+pulse*6,0,Math.PI*2);ctx.stroke();
      lblBg(`${EVT[e.type].label.toUpperCase()} · ${hhmm(e.at)} · ${num(e.att)}`,P.x,P.y+40,'#FFC72C',10);
      const n=Math.min(40,Math.round(e.att/1000));for(let i=0;i<n;i++){const a=i*2.4+t*0.3,r=16+(i%5)*3;ctx.fillStyle=i%3?'#ECE8DF':'#FFC72C';ctx.fillRect(P.x+Math.cos(a)*r,P.y+Math.sin(a)*r,1.8,1.8)}}}
  drawNetVehicles(k);drawStations(t,k);drawDraft(t,k);
  drawRegionLive(t,k);drawSky(k);drawLowmere(t,k);drawWeatherCells(k);
  if(pol('ads'))lblBg('FIZZCO',910,562,'#FF7A8A',11);
  // compass and scale
  lbl('N ↑',RW-24,RH-20,'#56606A',10);
}
function rPath(pts){const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));return {pts,cum,len:cum[cum.length-1]}}
let ROADP=null;
function destAngle(code){let h=7;for(const c of (code||'XX'))h=(h*31+c.charCodeAt(0))%997;return h/997*Math.PI*2}
function rayBox(x,y,dx,dy){let t=1e9;if(dx>0)t=Math.min(t,(RW-x)/dx);if(dx<0)t=Math.min(t,-x/dx);if(dy>0)t=Math.min(t,(RH-y)/dy);if(dy<0)t=Math.min(t,-y/dy);return t}
function drawSky(k){
  const ax=910,ay=597,sc=Math.max(0.45,0.5/k);
  for(const f of G.fleet){if(f.sold||f.st!=='away'||f.dep==null)continue;
    const tot=Math.max(1,f.back-f.dep),p=(G.clock-f.dep)/tot;if(p<0||p>1)continue;
    const DC=CITY[f.dest],a=DC?(DC.brg-90)*Math.PI/180:destAngle(f.dest),dx=Math.cos(a),dy=Math.sin(a),D=rayBox(ax,ay,dx,dy)+60,leg=Math.min(0.45,30/tot);
    let d,head;if(p<leg){d=p/leg*D;head=a}else if(p>1-leg){d=(1-p)/leg*D;head=a+Math.PI}else continue;
    const x=ax+dx*d,y=ay+dy*d,alt=Math.min(1,d/200);
    ctx.strokeStyle=`rgba(236,232,223,${0.18*alt})`;ctx.lineWidth=Math.max(1,1.2/k);ctx.beginPath();ctx.moveTo(x-Math.cos(head)*60*alt,y-Math.sin(head)*60*alt);ctx.lineTo(x,y);ctx.stroke();
    ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.arc(x+10*alt,y+14*alt,3*sc,0,Math.PI*2);ctx.fill();
    miniPlane(x,y,head,sc*(0.7+0.4*alt));
  }
}
function drawRoads(k){for(const e of EDGES){if(e.water||!e.road||e.road===2)continue;strokePath(e.pts,'#20262C',Math.max(3,2.4/k));strokePath(e.pts,'#2A3138',Math.max(1,0.8/k))}}
function drawTraffic(k){
  if(!ROADP)ROADP=MOTORWAYS.map(rPath);
  const r=R.reg||{cong:0.3,road:40},load=clamp(r.road||40,8,160),spd=38*(1-0.8*r.cong),jam=r.cong>0.6;
  const lorries=devOn('logistics')&&!Object.values(G.lines||{}).some(L=>L.freight),coaches=(r.tour||0)>6,sc=Math.max(1,0.7/k);
  const car=(x,y,ang,col,big,brake)=>{ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(sc,sc);ctx.fillStyle=col;ctx.fillRect(big?-4:-2.2,-1.1,big?8:4.4,2.2);if(brake){ctx.fillStyle='#FF5A5A';ctx.fillRect(big?-4.2:-2.4,-1.1,0.8,2.2)}ctx.restore()};
  const COLS=['#8C97A1','#CDD4DA','#6E7883','#A7A296','#4F6478'];
  // through traffic on the motorways
  ROADP.forEach((P,ri)=>{const n=Math.round(load*(ri===0?0.3:0.18)*P.len/1000);
    for(let i=0;i<n;i++){const dir=i%2?1:-1,jit=0.85+((i*37)%10)/40;let s=(i*P.len/n*1.618+dir*G.clock*spd*jit)%P.len;if(s<0)s+=P.len;
      const [x0,y0,ang]=ptOn(P,s),off=dir*1.7;const big=lorries&&i%6===0?'lorry':coaches&&i%9===0?'coach':null;
      car(x0-Math.sin(ang)*off,y0+Math.cos(ang)*off,ang,big==='lorry'?'#FF9F43':big==='coach'?'#5CC8FF':COLS[i%5],big,jam&&dir>0)}});
  // local drivers: the people your lines don't carry
  if(r.roadF)for(const e of EDGES){if(e.water||!e.road)continue;const f=r.roadF[e.id]||0,ce=(r.ce&&r.ce[e.id])||0,n=Math.min(70,Math.round(f*e.len/5000));if(!n)continue;const v=40*(1-0.85*ce),P=e.P;
    for(let i=0;i<n;i++){const dir=i%2?1:-1,jit=0.85+((i*37)%10)/40;let s=(i*P.len/n*1.618+dir*G.clock*v*jit)%P.len;if(s<0)s+=P.len;const [x0,y0,ang]=ptOn(P,s),off=dir*1.6;
      car(x0-Math.sin(ang)*off,y0+Math.cos(ang)*off,dir>0?ang:ang+Math.PI,lorries&&e.a==='air'&&i%5===0?'#FF9F43':COLS[(i+3)%5],lorries&&e.a==='air'&&i%5===0,ce>0.6)}}
}
function drawFog(x,y,w,h,a){if(!(R.fx.fog>G.clock))return;const t=performance.now()/9000;for(let i=0;i<7;i++){const cx=x+((i*0.23+t*(0.5+i*0.07))%1.2-0.1)*w,cy=y+(0.15+0.12*i)*h,rx=w*0.35,ry=h*0.12;const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rx);g.addColorStop(0,`rgba(205,212,220,${a})`);g.addColorStop(1,'rgba(205,212,220,0)');ctx.fillStyle=g;ctx.save();ctx.translate(cx,cy);ctx.scale(1,ry/rx);ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);ctx.restore();ctx.fill()}}
const SHIPPATH=[[1680,975],[1200,940],[800,925],[450,890],[260,800],[150,748]];let SHIPP=null;
function drawRegionLive(t,k){
  const sc=Math.max(1,0.8/k);
  // noise rings at night
  if(!pol('curfew')&&nightWin()&&G.clock-(R.noiseT||-99)<25){const a=1-(G.clock-R.noiseT)/25,nz=1-0.3*G.lv.insul;for(let r=0;r<3;r++){ctx.strokeStyle=`rgba(255,159,67,${0.35*a*nz*(1-r*0.25)})`;ctx.lineWidth=Math.max(1.5,1.5/k);ctx.beginPath();ctx.ellipse(910,610,90+r*70+((t*40)%70),50+r*38,0,0,Math.PI*2);ctx.stroke()}if(k>0.3)lblBg('NIGHT NOISE',910,520,'#FF9F43',9)}
  // events: ship, crowds
  for(const e of (G.evq||[])){const P=PLOTS.find(p=>p.id===e.plot),dtm=G.clock-e.at;
    if(e.type==='cruise'&&Math.abs(dtm)<320){if(!SHIPP)SHIPP=rPath(SHIPPATH);let u=dtm<-150?(dtm+320)/170:dtm>150?1-(dtm-150)/170:1;u=clamp(u,0,1);const [x,y,ang]=ptOn(SHIPP,SHIPP.len*u);
      ctx.save();ctx.translate(x,y);ctx.rotate(dtm>150?ang:ang+Math.PI);ctx.scale(sc,sc);ctx.fillStyle='#ECE8DF';ctx.beginPath();ctx.moveTo(-34,-7);ctx.lineTo(26,-7);ctx.lineTo(36,0);ctx.lineTo(26,7);ctx.lineTo(-34,7);ctx.closePath();ctx.fill();
      ctx.fillStyle='#5CC8FF';for(let i=0;i<8;i++)ctx.fillRect(-28+i*7,-4,4,2),ctx.fillRect(-28+i*7,2,4,2);ctx.fillStyle='#E5484D';ctx.fillRect(-6,-3,6,6);ctx.restore();
      if(Math.abs(dtm)<150&&k>0.3)lblBg(e.name.toUpperCase(),x,y-18/k,'#ECE8DF',9)}
    const inArr=dtm>-150&&dtm<0,inLeave=dtm>90&&dtm<210;if(!(inArr||inLeave))continue;
    const pid=P.place,v=P.node;if(pid==='air'||!v)continue;
    const N=NODES[v],served=linesAt(v).some(L=>lineFreq(L)>0),live=e.live,n=Math.min(70,Math.round(e.att/600));
    if(served){for(let i=0;i<n;i++){const u=((G.clock*0.03+i/n*3.7)%1),f=inArr?u:1-u,x=N.x+(P.x-N.x)*f+Math.sin(i*7.3)*6,y=N.y+(P.y-N.y)*f+Math.cos(i*5.1)*6;ctx.fillStyle=i%4?'#ECE8DF':'#FFC72C';ctx.fillRect(x,y,2*sc,2*sc)}}
    if(!served||(live&&live.fans&&live.car/live.fans>0.5)){const T=PLACES[pid];ctx.strokeStyle='rgba(255,122,138,.5)';ctx.lineWidth=Math.max(3,3/k);ctx.beginPath();ctx.moveTo(T.x,T.y);ctx.lineTo(P.x,P.y);ctx.stroke();if(k>0.3)lblBg('GRIDLOCK',(T.x+P.x)/2,(T.y+P.y)/2,'#FF7A8A',9)}
  }
  // results banners
  if(R.evDoneFx)R.evDoneFx=R.evDoneFx.filter(f=>G.clock-f.t<150&&SET().pops!=='off');
  for(const f of (R.evDoneFx||[])){const P=PLOTS.find(p=>p.id===f.plot),a=G.clock-f.t;ctx.globalAlpha=clamp(1.5-a/100,0,1);lblBg(f.text,P.x,P.y-40-a*0.15,f.good?'#6BE39A':'#FF7A8A',10);ctx.globalAlpha=1}
  // roadworks cones
  if((R.fx.roadworks||0)>G.clock){const Pp=E_BY[R.fx.rwE]?E_BY[R.fx.rwE].P:(ROADP||(ROADP=MOTORWAYS.map(rPath)))[0],s0=Math.max(0,Pp.len/2-45);for(let i=0;i<10;i++){const [x,y]=ptOn(Pp,s0+i*9);ctx.fillStyle=i%2?'#FF9F43':'#ECE8DF';ctx.beginPath();ctx.moveTo(x,y-4*sc);ctx.lineTo(x+2.5*sc,y+2*sc);ctx.lineTo(x-2.5*sc,y+2*sc);ctx.fill()}const [x,y]=ptOn(Pp,s0+40);if(k>0.3)lblBg('ROADWORKS',x,y-14/k,'#FF9F43',9)}
  // leaves on the line
  if((R.fx.leaves||0)>G.clock){const g=R.ng;if(g)for(const L of Object.values(G.lines||{})){if(L.mode!=='rail'||!g.lines[L.id])continue;const Pp=g.lines[L.id].P;for(let i=0;i<40;i++){const [x,y]=ptOn(Pp,(i*37.7)%Pp.len);ctx.fillStyle=['#C9772E','#A8552A','#D9A066'][i%3];ctx.fillRect(x+Math.sin(i)*5,y+Math.cos(i*1.7)*5,2.4*sc,1.6*sc)}}}
}
/* ---------- the transit map: track, coloured lines side by side, stations and vehicles ---------- */
function netGeom(k){
  const sp=clamp(Math.round(4.8/k),3.4,10),Ls=sortedLines();
  const sig=Ls.map(L=>L.id+L.mode+L.stops.join('')).join('|')+'@'+sp;
  if(R.ng&&R.ng.sig===sig)return R.ng;
  const bund={},REs={};
  for(const L of Ls){const RE=routeEdges(L.mode,L.stops);if(!RE)continue;REs[L.id]=RE;for(const {e} of RE)(bund[e.id]||(bund[e.id]=[])).push(L.id)}
  const g={sig,sp,bund,lines:{},nodeM:{}};
  for(const eid in bund){const e=E_BY[eid];for(const n of [e.a,e.b])g.nodeM[n]=Math.max(g.nodeM[n]||0,bund[eid].length)}
  for(const L of Ls){const RE=REs[L.id];if(!RE)continue;const pts=[],rng=[];
    RE.forEach(({e,rev})=>{const b=bund[e.id],off=(b.indexOf(L.id)-(b.length-1)/2)*sp;let op=offsetPts(e.pts,off);if(rev)op=op.slice().reverse();const i0=pts.length;for(const p of op)pts.push(p);rng.push([i0,pts.length-1])});
    const P=rPath(pts);g.lines[L.id]={P,RE,seg:rng.map(([a,b])=>[P.cum[a],P.cum[b]])}}
  return R.ng=g;
}
let SBLK=null;
function stationBlocks(){
  if(SBLK)return SBLK;SBLK={};const rnd=seeded(11);
  for(const n of NODE_IDS){const N=NODES[n];if(!N.sh||N.far)continue;const arr=[];
    for(let i=0;i<60&&arr.length<34;i++){const a=rnd()*Math.PI*2,r=12+Math.sqrt(rnd())*34,x=N.x+Math.cos(a)*r,y=N.y+Math.sin(a)*r*0.8;if(inSea(x,y))continue;arr.push({x,y,w:4+rnd()*5,h:4+rnd()*5,r,s:rnd(),lit:rnd()})}
    arr.sort((a,b)=>a.r-b.r);SBLK[n]=arr}
  return SBLK;
}
function drawInfra(k){
  const minW=1/k,I=G.infra||{};
  if(!(I['air-ash']&&I['air-ash'].rail))strokePath(E_BY['air-ash'].pts,'#262B30',Math.max(2,minW),[3,5]);
  if(!(I['ash-cas']&&I['ash-cas'].rail))strokePath(E_BY['ash-cas'].pts,'#262B30',Math.max(2,minW),[3,5]);
  for(const eid in I){const e=E_BY[eid],t=I[eid];if(!e)continue;
    if(t.hsr)strokePath(e.pts,'#3C4148',Math.max(4,7*minW));
    if(t.rail){strokePath(e.pts,'#353C44',Math.max(3,6*minW));strokePath(e.pts,'#1C2126',Math.max(1,1.4*minW),[1.4/k,3.2/k])}
    if(t.metro)strokePath(e.pts,'rgba(229,72,77,.16)',Math.max(4,8*minW),[3/k,3/k]);
    if(t.tram){strokePath(e.pts,'#3E454D',Math.max(2,4*minW));strokePath(e.pts,'#20252A',Math.max(0.8,1.2*minW))}
  }
}
function drawBuilds(t,k){
  const minW=1/k;
  for(const b of (G.builds||[])){if(!b.lid)continue;const pr=bprog(b.id);
    const RE=routeEdges(b.mode,b.stops)||[];for(const {e} of RE)if(!(b.track||[]).includes(e.id))strokePath(e.pts,b.col,Math.max(2,2.4*minW),[3/k,5/k]);
    const Es=(b.track||[]).map(id=>E_BY[id]).filter(Boolean),tot=Es.reduce((a,e)=>a+e.len,0);let rem=pr*tot,head=null;
    for(const e of Es){strokePath(e.pts,'rgba(255,199,44,.22)',Math.max(3,4*minW),[5/k,4/k]);if(rem>0){const s=Math.min(e.len,rem);rem-=s;const pts=[];for(let q=0;q<s;q+=6)pts.push(ptOn(e.P,q));pts.push(ptOn(e.P,s));strokePath(pts,'#FFC72C',Math.max(3,4*minW));if(s<e.len)head=ptOn(e.P,s)}}
    if(head){const p=(Math.sin(t*6)+1)/2;ctx.fillStyle='#FFC72C';ctx.beginPath();ctx.arc(head[0],head[1],(3+2*p)/k,0,7);ctx.fill()}
    const mid=Es[Math.floor(Es.length/2)]||(RE[0]&&RE[0].e);if(mid&&k>0.3){const q=ptOn(mid.P,mid.len/2);lblBg(`${b.up?`UPGRADING ${b.from} → `:'BUILDING '}${MODES[b.mode].L}${b.num} · ${Math.round(pr*100)}%`,q[0],q[1]-12/k,'#FFC72C',9)}}
}
function lineW(L,k,sp){const M=MODES[L.mode];return Math.min(sp*0.82,({road:2.6,water:2.6,track:3.4,rail:3.8}[M.kind]*(L.mode==='metro'||L.mode==='hsr'?1.15:1))/k)}
function drawNetLines(t,k){
  const g=netGeom(k),Ls=sortedLines(),r=R.reg;ctx.lineJoin='round';ctx.lineCap='round';
  for(const L of Ls){const gl=g.lines[L.id];if(gl&&R.regSel===L.id)strokePath(gl.P.pts,'rgba(255,199,44,.32)',g.sp*2.4)}
  // water buses reach the station from its pier
  for(const L of Ls){if(L.mode!=='water')continue;for(const n of [L.stops[0],L.stops[L.stops.length-1],...L.stops]){const N=NODES[n];if(N.pier)strokePath([[N.x,N.y],N.pier],'rgba(236,232,223,.28)',Math.max(1,1.2/k),[2/k,3/k])}}
  for(const L of Ls){const gl=g.lines[L.id];if(!gl)continue;const M=MODES[L.mode],down=lineDown(L),rb=replOn(L.id),col=down?'#56606A':L.col,w=lineW(L,k,g.sp),pts=gl.P.pts;
    if(M.kind==='water')strokePath(pts,col,w,[7/k,5/k]);else if(L.mode==='coach')strokePath(pts,col,w,[10/k,4/k]);else strokePath(pts,col,w);
    if(L.mode==='rail'||L.mode==='hsr')strokePath(pts,'rgba(15,18,22,.55)',Math.max(0.6/k,w*0.24),[2/k,5/k]);
    if(L.mode==='metro')strokePath(pts,'rgba(15,18,22,.55)',w*0.34);
    if(rb)strokePath(pts,'#6BE39A',w*0.5,[4/k,4/k]);
  }
  ctx.lineJoin='miter';ctx.lineCap='butt';
  if(r&&r.over&&k>0.3)for(const key in r.over){if(r.over[key]<=1)continue;const e=E_BY[key.split(':')[0]],m=ptOn(e.P,e.len/2);lblBg('TRACK FULL',m[0],m[1]+14/k,'#FF7A8A',9)}
  for(const L of Ls){const gl=g.lines[L.id];if(!gl)continue;const sel=R.regSel===L.id,down=lineDown(L),rb=replOn(L.id);if(!(k>0.62||sel||down||rb))continue;
    const q=ptOn(gl.P,gl.P.len*(0.22+0.56*((L.num*0.618+MODE_ORDER.indexOf(L.mode)*0.29)%1)));const txt=rb?`${lineCode(L)} · BUSES`:down?`${lineCode(L)} · ${(R.fx.why||{})[L.id]||'STOPPED'}`:lineCode(L);
    lblBg(txt,q[0],q[1]-11/k,down?'#FF7A8A':'#0B0D10',9,down?'rgba(10,12,15,.85)':L.col)}
}
function drawStations(t,k){
  const g=netGeom(k),minW=1/k,r=R.reg,D=R.draft,dk=darkness();
  const served={};for(const L of Object.values(G.lines||{}))for(const n of L.stops)if(serves(L,n))(served[n]||(served[n]=[])).push(L);
  for(const n of NODE_IDS){const N=NODES[n],Ls=served[n]||[],inD=D&&D.stops.includes(n),sel=R.regSel==='node:'+n;
    const m=g.nodeM[n]||1,rad=Math.max(Math.min(5/k,4+4/k),m*g.sp/2+1.4/k);
    if(N.pier&&Ls.some(L=>L.mode==='water')){ctx.fillStyle='#14171B';ctx.strokeStyle='#2BB3A3';ctx.lineWidth=Math.max(1,1.6*minW);ctx.beginPath();ctx.arc(N.pier[0],N.pier[1],4/k,0,7);ctx.fill();ctx.stroke()}
    if(stnUp(n,'pr')){const x0=N.x+rad+4,y0=N.y+rad*0.4;ctx.fillStyle='#1E2429';ctx.fillRect(x0,y0,26,15);for(let q=0;q<12;q++){if((q*7+n.length)%5===0)continue;ctx.fillStyle=['#8C97A1','#CDD4DA','#6E7883','#A7A296'][q%4];ctx.fillRect(x0+2+(q%6)*4,y0+2+Math.floor(q/6)*7,2.6,4.4)}if(k>0.55)lbl('P+R',x0+13,y0+21,'#909AA4',8)}
    if(stnUp(n,'hub')){ctx.fillStyle='#3A424B';rrect(N.x-rad-6,N.y-rad-5,rad*2+12,rad*2+10,4);ctx.fill();ctx.strokeStyle='#5CC8FF';ctx.lineWidth=Math.max(1,1.2*minW);ctx.stroke()}
    if(sel){ctx.strokeStyle='rgba(255,199,44,.8)';ctx.lineWidth=Math.max(2,2.5*minW);ctx.beginPath();ctx.arc(N.x,N.y,rad+5/k,0,7);ctx.stroke()}
    if(Ls.length||inD){ctx.fillStyle='#F4F1EA';ctx.strokeStyle=Ls.length>1?'#0B0D10':Ls.length?Ls[0].col:D.col;ctx.lineWidth=Math.max(1.5,(Ls.length>1?2.6:2.2)*minW);ctx.beginPath();ctx.arc(N.x,N.y,rad,0,7);ctx.fill();ctx.stroke();
      if(Ls.length>1&&k>0.5){ctx.fillStyle='#0B0D10';ctx.beginPath();ctx.arc(N.x,N.y,rad*0.35,0,7);ctx.fill()}}
    else if(n!=='air'){ctx.fillStyle='rgba(20,23,27,.9)';ctx.strokeStyle='rgba(236,232,223,.35)';ctx.lineWidth=Math.max(1,1.2*minW);ctx.beginPath();ctx.arc(N.x,N.y,3.5/k,0,7);ctx.fill();ctx.stroke()}
    // people waiting on the platform
    if(r&&r.lines&&Ls.length){let w=0;for(const L of Ls){const l=r.lines[L.id];if(l&&l.f>0&&l.at[n])w+=l.at[n]*(30/l.f)/60}const dots=Math.min(26,Math.round(w/6));ctx.fillStyle='#ECE8DF';for(let i=0;i<dots;i++){const a=i*2.39,rr=rad+3/k+(i%3)*2.2/k;ctx.fillRect(N.x+Math.cos(a)*rr,N.y+Math.sin(a)*rr,1.8/k,1.8/k)}}
    // station name where a town has several, or the stop is its own place
    const own=N.n!==PLACES[N.pl].name&&n!=='air';if(own&&(Ls.length||inD||k>0.55||(D&&k>0.3)))lbl(N.n,N.x,N.y+rad+9/k,Ls.length?'#ECE8DF':'#909AA4',9.5,'center',Ls.length>0);
  }
}
function drawDraft(t,k){
  const D=R.draft;if(!D)return;const minW=1/k,pulse=(Math.sin(t*4)+1)/2;
  for(const e of EDGES){if(!edgeOK(e,D.mode))continue;const built=hasTrack(e,D.mode);strokePath(e.pts,built?'rgba(236,232,223,.32)':'rgba(236,232,223,.14)',Math.max(2,2.6*minW),built?[]:[5/k,5/k])}
  const RE=routeEdges(D.mode,D.stops)||[];ctx.lineCap='round';
  for(const {e} of RE){const nw=trackOf(D.mode)&&!hasTrack(e,D.mode);strokePath(e.pts,D.col,Math.max(3,4.5*minW),nw?[9/k,6/k]:[])}ctx.lineCap='butt';
  const ends=D.stops.length?[D.stops[0],D.stops[D.stops.length-1]]:null;
  for(const n of NODE_IDS){if(D.stops.includes(n))continue;const ok=ends?ends.some(a=>neighbours(a,D.mode).some(([b])=>b===n)):neighbours(n,D.mode).length>0;if(!ok)continue;
    const N=NODES[n];ctx.strokeStyle=`rgba(255,199,44,${0.45+0.45*pulse})`;ctx.lineWidth=Math.max(2,2.2*minW);ctx.beginPath();ctx.arc(N.x,N.y,(10+4*pulse)/k,0,7);ctx.stroke()}
  D.stops.forEach((n,i)=>{const N=NODES[n],sk=(D.skip||[]).includes(n);ctx.fillStyle=sk?'#262C33':D.col;ctx.beginPath();ctx.arc(N.x,N.y,7.5/k,0,7);ctx.fill();lbl(String(i+1),N.x,N.y+0.5/k,sk?'#909AA4':'#0B0D10',9,'center',true)});
}
function vehS(gl,T,tau){ // where a vehicle is along its line, tau minutes into a forward trip
  const n=T.eT.length;
  for(let i=0;i<n;i++){
    if(tau<T.dep[i]){const a=gl.seg[i-1][1],b=gl.seg[i][0],u=T.dep[i]>T.arr[i]?(tau-T.arr[i])/(T.dep[i]-T.arr[i]):1;return a+(b-a)*clamp(u,0,1)}
    if(tau<T.arr[i+1]){const {e,rev}=gl.RE[i],x=e.extra||0,u=(tau-T.dep[i])/(T.eT[i]||1),d=u*(e.len+x);let f;
      if(!x)f=u;else if(!rev){if(d>e.len)return null;f=d/e.len}else{if(d<x)return null;f=(d-x)/e.len}
      return gl.seg[i][0]+(gl.seg[i][1]-gl.seg[i][0])*f}
  }
  return gl.seg[n-1][1];
}
function drawNetVehicles(k){
  const g=netGeom(k),r=R.reg,sc=Math.max(1,0.75/k);
  for(const L of sortedLines()){const gl=g.lines[L.id],f=lineFreq(L);if(!gl||!f)continue;const T=lineTiming(L);if(!T)continue;
    const rb=replOn(L.id),M=rb?MODES.bus:MODES[L.mode],st=r&&r.lines[L.id],h=60/f,RT=T.RT,n=Math.max(1,Math.ceil(RT/h)),load=st?clamp(st.load,0,1.3):0;
    let off=0;for(const ch of L.id)off=(off*13+ch.charCodeAt(0))%101;
    for(let i=0;i<n;i++){const ph=((G.clock+off+i*h)%(n*h));if(ph>RT)continue;let s,fwd=true;
      if(ph<3)s=gl.seg[0][0];else if(ph<3+T.one)s=vehS(gl,T,ph-3);else if(ph<6+T.one){s=gl.seg[gl.seg.length-1][1];fwd=false}else{s=vehS(gl,T,T.one-(ph-6-T.one));fwd=false}
      if(s==null)continue;const [x,y,a0]=ptOn(gl.P,s),ang=fwd?a0:a0+Math.PI;
      ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(sc,sc);const len=M.len*(1+0.25*(L.cars||0))*(M===MODES.bus&&i%3===0?1.35:1),w=M.kind==='water'?6:4.4,col=rb?'#6BE39A':L.col;
      if(M.kind==='water'){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(-len/2,-w/2);ctx.lineTo(len/2-3,-w/2);ctx.lineTo(len/2+2,0);ctx.lineTo(len/2-3,w/2);ctx.lineTo(-len/2,w/2);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(-len/2-8,-0.6,7,1.2)}
      else{const cars=M===MODES.bus||M===MODES.coach?1:L.mode==='tram'?3:L.mode==='hsr'?5:4,cl=len/cars,sh=i%3===1?'rgba(255,255,255,.18)':i%3===2?'rgba(0,0,0,.18)':null;
        for(let c=0;c<cars;c++){ctx.fillStyle=col;rrect(-len/2+c*cl+0.4,-w/2,cl-0.8,w,1.2);ctx.fill();if(sh){ctx.fillStyle=sh;ctx.fillRect(-len/2+c*cl+0.4,-w/2,cl-0.8,w*0.45)}}
        if(M===MODES.bus&&i%3===1){ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(-len/2+1,-w/2+0.5,len-2,1)}
        if(M===MODES.bus&&i%3===0){ctx.fillStyle='#262C33';ctx.fillRect(-0.6,-w/2,1.2,w)}
        if(!rb&&L.mode==='hsr'){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(len/2,-w/2);ctx.lineTo(len/2+5,0);ctx.lineTo(len/2,w/2);ctx.closePath();ctx.fill();ctx.fillStyle='#E5484D';ctx.fillRect(-len/2,-0.4,len,0.8)}
        else if(!rb&&L.mode==='rail'){ctx.fillStyle='#FFC72C';ctx.fillRect(len/2-1.6,-w/2,1.6,w)}
        else if(!rb&&L.mode==='metro'){ctx.fillStyle='#ECE8DF';ctx.fillRect(len/2-1,-w/2+0.6,1,w-1.2)}}
      ctx.fillStyle=load>1?'#FF7A8A':'rgba(20,23,27,.75)';ctx.fillRect(-len/2+1.5,-0.9,(len-3)*Math.min(1,load),1.8);
      ctx.restore()}}
}
function drawRegionAirport(t,k){
  const x0=780,minW=1/k;
  ctx.fillStyle='#1B2025';rrect(760,576,300,100,8);ctx.fill();
  ctx.fillStyle='#262C33';ctx.fillRect(x0,592,270,11);if(G.lv.runway2)ctx.fillRect(x0+18,612,240,9);
  ctx.strokeStyle='rgba(236,232,223,.4)';ctx.lineWidth=Math.max(0.7,minW*0.7);ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(x0+6,597.5);ctx.lineTo(x0+264,597.5);if(G.lv.runway2){ctx.moveTo(x0+24,616.5);ctx.lineTo(x0+252,616.5)}ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#39414A';ctx.fillRect(840,634,130,14);const nb=builtCount();
  for(let i=0;i<Math.min(4,nb);i++){ctx.fillStyle='#2F363E';ctx.fillRect(850+i*28,626,5,10);ctx.fillStyle='#CDD4DA';ctx.fillRect(846+i*28,622,12,3)}
  if(G.pierB){ctx.fillStyle='#39414A';ctx.fillRect(972,626,70,10);for(let i=0;i<Math.max(0,nb-4);i++){ctx.fillStyle='#CDD4DA';ctx.fillRect(978+i*16,620,10,3)}}
  if(G.lv.rail){ctx.fillStyle='#C39BFF';ctx.fillRect(880,650,40,4)}
  if(Object.values(G.lines||{}).some(L=>L.mode==='water'&&serves(L,'air'))||(G.builds||[]).some(b=>b.mode==='water'&&b.stops&&b.stops.includes('air'))){strokePath([[905,660],[905,806]],'#39414A',Math.max(3,2*minW));ctx.fillStyle='#39414A';ctx.fillRect(895,800,20,8)}
  for(let r=0;r<2;r++){const a=R.rwy.act[r];if(!a)continue;const kk=a.t/a.dur,y=r?616:597;let x,alt;
    if(a.type==='arr'){x=x0+320-kk*300;alt=Math.max(0,1-kk/0.4)*30}else{x=x0+260-kk*kk*420;alt=Math.max(0,(kk-0.5)/0.5)*40}
    miniPlane(x,y-alt,Math.PI,0.45+alt/120)}
  lblBg(`${(G.name||'Northwind').toUpperCase()} AIRPORT`,910,690,'#FFC72C',11);
}
function drawPlot(P,t,k){
  const id=G.dev&&G.dev[P.id],b=buildOf('dev:'+P.id),x=P.x,y=P.y,minW=1/k,sel=R.regSel==='plot:'+P.id;
  if(sel){ctx.strokeStyle='rgba(255,199,44,.6)';ctx.lineWidth=Math.max(2,2*minW);ctx.beginPath();ctx.arc(x,y,34,0,Math.PI*2);ctx.stroke()}
  if(!id&&!b){ctx.strokeStyle='rgba(236,232,223,.22)';ctx.lineWidth=Math.max(1,minW);ctx.setLineDash([3,3]);ctx.strokeRect(x-18,y-14,36,28);ctx.setLineDash([]);if(k>0.75||sel)lbl('+ '+P.name.toUpperCase(),x,y+24,'#6E7883',9);return}
  if(b){ctx.fillStyle='rgba(255,199,44,.12)';ctx.fillRect(x-20,y-16,40,32);ctx.strokeStyle='#FFC72C';ctx.lineWidth=Math.max(1,minW);ctx.setLineDash([4,3]);ctx.strokeRect(x-20,y-16,40,32);ctx.setLineDash([]);ctx.fillStyle='#FFC72C';ctx.fillRect(x-20,y+18,40*bprog(b.id),3);
    ctx.save();ctx.translate(x+14,y-16);ctx.rotate(0.2*Math.sin(t));ctx.fillStyle='#FFC72C';ctx.fillRect(-1,0,2,-24);ctx.fillRect(-12,-24,20,2);ctx.restore();if(k>0.3)lbl(DEV[b.opt].name.toUpperCase(),x,y+30,'#FFC72C',9);return}
  const dk=darkness(),glow=a=>`rgba(255,214,140,${a*(0.3+dk)})`;
  switch(id){
    case 'stadium':ctx.fillStyle='#3A424B';ctx.beginPath();ctx.ellipse(x,y,26,18,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2E6B45';ctx.fillRect(x-14,y-8,28,16);ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=0.6;ctx.strokeRect(x-14,y-8,28,16);ctx.beginPath();ctx.moveTo(x,y-8);ctx.lineTo(x,y+8);ctx.stroke();for(const s of [-1,1])for(const u of [-1,1]){ctx.fillStyle='#ECE8DF';ctx.fillRect(x+s*24-1,y+u*16-6,2,6)}break;
    case 'cruise':ctx.fillStyle='#39414A';ctx.fillRect(x-20,y-6,30,12);ctx.fillRect(x+6,y+4,6,40);ctx.fillRect(x-4,y+6,6,44);break;
    case 'flats':case 'estate':case 'castlehomes':{const n=id==='flats'?6:12;for(let i=0;i<n;i++){ctx.fillStyle=id==='flats'?'#4A545E':'#3A424B';const bx=x-18+(i%(id==='flats'?3:4))*(id==='flats'?13:10),by=y-12+Math.floor(i/(id==='flats'?3:4))*(id==='flats'?14:9);ctx.fillRect(bx,by,id==='flats'?9:7,id==='flats'?12:6);ctx.fillStyle=glow(0.7);ctx.fillRect(bx+2,by+2,2,2)}}break;
    case 'bizpark':case 'techcampus':for(let i=0;i<(id==='techcampus'?5:4);i++){ctx.fillStyle='#2F4A63';ctx.fillRect(x-20+i*10,y-14+(i%2)*8,8,18);ctx.fillStyle='#5CC8FF';ctx.globalAlpha=0.4;ctx.fillRect(x-19+i*10,y-12+(i%2)*8,6,2);ctx.globalAlpha=1}if(id==='techcampus'){ctx.strokeStyle='#5CC8FF';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y+14,12,0,Math.PI*2);ctx.stroke()}break;
    case 'conference':ctx.fillStyle='#4A545E';ctx.beginPath();ctx.moveTo(x-22,y+10);ctx.quadraticCurveTo(x,y-24,x+22,y+10);ctx.closePath();ctx.fill();ctx.fillStyle=glow(0.6);ctx.fillRect(x-10,y+4,20,3);break;
    case 'logistics':for(let i=0;i<3;i++){ctx.fillStyle='#3F474F';ctx.fillRect(x-22,y-14+i*10,40,7)}{const lx=x-22+((t*12)%50);ctx.fillStyle='#FF9F43';ctx.fillRect(lx,y+18,6,3)}break;
    case 'hotels':for(let i=0;i<3;i++){ctx.fillStyle='#39414A';ctx.fillRect(x-16+i*12,y-20+i*3,9,30-i*3);for(let j=0;j<5;j++){ctx.fillStyle=glow(0.8);ctx.fillRect(x-14+i*12,y-17+i*3+j*5,5,1.5)}}break;
    case 'retail':case 'outlet':ctx.fillStyle='#4F5963';ctx.fillRect(x-20,y-12,40,12);ctx.fillStyle='#262C33';for(let i=0;i<12;i++)ctx.fillRect(x-20+(i%6)*7,y+4+Math.floor(i/6)*6,5,4);ctx.fillStyle=id==='outlet'?'#B8A1FF':'#FFC72C';ctx.fillRect(x-20,y-12,40,2);break;
    case 'uni':ctx.fillStyle='#4A545E';ctx.fillRect(x-20,y-16,40,6);ctx.fillRect(x-20,y+10,40,6);ctx.fillRect(x-20,y-16,6,32);ctx.fillRect(x+14,y-16,6,32);ctx.fillStyle='#2E6B45';ctx.fillRect(x-12,y-8,24,16);ctx.fillStyle='#ECE8DF';ctx.fillRect(x-1,y-24,2,8);break;
    case 'themepark':{ctx.strokeStyle='#E5484D';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x-6,y-2,14,0,Math.PI*2);ctx.stroke();for(let i=0;i<8;i++){const a=t*0.4+i*Math.PI/4;ctx.beginPath();ctx.moveTo(x-6,y-2);ctx.lineTo(x-6+Math.cos(a)*14,y-2+Math.sin(a)*14);ctx.stroke();ctx.fillStyle=['#FFC72C','#5CC8FF','#6BE39A'][i%3];ctx.fillRect(x-7+Math.cos(a)*14,y-3+Math.sin(a)*14,3,3)}
      ctx.strokeStyle='#FF9F43';ctx.beginPath();ctx.moveTo(x+6,y+14);ctx.bezierCurveTo(x+14,y-20,x+22,y+20,x+30,y-6);ctx.stroke();}break;
    case 'studios':for(let i=0;i<3;i++){ctx.fillStyle='#39414A';ctx.fillRect(x-22+i*15,y-12,13,24);ctx.fillStyle='#262C33';ctx.fillRect(x-22+i*15,y-12,13,3)}break;
    case 'reserve':for(let i=0;i<14;i++){ctx.fillStyle=i%2?'#2E6B45':'#3C7F52';ctx.beginPath();ctx.arc(x-18+(i*11)%36,y-12+Math.floor(i/4)*8,4.5,0,Math.PI*2);ctx.fill()}break;
    case 'wind':for(let i=0;i<8;i++){const wx=x-50+(i%4)*32,wy=y-20+Math.floor(i/4)*26;ctx.fillStyle='#CDD4DA';ctx.fillRect(wx-0.6,wy,1.2,12);ctx.strokeStyle='#ECE8DF';ctx.lineWidth=1;for(let bl=0;bl<3;bl++){const a=t*2+i+bl*2.094;ctx.beginPath();ctx.moveTo(wx,wy);ctx.lineTo(wx+Math.cos(a)*7,wy+Math.sin(a)*7);ctx.stroke()}}break;
    case 'marina':ctx.strokeStyle='#4A545E';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,22,Math.PI,0);ctx.stroke();for(let i=0;i<9;i++){ctx.fillStyle='#ECE8DF';ctx.fillRect(x-16+(i%5)*8,y-6+Math.floor(i/5)*8,5,2)}break;
    case 'arena':ctx.fillStyle='#4A545E';ctx.beginPath();ctx.arc(x,y,17,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#B8A1FF';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle=glow(0.5);ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();break;
    case 'oldtown':ctx.fillStyle='#5A5145';ctx.fillRect(x-8,y-6,16,16);ctx.beginPath();ctx.moveTo(x-4,y-6);ctx.lineTo(x,y-30);ctx.lineTo(x+4,y-6);ctx.fill();for(let i=0;i<6;i++){ctx.fillStyle='#4A4237';ctx.fillRect(x-22+i*8,y+12,6,5)}break;
    case 'ringroad':ctx.strokeStyle='#4A545E';ctx.lineWidth=Math.max(4,3*minW);ctx.beginPath();ctx.ellipse(400,560,150,120,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='rgba(236,232,223,.3)';ctx.lineWidth=Math.max(0.8,0.7*minW);ctx.setLineDash([6,6]);ctx.stroke();ctx.setLineDash([]);break;
    case 'lowtraffic':ctx.fillStyle='rgba(107,227,154,.07)';ctx.beginPath();ctx.ellipse(400,560,90,70,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(107,227,154,.45)';ctx.lineWidth=Math.max(1.2,minW);ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);break;
  }
  if(k>0.75||sel)lbl(DEV[id].name.toUpperCase(),id==='ringroad'||id==='lowtraffic'?x:x,y+(id==='wind'?30:28),'#909AA4',9);
}

