/* ================= boot ================= */
let last=performance.now(),uiT=0;
// a throw anywhere in a frame never stops the loop: the first pauses the game, stops saving until the player carries on
// (22-save.js), and says so
function frame(now){
  try{frameBody(now)}catch(e){frameError(e)}finally{requestAnimationFrame(frame)}
}
function frameError(e){if(R.frameErr)return;R.frameErr=1;console.error(e);
  try{setSpeed(0)}catch(e2){R.speed=0}
  saveAlert('frameErr','Something went wrong, so the game has paused and stopped saving. Carry on to play and save again.',
    [{label:'Copy save',fn:()=>{let t='';try{t=localStorage.getItem(KEY)}catch(e){}copySaveCode(t)}},{label:'Carry on',fn:()=>{R.frameErr=0;setSpeed(R.lastSpeed||1)}}]);
}
function frameBody(now){
  const rdt=Math.min(0.1,(now-last)/1000);last=now;
  // at 4x and 8x, take the 0.1-minute steps the balance bot has always used: a third of the work, so fast speeds stay smooth on phones
  if(R.speed>0&&!R.sim){const t=rdt*R.speed,n=Math.ceil(t/(R.speed>=4?0.1:0.034));for(let i=0;i<n;i++)update(t/n)}
  camStep(rdt);draw();
  const hm=hhmm(G.clock);$('#clock').textContent=hm;$('#fsClock').textContent=hm;
  if(R.cashShown==null)R.cashShown=G.cash;R.cashShown+=(G.cash-R.cashShown)*Math.min(1,rdt*9);if(Math.abs(G.cash-R.cashShown)<0.005)R.cashShown=G.cash;
  const cs=money(R.cashShown);if(cs!==R.cashTxt){R.cashTxt=cs;$('#sCash').textContent=cs;$('#fsCash').textContent=cs}
  uiT+=rdt;if(uiT>0.25){uiT=0;refreshUI();renderTip();updateBoard();soundTick();lvlTick();checkGoals();if(G.tour&&!G.tour.done)tourStep();fitHud();tickToasts(0.25*(R.speed>0?1:0));
    const fc=wxForecast(),ev=pol('curfew')&&nightWin()?'CURFEW':weather.on('storm')?'STORM':weather.on('strike')?'STRIKE':fc&&fc.eta<60?`${fc.type.toUpperCase()} IN ${Math.max(1,Math.round(fc.eta))}M`:weather.on('rain')?'RAIN':weather.on('snow')?'SNOW':weather.on('fog')?'FOG':weather.on('fuelUp')?'FUEL SPIKE':weather.on('rush')?'RUSH':weather.on('sick')?'STAFF SHORT':'';const tag=ev||demandName();const el=$('#fxTag');if(el.textContent!==tag){el.textContent=tag;el.style.color=ev?'var(--bad)':tag.includes('PEAK')?'var(--sign)':''}}
}
function start(data){
  let s=data&&data.save,fresh=false;
  let raw=null;if(!s){try{raw=localStorage.getItem(KEY);s=JSON.parse(raw||'null')}catch(e){s=null}R.lastWrite=raw}
  if(!s){try{const o=JSON.parse(localStorage.getItem(OLDKEY)||'null');if(o){s=migrate(o);fresh=true}}catch(e){}}
  setSheetSnap(s&&s.sheet!=null?s.sheet:1);resize();
  const away=s&&s.savedAt?(Date.now()-s.savedAt)/1000:0,wasOld=s&&s.level==null,pre15=s&&!s.pv&&s.level!=null;
  if(newerSave(s))stopSaving('newer');
  const loaded=resetAll(s,raw);if(!loaded)s=null;
  if(!loaded){} // stopSaving has said so
  else if(fresh)toast('Your airline has moved into a full airport. Your cash, aircraft and upgrades came with you.',null,null,'goal',10);
  else if(pre15)toast(`New: ten airport levels, a Masterplan of plans to approve (P), and a world map of routes (W). You're now ${aL(G.level,1)}, with the plans you already use approved.`,[{label:'See the routes',fn:()=>setTab('routes')},{label:'Got it',fn:()=>{}}],null,'goal',20);
  else if(wasOld)toast(`New: levels, Pier B, the region map and plenty more. You start as ${aL(G.level,1)} (Office tab).`,null,null,'goal',14);
  else if(!data?.save&&away>90&&welcomeBack(away)>=1){const gain=welcomeBack(away);G.cash+=gain;G.earned+=gain;G.revBy.bonus=(G.revBy.bonus||0)+gain;{toast(`Welcome back. The airport earned about ${money(gain)} while you were away.`,null,null,'goal',10)}}
  else if(!s&&loaded)startTour();
  if(s&&!s.nv3&&!fresh)toast('New: Lowmere opens a rival airport once you are a City Airport. Your planes need crews (Fleet), and the Office has Records and weekly challenges.',null,'nv3','goal',16);G.nv3=1;
  R.newsBoot=newsDue()?'due':'none';if(R.newsBoot==='due')setTimeout(()=>{openNews(true,true);R.newsBoot='shown'},400); // the checks wait on R.newsBoot
  requestAnimationFrame(frame);
}
// the welcome-back bonus: for each second away (up to three hours), 0.35 of a typical game minute's profit (the median of
// the last day's finished hours), the scale G.rate gave it before. It goes to cash, not to the hour's or the day's takings
// or the minute's rate (earn()), so it never feeds the next one.
function welcomeBack(away){const hs=G.hours.slice(0,-1).map(h=>h.rev-h.cost).sort((a,b)=>a-b);if(!hs.length)return 0;
  return Math.round(Math.max(0,hs[hs.length>>1])/60*Math.min(away,10800)*0.35)}
