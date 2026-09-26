/* ================= ROUTES: the world map and your network of cities ================= */
const WW=1500,WH=1060,WCX=750,WCY=530,RING=[120,230,320,410,485],WSX=1.45;
const cityXY=C=>{const a=C.brg*Math.PI/180,r=RING[C.tier];return [WCX+Math.sin(a)*r*WSX,WCY-Math.cos(a)*r]};
function arcCtl(C){const [x,y]=cityXY(C),dx=x-WCX,dy=y-WCY;return [WCX+dx/2-dy*0.16,WCY+dy/2+dx*0.16,x,y]}
function arcPt(C,u){const [cx,cy,x,y]=arcCtl(C),v=1-u;return [v*v*WCX+2*v*u*cx+u*u*x,v*v*WCY+2*v*u*cy+u*u*y,Math.atan2(2*v*(cy-WCY)+2*u*(y-cy),2*v*(cx-WCX)+2*u*(x-cx))]}
const lfCol=lf=>lf>=0.8?'#6BE39A':lf>=0.55?'#FFC72C':'#FF7A8A';
const cityVisible=C=>has('rt:'+C.tier)||routeOpen(C.code);
function profileOf(C){return (C.biz>=0.5?'Business':C.biz<=0.2?'Leisure':'Mixed')+(C.sea==='summer'?' · busy in summer':C.sea==='wsun'?' · winter sun':C.sea==='ski'?' · busy in winter':'')+(GROUP_CITIES.has(C.code)?' · groups':'')}
function drawWorld(){
  clampCam();
  const k=viewK(),s=k*R.dpr,cam=R.cam,t=performance.now()/1000,ls=clamp(Math.min(R.sw,R.sh*1.7)/1150,0.9,1.4),px=v=>v*ls/k,lb=(a,b,c,d,e,f,g)=>lbl(a,b,c,d,e*ls,f,g);
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0A0E13';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(s,0,0,s,-cam.x*s,-cam.y*s);
  const gl=ctx.createRadialGradient(WCX,WCY,0,WCX,WCY,560);gl.addColorStop(0,'rgba(255,199,44,.07)');gl.addColorStop(1,'rgba(255,199,44,0)');ctx.fillStyle=gl;ctx.fillRect(0,0,WW,WH);
  // compass spokes and haul rings
  ctx.strokeStyle='rgba(144,154,164,.06)';ctx.lineWidth=px(1);ctx.beginPath();for(let a=0;a<360;a+=30){const r=a*Math.PI/180;ctx.moveTo(WCX,WCY);ctx.lineTo(WCX+Math.sin(r)*RING[4]*WSX*1.03,WCY-Math.cos(r)*RING[4]*1.03)}ctx.stroke();
  for(let tr=0;tr<5;tr++){const op=has('rt:'+tr);ctx.strokeStyle=op?'rgba(144,154,164,.26)':'rgba(144,154,164,.08)';ctx.lineWidth=px(1);ctx.setLineDash([px(3),px(5)]);ctx.beginPath();ctx.ellipse(WCX,WCY,RING[tr]*WSX,RING[tr],0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    if(op&&(tr===0?RING[0]:RING[tr]-RING[tr-1])*k>=38){const a=246*Math.PI/180;lb(`${RT_NAMES[tr].toUpperCase()} · ${Math.round(TRIP[tr]/6)/10} H`,WCX+Math.sin(a)*RING[tr]*WSX+px(4),WCY-Math.cos(a)*RING[tr],'#4A535C',8.5,'left')}}
  lb('N',WCX,WCY-RING[4]-px(14),'#56606A',10,'center',true);
  // routes, coloured by how full recent flights were
  for(const c in (G.routes||{})){const C=CITY[c];if(!C)continue;const rs=rsOf(c),[cx,cy,x,y]=arcCtl(C),lf=rs.tn?rs.lf:paxLF(c),sel=R.wSel===c;
    ctx.strokeStyle=lfCol(lf);ctx.globalAlpha=sel?0.95:0.5;ctx.lineWidth=px(Math.min(5,1.3+rs.n/6)+(sel?1:0));ctx.beginPath();ctx.moveTo(WCX,WCY);ctx.quadraticCurveTo(cx,cy,x,y);ctx.stroke();
    // passengers waiting to fly: dots drifting along the route
    const n=Math.min(6,Math.round(cityMarket(c)/400));ctx.fillStyle=lfCol(lf);for(let j=0;j<n;j++){const u=((t*0.05+j/n+C.brg/360)%1),q=arcPt(C,u);ctx.globalAlpha=0.5*Math.sin(u*Math.PI);ctx.beginPath();ctx.arc(q[0],q[1],px(1.4),0,Math.PI*2);ctx.fill()}
    ctx.globalAlpha=1}
  // cities
  for(const C of Object.values(CITY)){if(!cityVisible(C))continue;const [x,y]=cityXY(C),op=routeOpen(C.code),sel=R.wSel===C.code,r=px(2.2+C.size*0.75);
    if(sel){ctx.strokeStyle='#FFC72C';ctx.lineWidth=px(1.6);ctx.beginPath();ctx.arc(x,y,r+px(5),0,Math.PI*2);ctx.stroke()}
    ctx.fillStyle=op?'#ECE8DF':'#14191F';ctx.strokeStyle=op?'#ECE8DF':'#6E7883';ctx.lineWidth=px(1.2);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
    const a=C.brg*Math.PI/180,sx=Math.sin(a),out=px(9)+r,lx=x+sx*out,ly=y-Math.cos(a)*out,al=sx>0.35?'left':sx<-0.35?'right':'center',nm=k>0.42||sel;
    lb(C.code,lx,ly-(nm?px(5):0),op?'#ECE8DF':'#6E7883',nm?10:9.5,al,true);if(nm)lb(C.name,lx,ly+px(6),op?'#909AA4':'#56606A',9,al)}
  // your planes in the air
  const sc=Math.max(0.3,px(15)/28);
  for(const f of G.fleet){if(f.sold||f.st!=='away'||f.dep==null)continue;const C=CITY[f.dest];if(!C)continue;const tot=Math.max(1,f.back-f.dep),p=clamp((G.clock-f.dep)/tot,0,1),out=p<0.5,u=out?p*2:2-p*2,q=arcPt(C,clamp(u,0.001,0.999));
    const lt=f.late&&!out;miniPlane(q[0],q[1],out?q[2]:q[2]+Math.PI,sc,1,lt?'#FF7A8A':null);if(lt)lb(`+${f.late}m`,q[0],q[1]-px(11),'#FF7A8A',8.5,'center',true)}
  drawRivalWorld(t,px,lb);
  // home
  ctx.fillStyle='#FFC72C';ctx.beginPath();ctx.arc(WCX,WCY,px(6),0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,199,44,.35)';ctx.lineWidth=px(1.5);ctx.beginPath();ctx.arc(WCX,WCY,px(10+3*Math.sin(t*2)),0,Math.PI*2);ctx.stroke();
  lblBg((G.name||'Northwind').toUpperCase(),WCX,WCY+px(20),'#FFC72C',11*ls);
}
function worldTap(wx,wy){
  const k=viewK();let best=null,bd=Math.max(26/k,18);
  for(const C of Object.values(CITY)){if(!cityVisible(C))continue;const [x,y]=cityXY(C),d=Math.hypot(wx-x,wy-y);if(d<bd){bd=d;best=C.code}}
  if(!best){if(R.wSel){R.wSel=null;if(G.tab==='routes')renderPanel()}return}
  R.wSel=best;R.rSub=routeOpen(best)?'mine':'new';if(G.tab!=='routes')setTab('routes');else renderPanel();showCard('route-'+best);
}
function worldFocus(which){const c=R.cam;if(which==='near'){c.z=Math.max(zMin()*1.9,zMin());const k=viewK();c.tx=WCX-R.sw/k/2;c.ty=WCY-R.sh/k/2}else{c.z=zMin();c.tx=0;c.ty=0}}
function routeCard(c){
  const C=CITY[c],rs=rsOf(c),mk=cityMarket(c),f=routeFareIx(c),lf=rs.tn?rs.lf:null,prof=rs.v-(rs.c||0),sel=R.wSel===c;
  return `<div class="lcard rcard${sel?' sel':''}" id="route-${c}"><div class="sh"><div><span class="gate">${c}</span><span class="rt">${C.name}</span></div><button class="buy ghost" data-rlook="${c}" style="min-width:0">Map</button></div>
    <div class="rd" style="margin-top:2px">${RT_NAMES[C.tier]} · ${profileOf(C)}</div>
    <div class="lstats fl4" style="grid-template-columns:repeat(4,minmax(0,1fr))"><div><b>${rs.n.toFixed(rs.n<10?1:0)}</b><span>flights/day</span></div><div><b>${num(rs.p)}</b><span>flyers/day</span></div><div><b style="color:${lf!=null?lfCol(lf):''}">${lf!=null?Math.round(lf*100)+'%':'–'}</b><span>full</span></div><div><b style="color:${prof<0?'var(--bad)':''}">${money(prof)}</b><span>profit/day</span></div></div>
    <div class="rd">Market <b>${num(mk)}</b> seats a day. You flew <b>${num(rs.s)}</b>.${rs.s>mk*1.05?' More flights will fly emptier.':rs.s<mk*0.6?' Room for more flights.':''}</div><div class="prog"><i style="width:${clamp(rs.s/Math.max(1,mk),0,1)*100}%;background:${rs.s>mk*1.05?'var(--bad)':'var(--good)'}"></i></div>
    ${rivalRouteLine(c)}
    <div class="field"><span class="lbl">Fares</span><div class="chips">${['−20%','Standard','+25%'].map((n,k)=>`<button class="chip${f===k?' on':''}" data-rfare="${c}:${k}">${n}</button>`).join('')}</div></div>
    ${SET().autoFares?(G.routes[c].man?`<div class="rd">You set these fares. <button class="linkb" data-rauto="${c}">Hand them back to the manager</button></div>`:`<div class="rd">The route manager sets the fare that earns most.</div>`):''}
    ${has('feat:promo')?(promoOn(c)?`<div class="rd">Promotion running until ${hhmm(G.routes[c].promo)}: more people want to fly.</div>`:`<div class="chips" style="margin-top:8px"><button class="chip" data-rpromo="${c}" data-cost="${promoCost(c)}">Promote for a day <small>${money(promoCost(c))}</small></button></div>`):''}
  </div>`;
}
function routesPanel(){
  const sub=R.rSub||'mine',open=Object.keys(G.routes||{}).filter(c=>CITY[c]),unl=[0,1,2,3,4].filter(t=>has('rt:'+t));
  const fresh=CITIES.filter(c=>unl.includes(c[2])&&!routeOpen(c[0])).length;
  let h=segs('rSub',[['mine',`Your routes · ${open.length}`],['new',`New routes${fresh?' · '+fresh:''}`]]);
  if(sub==='mine'){
    let n=0,p=0,v=0,c=0,sw=0,lw=0;for(const k of open){const rs=rsOf(k);n+=rs.n;p+=rs.p;v+=rs.v;c+=rs.c||0;if(rs.tn){sw+=rs.lf*rs.n;lw+=rs.n}}
    h+=`<div class="lstats fl4" style="grid-template-columns:repeat(4,minmax(0,1fr))"><div><b>${Math.round(n)}</b><span>flights/day</span></div><div><b>${num(p)}</b><span>flyers/day</span></div><div><b>${lw?Math.round(sw/lw*100)+'%':'–'}</b><span>full</span></div><div><b>${money(v-c)}</b><span>profit/day</span></div></div>`;
    h+=routeRecs();h+=rivalPanel();
    h+=`<p class="note">Your planes fly wherever they earn most, within their range. Each city has a market: fly more seats than it wants and flights go out emptier.</p>`;
    const ord=open.slice().sort((a,b)=>CITY[a].tier-CITY[b].tier||cityMarket(b)-cityMarket(a));let tr=-1;
    for(const k of ord){if(CITY[k].tier!==tr){tr=CITY[k].tier;h+=`<div class="sec">${RT_NAMES[tr]}<span>${Math.round(TRIP[tr]/6)/10} h return</span></div>`}h+=routeCard(k)}
  }else{
    h+=`<p class="note">A new route adds a new market for your planes to fill. Bigger cities want more seats; business cities pay more but fill less off-peak.</p>`;
    for(const t of unl){const cs=CITIES.filter(c=>c[2]===t&&!routeOpen(c[0]));if(!cs.length)continue;
      h+=`<div class="sec">${RT_NAMES[t]}<span>${money(ROUTE_FEE[t])} to open · ${Math.round(TRIP[t]/6)/10} h</span></div>`;
      h+=cs.sort((a,b)=>cityMarket(b[0])-cityMarket(a[0])).map(([cc])=>{const C=CITY[cc];return `<div class="row${R.wSel===cc?' sel':''}" id="route-${cc}">${svg('globe')}<div><div class="rt">${C.name} <span class="live">${cc}</span></div><div class="rd">${profileOf(C)} · market ${num(cityMarket(cc))} seats a day</div></div><button class="buy" data-ropen="${cc}" data-cost="${ROUTE_FEE[t]}">${money(ROUTE_FEE[t])}</button></div>`}).join('')}
    const locked=[0,1,2,3,4].filter(t=>!has('rt:'+t));
    if(locked.length)h+=`<p class="note soon">${locked.map(t=>RT_NAMES[t].toLowerCase()).join(', ').replace(/^./,x=>x.toUpperCase())} routes are in the <button class="linkb" data-plan="1">Masterplan</button>.</p>`;
  }
  return h;
}
function routesClick(d){
  if(d.ropen){if(openRoute(d.ropen)){R.wSel=d.ropen;R.rSub='mine';renderPanel();showCard('route-'+d.ropen);save()}return true}
  if(d.rfare){const [c,k]=d.rfare.split(':');if(G.routes[c]){G.routes[c].f=+k;G.routes[c].man=true;renderPanel();save()}return true}
  if(d.rpromo){if(promoteRoute(d.rpromo)){renderPanel();save()}return true}
  if(d.rlook){R.wSel=d.rlook;if(R.view!=='world')setView('world');const C=CITY[d.rlook],[x,y]=cityXY(C),c=R.cam;c.z=Math.max(c.z,zMin()*1.6);const k=viewK();c.tx=x-R.sw/k/2;c.ty=y-R.sh/k/2;renderPanel();return true}
  return false;
}
