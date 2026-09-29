/* ================= the airport hotel ================= */
// Beside the arrivals hall, its lobby (the 'hot' hall) joined to it by a walkway ('wlk'); both exist once there's a hotel.
// Rooms come in blocks of 40 per level. Each guest takes a room until they check out (G.hotelStays: [kind, until]):
// late arrivals, early flyers who stay the night before, long connections, conference delegates, your crews resting,
// and passengers stranded when fog or a storm holds their flight late at night. The book for tonight (noon to noon)
// counts guests by kind and the takings (G.hotelBook). Rooms are cheap, standard or premium (G.hotelPrice); the duty
// manager picks whichever earned most.
const HOTEL_BLOCK=40,HOTEL_REST=540; // rooms per level; a crew rests 9 h at the hotel instead of 12
const HOTEL_KINDS=[['late','Late arrivals'],['early','Early flights'],['xfer','Connecting'],['conf','Delegates'],['crew','Crews'],['strand','Stranded']];
const HP_NAME=['Cheap','Standard','Premium'],HP_RATE=[0.75,1,1.35],HP_DEM=[1.35,1,0.6]; // price, and how many book at it
TERM_FIELDS.hotelPrice=()=>1;
TERM_FIELDS.hotelStays=()=>[];
TERM_FIELDS.hotelBook=()=>hotelNewBook(null);
UPG.hotel.fx=(l,m)=>m?`<b>${l*HOTEL_BLOCK}</b> rooms`:`<b>${l*HOTEL_BLOCK}</b> → <b>${(l+1)*HOTEL_BLOCK}</b> rooms`;
const hotelRooms=()=>HOTEL_BLOCK*(G.lv.hotel||0);
const hotelNight=()=>Math.floor((G.clock-720)/1440); // a night runs from noon to noon
const roomRate=k=>Math.round((20+20*G.level)*HP_RATE[k??G.hotelPrice]);
function hotelNewBook(old){
  const g={};for(const [k] of HOTEL_KINDS)g[k]=0;
  return {n:hotelNight(),g,take:0,away:0,peak:0,city:0,morn:0,left:0,
    last:old?{g:old.g,take:old.take,away:old.away,peak:old.peak,city:old.city,morn:old.morn,price:G.hotelPrice,rooms:hotelRooms()}:null};
}
function hotelOcc(crew){let n=0,c=0;for(const s of G.hotelStays)if(s[1]>G.clock){n++;if(s[0]==='crew')c++}return crew?c:n}
// the next check-out at 10:00 that's at least 5 hours away
function checkOut(){const d=Math.floor(G.clock/1440)*1440+600;return d-G.clock>=300?d:d+1440}
// books a room for a guest until `until`, if one's free; otherwise counts them as turned away. Rooms for about a third
// of your crews are kept back from paying guests
const crewHold=()=>Math.min(hotelRooms()>>2,Math.ceil(G.crews.length/3));
function hotelBook(kind,until){
  const B=G.hotelBook,occ=hotelOcc(),pay=kind!=='crew'&&kind!=='strand';
  if(occ>=hotelRooms()-(pay?Math.max(0,crewHold()-hotelOcc(true)):0)){if(pay)B.away++;return false}
  G.hotelStays.push([kind,until]);B.g[kind]++;B.peak=Math.max(B.peak,occ+1);return true;
}
function hotelTake(v,x,y){v*=devOn('hotels')?2:1;G.hotelBook.take+=v;earn(v,'landside',x??1367,y??700,'#FFD696')}
// late: past the last train, tram or bus, or in the small hours with none at all
function hotelLate(){const h=hour();if(h>=5&&h<21)return false;if(h<5||h>=23)return true;
  return !Object.values(G.lines||{}).some(L=>serves(L,'air')&&lineFreq(L)>0)}
const confSoon=()=>(G.evq||[]).some(e=>e.type==='conference'&&G.clock>e.at-1440&&G.clock<e.at+210);
function hotelGuest(p){ // why an arriving passenger takes a room, if they do
  const dm=HP_DEM[G.hotelPrice],h=hour();
  if((p.type==='work'||p.biz)&&confSoon()&&rnd()<0.3*dm)return 'conf';
  if(R.hotLate&&rnd()<0.2*dm)return 'late';
  if((h>=19||h<5)&&p.A.ac.tier>=2&&rnd()<0.03*dm)return 'xfer';
  return null;
}
// an arriving passenger who books a room walks through the walkway to the lobby (asked first by exitTarget)
const hotelExit=p=>{
  if(!G.lv.hotel||!p.A)return false;const k=hotelGuest(p);
  if(!k||!hotelBook(k,checkOut()))return false;
  p.hotel=k;p.tx=1296+rnd()*40;p.ty=716+rnd()*8;route(p,hallId('hot'));return true;
};
TERM_EXIT.push(hotelExit);
// early flyers slept in the hotel: they come down to the lobby and walk out to check-in (asked first by spawn)
const hotelSpawn=p=>{
  if(!G.lv.hotel)return false;const h=hour(),B=G.hotelBook;
  if(h<4||h>=9||p.psize>1||p.type==='prm')return false;
  B.morn++;if(B.left<=0||rnd()>=0.2*HP_DEM[G.hotelPrice])return false;
  const k=G.hotelStays.findIndex(s=>s[0]==='early'&&s[1]>G.clock);if(k<0){B.left=0;return false}
  G.hotelStays.splice(k,1);B.left--;
  p.x=1430+rnd()*30;p.y=700+rnd()*8;p.room=hallId('hot');p.state='walkIn';p.hotel='early';
  p.tx=DOOR.x+(rnd()-0.5)*22;p.ty=DOOR.y-6;route(p,hallId('ci'));R.pax.push(p);return true;
};
TERM_SPAWN.push(hotelSpawn);
function hotelStay(p){ // an arriving guest reaches the lobby and pays for the room
  if(p.hotel)hotelTake(roomRate()*(p.hotel==='conf'?1.2:1),p.x,p.y-8);
}
// crews that rest at the hotel are ready sooner (crewAway, 34-airline-operations.js)
function crewRest(back){return G.lv.hotel&&hotelBook('crew',back+HOTEL_REST)?HOTEL_REST:CREW_REST}
// stranded: a departure held an hour past its time late at night by fog or a storm, at its gate or waiting for the
// runway; its passengers are owed a room once the airport's big enough for a hotel. Yours cost little and please them;
// the rest go to a city hotel, which is dear and costs rating
function hotelStranded(){
  if(!(weather.on('storm')||weather.on('fog'))||G.level<UPG.hotel.lvl)return;const h=hour();if(h>=4&&h<22)return;
  for(const i of SIDX){const F=R.st[i].F;if(F&&F.plane.state==='boarding')strand(i,F)}
  for(const m of R.rwy.q)if(m.type==='dep')strand(m.stand,m.F);
}
function strand(i,F){
  if(F.freighter||F.stranded||G.clock<F.std+60)return;
  {F.stranded=true;const n=F.booked,until=checkOut();let own=0;while(own<n&&hotelBook('strand',until))own++;const city=n-own;
    if(own)spend(own*roomRate(1)*0.3,'costs',i);if(city){spend(city*roomRate(1)*1.2,'costs',i);G.hotelBook.city+=city;repAdj(-Math.min(2.5,city*0.02),'stranded',i)}else repAdj(0.3,'stranded',i);
    toW(i,0,CABIN_TOP-24);floater(city?`HELD OVERNIGHT · ${city} TO CITY HOTELS`:`HELD OVERNIGHT · ${own} ROOMS`,WP.x,WP.y,city?'#FF7A8A':'#FFD696',true);
  }
}
// the duty manager prices rooms for the night by what the last one would have earned at each price
function dutyPrice(L){
  if(!L||!L.rooms)return;const paying=L.g.late+L.g.early+L.g.xfer+L.g.conf,want=(paying+L.away)/HP_DEM[L.price],free=Math.max(0,hotelRooms()-L.g.crew-L.g.strand);
  let best=G.hotelPrice,bv=-1;for(let k=0;k<3;k++){const v=HP_RATE[k]*Math.min(free,want*HP_DEM[k]);if(v>bv+1e-9){bv=v;best=k}}
  G.hotelPrice=best;
}
function hotelMinute(){
  if(!G.lv.hotel)return;let B=G.hotelBook;
  if(R.lastMin%10===0)G.hotelStays=G.hotelStays.filter(s=>s[1]>G.clock);
  if(B.n!==hotelNight()){B=G.hotelBook=hotelNewBook(B);if(SET().autoDuty!==false)dutyPrice(B.last);
    // tomorrow's early flyers book ahead, as many as came down this morning would suggest, and stay until 09:00
    const n=Math.round(B.last.morn*0.12*HP_DEM[G.hotelPrice]);let k=0;while(k<n&&hotelBook('early',G.clock+1260))k++;B.left=k;if(k)hotelTake(k*roomRate())}
  R.hotLate=hotelLate();
}
TERM_MINUTE.push(hotelMinute,hotelStranded);
// the building: two floors of 20 rooms per block, windows lit as rooms are taken, and a lobby with a reception desk
const HOTEL_LIT=[1,2,3,4,5].map(l=>{const n=HOTEL_BLOCK*l,o=[...Array(n).keys()];let s=7;for(let i=n-1;i>0;i--){s=(s*16807)%2147483647;const j=s%(i+1);[o[i],o[j]]=[o[j],o[i]]}const r=[];o.forEach((w,k)=>r[w]=k);return r}); // the order windows light in
function drawHotel(){
  if(!G.lv.hotel)return;
  ctx.fillStyle='#3A424B';ctx.fillRect(1284,702,56,6);ctx.fillStyle='#FFC72C';ctx.fillRect(1296,698,4,4);ctx.fillRect(1322,698,4,4); // reception
  ctx.fillStyle='#2F363E';for(const [x,y] of [[1380,736],[1410,736],[1380,752],[1410,752]])ctx.fillRect(x,y,18,8); // sofas
  ctx.fillStyle='#39414A';ctx.fillRect(1440,694,24,4);mono('LIFTS',1452,712,'#56606A',6.5,'center');
}
TERM_DRAW.push(drawHotel);
// the tower, outside the lobby's walls, on every floor
LAYER.terminal.push(()=>{
  if(!G.lv.hotel)return;const x0=1262,w=210,rows=2*G.lv.hotel,top=684-rows*8,occ=hotelOcc(),lit=HOTEL_LIT[G.lv.hotel-1];
  ctx.fillStyle='#232A31';ctx.fillRect(x0,top-6,w,690-top+6);ctx.fillStyle='#2F363E';ctx.fillRect(x0,top-6,w,4);
  for(let r=0;r<rows;r++)for(let c=0;c<20;c++){const k=r*20+c;ctx.fillStyle=lit[k]<occ?'rgba(255,214,150,.8)':'#1A1F24';ctx.fillRect(x0+8+c*10,680-r*8-4,6,4)}
  sign(x0,top-20,'AIRPORT HOTEL')});
// Sales › Landside: tonight's rooms, who's in them, the price and the takings
function hotelCard(){
  if(!G.lv.hotel)return '';const B=G.hotelBook,rooms=hotelRooms(),occ=hotelOcc(),auto=SET().autoDuty!==false,L=B.last;
  const show=([k])=>k!=='conf'&&k!=='crew'&&k!=='strand'||B.g[k]||k==='conf'&&devOn('conference')||k==='crew'&&G.fleet.some(f=>!f.sold);
  return `<div class="lcard" id="hotel"><div class="lh"><div><div class="rt">Airport hotel</div><div class="rd"><b>${occ}</b> of ${rooms} rooms taken</div></div></div>
    <div class="prog"><i style="width:${Math.min(100,occ/rooms*100)}%;background:${occ>=rooms?'var(--bad)':'var(--sign)'}"></i></div>
    <div class="lstats fl4" style="grid-template-columns:repeat(3,minmax(0,1fr))">${HOTEL_KINDS.filter(show).map(([k,n])=>`<div><b>${B.g[k]}</b><span>${n}</span></div>`).join('')}</div>
    <div class="chips" style="margin-top:6px">${HP_NAME.map((n,k)=>`<button class="chip${G.hotelPrice===k?' on':''}" data-hprice="${k}">${n} <small>${money(roomRate(k))}</small></button>`).join('')}<button class="chip${auto?' on':''}" data-hduty="1">${auto?'✓ ':''}Duty manager</button></div>
    <p class="note">Tonight ${money(B.take)}${L?` · last night ${money(L.take)}`:''}${B.away?` · ${B.away} turned away`:''}${B.city?` · ${B.city} sent to city hotels`:''}.${auto?' The duty manager sets the price each noon.':''}</p></div>`;
}
(TERM_PANEL['sales:landside']||(TERM_PANEL['sales:landside']=[])).push(hotelCard);
TERM_CLICK.push(d=>{
  if(d.hprice!=null){G.hotelPrice=+d.hprice;return true}
  if(d.hduty){G.set.autoDuty=SET().autoDuty===false;return true}
  return false;
});
// the checks take the guests out to show that, with no hotel, the game plays the same without them
function hotelUnhook(){for(const [t,f] of [[TERM_EXIT,hotelExit],[TERM_SPAWN,hotelSpawn],[TERM_MINUTE,hotelMinute]]){const k=t.indexOf(f);if(k>=0)t.splice(k,1)}}
Object.assign(SIMX,{hotelUnhook,hotelRooms,hotelOcc,hotelBook,hotelNight,roomRate,crewAway,crewRest,hotelStranded,strand,dutyPrice,drawHotel});
