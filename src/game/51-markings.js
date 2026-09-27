/* ================= MARKINGS: paint on the apron, the runway's markings, and the airfield's lights by night ================= */
// Painted apron markings (a lead-in line curving onto each built stand, its stop bar, red safety lines and its number on the
// ground), taxiway centre lines with blue edge lights, and the runway's threshold, aiming-point and touchdown markings; by
// night, floodlight masts, runway and taxiway edge lights and lit terminal windows. Drawing only (docs/specs/real-airport.md).
// The lines are built once into Path2Ds in world units, and again only when the layout, what's built or the rooms change.
const MK={key:'',lead:null,red:null,taxi:null,win:null,num:[],mast:[],tlit:[],rlit:[],stands:[],lit:0};
const MK_Y='#C9A233',MK_TAXI='#957824'; // painted yellow; the taxi line mixed onto the apron, opaque so it covers the old dashes
// points every step along a polyline, set off sideways by off (right of the way it runs), pushed onto out as x,y pairs
function mkAlong(pts,step,off,out){let carry=0;
  for(let k=1;k<pts.length;k++){const [x1,y1]=pts[k-1],[x2,y2]=pts[k],len=Math.hypot(x2-x1,y2-y1);if(!len)continue;const ux=(x2-x1)/len,uy=(y2-y1)/len;
    let s=carry;for(;s<=len;s+=step)out.push(x1+ux*s-uy*off,y1+uy*s+ux*off);carry=s-len}}
// the markings' key: the layout, its size, what's built and which rooms are open
function mkKey(){let k=(LAY.name||'')+'|'+W+'|'+AF_Y+'|'+(G.lv.runway2|0)+'|';for(const i of SIDX)k+=G.stands[i].built?1:0;
  if(ROOMS){k+='|';for(const r of ROOMS)k+=roomOn(r)&&!r.open?1:0}return k}
function mkBuild(){
  MK.key=mkKey();const lead=new Path2D(),red=new Path2D(),taxi=new Path2D(),win=new Path2D();MK.num=[];MK.mast=[];MK.tlit=[];MK.rlit=[];MK.stands=[];
  const P=(i,x,y)=>{toW(i,x,y);return [WP.x,WP.y]};
  const line=(path,i,pts)=>pts.forEach(([x,y],k)=>{toW(i,x,y);k?path.lineTo(WP.x,WP.y):path.moveTo(WP.x,WP.y)});
  for(const i of SIDX){if(!G.stands[i].built)continue;MK.stands.push(i);const [,ay,,ah]=standArea(i),tail=ay+ah;
    // the lead-in: straight up the plane's centreline from the taxilane at the tail, forking into a curve each way
    line(lead,i,[[0,tail],[0,FACE_Y+18]]);
    for(const s of [-1,1]){const a=P(i,0,tail-44),c=P(i,0,tail-2),b=P(i,s*84,tail);lead.moveTo(a[0],a[1]);lead.quadraticCurveTo(c[0],c[1],b[0],b[1])}
    // the stop bar just ahead of the nose, and a short bar across the line where the nose wheel stops
    line(lead,i,[[-24,FACE_Y+18],[24,FACE_Y+18]]);line(lead,i,[[-8,FACE_Y+46],[8,FACE_Y+46]]);
    // red safety lines round the stand, open at the tail where the plane comes in
    line(red,i,[[-142,tail-58],[-142,ay],[142,ay],[142,tail-58]]);
    const n=P(i,0,tail-76);MK.num.push(n[0],n[1],i);
    const m=P(i,146,FACE_Y+14);MK.mast.push(m[0],m[1])}
  // the taxiway below the runway, and each layout's own taxi lines: a centre line, with blue lights along both edges
  const lines=[[[0,AF_Y+16],[W,AF_Y+16]],...(LAY.decor||[]).filter(d=>d.t==='taxi').map(d=>d.pts)];
  for(const pts of lines){pts.forEach(([x,y],k)=>k?taxi.lineTo(x,y):taxi.moveTo(x,y));for(const o of [-15,15])mkAlong(pts,60,o,MK.tlit)}
  // the runways' edge lights, on the runways that are open
  for(let r=0;r<1+(G.lv.runway2|0);r++){const y=AF_Y+RWY_Y[r],h=r?28:32;for(const e of [y-h/2,y+h/2])for(let x=24;x<W-20;x+=40)MK.rlit.push(x,e)}
  // the terminal's windows: every wall of every open hall, lit from inside by night
  if(ROOMS)for(const r of ROOMS){if(!roomOn(r)||r.open)continue;const Q=r.poly;Q.forEach(([x,y],k)=>k?win.lineTo(x,y):win.moveTo(x,y));win.closePath()}
  Object.assign(MK,{lead,red,taxi,win});
}
function mkCheck(){if(MK.key!==mkKey())mkBuild()}
// the runway's markings, drawn by drawAirfield (under the planes on it) in its frame: a runway at y, h wide, r its number
function rwyMarks(y,h,r){
  const L=W-40,t=y-h/2,b=y+h/2,wc='rgba(236,232,223,.55)';
  ctx.fillStyle='rgba(236,232,223,.3)';ctx.fillRect(20,t+1.5,L,1.2);ctx.fillRect(20,b-2.7,L,1.2); // side stripes
  ctx.strokeStyle='rgba(236,232,223,.45)';ctx.lineWidth=1.5;ctx.setLineDash([16,14]);ctx.beginPath();ctx.moveTo(96,y);ctx.lineTo(W-96,y);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=wc;
  for(const e of [0,1]){const at=(d,w)=>e?W-20-d-w:20+d; // measured in from either end
    const n=6,sh=(h-8)/(2*n-1);for(let k=0;k<n;k++)ctx.fillRect(at(5,22),t+4+k*2*sh,22,sh); // threshold stripes
    ctx.fillRect(at(0,2),t+2,2,h-4); // threshold bar
    const aim=Math.max(150,L*0.12);ctx.fillRect(at(aim,52),t+h*0.2,52,h*0.14);ctx.fillRect(at(aim,52),b-h*0.34,52,h*0.14); // aiming point
    for(const [d,nb] of [[aim-70,3],[aim+90,2],[aim+150,2],[aim+210,1]]){if(d+40>L/2)continue; // touchdown zone
      for(let k=0;k<nb;k++){ctx.fillRect(at(d,26),t+4+k*2.6,26,1.4);ctx.fillRect(at(d,26),b-5.4-k*2.6,26,1.4)}}}
  ctx.font='800 13px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle='rgba(236,232,223,.5)';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(G.lv.runway2?(r?'09R':'09L'):'09',64,y+1);ctx.fillText(G.lv.runway2?(r?'27L':'27R'):'27',W-64,y+1);
}
// a small glow, drawn once and stamped for each light (cheaper than a gradient per light)
const MK_GLOW={};
function mkGlow(rgb){let c=MK_GLOW[rgb];if(c)return c;c=MK_GLOW[rgb]=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),r=g.createRadialGradient(16,16,0,16,16,16);
  r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(0.18,`rgba(${rgb},0.9)`);r.addColorStop(1,`rgba(${rgb},0)`);g.fillStyle=r;g.fillRect(0,0,32,32);return c}
// every second or third light when zoomed right out, to save stamping lights too small to tell apart
function mkStamp(A,rgb,r,a){const s=mkGlow(rgb),skip=V.k<0.2?3:V.k<0.3?2:1;ctx.globalAlpha=Math.min(1,a);let n=0;
  for(let j=0;j<A.length;j+=2*skip){const x=A[j],y=A[j+1];if(x+r<V.x0||x-r>V.x1||y+r<V.y0||y-r>V.y1)continue;ctx.drawImage(s,x-r,y-r,r*2,r*2);n++}
  ctx.globalAlpha=1;return n}
// the apron's paint: taxi centre lines over the taxiway, then each built stand's lead-in, stop bars, safety lines and number
LAYER.apron.push(V=>{mkCheck();MK.lit=0;ctx.save();ctx.lineCap='butt';ctx.lineJoin='round';
  ctx.strokeStyle=MK_TAXI;ctx.lineWidth=2.6;ctx.stroke(MK.taxi);
  if(V.k>=0.12){ctx.strokeStyle=MK_Y;ctx.globalAlpha=0.6;ctx.lineWidth=2;ctx.stroke(MK.lead); // too thin to see below that
    ctx.strokeStyle='#C2404A';ctx.globalAlpha=0.5;ctx.lineWidth=1.6;ctx.stroke(MK.red);ctx.globalAlpha=1}
  if(V.k>=0.45){ctx.fillStyle='#2F6FD6';const A=MK.tlit;for(let j=0;j<A.length;j+=2)if(inView(A[j],A[j+1],3))ctx.fillRect(A[j]-1.5,A[j+1]-1.5,3,3)} // edge lights by day
  // floodlight masts beside each stand, and the stand's number painted at the start of its lead-in
  const M=MK.mast;for(let j=0;j<M.length;j+=2){if(!inView(M[j],M[j+1],8))continue;ctx.fillStyle='#262C33';ctx.fillRect(M[j]-4,M[j+1]-4,8,8);ctx.fillStyle='#6E7883';ctx.fillRect(M[j]-3,M[j+1]-1.5,6,3)}
  if(V.k>=0.3){ctx.font='800 16px "Saira Condensed","Arial Narrow",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';const N=MK.num;
    for(let j=0;j<N.length;j+=3){const x=N[j],y=N[j+1];if(!inView(x,y,30))continue;const g=GATES[N[j+2]],w=ctx.measureText(g).width+12;
      ctx.fillStyle='#0B0D10';ctx.fillRect(x-w/2,y-10,w,20);ctx.fillStyle=MK_Y;ctx.fillText(g,x,y+1)}}
  ctx.restore()});
// the terminal's windows by night: warm light spilling from every open hall's walls, under the walls themselves
LAYER.lit.push(V=>{if(V.d<=0||!MK.win)return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineJoin='round';
  if(V.k<0.3){ctx.strokeStyle=`rgba(255,200,130,${(0.5*V.d).toFixed(3)})`;ctx.lineWidth=10;ctx.stroke(MK.win);ctx.restore();return} // one glow when too small for windows
  ctx.strokeStyle=`rgba(255,196,120,${(0.16*V.d).toFixed(3)})`;ctx.lineWidth=18;ctx.stroke(MK.win);
  ctx.strokeStyle=`rgba(255,214,150,${(0.9*V.d).toFixed(3)})`;ctx.lineWidth=7;ctx.setLineDash([7,5]);ctx.stroke(MK.win);ctx.restore()});
// runway edge lights (white, green across the thresholds), blue taxiway edge lights and the masts' lamps, lit from dusk
LIGHTS.push(V=>{if(!MK.key)return;const a=V.d*2;
  let n=mkStamp(MK.rlit,'255,236,190',4.5,a*0.8);
  for(let r=0;r<1+(G.lv.runway2|0);r++){const y=AF_Y+RWY_Y[r],h=r?28:32;if(!inView(W/2,y,W))continue;const s=mkGlow('110,255,140');ctx.globalAlpha=Math.min(1,a);
    for(const x of [21,W-21])for(let k=0;k<=4;k++){ctx.drawImage(s,x-6,y-h/2+k*h/4-6,12,12);n++}ctx.globalAlpha=1}
  n+=mkStamp(MK.tlit,'70,130,255',5,a*0.9);n+=mkStamp(MK.mast,'255,230,190',10,a);MK.lit=n});
Object.assign(SIMX,{MK,mkBuild,rwyMarks});
