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
  // a built stand's paint (lead-in, stop bar, safety lines, number) is on the apron layer: 51-markings.js
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
  // the baggage cart is drawn with the rest of the turnaround's vehicles: 55-vehicles.js
}
function paxColor(p){
  if(LAND_ST.has(p.state))return p.fast||p.biz?'#F5D08A':LAND_C;
  return GROUPC[groupOf(p)];
}
const BUGGY_ST=new Set(['walkIn','toShop','toGate','gate','toArr','exitW','toReclaim','queue','secQ','ftQ']);
// riding something drawn in their place: a train (drawLinks), the people mover (its cars, below) or a bus to a remote stand
const paxHidden=p=>p.riding||onMover(p)||(p.state==='bridge'||p.state==='dBridge')&&STAND_KIND[p.stand]==='remote';
// Where a passenger is drawn (p.ex, p.ey) follows where they are, its speed changing by at most EASE_K each 1× frame step
// (EASE_STEP game minutes; twice as quick on a walkway link, which they're seen stepping onto), so a change of pace takes
// a fraction of a second rather than one frame. It never runs ahead,
// and snaps to them when they appear, after time out of sight, or when they jump further than EASE_SNAP. Drawing only:
// the game moves p.x and p.y as before, and a drawn passenger is never more than a step or two behind.
const EASE_K=1.45,EASE_STEP=0.034,EASE_V0=40,EASE_SNAP=80;
function paxEase(p){
  const dt=G.clock-p.et;p.et=G.clock;
  if(!(dt>=0&&dt<=0.5)||Math.hypot(p.x-p.ex,p.y-p.ey)>EASE_SNAP){p.ex=p.esx=p.x;p.ey=p.esy=p.y;p.ev=0;p.snap=true;return}
  p.snap=false;if(!dt)return;
  const dx=p.x-p.ex,dy=p.y-p.ey,d=Math.hypot(dx,dy),vs=Math.hypot(p.x-p.esx,p.y-p.esy)/dt;p.esx=p.x;p.esy=p.y;
  if(d<1e-3){p.ex=p.x;p.ey=p.y;p.ev=0;return}
  const k=Math.pow(p.way&&p.way[p.wi+3]===2?EASE_K*EASE_K:EASE_K,dt/EASE_STEP),v=clamp(vs+Math.min(d/0.5,0.12*vs+8),p.ev/k,Math.max(p.ev,EASE_V0)*k),s=Math.min(v*dt,d); // catching up a little faster than they walk
  p.ex+=dx/d*s;p.ey+=dy/d*s;p.ev=s/dt;
}
const unEase=p=>{p.et=NaN}; // out of sight: snap back on reappearing
// the people mover's cars: one on the track beside each group of riders, or one shuttling when nobody rides
const MV_AT=[];
function trackNear(P,x,y){let bx=0,by=0,bd=Infinity,vert=false;for(const g of P.segs){const [x1,y1]=g.a,[x2,y2]=g.b,ux=x2-x1,uy=y2-y1,t=clamp(((x-x1)*ux+(y-y1)*uy)/(g.len*g.len||1),0,1),qx=x1+ux*t,qy=y1+uy*t,d=Math.hypot(qx-x,qy-y);
  if(d<bd){bd=d;bx=qx;by=qy;vert=Math.abs(uy)>Math.abs(ux)}}return [bx,by,vert]}
function drawMover(){
  if(!(G.lv.mover&&G.pierB&&LAY.track)||roofA()){MV_AT.length=0;return} // its track runs inside the halls
  const P=LAY.trackP||(LAY.trackP=mkPath(LAY.track)),car=(x,y,vert)=>{ctx.fillStyle='#5CC8FF';vert?rrect(x-5,y-12,10,24,3):rrect(x-12,y-5,24,10,3);ctx.fill()};
  if(!MV_AT.length){const t=(performance.now()/1000*0.12)%2,q=ptAt(P,(t<1?t:2-t)*P.len),s=(t<1?t:2-t)*P.len;car(q[0],q[1],s>P.segs[0].len);return} // cosmetic
  const done=new Set();for(let k=0;k<MV_AT.length;k+=2){const [x,y,vert]=trackNear(P,MV_AT[k],MV_AT[k+1]),key=Math.round(x/90)+','+Math.round(y/90);if(done.has(key))continue;done.add(key);car(x,y,vert)}
  MV_AT.length=0;
}
// Only the floor shown: on the roof, nobody under it; on a floor of halls, nobody whose room is on the other one (53-roofs.js).
// The dots are drawn in batches by look (PAX_B), zoomed out as one path each, with what goes under them (buggies) before and the marks
// that go over them (bags, laptops, a shuffle ring) after: thousands of passengers cost a few dozen fills, not two each.
const PAX_B=new Map(),PAX_V=[]; // look → [x, y, r, …] this frame; the passengers drawn this frame
function paxDot(fill,stroke,lw,x,y,r){const k=fill+stroke+lw;let a=PAX_B.get(k);if(!a){a=[];a.f=fill;a.s=stroke;a.w=lw;PAX_B.set(k,a)}a.push(x,y,r)}
function drawPax(V){
  const roof=roofA()?roofNow():null,fl=floorNow(),vx0=V.x0-10,vx1=V.x1+10,vy0=V.y0-10,vy1=V.y1+10;PAX_V.length=0;
  for(const p of R.pax){
    if(p.x<vx0||p.x>vx1||p.y<vy0||p.y>vy1){unEase(p);continue}
    if(paxHidden(p)){if(!p.riding&&onMover(p)&&!roof)MV_AT.push(p.x,p.y);unEase(p);continue} // on the mover: drawn as its car
    if(!roof){const r=p.fl??(p.room!=null&&ROOMS?ROOMS[p.room].fl:null);if(r!=null&&r!==fl){unEase(p);continue}}
    paxEase(p);const x=p.ex,y=p.ey;if(roof&&underRoof(roof,x,y))continue;
    const inCabin=p.state==='aisle'||p.state==='sitting'||p.state==='dAisle',r=inCabin?clamp(p.F.geo.pitch*0.42,2.7,3.8):3;
    PAX_V.push(p);
    if(p.inbound){paxDot('#14171B',p.xfer?'#6BE39A':p.stand===R.sel?'#ECE8DF':'#9FC2E0',1.5,x,y,r);continue}
    if(!inCabin&&p.type==='prm'&&BUGGY_ST.has(p.state)){if(G.lv.assist){ctx.fillStyle='#CDD4DA';rrect(x-5.5,y-2.2,11,6,1.6);ctx.fill();ctx.fillStyle='#14171B';ctx.fillRect(x-4,y+3.2,2,1.2);ctx.fillRect(x+2,y+3.2,2,1.2)}else{ctx.strokeStyle='#909AA4';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(x+r+0.5,y+r);ctx.lineTo(x+r+0.5,y-r*0.4);ctx.lineTo(x+r+3,y-r*0.4);ctx.lineTo(x+r+3,y+r);ctx.stroke()}}
    const mark=!inCabin&&(p.xferred||p.stand===R.sel||p.type==='grp');
    paxDot(paxColor(p),!inCabin&&p.xferred?'#6BE39A':!inCabin&&p.stand===R.sel?'#ECE8DF':!inCabin&&p.type==='grp'?'#FF7AB6':'#14171B',mark?1.1:1,x,y,p.kid?r*0.68:r);
  }
  const one=V.z>=0.6; // close up, a circle on its own fills quicker than one in a big path
  for(const a of PAX_B.values()){if(!a.length)continue;ctx.fillStyle=a.f;ctx.strokeStyle=a.s;ctx.lineWidth=a.w;
    if(one)for(let j=0;j<a.length;j+=3){ctx.beginPath();ctx.arc(a[j],a[j+1],a[j+2],0,Math.PI*2);ctx.fill();ctx.stroke()}
    else{ctx.beginPath();for(let j=0;j<a.length;j+=3){ctx.moveTo(a[j]+a[j+2],a[j+1]);ctx.arc(a[j],a[j+1],a[j+2],0,Math.PI*2)}ctx.fill();ctx.stroke()}
    a.length=0}
  for(const p of PAX_V){const x=p.ex,y=p.ey,inCabin=p.state==='aisle'||p.state==='sitting'||p.state==='dAisle',r=inCabin?clamp(p.F.geo.pitch*0.42,2.7,3.8):3;
    if(p.inbound){
      if(p.state==='dAisle'&&p.phase==='grab'){ctx.fillStyle='#D9A066';ctx.fillRect(x+r,y-r-2,4,4)}
      if(p.state==='exitW'&&p.checked){ctx.fillStyle='#D9A066';ctx.fillRect(x+r-1,y-1,4,4)}
      continue}
    if(p.type==='work'&&!inCabin&&!p.kid){ctx.fillStyle='#0E1114';ctx.fillRect(x+r-0.4,y+0.2,2.8,2.3)}
    if(p.state==='aisle'){
      if(p.phase==='stow'){ctx.fillStyle='#D9A066';ctx.fillRect(x+r,y-r-2,4,4)}
      else if(p.phase==='shuffle'){ctx.strokeStyle='#FF7A8A';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(x,y,r+2.2,0,Math.PI*2);ctx.stroke()}
    }
  }
  PAX_V.length=0;drawMover();
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
    rwyMarks(y,h,r); // its markings, and its edge lights by night: 51-markings.js
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
function darkness(){const h=(G.clock/60)%24;if(h<5||h>=21)return 0.5;if(h<7)return 0.5*(7-h)/2;if(h>=19)return 0.5*(h-19)/2;return 0}
function draw(){
  if(R.view==='region'){drawRegion();return}
  if(R.view==='world'){drawWorld();return}
  sceneView(derived());for(let j=0;j<LAYERS.length;j++)layer(LAYERS[j]); // the frame's view and the layers: 50-scene.js
}
// the ground under everything, and the airfield: runways, the tower, the fire station, fuel and solar farms
LAYER.airfield.push(V=>{ctx.fillStyle='#14171B';ctx.fillRect(0,Y0,W,Y1-Y0);drawAirfield(V.d)});
// the apron's grid and the taxiway along its top (its centre line and edge lights: 51-markings.js), and the layout's own
// apron furniture (40-layout-drawing.js)
LAYER.apron.push(()=>{
  ctx.strokeStyle='#1A1E23';ctx.lineWidth=1;ctx.beginPath();for(let x=0;x<=W;x+=50){ctx.moveTo(x+.5,AF_Y+32);ctx.lineTo(x+.5,TERM_Y)}for(let y=AF_Y+50;y<TERM_Y;y+=50){ctx.moveTo(0,y+.5);ctx.lineTo(W,y+.5)}ctx.stroke();
  ctx.fillStyle='#101316';ctx.fillRect(0,AF_Y,W,32);drawPlanApron()});
LAYER.stands.push(V=>{for(const i of SIDX){const b=standBox(i);if(b[0]+b[2]<V.x0||b[0]>V.x1)continue;drawStandApron(i)}});
LAYER.bridges.push(()=>{for(const i of SIDX)drawBridge(i)});
LAYER.pax.push(drawPax);
LAYER.signs.push(()=>{for(const i of SIDX){if(G.stands[i].built)gateBadge(i)}}); // each queue's sign follows: 42-terminal.js
