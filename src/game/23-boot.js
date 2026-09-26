/* ================= boot ================= */
let last=performance.now(),uiT=0;
function frame(now){
  const rdt=Math.min(0.1,(now-last)/1000);last=now;
  // at 4x and 8x, take the 0.1-minute steps the balance bot has always used: a third of the work, so fast speeds stay smooth on phones
  if(R.speed>0&&!R.sim){const t=rdt*R.speed,n=Math.ceil(t/(R.speed>=4?0.1:0.034));for(let i=0;i<n;i++)update(t/n)}
  camStep(rdt);draw();
  const hm=hhmm(G.clock);$('#clock').textContent=hm;$('#fsClock').textContent=hm;
  if(R.cashShown==null)R.cashShown=G.cash;R.cashShown+=(G.cash-R.cashShown)*Math.min(1,rdt*9);if(Math.abs(G.cash-R.cashShown)<0.005)R.cashShown=G.cash;
  const cs=money(R.cashShown);if(cs!==R.cashTxt){R.cashTxt=cs;$('#sCash').textContent=cs;$('#fsCash').textContent=cs}
  uiT+=rdt;if(uiT>0.25){uiT=0;refreshUI();renderTip();updateBoard();checkGoals();if(G.tour&&!G.tour.done)tourStep();fitHud();tickToasts(0.25*(R.speed>0?1:0));
    const fc=wxForecast(),ev=pol('curfew')&&nightWin()?'CURFEW':R.fx.storm>G.clock?'STORM':R.fx.strike>G.clock?'STRIKE':fc&&fc.eta<60?`${fc.type.toUpperCase()} IN ${Math.max(1,Math.round(fc.eta))}M`:R.fx.rain>G.clock?'RAIN':R.fx.snow>G.clock?'SNOW':R.fx.fog>G.clock?'FOG':R.fx.fuelUp>G.clock?'FUEL SPIKE':R.fx.rush>G.clock?'RUSH':R.fx.sick>G.clock?'STAFF SHORT':'';const tag=ev||demandName();const el=$('#fxTag');if(el.textContent!==tag){el.textContent=tag;el.style.color=ev?'var(--bad)':tag.includes('PEAK')?'var(--sign)':''}}
  requestAnimationFrame(frame);
}
function start(data){
  let s=data&&data.save,fresh=false;
  if(!s){try{s=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){s=null}}
  if(!s){try{const o=JSON.parse(localStorage.getItem(OLDKEY)||'null');if(o){s=migrate(o);fresh=true}}catch(e){}}
  setSheetSnap(s&&s.sheet!=null?s.sheet:1);resize();
  const away=s&&s.savedAt?(Date.now()-s.savedAt)/1000:0,wasOld=s&&s.level==null,pre15=s&&!s.pv&&s.level!=null;
  resetAll(s);
  if(fresh)toast('Your airline has moved into a full airport. Your cash, aircraft and upgrades came with you.',null,null,'goal',10);
  else if(pre15)toast(`New: ten airport levels, a Masterplan of plans to approve (P), and a world map of routes (W). You're now ${aL(G.level,1)}, with the plans you already use approved.`,[{label:'See the routes',fn:()=>setTab('routes')},{label:'Got it',fn:()=>{}}],null,'goal',20);
  else if(wasOld)toast(`New: levels, Pier B, the region map and plenty more. You start as ${aL(G.level,1)} (Office tab).`,null,null,'goal',14);
  else if(!data?.save&&away>90&&G.rate>0){const gain=Math.round(G.rate*Math.min(away,10800)*0.35);if(gain>=1){earn(gain,'bonus');toast(`Welcome back. The airport earned about ${money(gain)} while you were away.`,null,null,'goal',10)}}
  else if(!s)startTour();
  setTimeout(()=>{cloudInit().catch(()=>{})},0);
  if(s&&!s.nv3&&!fresh)toast('New: Lowmere opens a rival airport once you are a City Airport. Your planes need crews (Gates › Fleet), and the Office has Records and weekly challenges.',null,'nv3','goal',16);G.nv3=1;
  requestAnimationFrame(frame);
}
