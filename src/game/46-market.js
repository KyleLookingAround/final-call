/* ================= the market place and the concourse: shops, and the walk to the gate ================= */
// airside() picks what a passenger does once through security (or off a connecting flight): a shop, or straight to the gate.
// after security (into the market place), or off a connecting flight (in that stand's room): to a shop, or to the gate
function airside(p,x,room){
  if(room==null){p.x=x;p.y=SEC_LINE-8;p.room=hallId('mkt')}else{p.x=x;p.y=516;p.room=room}
  const F=p.F,left=F.std-G.clock,built=[];G.shops.forEach((s,j)=>{if(s&&shopOpen(j))built.push(j)});
  if(p.leader){const L=p.leader;if((L.state==='toShop'||L.state==='shop')&&G.shops[L.shop]&&left>15){p.state='toShop';p.shop=L.shop;
    {const t=clamp(L.su+(rnd()-0.5)*16,0,116);shopPt(L.shop,t,47+(rnd()-0.5)*4);p.tx=WP.x;p.ty=WP.y;p.su=t}
    route(p,SHOP_ROOM[L.shop]);return}toGate(p);return}
  if(left>15&&built.length){
    for(let k=built.length-1;k>0;k--){const j=Math.floor(rnd()*(k+1));[built[k],built[j]]=[built[j],built[k]]}
    if(p.biz||p.prio){const L=built.find(j=>SHOPS[G.shops[j].type].vip);if(L!=null&&rnd()<0.9){p.state='toShop';p.shop=L;toShop(p,L);return}}
    for(const j of built){const sh=SHOPS[G.shops[j].type];if(sh.vip)continue;if(rnd()<Math.min(0.95,sh.pull*SHOP_PULL[j]*PTYPE[p.type||'lei'].shop*(p.type==='grp'&&sh.id==='bar'?2.5:1)*(1+0.3*((p.psize||1)-1)))){p.state='toShop';p.shop=j;toShop(p,j);return}}
  }
  toGate(p);
}
// a place along shop j's front: t along it, e out from its back wall (47 is just outside)
function shopPt(j,t,e){const a=SHOP_A[j]*Math.PI/180,c=exact(Math.cos(a)),s=exact(Math.sin(a));WP.x=SHOP_X[j]+t*c-e*s;WP.y=SHOP_Y[j]+t*s+e*c;return WP}
function toShop(p,j){
  const t=8+rnd()*100;shopPt(j,t,47);p.tx=WP.x;p.ty=WP.y;p.su=t;route(p,SHOP_ROOM[j]);
}
function toGate(p){
  const S=R.st[p.stand],j=S.spots.indexOf(null);
  if(j>=0){S.spots[j]=p;p.spot=j;const s=spotPos(p.stand,j);p.tx=s.x;p.ty=s.y}
  else{p.spot=-1;const a=rnd(),b=rnd(),bg=busGate(p.stand);if(bg){p.tx=bg[0]-67+a*130;p.ty=bg[1]+bg[2]*(14+b*12)}else{faceW(p.stand,-147+a*130,FACE_Y-14-b*12);p.tx=WP.x;p.ty=WP.y}}
  p.state='toGate';route(p,STAND_ROOM[p.stand]);
}
PAX_STEP.toShop=(p,dt,D)=>{if(!G.shops[p.shop])toGate(p);else if(walk(p,D.cwalk*p.spd*walkMul(p),dt)){p.state='shop';p.t=SHOPS[G.shops[p.shop].type].dwell;p.t0=p.t}};
PAX_STEP.shop=(p,dt)=>{
  const F=p.F,hurry=F.plane.state==='boarding'&&G.clock>=F.std-12;
  p.t-=dt;
  if(p.t<=0||hurry){
    const s=G.shops[p.shop];
    if(s){const frac=clamp(1-Math.max(0,p.t)/p.t0,0.3,1),v=SHOPS[s.type].spend*(LAY.shopBonus&&LAY.shopBonus[SHOPS[s.type].id]||1)*Math.pow(1.25,s.lvl)*(1+0.6*F.ac.tier)*frac*(G.lv.mall?1.4:1);s.earned=(s.earned||0)+v;earn(v,'shops',p.x,p.y-6,'#F5D08A',F)}
    toGate(p);
  }
};
PAX_STEP.toGate=(p,dt,D)=>{if(walk(p,D.cwalk*p.spd*walkMul(p),dt))p.state='gate'};
