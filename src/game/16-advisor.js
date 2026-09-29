/* ================= advisor ================= */
function advise(){
  if((R.tipSnooze||0)>G.clock||tourOn())return null;
  const D=derived(),ciW=R.ciQ.length*D.checkin/(D.desks+D.kiosks*0.6),secW=R.secQ.length*D.sec/D.lanes;
  const cheapest=keys=>{let b=null;for(const k of keys){if(!upBuyable(k)||UPG[k].build)continue;const c=upCost(k);if(!b||c<b.c)b={k,c}}return b};
  // a purchase tip holds back while it would spend the cash the current goal's purchase needs (release audit, row 26)
  const up=(text,keys)=>{const b=cheapest(keys);return b&&!tipHold(b.k,b.c)?{text:`${text} <b>${UPG[b.k].name}</b> would help.`,k:b.k,c:b.c}:null};
  let a=null;
  // once the first flight is away, one nudge to try 4x if the newcomer hasn't yet (issue #105's default A). Never in the
  // headless sim, which never touches R.speed and so could never resolve it, permanently crowding out every other tip
  if(!R.sim&&!G.tip4x){
    if(R.speed>=4)G.tip4x=1; // reaching 4x by any control resolves it, not just its own button
    else if(G.flights>=1)a={text:'Try 4× to skip the quiet spells.',sp:4,label:'Try 4×'};
  }
  const auto=G.lv.roster&&G.auto,arW0=R.arrQ.length*D.passT/(D.officers+D.egates*1.6);
  if(!auto){for(const [t,w,name] of [['lanes',secW,'security lanes'],['desks',ciW,'check-in desks'],['officers',arW0,'passport desks']]){if(!a&&w>7&&staffed(t)<OWN[t]())a={text:`Queues are about ${Math.round(w)} min, but only ${staffed(t)} of ${OWN[t]()} ${name} are staffed.`,go:['terminal',`[data-staff="${t}:1"]`],label:'Staff up'}}}
  if(!a)a=repTip(up);
  if(!a&&R.reg&&R.reg.lines){const h=hour();if(h>=8&&h<20)for(const L of sortedLines()){const l=R.reg.lines[L.id];if(l&&l.f>0&&l.riders<3&&l.ops>15&&!buildOf('line:'+L.id)){a={text:`${lineCode(L)} (${lineName(L)}) carries almost nobody. Reroute it, or close it to save ${money(l.ops)} an hour.`,go:['region',`[data-lsel="${L.id}"]`],label:'Lines'};break}}}
  if(!a&&dayVal(G.dstat,'crewDl')>=2&&SET().autoCrews===false)a={text:`Flights waited for a crew ${G.dstat.crewDl} times today.`,go:['stands','[data-crewhire]'],label:'Crews'};
  if(!a&&R.rwy.q.length>=3)a=up(`${R.rwy.q.length} aircraft are waiting for the runway.`,['atc']);
  // while overnight checks are on they also service worn planes at the gate (34-airline-operations.js), so no tip
  if(!a&&!pol('checks')){const f=G.fleet.find(f=>!f.sold&&(f.wear||0)>8&&f.st!=='gate');if(f)a={text:`${AIRCRAFT[f.type].short}s are overdue a service.`,go:['stands',`[data-servicet="${f.type}"]`],label:'Service'}}
  if(!a&&secW>7)a=up(`Security queue is about ${Math.round(secW)} min.`,['lanes','sectech']);
  if(!a&&arW0>7)a=up(`Arrivals are queuing about ${Math.round(arW0)} min at passport control.`,['officers','egates','training']);
  if(!a&&ciW>7)a=up(`Check-in queue is about ${Math.round(ciW)} min.`,['desks','training','kiosks','online']);
  if(!a&&R.st.some(s=>s.F&&s.F.plane.state==='boarding'&&s.F.seated>=s.F.booked-2&&s.F.hold<s.F.checkedTotal-2))a=up('A full plane is waiting on hold bags.',['handlers','bagsys']);
  if(!a){const crowd=R.st.some((S,i)=>S.F&&S.F.plane.state==='boarding'&&R.pax.filter(p=>p.stand===i&&p.state==='gate').length>14);if(crowd)a=up('Passengers are piling up at a gate.',['scanners','walkway'])}
  if(!a)a=cafeTip()||hotelTip(up)||terraceTip();
  if(!a){const jam=R.st.some(S=>S.aisle.flat().filter(p=>p.phase==='stow'||p.phase==='shuffle').length>=4);if(jam)a=up('Aisles are jammed with people stowing bags.',['bins'])}
  if(!a&&SET().recs!==false&&R.trRecs&&R.trRecs.sig===recSig()){const c=R.trRecs.list.find(c=>!c.id||G.lines[c.id]);if(c&&c.pay<12&&G.cash>=c.cost)a={...recTip(c),label:'See it'}}
  if(!a&&tabOpen('routes')){let sup=0,mk=0;for(const c in (G.routes||{})){sup+=rsOf(c).s;mk+=cityMarket(c)}if(mk>0&&sup>mk*1.15&&CITIES.some(c=>!routeOpen(c[0])&&has('rt:'+c[2])))a={text:`Your planes offer ${Math.round(sup/mk*100)}% of the seats your cities want, so flights leave emptier. A new route opens a new market.`,go:['routes','[data-ropen]'],label:'Routes'}}
  if(!a&&!G.layoutNext&&!layoutBuilding()&&SIDX.every(i=>G.stands[i].built)){ // every stand built: an approved layout with more
    const id=Object.keys(LAYOUTS).find(id=>id!==G.layout&&has('lay:'+id)&&LAYOUTS[id].stands.length>SIDX.length&&G.cash>=LAYOUTS[id].cost);
    if(id)a={text:`Every stand is built. The ${LAYOUTS[id].name} layout has room for ${LAYOUTS[id].stands.length}.`,go:['ground','#layout-'+id],label:'Layout'}}
  if(!a){const i=G.stands.findIndex((s,k)=>s.built&&!R.st[k].F&&(R.st[k].idleT||0)>25);if(i>=0)a={text:`${GATES[i]} has sat empty for ${Math.round(R.st[i].idleT)} min. More planes, or partner airlines, would fill it.`,go:['stands','[data-acbuy]'],label:'Fleet'}}
  if(!a&&!G.shops.some(Boolean)&&G.cash>=SHOPS[0].cost)a={text:'Shops earn from passengers waiting for their flight.',go:['sales','.shopcard'],label:'Open a shop'};
  if(!a&&R.lotFull&&G.clock-R.lotFull<30)a=up('The car park is full, so drivers are going elsewhere.',['carpark']);
  if(!a&&G.rep<45)a=up('Your rating is low, so fewer people book.',['marketing','wifi']);
  if(!a&&G.rep>85&&G.lv.loyalty>=2&&demandNow()<=1&&loadFactor()>=0.99&&G.fare<FARE_TIP&&G.flights>20)a={text:'Flights are selling out even off-peak. You could raise ticket prices.',go:['sales','[data-fare="1"]'],label:'Prices'};
  if(!a&&(G.pts||0)>0&&TECH.some(T=>techState(T)==='ready'))a={text:`You have ${G.pts} plan point${G.pts>1?'s':''} to spend in the Masterplan.`,go:['plan'],label:'Masterplan'};
  if(!a)a=fleetTip();
  if(!a&&G.cash<0)a={text:'You’re in the red. Close counters you don’t need, or borrow from the bank.',go:['office','#loanRange'],label:'Bank'};
  return a;
}
// never advise raising ticket prices past 120%: past that, crowds thin but the daily passengers every level asks for go
// with them (release audit, row 1; one step is 10%)
const FARE_TIP=1.15;
// the rating the next level needs (the top level's once it's reached)
const repNeed=()=>{const L=LEVELS[Math.min(G.level+1,LEVELS.length-1)];return L.req?L.req.rep:0};
// how far the rating shown fell over the last 3 hours, from R.repH (the rating each hour, 04-effects.js)
function repFell(){const h=R.repH;if(!h||!h.length)return 0;const o=h.find(x=>x[0]>=G.clock-180)||h[h.length-1];return Math.round(o[1])-Math.round(G.rep)}
// the rating tip: only while the rating is within 10 of the next level's need, quoting the fall in the rating shown and
// the cause that cost most (release audit, row 4). With every upgrade for the cause bought, late departures point at
// crews, another gate or planes, and crowds at a fare rise only while prices are under FARE_TIP
function repTip(up){
  if(G.rep>=repNeed()+10)return null;const fell=repFell();if(fell<3)return null;
  const worst=Object.entries(repRecent()).filter(e=>e[1]<0&&REPWHY[e[0]]).sort((x,y)=>x[1]-y[1])[0];if(!worst)return null;
  const w=worst[0],Y=REPWHY[w],msg=`Your rating fell ${fell} points in the last 3 hours, mostly from ${Y[0]}.`;
  if(Y[2])return {text:msg+Y[2],...(REP_GO[w]||{go:['region','.lcard'],label:'Region'})};
  const t=up(msg,Y[1]);if(t||!Y[1].length||Y[1].some(k=>upBuyable(k)))return t;
  if(w==='late')return lateTip(msg);
  return G.fare<FARE_TIP?{text:msg+' Every upgrade for it is bought, so slightly dearer tickets would thin the crowds.',go:['sales','[data-fare="1"]'],label:'Prices'}:null;
}
function lateTip(msg){
  if(SET().autoCrews===false&&dayVal(G.dstat,'crewDl')>=1)return {text:msg+` Flights waited for a crew ${G.dstat.crewDl} times today.`,go:['stands','[data-crewhire]'],label:'Crews'};
  const i=STAND_ORDER.find(i=>!G.stands[i].built);
  if(i!=null&&standBuyable(i)&&G.cash>=STAND[i].cost&&!tipHold('stand',STAND[i].cost))return {text:msg+' Another gate would spread the flights out.',go:['stands',`[data-standbuy="${i}"]`],label:'Gates'};
  if(i!=null&&STAND[i].pier&&!G.pierB&&!isBuilding('pier:B')&&G.level>=PIER.lvl&&G.cash>=PIER.cost&&!tipHold('pier',PIER.cost))return {text:msg+` ${p2name()} would add gates.`,go:['stands','[data-pierbuy]'],label:'Pier'};
  const f=fleetTip();if(f)return {...f,text:msg+' '+f.text};
  if(i!=null&&G.level<STAND[i].lvl)return {text:msg+` Every gate you have is busy. ${LEVELS[STAND[i].lvl].name} opens ${GATES[i]}.`,go:['office','#levels'],label:'Levels'};
  return null;
}
// where a cause's own fix is, when it isn't a line in the region
// (sub: the sub-tab to open, which goTo can't tell from these)
const POLS=['oSub','policies'],REP_GO={ads:{go:['office','[data-pol^="ads:"]'],sub:POLS,label:'Policies'},noise:{go:['office','[data-pol^="curfew:"]'],sub:POLS,label:'Policies'},
  lounge:{go:['office','[data-pol^="gates:"]'],sub:POLS,label:'Policies'},bus:{go:['ground','[data-lounges]'],sub:['aSub','layout'],label:'Layout'}};
// the fleet recommendation as a tip, when it's affordable and doesn't spend the goal's cash (32-managers.js)
function fleetTip(){const f=fleetRec();if(!f)return null;
  if(f.kind==='sell')return {text:f.tip,go:['stands',`[data-sellt="${f.t}"]`],label:'Fleet'};
  return G.cash>=f.cost&&!tipHold('plane',f.cost)?{text:f.tip,go:['stands',`[data-acbuy="${f.t}"]`],label:'Fleet'}:null}
// a purchase tip holds back while it would spend the cash the current goal's purchase needs (release audit, row 26),
// unless it costs under a tenth of it
function tipHold(k,c){const g=goalCost();return !!g&&k!==g.k&&c>0.1*g.c&&G.cash-c<g.c}
// the current goal's price, when it's a purchase the player can make now: purchase tips hold back rather than spend it
function goalCost(){const g=curGoal(),s=g&&g.go&&g.go[1];if(!s)return null;let m;
  if(/data-standbuy/.test(s)){const i=STAND_ORDER.find(i=>standBuyable(i));return i==null?null:{k:'stand',c:STAND[i].cost}}
  if(/data-pierbuy/.test(s))return G.pierB||isBuilding('pier:B')||G.level<PIER.lvl?null:{k:'pier',c:PIER.cost};
  if((m=/data-buy="(\w+)"/.exec(s))&&upBuyable(m[1]))return {k:m[1],c:upCost(m[1])};
  return null}
// the fullest café, coffee cart, bar or dining room, if it turned more than 7 away in the last hour: an upgrade while it has
// one, else a roomier kind in an empty unit, or in its place (release audit, row 26)
const FOOD=['coffee','cafe','bar','dining'];
function cafeTip(){
  if(!R.awayH)return null;let j=-1,n=7;
  G.shops.forEach((s,k)=>{if(s&&FOOD.includes(SHOPS[s.type].id)&&(R.awayH[k]||0)>n){n=R.awayH[k];j=k}});
  if(j<0)return null;const sh=G.shops[j],name=SHOPS[sh.type].name.toLowerCase(),t=`The ${name} turned away ${n} passengers in the last hour.`;
  if(sh.lvl<4)return {text:t+' Upgrading it adds room.',go:['sales',`[data-shopup="${j}"]`],label:'Shops'};
  const big=FOOD.slice(FOOD.indexOf(SHOPS[sh.type].id)+1).map(id=>SHOPS.find(x=>x.id===id)).filter(x=>x&&has('shop:'+x.id));if(!big.length)return null;
  const what=big.slice(0,2).map(x=>x.name.toLowerCase()).join(' or '),free=G.shops.findIndex((x,k)=>!x&&shopOpen(k));
  return free>=0?{text:`${t} A ${what} in an empty unit would take the rest.`,go:['sales',`[data-shopbuild^="${free}:"]`],label:'Shops'}
    :{text:`${t} It’s at its top level: a ${what} in its place would seat more.`,go:['sales',`[data-shopsell="${j}"]`],label:'Shops'};
}
// a hotel that turned 10 or more guests away last night: more rooms, or dearer ones
function hotelTip(up){
  const L=G.lv.hotel&&G.hotelBook&&G.hotelBook.last;if(!L||L.away<10)return null;const t=`The hotel was full last night and turned away ${L.away} guests.`;
  return up&&up(t,['hotel'])||{text:t+' Dearer rooms would earn more from each.',go:['sales','#hotel'],label:'Hotel'};
}
function renderTip(){
  if(SET().recs!==false&&tabOpen('region')&&!R.trJob&&(!R.trRecs||G.clock-R.trRecs.at>180||R.trRecs.sig!==recSig())&&performance.now()-(R.trRecT||0)>20000){R.trRecT=performance.now();recStart()}
  // the tip is about the airport, so clear it over the region and world maps; it also holds back while two toasts are
  // up, so the tip and the toast stack never read as one jumble (issue #103)
  const a=R.view==='airport'&&SET().tips!==false&&R.toasts.length<2?advise():null,el=$('#tip'),sig=a?a.text+(a.k||a.label)+(a.c||''):'';
  if(sig===R.tipSig){const b=el.querySelector('[data-cost]');if(b)b.disabled=G.cash<+b.dataset.cost;return}
  R.tipSig=sig;el.hidden=!a;if(!a)return;
  el.innerHTML=`<span class="lab">Tip</span><span class="tt">${a.text}</span>${a.k?`<button class="buy" data-tipbuy="${a.k}" data-cost="${a.c}" ${G.cash<a.c?'disabled':''}>${money(a.c)}</button>`:a.sp?`<button class="buy" data-tipspeed="${a.sp}">${a.label}</button>`:`<button class="buy ghost" data-tipgo="1">${a.label}</button>`}<button class="snooze" aria-label="Hide tips for a while">×</button>`;
  el._a=a;
}
// the camera flies to what a tip bought, so the purchase is seen (release audit, row 27): the hall its section is in
const TIP_HALL={'Check-in':'ci',Security:'sec',Arrivals:'imm',Baggage:'rec'},TIP_HALL_K={hotel:'hot',carpark:'out'};
function tipShow(k){const id=TIP_HALL_K[k]||TIP_HALL[UPG[k].sec];if(id&&R.view==='airport')flyHall(id)}
$('#tip').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const a=$('#tip')._a;
  if(b.classList.contains('snooze')){if(a&&a.sp)G.tip4x=1;R.tipSnooze=G.clock+90;R.tipSig=null;renderTip();return}
  if(b.dataset.tipbuy){const k=b.dataset.tipbuy;if(buyUpgrade(k)){if(G.tab===UPG[k].tab)renderPanel();else refreshUI();save();R.tipSig=null;renderTip();tipShow(k)}}
  else if(b.dataset.tipspeed){setSpeed(+b.dataset.tipspeed);G.tip4x=1;save();R.tipSig=null;renderTip()}
  else if(a&&a.go){if(a.go[0]==='plan')openPlan();else{goTo(a.go[0],a.go[1]);if(a.sub){R[a.sub[0]]=a.sub[1];renderPanel()}}}
});

