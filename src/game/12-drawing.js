/* ================= drawing ================= */
function rrect(x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h)}
function sign(x,y,text,bg,fg){ctx.font='700 9px "Saira Condensed","Arial Narrow",sans-serif';const w=ctx.measureText(text).width+8;ctx.fillStyle=bg||'#FFC72C';ctx.fillRect(x,y,w,12);ctx.fillStyle=fg||'#17181A';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText(text,x+4,y+6.5);return w}
function mono(t,x,y,col,size,align){ctx.font=`500 ${size||9}px "IBM Plex Mono",monospace`;ctx.fillStyle=col||'#909AA4';ctx.textAlign=align||'left';ctx.textBaseline='alphabetic';ctx.fillText(t,x,y)}
function hatch(x,y,w,h,prog,label){
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  ctx.fillStyle='rgba(255,199,44,.06)';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='rgba(255,199,44,.22)';ctx.lineWidth=6;for(let k=-h;k<w;k+=22){ctx.beginPath();ctx.moveTo(x+k,y+h);ctx.lineTo(x+k+h,y);ctx.stroke()}
  ctx.restore();ctx.strokeStyle='rgba(255,199,44,.6)';ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.strokeRect(x,y,w,h);ctx.setLineDash([]);
  if(label)hatchLabel(x+w/2,y+h/2,prog,label);
}
// the name and progress bar of something being built, drawn upright at (cx,cy)
function hatchLabel(cx,cy,prog,label){
  ctx.fillStyle='rgba(10,12,15,.88)';rrect(cx-80,cy-22,160,40,4);ctx.fill();
  ctx.font='800 12px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle='#FFC72C';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText(label,cx,cy-6);
  ctx.fillStyle='#232930';ctx.fillRect(cx-66,cy+3,132,5);ctx.fillStyle='#FFC72C';ctx.fillRect(cx-66,cy+3,132*prog,5);
}
function bprog(id){const b=buildOf(id);return b?clamp((G.clock-b.start)/(b.done-b.start),0,1):0}
function drawPlane(F,i,offY,tow,alpha){
  const g=F.geo,ac=F.ac,fw=g.fw,top=g.top,end=g.end;
  ctx.save();ctx.globalAlpha=alpha??1;standCtx(i);ctx.translate(0,offY);
  ctx.fillStyle='#A9B3BC';
  for(const s of [-1,1]){
    const sw=g.span*0.55;
    ctx.beginPath();ctx.moveTo(s*fw,g.wingY);ctx.lineTo(s*(fw+g.span),g.wingY+sw);ctx.lineTo(s*(fw+g.span),g.wingY+sw+11);ctx.lineTo(s*fw,g.wingY+g.chord);ctx.closePath();ctx.fill();
    ctx.fillStyle='#7F8A94';rrect(s*(fw+g.span*0.45)-5,g.wingY+sw*0.45-10,10,24,4);ctx.fill();ctx.fillStyle='#A9B3BC';
    ctx.beginPath();ctx.moveTo(s*6,end+10);ctx.lineTo(s*(fw*0.8+14),end+32);ctx.lineTo(s*(fw*0.8+14),end+40);ctx.lineTo(s*6,end+34);ctx.closePath();ctx.fill();
  }
  ctx.fillStyle='#CDD4DA';ctx.beginPath();ctx.moveTo(-fw,top+10);
  ctx.bezierCurveTo(-fw,top-30,-fw*0.55,top-62,0,top-64);ctx.bezierCurveTo(fw*0.55,top-62,fw,top-30,fw,top+10);
  ctx.lineTo(fw,end);ctx.bezierCurveTo(fw,end+22,10,end+46,0,end+48);ctx.bezierCurveTo(-10,end+46,-fw,end+22,-fw,end);ctx.closePath();ctx.fill();
  ctx.fillStyle='#22303C';ctx.beginPath();ctx.moveTo(-fw*0.55,top-30);ctx.quadraticCurveTo(0,top-50,fw*0.55,top-30);ctx.lineTo(fw*0.5,top-25);ctx.quadraticCurveTo(0,top-41,-fw*0.5,top-25);ctx.closePath();ctx.fill();
  const liv=F.liv||livery();
  ctx.strokeStyle=liv;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,end+8);ctx.lineTo(0,end+46);ctx.stroke();
  ctx.fillStyle=liv;ctx.fillRect(-fw,top+2,3,end-top-6);ctx.fillRect(fw-3,top+2,3,end-top-6);
  ctx.fillStyle='#252B32';rrect(-fw+4,top,fw*2-8,end-top-2,4);ctx.fill();
  ctx.fillStyle='#2F363E';for(const ax of g.aisleX)ctx.fillRect(ax-AISLE/2+2,g.rowsStart-4,AISLE-4,ac.rows*g.pitch+8);
  const gx=g.aisleX[0]+AISLE/2;ctx.fillStyle='#39414A';ctx.fillRect(gx,top+3,fw-4-gx,9);ctx.fillRect(gx,end-12,fw-4-gx,8);
  const sh=Math.max(3.5,g.pitch-2.4),sw=SEATW-3;
  for(let r=0;r<ac.rows;r++){
    const y=rowY(F,r)-sh/2,biz=r<F.bRows;
    if(F.freighter){const lo=F.checkedTotal?F.hold/F.checkedTotal:0,un=F.arr.bags?1-F.arr.unloaded/F.arr.bags:0,full=Math.max(lo,un)*ac.rows;ctx.fillStyle=r<full?'#B07A45':'#2F363E';rrect(g.seatXs[0]-sw/2,y,g.seatXs[g.cols-1]-g.seatXs[0]+sw,sh,1.5);ctx.fill();if(r<full){ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(0-0.5,y,1,sh)}continue}
    for(let c=0;c<g.cols;c++){const o=F.occ[r*g.cols+c];ctx.fillStyle=o>=0?GROUPC[o]:(F.occIn&&F.occIn[r*g.cols+c]>=0)?'#4F6478':(biz?'#4A4131':'#39414A');rrect(g.seatXs[c]-sw/2,y,sw,sh,Math.min(2,sh/3));ctx.fill()}
  }
  if(F.bRows){const y=g.rowsStart+F.bRows*g.pitch;ctx.strokeStyle='#8A7A55';ctx.lineWidth=1;ctx.setLineDash([2,2]);ctx.beginPath();ctx.moveTo(-fw+6,y);ctx.lineTo(fw-6,y);ctx.stroke();ctx.setLineDash([])}
  ctx.fillStyle='#FFC72C';ctx.fillRect(g.fd.x-1,g.fd.y-5,3,10);if(F.rear)ctx.fillRect(g.rd.x-1,g.rd.y-5,3,10);
  ctx.fillStyle='#8C97A1';ctx.fillRect(fw-2,g.holdY-5,3,10);
  if(tow){ctx.strokeStyle='#5A646E';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,top-64);ctx.lineTo(0,top-74);ctx.stroke();ctx.fillStyle='#3A424B';rrect(-8,top-86,16,12,2);ctx.fill();ctx.fillStyle='#FFC72C';ctx.fillRect(-2,top-84,4,3)}
  ctx.restore();
}
// a stand's markings and plane, drawn in its own frame; words stay upright at the matching world place
function drawStandApron(i){
  const st=G.stands[i],S=R.st[i],[ax,ay,aw,ah]=standArea(i);
  if(!st.built){
    if(isBuilding('stand:'+i)){ctx.save();standCtx(i);hatch(ax,ay,aw,ah,0,'');ctx.restore();toW(i,0,ay+ah/2);hatchLabel(WP.x,WP.y,bprog('stand:'+i),'BUILDING STAND '+GATES[i]);return}
    if(!standOpen(i))return;
    ctx.save();standCtx(i);ctx.strokeStyle='#2B3238';ctx.lineWidth=1.5;ctx.setLineDash([6,6]);ctx.strokeRect(ax,ay,aw,ah);ctx.setLineDash([]);ctx.restore();
    toW(i,0,ay+ah*0.45);const lx=WP.x,ly=WP.y;
    ctx.font='800 22px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle='#2E363E';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText('STAND '+GATES[i],lx,ly);
    mono(STAND[i].lvl>G.level?`Needs ${LEVELS[STAND[i].lvl].name}`:'For sale · '+money(STAND[i].cost),lx,ly+20,'#56606A',11,'center');
    return;
  }
  ctx.save();standCtx(i);
  ctx.strokeStyle='rgba(255,199,44,.4)';ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(0,ay+ah);ctx.lineTo(0,FACE_Y+16);ctx.stroke();ctx.setLineDash([]);
  const bar=FACE_Y+16;ctx.strokeStyle='rgba(255,199,44,.5)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-26,bar);ctx.lineTo(26,bar);ctx.stroke();
  ctx.restore();
  ctx.font='800 26px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle='rgba(255,199,44,.16)';ctx.textBaseline='alphabetic';
  toW(i,112,ay+ah-24);ctx.textAlign='center';ctx.fillText(GATES[i],WP.x,WP.y+9);
  if(S.out)drawPlane(S.out.F,i,S.out.offY,false,S.out.alpha);
  const F=S.F;if(F&&F.plane.state!=='wait'&&F.plane.state!=='approach')drawPlane(F,i,F.plane.offY,F.plane.state==='inbound',F.plane.alpha??1);
}
function drawBridge(i){
  if(STAND_KIND[i]==='remote'){drawBusStand(i);return}
  const S=R.st[i];if(!G.stands[i].built)return;
  const g=S.geo||geom(AIRCRAFT[0]),e=S.ext;
  // the bridge runs from its root on the building to a rotunda, then reaches out to the front door as it extends
  const rx=-118,ry=FACE_Y,cornerY=g.fd.y,dx=g.fd.x-3,tx=rx+(dx-rx)*e,ty=cornerY;
  ctx.lineJoin='round';ctx.lineCap='butt';
  if(XF[i].face){const P=(S.P||paths(i,g)).bridge.pts,[a,b,c]=P,x=b[0]+(c[0]-b[0])*e,y=b[1]+(c[1]-b[1])*e; // root, rotunda, door
    for(const [w,col] of [[14,'#46505A'],[10,'#2A3037']]){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);if(e>0.02)ctx.lineTo(x,y);ctx.stroke()}
    ctx.fillStyle='#46505A';ctx.beginPath();ctx.arc(b[0],b[1],8.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2A3037';ctx.beginPath();ctx.arc(b[0],b[1],5.5,0,Math.PI*2);ctx.fill();ctx.save();standCtx(i)}
  else{ctx.save();standCtx(i);
  for(const [w,c] of [[14,'#46505A'],[10,'#2A3037']]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx,cornerY);if(e>0.02)ctx.lineTo(tx,ty);ctx.stroke()}
  ctx.fillStyle='#46505A';ctx.beginPath();ctx.arc(rx,cornerY,8.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2A3037';ctx.beginPath();ctx.arc(rx,cornerY,5.5,0,Math.PI*2);ctx.fill();}
  const F=S.F;
  if(F&&F.rear&&e>0.5){ctx.fillStyle='#7F8A94';ctx.fillRect(g.rd.x-15,g.rd.y-5,13,10);ctx.strokeStyle='#4A545E';ctx.lineWidth=1;for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(g.rd.x-15+k*3.3,g.rd.y-5);ctx.lineTo(g.rd.x-15+k*3.3,g.rd.y+5);ctx.stroke()}}
  ctx.restore();
  if(F&&F.rear){ctx.strokeStyle='#56616B';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();F.P.rear.pts.forEach((p,k)=>k?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.setLineDash([])}
  if(F&&e>0.6&&(F.hold<F.bagsIn||F.arr.unloaded<F.arr.bags)){
    const ph=(performance.now()/1000*0.45+i*0.3)%2,s=(ph<1?ph:2-ph)*F.P.cart.len,q=ptAt(F.P.cart,s);
    ctx.fillStyle='#3A424B';ctx.fillRect(q[0]-5,q[1]-4,10,8);ctx.fillStyle='#D9A066';ctx.fillRect(q[0]-4,q[1]+6,8,7);ctx.fillRect(q[0]-4,q[1]+15,8,7);ctx.fillStyle='#FFC72C';ctx.fillRect(q[0]-1.5,q[1]-3,3,2);
  }
}
function drawTerminal(D){
  drawRooms();drawTerminalHalls(D);
  const ciW=R.ciQ.length*D.checkin/(D.desks+D.kiosks*0.6),seW=R.secQ.length*D.sec/D.lanes,tint=w=>w>15?'rgba(255,122,138,.11)':w>8?'rgba(255,199,44,.07)':null;
  let tc=tint(ciW);if(tc){ctx.fillStyle=tc;ctx.fillRect(8,680,552,LAND_B-680)}
  tc=tint(seW);if(tc){ctx.fillStyle=tc;ctx.fillRect(8,SEC_LINE,552,80)}
  tc=tint(R.arrQ.length*D.passT/(D.officers+D.egates*1.6));if(tc){ctx.fillStyle=tc;ctx.fillRect(700,SEC_Y,540,SEC_LINE-SEC_Y)}
  ctx.fillStyle='#101316';ctx.fillRect(0,LAND_B+2,W,H-LAND_B-2);
  for(const i of SIDX){
    if(!standOpen(i))continue;
    ctx.fillStyle=G.stands[i].built?'#252C33':'#1F242A';
    for(let j=0;j<80;j++){const s=spotPos(i,j);ctx.fillRect(s.x-3,s.y-3,6,6)}
  }
  if(G.lv.mover&&G.pierB&&LAY.track){const P=LAY.trackP||(LAY.trackP=mkPath(LAY.track)),t=(performance.now()/1000*0.12)%2,q=ptAt(P,(t<1?t:2-t)*P.len);
    ctx.strokeStyle='#2A3037';ctx.lineWidth=3;ctx.beginPath();LAY.track.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.fillStyle='#5CC8FF';rrect(q[0]-12,q[1]-5,24,10,3);ctx.fill()}
  // bags on the belt behind the check-in desks (check-in and security draw themselves: 43-departures.js)
  ctx.fillStyle='#D9A066';for(const b of R.belt)ctx.fillRect(b.x-2,684.5,4,4);
  ctx.fillStyle='#FFC72C';for(const i of SIDX)if(G.stands[i].built){const F=R.st[i].F;
    const bg=busGate(i);if(bg){ctx.fillRect(bg[0]-2.5,bg[1]+bg[2]*4-2.5,5,5)}
    else{faceW(i,-118,FACE_Y-6);ctx.fillRect(WP.x-2.5,WP.y-2.5,5,5);if(F&&F.rear){faceW(i,-150,FACE_Y-6);ctx.fillRect(WP.x-2.5,WP.y-2.5,5,5)}}}
  for(const f of TERM_DRAW)f(D);
}
function paxColor(p){
  if(LAND_ST.has(p.state))return p.fast||p.biz?'#F5D08A':LAND_C;
  return GROUPC[groupOf(p)];
}
const BUGGY_ST=new Set(['walkIn','toShop','toGate','gate','toArr','exitW','toReclaim','queue','secQ','ftQ']);
function drawPax(vx0,vx1){
  for(const p of R.pax){
    if(p.x<vx0-10||p.x>vx1+10)continue;
    if(p.riding)continue; // on a train, drawn as the train
    if((p.state==='bridge'||p.state==='dBridge')&&STAND_KIND[p.stand]==='remote')continue; // riding a bus, drawn as the bus
    const inCabin=p.state==='aisle'||p.state==='sitting'||p.state==='dAisle',r=inCabin?clamp(p.F.geo.pitch*0.42,2.7,3.8):3;
    if(p.inbound){
      ctx.fillStyle='#14171B';ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=p.xfer?'#6BE39A':p.stand===R.sel?'#ECE8DF':'#9FC2E0';ctx.lineWidth=1.5;ctx.stroke();
      if(p.state==='dAisle'&&p.phase==='grab'){ctx.fillStyle='#D9A066';ctx.fillRect(p.x+r,p.y-r-2,4,4)}
      if(p.state==='exitW'&&p.checked){ctx.fillStyle='#D9A066';ctx.fillRect(p.x+r-1,p.y-1,4,4)}
      continue;
    }
    const rr=p.kid?r*0.68:r;
    if(!inCabin&&p.type==='prm'&&BUGGY_ST.has(p.state)){if(G.lv.assist){ctx.fillStyle='#CDD4DA';rrect(p.x-5.5,p.y-2.2,11,6,1.6);ctx.fill();ctx.fillStyle='#14171B';ctx.fillRect(p.x-4,p.y+3.2,2,1.2);ctx.fillRect(p.x+2,p.y+3.2,2,1.2)}else{ctx.strokeStyle='#909AA4';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(p.x+r+0.5,p.y+r);ctx.lineTo(p.x+r+0.5,p.y-r*0.4);ctx.lineTo(p.x+r+3,p.y-r*0.4);ctx.lineTo(p.x+r+3,p.y+r);ctx.stroke()}}
    ctx.fillStyle=paxColor(p);ctx.beginPath();ctx.arc(p.x,p.y,rr,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=p.xferred&&!inCabin?'#6BE39A':p.stand===R.sel&&!inCabin?'#ECE8DF':p.type==='grp'&&!inCabin?'#FF7AB6':'#14171B';ctx.lineWidth=(p.xferred||p.stand===R.sel||p.type==='grp')&&!inCabin?1.1:1;ctx.stroke();
    if(p.type==='work'&&!inCabin&&!p.kid){ctx.fillStyle='#0E1114';ctx.fillRect(p.x+r-0.4,p.y+0.2,2.8,2.3)}
    if(p.state==='aisle'){
      if(p.phase==='stow'){ctx.fillStyle='#D9A066';ctx.fillRect(p.x+r,p.y-r-2,4,4)}
      else if(p.phase==='shuffle'){ctx.strokeStyle='#FF7A8A';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(p.x,p.y,r+2.2,0,Math.PI*2);ctx.stroke()}
    }
  }
}
function statusCol(s){if(s==='DEPLANING'||s==='LANDED'||s==='AT GATE')return '#5CC8FF';if(s==='ARRIVED')return '#6BE39A';if(s==='EXPECTED'||s==='COMPLETE')return '#909AA4';return s==='CARGO'||s==='LOADING'?'#D9A066':s==='BOARDING'||s==='GO TO GATE'?'#6BE39A':s==='FINAL CALL'||s==='BAGGAGE'?'#FFC72C':s==='DELAYED'||s==='TECH DELAY'||s==='CREW DELAY'?'#FF7A8A':s==='CLOSED'?'#5CC8FF':'#909AA4'}
function gateBadge(i){
  const F=R.st[i].F,w=96,h=F?60:30,sel=i===R.sel;let x,y;
  badgeAt(i);x=WP.x-w/2;y=WP.y-h/2;
  ctx.fillStyle='rgba(10,12,15,.84)';rrect(x,y,w,h,4);ctx.fill();
  if(sel){ctx.strokeStyle='#FFC72C';ctx.lineWidth=1.2;rrect(x+.5,y+.5,w-1,h-1,4);ctx.stroke()}
  ctx.fillStyle=sel?'#FFC72C':'#3A424B';ctx.fillRect(x+6,y+6,20,13);
  ctx.font='800 10px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle=sel?'#17181A':'#ECE8DF';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(GATES[i],x+16,y+13);
  const dep=F&&F.plane.state==='deplaning',st=F?(dep?'DEPLANING':statusText(F)):gateStatus(i),col=F?statusCol(st):'#909AA4';
  ctx.font='700 9.5px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle=col;ctx.textAlign='left';ctx.fillText(st,x+31,y+13.5);
  if(!F)return;
  mono(dep?`${F.arr.code}${F.arr.no} ← ${F.arr.from[0]}`:`${F.code}${F.no} → ${F.dest[0]}`,x+6,y+32,'#ECE8DF',9.5);
  ctx.fillStyle='#232930';ctx.fillRect(x+6,y+38,w-12,4);ctx.fillStyle=col;ctx.fillRect(x+6,y+38,(w-12)*(dep?(F.arr.n-F.arr.onboard)/F.arr.n:F.seated/F.booked),4);
  const pl=F.plane;let left;
  if(dep)left=`${F.arr.n-F.arr.onboard}/${F.arr.n} off`;else if(pl.state==='turnaround')left=`cleaning ${Math.ceil(pl.t)}m`;else if(pl.state==='wait'||pl.state==='approach')left=F.landed?'taxiing in':'on approach';else if(pl.state==='inbound')left='towing in';else if(F.fault>0)left=`repair ${Math.ceil(F.fault)}m`;else if(F.seated>=F.booked&&F.hold<F.checkedTotal)left=`hold ${Math.floor(F.hold)}/${F.checkedTotal}`;else left=`${F.seated}/${F.booked}`;
  const m=Math.ceil(F.std-G.clock);let rt=m>=0?`dep ${m}m`:`+${-m}m`;
  ctx.font='500 8.5px "IBM Plex Mono",monospace';
  if(ctx.measureText(left).width+ctx.measureText(rt).width+6>w-12){left=left.replace('on approach','approach').replace('taxiing in','taxi in').replace('towing in','tow in').replace('cleaning','clean');if(ctx.measureText(left).width+ctx.measureText(rt).width+6>w-12&&m>=0)rt=`${m}m`}
  mono(left,x+6,y+54,F.fault>0?'#FF7A8A':'#909AA4',8.5);
  mono(rt,x+w-6,y+54,m<0?'#FF7A8A':m<=10?'#FFC72C':'#909AA4',8.5,'right');
}
function miniPlane(x,y,ang,sc,alpha,col){
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(sc,sc);ctx.globalAlpha=alpha??1;ctx.fillStyle=col||'#CDD4DA';
  rrect(-14,-2.4,28,4.8,2.4);ctx.fill();
  for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(3,s*2);ctx.lineTo(-4,s*13);ctx.lineTo(-7.5,s*13);ctx.lineTo(-3.5,s*2);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-10,s*1.5);ctx.lineTo(-14,s*6);ctx.lineTo(-16,s*6);ctx.lineTo(-14,s*1);ctx.closePath();ctx.fill()}
  ctx.fillStyle=livery();ctx.fillRect(-14.5,-0.7,5,1.4);ctx.restore();
}
function drawAirfield(d){
  ctx.save();ctx.translate(0,AF_Y);const Y0=-180; // drawn where Classic has it, then moved up to the layout's runway
  ctx.fillStyle='#12171A';ctx.fillRect(0,Y0,W,-Y0);
  const HX=W-60;
  ctx.fillStyle='#101316';ctx.fillRect(48,RWY_Y[0],24,-RWY_Y[0]);ctx.fillRect(HX-12,RWY_Y[0],24,-RWY_Y[0]);
  ctx.strokeStyle='rgba(255,199,44,.5)';ctx.lineWidth=1.2;ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(60,RWY_Y[0]);ctx.lineTo(60,0);ctx.moveTo(HX,RWY_Y[0]);ctx.lineTo(HX,0);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='#FFC72C';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(HX-12,-60);ctx.lineTo(HX+12,-60);ctx.moveTo(HX-12,-56);ctx.lineTo(HX+12,-56);ctx.stroke();
  for(let r=0;r<2;r++){
    const y=RWY_Y[r],h=r?28:32,open=r<1+G.lv.runway2;
    if(!open){
      if(r===1&&isBuilding('up:runway2')){hatch(20,y-h/2,W-40,h,bprog('up:runway2'),'BUILDING RUNWAY');continue}
      ctx.strokeStyle='#2B3238';ctx.lineWidth=1.5;ctx.setLineDash([6,6]);ctx.strokeRect(20,y-h/2,W-40,h);ctx.setLineDash([]);mono('SECOND RUNWAY · FOR SALE',W/2,y+4,'#4A535D',10,'center');continue}
    ctx.fillStyle='#0B0E11';ctx.fillRect(20,y-h/2,W-40,h);
    ctx.strokeStyle='rgba(236,232,223,.45)';ctx.lineWidth=1.5;ctx.setLineDash([16,14]);ctx.beginPath();ctx.moveTo(90,y);ctx.lineTo(W-90,y);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='rgba(236,232,223,.55)';for(let k=0;k<5;k++){const yy=y-h/2+4+k*(h-8)/4.5;ctx.fillRect(26,yy,18,2);ctx.fillRect(W-44,yy,18,2)}
    ctx.font='800 13px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle='rgba(236,232,223,.4)';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(G.lv.runway2?(r?'09R':'09L'):'09',62,y+1);ctx.fillText(G.lv.runway2?(r?'27L':'27R'):'27',W-62,y+1);
    if(d>0){ctx.fillStyle=`rgba(255,236,190,${0.35+d})`;for(let x=24;x<W-20;x+=40){ctx.fillRect(x,y-h/2-1,2,2);ctx.fillRect(x,y+h/2-1,2,2)}}
    if(R.fx.snow>G.clock){ctx.fillStyle='rgba(236,240,245,.12)';ctx.fillRect(20,y-h/2,W-40,h)}
  }
  // tower, fire station, fuel farm, solar farm
  if(!(LAY.decor||[]).some(d=>d.t==='tower')){ctx.fillStyle='#2A3037';ctx.fillRect(612,-44,16,30);ctx.fillStyle='#46505A';rrect(604,-58,32,16,4);ctx.fill();ctx.fillStyle='#5CC8FF';ctx.globalAlpha=0.5;ctx.fillRect(608,-54,24,6);ctx.globalAlpha=1;
    for(let k=0;k<Math.min(10,G.lv.atc);k++){ctx.fillStyle='#FFC72C';ctx.fillRect(606+k*3,-62,2,3)}}
  if(G.lv.fire){ctx.fillStyle='#3A2A2E';ctx.fillRect(500,-46,70,34);ctx.fillStyle='#E5484D';for(let k=0;k<G.lv.fire;k++)ctx.fillRect(506+k*21,-26,16,12);mono('FIRE',535,-34,'#ECE8DF',8,'center')}
  for(let k=0;k<G.lv.fuelfarm;k++){ctx.fillStyle='#39414A';ctx.beginPath();ctx.arc(700+k*38,-30,15,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#56606A';ctx.lineWidth=1.5;ctx.stroke()}
  if(G.lv.solar){ctx.fillStyle='#22364A';for(let k=0;k<G.lv.solar*14;k++){ctx.fillRect(1320+(k%28)*28,-60+Math.floor(k/28)*22,24,16)}}
  for(let r=0;r<2;r++){const a=R.rwy.act[r];if(!a)continue;const y=RWY_Y[r],k=a.t/a.dur;let x,alt;
    if(a.type==='arr'){x=W+120-(1-Math.pow(1-k,2))*(W+120-90);alt=Math.max(0,1-k/0.3)*24}else{x=HX-10-k*k*(HX+150);alt=Math.max(0,(k-0.6)/0.4)*28}
    if(alt>0)miniPlane(x+alt*0.4,y+2,Math.PI,1.05,0.25);miniPlane(x,y-alt,Math.PI,1.05+alt/60)}
  const deps=R.rwy.q.filter(m=>m.type==='dep'),arrs=R.rwy.q.filter(m=>m.type==='arr');
  deps.slice(0,2).forEach((m,j)=>miniPlane(HX,-40+j*28,-Math.PI/2,0.95));
  if(deps.length>2)mono('+'+(deps.length-2),HX+18,-8,'#ECE8DF',9);
  const tt=performance.now()/1000;arrs.slice(0,4).forEach((m,j)=>{const a=tt*0.5+j*Math.PI/2;miniPlane(W-120+Math.cos(a)*60,-168+Math.sin(a)*6,a+Math.PI/2,0.8)});
  ctx.fillStyle='rgba(10,12,15,.8)';rrect(22,Y0+6,300,18,3);ctx.fill();
  mono(`RUNWAY · ${arrs.length} holding to land · ${deps.length} waiting to take off`,30,Y0+19,R.rwy.q.length>=3?'#FF7A8A':'#909AA4',9.5);
  ctx.restore();
}
function drawLandside(D){ // outside: the road, station and stops sit LAND_DY lower than they were drawn before the halls
  ctx.fillStyle='#15191D';ctx.fillRect(0,H,W,Y1-H);
  ctx.save();ctx.translate(0,LAND_DY);
  ctx.fillStyle='#0F1215';ctx.fillRect(0,642,W,22);ctx.strokeStyle='rgba(236,232,223,.25)';ctx.lineWidth=1;ctx.setLineDash([10,10]);ctx.beginPath();ctx.moveTo(0,653);ctx.lineTo(W,653);ctx.stroke();ctx.setLineDash([]);
  if(G.lv.rail){
    ctx.fillStyle='#262C33';ctx.fillRect(16,696,300,16);ctx.fillStyle='#FFC72C';ctx.fillRect(16,711,300,1.5);
    ctx.strokeStyle='#4A545E';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,722);ctx.lineTo(318,722);ctx.moveTo(0,734);ctx.lineTo(318,734);ctx.stroke();
    ctx.fillStyle='#2F363E';for(let x=4;x<318;x+=9)ctx.fillRect(x,720,3,16);ctx.fillStyle='#7A3A42';ctx.fillRect(316,718,5,20);
    const T=R.train;if(T.x!=null){const nc=T.cars||3,cw=Math.min(88,300/nc);for(let c=0;c<nc;c++){ctx.fillStyle=T.col||'#3E6A8C';rrect(T.x+c*cw,720,cw-4,16,T.nose&&c===nc-1?8:3);ctx.fill();ctx.fillStyle='#A9D2F0';for(let w=0;w<Math.floor((cw-12)/12);w++)ctx.fillRect(T.x+c*cw+8+w*12,724,6,4)}}
    sign(16,676,'RAILWAY STATION');mono(!vehFreq('train')&&T.state==='away'?'no trains running · build a rail line on the Region tab':T.state==='away'?`next train ${Math.ceil(T.t)} min · ${R.platform.length} aboard`:'train in',110,686,'#909AA4',9);
  } else if(isBuilding('up:rail'))hatch(16,676,302,86,bprog('up:rail'),'BUILDING STATION');
  else {ctx.strokeStyle='#2B3238';ctx.lineWidth=1.5;ctx.setLineDash([6,6]);ctx.strokeRect(16,676,302,86);ctx.setLineDash([]);mono('RAILWAY STATION · FOR SALE',167,724,'#4A535D',10,'center')}
  drawStopVehicles();
  ctx.restore();
  const cap=carCap();let occ=0;
  for(let b=0;b<cap;b++){const q=BAY(b);ctx.strokeStyle='#262C32';ctx.lineWidth=1;ctx.strokeRect(q.x-4.5+.5,q.y-7+.5,9,14);
    if(R.lot[b]>G.clock){occ++;ctx.fillStyle=['#6E7883','#8C97A1','#5C6670','#A7A296','#4F6478'][b%5];rrect(q.x-3.5,q.y-6,7,12,2);ctx.fill()}}
  sign(334,668+LAND_DY,'CAR PARK');mono(`${occ}/${cap} spaces`,390,678+LAND_DY,occ>=cap?'#FF7A8A':'#909AA4',9);
}
function darkness(){const h=(G.clock/60)%24;if(h<5||h>=21)return 0.5;if(h<7)return 0.5*(7-h)/2;if(h>=19)return 0.5*(h-19)/2;return 0}
function draw(){
  if(R.view==='region'){drawRegion();return}
  if(R.view==='world'){drawWorld();return}
  const D=derived(),k=R.baseK*R.cam.z,s=k*R.dpr,cam=R.cam;
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0F1215';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(s,0,0,s,-cam.x*s,-cam.y*s);
  const vx0=cam.x,vx1=cam.x+R.sw/k;
  ctx.fillStyle='#14171B';ctx.fillRect(0,Y0,W,Y1-Y0);
  const d=darkness();drawAirfield(d);
  ctx.strokeStyle='#1A1E23';ctx.lineWidth=1;ctx.beginPath();for(let x=0;x<=W;x+=50){ctx.moveTo(x+.5,AF_Y+32);ctx.lineTo(x+.5,TERM_Y)}for(let y=AF_Y+50;y<TERM_Y;y+=50){ctx.moveTo(0,y+.5);ctx.lineTo(W,y+.5)}ctx.stroke();
  ctx.fillStyle='#101316';ctx.fillRect(0,AF_Y,W,32);ctx.strokeStyle='rgba(255,199,44,.55)';ctx.lineWidth=1.5;ctx.setLineDash([12,10]);ctx.beginPath();ctx.moveTo(0,AF_Y+16);ctx.lineTo(W,AF_Y+16);ctx.stroke();ctx.setLineDash([]);
  drawPlanApron();
  for(const i of SIDX){const b=standBox(i);if(b[0]+b[2]<vx0||b[0]>vx1)continue;drawStandApron(i)}
  for(const i of SIDX)drawBridge(i);
  if(d>0){
    ctx.fillStyle=`rgba(4,8,22,${d})`;ctx.fillRect(0,AF_Y,W,TERM_Y-AF_Y);ctx.fillStyle=`rgba(4,8,22,${d*0.6})`;ctx.fillRect(0,H,W,Y1-H);
    ctx.globalCompositeOperation='lighter';
    for(const i of SIDX){if(!G.stands[i].built)continue;toW(i,130,220);const gx=WP.x,gy=WP.y,gr=ctx.createRadialGradient(gx,gy,0,gx,gy,230);gr.addColorStop(0,`rgba(255,214,150,${0.2*d})`);gr.addColorStop(1,'rgba(255,214,150,0)');ctx.fillStyle=gr;
      ctx.fillRect(gx-230,gy-230,460,460)}
    ctx.globalCompositeOperation='source-over';
  }
  if(R.fx.snow>G.clock){ctx.fillStyle='rgba(230,236,244,.05)';ctx.fillRect(0,Y0,W,TERM_Y-Y0);ctx.fillStyle='rgba(240,244,250,.6)';const t=performance.now()/1000;for(let k=0;k<160;k++){const x=(k*157.3+t*20*(1+(k%3)))%W,y=Y0+((k*97.1+t*40*(1+(k%4)*0.3))%(TERM_Y-Y0));ctx.fillRect(x,y,1.6,1.6)}}
  drawTerminal(D);drawPlanOver();drawLinks();
  if(pol('ads')){ctx.fillStyle='#E5484D';for(let x=60;x<W-100;x+=560){ctx.fillRect(x,TERM_Y-3,220,10);ctx.font='800 9px "Saira Condensed",sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('FIZZCO · FIZZCO · FIZZCO',x+110,TERM_Y+2.5);ctx.fillStyle='#E5484D'}}
  drawLandside(D);
  drawPax(vx0,vx1);
  for(const i of SIDX){if(G.stands[i].built)gateBadge(i)}
  const ciWait=R.ciQ.length*D.checkin/(D.desks+D.kiosks*0.6),secWait=R.secQ.length*D.sec/D.lanes;
  // each queue's length and wait, signed in its hall; the doors in and out on the forecourt
  sign(190,LAND_B+6,'ENTRANCE ↑');sign(946,LAND_B+6,'EXIT ↓');
  let w=sign(16,LAND_B+6,'CHECK-IN');mono(`${R.ciQ.length} · ~${Math.round(ciWait)} min`,16+w+5,LAND_B+15,ciWait>12?'#FF7A8A':'#909AA4',9);
  w=sign(16,SEC_LINE+4,'SECURITY');mono(`${R.secQ.length+R.ftQ.length} · ~${Math.round(secWait)} min`,16+w+5,SEC_LINE+13,secWait>12?'#FF7A8A':'#909AA4',9);
  const arW=R.arrQ.length*D.passT/(D.officers+D.egates*1.6);w=sign(708,SEC_Y+4,'PASSPORTS');mono(`${R.arrQ.length} waiting · ~${Math.round(arW)} min`,708+w+5,SEC_Y+13,arW>12?'#FF7A8A':'#909AA4',9);
  drawFog(0,Y0,W,TERM_Y-Y0+120,0.3);
  if(R.fx.rain>G.clock){const tt=performance.now()/1000,st=R.fx.storm>G.clock;ctx.fillStyle=`rgba(20,30,50,${st?0.22:0.1})`;ctx.fillRect(0,Y0,W,Y1-Y0);ctx.strokeStyle='rgba(170,195,225,.35)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<220;i++){const px=(i*97.3+tt*60)%W,py=Y0+((i*53.1+tt*260)%(Y1-Y0));ctx.moveTo(px,py);ctx.lineTo(px-4,py+12)}ctx.stroke();
    if(st&&Math.sin(tt*3.1)>0.992){ctx.fillStyle='rgba(255,250,230,.25)';ctx.fillRect(0,Y0,W,Y1-Y0)}if(st)sign(W/2-80,AF_Y-12,'STORM · RUNWAY CLOSED','#FFC72C')}
  if(R.fx.strike>G.clock){const tt=performance.now()/300;for(let k=0;k<9;k++){const px=320+k*20,py=740+Math.sin(tt+k)*1.5;ctx.fillStyle='#ECE8DF';ctx.beginPath();ctx.arc(px,py,2.6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#E5484D';ctx.fillRect(px-5,py-14+Math.sin(tt*1.3+k),10,6);ctx.fillStyle='#8C97A1';ctx.fillRect(px-0.4,py-8,0.8,6)}sign(320,712,'ON STRIKE','#E5484D','#fff')}
  for(const f of R.floaters){
    if(f.x<vx0-60||f.x>vx1+60)continue;
    const life=f.big?2.2:1,a=1-f.t/life;
    ctx.globalAlpha=clamp(a*1.4,0,1);ctx.textAlign='center';ctx.textBaseline='alphabetic';
    ctx.font=f.big?'700 15px "Saira Condensed",sans-serif':'600 9px "IBM Plex Mono",monospace';
    const y=f.y-f.t*(f.big?10:14);
    if(f.big){const w=ctx.measureText(f.text).width+14;ctx.fillStyle='rgba(10,12,15,.85)';rrect(f.x-w/2,y-14,w,20,3);ctx.fill()}
    ctx.fillStyle=f.col;ctx.fillText(f.text,f.x,y);ctx.globalAlpha=1;
  }
}

