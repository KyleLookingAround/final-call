/* ================= full screen ================= */
function drawer(open){document.body.classList.toggle('drawer',open);if(!open)$('#side').style.height=''}
function setFs(on){
  document.body.classList.toggle('fs',on);drawer(false);if(!on)setSheetSnap(G.sheet??1);
  $('#fsi').setAttribute('d',on?'M5 2v3H2M12 5H9V2M9 12V9h3M2 9h3v3':'M2 5V2h3M9 2h3v3M12 9v3H9M5 12H2V9');
  $('#fsb').classList.toggle('on',on);$('#fsb').setAttribute('aria-label',on?'Exit full screen':'Full screen');
  const d=document,el=d.documentElement;
  try{
    if(on&&!d.fullscreenElement&&el.requestFullscreen)el.requestFullscreen({navigationUI:'hide'}).catch(()=>{});
    else if(!on&&d.fullscreenElement&&d.exitFullscreen)d.exitFullscreen().catch(()=>{});
  }catch(e){}
  refreshUI();requestAnimationFrame(fitHud);
}
$('#fsb').addEventListener('click',()=>setFs(!document.body.classList.contains('fs')));
$('#fsManage').addEventListener('click',()=>drawer(!document.body.classList.contains('drawer')));
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&document.body.classList.contains('fs')&&R.fsNative)setFs(false);R.fsNative=!!document.fullscreenElement});
cv.addEventListener('pointerdown',()=>{if(document.body.classList.contains('drawer')&&matchMedia('(max-width:899px)').matches)drawer(false)});
document.addEventListener('keydown',e=>{
  if(e.target.closest&&e.target.closest('input,textarea'))return;
  if(e.key==='f'||e.key==='F'){setFs(!document.body.classList.contains('fs'))}
  else if(e.key==='Escape'&&document.body.classList.contains('fs')){if(document.body.classList.contains('drawer'))drawer(false);else setFs(false)}
});

