/* ================= LOWMERE: a rival airport that competes for travellers on the routes you both fly ================= */
const RIV='#B58CFF',RIV_LV=3,RIV_BUY_LV=8;
const rivLive=()=>{const V=G.rival;return !!(V&&V.open&&G.clock>=V.open&&!V.owned)};
const rivHsr=()=>Object.values(G.lines||{}).some(L=>L.mode==='hsr'&&serves(L,'low'));
const rivRoute=c=>rivLive()?G.rival.routes[c]||null:null;
const rivSale=c=>{const r=rivRoute(c);return !!(r&&r.sale>G.clock)};
const baseMarket=c=>{const C=CITY[c];return TIERBASE[C.tier]*C.size*SEA_MUL[C.sea][seaIdx()]};
// your share of the travellers on a route Lowmere also flies: frequency, fare, rating and punctuality decide it
function rivShare(c,fi){
  const r=rivRoute(c);if(!r)return 1;
  const s=rsOf(c),m=G.fare*RFARE[fi??routeFareIx(c)];
  const you=Math.sqrt(Math.max(0.5,s.n))*Math.pow(m,-1.6)*Math.pow(clamp(G.rep,20,100)/60,1.5)*(0.55+0.45*(G.otp??0.85))*(promoOn(c)?1.2:1)*(has('feat:slots')?1.12:1);
  const riv=Math.sqrt(r.f)*(r.sale>G.clock?1.43:1)*Math.pow(G.rival.rep/60,1.5)*0.93*(rivHsr()?0.7:1);
  return you/(you+riv);
}
// the part of a route's market you keep
const rivKeep=(c,fi)=>{const sh=rivShare(c,fi);return sh>=1?1:Math.min(1,1.1*(0.3+0.7*sh))};
const rivTierMax=()=>Math.min(4,Math.floor((G.rival.lv+1)/2));
const rivFlights=()=>G.rival?Object.values(G.rival.routes).reduce((x,r)=>x+r.f,0):0;
function rivMix(){ // your share across the routes you both fly, weighted by market
  let a=0,b=0;for(const c in (G.rival&&G.rival.routes||{})){if(!routeOpen(c))continue;const m=baseMarket(c);a+=m*rivShare(c);b+=m}return b?a/b:null}
const rivBuyCost=()=>Math.round((1200000+150000*(G.rival?G.rival.lv:1))/10000)*10000;
function rivalDay(){
  let V=G.rival;
  if(!V){if(G.level<RIV_LV)return;
    V=G.rival={open:G.clock+3*1440,routes:{},lv:1,rep:54,age:0,hist:[],pax:0,cut:0};
    toast(`Lowmere is building an airport. It opens on day ${dayOf(V.open)} and will compete for travellers on the routes you both fly.`,[{label:'Show me',fn:()=>{setView('region');regionFocus('low')}},{label:'OK',fn:()=>{}}],'rival','warn',25);
    return}
  if(V.owned){const d=Math.round(V.pax*rivFare()*0.22);if(d>0){earn(d,'region');V.paid=(V.paid||0)+d}return}
  if(G.clock<V.open)return;
  if(!V.opened){V.opened=1;
    const mine=Object.keys(G.routes||{}).filter(c=>CITY[c]&&CITY[c].tier<=1).sort((a,b)=>baseMarket(b)-baseMarket(a)).slice(0,3);
    for(const c of mine)V.routes[c]={f:2,w:0};
    const other=CITIES.filter(x=>x[2]<=1&&!V.routes[x[0]]&&!routeOpen(x[0])).sort((a,b)=>b[4]-a[4])[0];if(other)V.routes[other[0]]={f:1,w:0};
    const nm=Object.keys(V.routes).filter(routeOpen).map(c=>CITY[c].name);
    toast(`Lowmere Airport is open${nm.length?` and flies to ${nm.join(', ').replace(/, ([^,]*)$/,' and $1')}`:''}. Fly more often, price sharper and stay on time to keep your travellers.`,[{label:'Routes',fn:()=>{setView('world');setTab('routes')}},{label:'OK',fn:()=>{}}],'rival2','warn',25);
  }
  V.age++;V.lv=Math.min(Math.max(1,G.level-1),1+Math.floor(V.age/3));V.rep=clamp(54+V.lv*2.2,54,72);
  const rts=Object.keys(V.routes),maxR=3+V.lv*3,maxF=6+V.lv*5,fl=rivFlights(),tm=rivTierMax();
  const want=c=>{const rs=G.rs&&G.rs[c];return baseMarket(c)*(routeOpen(c)?1+(rs&&rs.tn?Math.max(0,rs.lf-0.7)*2:0):0.6)};
  // Lowmere backs off where you win clearly, and grows where your flights are full or your service is weak
  for(const c of rts){const r=V.routes[c];if(!routeOpen(c)){r.w=0;continue}const sh=rivShare(c);r.w=sh>0.8?(r.w||0)+1:0;
    if(r.w>=4){r.w=0;if(r.f>1)r.f--;else{delete V.routes[c];V.cut=(V.cut||0)+1;if(!R.sim)toast(`Lowmere has stopped flying to ${CITY[c].name}. You won the route.`,null,null,'goal',8)}}}
  if(!has('feat:slots')||Math.random()<0.5){
    if(rts.length<maxR&&(rts.length<4||Math.random()<0.55)){
      const cand=CITIES.filter(x=>x[2]<=tm&&!V.routes[x[0]]).map(x=>x[0]).sort((a,b)=>want(b)-want(a));
      if(cand.length){const c=cand[Math.floor(Math.random()*Math.min(3,cand.length))];V.routes[c]={f:1,w:0};if(routeOpen(c)&&!R.sim)toast(`Lowmere now flies to ${CITY[c].name} as well.`,null,null,'',6)}
    }else if(fl<maxF&&rts.length){
      const c=Object.keys(V.routes).sort((a,b)=>want(b)/(V.routes[b].f+1)-want(a)/(V.routes[a].f+1))[0];if(V.routes[c].f<8)V.routes[c].f++}
  }
  // now and then a three-day fare sale on one of your best routes
  if(!Object.values(V.routes).some(r=>r.sale>G.clock)&&Math.random()<0.18){
    const tgt=Object.keys(V.routes).filter(routeOpen).sort((a,b)=>(rsOf(b).v-(rsOf(b).c||0))-(rsOf(a).v-(rsOf(a).c||0)))[0];
    if(tgt){V.routes[tgt].sale=G.clock+3*1440;toast(`Lowmere has cut fares to ${CITY[tgt].name} for three days.`,[{label:'Show route',fn:()=>{setView('world');R.wSel=tgt;R.rSub='mine';setTab('routes');showCard('route-'+tgt)}},{label:'OK',fn:()=>{}}],'rsale','warn',20)}}
  // how many travellers Lowmere carried, and your share of the routes you share
  let px=0;for(const c in V.routes)px+=baseMarket(c)*(routeOpen(c)?1-rivShare(c):0.7);V.pax=Math.round(px);
  const mx=rivMix();if(mx!=null){V.hist.push(Math.round(mx*100));if(V.hist.length>14)V.hist.shift()}
}
function rivFare(){const n=G.flown||0;return n>500?(G.revBy.fares||0)/n:4}
function buyRival(){const V=G.rival;if(!V||V.owned||G.level<RIV_BUY_LV||!buy(rivBuyCost()))return false;V.owned=1;V.ownedAt=G.clock;
  toast('Lowmere Airport is yours. It stops competing and pays you a share of its traffic every day.',null,null,'goal',10);return true}
function rivalPanel(){
  const V=G.rival;if(!V)return '';
  if(G.clock<V.open)return `<div class="lcard riv"><div class="sh"><div><span class="gate" style="--c:${RIV}">LOW</span><span class="rt">Lowmere Airport</span></div></div><div class="rd">Opens on day ${dayOf(V.open)}. It will compete for travellers on the routes you both fly.</div></div>`;
  if(V.owned)return `<div class="lcard riv"><div class="sh"><div><span class="gate" style="--c:${RIV}">LOW</span><span class="rt">Lowmere Airport</span></div><span class="live">Yours</span></div><div class="rd">Paid you <b>${money(V.paid||0)}</b> so far · about <b>${num(V.pax)}</b> travellers a day.</div></div>`;
  const mx=rivMix(),n=Object.keys(V.routes).length,sh=Object.keys(V.routes).filter(routeOpen).length,hs=V.hist.slice(-10);
  const spark=hs.length>1?`<svg class="spark" viewBox="0 0 100 24" preserveAspectRatio="none"><polyline fill="none" stroke="${RIV}" stroke-width="1.6" points="${hs.map((v,i)=>`${i/(hs.length-1)*100},${24-clamp((v-30)/70,0,1)*22-1}`).join(' ')}"/></svg>`:'';
  let h=`<div class="lcard riv"><div class="sh"><div><span class="gate" style="--c:${RIV}">LOW</span><span class="rt">Lowmere Airport</span></div><span class="live">Rival</span></div>
    <div class="lstats fl4" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div><b>${n}</b><span>routes</span></div><div><b>${rivFlights()}</b><span>flights/day</span></div><div><b style="color:${mx==null?'':mx>=0.65?'var(--good)':mx<0.5?'var(--bad)':''}">${mx==null?'–':Math.round(mx*100)+'%'}</b><span>your share</span></div></div>
    ${sh?`<div class="rd">You both fly <b>${sh}</b> route${sh>1?'s':''}. Travellers pick by flights a day, fare, rating and punctuality.</div>`:'<div class="rd">No shared routes yet.</div>'}${spark}`;
  if(!rivHsr()&&has('mode:hsr'))h+=`<div class="rd">High-speed trains to Lowmere would bring its travellers to you.</div>`;
  if(G.level>=RIV_BUY_LV)h+=`<div class="chips" style="margin-top:8px"><button class="chip" data-rivbuy="1" data-cost="${rivBuyCost()}">Buy Lowmere Airport <small>${money(rivBuyCost())}</small></button></div>`;
  return h+`</div>`;
}
function rivalRouteLine(c){
  const r=rivRoute(c);if(!r)return '';const sh=rivShare(c);
  return `<div class="rd rivl"><span class="dotr"></span>Lowmere flies here <b>${r.f}</b>× a day${r.sale>G.clock?` · <b style="color:${RIV}">fare sale</b> until ${hhmm(r.sale)} day ${dayOf(r.sale)}`:''}. You get <b>${Math.round(sh*100)}%</b> of travellers.</div><div class="prog two"><i style="width:${sh*100}%"></i><i style="width:${(1-sh)*100}%;background:${RIV}"></i></div>`;
}
// Lowmere on the region map: a building site, then an airport whose planes cross your sky
function drawLowmere(t,k){
  const V=G.rival;if(!V)return;const x=1532,y=150,minW=1/k;
  if(G.clock<V.open){const p=clamp(1-(V.open-G.clock)/(3*1440),0,1);
    ctx.strokeStyle='#FFC72C';ctx.lineWidth=Math.max(1.5,minW*1.5);ctx.beginPath();ctx.moveTo(x-6,y+14);ctx.lineTo(x-6,y-16);ctx.lineTo(x+18,y-16);ctx.moveTo(x-6,y-10);ctx.lineTo(x+2,y-16);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+14,y-16);ctx.lineTo(x+14,y-8+3*Math.sin(t*1.5));ctx.stroke();
    ctx.fillStyle='rgba(255,199,44,.18)';ctx.fillRect(x-30,y+18,60,4);ctx.fillStyle='#FFC72C';ctx.fillRect(x-30,y+18,60*p,4);
    lbl(`AIRPORT · OPENS DAY ${dayOf(V.open)}`,x+34,y+34,'#FFC72C',9.5,'right',true);return}
  ctx.save();ctx.translate(x,y);ctx.rotate(-0.5);ctx.fillStyle='#2A2440';ctx.fillRect(-32,-5,64,10);ctx.strokeStyle=V.owned?'#FFC72C':RIV;ctx.lineWidth=Math.max(1,minW);ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(-28,0);ctx.lineTo(28,0);ctx.stroke();ctx.setLineDash([]);ctx.restore();
  lbl(V.owned?'LOWMERE AIRPORT · YOURS':'LOWMERE AIRPORT',x+34,y+26,V.owned?'#FFC72C':RIV,9.5,'right',true);
  if(V.owned)return;
  const rs=Object.keys(V.routes),n=Math.min(10,Math.ceil(rivFlights()/2)),sc=Math.max(0.35,Math.min(0.9,10/(28*k)));
  for(let i=0;i<n;i++){const C=CITY[rs[i%rs.length]];if(!C)continue;const a=C.brg*Math.PI/180+(i%3-1)*0.05,u=(t*0.018+i*0.37)%1,d=u*1500;
    const px=x+Math.sin(a)*d,py=y-Math.cos(a)*d;if(px<-40||px>RW+40||py<-40||py>RH+40)continue;
    miniPlane(px,py,Math.atan2(-Math.cos(a),Math.sin(a)),sc,Math.min(1,u*8)*0.85,RIV)}
}
// Lowmere on the world map: dashed arcs to the cities it serves
const RIV_W=[WCX+34,WCY-24];
function drawRivalWorld(t,px,lb){
  const V=G.rival;if(!V||G.clock<V.open)return;const [lx,ly]=RIV_W;
  if(!V.owned)for(const c in V.routes){const C=CITY[c];if(!C||!cityVisible(C))continue;const [x,y]=cityXY(C),dx=x-lx,dy=y-ly,cx=lx+dx/2+dy*0.18,cy=ly+dy/2-dx*0.18,sale=V.routes[c].sale>G.clock;
    ctx.strokeStyle=RIV;ctx.globalAlpha=sale?0.6+0.3*Math.sin(t*4):0.45;ctx.lineWidth=px(sale?2.4:1.3);ctx.setLineDash([px(4),px(4)]);ctx.beginPath();ctx.moveTo(lx,ly);ctx.quadraticCurveTo(cx,cy,x,y);ctx.stroke();ctx.setLineDash([]);
    if(sale){ctx.globalAlpha=1;lb('SALE',(lx+2*cx+x)/4,(ly+2*cy+y)/4,RIV,8.5,'center',true)}ctx.globalAlpha=1}
  ctx.fillStyle=V.owned?'#FFC72C':RIV;ctx.beginPath();ctx.arc(lx,ly,px(4),0,Math.PI*2);ctx.fill();lb('LOWMERE',lx+px(7),ly-px(6),V.owned?'#FFC72C':RIV,9,'left',true);
}
