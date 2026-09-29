/* ================= the terminal: halls in the order real airports use them, the same in every layout ================= */
// Departing passengers go forecourt, check-in hall, security hall, market place (airside), concourse. Arriving ones go
// concourse, immigration hall (airside), reclaim, customs, arrivals hall and out. Security lanes and passport desks stand in
// the wall between a landside hall and an airside one (SEC_LINE) and are the only way through it. The baggage hall between
// the two sides is for bags only. Halls are rooms like the airside ones (41-airside.js): passengers walk through doorways.
// Each part of the terminal lives in its own file (43-departures, 44-arrivals, 45-baggage, 46-market, 47-hotel) and plugs in here,
// so the parts can grow without treading on each other:
const PAX_STEP={},ARR_STEP={}; // state → (p,dt,D): moves a departing (PAX_STEP) or arriving (ARR_STEP) passenger each update
const TERM_SUBS=[['dep','Departures'],['arr','Arrivals'],['staff','Staff']]; // the Terminal tab's sub-tabs
const TERM_SECS={dep:['Check-in','Security'],arr:['Arrivals'],staff:['Concourse','Staff']}; // which upgrade sections each shows
const TERM_PANEL={}; // sub-tab → [() => html]: cards shown under a Terminal sub-tab's upgrades, or 'sales:shops' and 'sales:landside'
const TERM_CLICK=[],TERM_MINUTE=[],TERM_DAY=[],TERM_DRAW=[]; // (data, button) → true if handled; every game minute; every day; drawing, after the halls
// the parts' minute and day hooks run as one entry each in the clocks' MINUTE and DAY tables (02-clocks.js)
clock(MINUTE,'TERM_MINUTE',1,0,()=>{for(const f of TERM_MINUTE)f()});clock(DAY,'TERM_DAY',1,0,()=>{for(const f of TERM_DAY)f()});
const TERM_SPAWN=[],TERM_EXIT=[]; // (p) → true if it has placed a new departing passenger (a hotel guest), or sent an arriving one somewhere (the hotel)
const TERM_FIELDS=FIELDS; // saved field → () => its default, for new games and for older saves without it (03-state.js)
const SIMX={}; // functions the checks reach through window.__sim, added by each part
SIMX.FIELDS=FIELDS;SIMX.MIGRATIONS=MIGRATIONS; // saving (03-state.js, 22-save.js)
const RECT=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const BAG_HALL=[560,SEC_Y,700,LAND_B]; // x0, y0, x1, y1
// Each layout lists its own terminal, L.term: its halls, and its doorways and floor links. A hall may be on a floor, fl (0 the
// lower, arrivals; 1 the upper, departures); a room without one (the concourse, the forecourt, the hotel) is on both. A doorway
// joins rooms on one floor; a floor link (an escalator, a lift or stairs) joins two floors and is a doorway with two more items,
// [hall, hall, x, y, half-width, 'esc', 'lift' or 'stairs', people a minute]: passengers queue for it and ride it (66-floors.js).
// plain: [fl, x0, y0, x1, y1] floor inside the building that isn't a hall (no one walks it), drawn on that floor, and void: [x0,
// y0, x1, y1] an opening in the upper floor looking down (both drawn by 66-floors.js). The other layouts keep one floor, a copy
// of Classic's plan before it had two (flatTerm), until the floor plans part gives each its own.
const flatTerm=()=>({
  halls:[
    {id:'mkt',poly:RECT(8,SEC_Y,560,SEC_LINE),col:'#1E2429',name:'MARKET PLACE'},
    {id:'imm',poly:RECT(700,SEC_Y,1240,SEC_LINE),col:'#1B2127',name:'IMMIGRATION',sign:1},
    {id:'sec',poly:RECT(8,SEC_LINE,560,680),land:1,col:'#191D22',name:'SECURITY',sign:1},
    {id:'ci',poly:RECT(8,680,560,LAND_B),land:1,col:'#191D22',name:'CHECK-IN',sign:1},
    {id:'rec',poly:RECT(700,SEC_LINE,1240,700),land:1,col:'#191D22',name:'BAGGAGE RECLAIM',lab:[960,606,121]},
    {id:'cus',poly:RECT(700,700,1240,720),land:1,col:'#1A1F24',name:'CUSTOMS',sign:1},
    {id:'arh',poly:RECT(700,720,1240,LAND_B),land:1,col:'#191D22',name:'ARRIVALS'},
    {id:'wlk',poly:RECT(1240,738,1262,752),land:1,need:'hotel',col:'#232A31'},
    {id:'hot',poly:RECT(1262,690,1472,LAND_B),land:1,need:'hotel',col:'#232A31',name:'HOTEL',sign:1},
    {id:'out',poly:RECT(0,LAND_B,1480,Y1),land:1,open:1} // the forecourt, stops, station and car park: drawn by drawLandside
  ],
  // lab: [x, y, widest] where the hall's name goes, if not its top left corner (reclaim's: past the passport desks and e-gates)
  // [hall, hall, x, y, half-width]: the concourse opens wide onto the market place; check-in and security are one space with
  // a barrier; arriving passengers leave the concourse by one door, and the arrivals hall has doors to the forecourt and hotel
  doors:[['main','mkt',284,SEC_Y,250],['main','imm',1212,SEC_Y,22],['ci','sec',284,680,262],['ci','out',150,LAND_B,34],
    ['rec','cus',970,700,70],['cus','arh',970,720,70],['arh','out',970,LAND_B,46],['arh','wlk',1240,745,7],['wlk','hot',1262,745,7],['hot','out',1367,LAND_B,26]]});
// Classic on two floors: departures upstairs (check-in, security, the market place and the gate lounges on the concourse),
// arrivals below (immigration, reclaim, customs, the arrivals hall, the hotel walkway, and the baggage hall under check-in).
// Every hall stays where it was, so walks barely change: arriving passengers leave the concourse by their old door onto a
// gallery over immigration (acr) and ride the escalator down, families and those who need help by the lift
const classicTerm=()=>{const T=flatTerm(),fl={mkt:1,sec:1,ci:1,imm:0,rec:0,cus:0,arh:0,wlk:0};
  for(const h of T.halls)if(fl[h.id]!=null)h.fl=fl[h.id];
  T.halls.push({id:'acr',poly:RECT(700,SEC_Y,1240,SEC_LINE),fl:1,col:'#1B2127',name:'TO ARRIVALS'});
  T.doors[1]=['main','acr',1212,SEC_Y,22];
  T.doors.push(['acr','imm',1200,550,10,'esc',40],['acr','imm',1228,584,6,'lift',8]);
  T.plain=[[1,560,SEC_Y,700,SEC_LINE],[1,560,SEC_LINE,1240,LAND_B],[0,8,SEC_Y,560,LAND_B]];T.void=[770,612,1170,690];
  return T};
for(const L of Object.values(LAYOUTS))L.term=flatTerm();
LAYOUTS.classic.term=classicTerm();
const isFloorLink=d=>d[5]==='esc'||d[5]==='lift'||d[5]==='stairs';
const onFl=(fl,f)=>(f.fl=fl,f); // a TERM_DRAW entry drawn only on floor fl (0 or 1; every floor without it)
let ROOM_DOORS=[]; // the layout's doorways and its terminal's (floor links too), as buildRooms saw them
const roomOn=r=>!(r.ph===2&&!G.pierB)&&!(r.need&&!G.lv[r.need]); // halls that exist yet: second-phase rooms need Pier B, the hotel needs a hotel
const hallId=id=>ROOM_ID[id];
// where each part of the terminal is, for checks and the next steps to build on: desks, kiosks and bag belts in the check-in
// hall; lanes in the security wall; passport desks and e-gates in the immigration wall; carousels in reclaim
function terminalFaults(){
  const bad=[],inH=(id,x,y)=>inPoly(ROOMS[ROOM_ID[id]].poly,x,y),onWall=(a,b,x,y)=>edgeDist(ROOMS[ROOM_ID[a]].poly,x,y)<=3&&edgeDist(ROOMS[ROOM_ID[b]].poly,x,y)<=3;
  for(let i=0;i<8;i++){if(!inH('ci',deskX(i),707))bad.push(`check-in desk ${i+1} isn't in the check-in hall`);if(!onWall('sec','mkt',laneX(i),SEC_LINE))bad.push(`security lane ${i+1} isn't in the security wall`);
    const b=boothPos(i),e=egatePos(i);if(!onWall('imm','rec',b.x,b.y))bad.push(`passport desk ${i+1} isn't in the immigration wall`);if(!onWall('imm','rec',e.x,e.y))bad.push(`e-gate ${i+1} isn't in the immigration wall`);
    if(!inH('rec',carX(i)-40,carY(i))||!inH('rec',carX(i)+40,carY(i)))bad.push(`carousel ${i+1} isn't in the reclaim hall`)}
  for(let i=0;i<4;i++)if(!inH('ci',kioskX(i),707))bad.push(`kiosk ${i+1} isn't in the check-in hall`);
  if(!onWall('sec','mkt',FT_X,SEC_LINE))bad.push('the fast track lane isn’t in the security wall');
  for(const [id,f,n] of [['ci',ciSlot,170],['sec',secSlot,90],['imm',arrSlot,172]])for(let i=0;i<n;i+=3){const s=f(i);if(!inH(id,s.x,s.y)){bad.push(`the ${ROOMS[ROOM_ID[id]].name.toLowerCase()} queue leaves its hall`);break}}
  for(let i=0;i<8;i++){const s=ftSlot(i);if(!inH('sec',s.x,s.y)){bad.push('the fast track queue leaves the security hall');break}}
  if(!inH('imm',ARR_DOOR.x,ARR_DOOR.y))bad.push('arriving passengers don’t join the queue in the immigration hall');
  if(!inH('ci',DOOR.x,DOOR.y))bad.push('departing passengers don’t come in to the check-in hall');
  return bad;
}
// the halls' furniture that isn't a counter, desk or lane: the baggage hall, bag belts and each hall's name
function drawTerminalHalls(D){
  const [bx0,by0,bx1,by1]=BAG_HALL;
  if(onFloor(0)){ctx.fillStyle='#15191D';ctx.fillRect(bx0,by0,bx1-bx0,by1-by0); // the baggage hall is downstairs
    ctx.strokeStyle='#4E5964';ctx.lineWidth=3;ctx.strokeRect(bx0,by0,bx1-bx0,by1-by0);
    ctx.fillStyle='#2A3037';for(const y of [630,672]){ctx.fillRect(bx1,y-2,20,4)} // belts out to the carousels
    ctx.strokeStyle='#39414A';ctx.lineWidth=5;ctx.setLineDash([4,3]);ctx.beginPath();ctx.ellipse((bx0+bx1)/2,640,44,26,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    hallText('BAGGAGE HALL',(bx0+bx1)/2,540,'#56606A',8.5,'center',bx1-bx0-12)}
  if(onFloor(1)){ctx.fillStyle='#2A3037';ctx.fillRect(16,684,bx0-16,4)} // the belt behind the check-in desks, down to the baggage hall
  for(const r of LAY.term.halls)if(r.name&&!r.sign&&roomOn(r)&&onFloor(r.fl)){const [lx,ly]=hallLabel(r.id);hallText(r.name,lx,ly,'#56606A',8.5,'left',r.lab?r.lab[2]:hallW(r)-16)}
}
// A label inside the terminal, kept readable on a small screen: drawn at least about 9 screen pixels high where there's
// room (up to 2.4 times its size, and no wider than w), its top staying where it was, so zoomed in it's as before
const labelSize=(t,size,w)=>Math.max(size,Math.min(size*2.4,9/(V.k||1),w?w/(t.length*0.62):Infinity));
function hallText(t,x,y,col,size,align,w){const s=labelSize(t,size,w);mono(t,x,y+0.75*(s-size),col,s,align);return s}
const hallW=r=>{let a=1e9,b=-1e9;for(const [x] of r.poly){a=Math.min(a,x);b=Math.max(b,x)}return b-a};

// Under a solid roof (roofA() 1) nothing inside a hall is drawn: the roof covers the built rooms, so only the outline of rooms
// not built yet (drawRooms) and the forecourt's kerb. What stands outside the halls (the taxi rank, the hotel's tower) draws
// itself on the terminal layer, and the parts' TERM_DRAW only when the halls show.
function drawTerminal(D){
  drawRooms();if(roofA()){ctx.fillStyle='#101316';ctx.fillRect(0,LAND_B+2,W,H-LAND_B-2);return}
  drawTerminalHalls(D);
  const ciW=R.ciQ.length*D.checkin/(D.desks+D.kiosks*0.6),seW=R.secQ.length*D.sec/D.lanes,tint=w=>w>15?'rgba(255,122,138,.11)':w>8?'rgba(255,199,44,.07)':null;
  let tc=onFloor(1)&&tint(ciW);if(tc){ctx.fillStyle=tc;ctx.fillRect(8,680,552,LAND_B-680)}
  tc=onFloor(1)&&tint(seW);if(tc){ctx.fillStyle=tc;ctx.fillRect(8,SEC_LINE,552,80)}
  tc=onFloor(0)&&tint(R.arrQ.length*D.passT/(D.officers+D.egates*1.6));if(tc){ctx.fillStyle=tc;ctx.fillRect(700,SEC_Y,540,SEC_LINE-SEC_Y)}
  ctx.fillStyle='#101316';ctx.fillRect(0,LAND_B+2,W,H-LAND_B-2);
  for(const b of [1,0]){ctx.fillStyle=b?'#252C33':'#1F242A';ctx.beginPath(); // each gate lounge's seats, built stands' and the rest in one path each
    for(const i of SIDX){if(!standOpen(i)||!G.stands[i].built!==!b)continue;for(let j=0;j<80;j++){const s=spotPos(i,j);ctx.rect(s.x-3,s.y-3,6,6)}}ctx.fill()}
  if(G.lv.mover&&G.pierB&&LAY.track){ctx.strokeStyle='#2A3037';ctx.lineWidth=3;ctx.beginPath();LAY.track.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()} // its cars: drawPax
  // bags on the belt behind the check-in desks (check-in and security draw themselves: 43-departures.js)
  if(onFloor(1)){ctx.fillStyle='#D9A066';for(const b of R.belt)ctx.fillRect(b.x-2,684.5,4,4)}
  ctx.fillStyle='#FFC72C';for(const i of SIDX)if(G.stands[i].built){const F=R.st[i].F;
    const bg=busGate(i);if(bg){ctx.fillRect(bg[0]-2.5,bg[1]+bg[2]*4-2.5,5,5)}
    else{faceW(i,-118,FACE_Y-6);ctx.fillRect(WP.x-2.5,WP.y-2.5,5,5);if(F&&F.rear){faceW(i,-150,FACE_Y-6);ctx.fillRect(WP.x-2.5,WP.y-2.5,5,5)}}}
  for(const f of TERM_DRAW)if(onFloor(f.fl))f(D);
}
// FIZZCO banners along the terminal's apron wall while advertising is on (Office › Policies): with the halls, or over the roof
function drawAds(){if(!pol('ads'))return;ctx.fillStyle='#E5484D';for(let x=60;x<W-100;x+=560){ctx.fillRect(x,TERM_Y-3,220,10);ctx.font='800 9px "Saira Condensed",sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('FIZZCO · FIZZCO · FIZZCO',x+110,TERM_Y+2.5);ctx.fillStyle='#E5484D'}}
// each queue's length and wait, signed in its hall; the doors in and out on the forecourt
function drawQueueSigns(D){
  const ciWait=R.ciQ.length*D.checkin/(D.desks+D.kiosks*0.6),secWait=R.secQ.length*D.sec/D.lanes;
  sign(190,LAND_B+6,'ENTRANCE ↑');sign(946,LAND_B+6,'EXIT ↓');
  let w=sign(16,LAND_B+6,'CHECK-IN');mono(`${R.ciQ.length} · ~${Math.round(ciWait)} min`,16+w+5,LAND_B+15,ciWait>12?'#FF7A8A':'#909AA4',9);
  const rf=roofA(); // the halls' own signs: on their floor, and both over the roof
  if(rf||onFloor(1)){w=sign(16,SEC_LINE+4,'SECURITY');mono(`${R.secQ.length+R.ftQ.length} · ~${Math.round(secWait)} min`,16+w+5,SEC_LINE+13,secWait>12?'#FF7A8A':'#909AA4',9)}
  if(rf||onFloor(0)){const arW=R.arrQ.length*D.passT/(D.officers+D.egates*1.6);w=sign(708,SEC_Y+4,'PASSPORTS');mono(`${R.arrQ.length} waiting · ~${Math.round(arW)} min`,708+w+5,SEC_Y+13,arW>12?'#FF7A8A':'#909AA4',9)}
}
// the layout's escalator tubes and tent roof (drawn by the roof itself when it's on) and its links: 40-layout-drawing.js. A
// link's stations are the one thing left under the roof: its track and trains run out across the apron
LAYER.terminal.push(V=>drawTerminal(V.D),()=>{if(!roofA())drawPlanOver()},drawLinks,()=>{if(!roofA())drawAds()});
LAYER.signs.push(V=>drawQueueSigns(V.D),()=>{if(roofA())drawAds()});
