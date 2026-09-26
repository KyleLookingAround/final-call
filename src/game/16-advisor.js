/* ================= advisor ================= */
function advise(){
  if((R.tipSnooze||0)>G.clock||tourOn())return null;
  const D=derived(),ciW=R.ciQ.length*D.checkin/(D.desks+D.kiosks*0.6),secW=R.secQ.length*D.sec/D.lanes;
  const cheapest=keys=>{let b=null;for(const k of keys){if(!upBuyable(k)||UPG[k].build)continue;const c=upCost(k);if(!b||c<b.c)b={k,c}}return b};
  const up=(text,keys)=>{const b=cheapest(keys);return b?{text:`${text} <b>${UPG[b.k].name}</b> would help.`,k:b.k,c:b.c}:null};
  let a=null;
  const auto=G.lv.roster&&G.auto,arW0=R.arrQ.length*D.passT/(D.officers+D.egates*1.6);
  if(!auto){for(const [t,w,name] of [['lanes',secW,'security lanes'],['desks',ciW,'check-in desks'],['officers',arW0,'passport desks']]){if(!a&&w>7&&staffed(t)<OWN[t]())a={text:`Queues are about ${Math.round(w)} min, but only ${staffed(t)} of ${OWN[t]()} ${name} are staffed.`,go:['terminal',`[data-staff="${t}:1"]`],label:'Staff up'}}}
  if(!a){const rr=repRecent(),worst=Object.entries(rr).filter(e=>e[1]<-5&&REPWHY[e[0]]).sort((x,y)=>x[1]-y[1])[0];
    if(worst){const [w,v]=worst,msg=`Your rating fell ${Math.round(-v)} points in the last 3 hours from ${REPWHY[w][0]}.`;
      a=REPWHY[w][2]?{text:msg+REPWHY[w][2],go:['region','.lcard'],label:'Region'}:up(msg,REPWHY[w][1])||(REPWHY[w][1].length?{text:msg+' Nothing left to upgrade for it, so raise ticket prices to thin the crowds.',go:['sales','[data-fare="1"]'],label:'Prices'}:null)}}
  if(!a&&R.reg&&R.reg.lines){const h=hour();if(h>=8&&h<20)for(const L of sortedLines()){const l=R.reg.lines[L.id];if(l&&l.f>0&&l.riders<3&&l.ops>15&&!buildOf('line:'+L.id)){a={text:`${lineCode(L)} (${lineName(L)}) carries almost nobody. Reroute it, or close it to save ${money(l.ops)} an hour.`,go:['region',`[data-lsel="${L.id}"]`],label:'Lines'};break}}}
  if(!a&&G.dstat&&(G.dstat.crewDl||0)>=2&&SET().autoCrews===false)a={text:`Flights waited for a crew ${G.dstat.crewDl} times today.`,go:['stands','[data-crewhire]'],label:'Crews'};
  if(!a&&R.rwy.q.length>=3)a=up(`${R.rwy.q.length} aircraft are waiting for the runway.`,['atc']);
  if(!a){const f=G.fleet.find(f=>!f.sold&&(f.wear||0)>8&&f.st!=='gate');if(f)a={text:`${AIRCRAFT[f.type].short}s are overdue a service.`,go:['stands',`[data-servicet="${f.type}"]`],label:'Service'}}
  if(!a&&secW>7)a=up(`Security queue is about ${Math.round(secW)} min.`,['lanes','sectech']);
  if(!a&&arW0>7)a=up(`Arrivals are queuing about ${Math.round(arW0)} min at passport control.`,['officers','egates','training']);
  if(!a&&ciW>7)a=up(`Check-in queue is about ${Math.round(ciW)} min.`,['desks','training','kiosks','online']);
  if(!a&&R.st.some(s=>s.F&&s.F.plane.state==='boarding'&&s.F.seated>=s.F.booked-2&&s.F.hold<s.F.checkedTotal-2))a=up('A full plane is waiting on hold bags.',['handlers','bagsys']);
  if(!a){const crowd=R.st.some((S,i)=>S.F&&S.F.plane.state==='boarding'&&R.pax.filter(p=>p.stand===i&&p.state==='gate').length>14);if(crowd)a=up('Passengers are piling up at a gate.',['scanners','walkway'])}
  if(!a){const jam=R.st.some(S=>S.aisle.flat().filter(p=>p.phase==='stow'||p.phase==='shuffle').length>=4);if(jam)a=up('Aisles are jammed with people stowing bags.',['bins'])}
  if(!a&&SET().recs!==false&&R.trRecs&&R.trRecs.sig===recSig()){const c=R.trRecs.list[0];if(c&&c.pay<12&&G.cash>=c.cost)a={text:c.kind==='line'?`A ${MODES[c.mode].name.toLowerCase()} ${c.stops.map(n=>NODES[n].n).join('–')} would earn about ${money(c.val.v)} an hour.`:`${c.kind==='stn'?STN_UP[c.k].name+' at '+NODES[c.n].n:UPG[c.k].name} would earn about ${money(c.val.v)} an hour.`,go:['region',c.kind==='line'?'[data-recline]':'[data-recother]'],label:'See it'}}
  if(!a&&tabOpen('routes')){let sup=0,mk=0;for(const c in (G.routes||{})){sup+=rsOf(c).s;mk+=cityMarket(c)}if(mk>0&&sup>mk*1.15&&CITIES.some(c=>!routeOpen(c[0])&&has('rt:'+c[2])))a={text:`Your planes offer ${Math.round(sup/mk*100)}% of the seats your cities want, so flights leave emptier. A new route opens a new market.`,go:['routes','[data-ropen]'],label:'Routes'}}
  if(!a){const i=G.stands.findIndex((s,k)=>s.built&&!R.st[k].F&&(R.st[k].idleT||0)>25);if(i>=0)a={text:`${GATES[i]} has sat empty for ${Math.round(R.st[i].idleT)} min. More planes, or partner airlines, would fill it.`,go:['stands','[data-acbuy]'],label:'Fleet'}}
  if(!a&&!G.shops.some(Boolean)&&G.cash>=SHOPS[0].cost)a={text:'Shops earn from passengers waiting for their flight.',go:['sales','.shopcard'],label:'Open a shop'};
  if(!a&&R.lotFull&&G.clock-R.lotFull<30)a=up('The car park is full, so drivers are going elsewhere.',['carpark']);
  if(!a&&G.rep<45)a=up('Your rating is low, so fewer people book.',['marketing','wifi']);
  if(!a&&G.rep>85&&G.lv.loyalty>=2&&demandNow()<=1&&loadFactor()>=0.99&&G.fare<2.5&&G.flights>20)a={text:'Flights are selling out even off-peak. You could raise ticket prices.',go:['sales','[data-fare="1"]'],label:'Prices'};
  if(!a&&(G.pts||0)>0&&TECH.some(T=>techState(T)==='ready'))a={text:`You have ${G.pts} plan point${G.pts>1?'s':''} to spend in the Masterplan.`,go:['plan'],label:'Masterplan'};
  if(!a&&G.cash<0)a={text:'You’re in the red. Close counters you don’t need, or borrow from the bank.',go:['office','#loanRange'],label:'Bank'};
  return a;
}
function renderTip(){
  if(SET().recs!==false&&tabOpen('region')&&!R.trRecQ&&(!R.trRecs||G.clock-R.trRecs.at>180||R.trRecs.sig!==recSig())&&performance.now()-(R.trRecT||0)>20000){R.trRecQ=1;R.trRecT=performance.now();setTimeout(()=>{try{computeTransitRecs()}catch(e){}R.trRecQ=0},50)}
  const a=SET().tips===false?null:advise(),el=$('#tip'),sig=a?a.text+(a.k||a.label)+(a.c||''):'';
  if(sig===R.tipSig){const b=el.querySelector('[data-cost]');if(b)b.disabled=G.cash<+b.dataset.cost;return}
  R.tipSig=sig;el.hidden=!a;if(!a)return;
  el.innerHTML=`<span class="lab">Tip</span><span class="tt">${a.text}</span>${a.k?`<button class="buy" data-tipbuy="${a.k}" data-cost="${a.c}" ${G.cash<a.c?'disabled':''}>${money(a.c)}</button>`:`<button class="buy ghost" data-tipgo="1">${a.label}</button>`}<button class="snooze" aria-label="Hide tips for a while">×</button>`;
  el._a=a;
}
$('#tip').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const a=$('#tip')._a;
  if(b.classList.contains('snooze')){R.tipSnooze=G.clock+90;R.tipSig=null;renderTip();return}
  if(b.dataset.tipbuy){if(buyUpgrade(b.dataset.tipbuy)){if(G.tab===UPG[b.dataset.tipbuy].tab)renderPanel();else refreshUI();save();R.tipSig=null;renderTip()}}
  else if(a&&a.go){if(a.go[0]==='plan')openPlan();else goTo(a.go[0],a.go[1])}
});

