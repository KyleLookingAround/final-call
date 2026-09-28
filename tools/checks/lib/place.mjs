// Helpers for "The terminal as a place" checks (docs/specs/terminal-place.md), put into the page as window.TP. The checks
// were written before the feature's code, so they read it through these names, which the groundwork and the parts provide:
//   LAYOUTS[id].term  the layout's terminal: {halls:[rooms], doors:[doorways and floor links], outline:[[x,y]…] (its main building)}
//   room.fl           a hall's floor: 0 lower (arrivals), 1 upper (departures); a room without it (the concourse, the forecourt) is on both
//   floor link        a doorway in term.doors whose sixth item is 'esc' or 'lift': [a, b, x, y, half-width, 'esc'|'lift', per minute]
//   p.fl              a passenger's floor, where the code keeps one; otherwise their room's
//   R.floor           the floor shown: 'roof', 'up' or 'down'; the chip's stops are #cam [data-floor="roof|up|down"]
// and each group's own names, listed at the top of its file.
export const TERM_HALLS=['mkt','imm','sec','ci','rec','cus','arh','wlk','hot','out'];
export const DEP_HALLS=['ci','sec','mkt'],ARR_HALLS=['imm','rec','cus','arh'];
// states where a passenger isn't in a room of the terminal: in a cabin, on a bridge or a bus, on the way to the airport, or
// just off a bridge and walking in along its line (toArr, which starts out on the apron)
export const AWAY=['aisle','sitting','dAisle','bridge','dBridge','bus','train','tram','toArr'];
export function install(){
  const S=__sim,TP=window.TP={};
  TP.inPoly=(P,x,y)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [xi,yi]=P[i],[xj,yj]=P[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c};
  // inside P, or within d of its walls (a passenger stepping off a bridge, up to 16 units short, or through a doorway)
  TP.near=(P,x,y,d)=>TP.inPoly(P,x,y)||P.some(([x1,y1],k)=>{const [x2,y2]=P[(k+1)%P.length],dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x1+dx*t-x,y1+dy*t-y)<=d});
  TP.area=P=>Math.abs(P.reduce((a,[x,y],k)=>{const [u,v]=P[(k+1)%P.length];return a+x*v-u*y},0))/2;
  // the overlap of two convex polygons (Sutherland-Hodgman), and its area
  TP.clip=(A,B)=>{let out=A;const s=Math.sign(B.reduce((a,[x,y],k)=>{const [u,v]=B[(k+1)%B.length];return a+x*v-u*y},0))||1;
    for(let k=0;k<B.length&&out.length;k++){const [x1,y1]=B[k],[x2,y2]=B[(k+1)%B.length],side=([x,y])=>s*((x2-x1)*(y-y1)-(y2-y1)*(x-x1)),inp=out;out=[];
      for(let j=0;j<inp.length;j++){const P=inp[j],Q=inp[(j+1)%inp.length],a=side(P),b=side(Q);if(a>=0)out.push(P);if((a>=0)!==(b>=0)){const t=a/(a-b);out.push([P[0]+(Q[0]-P[0])*t,P[1]+(Q[1]-P[1])*t])}}}
    return out};
  TP.overlap=(A,B)=>{const C=TP.clip(A,B);return C.length>2?TP.area(C):0};
  TP.box=P=>{const xs=P.map(p=>p[0]),ys=P.map(p=>p[1]);return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]};
  TP.mid=P=>[P.reduce((a,p)=>a+p[0],0)/P.length,P.reduce((a,p)=>a+p[1],0)/P.length];
  TP.term=(L=S.LAY)=>L&&L.term||null;
  TP.hallIds=()=>(TP.term()?TP.term().halls:S.TERM_ROOMS).map(r=>r.id);
  TP.room=id=>S.ROOMS&&S.ROOMS[S.hallId(id)];
  TP.halls=()=>TP.hallIds().map(TP.room).filter(Boolean);
  TP.doors=()=>[...(S.LAY.doors||[]),...((TP.term()||{}).doors||[])];
  TP.isLink=d=>d[5]==='esc'||d[5]==='lift';
  TP.links=()=>TP.doors().filter(TP.isLink);
  TP.roomFl=k=>k!=null&&S.ROOMS&&S.ROOMS[k]?S.ROOMS[k].fl:undefined;
  TP.paxFl=p=>p.fl!=null?p.fl:TP.roomFl(p.room);
  // a passenger who has been in one state a long time counts as stuck unless they're in the hotel, on a plane or on the way
  // in (but just off a bridge counts), or waiting at a gate for a flight not yet due (boarding can open two hours early)
  TP.stuck=(p,AWAY)=>!p.hotel&&!/hot/.test(p.state)&&(!AWAY.includes(p.state)||p.state==='toArr')&&!(p.state==='gate'&&!(p.F&&S.G.clock>p.F.std));
  // two floors in play: the halls stacked, check-in upstairs and immigration below (floors on rooms alone aren't enough)
  TP.twoFloors=()=>{const a=TP.room('ci'),b=TP.room('imm');return !!(a&&b&&a.fl===1&&b.fl===0)};
  // rooms that exist yet, as the roofs see them (roomOn and not the open forecourt)
  TP.built=()=>{const P=S.roofNow();return S.ROOMS.map((r,k)=>P&&P.on[k]==='1')};
  // fully built: every stand, Pier B, every shop unit, the hotel
  TP.build=()=>{const G=S.G;G.pierB=true;S.SIDX.forEach(i=>{G.stands[i].built=true});G.lv.hotel=Math.max(1,G.lv.hotel|0);
    const types=G.shops.filter(Boolean).map(s=>s.type);S.SHOP_X.forEach((x,j)=>{if(!G.shops[j])G.shops[j]={type:types[j%types.length]||0,lvl:1,earned:0,spent:500}})};
  TP.sim=(min,step,each)=>{const R=S.R;R.sim=true;const n=Math.round(min/step);for(let i=0;i<n;i++){S.update(step);if(each)each(i)}R.sim=false};
  TP.day=h=>{const G=S.G;G.clock=Math.floor(G.clock/1440)*1440+h*60};
  // the camera at zoom z, centred on (x, y) in the world
  TP.look=(x,y,z)=>{const R=S.R;R.cam.z=z;S.clampCam();const k=S.viewK();R.cam.x=x-R.sw/k/2;R.cam.y=y-R.sh/k/2;R.cam.tx=R.cam.ty=null;S.clampCam()};
  TP.termMid=()=>{const b=TP.box(TP.halls().filter(r=>!r.open).flatMap(r=>r.poly));return [(b[0]+b[2])/2,(b[1]+b[3])/2]};
  // what one frame draws between the lighting pass and the roofs (the halls, their furniture, the forecourt and the
  // passengers): every arc, rectangle and label, with its centre in world units
  TP.drawn=()=>{const c=document.querySelector('#cv').getContext('2d'),seen=[];let on=false,inv=null;
    const at=(x,y)=>{const p=inv.transformPoint(c.getTransform().transformPoint(new DOMPoint(x,y)));return [p.x,p.y]};
    const keep={arc:c.arc,fillRect:c.fillRect,strokeRect:c.strokeRect,fillText:c.fillText,ellipse:c.ellipse};
    c.arc=function(x,y,r,...a){if(on)seen.push({k:'arc',r,at:at(x,y)});return keep.arc.call(this,x,y,r,...a)};
    c.ellipse=function(x,y,...a){if(on)seen.push({k:'ellipse',at:at(x,y)});return keep.ellipse.call(this,x,y,...a)};
    for(const m of ['fillRect','strokeRect'])c[m]=function(x,y,w,h){if(on&&Math.abs(w)<60&&Math.abs(h)<60)seen.push({k:m,at:at(x+w/2,y+h/2)});return keep[m].call(this,x,y,w,h)};
    c.fillText=function(t,x,y,...a){if(on)seen.push({k:'text',t,at:at(x,y)});return keep.fillText.call(this,t,x,y,...a)};
    const start=()=>{on=true;inv=c.getTransform().inverse()},stop=()=>{on=false};
    S.LAYER.lit.push(start);S.LAYER.roofs.unshift(stop);
    try{S.draw()}finally{S.LAYER.lit.splice(S.LAYER.lit.indexOf(start),1);S.LAYER.roofs.splice(S.LAYER.roofs.indexOf(stop),1);delete c.arc;delete c.ellipse;delete c.fillRect;delete c.strokeRect;delete c.fillText}
    return seen};
  // every floor link, the terrace's stairs included ('stairs' is the terrace's third kind), and the terrace's own ('ter' at
  // one end); the nearest to (x, y) as [distance, kind]
  TP.anyLink=d=>d[5]==='esc'||d[5]==='lift'||d[5]==='stairs';
  TP.allLinks=()=>TP.doors().filter(TP.anyLink);
  TP.terLinks=()=>TP.allLinks().filter(d=>d[0]==='ter'||d[1]==='ter');
  TP.nearLink=(x,y,links=TP.allLinks())=>{let d=Infinity,k=null;for(const L of links){const e=Math.hypot(L[2]-x,L[3]-y);if(e<d){d=e;k=L[5]}}return [d,k]};
  // make a passenger a dawdler, with the marks late runners give one (61-late-runners.js dawdle): late, on their flight's
  // list of dawdlers, and one in the market place sits on (state 'linger') until final call. finalCall keeps only dawdlers
  // in a shop or lingering, so the terrace part keeps its own (on the terrace) on the list too
  TP.dawdler=p=>{const G=S.G,R=S.R;p.late=true;if(p.state==='mkt'){p.state='linger';p.sl=-1;p.t=G.clock+40;R.occOut=true}const r=S.runsOf(p.F);if(r)r.daw.push(p)};
  // bring a flight's final call forward: a plane turning round starts boarding now, and it leaves RUN_AT + 2 minutes from
  // now, so final call comes in two minutes. Only for a plane at its stand, turning round or boarding (true when it could)
  TP.hurry=F=>{const G=S.G,R=S.R,pl=F&&F.plane;if(!pl||R.st[F.i].F!==F||!['turnaround','boarding'].includes(pl.state))return false;
    if(pl.state==='turnaround')pl.t=0;F.std=Math.min(F.std,G.clock+S.RUN_AT+2);return true};
  // boarded or on the way to the seat
  TP.boarded=p=>S.taleOf(p)?.run===3||['gate','aisle','sitting','bridge','bus'].includes(p.state);
}
// puts the helpers into a page
export const tp=page=>page.evaluate(`(${install.toString()})()`);
