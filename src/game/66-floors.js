/* ================= FLOORS: halls on two floors, the escalators and lift between them, and going to a hall's floor ================= */
// Classic's halls stand on two floors (its term table, 42-terminal.js): departures upstairs, arrivals below, with escalators
// and a lift between. A floor link is a doorway that passengers queue for and ride: they walk up to it, join its queue once
// they reach the tail, go one at a time at its rate (people a minute), ride from its entry to its exit, and change floor as
// they step off. Families and those who need help take the lift; late runners never do. Bags never use floor links: the
// belts drop to the baggage hall. Nothing here is saved: passengers aren't (resetAll starts R.pax afresh), so an old save's
// passengers start out on their halls' floors, and the queues are runtime, made afresh for each layout and each load.
// Tapping a hall's name (or the name of the hall below or above, drawn on the floor over it), an advisor tip with a hall,
// or a board line flies the camera there and shows that hall's floor.
const LINK_C=30; // what riding a floor link costs a route, in units of walking (routes are worked out once per layout)
const LINK_RIDE={esc:0.24,stairs:0.3,lift:0.5},LINK_RL={esc:10,stairs:8,lift:0},LINK_OFF=0.12; // minutes riding; half its length; minutes stepping off
// the queues, per floor link and way (0 from its first hall, 1 from its second), and when the next may go
function flRT(){const q=R.flq;if(q&&q.st===R.st&&q.of===ROOM_DOORS)return q;return R.flq={st:R.st,of:ROOM_DOORS,q:ROOM_DOORS.map(()=>[[],[]]),free:ROOM_DOORS.map(()=>[0,0])}}
const linkFl=id=>{const r=ROOMS[ROOM_ID[id]];return r&&r.fl!=null?r.fl:1};
const linkDown=(d,dir)=>linkFl(d[dir])>linkFl(d[1-dir]);
const linkLate=p=>{if(p.late)return true;const t=TALES.get(p);return !!t&&(t.run===1||t.run===2)};
// which of the floor links between the same two halls a passenger takes (route calls it with the one ROUTE chose): the
// lift for families and those who need help, unless they're running late; otherwise the nearest escalator or stairs
function pickLink(p,j){
  const d=ROOM_DOORS[j],lift=!linkLate(p)&&(p.famL||p.type==='fam'||p.type==='prm');let best=j,bd=Infinity;
  for(let k=0;k<ROOM_DOORS.length;k++){const e=ROOM_DOORS[k];if(!isFloorLink(e)||(e[5]==='lift')!==lift||!(e[0]===d[0]&&e[1]===d[1]||e[0]===d[1]&&e[1]===d[0]))continue;
    const v=Math.hypot(e[2]-p.x,e[3]-p.y);if(!(v>=bd)){bd=v;best=k}}
  if(lift&&ROOM_DOORS[best][5]==='lift')p.famL=true; // arriving families are marked as security marks departing ones
  return best;
}
// a queue's k-th place: rows across the link's width, going back from its entry (down the building for the way down)
function linkSlot(d,sx,k){const n=Math.max(1,Math.floor(d[4]*2/5)),row=Math.floor(k/n),col=k%n;return [d[2]+sx*((LINK_RL[d[5]]||0)+6+row*5),d[3]+(col-(n-1)/2)*5]}
// one step on a floor link to room to, for walk() (41-airside.js); true once they've stepped off on the other floor. p.rideAt: null
// walking up, -1 queuing, -2 going on, else when they got on
function rideLink(p,j,to,v,dt){
  const d=ROOM_DOORS[j],Q=flRT(),dir=ROOM_ID[d[1]]===to?0:1,sx=linkDown(d,dir)?-1:1,rl=LINK_RL[d[5]]||0,ex=d[2]+sx*rl,ey=d[3],q=Q.q[j][dir];
  let r=p.rideAt;
  if(r==null){const n=Math.max(1,Math.floor(d[4]*2/5));
    if(Math.hypot(ex-p.x,ey-p.y)>12+Math.ceil((q.length+1)/n)*5){moveTo(p,ex,ey,v,dt);return false}
    q.push(p);p.rideAt=r=-1}
  if(r===-1){while(q.length&&q[0].rideAt!==-1)q.shift();let k=q.indexOf(p);if(k<0){q.push(p);k=q.length-1}
    if(k===0&&Q.free[j][dir]<=G.clock){q.shift();Q.free[j][dir]=Math.max(Q.free[j][dir],G.clock-dt)+1/(d[6]||30);p.rideAt=r=-2}
    else{const s=linkSlot(d,sx,k);moveTo(p,s[0],s[1],v,dt);return false}}
  if(r===-2){if(!moveTo(p,ex,ey,v,dt))return false;p.rideAt=r=G.clock}
  const T=LINK_RIDE[d[5]]||0.3,u=(G.clock-r)/T;
  if(u<1){p.x=ex-sx*1.8*rl*u;p.y=ey;return false} // a step short of where they step off, so riders and those stepping off never share a spot
  p.x=d[2]-sx*rl;p.y=ey;p.room=to; // off on the other floor, where they stand a moment
  return u>=1+LINK_OFF/T;
}

/* ---------- drawing ---------- */
const plainOn=()=>(LAY.term.plain||[]).filter(a=>onFloor(a[0])&&twoFloors());
// floor inside the building that isn't a hall, under the halls' walls: over arrivals upstairs (with the opening over reclaim),
// and the baggage hall under check-in
LAYER.terminal.unshift(()=>{if(roofA())return;const A=plainOn();if(!A.length)return;
  for(const [fl,x0,y0,x1,y1] of A){ctx.fillStyle=fl?'#171B20':'#15191D';ctx.fillRect(x0,y0,x1-x0,y1-y0);ctx.strokeStyle='#4E5964';ctx.lineWidth=3;ctx.strokeRect(x0,y0,x1-x0,y1-y0);
    if(!fl){ctx.strokeStyle='#262C33';ctx.lineWidth=4;ctx.beginPath();for(let y=y0+40;y<y1-20;y+=46){ctx.moveTo(x0+30,y);ctx.lineTo(x1-30,y)}ctx.stroke()}} // the make-up belts
  const v=LAY.term.void;if(v&&onFloor(1)){const [x0,y0,x1,y1]=v;ctx.fillStyle='#0D1013';ctx.fillRect(x0,y0,x1-x0,y1-y0);
    ctx.strokeStyle='#1E242A';ctx.lineWidth=5;for(let k=0;k<4;k++){ctx.beginPath();ctx.ellipse(x0+(x1-x0)*(k+0.5)/4,(y0+y1)/2,32,9,0,0,Math.PI*2);ctx.stroke()} // reclaim's carousels, far below
    ctx.strokeStyle='rgba(150,196,230,.4)';ctx.lineWidth=2;ctx.strokeRect(x0,y0,x1-x0,y1-y0)}}); // the glass balustrade
// the escalators and lifts on both floors, and the names of the halls above or below drawn on the floor over them
TERM_DRAW.push(()=>{const two=twoFloors();
  for(const d of ROOM_DOORS){if(!isFloorLink(d))continue;const [a,b,x,y,hw,kind]=d,A=ROOMS[ROOM_ID[a]],B=ROOMS[ROOM_ID[b]];if(!A||!B||!roomOn(A)||!roomOn(B))continue;
    if(kind==='lift'){ctx.fillStyle='#39414A';ctx.fillRect(x-hw-2,y-hw-2,2*hw+4,2*hw+4);ctx.strokeStyle='#8C97A1';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y-hw);ctx.lineTo(x,y+hw);ctx.stroke();continue}
    const rl=LINK_RL[kind]||8,sx=linkFl(a)>linkFl(b)?1:-1; // chevrons the way it runs: riders down go on at its left end (rideLink)
    ctx.fillStyle='#2A3037';ctx.fillRect(x-rl-3,y-hw,2*rl+6,2*hw);ctx.strokeStyle='#39414A';ctx.lineWidth=1;ctx.beginPath();
    for(let u=-rl;u<=rl;u+=3){ctx.moveTo(x+u,y-hw+1);ctx.lineTo(x+u,y+hw-1)}ctx.stroke();
    ctx.strokeStyle='#8C97A1';ctx.lineWidth=1.2;ctx.beginPath();for(const dy of [-hw/2,hw/2]){ctx.moveTo(x-sx*3,y+dy-2.5);ctx.lineTo(x+sx*2,y+dy);ctx.lineTo(x-sx*3,y+dy+2.5)}ctx.stroke()}
  if(!two)return;const A=plainOn(),fl=floorNow();
  for(const r of LAY.term.halls){if(!r.name||r.fl==null||r.fl===fl||!roomOn(r))continue;const [lx,ly]=hallLabel(r.id);
    if(A.some(([,x0,y0,x1,y1])=>lx>=x0&&lx<=x1&&ly>=y0&&ly<=y1))mono(`${r.name} ${r.fl<fl?'↓':'↑'}`,lx,ly,'#3E4750',8.5)}});

/* ---------- going to a hall ---------- */
// where a hall's name is drawn, on its own floor or, dimmer, on the floor over it
function hallLabel(id){const r=ROOMS&&ROOMS[ROOM_ID[id]];if(!r)return null;let x0=1e9,y0=1e9;for(const [x,y] of r.poly){x0=Math.min(x0,x);y0=Math.min(y0,y)}return [x0+8,y0+10]}
// the camera flies to (x, y), at least a little zoomed in
function flyTo(x,y){const c=R.cam;c.z=Math.max(c.z,1.1);clampCam();const k=viewK(),vw=R.sw/k,vh=R.sh/k;
  c.tx=vw>=W?(W-vw)/2:clamp(x-vw/2,0,W-vw);c.ty=vh>=Y1-Y0?Y0+(Y1-Y0-vh)/2:clamp(y-vh/2,Y0,Y1-vh)}
function flyHall(id){const r=ROOMS&&ROOMS[ROOM_ID[id]];if(!r||R.view!=='airport')return false;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of r.poly){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}
  flyTo((x0+x1)/2,(y0+y1)/2);setFloor(r.fl===0?'down':R.floor==='roof'||r.fl===1?'up':R.floor);return true}
// a tap on a hall's name: its own, where it's drawn (halls with a sign keep theirs for the Terminal tab), or the name drawn
// on the floor over it
PAX_TAP.push((wx,wy)=>{if(R.view!=='airport'||roofA()||!ROOMS)return false;const two=twoFloors(),fl=floorNow(),A=two?plainOn():[];
  for(const r of LAY.term.halls){if(!r.name||!roomOn(r))continue;const own=!two||r.fl==null||r.fl===fl;if(own&&r.sign)continue;
    const [lx,ly]=hallLabel(r.id);if(wx<lx-6||wx>lx+r.name.length*5.2+16||wy<ly-9||wy>ly+9)continue;
    if(!own&&!A.some(([,x0,y0,x1,y1])=>lx>=x0&&lx<=x1&&ly>=y0&&ly<=y1))continue;
    return flyHall(r.id)}
  return false});
// an advisor tip about a hall ({hall: id}) goes there (16-advisor.js handles the rest of the tip)
$('#tip').addEventListener('click',e=>{const b=e.target.closest('button'),a=$('#tip')._a;if(b&&b.dataset.tipgo&&a&&a.hall)flyHall(a.hall)});
// a board line: an arriving flight whose bags are on a carousel goes down to it; any other line's gate is upstairs
$('#brows').addEventListener('click',e=>{const r=e.target.closest('.brow');if(!r||r.dataset.stand==null||R.view!=='airport'||!twoFloors())return;const i=+r.dataset.stand,S=R.st[i],A=S&&S.F&&S.F.arr;
  if(R.bm==='arr'&&A&&A.car!=null&&A.reclaim>0){flyTo(carX(i),carY(i));setFloor('down')}else if(R.floor==='down')setFloor('up')});
Object.assign(SIMX,{hallLabel,flyHall,pickLink,flRT});
