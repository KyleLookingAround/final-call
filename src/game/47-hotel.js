/* ================= the airport hotel ================= */
// Beside the arrivals hall, its lobby (the 'hot' hall) joined to it by a walkway ('wlk'); both exist once there's a hotel.
function hotelStay(A){ // an arriving passenger who takes a room
  if(G.lv.hotel&&rnd()<0.05*G.lv.hotel)earn(6*(1+0.3*A.ac.tier)*(devOn('hotels')?2:1),'landside',1367,700,'#9FC2E0');
}
function drawHotel(){
  if(!G.lv.hotel)return;const x0=1262,w=210;ctx.fillStyle='#232A31';ctx.fillRect(x0,600,w,90);ctx.fillStyle='#2F363E';ctx.fillRect(x0,600,w,6);
  for(let r=0;r<4;r++)for(let c=0;c<12;c++){const lit=(r*12+c)%5<G.lv.hotel;ctx.fillStyle=lit?'rgba(255,214,150,.75)':'#1A1F24';ctx.fillRect(x0+10+c*16,614+r*17,8,8)}
  sign(x0,586,'AIRPORT HOTEL');
}
