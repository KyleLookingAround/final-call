/* ================= AIRSIDE: stands at any angle, rooms joined by doorways, and walking between them ================= */
// Every stand has a frame that turns plane-local coordinates into the world: x across the plane (0 on its centreline),
// y along it with the nose up (smaller y), as geom() lays out a cabin. A 'tail' stand is the old straight-line kind,
// the terminal behind the tail at TERM_Y, turned into place by its x alone, so its numbers come out exactly as before.
// A 'nose' stand parks nose-in: the building face sits FACE_Y ahead of the cabin, and the stand has a position on that
// face (x, y) and a heading h, the way the nose points in degrees clockwise from north.
const FACE_Y=22;
const XF=STAND_X.map(x=>({ox:x,oy:0,c:1,s:0,nose:false})); // per stand: {ox,oy,c,s,nose}; applyLayout fills it
const exact=v=>Math.abs(v)<1e-12?0:Math.abs(Math.abs(v)-1)<1e-12?Math.sign(v):v;
function standXf(s){
  if(s.h==null)return {ox:s.x,oy:0,c:1,s:0,nose:false};
  const a=s.h*Math.PI/180,c=exact(Math.cos(a)),sn=exact(Math.sin(a));
  return {ox:s.x+FACE_Y*sn,oy:s.y-FACE_Y*c,c,s:sn,nose:true};
}
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
function standHit(i,x,y){toL(i,x,y);if(!XF[i].nose)return Math.abs(WP.x)<150&&y>=0&&y<SEC_Y;const [ax,ay,w,h]=standArea(i);return WP.x>=ax&&WP.x<=ax+w&&WP.y>=ay-40&&WP.y<=ay+h}

// Airside rooms: convex floors joined by doorways. Inside a room passengers walk straight to where they're going;
// to reach another room they walk through the doorways on the way. A layout without rooms is one straight concourse.
let ROOMS=null,ROOM_ID={},ROUTE=null;
const STAND_ROOM=[],SHOP_ROOM=[];
function buildRooms(L){
  STAND_ROOM.length=0;SHOP_ROOM.length=0;
  if(!L.rooms){ROOMS=null;ROUTE=null;ROOM_ID={};return}
  ROOMS=L.rooms;ROOM_ID={};ROOMS.forEach((r,k)=>ROOM_ID[r.id]=k);
  // for every pair of rooms, the doorway to walk to first: a breadth-first search back from each destination
  const n=ROOMS.length,doors=(L.doors||[]).map(([a,b,x,y])=>[ROOM_ID[a],ROOM_ID[b],x,y]);
  ROUTE=[...Array(n)].map(()=>new Array(n).fill(null));
  for(let to=0;to<n;to++){const seen=new Set([to]),q=[to];
    while(q.length){const r=q.shift();for(const [a,b,x,y] of doors){for(const [u,v] of [[a,b],[b,a]])if(v===r&&!seen.has(u)){seen.add(u);ROUTE[u][to]=[x,y,v];q.push(u)}}}}
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
const roomWalk=p=>ROOMS&&p.room!=null&&ROOMS[p.room].walk||1;
function inPoly(P,x,y){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [xi,yi]=P[i],[xj,yj]=P[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
