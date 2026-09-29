/* ================= LAYOUT DRAWING: remote stands and buses, rooms, shop units, links and each layout's furniture ================= */
function drawBusStand(i){if(G.stands[i].built)drawBusRoad(i)}
// a 2D remote stand: its road from the bus gate, stairs at the doors, and buses where the passengers are
function drawBusRoad(i){
  const S=R.st[i],F=S.F,g=S.geo||geom(AIRCRAFT[0]),P=F?F.P:paths(i,g),pts=P.bridge.pts;
  ctx.strokeStyle='rgba(255,199,44,.35)';ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.beginPath();pts.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);
  if(F&&S.ext>0.5){ctx.save();standCtx(i);ctx.fillStyle='#7F8A94';ctx.strokeStyle='#4A545E';ctx.lineWidth=1;
    for(const [dx,dy] of [[g.fd.x,g.fd.y],...(F.rear?[[g.rd.x,g.rd.y]]:[])]){ctx.fillRect(dx-15,dy-5,13,10);for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(dx-15+k*3.3,dy-5);ctx.lineTo(dx-15+k*3.3,dy+5);ctx.stroke()}}ctx.restore()}
  const bus=(path,list)=>{const L=list.slice().sort((a,b)=>a.s-b.s);for(let k=0;k<L.length;k+=20){const grp=L.slice(k,k+20),s=grp.reduce((a,p)=>a+p.s,0)/grp.length,q=ptAt(path,s),q2=ptAt(path,Math.min(path.len,s+4));
    ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(Math.atan2(q2[1]-q[1],q2[0]-q[0])+Math.PI/2);
    if(G.lounges){ctx.fillStyle='#6BE39A';rrect(-8,-15,16,30,3);ctx.fill();ctx.fillStyle='#14171B';ctx.globalAlpha=0.45;ctx.fillRect(-5,-11,10,22);ctx.globalAlpha=1} // a mobile lounge
    else{ctx.fillStyle='#E6E1D6';rrect(-5,-12,10,24,3);ctx.fill();ctx.fillStyle='#5CC8FF';ctx.fillRect(-3.5,-9,7,4);ctx.fillStyle='#39414A';ctx.fillRect(-3.5,-3,7,10)}ctx.restore()}};
  if(F)for(const door of DOORS){const path=door?F.P.rear:F.P.bridge;if(S.bridge[door].length)bus(path,S.bridge[door]);if(S.dBridge[door].length)bus(path,S.dBridge[door])}
}
function drawTower(x,y){ctx.fillStyle='#39414A';ctx.fillRect(x-7,y,14,200);ctx.fillStyle='#2A333C';ctx.beginPath();ctx.moveTo(x-26,y);ctx.lineTo(x+26,y);ctx.lineTo(x+18,y-22);ctx.lineTo(x-18,y-22);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(92,200,255,.55)';ctx.fillRect(x-17,y-18,34,10);ctx.fillStyle='#5A646E';ctx.fillRect(x-1,y-40,2,18)}
// A 2D layout's floors: every room on the floor shown filled (onFloor, 53-roofs.js), then its walls with a gap at each
// doorway (a door's fifth number is its half-width); with two floors, only its own doorways, so a door upstairs leaves no
// gap in the wall of the hall below it. Rooms in the second phase show only a dashed outline until Pier B, or its
// equivalent, is built.
function polyPath(P){ctx.beginPath();P.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath()}
function drawRooms(){
  const shut=r=>r.ph===2&&!G.pierB,two=twoFloors();
  for(const r of ROOMS){if(!roomOn(r)||r.open||!onFloor(r.fl))continue;ctx.fillStyle=r.col||'#1C2228';polyPath(r.poly);ctx.fill()}
  const doors=ROOM_DOORS;ctx.strokeStyle='#4E5964';ctx.lineWidth=3;ctx.lineCap='square';ctx.beginPath();
  for(const r of ROOMS){if(!roomOn(r)||r.open||!onFloor(r.fl))continue;const P=r.poly;
    for(let k=0;k<P.length;k++){const [x1,y1]=P[k],[x2,y2]=P[(k+1)%P.length],len=Math.hypot(x2-x1,y2-y1),ux=(x2-x1)/len,uy=(y2-y1)/len;
      const cuts=[];for(const d of doors){if(isFloorLink(d)||two&&d[0]!==r.id&&d[1]!==r.id)continue;const t=(d[2]-x1)*ux+(d[3]-y1)*uy,off=Math.abs((d[2]-x1)*uy-(d[3]-y1)*ux);if(off<3&&t>-40&&t<len+40)cuts.push([t-(d[4]||34),t+(d[4]||34)])}
      cuts.sort((a,b)=>a[0]-b[0]);let t0=0;
      for(const [a,b] of cuts){if(a>t0){ctx.moveTo(x1+ux*t0,y1+uy*t0);ctx.lineTo(x1+ux*Math.min(a,len),y1+uy*Math.min(a,len))}t0=Math.max(t0,b)}
      if(t0<len){ctx.moveTo(x1+ux*t0,y1+uy*t0);ctx.lineTo(x2,y2)}}}
  ctx.stroke();
  const later=ROOMS.filter(shut);if(!later.length)return;
  for(const r of later){const xs=r.poly.map(p=>p[0]),ys=r.poly.map(p=>p[1]),x0=Math.min(...xs),y0=Math.min(...ys),w=Math.max(...xs)-x0,h=Math.max(...ys)-y0;
    if(isBuilding('pier:B')){hatch(x0,y0,w,h,0,'');continue}
    ctx.strokeStyle='#2B3238';ctx.lineWidth=1.5;ctx.setLineDash([6,6]);polyPath(r.poly);ctx.stroke();ctx.setLineDash([])}
  const r=later[0],xs=r.poly.map(p=>p[0]),ys=r.poly.map(p=>p[1]),cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2,n=p2name().toUpperCase();
  if(isBuilding('pier:B'))hatchLabel(cx,cy,bprog('pier:B'),'BUILDING '+n);
  else mono(G.level>=PIER.lvl?`${n} · ${money(PIER.cost)}`:`${n} · needs ${LEVELS[PIER.lvl].name}`,cx,cy,'#4A535D',11,'center');
}
function shopHit(j,x,y){const a=SHOP_A[j]*Math.PI/180,c=Math.cos(a),s=Math.sin(a),dx=x-SHOP_X[j],dy=y-SHOP_Y[j],u=dx*c+dy*s,v=dy*c-dx*s;return u>=0&&u<=118&&v>=0&&v<=40}
// a 2D layout's apron furniture: taxi lines, roads, the control tower and names painted on the ground
function drawPlanApron(){
  for(const d of LAY.decor||[]){
    if(d.t==='taxi'){ctx.strokeStyle='rgba(255,199,44,.4)';ctx.lineWidth=2;ctx.setLineDash([12,10]);ctx.beginPath();d.pts.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([])}
    else if(d.t==='road'){ctx.strokeStyle='#262C33';ctx.lineWidth=d.w||16;ctx.lineJoin='round';ctx.beginPath();d.pts.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()}
    else if(d.t==='tower')drawTower(d.x,d.y);
    else if(d.t==='label'){ctx.font='800 20px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle='rgba(255,199,44,.14)';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText(d.text,d.x,d.y)}
  }
}
// over the floors: CDG's escalator tubes, Denver's tent roof
function drawPlanOver(){
  for(const d of LAY.decor||[]){
    if(d.t==='tubes'){ctx.fillStyle='#101316';ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(92,200,255,.5)';ctx.lineWidth=6; // the open middle and its escalator tubes
      for(const [a,b] of [[-50,130],[-20,160],[20,-160],[50,-130],[0,180]]){const r1=a*Math.PI/180,r2=b*Math.PI/180;ctx.beginPath();ctx.moveTo(d.x+d.r*Math.sin(r1),d.y-d.r*Math.cos(r1));ctx.lineTo(d.x+d.r*Math.sin(r2),d.y-d.r*Math.cos(r2));ctx.stroke()}}
    else if(d.t==='tent'){ctx.strokeStyle='rgba(236,232,223,.35)';ctx.lineWidth=2;ctx.beginPath();for(let x=d.x0;x+100<=d.x1;x+=100){ctx.moveTo(x,d.y);ctx.lineTo(x+50,d.y-14);ctx.lineTo(x+100,d.y)}ctx.stroke()} // Denver's tent roof
  }
}
// links: a train's underground track and stations, and a car wherever people are riding (one shuttles when nobody is);
// tunnels with moving walkways as dashed lines
function drawLinks(){
  const Ls=LAY.links;if(!Ls)return;const t=performance.now()/1000;
  Ls.forEach(([a,b,pa,pb,kind],k)=>{const tr=kind==='train',open=!(ROOMS[ROOM_ID[a]].ph===2||ROOMS[ROOM_ID[b]].ph===2)||G.pierB;if(!open)return;
    ctx.strokeStyle=tr?'rgba(92,200,255,.45)':'rgba(236,232,223,.22)';ctx.lineWidth=tr?5:8;ctx.setLineDash(tr?[14,10]:[6,6]);ctx.beginPath();ctx.moveTo(pa[0],pa[1]);ctx.lineTo(pb[0],pb[1]);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=tr?'#5CC8FF':'#7F8A94';for(const [x,y] of [pa,pb])ctx.fillRect(x-9,y-5,18,10);
    if(tr){const riders=R.pax.filter(p=>p.riding&&Math.abs((p.x-pa[0])*(pb[1]-pa[1])-(p.y-pa[1])*(pb[0]-pa[0]))<30*Math.hypot(pb[0]-pa[0],pb[1]-pa[1]));
      const ang=Math.atan2(pb[1]-pa[1],pb[0]-pa[0]),car=(x,y)=>{ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle='#5CC8FF';rrect(-34,-8,68,16,7);ctx.fill();ctx.fillStyle='#14171B';for(let w=0;w<4;w++)ctx.fillRect(-26+w*14,-4,9,5);ctx.restore()};
      if(riders.length){const done=new Set();for(const p of riders){const key=Math.round(p.x/120)+','+Math.round(p.y/120);if(done.has(key))continue;done.add(key);car(p.x,p.y)}}
      else{const u=((t*0.15+k*0.37)%2),f=u<1?u:2-u;car(pa[0]+(pb[0]-pa[0])*f,pa[1]+(pb[1]-pa[1])*f)}}});
}
