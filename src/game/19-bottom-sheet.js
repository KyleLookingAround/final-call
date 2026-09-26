/* ================= bottom sheet (phones) ================= */
const isPhone=()=>matchMedia('(max-width:899px)').matches;
// the tallest the sheet can be while still leaving some of the map in view
function sheetMax(){const app=$('.app'),cs=getComputedStyle(app),bd=$('.board');return Math.max(160,app.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom)-(bd?bd.offsetHeight:0)-16-120)}
function setSheetSnap(n){
  const sd=$('#side');G.sheet=n;
  if(document.body.classList.contains('fs')){sd.style.height='';if(n===0)drawer(false);return}
  sd.style.flexBasis='';
  if(n===0)sd.classList.add('collapsed');else{sd.classList.remove('collapsed');if(isPhone())sd.style.flexBasis=Math.round(Math.min(innerHeight*(n===1?0.42:0.72),sheetMax()))+'px'}
}
addEventListener('resize',()=>{if(isPhone()&&!document.body.classList.contains('fs')&&!sheetDrag)setSheetSnap(G.sheet??1)});
let sheetDrag=null;
// while dragging, the sheet slides over the map instead of resizing it at every step
$('#grip').addEventListener('pointerdown',e=>{const g=$('#grip');g.setPointerCapture(e.pointerId);const h=$('#side').getBoundingClientRect().height;sheetDrag={y:e.clientY,h,base:h,last:h,moved:0}});
$('#grip').addEventListener('pointermove',e=>{
  if(!sheetDrag)return;const dy=e.clientY-sheetDrag.y;sheetDrag.moved=Math.max(sheetDrag.moved,Math.abs(dy));if(sheetDrag.moved<4)return;
  const fs=document.body.classList.contains('fs'),top=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topgap'))||0,h=clamp(sheetDrag.h-dy,80,fs?innerHeight-top-12:sheetMax()),sd=$('#side');sheetDrag.last=h;
  if(fs){sd.classList.remove('collapsed');sd.style.height=h+'px';return}
  // the map takes the whole space under the sheet for the drag (one resize), and the sheet slides over it
  sd.classList.remove('collapsed');sd.classList.add('dragging');sd.style.flexBasis=h+'px';sd.style.marginTop=(110-h)+'px';
});
function endSheet(){
  if(!sheetDrag)return;const d=sheetDrag;sheetDrag=null;const sd=$('#side'),vh=window.innerHeight,fs=document.body.classList.contains('fs');
  sd.classList.remove('dragging');sd.style.marginTop='';
  if(d.moved<4){if(fs){drawer(false);return}setSheetSnap(sd.classList.contains('collapsed')?1:0);save();return}
  const h=d.last;
  if(fs){if(h<vh*0.3){drawer(false);sd.style.height=''}return}
  const mx=sheetMax(),opts=[[0,150],[1,Math.min(vh*0.42,mx)],[2,Math.min(vh*0.72,mx)]];let best=opts[0];for(const o of opts)if(Math.abs(o[1]-h)<Math.abs(best[1]-h))best=o;
  setSheetSnap(best[0]);save();
}
$('#grip').addEventListener('pointerup',endSheet);$('#grip').addEventListener('pointercancel',endSheet);
$('#grip').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSheetSnap($('#side').classList.contains('collapsed')?1:0)}});

