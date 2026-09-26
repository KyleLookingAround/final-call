/* ---------- geometry ---------- */
EDGES.forEach(e=>{e.P=rPath(e.pts);e.len=e.P.len});
function edgeOK(e,mode){const M=MODES[mode];if(!M)return false;if(M.kind==='road')return !e.water&&!!e.road&&!(mode==='bus'&&e.coach);if(mode==='water')return !!e.water;return !e.water&&e.m.includes(mode)}
const EF_CACHE={};
function edgeFor(a,b,mode){const k=a+'|'+b+'|'+mode;if(k in EF_CACHE)return EF_CACHE[k];let r=null;for(const e of EDGES)if(((e.a===a&&e.b===b)||(e.a===b&&e.b===a))&&edgeOK(e,mode)){r=e;break}return EF_CACHE[k]=r}
function routeEdges(mode,stops){if(!stops||stops.length<2)return null;const out=[];for(let i=0;i<stops.length-1;i++){const e=edgeFor(stops[i],stops[i+1],mode);if(!e)return null;out.push({e,rev:e.a!==stops[i]})}return out}
function neighbours(n,mode){const out=[];for(const e of EDGES)if(edgeOK(e,mode)){if(e.a===n)out.push([e.b,e]);else if(e.b===n)out.push([e.a,e])}return out}
const trackOf=m=>MODES[m].kind==='road'?null:m;
const hasTrack=(e,m)=>!trackOf(m)||!!(G.infra&&G.infra[e.id]&&G.infra[e.id][m]);
function modePath(a,b,mode,avoid){ // shortest usable path for the route editor, favouring track already laid
  const dist={[a]:0},prev={},done=new Set();
  for(;;){let u=null;for(const k in dist)if(!done.has(k)&&(u==null||dist[k]<dist[u]))u=k;if(u==null||u===b)break;done.add(u);
    for(const [v,e] of neighbours(u,mode)){if(avoid&&avoid.has(v))continue;const w=(e.len+(e.extra||0))*(hasTrack(e,mode)?0.6:1);if(dist[v]==null||dist[u]+w<dist[v]){dist[v]=dist[u]+w;prev[v]=u}}}
  if(dist[b]==null)return null;const p=[b];while(p[0]!==a)p.unshift(prev[p[0]]);return p;
}
function pathLen(p,mode){let s=0;for(let i=0;i<p.length-1;i++){const e=edgeFor(p[i],p[i+1],mode);s+=e?e.len+(e.extra||0):1e6}return s}
function ptOn(P,s){
  s=clamp(s,0,P.len);let i=1;while(i<P.cum.length-1&&P.cum[i]<s)i++;
  const a=P.pts[i-1],b=P.pts[i],seg=(P.cum[i]-P.cum[i-1])||1,t=(s-P.cum[i-1])/seg;
  return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,Math.atan2(b[1]-a[1],b[0]-a[0])];
}
function distToPath(P,x,y){let bd=1e9;for(let i=1;i<P.pts.length;i++){const [ax,ay]=P.pts[i-1],[bx,by]=P.pts[i],dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1,t=clamp(((x-ax)*dx+(y-ay)*dy)/l2,0,1);bd=Math.min(bd,Math.hypot(ax+dx*t-x,ay+dy*t-y))}return bd}
function offsetPts(pts,d){
  if(!d)return pts;const nrm=(dx,dy)=>{const l=Math.hypot(dx,dy)||1;return [-dy/l,dx/l]};const out=[];
  for(let i=0;i<pts.length;i++){let nx,ny,s=1;
    if(i===0||i===pts.length-1){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];[nx,ny]=nrm(b[0]-a[0],b[1]-a[1])}
    else{const n1=nrm(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]),n2=nrm(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]),mx=n1[0]+n2[0],my=n1[1]+n2[1],ml=Math.hypot(mx,my)||1;nx=mx/ml;ny=my/ml;s=1/Math.max(0.5,nx*n1[0]+ny*n1[1])}
    out.push([pts[i][0]+nx*d*s,pts[i][1]+ny*d*s])}
  return out;
}

/* ---------- state helpers ---------- */
const hour=()=>(G.clock/60)%24;
const isNight=()=>{const h=hour();return h<5||h>=23.5};
const placePop=pid=>(G.pop&&G.pop[pid]!=null)?G.pop[pid]:PLACES[pid].pop;
const devAt=plot=>G.dev&&G.dev[plot]?DEV[G.dev[plot]]:null;
const devOn=opt=>!!G.dev&&Object.values(G.dev).includes(opt);
function devSum(key){let s=0;for(const p in (G.dev||{})){const d=DEV[G.dev[p]];if(d&&d[key])s+=d[key]}return s}
function devLocalMul(pid){let m=1;PLOTS.forEach(pl=>{if(pl.place===pid){const d=devAt(pl.id);if(d&&d.locals)m+=d.locals-1}});return m}
const anyMode=m=>Object.values(G.lines||{}).some(L=>L.mode===m);
const replOn=id=>((R.fx.repl||{})[id]||0)>G.clock;
const serves=(L,n)=>L.stops.includes(n)&&(n===L.stops[0]||n===L.stops[L.stops.length-1]||!(L.skip||[]).includes(n));
const linesAt=n=>Object.values(G.lines||{}).filter(L=>serves(L,n));
const lineCode=L=>MODES[L.mode].L+L.num;
const lineName=L=>`${NODES[L.stops[0]].n} – ${NODES[L.stops[L.stops.length-1]].n}`;
const plotNode=id=>{const P=PLOTS.find(p=>p.id===id);return P?P.node:null};
const effKind=L=>replOn(L.id)?'bus':RLBL[MODES[L.mode].kind];
const sortedLines=()=>Object.values(G.lines||{}).sort((a,b)=>MODE_ORDER.indexOf(a.mode)-MODE_ORDER.indexOf(b.mode)||a.num-b.num);
const rwOn=eid=>(R.fx.roadworks||0)>G.clock&&R.fx.rwE===eid;
function regCong(){return R.reg&&isFinite(R.reg.cong)?R.reg.cong:0.3}
function lineDown(L){
  if(!L)return true;if(((R.fx.line||{})[L.id]||0)>G.clock&&!replOn(L.id))return true;
  if(L.mode==='water'){if(R.fx.fog>G.clock)return true;for(const {e} of (routeEdges(L.mode,L.stops)||[])){const m=ptOn(e.P,e.len/2),w=wxAt(m[0],m[1]);if(w&&(w.c.type==='fog'||w.c.type==='storm'))return true}}
  return false;
}
function lineFreq(L,nominal){if(!L)return 0;let f=L.freq;if(L.freight)f=Math.max(1,f-1);if(nominal)return f;if(lineDown(L))return 0;if(isNight())f=L.night?Math.max(1,Math.floor(f/2)):0;return f}
const fareMul=L=>[0.7,1,1.5][L.fare??1];
function edgeMins(L,e,M,rb){ // minutes for one vehicle to cover a corridor right now
  const road=M.kind==='road',w=R.reg&&R.reg.ewx?R.reg.ewx[e.id]:null;let v=M.spd;
  if(road){v*=e.road===2?(M===MODES.coach?1.15:1.25):(M===MODES.coach?0.75:1);const ce=R.reg&&R.reg.ce&&R.reg.ce[e.id]!=null?R.reg.ce[e.id]:regCong();v*=(1-0.4*ce)*(rwOn(e.id)?0.6:1)}else if(e.spd)v*=e.spd;
  if(w){if((w==='snow'||w==='storm')&&(road||M.kind==='track'))v*=0.7;else if(w==='rain'&&road)v*=0.85}
  if(!rb&&L.mode==='rail'&&(R.fx.leaves||0)>G.clock)v*=0.75;
  if(G.lv.control)v*=1.08;
  const tm=rb?null:trackOf(L.mode),ov=tm&&R.reg&&R.reg.over?R.reg.over[e.id+':'+tm]||0:0;if(ov>1)v/=Math.sqrt(ov);
  return (e.len+(e.extra||0))/v;
}
function lineTiming(L){ // arrival and departure minutes at each station along the route, one way
  const RE=routeEdges(L.mode,L.stops);if(!RE)return null;const rb=replOn(L.id),M=rb?MODES.bus:MODES[L.mode],sk=L.skip||[];
  const arr=[0],dep=[0],eT=[];let t=0;
  RE.forEach(({e},i)=>{const m=edgeMins(L,e,M,rb);eT.push(m);t+=m;arr.push(t);if(i<RE.length-1)t+=sk.includes(L.stops[i+1])?0.3:1;dep.push(t)});
  return {arr,dep,eT,one:t,RT:2*t+6,RE};
}

