/* ================= LAYOUT DRAWING: remote stands and buses, and each layout's halls, tower and satellite ================= */
// a remote stand: a bus road from the gate to the plane, stairs at both doors, and buses where the passengers are
function drawBusStand(i){
  const S=R.st[i];if(!G.stands[i].built)return;
  const sx=STAND_X[i],g=S.geo||geom(AIRCRAFT[0],STAND_DY[i]),F=S.F;
  ctx.strokeStyle='rgba(255,199,44,.35)';ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.beginPath();
  ctx.moveTo(sx-120,TERM_Y);ctx.lineTo(sx-120,g.fd.y+20);ctx.lineTo(sx+g.fd.x-10,g.fd.y);ctx.stroke();ctx.setLineDash([]);
  if(F&&S.ext>0.5){
    ctx.fillStyle='#7F8A94';ctx.strokeStyle='#4A545E';ctx.lineWidth=1;
    for(const [dx,dy] of [[g.fd.x,g.fd.y],...(F.rear?[[g.rd.x,g.rd.y]]:[])]){ctx.fillRect(sx+dx-15,dy-5,13,10);for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(sx+dx-15+k*3.3,dy-5);ctx.lineTo(sx+dx-15+k*3.3,dy+5);ctx.stroke()}}
  }
  // one bus for every 20 passengers riding along a road, at their middle
  const bus=(path,list)=>{const L=list.slice().sort((a,b)=>a.s-b.s);for(let k=0;k<L.length;k+=20){const grp=L.slice(k,k+20),s=grp.reduce((a,p)=>a+p.s,0)/grp.length,q=ptAt(path,s);
    ctx.fillStyle='#E6E1D6';rrect(q[0]-5,q[1]-12,10,24,3);ctx.fill();ctx.fillStyle='#5CC8FF';ctx.fillRect(q[0]-3.5,q[1]-9,7,4);ctx.fillStyle='#39414A';ctx.fillRect(q[0]-3.5,q[1]-3,7,10)}};
  if(F)for(const door of DOORS){const path=door?F.P.rear:F.P.bridge;if(S.bridge[door].length)bus(path,S.bridge[door]);if(S.dBridge[door].length)bus(path,S.dBridge[door])}
}
// under the stands: halls, the star, the tower and the remote apron's road
function drawLayoutApron(){
  const id=G.layout;
  if(id==='remote'){ctx.strokeStyle='rgba(255,199,44,.25)';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(LAND_R+20,TERM_Y-14);ctx.lineTo(LAY.conc1-20,TERM_Y-14);ctx.stroke();
    ctx.font='800 20px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle='rgba(255,199,44,.14)';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillText('REMOTE APRON',LAND_R+30,TERM_Y-26)}
  if(id==='curve'||id==='hall'){const [a,b]=LAY.hall;
    ctx.fillStyle='#20272E';rrect(a+10,330,b-a-20,120,14);ctx.fill();ctx.strokeStyle='#3A4652';ctx.lineWidth=1;for(let x=a+30;x<b-20;x+=24){ctx.beginPath();ctx.moveTo(x,338);ctx.lineTo(x,446);ctx.stroke()}
    ctx.strokeStyle='#5CC8FF';ctx.globalAlpha=0.25;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a+14,360);ctx.quadraticCurveTo((a+b)/2,300,b-14,360);ctx.stroke();ctx.globalAlpha=1;
    if(id==='curve')drawTower((a+b)/2,250)}
  if(id==='curve'){ctx.strokeStyle='rgba(255,199,44,.3)';ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.beginPath();SIDX.forEach((i,k)=>{const x=STAND_X[i],y=26+STAND_DY[i];k?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.setLineDash([])}
  if(id==='star'){const [a,b]=LAY.hall,cx=(a+b)/2,cy=330;ctx.fillStyle='#20272E';ctx.strokeStyle='#3A4652';ctx.lineWidth=2;ctx.beginPath();
    for(let k=0;k<10;k++){const ang=-Math.PI/2+k*Math.PI/5,r=k%2?150:300;const x=cx+Math.cos(ang)*r*1.4,y=cy+Math.sin(ang)*r*0.7;k?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#2A333C';ctx.beginPath();ctx.arc(cx,cy,70,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#5CC8FF';ctx.globalAlpha=0.3;ctx.beginPath();ctx.arc(cx,cy,70,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;drawTower(cx,cy-20)}
  if(id==='sat'){const [a,b]=LAY.hall;ctx.fillStyle='#20272E';rrect(a+10,300,b-a-20,150,18);ctx.fill();ctx.strokeStyle='#3A4652';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a+20,380);ctx.lineTo(b-20,380);ctx.stroke()}
}
function drawTower(x,y){ctx.fillStyle='#39414A';ctx.fillRect(x-7,y,14,200);ctx.fillStyle='#2A333C';ctx.beginPath();ctx.moveTo(x-26,y);ctx.lineTo(x+26,y);ctx.lineTo(x+18,y-22);ctx.lineTo(x-18,y-22);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(92,200,255,.55)';ctx.fillRect(x-17,y-18,34,10);ctx.fillStyle='#5A646E';ctx.fillRect(x-1,y-40,2,18)}
// over the terminal: hall names, and the satellite's people mover
function drawLayoutTerminal(){
  const id=G.layout;
  if(LAY.hall&&id!=='sat'){const [a,b]=LAY.hall;mono(id==='star'?'STAR HALL':'CENTRAL HALL',(a+b)/2,517,'#56606A',9,'center')}
  if(id==='sat'){const [a,b]=LAY.gap;ctx.fillStyle='#101316';ctx.fillRect(a,TERM_Y,b-a,SEC_Y-TERM_Y);ctx.fillStyle='#2A3037';ctx.fillRect(a,480,b-a,8);
    if(G.pierB){const t=(performance.now()/1000*0.2)%2,px=a+10+(t<1?t:2-t)*(b-a-90);ctx.fillStyle='#5CC8FF';rrect(px,477,70,14,4);ctx.fill()}
    mono(G.pierB?'SATELLITE':'SATELLITE · NEEDS BUILDING',(LAY.hall[0]+LAY.hall[1])/2,517,'#56606A',9,'center');mono('PEOPLE MOVER',(a+b)/2,503,'#56606A',8.5,'center')}
  if(id==='remote')mono('BUS GATES',(LAND_R+LAY.conc1)/2,517,'#56606A',9,'center');
}
// A 2D layout's floors: every room filled, then its walls with a gap at each doorway (a door's fifth number is its
// half-width). Rooms in the second phase show only a dashed outline until Pier B, or its equivalent, is built.
function polyPath(P){ctx.beginPath();P.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath()}
function drawRooms(){
  const shut=r=>r.ph===2&&!G.pierB;
  for(const r of ROOMS){if(shut(r))continue;ctx.fillStyle=r.col||'#1C2228';polyPath(r.poly);ctx.fill()}
  const doors=LAY.doors||[];ctx.strokeStyle='#4E5964';ctx.lineWidth=3;ctx.lineCap='square';ctx.beginPath();
  for(const r of ROOMS){if(shut(r))continue;const P=r.poly;
    for(let k=0;k<P.length;k++){const [x1,y1]=P[k],[x2,y2]=P[(k+1)%P.length],len=Math.hypot(x2-x1,y2-y1),ux=(x2-x1)/len,uy=(y2-y1)/len;
      const cuts=[];for(const d of doors){const t=(d[2]-x1)*ux+(d[3]-y1)*uy,off=Math.abs((d[2]-x1)*uy-(d[3]-y1)*ux);if(off<3&&t>-40&&t<len+40)cuts.push([t-(d[4]||34),t+(d[4]||34)])}
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
// a shop unit, turned to face its concourse; its words are kept the right way up
function drawShopUnit(j){
  const s=G.shops[j],a=((SHOP_A[j]%360)+360)%360;ctx.save();ctx.translate(SHOP_X[j],SHOP_Y[j]);ctx.rotate(a*Math.PI/180);
  if(s){const t=SHOPS[s.type];ctx.fillStyle='#242A31';ctx.fillRect(0,0,118,40);ctx.fillStyle=t.col;ctx.fillRect(0,38,118,3);
    if(a>90&&a<=270){ctx.translate(118,40);ctx.rotate(Math.PI)}
    ctx.font='700 11px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle=t.col;ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillText(t.name.toUpperCase(),7,16);
    mono(`Lv ${s.lvl+1} · ${money(s.earned||0)}`,7,30,'#909AA4',8.5)}
  else{ctx.strokeStyle='#343C45';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.strokeRect(.5,.5,117,39);ctx.setLineDash([]);if(a>90&&a<=270){ctx.translate(118,40);ctx.rotate(Math.PI)}mono('UNIT TO LET',59,24,'#4A535D',8.5,'center')}
  ctx.restore();
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
