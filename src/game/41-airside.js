/* ================= AIRSIDE: stands at any angle, rooms joined by doorways, and walking between them ================= */
// Every stand has a frame that turns plane-local coordinates into the world: x across the plane (0 on its centreline),
// y along it with the nose up (smaller y), as geom() lays out a cabin. A 'tail' stand is the old straight-line kind,
// the terminal behind the tail at TERM_Y, turned into place by its x alone, so its numbers come out exactly as before.
// A 'nose' stand parks nose-in: the building face sits FACE_Y ahead of the cabin, and the stand has a position on that
// face (x, y) and a heading h, the way the nose points in degrees clockwise from north.
const FACE_Y=22;
const XF=STAND_X.map(x=>({ox:x,oy:0,c:1,s:0,nose:false})); // per stand: {ox,oy,c,s,nose}; applyLayout fills it
const exact=v=>Math.abs(v)<1e-12?0:Math.abs(Math.abs(v)-1)<1e-12?Math.sign(v):v;
// A stand with a lean (herringbone) turns its plane by that many degrees and sets it back by 'back' from the face, while its
// bridge root and lounge stay square to the wall: those use the face frame, XF[i].face.
function standXf(s){
  if(s.h==null)return {ox:s.x,oy:0,c:1,s:0,nose:false};
  const f=(h,back)=>{const a=h*Math.PI/180,c=exact(Math.cos(a)),sn=exact(Math.sin(a)),d=FACE_Y-back;return {ox:s.x+d*sn,oy:s.y-d*c,c,s:sn,nose:true}};
  const T=f(s.h+(s.lean||0),s.lean?s.back||0:0);if(s.lean)T.face=f(s.h,0);return T;
}
// face-frame coordinates (the wall a stand's bridge and lounge are square to) to the world
function faceW(i,lx,ly){const T=XF[i].face||XF[i];WP.x=T.ox+(lx*T.c-ly*T.s);WP.y=T.oy+(lx*T.s+ly*T.c);return WP}
// plane-local to world, into one shared point that callers read straight away
const WP={x:0,y:0};
function toW(i,lx,ly){const T=XF[i];WP.x=T.ox+(lx*T.c-ly*T.s);WP.y=T.oy+(lx*T.s+ly*T.c);return WP}
const wx=(i,lx,ly)=>{const T=XF[i];return T.ox+(lx*T.c-ly*T.s)},wy=(i,lx,ly)=>{const T=XF[i];return T.oy+(lx*T.s+ly*T.c)};
function toL(i,x,y){const T=XF[i],dx=x-T.ox,dy=y-T.oy;WP.x=dx*T.c+dy*T.s;WP.y=dy*T.c-dx*T.s;return WP}
function standCtx(i){const T=XF[i];ctx.transform(T.c,T.s,-T.s,T.c,T.ox,T.oy)} // draw in stand i's own coordinates
// the stand's area in its own coordinates: across, and from the nose end to the tail end
const standArea=i=>XF[i].nose?[-150,FACE_Y+8,300,470]:[-140,44,280,TERM_Y-60];
// the stand's area as a box in the world, for the camera, taps and the guided start
function standBox(i){
  if(!XF[i].nose)return [STAND_X[i]-150,20,300,TERM_Y-20];
  const [x,y,w,h]=standArea(i);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const [a,b] of [[x,y],[x+w,y],[x,y+h],[x+w,y+h]]){toW(i,a,b);x0=Math.min(x0,WP.x);y0=Math.min(y0,WP.y);x1=Math.max(x1,WP.x);y1=Math.max(y1,WP.y)}
  return [x0,y0,x1-x0,y1-y0];
}
// where a nose-in stand's information card sits: the first of a few places (beyond the tail, then beside the plane) that
// covers no plane or building, worked out once per layout by placeBadges
const BADGE=[];
function badgeAt(i){const b=BADGE[i];if(b){WP.x=b[0];WP.y=b[1];return WP}const [,ay,,ah]=standArea(i);return toW(i,0,ay+ah+34)}
function planePieces(i,g){return [[-g.fw,g.top-64,g.fw,g.end+48],[-(g.fw+g.span),g.wingY,g.fw+g.span,g.wingY+g.span*0.55+11],[-(g.fw*0.8+14),g.end+10,g.fw*0.8+14,g.end+40]]
  .map(([a,b,c,d])=>[[a,b],[c,b],[c,d],[a,d]].map(([x,y])=>{toW(i,x,y);return [WP.x,WP.y]}))}
const cardAt=(x,y)=>[[x-48,y-30],[x+48,y-30],[x+48,y+30],[x-48,y+30]];
function placeBadges(){
  BADGE.length=0;if(!ROOMS)return;const geos=[geom(AIRCRAFT[3]),geom(AIRCRAFT[6])],planes=SIDX.map(i=>geos.flatMap(g=>planePieces(i,g)));
  for(const i of SIDX){const [,ay,,ah]=standArea(i);let pick=null;
    for(const [lx,ly] of [[0,ay+ah+34],[230,300],[-230,300],[230,120],[-230,120],[0,ay+ah+100]]){toW(i,lx,ly);const x=WP.x,y=WP.y,card=cardAt(x,y);
      if(x<48||x>W-48||y<AF_Y+40)continue;if(SIDX.some(j=>planes[j].some(A=>convexOverlap(A,card)))||ROOMS.some(r=>convexOverlap(card,r.poly)))continue;pick=[x,y];break}
    BADGE[i]=pick}
}
function standHit(i,x,y){toL(i,x,y);if(!XF[i].nose)return Math.abs(WP.x)<150&&y>=0&&y<SEC_Y;const [ax,ay,w,h]=standArea(i);return WP.x>=ax&&WP.x<=ax+w&&WP.y>=ay-40&&WP.y<=ay+h}

// Airside rooms: convex floors joined by doorways. Inside a room passengers walk straight to where they're going;
// to reach another room they walk through the doorways on the way. A layout without rooms is one straight concourse.
let ROOMS=null,ROOM_ID={},ROUTE=null;
const STAND_ROOM=[],SHOP_ROOM=[];
function buildRooms(L){
  STAND_ROOM.length=0;SHOP_ROOM.length=0;
  if(!L.rooms){ROOMS=null;ROUTE=null;ROOM_ID={};return}
  ROOMS=L.rooms;ROOM_ID={};ROOMS.forEach((r,k)=>ROOM_ID[r.id]=k);
  // for every pair of rooms, the doorway to walk to first: the shortest walk from the middle of one room to the middle of the
  // other, through doorways (worked out once per layout)
  const n=ROOMS.length,doors=(L.doors||[]).map(([a,b,x,y])=>[ROOM_ID[a],ROOM_ID[b],x,y]),mid=ROOMS.map(r=>[r.poly.reduce((a,p)=>a+p[0],0)/r.poly.length,r.poly.reduce((a,p)=>a+p[1],0)/r.poly.length]);
  const d2=(x1,y1,x2,y2)=>Math.hypot(x2-x1,y2-y1);
  ROUTE=[...Array(n)].map(()=>new Array(n).fill(null));
  for(let to=0;to<n;to++){
    const far=doors.map(([a,b,x,y])=>a===to||b===to?d2(x,y,...mid[to]):Infinity); // how far each doorway is from the destination
    for(let k=0;k<doors.length;k++)for(const [m,[a,b,x,y]] of doors.entries())for(const [i,[a2,b2,x2,y2]] of doors.entries())
      if(i!==m&&(a2===a||a2===b||b2===a||b2===b)&&far[i]+d2(x,y,x2,y2)<far[m])far[m]=far[i]+d2(x,y,x2,y2);
    for(let r=0;r<n;r++){if(r===to)continue;let best=null,bd=Infinity;
      for(const [m,[a,b,x,y]] of doors.entries()){if(a!==r&&b!==r)continue;const v=d2(...mid[r],x,y)+far[m];if(v<bd){bd=v;best=[x,y,a===r?b:a]}}
      ROUTE[r][to]=best}}
  L.stands.forEach((s,i)=>STAND_ROOM[i]=ROOM_ID[s.room||'main']??0);
  L.shops.forEach((s,j)=>SHOP_ROOM[j]=ROOM_ID[s[6]||'main']??0);
}
const ROOM_MAIN=()=>ROOMS?ROOM_ID.main??0:null;
// sets where a passenger heads next and works out the doorways on the way
function route(p,room){
  p.way=null;if(!ROOMS||room==null)return;
  if(p.room==null||p.room===room){p.room=room;return}
  const way=[];let r=p.room;
  for(let k=0;k<ROOMS.length&&r!==room;k++){const d=ROUTE[r][room];if(!d)break;way.push(d[0],d[1],d[2]);r=d[2]}
  if(way.length){p.way=way;p.wi=0}else p.room=room;
}
// walks towards the target, through any doorways first; true on arrival
function walk(p,v,dt){
  const w=p.way;
  if(w){if(moveTo(p,w[p.wi],w[p.wi+1],v,dt)){p.room=w[p.wi+2];p.wi+=3;if(p.wi>=w.length)p.way=null}return false}
  return moveTo(p,p.tx,p.ty,v,dt);
}
// a 2D remote stand: passengers wait by its bus gate in the terminal ([x, y, 1 if the lounge is below the gate else -1])
// and ride a bus along its road out to the stairs
const busGate=i=>XF[i].nose&&STAND_KIND[i]==='remote'?LAY.stands[i].gate:null;
const roomWalk=p=>ROOMS&&p.room!=null&&ROOMS[p.room].walk||1;
function inPoly(P,x,y){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [xi,yi]=P[i],[xj,yj]=P[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
// What's wrong with a 2D layout, if anything: planes touching each other or a building, lounges and shops outside
// their rooms, doorways that don't join their rooms, rooms that aren't convex or can't be reached, or things off the map.
// Checked for the longest narrowbody and for the widebody. The rules check runs it on every layout with rooms.
function convexOverlap(A,B){for(const P of [A,B])for(let i=0;i<P.length;i++){const [x1,y1]=P[i],[x2,y2]=P[(i+1)%P.length],nx=y2-y1,ny=x1-x2;
  let a0=1e18,a1=-1e18,b0=1e18,b1=-1e18;for(const [x,y] of A){const d=x*nx+y*ny;a0=Math.min(a0,d);a1=Math.max(a1,d)}for(const [x,y] of B){const d=x*nx+y*ny;b0=Math.min(b0,d);b1=Math.max(b1,d)}
  if(a1<=b0+1e-6||b1<=a0+1e-6)return false}return true}
const edgeDist=(P,x,y)=>Math.min(...P.map(([x1,y1],k)=>{const [x2,y2]=P[(k+1)%P.length],dx=x2-x1,dy=y2-y1,t=clamp(((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(x1+dx*t-x,y1+dy*t-y)}));
function layoutFaults(id){
  const L=LAYOUTS[id],bad=[],keep=G.layout;if(!L.rooms)return bad;
  applyLayout(id);
  const geos=[geom(AIRCRAFT[3]),geom(AIRCRAFT[6])],planes=SIDX.map(i=>geos.flatMap(g=>planePieces(i,g)));
  ROOMS.forEach(r=>{const P=r.poly,n=P.length;let sgn=0;for(let k=0;k<n;k++){const [a,b]=P[k],[c,d]=P[(k+1)%n],[e,f]=P[(k+2)%n],cr=Math.sign((c-a)*(f-d)-(d-b)*(e-c));if(cr&&sgn&&cr!==sgn){bad.push(`room ${r.id} isn't convex`);break}if(cr)sgn=cr}
    if(r.id!=='main'&&!ROUTE[ROOM_ID[r.id]][ROOM_ID.main])bad.push(`room ${r.id} can't be reached`)});
  for(const [a,b,x,y] of L.doors||[])for(const r of [a,b])if(ROOM_ID[r]==null||edgeDist(ROOMS[ROOM_ID[r]].poly,x,y)>3)bad.push(`doorway ${a}–${b} isn't on the wall of ${r}`);
  SIDX.forEach(i=>{
    for(let j=i+1;j<SIDX.length;j++)if(planes[i].some(A=>planes[j].some(B=>convexOverlap(A,B))))bad.push(`${GATES[i]} and ${GATES[j]} touch`);
    ROOMS.forEach(r=>{if(planes[i].some(A=>convexOverlap(A,r.poly)))bad.push(`${GATES[i]} touches room ${r.id}`)});
    if(planes[i].some(A=>A.some(([x,y])=>x<0||x>W||y<AF_Y+40||y>SEC_Y)))bad.push(`${GATES[i]} is off the apron`);
    const room=ROOMS[STAND_ROOM[i]].poly;for(const j of [0,15,64,79]){const s=spotPos(i,j);if(!inPoly(room,s.x,s.y))bad.push(`${GATES[i]}'s lounge is outside its room`)}
    const bg=busGate(i);if(bg){if(!inPoly(room,bg[0],bg[1]+bg[2]*4))bad.push(`${GATES[i]}'s bus gate isn't in its room`);const P=paths(i,geos[0]).bridge.pts;
      for(let k=0;k+1<P.length;k++){const [x1,y1]=P[k],[x2,y2]=P[k+1],l=Math.hypot(x2-x1,y2-y1)||1,nx=-(y2-y1)/l*6,ny=(x2-x1)/l*6,seg=[[x1+nx,y1+ny],[x2+nx,y2+ny],[x2-nx,y2-ny],[x1-nx,y1-ny]];
        SIDX.forEach(j=>{if(j!==i&&planes[j].some(A=>convexOverlap(A,seg)))bad.push(`${GATES[i]}'s bus road crosses ${GATES[j]}`)})}}
    else{faceW(i,-118,FACE_Y);if(edgeDist(room,WP.x,WP.y)>3)bad.push(`${GATES[i]}'s bridge doesn't start on its room's wall`)}
    if(!BADGE[i])bad.push(`${GATES[i]}'s card has nowhere clear to go`);
  });
  L.shops.forEach((s,j)=>{const room=ROOMS[SHOP_ROOM[j]].poly;for(const [t,e] of [[2,2],[116,2],[116,38],[2,38],[59,47]]){shopPt(j,t,e);if(!inPoly(room,WP.x,WP.y)){bad.push(`shop ${j} (${s[1]}) is outside its room`);break}}
    L.shops.forEach((o,k)=>{if(k>j&&o[4]===s[4]&&(o[5]||0)===(s[5]||0)&&Math.abs(o[0]-s[0])<120&&Math.abs((o[4]??452)-(s[4]??452))<40)bad.push(`shops ${j} and ${k} overlap`)})});
  applyLayout(keep);return bad;
}
