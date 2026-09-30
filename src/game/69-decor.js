/* ================= DECOR: planters, benches, art and boards that come with the building, and local names ================= */
// Every hall of the terminal gets planters, benches and art, and the check-in hall, the market place and the arrivals hall a
// grand departures (or arrivals) board (docs/systems/decor.md, spec
// docs/specs/terminal-place.md), worked out from the layout's rooms (LAY.term), what's built (roomOn) and the level: more
// with each level, and a hall's decor arrives with the hall. Placed along the walls, never on a queue slot, counter, lane,
// doorway, floor link or the walk between two doorways (decObst). The roof terrace adds planters and benches on its public
// side and a name over its café, beside what 67-terrace.js draws. Some shop units, the terrace café and the art take
// their names and colours from the region's places (PLACES), picked with a hash of the unit's index, never rnd().
// The player places nothing, nothing is saved and the rating never sees it: drawing only, cached per layout, level and
// what's built, and nothing reachable from update().
const DEC_PLACES=['city','mill','docks','castle','ashby','east','fell','brook'];
const DEC_COL={city:'#5CC8FF',mill:'#6BE39A',docks:'#2BB3A3',castle:'#E8B04A',ashby:'#FF9F43',east:'#C39BFF',fell:'#8FD16B',brook:'#FF7AB6'};
// [long side, depth, inset from the wall]; a board and a mural sit on the wall, planters and benches just off it
const DEC_SIZE={planter:[6,6,2],bench:[14,4,2],art:[36,5,1],board:[34,5,1]};
const DEC_SEQ=['planter','bench','art','planter','bench','planter','art','bench'],DEC_MAX=24;
const decHash=i=>{let h=Math.imul((i|0)+0x9E37,0x85EBCA6B)>>>0;h=Math.imul(h^(h>>>13),0xC2B2AE35)>>>0;return (h^(h>>>16))>>>0};
const decPlace=i=>DEC_PLACES[decHash(i)%DEC_PLACES.length];
let DEC=null,DEC_NAMES=null; // {key, all: each hall's full list} and the local names, worked out again when the key changes

// what decor keeps clear of: every counter, queue slot and doorway as [x, y, r]; the walk between any two doorways of a
// hall, and from its doorways to the desks people walk to, as segments; the halls' furniture and labels as boxes
function decObst(){
  // The counters and queues come from their own functions, so they follow a plan that moves them; the furniture boxes
  // and walk goals below are where 43-47 draw them today (Classic's plan, which every layout shares until the floor plans
  // part), kept on every floor, which only keeps decor further away
  const pts=[],P=(x,y,r)=>pts.push([x,y,r]),segs=[],rects=[],hs=new Set(LAY.term.halls.map(h=>h.id));
  const dY=i=>typeof deskY==='function'?deskY(i):707,lY=i=>typeof laneY==='function'?laneY(i):SEC_LINE,kY=i=>typeof kioskY==='function'?kioskY(i):707; // Classic's, until a plan moves them
  for(let i=0;i<8;i++){P(deskX(i),dY(i),10);P(laneX(i),lY(i),10);const b=boothPos(i),e=egatePos(i);P(b.x,b.y,8);P(e.x,e.y,8)}
  for(let k=0;k<8;k++){const c=CAR_POS(k);for(const d of [-40,0,40])P(c.x+d,c.y,14)} // every carousel, whichever a flight uses
  for(let i=0;i<4;i++)P(kioskX(i),kY(i),8);
  for(let q=0;q<6;q++)for(let j=0;j<40;j++){const s=qSlot(q,j);if(s)P(s.x,s.y,4)}
  for(const [f,n] of [[secSlot,90],[ftSlot,8],[egSlot,78],[arrSlot,172],[famSlot,55],[srchSlot,20]])for(let i=0;i<n;i++){const s=f(i);P(s.x,s.y,4)}
  for(let k=0;k<MEET_MAX;k++){const m=meetSpot(k);P(m.x,m.y,4)}
  for(const d of ROOM_DOORS)P(d[2],d[3],(d[4]||8)+4);
  const goals={arh:[[746,757],[1213,738],[TAXI.x,TAXI.y]],hot:[[1312,708],[1404,748],[1452,700]],ci:[[150,690],[kioskX(0),694]]};
  for(const r of ROOMS){if(!hs.has(r.id)||r.open)continue;const ds=ROOM_DOORS.filter(d=>d[0]===r.id||d[1]===r.id);
    for(let a=0;a<ds.length;a++){for(let b=a+1;b<ds.length;b++)segs.push([ds[a][2],ds[a][3],ds[b][2],ds[b][3]]);for(const [x,y] of goals[r.id]||[])segs.push([ds[a][2],ds[a][3],x,y])}}
  if(ROOM_ID.mkt!=null){const M=mktPlan(),sp=a=>{for(const [x,y] of a)rects.push([x-6,y-6,x+6,y+6])};sp(M.window);sp(M.tables);sp(M.food);sp(M.playB);sp(M.wc);sp(M.charge);sp(M.seats);
    rects.push(M.playR,M.wcR,M.chargeR,M.df,...M.stand)}
  rects.push([16,680,560,690],[20,688,200,702],[100,668,170,680],[488,604,548,640],[16,602,130,618],[700,522,910,540],[40,740,200,752], // the belt, kiosks and bag drop, the pass gates, search, the signs, kiosk and drop labels
    [DOM_X-16,SEC_LINE-4,DOM_X+16,SEC_LINE+14],[840,SEC_LINE,960,SEC_LINE+14],[896,700,1104,720],[944,720,996,756],[712,746,782,768],[1200,728,1224,744], // domestic, e-gates, customs, the barrier, car hire, the hotel desk
    [1280,694,1344,710],[1376,732,1432,764],[1436,690,1468,716]); // the hotel's reception, sofas and lifts
  for(const r of LAY.term.halls)if(r.name){const L=hallLabel(r.id);if(L)rects.push([L[0]-2,L[1]-12,L[0]+(r.lab?r.lab[2]:Math.min(hallW(r)-16,r.name.length*6+10)),L[1]+4])}
  return {pts,segs,rects};
}
// a hall's decor in the order it arrives: first a board where one fits (the departures board where passengers start and
// wait, the arrivals board by the way out), then the sequence round the walls at spread-out points (the golden ratio)
function decHall(r,k,O,taken){
  const out=[],P=r.poly,[bx0,by0,bx1,by1]=decBox(P),m=24;
  const pts=O.pts.filter(([x,y,q])=>x+q>bx0-m&&x-q<bx1+m&&y+q>by0-m&&y-q<by1+m),segs=O.segs.filter(([a,b,c,d])=>Math.max(a,c)>bx0-m&&Math.min(a,c)<bx1+m&&Math.max(b,d)>by0-m&&Math.min(b,d)<by1+m),rects=O.rects.filter(q=>q[2]>bx0&&q[0]<bx1&&q[3]>by0&&q[1]<by1);
  const edges=[];let per=0;P.forEach(([x1,y1],j)=>{const [x2,y2]=P[(j+1)%P.length],l=Math.hypot(x2-x1,y2-y1);if(l>=8){edges.push([x1,y1,x2,y2,l,per]);per+=l}});if(!per)return out;
  const cx=P.reduce((a,p)=>a+p[0],0)/P.length,cy=P.reduce((a,p)=>a+p[1],0)/P.length;
  const clear=b=>{const [x0,y0,x1,y1]=b;
    for(const [x,y] of [[x0,y0],[x1,y0],[x1,y1],[x0,y1]])if(!inPoly(P,x+(x<cx?0.5:-0.5),y+(y<cy?0.5:-0.5)))return false;
    for(const [x,y,q] of pts)if(x+q+3>x0&&x-q-3<x1&&y+q+3>y0&&y-q-3<y1)return false;
    for(const q of rects)if(q[2]+2>x0&&q[0]-2<x1&&q[3]+2>y0&&q[1]-2<y1)return false;
    for(const d of taken)if((d.fl==null||r.fl==null||d.fl===r.fl)&&d.x1+5>x0&&d.x0-5<x1&&d.y1+5>y0&&d.y0-5<y1)return false;
    for(const [a,c,e,f] of segs){const n=Math.max(1,Math.ceil(Math.hypot(e-a,f-c)/4));for(let s=0;s<=n;s++){const x=a+(e-a)*s/n,y=c+(f-c)*s/n;if(x>x0-11&&x<x1+11&&y>y0-11&&y<y1+11)return false}}
    return true};
  // the box of kind at distance s round the walls, or null if it doesn't fit there
  const at=(kind,s)=>{const e=edges.find(g=>s>=g[5]&&s<g[5]+g[4]),[L,D,ins]=DEC_SIZE[kind],[x1,y1,x2,y2,l,s0]=e,u=(s-s0)/l;
    let nx=(y2-y1)/l,ny=-(x2-x1)/l;const mx=x1+(x2-x1)*u,my=y1+(y2-y1)*u;if((cx-mx)*nx+(cy-my)*ny<0){nx=-nx;ny=-ny}
    const along=Math.abs(x2-x1)>=Math.abs(y2-y1),w=along?L:D,h=along?D:L,px=mx+nx*(ins+D/2),py=my+ny*(ins+D/2),b=[px-w/2,py-h/2,px+w/2,py+h/2];
    return clear(b)?{hall:r.id,kind,x0:b[0],y0:b[1],x1:b[2],y1:b[3],fl:r.fl,v:!along,nx,ny}:null};
  const place=(kind,from)=>{for(let j=0;j<160;j++){const d=at(kind,((from+j*0.6180339887)%1)*per);if(d){out.push(d);taken.push(d);return d}}return null};
  if(['ci','mkt','arh'].includes(r.id))place('board',0.5);
  for(let j=0,miss=0;out.length<DEC_MAX&&miss<DEC_SEQ.length;j++){if(place(DEC_SEQ[j%DEC_SEQ.length],(j*0.382+k*0.1)%1))miss=0;else miss++}
  return out;
}
const decBox=P=>{let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const [x,y] of P){a=Math.min(a,x);b=Math.min(b,y);c=Math.max(c,x);d=Math.max(d,y)}return [a,b,c,d]};
// the terrace's own, on its public side and at the passengers' ends: planters and two benches, clear of where people stand
function decTerrace(){
  const h=terHall();if(!h||!terBuilt())return [];const [x0,y0]=h.poly[0],[x1]=h.poly[2],P=h.pub,it=(kind,a,b,c,d)=>({hall:'ter',kind,x0:a,y0:b,x1:c,y1:d,fl:2});
  return [it('planter',x0+2,y0+20,x0+7,y0+25),it('planter',x1-7,y0+12,x1-2,y0+17),it('planter',P[0]+2,P[1]+22,P[0]+7,P[1]+27),it('planter',P[0]+2,P[3]-12,P[0]+7,P[3]-7),
    it('bench',P[0]+30,P[1]+26,P[0]+54,P[1]+30),it('bench',P[0]+64,P[1]+26,P[0]+88,P[1]+30)];
}
// how much of each hall's list shows at this level: 30% at level 1, all of it at level 9
const decShare=()=>Math.min(1,0.3+0.7*(Math.max(1,G.level|0)-1)/8);
// the decor for the layout as built and the level: [{hall, kind, x0, y0, x1, y1, fl, …}]
function decor(){
  if(!ROOMS||!LAY.term)return [];const on=ROOMS.map(r=>roomOn(r)?1:0).join(''),key=on+'|'+G.level+'|'+terBuilt();
  if(DEC&&DEC.rs===ROOMS&&DEC.lay===LAY&&DEC.key===key)return DEC.list;
  if(!DEC||DEC.rs!==ROOMS||DEC.lay!==LAY||DEC.on!==on){const O=decObst(),taken=[],all=[];
    LAY.term.halls.forEach((h,k)=>{const r=ROOMS[ROOM_ID[h.id]];if(!r||r.open||r.fl===2||!roomOn(r))return;const [a,b,c,d]=decBox(r.poly);if(Math.min(c-a,d-b)<30)return; // not a corridor (customs, the hotel walkway)
      all.push(decHall(r,k,O,taken))});
    let a=0;for(const L of all)for(const d of L)if(d.kind==='art')d.place=decPlace(a++); // each mural a place of the region's
    DEC={rs:ROOMS,lay:LAY,on,all}}
  const f=decShare(),list=[];for(const L of DEC.all){const n=Math.min(L.length,Math.max(1,Math.round(L.length*f)));for(let j=0;j<n;j++)list.push(L[j])}
  list.push(...decTerrace());DEC.key=key;DEC.list=list;DEC_NAMES=null;return list;
}
// the names a food or book shop takes from a place, kept short enough for the unit's front
const DEC_SHOP={coffee:n=>n+' Café',cafe:n=>n+' Deli',bar:n=>n+' Tap',dining:n=>n+' Inn',books:n=>n+' News'};
// Which units take one, and which place, worked out for every unit at once in the units' order: a unit's own hash picks
// the first place to try, and it takes the first from there that no unit before it has and whose name has at most 13
// characters (spaces too), so the level and the count still fit beside it (the first that fits if every place is taken)
let DEC_SHOPS=null;
function decShopPlace(j){
  const sig=G.shops.map(s=>s?s.type:'').join();if(DEC_SHOPS&&DEC_SHOPS.sig===sig)return DEC_SHOPS.pl[j];
  const pl=[],used=new Set();G.shops.forEach((s,i)=>{const t=s&&SHOPS[s.type];pl[i]=null;if(!t||!DEC_SHOP[t.id]||decHash(i*31+7)%3===0)return;
    const h=decHash(i*5+3),fit=DEC_PLACES.map((_,k)=>DEC_PLACES[(h+k)%DEC_PLACES.length]).filter(q=>DEC_SHOP[t.id](PLACES[q].name).length<=13);
    pl[i]=fit.find(q=>!used.has(q))||fit[0]||null;if(pl[i])used.add(pl[i])});
  DEC_SHOPS={sig,pl};return pl[j];
}
// the look a shop unit is drawn with (46-market.js): its type's, or a local name and colour
const SHOP_LOOK=[];
function shopLook(j,t){const pl=decShopPlace(j);if(!pl)return t;const c=SHOP_LOOK[j];if(c&&c.t===t&&c.pl===pl)return c.look;
  const look=Object.assign({},t,{name:DEC_SHOP[t.id](PLACES[pl].name),col:DEC_COL[pl]});SHOP_LOOK[j]={t,pl,look};return look}
const terCafeName=()=>PLACES[decPlace(41)].name+' Coffee';
// the local signs: [{text, place, hall, w}], w the text's width in world units as drawn
function localNames(){
  const ds=decor();if(DEC_NAMES&&DEC_NAMES.G===G&&DEC_NAMES.sh===JSON.stringify(G.shops))return DEC_NAMES.list;const list=[],cw=(t,s)=>t.length*s*0.62;
  for(let j=0;j<SHOP_X.length;j++){if(!shopOpen(j))continue;const pl=decShopPlace(j);if(!pl)continue;const P=shopPt(j,59,20),r=ROOMS.find(q=>!q.open&&inPoly(q.poly,P.x,P.y));
    const text=DEC_SHOP[SHOPS[G.shops[j].type].id](PLACES[pl].name);if(r)list.push({text,place:pl,hall:r.id,w:cw(text,8)})}
  for(const d of ds)if(d.kind==='art'){const text=PLACES[d.place].name+' mural';list.push({text,place:d.place,hall:d.hall,w:cw(text,3.6)})}
  if(terBuilt())list.push({text:terCafeName(),place:decPlace(41),hall:'ter',w:cw(terCafeName(),4.8)});
  DEC_NAMES={G,sh:JSON.stringify(G.shops),list};return list;
}

/* ---------- drawing: with the halls (never under the roof), and on the terrace on the Roof stop ---------- */
const DEC_PLANT='#4F8A5B',DEC_LEAF='#6BA86F',DEC_POT='#3A424B',DEC_WOOD='#4A4131';
function drawDecor(D){
  const ds=decor();if(!ds.length)return;const k=V.k,far=k<0.35,sq=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  if(k>=2.2){ctx.font='500 3.6px "IBM Plex Mono",monospace';ctx.textAlign='center';ctx.textBaseline='middle'} // the murals' captions, set once a frame
  for(const d of ds){if(d.hall==='ter'||!onFloor(d.fl)||d.x1<V.x0||d.x0>V.x1||d.y1<V.y0||d.y0>V.y1)continue;const w=d.x1-d.x0,h=d.y1-d.y0;
    if(far){sq(d.x0,d.y0,w,h,d.kind==='planter'?DEC_PLANT:d.kind==='bench'?DEC_WOOD:d.kind==='art'?DEC_COL[d.place]:'#2A3037');continue}
    decItem(d,w,h,k,sq)}
  if(k>=2.2){ctx.textAlign='left';ctx.textBaseline='alphabetic'}
}
function decItem(d,w,h,k,sq){
  const cx=(d.x0+d.x1)/2,cy=(d.y0+d.y1)/2;
  if(d.kind==='planter'){sq(d.x0,d.y0,w,h,DEC_POT);ctx.fillStyle=DEC_PLANT;ctx.beginPath();ctx.arc(cx,cy,w*0.42,0,Math.PI*2);ctx.fill();if(k>=0.8){ctx.fillStyle=DEC_LEAF;ctx.beginPath();ctx.arc(cx-w*0.12,cy-h*0.12,w*0.2,0,Math.PI*2);ctx.fill()}}
  else if(d.kind==='bench'){sq(d.x0,d.y0,w,h,DEC_WOOD);if(k>=0.8){ctx.fillStyle='#5E5240';if(d.v)for(let y=d.y0+2;y<d.y1-1;y+=4)ctx.fillRect(d.x0+0.6,y,w-1.2,1);else for(let x=d.x0+2;x<d.x1-1;x+=4)ctx.fillRect(x,d.y0+0.6,1,h-1.2)}}
  else if(d.kind==='board'){sq(d.x0,d.y0,w,h,'#101316');if(k>=0.5){ctx.fillStyle='#FFC72C';const n=Math.floor((d.v?h:w)/5);
    for(let j=0;j<n;j++){const u=2.5+j*5;if(d.v)ctx.fillRect(d.x0+1,d.y0+u-0.5,w-2,1);else ctx.fillRect(d.x0+u-0.5,d.y0+1,1,h-2)}}}
  else if(d.kind==='art'){const c=DEC_COL[d.place];sq(d.x0,d.y0,w,h,'#1B1F24');ctx.fillStyle=c;
    if(d.v){ctx.fillRect(d.x0+0.8,d.y0+1,w-1.6,h*0.3);ctx.fillRect(d.x0+0.8,d.y0+h*0.65,w-1.6,h*0.33)}else{ctx.fillRect(d.x0+1,d.y0+0.8,w*0.3,h-1.6);ctx.fillRect(d.x0+w*0.65,d.y0+0.8,w*0.33,h-1.6)}
    if(k>=2.2){const t=PLACES[d.place].name;ctx.fillStyle='#ECE8DF';if(d.v){ctx.save();ctx.translate(cx,cy);ctx.rotate(-Math.PI/2);ctx.fillText(t,0,0.2);ctx.restore()}else ctx.fillText(t,cx,cy+0.2)}}
}
TERM_DRAW.push(drawDecor);
// on the Roof stop, after the terrace (67-terrace.js): its planters and public benches, and its café's name over the kiosk
LAYER.roofs.push(V=>{
  if(!roofA()||!terBuilt()||V.k<0.25)return;const B=terraceBox();if(B[2]<V.x0||B[0]>V.x1||B[3]<V.y0||B[1]>V.y1)return;
  const sq=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};for(const d of decTerrace())decItem(d,d.x1-d.x0,d.y1-d.y0,V.k,sq);
  if(V.k>=0.6){const h=terHall(),[x1,y1]=h.poly[2],t=terCafeName(),w=t.length*4.8*0.62+6;sq(x1-4-w,y1-36,w,7,'#2F6B5E');mono(t,x1-4-w/2,y1-30.6,'#F5D08A',4.8,'center')}
});
Object.assign(SIMX,{decor,localNames,shopLook,boothPos,egatePos,carX,carY,arrSlot}); // for the decor check (tools/checks/decor.mjs)
