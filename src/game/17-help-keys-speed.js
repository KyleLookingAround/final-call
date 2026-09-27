/* ================= help, keys, speed ================= */
function feedbackRepo(){const m=/^([^.]+)\.github\.io$/.exec(location.hostname);if(!m)return null;const repo=location.pathname.split('/').filter(Boolean)[0];return repo?`${m[1]}/${repo}`:null}
function feedbackUrl(){const repo=feedbackRepo();if(!repo)return null;
  const body=['Version: '+UPDATES[0].v,'Level: '+LEVELS[G.level].name,'Layout: '+(LAYOUTS[G.layout]||LAYOUTS.classic).name,'Game day: '+G.day,'Screen: '+innerWidth+'×'+innerHeight,'Device: '+(matchMedia('(pointer:coarse)').matches?'Touch':'Desktop')].join('\n');
  return `https://github.com/${repo}/issues/new?body=${encodeURIComponent(body)}`}
function openHelp(on){$('#help').hidden=!on;if(on){R.helpPrev=R.speed;setSpeed(0);const u=feedbackUrl(),fb=$('#feedbackLink');fb.hidden=!u;if(u)fb.href=u;$('#help .close').focus()}else if(R.helpPrev){setSpeed(R.helpPrev)}}
$('#helpb').addEventListener('click',()=>openHelp(true));
$('#help').addEventListener('click',e=>{if(e.target.id==='help'||e.target.closest('[data-helpclose]'))openHelp(false)});
function setSpeed(v){if(v>0)R.lastSpeed=v;R.speed=v;$$('.hud [data-speed]').forEach(x=>x.classList.toggle('on',+x.dataset.speed===v));$('#ptag').hidden=v!==0}
document.addEventListener('keydown',e=>{
  if(e.target.closest&&e.target.closest('input,textarea'))return;
  if(!$('#help').hidden){if(e.key==='Escape'||e.key==='h'||e.key==='H'){e.preventDefault();e.stopImmediatePropagation();openHelp(false)}return}
  if(!$('#plan').hidden){if(e.key==='Escape'||e.key==='p'||e.key==='P'){e.preventDefault();e.stopImmediatePropagation();closePlan()}return}
  if((e.key==='p'||e.key==='P')&&!$('#planb').hidden){openPlan();return}
  if(e.key===' '){if(e.target.closest&&e.target.closest('button'))return;e.preventDefault();setSpeed(R.speed>0?0:(R.lastSpeed||1))}
  else if(/^[1-8]$/.test(e.key)){const i=+e.key-1;if(G.stands[i].built){selectStand(i,false);focus(i)}}
  else if(e.key==='0')focus('all');
  else if(e.key==='Escape'&&R.draft){R.draft=null;if(G.tab==='region')renderPanel()}
  else if((e.key==='r'||e.key==='R')&&tabOpen('region')){setView(R.view==='region'?'airport':'region')}
  else if((e.key==='w'||e.key==='W')&&tabOpen('routes')){setView(R.view==='world'?'airport':'world')}
  else if(e.key==='+'||e.key==='=')zoomAt(R.sw/2,R.sh/2,1.25);
  else if(e.key==='-'||e.key==='_')zoomAt(R.sw/2,R.sh/2,0.8);
  else if(e.key==='h'||e.key==='H'||e.key==='?')openHelp(true);
},true);

