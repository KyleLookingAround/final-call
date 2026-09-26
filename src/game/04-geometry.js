/* ================= geometry ================= */
function mkPath(pts){const segs=[];let L=0;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);segs.push({a,b,len,start:L});L+=len}return {pts,segs,len:L}}
function ptAt(p,s){s=clamp(s,0,p.len);for(const g of p.segs){if(s<=g.start+g.len+1e-6){const t=g.len?(s-g.start)/g.len:0;return [g.a[0]+(g.b[0]-g.a[0])*t,g.a[1]+(g.b[1]-g.a[1])*t]}}const e=p.pts[p.pts.length-1];return [e[0],e[1]]}
function geom(ac){
  const blocks=ac.blocks,cols=blocks.reduce((a,b)=>a+b,0),nA=blocks.length-1,total=cols*SEATW+nA*AISLE;
  const top=CABIN_TOP,pitch=Math.min(16,CABIN_MAX/ac.rows),fw=total/2+7,rowsStart=top+16,end=rowsStart+ac.rows*pitch+12;
  const seatXs=[],aisleX=[],colA=[],colS=[],colCt=[],colBlk=[];let x=-total/2;
  blocks.forEach((n,b)=>{for(let s=0;s<n;s++){seatXs.push(x+SEATW/2);x+=SEATW}if(b<nA){aisleX.push(x+AISLE/2);x+=AISLE}});
  let start=0;
  blocks.forEach((n,b)=>{
    for(let s=0;s<n;s++){
      const c=start+s;let a,side;
      if(b===0){a=0;side=0}else if(b===nA){a=nA-1;side=1}else if(s<n/2){a=b-1;side=1}else{a=b;side=0}
      const blk=[];if(side===0){for(let k=c+1;k<start+n;k++)blk.push(k)}else{for(let k=start;k<c;k++)blk.push(k)}
      colA[c]=a;colS[c]=side;colBlk[c]=blk;colCt[c]=blk.length===0?2:((b===0&&s===0)||(b===nA&&s===n-1))?0:1;
    }
    start+=n;
  });
  return {cols,nA,pitch,fw,top,rowsStart,end,seatXs,aisleX,colA,colS,colCt,colBlk,fd:{x:-fw,y:top+8},rd:{x:-fw,y:end-6},
    P0:(top+8-rowsStart)/pitch-0.5,P1:(end-6-rowsStart)/pitch-0.5,
    wingY:rowsStart+ac.rows*pitch*0.36,chord:Math.max(38,ac.rows*pitch*0.26),span:ac.span,holdY:rowsStart+ac.rows*pitch*0.78};
}
// the walk from the gate to each door, and the baggage cart's run, laid out in the stand's frame (41-airside.js)
function paths(i,g){
  const P=pts=>mkPath(pts.map(([x,y])=>[wx(i,x,y),wy(i,x,y)]));
  const bg=busGate(i);
  if(bg){const lead=[[bg[0],bg[1]],...(LAY.stands[i].road||[])],T=(x,y)=>[wx(i,x,y),wy(i,x,y)];
    return {bridge:mkPath([...lead,T(-g.fw-40,g.fd.y),T(g.fd.x-3,g.fd.y)]),rear:mkPath([...lead,T(-g.fw-40,g.rd.y),T(-g.fw-3,g.rd.y)]),
      cart:P([[118,FACE_Y],[118,g.holdY+16],[g.fw+12,g.holdY]])}}
  if(XF[i].face){const F=(x,y)=>{faceW(i,x,y);return [WP.x,WP.y]},T=(x,y)=>[wx(i,x,y),wy(i,x,y)];
    return {bridge:mkPath([F(-118,FACE_Y),T(g.fd.x-60,g.fd.y),T(g.fd.x-3,g.fd.y)]),rear:mkPath([F(-150,FACE_Y),T(-g.fw-40,g.rd.y+12),T(-g.fw-3,g.rd.y)]),
      cart:mkPath([F(118,FACE_Y),T(118,g.holdY+16),T(g.fw+12,g.holdY)])}}
  return {bridge:P([[-118,FACE_Y],[-118,g.fd.y],[g.fd.x-3,g.fd.y]]),
    rear:P([[-150,FACE_Y],[-150,g.rd.y+12],[-g.fw-3,g.rd.y]]),
    cart:P([[118,FACE_Y],[118,g.holdY+16],[g.fw+12,g.holdY]])};
}
const seatX=(F,c)=>F.geo.seatXs[c];
const rowY=(F,p)=>F.geo.rowsStart+(p+0.5)*F.geo.pitch;
const ARR_DOOR={x:1212,y:532},EXIT={x:970,y:LAND_B+20}; // just inside the immigration hall, and just outside the arrivals hall
let Y0=-180,AF_Y=0; // the map's top, and how far the runway and its taxiway sit above where they are in Classic (layouts set both)
const Y1=830+LAND_DY,RWY_Y=[-140,-88],DOOR={x:150,y:LAND_B-6}; // everything outside the terminal sits LAND_DY lower than before the halls
const BAY=i=>i<360?{x:344+Math.floor(i/5)*12,y:686+LAND_DY+(i%5)*19}:{x:1264+Math.floor((i-360)/5)*12,y:686+LAND_DY+(i%5)*19};
const carCap=(l=G.lv.carpark)=>60+60*l, carFeeBase=(l=G.lv.carpark)=>0.8*(1+0.35*l);
const WAGE={desks:3,lanes:4,officers:3.5},OWN={desks:()=>1+G.lv.desks,lanes:()=>1+G.lv.lanes,officers:()=>1+G.lv.officers};
function staffed(t){const own=OWN[t]();if(G.lv.roster&&G.auto)return clamp((R.autoN&&R.autoN[t])||own,1,own);const v=G.open&&G.open[t];return v==null?own:clamp(v,1,own)}
const fuelMul=()=>(R.fx.hedge>G.clock?0.8:R.fx.fuelUp>G.clock?1.35:R.fx.fuelDown>G.clock?0.85:1)*(1-0.06*G.lv.fuelfarm)*(G.lv.saf?0.8:1);
const sellValue=f=>Math.round(AIRCRAFT[f.type].cost*0.6*Math.max(0.4,1-(f.wear||0)*0.03));
const shopSpentEst=s=>{let t=SHOPS[s.type].cost;for(let k=0;k<s.lvl;k++)t+=Math.round(SHOPS[s.type].cost*0.8*Math.pow(1.7,k));return t};
const shopValue=s=>Math.round(0.4*(s.spent??shopSpentEst(s)));
const loanCap=()=>Math.max(G.loan||0,Math.min(1000000,2000+Math.floor(G.earned*0.3/1000)*1000));
const loanRate=v=>0.01+0.04*Math.pow(clamp(v/loanCap(),0,1),1.5);
const loanStep=()=>{const c=loanCap();return c<=10000?100:c<=100000?500:c<=500000?1000:5000};
const serviceCost=f=>Math.round(AIRCRAFT[f.type].cost*0.05+15);
const faultRisk=w=>clamp((w-5)*0.035,0,0.5);
function demandNow(){const h=(G.clock/60)%24;return h>=5&&h<9?1.2:h>=9&&h<16?0.95:h>=16&&h<20?1.15:h>=20&&h<23?0.9:0.6}
function demandName(){const h=(G.clock/60)%24;return h>=5&&h<9?'MORNING PEAK':h>=9&&h<16?'DAYTIME':h>=16&&h<20?'EVENING PEAK':h>=20&&h<23?'LATE':'NIGHT'}
// passport desks and e-gates stand in the wall between the immigration hall and reclaim; carousels fill the reclaim hall
const boothPos=i=>({x:724+i*14,y:SEC_LINE}),egatePos=i=>({x:846+i*12,y:SEC_LINE}),carX=i=>760+(i%4)*120,carY=i=>i%8<4?630:672; // stands past the eighth share a carousel
// queue places: one shared object, refilled on each call, as the queues read it straight away every step
const SLOT={x:0,y:0},slot=(x,y)=>{SLOT.x=x;SLOT.y=y;return SLOT};
// the queues sit where they always did against their desks and lanes, so each takes as long to walk as before
function arrSlot(i){if(i>=168)return slot(1196+(i%4)*3,536);const per=30,r=Math.floor(i/per),k=i%per;return slot(r%2===0?738+k*8:738+(per-1-k)*8,584-r*10)}
const deskX=i=>32+i*26, kioskX=i=>230+i*17, laneX=i=>304+i*20, FT_X=462;
function ciSlot(i){if(i>=165)return slot(14+(i%4)*3,730+(i%7)*3);const per=33,r=Math.floor(i/per),k=i%per;return slot(r%2===0?24+k*8:24+(per-1-k)*8,719+r*10)}
function secSlot(i){if(i>=85)return slot(296+(i%3)*3,676);const per=17,r=Math.floor(i/per),k=i%per;return slot(r%2===0?302+k*8:302+(per-1-k)*8,631+r*10)}
const ftSlot=i=>slot(FT_X,Math.min(676,631+i*8));
function spotPos(i,j){const bg=busGate(i);if(bg)return {x:bg[0]-70+(j%16)*9,y:bg[1]+bg[2]*(10+Math.floor(j/16)*8.5)};faceW(i,-150+(j%16)*9,FACE_Y-10-Math.floor(j/16)*8.5);return {x:WP.x,y:WP.y}}
const shopX=j=>SHOP_X[j];
const standOpen=i=>i<STAND.length&&(!STAND[i].pier||G.pierB),shopOpen=j=>j<SHOP_X.length&&(SHOP_PH[j]<2||G.pierB);

