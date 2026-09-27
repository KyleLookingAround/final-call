/* ================= the level-up card: what a new level has just unlocked, with links straight there ================= */
// checkLevel hands a level-up to lvlUp; the card opens at the frame loop's next UI tick (lvlTick), so levels reached together
// share one card. Never in the headless sim or the guided start, and not with G.set.lvlCard off: then the toast, as before.
// It pauses the game and puts the previous speed back when it closes, as What's new does. R.lvlCard is runtime only.
const lvlCities=t=>{const c=CITIES.filter(x=>x[2]===t).map(x=>x[1]);return c.length>4?c.slice(0,4).join(', ')+` and ${c.length-4} more`:c.join(', ')};
// what's new between level `from` and level `to`, from the same data the game gates on
function lvlUnlocks(from,to){
  const newAt=l=>l>from&&l<=to,out={gates:[],more:[],plans:[],open:[]};
  if(newAt(PIER.lvl)&&!G.pierB&&STAND.some(s=>s.pier))out.gates.push({t:'Pier B, for the gates along it',go:'pier'});
  SIDX.forEach(i=>{const s=STAND[i];if(s&&newAt(s.lvl)&&!(G.stands[i]&&G.stands[i].built))out.gates.push({t:'Gate '+GATES[i]+(s.pier?' on Pier B':''),go:'gate:'+i})});

  for(const k in UPG){const u=UPG[k];if(!upLocked(k)&&G.lv[k]<u.max&&capAt(k,to)>capAt(k,from))out.more.push({t:u.name,go:'up:'+k})}
  // each plan says what it does, then names the aircraft, routes and their cities, and transport it brings
  for(const T of TECH)if(newAt(T.t)&&!researched(T.id)){const x=T.u.filter(k=>/^(ac|rt|mode):/.test(k)).map(k=>k.startsWith('rt:')?`${itemName(k)}: ${lvlCities(+k.slice(3))}`:itemName(k));
    out.plans.push({t:T.n,d:T.d+(x.length?' '+x.join(' · ')+'.':''),go:'plan'})}
  if(newAt(1)){out.open.push({t:'The Region: lines, stations and sites',go:'tab:region'},{t:'The World map: open routes and set fares',go:'tab:routes'},
    {t:'Weekly challenges (Office › Records)',go:'office:records'},{t:'The night-flights policy (Office › Policies)',go:'office:policies'})}
  if(newAt(RIV_LV))out.open.push({t:'Lowmere starts building a rival airport (Routes)',go:'tab:routes'});
  if(newAt(4))out.open.push({t:'Consultants sell plan points (Masterplan)',go:'plan'});
  if(newAt(RIV_BUY_LV))out.open.push({t:'You can buy Lowmere Airport (Routes)',go:'tab:routes'});
  return out;
}
function renderLvl(from,to){
  const U=lvlUnlocks(from,to),n=to-from;let cash=0,pts=0;for(let k=from+1;k<=to;k++){cash+=LEVELS[k].reward||0;pts+=LVL_PTS(k)}
  const row=x=>`<button class="lvgo" data-lvgo="${x.go}"><b>${x.t}</b>${x.d?`<span>${x.d}</span>`:''}</button>`;
  $("#lvlT").innerHTML=`Now ${aL(to,1)}`;
  let h=`<p class="lvsub">${n>1?`${['','','Two','Three','Four','Five'][n]||n} levels up. `:''}+${money(cash)} and <b>${pts} plan point${pts===1?'':'s'}</b> to spend.</p>`;
  if(U.gates.length)h+=`<h3>At the airport</h3>`+U.gates.map(row).join('');
  if(U.more.length)h+=`<h3>More upgrade levels</h3><div class="chips">`+U.more.map(x=>`<button class="chip" data-lvgo="${x.go}">${x.t}</button>`).join('')+`</div>`;
  if(U.plans.length)h+=`<h3>New plans in the Masterplan</h3>`+U.plans.map(row).join('');
  if(U.open.length)h+=`<h3>Opens up</h3>`+U.open.map(row).join('');
  $('#lvlList').innerHTML=h;
}
function lvlUp(n){
  if(R.sim||SET().lvlCard===false||(G.tour&&!G.tour.done))return false;
  const c=R.lvlCard||(R.lvlCard={from:n-1,to:n});c.to=Math.max(c.to,n);if(!$('#lvlup').hidden)renderLvl(c.from,c.to);return true;
}
function lvlCardOpen(on){
  const el=$('#lvlup');
  if(!on){if(el.hidden)return;el.hidden=true;R.lvlCard=null;if(R.lvlPrev>0)setSpeed(R.lvlPrev);R.lvlPrev=0;return}
  const c=R.lvlCard;if(!c)return;renderLvl(c.from,c.to);el.hidden=false;R.lvlPrev=R.speed;setSpeed(0);$('#lvlup .close').focus();
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
