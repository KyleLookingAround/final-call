/* ================= layout ================= */
function resize(){
  const r=$('#stage').getBoundingClientRect();if(!r.width||!r.height)return;
  const first=R.sw===1;R.sw=r.width;R.sh=r.height;R.dpr=Math.min(2.5,window.devicePixelRatio||1);if(!sheetDrag||!R.baseK)R.baseK=R.sh/H;
  cv.width=Math.round(R.sw*R.dpr);cv.height=Math.round(R.sh*R.dpr);
  if(first){if(R.view!=='airport'){R.cam.z=zMin();R.cam.init=1}else{R.cam.z=1;R.cam.x=0;R.cam.y=0}}
  clampCam();fitHud();
}
function fitHud(){
  const b=document.body,h=$('.hud'),f=$('.fsbar'),p=$('#ptag');if(!h)return;
  b.classList.remove('fsstack');p.classList.remove('low');
  const hr=h.getBoundingClientRect(),hb=Math.round(8+hr.height+8)+'px',st=$('#stage');if(st.style.getPropertyValue('--hb')!==hb)st.style.setProperty('--hb',hb);
  if(f){const fr=f.getBoundingClientRect();b.classList.toggle('fsstack',fr.width>0&&fr.right>hr.left-6)}
  const sr=$('#stage').getBoundingClientRect(),sw=sr.width;p.classList.toggle('low',sw/2+110>sw-8-hr.width-6);$('#stage').classList.toggle('short',sr.height<230);
}
new ResizeObserver(resize).observe($('#stage'));

