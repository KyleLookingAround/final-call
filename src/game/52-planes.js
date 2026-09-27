/* ================= PLANES: the aircraft on the stands and the runway's small planes ================= */
// Drawing only (docs/specs/real-airport.md): a soft shadow on the apron, engines under the wings, the airline's colour on
// the tail and the engines' cowls, and at night wingtip, tail and beacon lights through LIGHTS. Fine detail (inlets, flap
// lines) only when zoomed in. Nothing here changes the game: what it keeps is its own and rebuilt each frame.
const PL_SUN={x:9,y:14}; // the shadow's offset on the ground in world units, the same way whichever way a stand faces
const PL_LIT=[]; // this frame's plane lights, five numbers each: world x, y, kind (PL_LAMP), strength and size
let PL_LAST=0; // how many plane lights the last airport frame had (the planes check reads it)
const PL_PATHS=new WeakMap(); // each aircraft shape's wings and tailplane, body, and both together, built once
let PL_MINI=null; // the small plane's outline, built on first use
// port red, starboard green, the white tail light, the red beacon (flashing, while the engines run) and wingtip strobes
const PL_LAMP=[[14,'255,70,70',0.75],[14,'80,255,130',0.75],[10,'255,250,235',0.55],[40,'255,50,35',0.6],[30,'255,255,255',0.7]];
const plApron=()=>R.view!=='region'&&R.view!=='world';
// a light at stand i's local (x,y), or (with no stand) at a point of the canvas's current transform
function plLight(i,x,y,kind,a,sz){
  if(i<0){const m=ctx.getTransform(),s=V.k*R.dpr;PL_LIT.push((m.a*x+m.c*y+m.e)/s+R.cam.x,(m.b*x+m.d*y+m.f)/s+R.cam.y,kind,a,sz);return}
  toW(i,x,y);PL_LIT.push(WP.x,WP.y,kind,a,1);
}
// both sides of a shape drawn the same way round, so overlapping parts fill as one
function plSide(p,pts,sx,sy=1){const q=sx*sy>0?pts:pts.slice().reverse();q.forEach(([x,y],k)=>k?p.lineTo(sx*x,sy*y):p.moveTo(sx*x,sy*y));p.closePath()}
function planePaths(g){
  let P=PL_PATHS.get(g);if(P)return P;
  const fw=g.fw,top=g.top,end=g.end,sw=g.span*0.55,wing=new Path2D(),body=new Path2D(),all=new Path2D(),flap=new Path2D();
  for(const s of [-1,1]){
    plSide(wing,[[fw,g.wingY],[fw+g.span,g.wingY+sw],[fw+g.span,g.wingY+sw+11],[fw,g.wingY+g.chord]],s);
    plSide(wing,[[6,end+10],[fw*0.8+14,end+32],[fw*0.8+14,end+40],[6,end+34]],s);
    flap.moveTo(s*(fw+4),g.wingY+g.chord-7);flap.lineTo(s*(fw+g.span*0.7),g.wingY+sw*0.7+7);
  }
  body.moveTo(-fw,top+10);body.bezierCurveTo(-fw,top-30,-fw*0.55,top-62,0,top-64);body.bezierCurveTo(fw*0.55,top-62,fw,top-30,fw,top+10);
  body.lineTo(fw,end);body.bezierCurveTo(fw,end+22,10,end+46,0,end+48);body.bezierCurveTo(-10,end+46,-fw,end+22,-fw,end);body.closePath();
  all.addPath(wing);all.addPath(body);
  P={wing,body,all,flap};PL_PATHS.set(g,P);return P;
}
function drawPlane(F,i,offY,tow,alpha){
  const g=F.geo,ac=F.ac,fw=g.fw,top=g.top,end=g.end,P=planePaths(g),liv=F.liv||livery(),fine=V.k>=0.55,prop=ac.short==='T-72';
  ctx.save();ctx.globalAlpha=alpha??1;standCtx(i);ctx.translate(0,offY);
  // the shadow: the sun's offset turned into the stand's frame, twice, for a darker middle inside a lighter edge
  const T=XF[i],sx=PL_SUN.x*T.c+PL_SUN.y*T.s,sy=-PL_SUN.x*T.s+PL_SUN.y*T.c;
  ctx.fillStyle=`rgba(0,0,0,${0.2*(1-V.d)})`;ctx.translate(sx*1.3,sy*1.3);ctx.fill(P.all);ctx.translate(-sx*0.5,-sy*0.5);ctx.fill(P.all);ctx.translate(-sx*0.8,-sy*0.8);
  // engines under the wings: only the cowl in front of the wing shows, in the airline's colour
  const ew=clamp(fw*0.3,10,15),ef=0.36,le=g.wingY+g.span*0.55*ef;
  for(const s of [-1,1]){const ex=s*(fw+g.span*ef),ln=prop?24:20;
    ctx.fillStyle='#8C97A1';rrect(ex-ew/2,le-ln,ew,ln+12,ew/2);ctx.fill();
    ctx.fillStyle=liv;ctx.fillRect(ex-ew/2,le-ln+4,ew,5);
    if(fine&&!prop){ctx.fillStyle='#2A3037';ctx.fillRect(ex-ew/2+2,le-ln,ew-4,2.5)}
    if(prop){ctx.fillStyle='#39414A';ctx.beginPath();ctx.arc(ex,le-ln,2.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(40,46,54,.45)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ex-16,le-ln-1);ctx.lineTo(ex+16,le-ln-1);ctx.stroke()}
  }
  ctx.fillStyle='#A9B3BC';ctx.fill(P.wing);
  if(fine){ctx.strokeStyle='rgba(20,26,32,.2)';ctx.lineWidth=1;ctx.stroke(P.flap)}
  const tx=fw+g.span,ty=g.wingY+g.span*0.55+3;ctx.fillStyle='#E5484D';ctx.fillRect(-tx,ty,2.5,5);ctx.fillStyle='#3FCB6E';ctx.fillRect(tx-2.5,ty,2.5,5);
  ctx.fillStyle='#CDD4DA';ctx.fill(P.body);
  ctx.fillStyle='#22303C';ctx.beginPath();ctx.moveTo(-fw*0.55,top-30);ctx.quadraticCurveTo(0,top-50,fw*0.55,top-30);ctx.lineTo(fw*0.5,top-25);ctx.quadraticCurveTo(0,top-41,-fw*0.5,top-25);ctx.closePath();ctx.fill();
  ctx.fillStyle=liv;ctx.beginPath();ctx.moveTo(-3.5,end+4);ctx.lineTo(3.5,end+4);ctx.lineTo(1.4,end+47);ctx.lineTo(-1.4,end+47);ctx.closePath();ctx.fill(); // the fin
  ctx.fillRect(-fw,top+2,3,end-top-6);ctx.fillRect(fw-3,top+2,3,end-top-6);
  // the cabin, open to show its seats and passengers
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
  // its lights, lit by the lighting pass: the beacon flashes while it's towed in or pushed back
  if(V.d>0){const a=alpha??1;plLight(i,-tx+1,ty+offY+2,0,a);plLight(i,tx-1,ty+offY+2,1,a);plLight(i,0,end+48+offY,2,a);
    if(tow||F.plane.state==='closing')plLight(i,0,g.wingY+g.chord*0.5+offY,3,a)}
}
// a small plane, nose along +x: the runway's and the maps'. On the airport view it has engines and a shadow of its own
// while on the ground, and lights at night; the runway draws an airborne plane's shadow as a faint, colourless plane.
function miniPlane(x,y,ang,sc,alpha,col){
  const apron=plApron(),a=alpha??1,shade=apron&&!col&&a<0.3;
  if(!PL_MINI){PL_MINI=new Path2D();PL_MINI.roundRect?PL_MINI.roundRect(-14,-2.4,28,4.8,2.4):PL_MINI.rect(-14,-2.4,28,4.8);
    for(const s of [-1,1]){plSide(PL_MINI,[[3,2],[-4,13],[-7.5,13],[-3.5,2]],1,s);plSide(PL_MINI,[[-10,1.5],[-14,6],[-16,6],[-14,1]],1,s)}}
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(sc,sc);ctx.globalAlpha=a;
  if(apron&&!shade&&sc>=0.9&&sc<=1.05){const c=Math.cos(ang),s=Math.sin(ang),wx=PL_SUN.x*0.25,wy=PL_SUN.y*0.25; // on the ground
    ctx.fillStyle=`rgba(0,0,0,${0.22*(1-V.d)})`;const lx=(wx*c+wy*s)/sc,ly=(-wx*s+wy*c)/sc;ctx.translate(lx,ly);ctx.fill(PL_MINI);ctx.translate(-lx,-ly)}
  if(apron&&!shade){ctx.fillStyle='#8C97A1';for(const s of [-1,1])ctx.fillRect(-2,s*6.3-1.1,5.5,2.2)}
  ctx.fillStyle=shade?'#05080C':col||'#CDD4DA';ctx.fill(PL_MINI);
  if(!shade){ctx.fillStyle=livery();ctx.fillRect(-14.5,-0.7,5,1.4);if(apron)for(const s of [-1,1])ctx.fillRect(2,s*6.3-1.1,1.5,2.2)}
  if(apron&&!shade&&V.d>0){const z=0.4*sc;plLight(-1,-6,-13,0,a,z);plLight(-1,-6,13,1,a,z);plLight(-1,-16,0,2,a,z);plLight(-1,0,0,3,a,z);
    if((V.t*0.8+x*0.003)%1<0.08){plLight(-1,-6,-13.5,4,a,z);plLight(-1,-6,13.5,4,a,z)}}
  ctx.restore();
}
// the planes' lights: steady wingtip and tail lights, the beacon flashing about once a second (each plane in its own time)
LIGHTS.push(V=>{const d=V.d*2;for(let j=0;j<PL_LIT.length;j+=5){const x=PL_LIT[j],y=PL_LIT[j+1],k=PL_LIT[j+2],[r,rgb,s]=PL_LAMP[k];
  if(k===3&&(V.t*1.1+x*0.013+y*0.007)%1>0.14)continue;lamp(x,y,r*PL_LIT[j+4],rgb,s*PL_LIT[j+3]*d)}});
LAYER.top.push(()=>{PL_LAST=PL_LIT.length/5;PL_LIT.length=0});
Object.assign(SIMX,{drawPlane,miniPlane,livery,PL_SUN,plLast:()=>PL_LAST});
