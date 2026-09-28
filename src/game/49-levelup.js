/* ================= the level-up card: what a new level has just unlocked, with links straight there ================= */
// checkLevel hands a level-up to lvlUp; the card opens at the frame loop's next UI tick (lvlTick), so levels reached together
// share one card. Never in the headless sim or the guided start, and not with G.set.lvlCard off: then the toast, as before.
// It pauses the game and puts the previous speed back when it closes, as What's new does. R.lvlCard is runtime only.
const lvlCities=t=>{const c=CITIES.filter(x=>x[2]===t).map(x=>x[1]);return c.length>4?c.slice(0,4).join(', ')+` and ${c.length-4} more`:c.join(', ')};
// what's new between level `from` and level `to`, from the same data the game gates on
function lvlUnlocks(from,to){
  const newAt=l=>l>from&&l<=to,out={gates:[],more:[],plans:[],open:[]};
  if(newAt(PIER.lvl)&&!G.pierB&&STAND.some(s=>s.pier))out.gates.push({t:'Pier B',d:'A pier out onto the apron, for the gates along it.',ic:'pier',go:'pier'});
  SIDX.forEach(i=>{const s=STAND[i];if(s&&newAt(s.lvl)&&!(G.stands[i]&&G.stands[i].built))out.gates.push({t:'Gate '+GATES[i],d:(s.pier?'On Pier B. ':'')+(s.kind==='remote'?'A remote stand, reached by bus.':'Ready to build.'),ic:'plane',go:'gate:'+i})});

  for(const k in UPG){const u=UPG[k];if(!upLocked(k)&&G.lv[k]<u.max&&capAt(k,to)>capAt(k,from))out.more.push({t:u.name,ic:u.icon,tab:u.tab,go:'up:'+k})}
  // each plan says what it does, then names the aircraft, routes and their cities, and transport it brings
  for(const T of TECH)if(newAt(T.t)&&!researched(T.id)){const x=T.u.filter(k=>/^(ac|rt|mode):/.test(k)).map(k=>k.startsWith('rt:')?`${itemName(k)}: ${lvlCities(+k.slice(3))}`:itemName(k));
    out.plans.push({t:T.n,d:T.d+(x.length?' '+x.join(' · ')+'.':''),br:T.b,ic:LV_BR_IC[T.b],go:'plan'})}
  if(newAt(1)){out.open.push({t:'The Region',d:'Run lines to the towns, build stations and develop sites.',ic:'map',go:'tab:region'},{t:'The World map',d:'Open routes and set their fares.',ic:'globe',go:'tab:routes'},
    {t:'Weekly challenges',d:'Three a week, for cash and plan points (Office › Progress).',ic:'chart',go:'office:progress'},{t:'Night flights',d:'Choose a curfew or keep flying all night (Office › Policies).',ic:'book',go:'office:policies'})}
  if(newAt(RIV_LV))out.open.push({t:'A rival at Lowmere',d:'Lowmere starts building an airport to compete on your routes.',ic:'tower',go:'tab:routes'});
  if(newAt(4))out.open.push({t:'Consultants',d:'Buy extra plan points in the Masterplan.',ic:'crew',go:'plan'});
  if(newAt(RIV_BUY_LV))out.open.push({t:'Buy Lowmere Airport',d:'Take over your rival for a daily dividend (Routes).',ic:'store',go:'tab:routes'});
  return out;
}
const LV_BR_IC={term:'lane',air:'runway',net:'plane',com:'ticket',reg:'train',lay:'tower'},LV_TAB={terminal:'Terminal',ground:'Airfield',stands:'Gates',sales:'Sales',region:'Region',routes:'Routes',office:'Office'};
const lvIc=n=>svg(ICON[n]?n:'plane');
function renderLvl(from,to){
  const U=lvlUnlocks(from,to),n=to-from,name=LEVELS[to].name,art=/^[aeiou]/i.test(name)?'an':'a';let cash=0,pts=0;for(let k=from+1;k<=to;k++){cash+=LEVELS[k].reward||0;pts+=LVL_PTS(k)}
  const top=LEVELS.length-1,ups=['','','Two','Three','Four','Five'][n]||n;
  // the hero: a sign-yellow level tag, the level's name, and a ladder of every level with the new ones lit
  $('#lvlHero').innerHTML=`<button class="close" data-lvclose aria-label="Close">×</button>
    <div class="lvkick"><span class="tag">Level ${to}</span>${n>1?`<span class="up">${ups} levels up</span>`:'<span>Level up</span>'}</div>
    <h2 id="lvlT"><small>Now ${art}</small>${name}</h2>
    <div class="lvladder" aria-hidden="true">${[...Array(top)].map((_,k)=>{const L=k+1;return `<i class="${L>from&&L<=to?'now':L<=from?'had':''}" style="--k:${L-from-1}"></i>`}).join('')}</div>
    <div class="lvends"><span>${LEVELS[1].name}</span><span>${to<top?'Next: '+LEVELS[to+1].name:'The top'}</span></div>`;
  const row=x=>`<button class="lvgo" data-lvgo="${x.go}"><span class="ic">${lvIc(x.ic)}</span><span class="tx"><b>${x.br?`<span class="br">${(BRANCHES.find(b=>b[0]===x.br)||['',''])[1]}</span>`:''}${x.t}</b>${x.d?`<span>${x.d}</span>`:''}</span><span class="go" aria-hidden="true">›</span></button>`;
  const sec=(t,k)=>`<div class="lvsec">${t}${k?` <em>${k}</em>`:''}</div>`;
  let h=`<div class="lvtiles"><div class="lvtile"><b>+${money(cash)}</b><span>Reward</span></div><button class="lvtile pts" data-lvgo="plan"><b>${pts} ★</b><span>Plan points to spend</span></button></div>`;
  if(U.gates.length)h+=sec('At the airport')+U.gates.map(row).join('');
  if(U.plans.length)h+=sec('New in the Masterplan',U.plans.length)+U.plans.map(row).join('');
  if(U.open.length)h+=sec('Opens up')+U.open.map(row).join('');
  if(U.more.length){h+=sec('Upgrades can go higher',U.more.length);const tabs=[...new Set(U.more.map(x=>x.tab))];
    for(const t of tabs)h+=`<div class="lvgrp">${LV_TAB[t]||t}</div><div class="lvchips">`+U.more.filter(x=>x.tab===t).map(x=>`<button class="lvchip chip" data-lvgo="${x.go}">${lvIc(x.ic)}${x.t}</button>`).join('')+`</div>`}
  h+=`<div class="kofifoot"><a class="kofi" href="https://ko-fi.com/kylemck" target="_blank" rel="noopener">${svg('cup')}Buy me a Ko-fi</a></div>`;
  $('#lvlList').innerHTML=h;$('#lvlList').scrollTop=0;
  $('#lvlPlan').innerHTML=`Masterplan${pts?`<span class="lvpts"> · ${pts} ★</span>`:''}`;
}
function lvlUp(n){
  if(R.sim||SET().lvlCard===false||(G.tour&&!G.tour.done))return false;
  const c=R.lvlCard||(R.lvlCard={from:n-1,to:n});c.to=Math.max(c.to,n);if(!$('#lvlup').hidden)renderLvl(c.from,c.to);return true;
}
function lvlCardOpen(on){
  const el=$('#lvlup');
  if(!on){if(el.hidden)return;el.hidden=true;R.lvlCard=null;if(R.lvlPrev>0)setSpeed(R.lvlPrev);R.lvlPrev=0;return}
  const c=R.lvlCard;if(!c)return;renderLvl(c.from,c.to);el.hidden=false;R.lvlPrev=R.speed;setSpeed(0);$('#lvlup .lvplay').focus();
}
// from the frame loop: open a waiting card once nothing else is over the game
function lvlTick(){if(R.sim||!R.lvlCard||!$('#lvlup').hidden||$$('.help:not([hidden])').length)return;lvlCardOpen(true)}
function lvlGo(g){
  lvlCardOpen(false);const i=g.indexOf(':'),a=i<0?g:g.slice(0,i),b=g.slice(i+1);
  if(a==='plan')openPlan();else if(a==='tab')setTab(b);else if(a==='up')goTo(UPG[b].tab,`[data-buy="${b}"]`);
  else if(a==='gate')goTo('stands',`[data-standbuy="${b}"]`);else if(a==='pier')goTo('stands','[data-pierbuy]');else if(a==='office'){R.oSub=b;setTab('office')}
}
$('#lvlup').addEventListener('click',e=>{const g=e.target.closest('[data-lvgo]');if(g){lvlGo(g.dataset.lvgo);return}if(e.target.id==='lvlup'||e.target.closest('[data-lvclose]'))lvlCardOpen(false)});
document.addEventListener('keydown',e=>{if(!$('#lvlup').hidden&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();lvlCardOpen(false)}},true);
SIMX.lvlUnlocks=lvlUnlocks;SIMX.lvlUp=lvlUp;SIMX.lvlTick=lvlTick;SIMX.lvlCardOpen=lvlCardOpen;SIMX.checkLevel=checkLevel;SIMX.setSpeed=setSpeed;
