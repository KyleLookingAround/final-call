/* ---------- disruptions ---------- */
/* ---------- weather: moving cells with real effects ---------- */
const WX={fog:{col:'205,212,220',a:0.28,r:[170,240],spd:[3,5]},rain:{col:'120,150,185',a:0.22,r:[200,300],spd:[5,8]},snow:{col:'235,240,248',a:0.3,r:[200,280],spd:[3.5,6]},storm:{col:'70,80,105',a:0.42,r:[140,210],spd:[5,8]}};
const WXW={Spring:{rain:4,fog:3,storm:2},Summer:{storm:4,rain:3,fog:1},Autumn:{fog:4,rain:4,storm:2},Winter:{snow:5,fog:3,storm:1,rain:1}};
function spawnWeather(){
  const sea=seasonOf(dayOf(G.clock)).name,w=WXW[sea];let tot=0;for(const k in w)tot+=w[k];let r=rnd()*tot,type='rain';for(const k in w){r-=w[k];if(r<=0){type=k;break}}
  const T=WX[type],rad=T.r[0]+rnd()*(T.r[1]-T.r[0]),y=150+rnd()*700,spd=T.spd[0]+rnd()*(T.spd[1]-T.spd[0]),ang=Math.atan2(640-y,900+rad)+(rnd()-0.5)*0.5;
  (G.wx||(G.wx=[])).push({type,x:-rad,y,r:rad,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,seed:rnd()*100});
}
function wxAt(x,y){let best=null,bd=1;for(const c of (G.wx||[])){const d=Math.hypot(x-c.x,y-c.y)/c.r;if(d<bd){bd=d;best=c}}return best?{c:best,d:bd}:null}
function updateWeather(dt){
  if(!G.wx)G.wx=[];if(G.clock>=(G.wxNext||0)){G.wxNext=G.clock+180+rnd()*240;if(G.flights>=3)spawnWeather()}
  for(const c of G.wx){c.x+=c.vx*dt;c.y+=c.vy*dt}
  G.wx=G.wx.filter(c=>c.x-c.r<RW+40&&c.y+c.r>-60&&c.y-c.r<RH+60);
  const at=wxAt(900,640);
  if(at){const t=at.c.type;if(t==='fog'&&at.d<0.85)R.fx.fog=Math.max(R.fx.fog,G.clock+1);if(t==='snow'&&at.d<0.85)R.fx.snow=Math.max(R.fx.snow,G.clock+1);
    if(t==='storm'&&at.d<(G.lv.radar?0.3:0.6))R.fx.storm=G.clock+1;if(t==='rain'||t==='storm')R.fx.rain=G.clock+1}
}
function wxForecast(){let best=null;for(const c of (G.wx||[])){const dx=900-c.x,dy=640-c.y,v=Math.hypot(c.vx,c.vy)||1,along=(dx*c.vx+dy*c.vy)/v,perp=Math.abs(dx*c.vy-dy*c.vx)/v;if(along<=0||perp>c.r*0.85)continue;const eta=(along-c.r*0.85)/v;if(eta>0&&(!best||eta<best.eta))best={type:c.type,eta}}return best}
function drawWeatherCells(k){
  const t=performance.now()/1000;
  for(const c of (G.wx||[])){const T=WX[c.type];
    for(let i=0;i<6;i++){const a=c.seed+i*1.1,ox=Math.cos(a)*c.r*0.35,oy=Math.sin(a*1.3)*c.r*0.25,rr=c.r*(0.55+0.1*Math.sin(a*2+t*0.2));const g=ctx.createRadialGradient(c.x+ox,c.y+oy,0,c.x+ox,c.y+oy,rr);g.addColorStop(0,`rgba(${T.col},${T.a})`);g.addColorStop(1,`rgba(${T.col},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(c.x+ox,c.y+oy,rr,0,Math.PI*2);ctx.fill()}
    if(c.type==='rain'||c.type==='storm'){ctx.strokeStyle='rgba(170,195,225,.35)';ctx.lineWidth=Math.max(1,0.8/k);ctx.beginPath();for(let i=0;i<40;i++){const px=c.x+((i*53.7+t*30)%(c.r*1.4))-c.r*0.7,py=c.y+((i*91.3+t*80)%(c.r*1.2))-c.r*0.6;ctx.moveTo(px,py);ctx.lineTo(px-3,py+9)}ctx.stroke()}
    if(c.type==='snow'){ctx.fillStyle='rgba(245,248,252,.7)';for(let i=0;i<50;i++){const px=c.x+((i*53.7+t*12)%(c.r*1.4))-c.r*0.7,py=c.y+((i*91.3+t*20)%(c.r*1.2))-c.r*0.6;ctx.fillRect(px,py,1.8,1.8)}}
    if(c.type==='storm'&&Math.sin(t*3.7+c.seed)>0.985){ctx.strokeStyle='rgba(255,245,200,.9)';ctx.lineWidth=Math.max(1.5,1.5/k);ctx.beginPath();let px=c.x,py=c.y-c.r*0.4;ctx.moveTo(px,py);for(let j=0;j<5;j++){px+=(Math.random()-0.5)*30;py+=c.r*0.16;ctx.lineTo(px,py)}ctx.stroke()} // cosmetic
    if(k>0.3)lblBg(c.type.toUpperCase(),c.x,c.y-c.r*0.6,c.type==='storm'?'#FFC72C':'#CDD4DA',9);
  }
}
function news(t){(G.news||(G.news=[])).unshift({d:dayOf(G.clock),t:hhmm(G.clock),m:t});G.news.length=Math.min(G.news.length,14)}
function regionEvent(){
  const Ls=Object.values(G.lines||{}).filter(L=>!lineDown(L));if(!Ls.length)return false;
  const sea=seasonOf(dayOf(G.clock)).name,dur=m=>G.lv.control?m/2:m,R2=R.fx.line||(R.fx.line={});
  const rails=Ls.filter(L=>['rail','metro','hsr'].includes(L.mode)),trams=Ls.filter(L=>L.mode==='tram'),roads=Ls.filter(L=>MODES[L.mode].kind==='road');
  const opts=[];if(rails.length)opts.push('signal');if(trams.length)opts.push('wire');if(roads.length)opts.push('roadworks');if(sea==='Autumn'&&Ls.some(L=>L.mode==='rail'))opts.push('leaves','leaves');
  if(!opts.length)return false;const ev=pickOf(opts);
  if(ev==='signal'||ev==='wire'){const L=pickOf(ev==='signal'?rails:trams),m=dur(ev==='signal'?60:45),cost=Math.round(40+L.freq*MODES.bus.vh*6*(1+G.level));
    R2[L.id]=G.clock+m;(R.fx.why||(R.fx.why={}))[L.id]=ev==='signal'?'SIGNAL FAILURE':'WIRE FAULT';
    if(pol('repl')&&G.cash>=cost){spend(cost,'transitOps');(R.fx.repl||(R.fx.repl={}))[L.id]=G.clock+m;news(`A ${R.fx.why[L.id].toLowerCase()} hit ${lineCode(L)}: replacement buses ran (${money(cost)}).`)}
    else{repAdj(-2,'stranded');news(`A ${R.fx.why[L.id].toLowerCase()} stopped ${lineCode(L)} for ${m} min.`)}}
  else if(ev==='roadworks'){const L=pickOf(roads),RE=routeEdges(L.mode,L.stops)||[];if(!RE.length)return false;R.fx.roadworks=G.clock+dur(150);R.fx.rwE=pickOf(RE).e.id}
  else if(ev==='leaves'){R.fx.leaves=G.clock+dur(240)}
  regionTick();return true;
}

/* ---------- airport-side vehicles: trams and buses at the terminal ---------- */
function airLines(kind){return Object.values(G.lines||{}).filter(L=>serves(L,'air')&&effKind(L)===kind&&lineFreq(L)>0)}
function vehFreq(kind){let f=0;for(const L of airLines(kind))f+=lineFreq(L);return f}
function vehLine(kind){const c=airLines(kind);return c.length?pickOf(c):null}
function airKind(kind){return Object.values(G.lines||{}).some(L=>serves(L,'air')&&RLBL[MODES[L.mode].kind]===kind)||(G.builds||[]).some(b=>b.stops&&b.stops.includes('air')&&RLBL[MODES[b.mode].kind]===kind)}
function shade(hex,f){const n=parseInt(String(hex).slice(1),16);return `rgb(${Math.round(((n>>16)&255)*f)},${Math.round(((n>>8)&255)*f)},${Math.round((n&255)*f)})`}
const walkersTo=y0=>R.pax.some(p=>p.inbound&&p.state==='exitW'&&Math.abs(p.ty-y0)<8);
const syncKind=k=>Object.values(G.lines||{}).some(L=>L.sync&&serves(L,'air')&&effKind(L)===k);
function updateStopVehicles(dt){
  // trams
  const T=R.tram;const ft=vehFreq('tram');
  if(!ft&&R.tramQ.length){R.tramQ.forEach(p=>walkIn(p,40+rnd()*260,648+LAND_DY+rnd()*12));R.tramQ=[]}
  if(T.state==='away'){if(ft){T.t-=dt;if(T.t<=0){T.state='in';T.t=0;const L=vehLine('tram');T.secs=3+((L&&L.cars)||0);T.col=L?L.col:'#FF9F43'}}}
  else if(T.state==='in'){T.t+=dt;const k=Math.min(1,T.t/1);T.x=-280+310*(1-Math.pow(1-k,2));if(k>=1){T.state='dwell';T.t=1;R.tramQ.forEach(p=>walkIn(p,T.x+10+rnd()*200,792+LAND_DY));R.tramQ=[]}}
  else if(T.state==='dwell'){T.t-=dt;if(T.t<=0&&syncKind('tram')&&walkersTo(789+LAND_DY)&&(T.extra=(T.extra||0)+dt)<3)T.t=0.05;if(T.t<=0){T.state='out';T.t=0;T.extra=0}}
  else if(T.state==='out'){T.t+=dt;const k=Math.min(1,T.t/1);T.x=30-310*k*k;if(k>=1){T.state='away';T.t=Math.max(1.5,60/Math.max(ft,1)-3);T.x=null}}
  // buses, coaches and the water-bus shuttle
  const B=R.bus,fb=vehFreq('bus');
  if(!fb&&R.busQ.length){R.busQ.forEach(p=>walkIn(p,40+rnd()*260,648+LAND_DY+rnd()*12));R.busQ=[]}
  if(B.state==='away'){if(fb){B.t-=dt;if(B.t<=0){B.state='in';B.t=0;const L=vehLine('bus'),m=L?L.mode:'bus',r=rnd();B.kind=m==='coach'?'coach':m==='water'?'shuttle':r<0.3?'double':r<0.55+0.2*((L&&L.cars)||0)?'bendy':'single';B.col=L&&!replOn(L.id)?L.col:'#6BE39A';B.len={coach:40,shuttle:30,double:32,bendy:50,single:34}[B.kind]}}}
  else if(B.state==='in'){B.t+=dt;const k=Math.min(1,B.t/1.4);B.x=LAND_R+60-(LAND_R+60-236)*(1-Math.pow(1-k,2));if(k>=1){B.state='dwell';B.t=0.9;R.busQ.forEach(p=>walkIn(p,B.x+rnd()*B.len,640+LAND_DY));R.busQ=[]}}
  else if(B.state==='dwell'){B.t-=dt;if(B.t<=0&&syncKind('bus')&&walkersTo(641+LAND_DY)&&(B.extra=(B.extra||0)+dt)<3)B.t=0.05;if(B.t<=0){B.state='out';B.t=0;B.extra=0}}
  else if(B.state==='out'){B.t+=dt;const k=Math.min(1,B.t/0.8);B.x=236-300*k*k;if(k>=1){B.state='away';B.t=Math.max(1.2,60/Math.max(fb,1)-3);B.x=null}}
}
function drawStopVehicles(){
  if(airKind('tram')||R.tram.x!=null){
    ctx.fillStyle='#1B2025';ctx.fillRect(0,776,340,32);ctx.fillStyle='#2A3037';ctx.fillRect(30,778,290,8);ctx.fillStyle='#FF9F43';ctx.fillRect(30,785.5,290,1.2);
    ctx.strokeStyle='#4A545E';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(0,794);ctx.lineTo(336,794);ctx.moveTo(0,802);ctx.lineTo(336,802);ctx.stroke();
    ctx.strokeStyle='rgba(236,232,223,.18)';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(0,788.5);ctx.lineTo(336,788.5);ctx.stroke();
    const T=R.tram;if(T.x!=null){const secs=T.secs||3;for(let c=0;c<secs;c++){const x=T.x+c*(210/secs);ctx.fillStyle=T.col||'#FF9F43';rrect(x,791,210/secs-4,14,4);ctx.fill();ctx.fillStyle='#FFE1BF';for(let w=0;w<Math.floor((210/secs-8)/12);w++)ctx.fillRect(x+6+w*12,794,7,4)}}
    sign(30,764,'TRAM STOP',  '#FF9F43');mono(`${R.tramQ.length} waiting · every ${(60/Math.max(1,vehFreq('tram'))).toFixed(0)} min`,90,774,'#909AA4',9);
  }
  const B=R.bus;
  if(airKind('bus')){
    ctx.strokeStyle='rgba(107,227,154,.5)';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.strokeRect(232,643,48,11);ctx.setLineDash([]);mono('BUS',256,641,'#6BE39A',8,'center');
    if(R.busQ.length)mono(`${R.busQ.length} waiting`,290,652,'#909AA4',8);
  }
  if(B.x!=null){const L2=B.len||34;ctx.fillStyle=B.col||'#6BE39A';if(B.kind==='bendy'){rrect(B.x,644,L2*0.55,10,2.5);ctx.fill();rrect(B.x+L2*0.57,644,L2*0.43,10,2.5);ctx.fill();ctx.fillStyle='#262C33';ctx.fillRect(B.x+L2*0.55,645,L2*0.02+1,8)}else{rrect(B.x,644,L2,10,2.5);ctx.fill()}
    ctx.fillStyle='rgba(20,23,27,.55)';for(let w=0;w<L2/7-1;w++)ctx.fillRect(B.x+4+w*7,646,5,3.5);if(B.kind==='double'){ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(B.x+2,644.5,L2-4,1.2)}if(B.kind==='coach'){ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(B.x+2,652,L2-4,1)}}
}

