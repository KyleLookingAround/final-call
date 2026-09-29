/* ================= ROOFS: the terminal and its piers seen from above, a floor the player steps up to ================= */
// The halls are never covered on their own: the roof is a floor (R.floor, runtime), picked on the map's camera bar at any
// zoom (the owner's choice, 27 Sep 2026): Roof, Departures (the upper floor, shown first) or Arrivals (the lower). On the roof,
// every hall and pier that's built has a roof in its room's own shape, with plant and skylights, and nothing inside them is
// drawn. Rooms not built yet (a second phase before Pier B, the hotel before it's bought) have no roof. Drawing only: the
// roofs follow ROOMS and roomOn() and change nothing; taps go through them as before (tapAt).
if(!R.floor||R.floor==='halls')R.floor='up'; // 'roof', 'up' or 'down'
const roofA=()=>R.floor==='roof'&&R.view==='airport'?1:0; // 1 on the roof, 0 on the halls
const floorNow=()=>R.floor==='down'?0:1; // the floor of halls drawn: 0 arrivals, 1 departures (and under the roof)
// a layout's halls are on two floors when it has halls on each (Classic; the others keep one floor for now, and their chip
// shows Roof and Halls), worked out once per plan (ROOMS is made afresh by applyLayout)
let FL2=null;
function twoFloors(){if(!ROOMS)return false;if(FL2&&FL2.rs===ROOMS)return FL2.two;FL2={rs:ROOMS,two:ROOMS.some(r=>r.fl===0)&&ROOMS.some(r=>r.fl===1)};return FL2.two}
const onFloor=fl=>fl===2?!!roofA():fl==null||fl===floorNow()||!twoFloors(); // a room or passenger without a floor is on both; with one floor, everything shows; the roof terrace (2) only on the roof
function setFloor(f){if(f==='down'&&!twoFloors())f='up';if(R.floor===f)return;R.floor=f;renderCam()}
// is (x, y) under a built roof? P is roofNow()'s plan
function underRoof(P,x,y){const rs=P.rooms;for(let j=0;j<rs.length;j++){const r=rs[j];if(x>=r.x0&&x<=r.x1&&y>=r.y0&&y<=r.y1&&inPoly(r.poly,x,y))return true}return false}
let ROOF=null; // the current plan: {key, rooms:[{x0,y0,x1,y1,path,edge,sky:[…],plant:[…]}]}
// a roof's parts in the room's own frame, along its longest wall: skylight strips down the middle and plant along one side,
// each kept only if it sits wholly on the roof
function roofPlan(poly){
  const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);let ux=1,uy=0,best=0;
  for(let k=0;k<poly.length;k++){const [x1,y1]=poly[k],[x2,y2]=poly[(k+1)%poly.length],l=Math.hypot(x2-x1,y2-y1);if(l>best){best=l;ux=(x2-x1)/l;uy=(y2-y1)/l}}
  const us=poly.map(([x,y])=>x*ux+y*uy),vs=poly.map(([x,y])=>y*ux-x*uy),u0=Math.min(...us),u1=Math.max(...us),v0=Math.min(...vs),v1=Math.max(...vs);
  const at=(u,v)=>[u*ux-v*uy,u*uy+v*ux],quad=(u,v,a,b)=>[at(u-a,v-b),at(u+a,v-b),at(u+a,v+b),at(u-a,v+b)];
  const fits=(u,v,a,b,m)=>quad(u,v,a+m,b+m).every(([x,y])=>inPoly(poly,x,y)); // wholly on the roof, m clear of its edge
  const sky=[],plant=[],span=v1-v0,rows=span<34?0:Math.max(1,Math.min(3,Math.floor(span/70)));
  for(let r=0;r<rows;r++){const v=v0+span*(r+1)/(rows+1)+(rows===1&&span>60?span*0.12:0);
    for(let u=u0+40;u<=u1-40;u+=70){if(fits(u,v,24,4,3))sky.push(quad(u,v,24,4))}}
  if(span>=30)for(let u=u0+60;u<=u1-40;u+=230){const v=v0+Math.min(18,span*0.3),Q=quad(u,v,16,10);if(fits(u,v,16,10,4))plant.push({Q,fan:[at(u-7,v),at(u+7,v)]})}
  const path=new Path2D();poly.forEach(([x,y],k)=>k?path.lineTo(x,y):path.moveTo(x,y));path.closePath();
  return {x0:Math.min(...xs),y0:Math.min(...ys),x1:Math.max(...xs),y1:Math.max(...ys),poly,path,sky,plant};
}
// the plan follows the layout and what's built, and is worked out again only when either changes
function roofNow(){
  if(!ROOMS)return null;const on=ROOMS.map(r=>roomOn(r)&&!r.open?1:0).join('');
  if(ROOF&&ROOF.rs===ROOMS&&ROOF.on===on)return ROOF;
  const polys=ROOMS.filter((r,k)=>on[k]==='1').map(r=>r.poly),[bx0,by0,bx1,by1]=BAG_HALL;polys.push(RECT(bx0,by0,bx1,by1)); // the baggage hall is under the same roof
  const rooms=polys.map(roofPlan),all=new Path2D();for(const r of rooms)all.addPath(r.path);
  return ROOF={rs:ROOMS,on,rooms,all,deco:(LAY.decor||[]).filter(d=>d.t==='tent'||d.t==='tubes')};
}
function drawRoofs(V){
  const a=roofA();if(!a)return;const P=roofNow();if(!P)return;
  const vis=P.rooms.filter(r=>r.x1>=V.x0&&r.x0<=V.x1&&r.y1>=V.y0&&r.y0<=V.y1);if(!vis.length)return;
  const d=V.d,k=V.k,night=d/0.5; // 0 by day, 1 at night
  ctx.save();ctx.globalAlpha=a;ctx.lineJoin='miter';
  ctx.fillStyle=night>0?`rgb(${Math.round(70-18*night)},${Math.round(78-18*night)},${Math.round(88-16*night)})`:'#464E58';ctx.fill(P.all);
  ctx.strokeStyle=night>0?`rgb(${Math.round(104-22*night)},${Math.round(113-22*night)},${Math.round(124-20*night)})`:'#68717C';ctx.lineWidth=4;for(const r of vis)ctx.stroke(r.path); // the parapet round each roof
  if(k>=0.18){
    ctx.fillStyle=night>0?`rgba(255,214,150,${0.25+0.45*night})`:'rgba(150,196,230,.55)'; // skylights: sky by day, lit from inside by night
    ctx.beginPath();for(const r of vis)for(const Q of r.sky){ctx.moveTo(Q[0][0],Q[0][1]);ctx.lineTo(Q[1][0],Q[1][1]);ctx.lineTo(Q[2][0],Q[2][1]);ctx.lineTo(Q[3][0],Q[3][1]);ctx.closePath()}ctx.fill();
    ctx.fillStyle=night>0?'#3A4149':'#7A838C';ctx.beginPath();for(const r of vis)for(const {Q} of r.plant){ctx.moveTo(Q[0][0],Q[0][1]);ctx.lineTo(Q[1][0],Q[1][1]);ctx.lineTo(Q[2][0],Q[2][1]);ctx.lineTo(Q[3][0],Q[3][1]);ctx.closePath()}ctx.fill();
    if(k>=0.4){ctx.strokeStyle=night>0?'#262B31':'#4A525B';ctx.lineWidth=1;ctx.beginPath(); // the plant's fans, only close enough to see
      for(const r of vis)for(const {fan} of r.plant)for(const [x,y] of fan){ctx.moveTo(x+5,y);ctx.arc(x,y,5,0,Math.PI*2)}ctx.stroke()}
  }
  for(const D of P.deco){ // the layout's own roofline: Denver's tent peaks, the glass over CDG's open middle
    if(D.t==='tent'){ctx.strokeStyle='rgba(236,232,223,.55)';ctx.lineWidth=3;ctx.beginPath();for(let x=D.x0;x+100<=D.x1;x+=100){ctx.moveTo(x,D.y);ctx.lineTo(x+50,D.y-14);ctx.lineTo(x+100,D.y)}ctx.stroke()}
    else{ctx.fillStyle=night>0?`rgba(255,214,150,${0.2+0.3*night})`:'rgba(150,196,230,.4)';ctx.beginPath();ctx.arc(D.x,D.y,D.r,0,Math.PI*2);ctx.fill()}
  }
  ctx.restore();
}
LAYER.roofs.push(drawRoofs);
Object.assign(SIMX,{roofA,floorNow,onFloor,twoFloors,underRoof,setFloor,renderCam,roofNow,drawRoofs,tapAt,shopHit,get ROOF(){return ROOF}});
