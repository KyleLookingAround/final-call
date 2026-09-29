/* ================= camera ================= */
function viewK(){return R.baseK*R.cam.z}
// On a phone the camera bar overlays the foot of the map, so the airport view scrolls past Y1 by the bar's height (R.camH, px, set in resize/renderCam; 0 elsewhere)
function camPad(){return R.view==='airport'&&R.camH?R.camH/viewK():0}
function camBounds(){return R.view==='region'?{x0:0,y0:0,x1:RW,y1:RH}:R.view==='world'?{x0:0,y0:0,x1:WW,y1:WH}:{x0:0,y0:Y0,x1:W,y1:Y1+camPad()}}
function zMin(){const b=camBounds(),ph=R.view==='airport'?R.camH||0:0,bh=R.view==='airport'?Y1-Y0:b.y1-b.y0;return Math.min(1,Math.min(R.sw/(b.x1-b.x0),(R.sh-ph)/bh)/R.baseK)}
function clampCam(){
  const c=R.cam,k=viewK(),vw=R.sw/k,vh=R.sh/k;
  c.z=clamp(c.z,zMin(),2.6);
  const b=camBounds(),bw=b.x1-b.x0,bh=b.y1-b.y0;c.x=vw>=bw?b.x0+(bw-vw)/2:clamp(c.x,b.x0,b.x1-vw);c.y=vh>=bh?b.y0+(bh-vh)/2:clamp(c.y,b.y0,b.y1-vh);
}
function zoomAt(px,py,f){const c=R.cam,k0=viewK(),wx=c.x+px/k0,wy=c.y+py/k0;c.z=clamp(c.z*f,zMin(),2.6);const k=viewK();c.x=wx-px/k;c.y=wy-py/k;c.tx=null;clampCam()}
function focus(i,z){
  if(R.view==='region'){regionFocus(i==='all'?'all':'air');return}
  if(R.view==='world'){worldFocus('all');return}
  const c=R.cam;if(z!=null)c.z=z;const k=viewK();
  if(i==='all'){c.z=zMin();c.tx=0;c.ty=Y0}else{const b=standBox(i);c.tx=b[0]+b[2]/2-R.sw/k/2;c.ty=b[1]+b[3]/2-R.sh/k/2}
  const k2=viewK(),vw=R.sw/k2,vh=R.sh/k2;c.tx=vw>=W?(W-vw)/2:clamp(c.tx,0,W-vw);{const b=camBounds();c.ty=vh>=b.y1-Y0?Y0+(b.y1-Y0-vh)/2:clamp(c.ty,Y0,b.y1-vh)}
}
function camStep(dt){const c=R.cam;if(c.tx==null)return;const a=1-Math.pow(0.001,dt);c.x+=(c.tx-c.x)*a;c.y+=(c.ty-c.y)*a;clampCam();if(Math.abs(c.x-c.tx)<0.5&&Math.abs(c.y-c.ty)<0.5)c.tx=null}
const ptrs=new Map();let moved=0,pinchD=0;
cv.addEventListener('pointerdown',e=>{ensureAudio();cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.offsetX,y:e.offsetY});moved=0;R.cam.tx=null;cv.classList.add('drag');if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinchD=Math.hypot(a.x-b.x,a.y-b.y)}});
cv.addEventListener('pointermove',e=>{
  const p=ptrs.get(e.pointerId);if(!p)return;const dx=e.offsetX-p.x,dy=e.offsetY-p.y;p.x=e.offsetX;p.y=e.offsetY;
  if(ptrs.size===1){const k=viewK();R.cam.x-=dx/k;R.cam.y-=dy/k;moved+=Math.abs(dx)+Math.abs(dy);clampCam()}
  else if(ptrs.size===2){const [a,b]=[...ptrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinchD>0)zoomAt((a.x+b.x)/2,(a.y+b.y)/2,d/pinchD);pinchD=d;moved+=10}
});
function endPtr(e){if(!ptrs.has(e.pointerId))return;const single=ptrs.size===1;ptrs.delete(e.pointerId);if(!ptrs.size)cv.classList.remove('drag');if(single&&moved<8&&e.type==='pointerup')tapAt(e.offsetX,e.offsetY)}
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.offsetX,e.offsetY,Math.exp(-e.deltaY*0.0015))},{passive:false});
const PAX_TAP=[]; // (world x, y, zoom) → true if a tap on the airport view picked a passenger (61-late-runners.js)
function tapAt(px,py){
  const now=performance.now();
  if(now-(R.lastTap||0)<320&&Math.hypot(px-R.ltx,py-R.lty)<30){R.lastTap=0;zoomAt(px,py,1.7);return}
  R.lastTap=now;R.ltx=px;R.lty=py;
  const k=viewK(),wx=R.cam.x+px/k,wy=R.cam.y+py/k;
  if(R.view==='region'){regionTap(wx,wy);return}
  if(R.view==='world'){worldTap(wx,wy);return}
  if(PAX_TAP.some(f=>f(wx,wy,k)))return;
  if(wy<AF_Y){setTab('ground');return}
  if(wy>764+LAND_DY&&wx<340&&(airKind('tram')||R.tram.x!=null)){setTab('region');return}
  if(wy>LAND_B+2){R.sSub='landside';setTab('sales');return}
  if(wy<SEC_Y){
    if(SHOP_X.some((x,j)=>shopOpen(j)&&shopHit(j,wx,wy))){goTo('sales','.shopcard');return}
    const i=SIDX.findIndex(i=>standHit(i,wx,wy));if(i<0)return;
    selectStand(i,true);if(i===0)R.tourTap=true;
  } else if(wx<LAND_R)setTab('terminal');else{R.sSub='landside';setTab('sales')}
}
function selectStand(i,openTab){R.sel=i;renderCam();$$('.brow').forEach(r=>r.classList.toggle('sel',+r.dataset.stand===i));if(openTab)setTab('stands');else if(G.tab==='stands')renderPanel();const el=document.getElementById('stand-'+i);if(el&&G.tab==='stands')el.scrollIntoView({block:'nearest',behavior:REDUCED?'auto':'smooth'})}
function measureCam(){if(R.sim)return;const el=$('#cam'),h=$('#stage').clientWidth<=600&&R.view==='airport'?Math.round(el.offsetHeight+8):0;if(h!==R.camH){R.camH=h;clampCam()}}
if(!R.sim){const ro=new ResizeObserver(()=>{measureCam();if(R.baseK)clampCam()});ro.observe($('#stage'));ro.observe($('#cam'))} // the bar's height follows the map's width and its own wrapping
function renderCam(){drawCam();measureCam()}
function drawCam(){
  if(R.view==='world'){$('#cam').innerHTML=`<button data-cam="all">World</button><button data-wcam="near">Near</button><button data-zoom="-1" aria-label="Zoom out">−</button><button data-zoom="1" aria-label="Zoom in">+</button>`;return}
  if(R.view==='region'){$('#cam').innerHTML=`<button data-cam="all">All</button><button data-rcam="air">Airport</button><button data-rcam="city">City</button><button data-rcam="east">East</button><button data-zoom="-1" aria-label="Zoom out">−</button><button data-zoom="1" aria-label="Zoom in">+</button>`;return}
  const sh=R.sw<560,two=twoFloors(),at=!two&&R.floor==='down'?'up':R.floor; // a layout on one floor shows Roof and Halls
  const fl=(two?[['roof','Roof','Roof','The roof'],['up','Departures','Dep','Departures, the upper floor'],['down','Arrivals','Arr','Arrivals, the lower floor']]:[['roof','Roof','Roof','The roof'],['up','Halls','Halls','The halls']]) // short on a phone, as the board is
    .map(([f,n,s,t])=>`<button data-floor="${f}" class="${at===f?'on':''}" aria-pressed="${at===f}" title="${t}" aria-label="${t}">${sh?s:n}</button>`).join('');
  $('#cam').innerHTML=fl+`<button data-cam="all">All</button>`+G.stands.map((s,i)=>s.built?`<button data-cam="${i}" class="${R.sel===i?'on':''}">${GATES[i]}</button>`:'').join('')+`<button data-zoom="-1" aria-label="Zoom out">−</button><button data-zoom="1" aria-label="Zoom in">+</button>`;
}
$('#cam').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.rcam){regionFocus(b.dataset.rcam);return}
  if(b.dataset.wcam){worldFocus(b.dataset.wcam);return}
  if(b.dataset.floor){setFloor(b.dataset.floor);return}
  if(b.dataset.cam==='all')focus('all');else if(b.dataset.cam!=null){selectStand(+b.dataset.cam,false);focus(+b.dataset.cam)}
  else if(b.dataset.zoom)zoomAt(R.sw/2,R.sh/2,b.dataset.zoom==='1'?1.25:0.8)});

