/* ================= LAYOUTS: the airport's stands, piers and shop units, and rebuilding into another layout ================= */
// Each layout lists its stands (x, how far back the plane sits, gate name, cost, level, and whether it needs Pier B)
// and its shop units. applyLayout copies the current one into the shared arrays (STAND_X, STAND, GATES, SHOP_X...)
// in place, so everything that reads them follows the layout.
// price, build minutes and level of the n-th stand bought, following Classic's ladder and carrying on past eight
const LADDER=[[0,0,0],[400,30,0],[3000,60,1],[12000,90,3],[80000,120,4],[150000,150,4],[300000,180,6],[500000,210,6],[700000,240,7],[900000,270,7],[1200000,300,8],[1500000,330,8]];
const lad=(x,g,n,o={})=>{const s={x,g,cost:LADDER[n][0],build:LADDER[n][1],lvl:LADDER[n][2],...o};if(!s.pier)delete s.pier;return s};
const LAYOUTS={
  classic:{name:'Classic',W:2480,
    stands:[
      {x:170,g:'A1',cost:0,build:0,lvl:0},{x:470,g:'A2',cost:400,build:30,lvl:0},{x:770,g:'A3',cost:3000,build:60,lvl:1},{x:1070,g:'A4',cost:12000,build:90,lvl:3},
      {x:1370,g:'B1',cost:80000,build:120,lvl:4,pier:1},{x:1670,g:'B2',cost:150000,build:150,lvl:4,pier:1},{x:1970,g:'B3',cost:300000,build:180,lvl:6,pier:1},{x:2270,g:'B4',cost:500000,build:210,lvl:6,pier:1}],
    shops:[[192,'A1'],[492,'A2'],[792,'A3'],[1092,'A4'],[1392,'B1',2],[1692,'B2',2],[1992,'B3',2],[2292,'B4',2]]},
  remote:{name:'Remote apron',plan:'l_remote',lvl:5,pts:1,cost:15000,build:180,W:3800,conc1:2440,upk:200,
    from:'the remote stands at London Stansted and Luton',
    up:'Four remote stands for short-haul planes from level 6, at 60% of the price of pier stands.',down:'Buses cost money to run, make boarding slower, more so in rain and snow, and cost a little rating. Remote stands don\'t count as gates for your airport\'s level.',
    stands:[lad(170,'A1',0),lad(470,'A2',1),lad(770,'A3',2),lad(1070,'A4',3),
      lad(2700,'B1',4,{pier:1,after:3}),lad(3000,'B2',5,{pier:1}),lad(3300,'B3',6,{pier:1}),lad(3600,'B4',7,{pier:1}),
      {x:1400,dy:-110,g:'R1',cost:48000,build:60,lvl:6,kind:'remote',after:3},{x:1700,dy:-110,g:'R2',cost:90000,build:80,lvl:6,kind:'remote'},
      {x:2000,dy:-110,g:'R3',cost:180000,build:100,lvl:8,kind:'remote'},{x:2300,dy:-110,g:'R4',cost:300000,build:120,lvl:8,kind:'remote'}],
    shops:[[192,'A1'],[492,'A2'],[792,'A3'],[1092,'A4'],[2722,'B1',2],[3022,'B2',2],[3322,'B3',2],[3622,'B4',2]]},
  stagger:{name:'Staggered apron',plan:'l_stagger',lvl:3,pts:1,cost:40000,build:360,W:2870,
    from:'nose-in stands set at two depths, as at many regional airports',
    up:'Ten stands on bridges, with arrivals taxiing in between them.',down:'Back-row bridges are longer, so boarding starts later there.',
    stands:[160,440,720,1000,1280,1560,1840,2120,2400,2680].map((x,k)=>lad(x,(k<4?'A':'B')+(k<4?k+1:k-3),k,{dy:k%2?-110:0,pier:k>=4?1:0})),
    shops:[160,440,720,1000,1280,1560,1840,2120,2400,2680].map((x,k)=>[x+22,(k<4?'A':'B')+(k<4?k+1:k-3),k>=4?2:1])},
  curve:{name:'Curved front',plan:'l_curve',lvl:4,pts:2,cost:120000,build:480,W:2810,conc1:1650,walk:1.25,rep:0.3,hall:[1140,1640],
    from:'curved terminals such as Osaka Kansai, with a control tower in the middle',
    up:'Moving walkways along the curve: boarding starts sooner, fewer late passengers, and a rating bonus.',down:'No extra stands.',
    stands:[[160,-80,'A1'],[440,-40,'A2'],[720,-12,'A3'],[1000,0,'A4'],[1780,0,'B1'],[2060,-12,'B2'],[2340,-40,'B3'],[2620,-80,'B4']].map(([x,dy,g],k)=>lad(x,g,k,{dy,pier:k>=4?1:0})),
    shops:[[182,'A1'],[462,'A2'],[742,'A3'],[1022,'A4'],[1150,'Hall',1,1.2],[1273,'Hall',1,1.2],[1396,'Hall',1,1.2],[1519,'Hall',1,1.2],[1802,'B1',2],[2082,'B2',2],[2362,'B3',2],[2642,'B4',2]]},
  hall:{name:'Hall and finger pier',plan:'l_hall',lvl:5,pts:2,cost:300000,build:600,W:3370,conc1:1650,hall:[1140,1640],
    from:'the central hall and piers of Amsterdam Schiphol',
    up:'Ten stands, and shops gathered in a central hall where passengers spend most.',down:'Long walks to the far end of the pier.',
    stands:[160,440,720,1000,1780,2060,2340,2620,2900,3180].map((x,k)=>lad(x,(k<4?'A':'B')+(k<4?k+1:k-3),k,{pier:k>=4?1:0})),
    shops:[[182,'A1'],[462,'A2'],[742,'A3'],[1022,'A4'],[1150,'Hall',1,1.3],[1273,'Hall',1,1.3],[1396,'Hall',1,1.3],[1519,'Hall',1,1.3],
      ...[1780,2060,2340,2620,2900,3180].map((x,k)=>[x+22,'B'+(k+1),2])]},
  sat:{name:'Satellite',plan:'l_sat',lvl:7,pts:3,cost:1200000,build:960,W:4410,gap:[1232,1600],hall:[2740,3240],mover:1.8,upk:2500,
    from:'the satellites at London Stansted and Munich Terminal 2',p2:'Satellite',
    up:'Twelve stands, a built-in people mover, big duty-free and lounge space, and quicker transfers.',down:'Every walk to the satellite is long, and it costs the most to run after Starfish.',
    stands:[160,440,720,1000,1760,2040,2320,2600,3380,3660,3940,4220].map((x,k)=>lad(x,k<4?'A'+(k+1):'S'+(k-3),k,{pier:k>=4?1:0})),
    shops:[[182,'A1'],[462,'A2'],[742,'A3'],[1022,'A4'],...[1760,2040,2320,2600].map((x,k)=>[x+22,'S'+(k+1),2]),
      [2750,'Hall',2,1.2],[2873,'Hall',2,1.2],[2996,'Hall',2,1.2],[3119,'Hall',2,1.2],...[3380,3660,3940,4220].map((x,k)=>[x+22,'S'+(k+5),2])],
    shopBonus:{duty:1.3,lounge:1.3},xfer:1.5},
  star:{name:'Starfish',plan:'l_star',lvl:9,pts:3,cost:3000000,build:1440,W:4430,conc1:2150,hall:[1140,2140],walk:1.35,rep:0.5,upk:5000,
    from:'the star-shaped terminal at Beijing Daxing, built for short walks',p2:'East wing',
    up:'Twelve stands close to a star-shaped hall, the shortest walks for its size, the most shops and a rating bonus.',down:'The costliest to rebuild and to run.',
    stands:[[160,-100,'A1'],[440,-60,'A2'],[720,-25,'A3'],[1000,0,'A4'],[2280,0,'B1'],[2560,-20,'B2'],[2840,-40,'B3'],[3120,-60,'B4'],[3400,-75,'B5'],[3680,-90,'B6'],[3960,-100,'B7'],[4240,-110,'B8']].map(([x,dy,g],k)=>lad(x,g,k,{dy,pier:k>=4?1:0})),
    shops:[[182,'A1'],[462,'A2'],[742,'A3'],[1022,'A4'],...[0,1,2,3,4,5,6,7].map(k=>[1150+k*123,'Hall',1,1.3]),
      ...[2280,2560,2840,3120,3400,3680,3960,4240].map((x,k)=>[x+22,'B'+(k+1),2])]},
};
LAYOUTS.classic.cost=20000;LAYOUTS.classic.build=240;LAYOUTS.classic.up='Today\'s airport: eight stands on bridges in a straight line.';LAYOUTS.classic.down='Long walks to the far end of Pier B.';
let LAY=LAYOUTS.classic; // the current layout
const STAND_KIND=['bridge','bridge','bridge','bridge','bridge','bridge','bridge','bridge'],SHOP_PULL=[1,1,1,1,1,1,1,1]; // remote stands board by bus; hall units draw more shoppers
const p2name=()=>LAY.p2||'Pier B';
const fill=(a,v)=>{a.length=0;a.push(...v);return a};
function applyLayout(id){
  const L=LAYOUTS[id]||LAYOUTS.classic;
  LAY=L;W=L.W;fill(STAND_KIND,L.stands.map(s=>s.kind||'bridge'));fill(SHOP_PULL,L.shops.map(s=>s[3]||1));
  fill(STAND_X,L.stands.map(s=>s.x));fill(STAND_DY,L.stands.map(s=>s.dy||0));fill(GATES,L.stands.map(s=>s.g));
  fill(STAND,L.stands.map(s=>{const o={cost:s.cost,build:s.build,lvl:s.lvl};if(s.pier)o.pier=1;return o}));
  fill(SIDX,L.stands.map((s,i)=>i));fill(STAND_ORDER,L.order||SIDX);
  fill(STAND_AFTER,L.stands.map((s,i)=>s.after!=null?s.after:(o=>o>0?STAND_ORDER[o-1]:-1)(STAND_ORDER.indexOf(i))));
  fill(SHOP_X,L.shops.map(s=>s[0]));fill(SHOP_NAME,L.shops.map(s=>s[1]));fill(SHOP_PH,L.shops.map(s=>s[2]||1));
}

const busMul=i=>STAND_KIND[i]!=='remote'?1:R.fx.rain>G.clock||R.fx.snow>G.clock?1.4:2.2; // buses outpace walkers, less so in bad weather
const layoutOk=id=>id==='classic'||has('lay:'+id);
const layoutBuilding=()=>(G.builds||[]).find(b=>b.id.startsWith('layout:'));
// rebuilding: a construction project; the new layout opens at the first 03:00 after it's finished
function rebuildLayout(id){
  const L=LAYOUTS[id];if(!L||id===G.layout||G.layoutNext||layoutBuilding()||!layoutOk(id)||!canBuild()||!buy(L.cost))return false;
  startBuild('layout:'+id,'the '+L.name+' layout',L.build);return true;
}
function layoutReady(id){G.layoutNext=id;G.layoutAt=Math.floor((G.clock-180)/1440+1)*1440+180;
  toast(`The ${LAYOUTS[id].name} layout is ready. It opens at 03:00.`,null,null,'goal',8)}
// every game minute: switch once it's time and any stand the new layout drops has seen off its last flight
function layoutTick(){
  if(LAY.rep&&R.lastMin%1440===720)repAdj(LAY.rep,'layout');
  if(!G.layoutNext||G.clock<G.layoutAt)return;
  const n=LAYOUTS[G.layoutNext].stands.length;if(R.st.some((S,i)=>i>=n&&(S.F||S.out)))return;
  switchLayout(G.layoutNext);
}
const layoutDrains=i=>G.layoutNext&&i>=LAYOUTS[G.layoutNext].stands.length;
const AT_STAND=new Set(['gate','toGate','bridge','aisle','sitting','dAisle','dBridge']),IN_PLANE=new Set(['bridge','aisle','sitting','dAisle','dBridge']);
function switchLayout(id){
  const ox=STAND_X.slice(),ody=STAND_DY.slice(),old=STAND.slice(),from=LAY.name;
  G.layout=id;G.layoutNext=null;G.layoutAt=null;applyLayout(id);
  // stands and shop units the new layout doesn't have are sold at their resale value
  let refund=0;
  G.stands.forEach((st,i)=>{if(i>=STAND_X.length&&st.built){refund+=Math.round((old[i]?old[i].cost:0)*0.4);G.stands[i]={built:false,ac:null,method:'random',rear:false,route:'mixed'}}});
  G.shops.forEach((s,j)=>{if(s&&j>=SHOP_X.length){refund+=shopValue(s);G.shops[j]=null}});
  if(refund){G.cash+=refund;G.revBy.assets+=refund}
  // flights carry on: each plane, its passengers and its gate lounge move with the stand
  for(const i of SIDX){
    const dx=STAND_X[i]-ox[i],dy=STAND_DY[i]-(ody[i]||0),S=R.st[i];if(!dx&&!dy)continue;
    for(const p of R.pax)if(p.stand===i&&AT_STAND.has(p.state)){p.x+=dx;p.tx+=dx;if(IN_PLANE.has(p.state)){p.y+=dy;p.ty+=dy}}
    if(S.F){const F=S.F;F.geo=geom(F.ac,STAND_DY[i]);F.P=paths(i,F.geo);S.geo=F.geo;S.P=F.P;
      for(const br of S.bridge)for(const p of br)p.s=Math.min(p.s,(p.lane?F.P.rear:F.P.bridge).len)}
  }
  R.sel=Math.max(0,Math.min(R.sel,SIDX.length-1));
  toast(`The airport now has the ${LAY.name} layout${refund?`. ${money(refund)} back for what didn't fit`:''}.`,null,null,'goal',10);
  if(!R.sim){renderBoard();renderCam();renderPanel()}
}

// Airfield › Layout: every layout the player can rebuild into, as a small plan with what it gives and takes
function layoutPlan(L){
  const w=300,k=w/L.W,y=v=>Math.round((v+130)*0.16),sx=L.stands.map(s=>s.x*k);
  let g=`<svg class="lplan" viewBox="0 0 ${w} 96" role="img" aria-label="Plan of the ${L.name} layout">`;
  g+=`<rect x="0" y="${y(446)}" width="${(L.gap?L.gap[0]:L.W)*k}" height="${y(522)-y(446)}" fill="#2A3037"/>`;
  if(L.gap)g+=`<rect x="${L.gap[1]*k}" y="${y(446)}" width="${(L.W-L.gap[1])*k}" height="${y(522)-y(446)}" fill="#2A3037"/><line x1="${L.gap[0]*k}" x2="${L.gap[1]*k}" y1="${y(484)}" y2="${y(484)}" stroke="#5CC8FF" stroke-width="2"/>`;
  if(L.hall)g+=`<rect x="${L.hall[0]*k}" y="${y(360)}" width="${(L.hall[1]-L.hall[0])*k}" height="${y(522)-y(360)}" rx="3" fill="#3A4652"/>`;
  L.shops.forEach(s=>{g+=`<rect x="${s[0]*k}" y="${y(456)}" width="${118*k}" height="4" fill="#F5D08A" opacity=".8"/>`});
  L.stands.forEach((s,i)=>{const t=y(110+(s.dy||0)),b=y(380+(s.dy||0)),r=s.kind==='remote';
    g+=`<rect x="${sx[i]-5}" y="${t}" width="10" height="${b-t}" rx="4" fill="${r?'#7F8A94':'#CDD4DA'}"/>`;
    g+=r?`<line x1="${sx[i]}" x2="${sx[i]}" y1="${b}" y2="${y(446)}" stroke="#FFC72C" stroke-dasharray="2 2"/>`:`<line x1="${sx[i]-4}" x2="${sx[i]-4}" y1="${b-6}" y2="${y(446)}" stroke="#5A646E" stroke-width="2"/>`});
  return g+'</svg>';
}
function layoutPanel(){
  const ids=Object.keys(LAYOUTS).filter(id=>id===G.layout||id==='classic'||has('lay:'+id));
  const cur=LAY,building=layoutBuilding();
  let h=`<p class="note">A new layout is built while the airport keeps running, and opens at 03:00. Gates, shops, planes and upgrades move across; anything the new layout has no room for is sold.</p>`;
  if(G.layoutNext)h+=`<div class="report">The <b>${LAYOUTS[G.layoutNext].name}</b> layout opens at 03:00${R.st.some((S,i)=>layoutDrains(i)&&S.F)?', once its last flights have left the stands it drops':''}.</div>`;
  for(const id of [G.layout,...ids.filter(x=>x!==G.layout)]){
    const L=LAYOUTS[id],me=id===G.layout,bld=building&&building.id==='layout:'+id;
    const lost=me?0:G.stands.filter((s,i)=>s.built&&i>=L.stands.length).length,lostS=me?0:G.shops.filter((s,j)=>s&&j>=L.shops.length).length;
    const btn=me?'<button class="buy" disabled>Current</button>':G.layoutNext===id?'<button class="buy" disabled>Opens 03:00</button>':bld?'<button class="buy" disabled>Building</button>':
      (building||G.layoutNext)?'<button class="buy" disabled>Wait</button>':`<button class="buy" data-layout="${id}" data-cost="${L.cost}">${money(L.cost)}</button>`;
    const walk=L.walk?`walks ${Math.round((L.walk-1)*100)}% quicker`:L.mover?'people mover':'';
    h+=`<div class="stand laycard" id="layout-${id}"><div class="sh"><div><span class="gate">${me?'●':'○'}</span><span class="rt">${L.name}</span></div>${btn}</div>${layoutPlan(L)}
      <div class="rd">${L.stands.length} stands${L.stands.some(s=>s.kind==='remote')?` (${L.stands.filter(s=>s.kind==='remote').length} remote)`:''} · ${L.shops.length} shop units${walk?' · '+walk:''}${L.upk?` · ${money(L.upk)}/h to run`:''}${me?'':` · ${Math.round(buildMins(L.build)/60*10)/10} h to build`}</div>
      <div class="rd"><b>+</b> ${L.up}</div><div class="rd"><b>−</b> ${L.down}</div>${L.from?`<div class="rd">Inspired by ${L.from}.</div>`:''}
      ${bld?buildLine('layout:'+id):''}${lost||lostS?`<div class="rd warn">Sells ${[lost?`${lost} stand${lost>1?'s':''}`:'',lostS?`${lostS} shop${lostS>1?'s':''}`:''].filter(Boolean).join(' and ')} it has no room for.</div>`:''}</div>`;
  }
  return h;
}
function layoutClick(d,b){
  if(!d.layout)return false;
  const key='layout'+d.layout;
  if(!R.sim&&!(R.armKey===key&&Date.now()-R.armT<3000)){R.armKey=key;R.armT=Date.now();b.textContent='Tap to confirm';b.classList.add('arm');return true}
  R.armKey=null;if(rebuildLayout(d.layout)){renderPanel();save()}return true;
}
