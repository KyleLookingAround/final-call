/* ================= VEHICLES: ground vehicles working each stand's turnaround ================= */
// Everything here comes from what the stand and its flight are already doing (F.plane.state, S.ext, F.hold,
// F.arr.unloaded), never from a rule of its own: nothing here can change G or the game's side of R, and nothing calls
// rnd(). Drawn on the 'stands' layer (50-scene.js), in each stand's own frame (standCtx/toW, 41-airside.js), so it
// turns and sits with the plane the way its markings and the plane itself already do.

// whether stand i has a turnaround going on right now: the plane still docked, or easing back off the stand (S.out,
// 08-stands.js). Never true for an empty stand, one whose plane is still arriving, or a remote stand (bused, not this).
function vehicleWork(i){
  if(!G.stands[i].built||STAND_KIND[i]==='remote')return null;
  const S=R.st[i];
  if(S.out)return {pushback:S.out};
  const F=S.F;if(!F)return null;
  const st=F.plane.state;
  return (st==='deplaning'||st==='turnaround'||st==='boarding'||st==='closing')?{F}:null;
}
function drawTruck(x,y,ang,w,h,body,cab){
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  ctx.fillStyle=body;rrect(-w/2,-h/2,w,h,2);ctx.fill();
  ctx.fillStyle=cab;rrect(-w/2,-h/2,w,h*0.3,1.5);ctx.fill();
  ctx.restore();
}
// the tug and its tow bar, hitched to the nose while the plane eases back off the stand: the same shape the plane
// itself draws for an arriving tow (drawPlane, 12-drawing.js), at pushback instead of arrival
function drawPushback(i,out){
  const g=out.F.geo;
  ctx.save();ctx.globalAlpha=out.alpha;standCtx(i);ctx.translate(0,out.offY);
  ctx.strokeStyle='#5A646E';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,g.top-64);ctx.lineTo(0,g.top-74);ctx.stroke();
  ctx.fillStyle='#3A424B';rrect(-8,g.top-86,16,12,2);ctx.fill();ctx.fillStyle='#FFC72C';ctx.fillRect(-2,g.top-84,4,3);
  ctx.restore();
}
// the fuel and catering trucks, parked on the apron side of the stand (away from the bridge) while the plane is docked
function drawGroundVehicles(F,g){
  drawTruck(g.fw+38,g.wingY+16,Math.PI/2,13,26,'#5A646E','#8C97A1');
  drawTruck(g.fw+22,(F.rear?g.rd.y:g.fd.y)+10,Math.PI/2,11,20,'#E6E1D6','#39414A');
}
// the baggage tractor and its carts, running the hold's own cart path (paths(), 04-geometry.js) while bags still move
function drawBagCarts(F,i){
  const ph=(performance.now()/1000*0.45+i*0.3)%2,s=(ph<1?ph:2-ph)*F.P.cart.len,q=ptAt(F.P.cart,s);
  ctx.fillStyle='#3A424B';ctx.fillRect(q[0]-5,q[1]-4,10,8);
  ctx.fillStyle='#D9A066';ctx.fillRect(q[0]-4,q[1]+6,8,7);ctx.fillRect(q[0]-4,q[1]+15,8,7);
  ctx.fillStyle='#FFC72C';ctx.fillRect(q[0]-1.5,q[1]-3,3,2);
}
LAYER.stands.push(V=>{
  if(V.z<0.35)return; // too small to read at this zoom, and not worth the frame time
  for(const i of SIDX){
    const w=vehicleWork(i);if(!w)continue;
    toW(i,0,150);if(!inView(WP.x,WP.y,300))continue;
    if(w.pushback){drawPushback(i,w.pushback);continue}
    const S=R.st[i],F=w.F,g=S.geo||F.geo;
    ctx.save();standCtx(i);drawGroundVehicles(F,g);ctx.restore();
    if(S.ext>0.6&&(F.hold<F.bagsIn||F.arr.unloaded<F.arr.bags)){ctx.save();standCtx(i);drawBagCarts(F,i);ctx.restore()}
  }
});
Object.assign(SIMX,{vehicleWork});
