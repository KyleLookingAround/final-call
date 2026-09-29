/* ================= WINDOWS: glass along the apron, and passengers who watch the big jets go by ================= */
// Glass on every wall of an airside hall that faces the apron (docs/systems/windows.md, spec docs/specs/terminal-place.md),
// worked out from ROOMS for the layout as built: an edge of a built, airside room whose outside is no room, above the halls
// (SEC_Y) and on the map. The roof terrace keeps its own rail. Cut into panes of at most WIN_PANE, each [x1, y1, x2, y2, room,
// nx, ny] with (nx, ny) pointing out to the apron. Drawn on the floor shown (onFloor), never on the Roof stop: a sheen by
// day, lit at night, with warm pools on the apron through LIGHTS.
// Watchers: when a wide-body is pushed back or towed in (R.st[i].out, or its plane 'inbound'), up to WIN_MAX passengers
// waiting in the market place or at a gate lounge, within reach of the glass near it on their own floor, walk to it (state
// 'watch', PAX_STEP.watch) and stay until it has gone and a few minutes more, then go back to a seat. Chosen once a minute
// (TERM_MINUTE, after the gate calls), never once their gate is called or their plane boards, which sends them back at once.
// p.watch (runtime) is set while they watch. No saved state and no rating; the walk back to the market place draws rnd() as
// any seat does (goAct, toMkt).
const WIN_PANE=80,WIN_NEAR=220,WIN_REACH=170,WIN_MAX=16,WIN_STAY=6,WIN_SAFE=1;
let WIN=null; // {rs, on, panes}: worked out again when the layout or what's built changes
function glass(){
  if(!ROOMS)return [];const on=ROOMS.map(r=>roomOn(r)&&!r.open?1:0).join('');
  if(WIN&&WIN.rs===ROOMS&&WIN.on===on)return WIN.panes;
  const inAny=(x,y)=>ROOMS.some((r,k)=>(on[k]==='1'||r.open)&&inPoly(r.poly,x,y)),panes=[];
  ROOMS.forEach((r,k)=>{
    if(on[k]!=='1'||r.land||r.fl===2)return;const P=r.poly,cx=P.reduce((a,p)=>a+p[0],0)/P.length,cy=P.reduce((a,p)=>a+p[1],0)/P.length;
    P.forEach(([x1,y1],j)=>{const [x2,y2]=P[(j+1)%P.length],l=Math.hypot(x2-x1,y2-y1);if(l<10)return;
      let nx=(y2-y1)/l,ny=-(x2-x1)/l;const mx=(x1+x2)/2,my=(y1+y2)/2;if((cx-mx)*nx+(cy-my)*ny>0){nx=-nx;ny=-ny}
      const ox=mx+nx*8,oy=my+ny*8;if(inAny(ox,oy)||oy>=SEC_Y||ox<=0||ox>=W)return;
      const n=Math.ceil(l/WIN_PANE);for(let s=0;s<n;s++)panes.push([x1+(x2-x1)*s/n,y1+(y2-y1)*s/n,x1+(x2-x1)*(s+1)/n,y1+(y2-y1)*(s+1)/n,k,nx,ny])})});
  WIN={rs:ROOMS,on,panes};return panes;
}
// the panes on the floor of halls shown (on the Roof, the departures floor's, for the pools only)
const winShown=g=>{const fl=ROOMS[g[4]].fl;return fl==null||fl===floorNow()||!twoFloors()};

/* ---------- drawing ---------- */
LAYER.terminal.push(V=>{
  if(roofA())return;const P=glass();if(!P.length)return;const night=clamp(V.d/0.5,0,1),k=V.k;
  ctx.save();ctx.lineCap='butt';
  ctx.strokeStyle=night>0?`rgba(${Math.round(150+105*night)},${Math.round(196+18*night)},${Math.round(230-80*night)},.9)`:'rgba(150,196,230,.9)';ctx.lineWidth=k<0.3?4:3;
  ctx.beginPath();let n=0;for(const g of P){if(!winShown(g)||Math.max(g[0],g[2])<V.x0||Math.min(g[0],g[2])>V.x1||Math.max(g[1],g[3])<V.y0||Math.min(g[1],g[3])>V.y1)continue;
    const ox=-g[5]*1.5,oy=-g[6]*1.5;ctx.moveTo(g[0]+ox,g[1]+oy);ctx.lineTo(g[2]+ox,g[3]+oy);n++}
  if(n){ctx.stroke();
    if(k>=0.3){ // the sheen by day, moving slowly along the glass; the mullions close up
      if(night<0.6){ctx.strokeStyle=`rgba(236,246,255,${(0.7*(1-night)).toFixed(3)})`;ctx.lineWidth=1.4;ctx.setLineDash([6,34]);ctx.lineDashOffset=-(V.t*6%40);ctx.stroke();ctx.setLineDash([])}
      if(k>=0.55){ctx.strokeStyle='#2A3037';ctx.lineWidth=1;ctx.beginPath();for(const g of P){if(!winShown(g))continue;const l=Math.hypot(g[2]-g[0],g[3]-g[1]),m=Math.max(1,Math.round(l/16));
        for(let s=0;s<m;s++){const x=g[0]+(g[2]-g[0])*s/m,y=g[1]+(g[3]-g[1])*s/m;if(!inView(x,y,4))continue;ctx.moveTo(x-g[5]*3,y-g[6]*3);ctx.lineTo(x,y)}}ctx.stroke()}}}
  ctx.restore();
});
// warm pools on the apron outside each pane at night (the lighting pass draws LIGHTS additively): a lamp() every 40 units
// close up; zoomed out, where they'd be too small to tell apart, one warm band along the glass
function glassLights(V){
  if(V.d<=0)return;const P=glass();if(!P.length)return;
  if(V.k<0.3){ctx.save();ctx.lineCap='butt';ctx.beginPath();
    for(const g of P){if(!winShown(g))continue;ctx.moveTo(g[0]+g[5]*14,g[1]+g[6]*14);ctx.lineTo(g[2]+g[5]*14,g[3]+g[6]*14)}
    ctx.strokeStyle=`rgba(255,196,120,${(0.22*V.d).toFixed(3)})`;ctx.lineWidth=30;ctx.stroke();ctx.strokeStyle=`rgba(255,206,140,${(0.3*V.d).toFixed(3)})`;ctx.lineWidth=12;ctx.stroke();ctx.restore();return}
  for(const g of P){if(!winShown(g))continue;const l=Math.hypot(g[2]-g[0],g[3]-g[1]),m=Math.max(1,Math.round(l/40));
    for(let j=0;j<m;j++){const u=(j+0.5)/m;lamp(g[0]+(g[2]-g[0])*u+g[5]*14,g[1]+(g[3]-g[1])*u+g[6]*14,26,'255,206,140',0.55*V.d)}}
}
LIGHTS.push(glassLights);

/* ---------- watchers ---------- */
const winWide=F=>!!F&&!F.freighter&&F.ac.blocks.length>2;
// the minute's look: {pax, G, ev: until when each stand's plane is worth watching, list: who is watching}
function winList(){const L=R.winL;if(L&&L.pax===R.pax&&L.G===G&&L.lay===LAY)return L;return R.winL={pax:R.pax,G,lay:LAY,ev:[],list:[]}}
// free to watch: waiting with time before the call, and their plane not boarding
function winFree(p,D){const F=p.F;return !!F&&F.called==null&&F.plane.state!=='boarding'&&F.plane.state!=='closing'&&callAt(F)-G.clock>=WIN_SAFE&&boardEta(F,D)>=WIN_SAFE}
const winFl=k=>{const r=ROOMS[k];return r?r.fl:undefined};
const winNext=(a,b)=>{const d=a!=null&&ROUTE&&ROUTE[a]&&ROUTE[a][b];return !!d&&d.nx===b&&!d.m}; // b through one doorway from a
// back to their place: a seat at the gate lounge is kept for them (boarding takes them from there once called); the
// market place finds them a seat again, or sends them to the gate once it's called
function winBack(p){const w=p.watch;p.watch=null;
  if(w.st==='gate'){p.state='gate';stateIn(p);if(p.spot>=0){const s=spotPos(p.stand,p.spot);p.tx=s.x;p.ty=s.y}else{p.tx=w.bx;p.ty=w.by}return} // the glass is in their own room: the gate step walks them back
  if(isCalled(p.F))toGate(p);else goAct(p,w.act||'seats');
}
PAX_STEP.watch=(p,dt,D)=>{
  const w=p.watch,F=p.F;if(w&&w.lay!==LAY){winMoved(p);return}if(!w||!F||isCalled(F)||F.plane.state==='boarding'){if(w)winBack(p);else nextAct(p,false);return}
  if(p.way||p.x!==p.tx||p.y!==p.ty){walk(p,D.cwalk*p.spd*walkMul(p)*0.7,dt);return}
  if(!(winList().ev[w.i]>G.clock))winBack(p);
};
// the layout was rebuilt under a watcher (switchLayout moves those at gates and in shops, not here): into their lounge
// seat, or the new market place's middle to find a seat again, as switchLayout does for the others
function winMoved(p){const w=p.watch;p.watch=null;p.way=null;
  if(w.st==='gate'&&p.stand<SIDX.length){p.state='gate';if(p.spot>=0){const s=spotPos(p.stand,p.spot);p.tx=s.x;p.ty=s.y}else{toGate(p);p.way=null}p.x=p.tx;p.y=p.ty;p.room=STAND_ROOM[p.stand];return}
  const k=ROOMS?hallId('mkt'):null;if(k!=null){const [x0,y0,x1,y1]=mktBox();p.x=(x0+x1)/2;p.y=(y0+y1)/2;p.room=k}nextAct(p,false);
}
function glassMinute(){
  const L=winList(),P=glass();if(!P.length)return;
  // the planes worth watching: a wide-body pushed back or towed in, until WIN_STAY minutes after it has gone
  let any=false;for(const i of SIDX){const S=R.st[i];if(S.out&&winWide(S.out.F)||S.F&&S.F.plane.state==='inbound'&&winWide(S.F))L.ev[i]=G.clock+WIN_STAY;if(L.ev[i]>G.clock)any=true}
  // anyone whose gate was called this minute (the calls come first in TERM_MINUTE) leaves the glass at once
  const W=L.list;for(let k=W.length-1;k>=0;k--){const p=W[k];if(p.dead||p.state!=='watch'||!p.watch)W.splice(k,1);else if(isCalled(p.F)){winBack(p);W.splice(k,1)}}
  let n=W.length;
  if(!any)return;const D=derived(),by=byState(),f=R.famous&&R.famous.p;
  for(const i of SIDX){if(!(L.ev[i]>G.clock))continue;const X=XF[i],side=P.filter(g=>Math.hypot((g[0]+g[2])/2-X.ox,(g[1]+g[3])/2-X.oy)<WIN_NEAR);if(!side.length)continue;
    // who could reach them: a box round the panes, and the rooms they're in (the market place may be one doorway away)
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const rs=new Set();for(const g of side){x0=Math.min(x0,g[0],g[2]);y0=Math.min(y0,g[1],g[3]);x1=Math.max(x1,g[0],g[2]);y1=Math.max(y1,g[1],g[3]);rs.add(g[4])}
    const mk=ROOMS?hallId('mkt'):null,mktOk=mk!=null&&[...rs].some(r=>r===mk||winNext(mk,r));
    const C=[];for(const st of ['gate','mkt'])for(const p of by[st]||[]){
      if(st==='mkt'&&!mktOk)break;if(st==='gate'&&!rs.has(p.room))continue;
      if(p.x<x0-WIN_REACH||p.x>x1+WIN_REACH||p.y<y0-WIN_REACH||p.y>y1+WIN_REACH||p.state!==st||p.watch||p.dead||p.inbound||p.kid||p.late||p===f||p.type==='prm'||p.act==='play'||p.act==='playB'||st==='gate'&&p.spot<0||p.way)continue;
      // the nearest point on a pane on their own floor, in their own room (or, from the market place, one next to it), toward the plane
      const fl=winFl(p.room);let best=null,bd=WIN_REACH;
      for(const g of side){const gf=winFl(g[4]);if(gf!=null&&fl!=null&&gf!==fl||g[4]!==p.room&&(st==='gate'||!winNext(p.room,g[4])))continue;const dx=g[2]-g[0],dy=g[3]-g[1],t=clamp(((p.x-g[0])*dx+(p.y-g[1])*dy)/(dx*dx+dy*dy||1),0.1,0.9),d=Math.hypot(g[0]+dx*t-p.x,g[1]+dy*t-p.y);if(d<bd){bd=d;best=[g,t]}}
      if(best&&winFree(p,D))C.push([bd,p,st,best])} // the gate call's estimate last: it's the dearest test
    C.sort((a,b)=>a[0]-b[0]); // the nearest first, up to WIN_MAX watching in all
    for(const [,p,st,[g,t]] of C){if(n>=WIN_MAX)return;if(p.state!==st||p.watch)continue;const u=clamp(t+(p.rand-0.5)*0.4,0.04,0.96),depth=3+(p.rand*7919%1)*3;
      p.watch={i,st,lay:LAY,act:p.act,bx:p.tx,by:p.ty};if(st==='mkt'){p.sl=-1;R.occOut=true}
      p.state='watch';W.push(p);p.tx=g[0]+(g[2]-g[0])*u-g[5]*depth;p.ty=g[1]+(g[3]-g[1])*u-g[6]*depth;route(p,g[4]);n++}}
}
TERM_MINUTE.push(glassMinute);
