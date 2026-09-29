/* ================= AIRSIDE: stands at any angle, rooms joined by doorways, and walking between them ================= */
// Every stand has a frame that turns plane-local coordinates into the world: x across the plane (0 on its centreline),
// y along it with the nose up (smaller y), as geom() lays out a cabin. Planes park nose-in: the building face sits FACE_Y
// ahead of the cabin, and the stand has a position on that face (x, y) and a heading h, the way the nose points in
// degrees clockwise from north.
const FACE_Y=22;
const XF=[]; // per stand: {ox,oy,c,s} and, for a leaning stand, its face frame; applyLayout fills it
const exact=v=>Math.abs(v)<1e-12?0:Math.abs(Math.abs(v)-1)<1e-12?Math.sign(v):v;
// A stand with a lean (herringbone) turns its plane by that many degrees and sets it back by 'back' from the face, while its
// bridge root and lounge stay square to the wall: those use the face frame, XF[i].face.
function standXf(s){
  const f=(h,back)=>{const a=h*Math.PI/180,c=exact(Math.cos(a)),sn=exact(Math.sin(a)),d=FACE_Y-back;return {ox:s.x+d*sn,oy:s.y-d*c,c,s:sn}};
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
const standArea=()=>[-150,FACE_Y+8,300,470];
// the stand's area as a box in the world, for the camera, taps and the guided start
function standBox(i){
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
function standHit(i,x,y){toL(i,x,y);const [ax,ay,w,h]=standArea(i);return WP.x>=ax&&WP.x<=ax+w&&WP.y>=ay-40&&WP.y<=ay+h}

// Airside rooms: convex floors joined by doorways and links (a floor link, an escalator or lift between the terminal's two
// floors, is a doorway here: 42-terminal.js). Inside a room passengers walk straight to where they're going;
// to reach another room they walk through the doorways, and ride the links, on the way.
let ROOMS=null,ROOM_ID={},ROUTE=null;
const STAND_ROOM=[],SHOP_ROOM=[];
function buildRooms(L){
  STAND_ROOM.length=0;SHOP_ROOM.length=0;
  if(!L.rooms){ROOMS=null;ROUTE=null;ROOM_ID={};return}
  ROOMS=L.rooms;ROOM_ID={};ROOMS.forEach((r,k)=>ROOM_ID[r.id]=k);
  // Ways between rooms: every doorway both ways, and every link (a train, or a tunnel with moving walkways) from its station in
  // one room to its station in the other. For every pair of rooms, the way to take first is the one on the quickest trip from
  // the middle of one to the middle of the other, worked out once per layout; a ride counts as the walk it saves plus the wait.
  const n=ROOMS.length,mid=ROOMS.map(r=>[r.poly.reduce((a,p)=>a+p[0],0)/r.poly.length,r.poly.reduce((a,p)=>a+p[1],0)/r.poly.length]),d2=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
  const ways=[];
  // a floor link (an escalator or lift, 42-terminal.js) is a doorway that costs its ride; its step is 10 + its index in the
  // layout's doorways, and each passenger picks which of the links between the two rooms to take as they route (pickLink)
  (L.doors||[]).forEach((d,j)=>{const [a,b,x,y]=d,lk=isFloorLink(d);for(const [f,t] of [[a,b],[b,a]])ways.push({fr:ROOM_ID[f],nx:ROOM_ID[t],en:[x,y],ex:[x,y],c:lk?LINK_C:0,m:lk?10+j:0})});
  for(const [a,b,pa,pb,kind] of L.links||[]){const tr=kind==='train',len=d2(pa,pb),c=tr?len*0.12+TRAIN_EVERY*0.5*90:len*0.5;
    for(const [f,t,e,x] of [[a,b,pa,pb],[b,a,pb,pa]])ways.push({fr:ROOM_ID[f],nx:ROOM_ID[t],en:e,ex:x,c,m:tr?1:2})}
  ROUTE=[...Array(n)].map(()=>new Array(n).fill(null));
  for(let to=0;to<n;to++){
    const go=ways.map(w=>w.nx===to?d2(w.ex,mid[to]):Infinity); // from coming out of each way to the destination
    for(let pass=0;pass<ways.length;pass++){let changed=false;
      ways.forEach((w,k)=>{if(w.nx===to)return;for(const [k2,w2] of ways.entries())if(w2.fr===w.nx&&w2.nx!==w.fr){const v=d2(w.ex,w2.en)+w2.c+go[k2];if(v<go[k]){go[k]=v;changed=true}}});if(!changed)break}
    for(let r=0;r<n;r++){if(r===to)continue;let best=null,bd=Infinity;
      ways.forEach((w,k)=>{if(w.fr!==r)return;const v=d2(mid[r],w.en)+w.c+go[k];if(v<bd){bd=v;best=w}});ROUTE[r][to]=best}}
  L.stands.forEach((s,i)=>STAND_ROOM[i]=ROOM_ID[s.room||'main']??0);
  L.shops.forEach((s,j)=>SHOP_ROOM[j]=ROOM_ID[s[6]||'main']??0);
}
const ROOM_MAIN=()=>ROOMS?ROOM_ID.main??0:null;
// sets where a passenger heads next and works out the doorways on the way
function route(p,room){
  p.way=null;if(!ROOMS||room==null)return;
  if(p.room==null||p.room===room){p.room=room;return}
  const way=[];let r=p.room; // four numbers a step: where to, the room it leads into, and how (0 walk, 1 train, 2 moving walkway, 10+ a floor link)
  for(let k=0;k<ROOMS.length&&r!==room;k++){const d=ROUTE[r][room];if(!d)break;
    if(d.m>=10){const j=pickLink(p,d.m-10),L=ROOM_DOORS[j];way.push(L[2],L[3],d.nx,10+j)} // queued for and ridden at its spot (walk)
    else{if(d.m)way.push(d.en[0],d.en[1],r,0);way.push(d.ex[0],d.ex[1],d.nx,d.m)}r=d.nx}
  p.rideAt=null;if(way.length){p.way=way;p.wi=0}else p.room=room;
}
// walks towards the target, through any doorways and along any links first; true on arrival. A train leaves each station
// every TRAIN_EVERY game minutes; riders are hidden and drawn as the train.
const TRAIN_EVERY=2,TRAIN_V=900;
function walk(p,v,dt){
  const w=p.way;
  if(w){const k=p.wi,m=w[k+3];let sp=v;
    if(m>=10){if(rideLink(p,m-10,w[k+2],v,dt)){(p.doors||(p.doors=[])).push(p.x,p.y);p.room=w[k+2];p.rideAt=null;p.wi+=4;if(p.wi>=w.length)p.way=null}return false}
    if(m===1){if(!p.riding){if(p.rideAt==null)p.rideAt=Math.ceil(G.clock/TRAIN_EVERY+1e-9)*TRAIN_EVERY;if(G.clock<p.rideAt)return false;p.riding=true}sp=TRAIN_V}
    else if(m===2)sp=v*2;
    if(moveTo(p,w[k],w[k+1],sp,dt)){(p.doors||(p.doors=[])).push(w[k],w[k+1]);p.room=w[k+2];p.riding=false;p.rideAt=null;p.wi+=4;if(p.wi>=w.length)p.way=null}
    return false}
  return moveTo(p,p.tx,p.ty,v,dt);
}
// a 2D remote stand: passengers wait by its bus gate in the terminal ([x, y, 1 if the lounge is below the gate else -1])
// and ride a bus along its road out to the stairs
const busGate=i=>STAND_KIND[i]==='remote'?LAY.stands[i].gate:null;
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
    const root=r.land?'out':'main';if(r.id!==root&&!ROUTE[ROOM_ID[r.id]][ROOM_ID[root]])bad.push(`room ${r.id} can't be reached`)}); // landside halls from outside, airside ones from the concourse
  bad.push(...terminalFaults());
  // floors: a room's is 0, 1, 2 (the roof terrace) or none; a doorway is on the wall of both its rooms and joins one floor, and a floor link stands
  // in both its rooms and joins two
  ROOMS.forEach(r=>{if(r.fl!=null&&r.fl!==0&&r.fl!==1&&r.fl!==2)bad.push(`room ${r.id} has no floor ${r.fl}`)});
  const flOf=id=>ROOM_ID[id]!=null?ROOMS[ROOM_ID[id]].fl:undefined;
  for(const d of ROOM_DOORS){const [a,b,x,y]=d,fa=flOf(a),fb=flOf(b);
    if(isFloorLink(d)){for(const r of [a,b])if(ROOM_ID[r]==null||!(inPoly(ROOMS[ROOM_ID[r]].poly,x,y)||edgeDist(ROOMS[ROOM_ID[r]].poly,x,y)<=3))bad.push(`the ${d[5]==='lift'?'lift':'escalator'} ${a}–${b} isn't in ${r}`);
      if(fa==null||fb==null||fa===fb)bad.push(`the ${d[5]==='lift'?'lift':'escalator'} ${a}–${b} doesn't join two floors`);continue}
    for(const r of [a,b])if(ROOM_ID[r]==null||edgeDist(ROOMS[ROOM_ID[r]].poly,x,y)>3)bad.push(`doorway ${a}–${b} isn't on the wall of ${r}`);
    if(fa!=null&&fb!=null&&fa!==fb)bad.push(`doorway ${a}–${b} joins two floors`)}
  for(const [a,b,pa,pb] of L.links||[])for(const [r,[x,y]] of [[a,pa],[b,pb]])if(ROOM_ID[r]==null||!inPoly(ROOMS[ROOM_ID[r]].poly,x,y))bad.push(`the link ${a}–${b} has no station in ${r}`);
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
