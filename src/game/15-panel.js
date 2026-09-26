/* ================= panel ================= */
const svg=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
const pips=(l,m,cap)=>m>1&&m<=15?`<span class="pips" aria-label="Level ${l} of ${m}">${Array.from({length:m},(_,i)=>`<i class="${i<l?'on':i>=(cap??m)?'cap':''}"></i>`).join('')}</span>`:m>15?`<span class="live">${l}/${m}</span>`:'';
const lvlName=n=>LEVELS[n].name;
const aL=(n,b)=>{const t=LEVELS[n].name;return (/^[AEIOU]/.test(t)?'an ':'a ')+(b?`<b>${t}</b>`:t)};
function upRow(key){
  const u=UPG[key],l=G.lv[key],maxed=l>=u.max,ok=u.req?u.req():true,cost=upCost(key),locked=upLocked(key),cap=capOf(key),capped=!maxed&&l>=cap,bld=isBuilding('up:'+key);
  let label,dis=true,desc;
  if(maxed){label=u.max>1?'MAX':'Owned';desc=u.fx(l,true)}
  else if(locked){label='Plan';desc=planHint('up:'+key)}
  else if(bld){label='Building';desc=`Under construction, ${Math.ceil((buildOf('up:'+key).done-G.clock))} min left.`}
  else if(!ok){label='Locked';desc=u.reqText}
  else if(capped){label=`Level ${G.level+2}`;desc=`${u.fx(l,true)}. More levels when you become ${aL(Math.min(LEVELS.length-1,G.level+1))}.`}
  else {label=money(cost);dis=false;desc=u.fx(l,false)}
  return `<div class="row${locked?' lockd':''}">${svg(u.icon)}<div><div class="rt">${u.name}${pips(l,u.max,cap)}</div><div class="rd">${desc}</div></div><button class="buy${maxed?' chipd':''}" data-buy="${key}" ${dis?'disabled':`data-cost="${cost}"`}>${label}</button></div>`;
}
function segs(key,items){return `<div class="segs${items.length>5?' many':''}">${items.map(([id,n])=>`<button class="chip${(R[key]||items[0][0])===id?' on':''}" data-seg="${key}:${id}">${n}</button>`).join('')}</div>`}
function upSection(tab,only,skip){
  let h='',sec='';const done=[],later=[];
  for(const k in UPG){const u=UPG[k];if(u.tab!==tab)continue;if(only&&!only.includes(u.sec))continue;if(skip&&skip.includes(u.sec))continue;if(G.lv[k]>=u.max){done.push(k);continue}if(upLocked(k)){later.push(k);continue}if(u.sec!==sec){sec=u.sec;h+=`<div class="sec">${sec}<span data-live="sec-${sec}"></span></div>`}h+=upRow(k)}
  if(later.length)h+=`<p class="note soon">${later.length} more in the <button class="linkb" data-plan="1">Masterplan</button>.</p>`;
  if(done.length)h+=`<div class="sec">Fully upgraded<span>${done.length}</span></div>`+done.map(upRow).join('');
  return h;
}
const tabOpen=id=>id==='region'?G.level>=1||Object.keys(G.lines||{}).length>0:id==='routes'?G.level>=1||Object.keys(G.routes||{}).length>3:true;
function renderTabs(){
  $('#tabs').innerHTML=`<button class="drawclose" id="drawClose" aria-label="Close panel">×</button>`+TABS.filter(([id])=>tabOpen(id)).map(([id,n,ic])=>`<button data-tab="${id}" role="tab" aria-selected="${G.tab===id}" class="${G.tab===id?'on':''}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[ic]}</svg>${n}<span class="cnt" hidden></span>${SET().badges!==false&&(G.newTabs||[]).includes(id)&&G.tab!==id?'<span class="newb">NEW</span>':''}</button>`).join('');
}
function setTab(t){G.tab=t;if(G.newTabs)G.newTabs=G.newTabs.filter(x=>x!==t);setView(t==='region'?'region':t==='routes'?'world':'airport');if(document.body.classList.contains('fs'))drawer(true);if($('#side').classList.contains('collapsed'))setSheetSnap(1);renderTabs();renderPanel();$('#panel').scrollTop=0;const el=document.getElementById('stand-'+R.sel);if(t==='stands'&&el&&R.sel>0&&(R.gSub||'gates')==='gates')el.scrollIntoView({block:'nearest'})}
function gateWaitText(i){
  const nx=G.fleet.filter(f=>!f.sold&&f.st==='away'&&fitsGate(f.type,i)).sort((a,b)=>a.back-b.back)[0];
  return nx?`Empty. Next plane back: ${AIRCRAFT[nx.type].short} at ${hhmm(nx.back)}${nx.late?` (${nx.late} min late)`:''}${G.stands[i].partner!==false?', or a partner sooner':''}.`:G.stands[i].partner!==false?'Empty. A partner airline will use it shortly.':'Empty. Buy a plane or allow partner airlines.';
}
function gateStatus(i){const nx=G.fleet.some(f=>!f.sold&&f.st!=='gate'&&fitsGate(f.type,i));return nx||G.stands[i].partner!==false?'INBOUND':'NO AIRCRAFT'}
function standLive(i){
  const F=R.st[i].F;if(!F)return gateWaitText(i);
  const s=statusText(F),col=statusCol(s),m=Math.ceil(F.std-G.clock),A=F.arr;
  const arrLine=A.done?'':`<div class="sline" style="margin-bottom:4px"><span class="pill" style="--c:${statusCol(arrStatus(F))}">${arrStatus(F)}</span><b>${A.code}${A.no}</b>&nbsp;from ${A.from[1]} · <b>${A.n-A.onboard}/${A.n}</b>&nbsp;off · bags&nbsp;<b>${A.sent}/${A.bags}</b>&nbsp;unloaded</div>`;
  return arrLine+`<div class="sline"><span class="pill" style="--c:${col}">${s}</span><b>${F.code}${F.no}</b>&nbsp;to ${F.dest[1]}</div><div class="prog"><i style="width:${F.seated/F.booked*100}%;background:${col}"></i></div><div class="sline"><b>${F.seated}/${F.booked}</b>&nbsp;seated · hold&nbsp;<b>${Math.floor(F.hold)}/${F.checkedTotal}</b>&nbsp;· departs&nbsp;<b>${hhmm(F.std)}</b>&nbsp;${m>=0?`(in ${m} min)`:`<span class="late">(${-m} min late)</span>`}</div>`;
}
function buildLine(id){const b=buildOf(id);if(!b)return '';const p=bprog(id);return `<div class="rd">Under construction · <b>${Math.ceil(b.done-G.clock)} min</b> left</div><div class="prog"><i style="width:${p*100}%;background:var(--sign)"></i></div>`}
function standLockedCard(i){
  const s=STAND[i],prevBuilt=i===0||G.stands[i-1].built,lvlOk=G.level>=s.lvl,pierOk=!s.pier||G.pierB,bld=isBuilding('stand:'+i);
  let btn,why;
  if(bld){btn=`<button class="buy" disabled>Building</button>`;why=buildLine('stand:'+i)}
  else if(!lvlOk){btn=`<button class="buy" disabled>Level ${s.lvl+1}</button>`;why=`<div class="rd">Unlocks when you become ${aL(s.lvl)}.</div>`}
  else if(!pierOk){btn=`<button class="buy" disabled>Needs pier</button>`;why=`<div class="rd">Build ${p2name()} first.</div>`}
  else if(!prevBuilt){btn=`<button class="buy" disabled>Locked</button>`;why=`<div class="rd">Open ${GATES[i-1]} first.</div>`}
  else{btn=`<button class="buy" data-standbuy="${i}" data-cost="${s.cost}">${money(s.cost)}</button>`;why=`<div class="rd">Its own jet bridge, lounge, shop unit and baggage carousel. Takes ${Math.round(buildMins(s.build))} min to build.</div>`}
  return `<div class="stand locked" id="stand-${i}"><div class="sh"><div><span class="gate">${GATES[i]}</span><span class="rt">${bld?'Under construction':'Stand for sale'}</span></div>${btn}</div>${why}</div>`;
}
function renderPanel(){
  if(R.sim)return;
  const P=$('#panel');let h='';
  if(G.tab==='stands'){
    const sub=R.gSub||'gates';
    h+=`<div class="segs">${[['gates','Gates'],['fleet','Fleet'],['methods','Boarding']].map(([id,n])=>`<button class="chip${sub===id?' on':''}" data-gsub="${id}">${n}</button>`).join('')}</div>`;
    if(sub==='gates'){
      if(G.builds.length)h+=`<div class="report">Building: ${G.builds.map(b=>`<b>${b.label}</b> ${Math.ceil(b.done-G.clock)}m`).join(' · ')} · crews ${buildSlots()-G.builds.length}/${buildSlots()} free</div>`;
      const firstPier=STAND_ORDER.find(k=>STAND[k].pier);
      STAND_ORDER.forEach(i=>{const st=G.stands[i];
        if(i===firstPier&&G.level>=PIER.lvl){
          if(!G.pierB){const bld=isBuilding('pier:B'),ok=G.level>=PIER.lvl;
            h+=`<div class="stand locked" id="pierB"><div class="sh"><div><span class="gate">B</span><span class="rt">${p2name()}</span></div>${bld?'<button class="buy" disabled>Building</button>':ok?`<button class="buy" data-pierbuy="1" data-cost="${PIER.cost}">${money(PIER.cost)}</button>`:`<button class="buy" disabled>Level ${PIER.lvl+1}</button>`}</div>${bld?buildLine('pier:B'):`<div class="rd">${ok?`Room for ${STAND.filter(s=>s.pier).length} more gates, including widebodies. ${Math.round(buildMins(PIER.build)/60*10)/10} h to build, ${money(250)}/h to run.`:`Unlocks at ${lvlName(PIER.lvl)}.`}</div>`}</div>`}
          else h+=`<div class="sec">${p2name()}<span>widebody gates</span></div>`;
        }
        if(!st.built){if(standReady(i)&&(G.level>=STAND[i].lvl||isBuilding('stand:'+i))&&(!STAND[i].pier||G.pierB))h+=standLockedCard(i);else if(standReady(i)&&G.level<STAND[i].lvl)h+=`<p class="note soon">Next gate unlocks at ${lvlName(STAND[i].lvl)}.</p>`;return}
        const F=R.st[i].F,mChips=METHODS.filter(m=>G.methods[m.id]).map(m=>`<button class="chip${st.method===m.id?' on':''}" data-method="${i}:${m.id}">${m.name}</button>`).join('');
        const who=F?(F.partner?`<span class="pdot" style="background:${F.partner.col}"></span>${F.partner.name} · ${F.ac.short}`:`${F.ac.name} #${F.fleetIdx+1}`):'Waiting for an aircraft';
        const gs=G.gstats[i]||[];
        h+=`<div class="stand${R.sel===i?' sel':''}" id="stand-${i}"><div class="sh"><div><span class="gate">${GATES[i]}</span><span class="rt">${who}</span></div><button class="buy ghost" data-look="${i}" style="min-width:0">View</button></div>
          <div class="live" data-live="stand-${i}">${standLive(i)}</div>
          ${gs.length?`<div class="rd">Last ${gs.length}: avg <b>${money(gs.reduce((a,b)=>a+b.p,0)/gs.length)}</b> · <b>${gs.filter(x=>x.o).length}/${gs.length}</b> on time</div>`:''}
          
          <div class="field"><span class="lbl">Boarding</span><div class="chips">${mChips}</div></div>
          <div class="chips" style="margin-top:8px"><button class="chip${st.partner!==false?' on':''}" data-partner="${i}" title="Other airlines use the gate when your aircraft are away. You earn ${Math.round(partnerCut()*100)}% of their fares plus a landing fee.">${st.partner!==false?'✓ ':''}Partner airlines</button>${st.rear?'<button class="chip on" disabled>✓ Rear stairs</button>':`<button class="chip" data-rear="${i}" data-cost="450">Rear stairs <small>${money(450)}</small></button>`}</div>
        </div>`;
      });
    } else if(sub==='fleet'){
      const own=G.fleet.filter(f=>!f.sold),n=own.length,at=own.filter(f=>f.st==='gate').length,away=own.filter(f=>f.st==='away').length,ready=own.filter(f=>f.st==='base').length;
      h+=`<div class="lstats fl4" style="grid-template-columns:repeat(4,1fr)"><div><b>${n}</b><span>aircraft</span></div><div><b>${at}</b><span>at gates</span></div><div><b>${away}</b><span>flying</span></div><div><b>${ready}</b><span>ready</span></div></div>`;
      h+=`<p class="note">The next ready plane takes the next free gate, then flies the most profitable open route within its range: short hops take ~${TRIP[0]} min, long-haul ${Math.round(TRIP[3]/60)}–${Math.round(TRIP[4]/60)} h. Widebodies need Pier B.</p>`;
      const back=own.filter(f=>f.st==='away').sort((a,b)=>a.back-b.back).slice(0,4);
      if(back.length)h+=`<div class="report">Next back: ${back.map(f=>`<b>${AIRCRAFT[f.type].short}</b> ${hhmm(f.back)}${f.late?` <span class="late">+${f.late}m</span>`:''}`).join(' · ')}</div>`;
      h+=crewPanel();
      h+=`<div class="sec">Aircraft</div>`;
      h+=AC_ORDER.slice().sort((x,y)=>{const o=t=>own.some(f=>f.type===t)?0:has('ac:'+t)?1:2;return o(x)-o(y)||AC_ORDER.indexOf(y)-AC_ORDER.indexOf(x)}).filter(t=>has('ac:'+t)||own.some(f=>f.type===t)).map(t=>{const a=AIRCRAFT[t],mine=own.filter(f=>f.type===t),lock=!has('ac:'+t),fireLack=a.fire&&G.lv.fire<a.fire,seats=a.rows*a.blocks.reduce((x,y)=>x+y,0);
        const due=mine.filter(f=>(f.wear||0)>=1&&f.st!=='gate'),svc=due.reduce((x,f)=>x+serviceCost(f),0),maxW=mine.reduce((x,f)=>Math.max(x,f.wear||0),0),sellable=mine.filter(f=>f.st==='base').sort((x,y)=>(y.wear||0)-(x.wear||0))[0];
        const btn=lock?`<button class="buy" disabled>Plan</button>`:fireLack?`<button class="buy" disabled>Fire cat ${a.fire}</button>`:`<button class="buy" data-acbuy="${t}" data-cost="${a.cost}">${money(a.cost)}</button>`;
        return `<div class="acrow${lock?' lockd':''}${mine.length?' own':''}"><div class="ach">${svg('plane')}<div><div class="rt">${a.name}${mine.length?` <span class="live">×${mine.length}</span>`:''}</div><div class="rd">${a.freighter?`${a.cargo} cargo units · ${money(CARGO_RATE())} each`:`${seats} seats · ${a.tier?'up to ':''}${RT_NAMES[a.tier].toLowerCase()}`} · ${money(a.op)} a flight · away ~${Math.round(TRIP[a.tier]/60*10)/10} h${a.tier>=4?' · Pier B':''}</div></div>${btn}</div>
          ${mine.length?`<div class="rd">${mine.filter(f=>f.st==='gate').length} at gates · ${mine.filter(f=>f.st==='away').length} flying · ${mine.filter(f=>f.st==='base').length} ready · worst wear ${Math.round(maxW)} flights <span style="color:${faultRisk(maxW)>0.1?'var(--bad)':'var(--muted)'}">(${Math.round(faultRisk(maxW)*100)}% fault risk)</span></div>
          <div class="chips" style="margin-top:6px">${due.length?`<button class="chip" data-servicet="${t}" data-cost="${svc}">Service ${due.length} <small>${money(svc)}</small></button>`:''}${sellable?`<button class="chip" data-sellt="${t}">Sell one <small>${money(sellValue(sellable))}</small></button>`:''}</div>`:`<div class="rd">${a.blurb}</div>`}</div>`}).join('');
    } else {
      h+=`<p class="note">Try methods on different gates and compare the reports in the Office.</p>`;
      h+=METHODS.filter(m=>has('meth:'+m.id)).map(m=>{const own=G.methods[m.id],lock=false;const best=AIRCRAFT.map(a=>G.best[a.short+'-'+m.id]?`${a.short} ${G.best[a.short+'-'+m.id].toFixed(1)}`:'').filter(Boolean).join(', ');
        return `<div class="row${lock?' lockd':''}">${svg('seat')}<div><div class="rt">${m.name}</div><div class="rd">${lock?`Unlocks at ${lvlName(m.lvl)}.`:m.desc}${best?` Best a minute: <b>${best}</b>.`:''}</div></div>${own?`<button class="buy chipd" disabled>Owned</button>`:lock?`<button class="buy" disabled>Level ${m.lvl+1}</button>`:`<button class="buy" data-mbuy="${m.id}" data-cost="${m.cost}">${money(m.cost)}</button>`}</div>`}).join('');
    }
  } else if(G.tab==='terminal'){
    const tsub=R.tSub||'dep';h+=segs('tSub',TERM_SUBS);
    const auto=G.lv.roster&&G.auto,sRow=(t,ic,label)=>{const own=OWN[t](),n=staffed(t);return `<div class="row">${svg(ic)}<div><div class="rt">${label}</div><div class="rd">${money(WAGE[t]*(G.wageMul||1))} an hour each${auto?' · set by rostering':''}</div></div><div class="lever"><button data-staff="${t}:-1" ${auto||n<=1?'disabled':''} aria-label="Staff one fewer">−</button><output data-live="staff-${t}">${n}</output><button data-staff="${t}:1" ${auto||n>=own?'disabled':''} aria-label="Staff one more">+</button><span class="live">/ ${own}</span></div></div>`};
    if(tsub==='staff')h+=`<div class="sec">Staffing<span>wages ${money(wageBill())} an hour</span></div>`+sRow('desks','desk','Check-in desks')+sRow('lanes','lane','Security lanes')+sRow('officers','passport','Passport desks')+(G.lv.roster?`<div class="row">${svg('crew')}<div><div class="rt">Auto rostering</div><div class="rd">${auto?'Opens counters as queues grow and closes them when it’s quiet.':'Off. You choose how many counters are staffed.'}</div></div><button class="buy${auto?'':' ghost'}" data-auto="1">${auto?'On':'Off'}</button></div>`:'')+`<p class="note">Close counters at quiet times to save wages. Kiosks and e-gates cost nothing to run.</p>`;
    h+=upSection('terminal',TERM_SECS[tsub]||[]);h+=(TERM_PANEL[tsub]||[]).map(f=>f()).join('');
  } else if(G.tab==='sales'&&(R.sSub||'prices')==='shops'){
    h+=segs('sSub',[['prices','Prices'],['shops','Shops'],['landside','Landside']]);
    h+=`<p class="note">Passengers with 15+ minutes to spare may stop at a shop. Long-haul flyers spend more.</p>`;
    G.shops.forEach((s,j)=>{
      if(!shopOpen(j))return;
      h+=`<div class="shopcard"><div class="sh"><div><span class="gate" style="background:var(--surface2);color:var(--muted)">${SHOP_NAME[j]}</span><span class="rt">${s?SHOPS[s.type].name:'Empty unit'}</span></div>${s?`<span class="live">${money(s.earned||0)} earned</span>`:''}</div>`;
      if(s){const t=SHOPS[s.type],max=s.lvl>=4,c=shopUpCost(s);
        h+=`<div class="row" style="border:0;padding:0">${svg(t.ic)}<div><div class="rt">Level ${s.lvl+1}${pips(s.lvl+1,5)}</div><div class="rd"><b>${money(t.spend*Math.pow(1.25,s.lvl))}</b> a visit (short-haul). ${Math.round(t.pull*100)}% of passers-by stop.</div></div><button class="buy${max?' chipd':''}" ${max?'disabled':`data-shopup="${j}" data-cost="${c}"`}>${max?'MAX':money(c)}</button></div><div class="sh"><span class="rd" style="margin:0">Close it to build something else here. You get back ${money(shopValue(s))}.</span><button class="buy sell" data-shopsell="${j}">Close</button></div>`;
      } else {
        h+=`<div class="opts">${SHOPS.map((t,k)=>{const lock=!has('shop:'+t.id);if(lock)return '';return `<div class="opt${lock?' lockd':''}"><div><div class="rt">${t.name}</div><div class="rd">${lock?`Unlocks when you become ${aL(t.lvl)}.`:`${money(t.spend)} a visit · ${Math.round(t.pull*100)}% stop · ${t.dwell} min${t.vip?' · business and priority only':''}`}</div></div>${lock?`<button class="buy" disabled>Level ${t.lvl+1}</button>`:`<button class="buy" data-shopbuild="${j}:${k}" data-cost="${t.cost}">${money(t.cost)}</button>`}</div>`}).join('')}</div>`;
      }
      h+=`</div>`;
    });
    h+=(TERM_PANEL['sales:shops']||[]).map(f=>f()).join('');
  } else if(G.tab==='ground'){
    const showProj=Object.keys(UPG).some(k=>UPG[k].sec==='Landmark projects'&&has('up:'+k)),showLay=G.layout!=='classic'||Object.keys(LAYOUTS).some(id=>id!=='classic'&&has('lay:'+id));
    const at=[['ops','Operations'],...(showProj?[['build','Projects']]:[]),...(showLay?[['layout','Layout']]:[])],asub=at.some(t=>t[0]===R.aSub)?R.aSub:'ops';if(at.length>1)h+=segs('aSub',at);
    h+=asub==='layout'?layoutPanel():asub==='ops'?`<p class="note">Planes wait for every bag and passenger. Buildings cost <b>${money(upkeepRate())}</b>/h to run.</p>`+upSection('ground',['Gates','Apron','Runway','Engineering']):upSection('ground',['Landmark projects']);
  } else if(G.tab==='sales'&&R.sSub==='landside'){
    h+=segs('sSub',[['prices','Prices'],['shops','Shops'],['landside','Landside']])+upSection('sales',['Landside']);h+=(TERM_PANEL['sales:landside']||[]).map(f=>f()).join('');
  } else if(G.tab==='sales'){
    h+=segs('sSub',[['prices','Prices'],['shops','Shops'],['landside','Landside']]);
    const lf=loadFactor();
    h+=`<div class="sec">Pricing</div><div class="row">${svg('ticket')}<div><div class="rt">Ticket prices</div><div class="rd">Fares at <b>${Math.round(G.fare*100)}%</b> of base. Expect flights <b>${Math.round(lf*100)}%</b> full right now (${demandName().toLowerCase()}, ${seasonOf(dayOf(G.clock)).name.toLowerCase()}). Dearer fares lose some passengers even on busy routes; a frequent flyer club softens that. Fewer passengers also board faster.</div></div>
      <div class="lever"><button data-fare="-1" aria-label="Lower prices">−</button><output>${Math.round(G.fare*100)}%</output><button data-fare="1" aria-label="Raise prices">+</button></div></div>`;
    h+=upSection('sales',null,['Landside']);
  } else if(G.tab==='routes'){
    h+=routesPanel();
  } else if(G.tab==='region'){
    h+=regionPanel();
  } else {
    const osub=R.oSub||'progress';h+=segs('oSub',[['progress','Plan'],['money','Money'],['reports','Reports'],['records','Records'],['policies','Policies'],['settings','Settings']]);
    if(osub==='records')h+=recordsPanel();
    if(osub==='policies'){h+=`<p class="note">Standing orders your staff follow automatically.</p>`+POLICIES.filter(P=>!P.show||P.show()).map(P=>`<div class="polrow"><div class="rt">${P.name}</div><div class="rd">${P.desc}</div><div class="chips">${P.opts.map(([v,n])=>`<button class="chip${pol(P.k)===v?' on':''}" data-pol='${P.k}:${JSON.stringify(v)}'>${n}</button>`).join('')}</div></div>`).join('')}
    if(osub==='progress'){
    const n=G.level+1;
    h+=`<div class="sec" id="levels">Airport level<span>${G.level+1} of ${LEVELS.length}</span></div><div class="lvlcard"><div class="lvname">${lvlName(G.level)}</div>`;
    if(LEVELS[n]){h+=`<div class="rd">Next: <b>${lvlName(n)}</b>, reward ${money(LEVELS[n].reward)}</div>`+levelChecks(n).map(([t,v,q,big])=>`<div class="lreq"><span>${t}</span><span class="live"><b>${big?num(v):v}</b> / ${big?num(q):q}</span><div class="prog"><i style="width:${clamp(v/q,0,1)*100}%;background:${v>=q?'var(--good)':'var(--sign)'}"></i></div></div>`).join('')+(()=>{const u=unlocksAt(n);return `<div class="rd">Unlocks: ${u.slice(0,5).join(', ')}${u.length>5?` and ${u.length-5} more`:''}.</div>`})()}
    else h+=`<div class="rd">You’ve reached the top. Keep your airport the best in the world.</div>`;
    h+=`</div>`+planSummary();
    {const rr=repRecent(),ks=Object.keys(rr).filter(k=>Math.abs(rr[k])>=0.5).sort((x,y)=>rr[x]-rr[y]);
      h+=`<div class="sec">Rating<span>last 3 hours</span></div>`+(ks.length?`<table class="fin">${ks.map(k=>`<tr><td>${REPLBL[k]||k}</td><td class="${rr[k]<0?'neg':'pos'}">${rr[k]>0?'+':'−'}${Math.abs(rr[k]).toFixed(1)}</td></tr>`).join('')}</table>`:`<div class="report">Nothing has moved your rating recently.</div>`)+`<p class="note">Short queues and on-time flights raise it. It sets how full flights are, and each level needs a minimum.</p>`}
    {const cg=curGoal(),dn=GOALS.filter(g=>G.gdone&&G.gdone[g.id]),up=GOALS.filter(g=>!(G.gdone&&G.gdone[g.id])&&g!==cg&&(!g.need||g.need())).slice(0,4),rw=g=>`${g.r?money(g.r):''}${g.pts?`${g.r?' + ':''}${g.pts} pt`:''}`;
      h+=`<div class="sec">Goals<span>${dn.length}/${GOALS.length}</span></div><ul class="goals">${dn.slice(-3).map(g=>`<li class="done"><span>✓</span><span>${g.t}</span><span class="r">${rw(g)}</span></li>`).join('')}${cg?`<li class="cur"><span>›</span><span>${cg.t}</span><span class="r">${rw(cg)}</span></li>`:''}${up.map(g=>`<li class="fut"><span></span><span>${g.t}</span><span class="r">${rw(g)}</span></li>`).join('')}</ul>`}
    }if(osub==='money'){
    if(G.lastDay){const L=G.lastDay;h+=`<div class="sec">Day ${L.day} report</div><div class="report"><b>${num(L.pax)}</b> passengers departed and <b>${num(L.arr)}</b> arrived on <b>${L.flights}</b> flights, <b>${L.ontime}</b> on time${L.bagMiss?`, <b>${L.bagMiss}</b> bags left behind`:''}. Profit <b>${money(L.profit)}</b>.</div>`}
    const hrs=G.hours.slice(-12);
    if(hrs.length){
      const nets=hrs.map(b=>b.rev-b.cost),mx=Math.max(1,...nets.map(Math.abs)),bw=300/12;
      h+=`<div class="sec">Profit by hour<span>best ${money(Math.max(...nets))}</span></div><svg class="chart" viewBox="0 0 300 96" role="img" aria-label="Net profit in each of the last ${hrs.length} game hours">
        <line x1="0" y1="72" x2="300" y2="72" stroke="#323A43"/>${nets.map((v,k)=>{const hgt=Math.abs(v)/mx*62;return `<rect x="${k*bw+3}" y="${v>=0?72-hgt:72}" width="${bw-6}" height="${Math.max(1,hgt)}" rx="1.5" fill="${v>=0?'#6BE39A':'#FF7A8A'}" opacity="${k===nets.length-1?1:0.7}"/><text x="${k*bw+bw/2}" y="88" fill="#909AA4" font-size="8" font-family="IBM Plex Mono,monospace" text-anchor="middle">${pad(hrs[k].h%24)}</text>`}).join('')}</svg>`;
    }
    const rb=G.revBy,inc=['fares','inbound','landside','cargo','bags','shops','fast','priority','bonus','assets','transit','region'].reduce((a,k)=>a+(rb[k]||0),0),out=['costs','wages','upkeep','interest','transitOps'].reduce((a,k)=>a+(rb[k]||0),0);
    const row=(t,v)=>`<tr><td>${t}</td><td>${money(v)}</td></tr>`;
    h+=`<div class="sec">All-time money</div><table class="fin">${row('Departing fares',rb.fares)}${row('Arriving fares',rb.inbound||0)}${row('Car park, rail and hotel',rb.landside||0)}${row('Cargo',rb.cargo||0)}${row('Hold bag fees',rb.bags)}${row('Shops',rb.shops)}${row('Fast track',rb.fast)}${row('Priority boarding',rb.priority)}${row('Bonuses and rewards',rb.bonus)}${row('Aircraft and shops sold',rb.assets||0)}${row('Public transport fares',rb.transit||0)}${row('Region rents and events',rb.region||0)}${row('Public transport running costs',-(rb.transitOps||0))}${row('Fuel, fees and one-off costs',-rb.costs)}${row('Staff wages',-(rb.wages||0))}${row('Running costs',-(rb.upkeep||0))}${row('Loan interest',-(rb.interest||0))}<tr class="tot"><td>Net</td><td>${money(inc-out)}</td></tr></table>`;
    }if(osub==='reports'){
    h+=reportsHistory();
    if(G.news&&G.news.length)h+=`<div class="sec">Region news</div>`+G.news.slice(0,8).map(n=>`<div class="report"><b>Day ${n.d} ${n.t}</b> · ${n.m}</div>`).join('');
    h+=`<div class="sec">Last flight from each gate</div>`;
    (G.arrReports||[]).forEach((r,i)=>{if(!r)return;h+=`<div class="report"><b>${GATES[i]}</b> arrivals · <b>${r.tag}</b> from ${r.from[1]}: <b>${r.n}</b> passengers cleared in <b>${r.mins} min</b>, average wait at passports and reclaim <b>${r.avg.toFixed(1)} min</b>.</div>`});
    G.reports.forEach((r,i)=>{if(!r)return;h+=`<div class="report"><b>${GATES[i]}</b> · <b>${r.tag}</b> on the ${r.plane}, ${METHODS.find(m=>m.id===r.method).name.toLowerCase()}: <b>${r.pax}</b> seated in <b>${r.mins} min</b> (${r.rate.toFixed(1)} a minute), <b>${r.shuffles}</b> seat climbs, average queue <b>${r.wait.toFixed(1)} min</b>. ${r.onTime?'On time.':`<span class="late">${r.late} min late.</span>`} Profit <b>${money(r.profit)}</b>.</div>`});
    if(!G.reports.some(Boolean))h+=`<div class="report">Finish a flight to see how each gate performs.</div>`;
    }if(osub==='money'){
    {const cap=loanCap(),st=loanStep(),mn=Math.max(0,Math.ceil(((G.loan||0)-Math.max(0,G.cash))/st)*st);
    h+=`<div class="sec">Bank<span>limit ${money(cap)}, grows with your earnings</span></div>
      <div class="loan"><div class="lrow"><span class="rt">Loan</span><output id="loanOut" class="lval">${money(G.loan||0)}</output></div>
      <input type="range" id="loanRange" min="0" max="${cap}" step="${st}" value="${Math.round(G.loan||0)}" data-min="${mn}" aria-label="Loan amount">
      <div class="lscale"><span>$0 · 1% an hour</span><span>${money(cap)} · 5% an hour</span></div>
      <div class="rd" id="loanInfo"></div>
      <div class="lrow"><span class="rd" style="margin:0">${G.loan>0?`Now paying <b>${(loanRate(G.loan)*100).toFixed(1)}%</b>, ${money(G.loan*loanRate(G.loan))} an hour.`:'No loan right now.'}</span><button class="buy" id="loanSet" disabled>No change</button></div></div>`}
    }if(osub==='settings'||osub==='airline'){
    h+=settingsHTML()+`<div class="sec">Airline</div><div class="namefield"><input id="nameIn" maxlength="16" value="${G.name.replace(/"/g,'')}" aria-label="Airline name"></div>
      <div class="swatches">${LIVERIES.map(([n,c],k)=>`<button class="swatch${G.livery===k?' on':''}" style="background:${c}" data-liv="${k}" aria-label="${n} livery"></button>`).join('')}</div>
      <p class="note">Day ${G.day}. ${G.flights.toLocaleString('en-GB')} flights, ${G.flown.toLocaleString('en-GB')} passengers (${(G.xfers||0).toLocaleString('en-GB')} connecting), ${(G.moves||0).toLocaleString('en-GB')} runway movements, best on-time run ${G.bestStreak}.</p>
      <div class="sec">Your save</div><p class="note">${cloudNote()}</p><p class="note">To move your airport to another copy of the game, such as the downloaded file, copy a save code and paste it there.</p>
      <div class="namefield"><button class="chip" id="copySave">Copy save code</button></div>
      <div class="namefield"><input id="saveIn" placeholder="Paste a save code" aria-label="Save code" autocomplete="off" spellcheck="false" style="text-transform:none"><button class="chip" id="loadSave">Load</button></div>
      <button class="danger" id="reset">Reset progress</button>`;
    }
  }
  P.innerHTML=h;
  loanPreview();
  const nm=$('#nameIn');if(nm)nm.addEventListener('change',()=>{G.name=(nm.value.trim()||'Northwind').slice(0,16);$('#airline').textContent=G.name;save()});
  refreshUI();
}
function barSvg(vals,labels,aria,col,fmt){
  const n=vals.length,mx=Math.max(1,...vals.map(Math.abs)),neg=vals.some(v=>v<0),base=neg?50:78,sc=neg?42:70,bw=300/Math.max(n,8);
  return `<svg class="chart" viewBox="0 0 300 96" role="img" aria-label="${aria}"><line x1="0" y1="${base}" x2="300" y2="${base}" stroke="#323A43"/>${vals.map((v,k)=>{const hh=Math.abs(v)/mx*sc;return `<rect x="${k*bw+2}" y="${v>=0?base-hh:base}" width="${Math.max(1,bw-4)}" height="${Math.max(1,hh)}" rx="1.5" fill="${col(v)}" opacity="${k===n-1?1:0.72}"><title>${labels[k]}: ${fmt(v)}</title></rect>`}).join('')}${labels.map((l,k)=>n<=14||k%2===(n-1)%2?`<text x="${k*bw+bw/2}" y="92" fill="#909AA4" font-size="7.5" font-family="IBM Plex Mono,monospace" text-anchor="middle">${l}</text>`:'').join('')}</svg>`;
}
function reportsHistory(){
  let h='';const D=(G.days||[]).slice(-14);
  if(D.length>=2){
    h+=`<div class="sec">Passengers a day<span>best ${num(Math.max(...D.map(d=>d.pax)))}</span></div>`+barSvg(D.map(d=>d.pax),D.map(d=>d.d),'Departing passengers on each of the last days',()=>'#5CC8FF',num);
    h+=`<div class="sec">Profit a day<span>last ${money(D[D.length-1].p)}</span></div>`+barSvg(D.map(d=>d.p),D.map(d=>d.d),'Profit on each of the last days',v=>v>=0?'#6BE39A':'#FF7A8A',money);
    h+=`<div class="sec">Rating at day end</div>`+barSvg(D.map(d=>d.rep),D.map(d=>d.d),'Rating at the end of each day',v=>v>=70?'#6BE39A':v>=50?'#FFC72C':'#FF7A8A',v=>v);
  }else h+=`<div class="report">Charts appear after your second day.</div>`;
  const rows=Object.keys(G.routes||{}).filter(c=>CITY[c]).map(c=>{const r=rsOf(c);return [c,r.n,r.tn?r.lf:null,r.v-(r.c||0),r.p]}).sort((a,b)=>b[3]-a[3]);
  if(rows.length)h+=`<div class="sec">Routes, last 24 hours<span>${rows.length} open</span></div><table class="fin rtab"><tr><th>Route</th><th>Flights</th><th>Full</th><th>Profit</th></tr>${rows.map(([c,n,lf,p])=>`<tr><td><b>${c}</b> ${CITY[c].name}</td><td>${n.toFixed(n<10?1:0)}</td><td style="color:${lf!=null?lfCol(lf):''}">${lf!=null?Math.round(lf*100)+'%':'–'}</td><td class="${p<0?'neg':''}">${money(p)}</td></tr>`).join('')}</table>`;
  return h;
}
/* ---------- space for the camera: a per-device setting, kept out of the save so it doesn't follow the save code ---------- */
const GAPS={off:0,small:24,medium:40,large:56},GAPKEY='final-call-topgap';
function gapPref(){let v=null;try{v=localStorage.getItem(GAPKEY)}catch(e){}if(v&&v in GAPS)return v;return matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<=520?'medium':'off'}
function applyGap(){const px=GAPS[gapPref()];document.documentElement.style.setProperty('--gapsz',px+'px');$('#topgap').hidden=!px;if(typeof resize==='function')requestAnimationFrame(()=>resize())}
applyGap();
/* ---------- settings: what the game shows you ---------- */
const SETTINGS=[
  ['tips','Tips','The advice bar under the map that names your bottleneck.',[[true,'On'],[false,'Off']]],
  ['msgs','Messages','Pop-up messages over the map. Important keeps warnings, level-ups and choices. Replies to what you just tapped always show.',[['all','All'],['key','Important'],['off','Off']]],
  ['pops','Map pop-ups','Money, on-time and delay labels that float over the airport and region.',[['all','All'],['big','Big only'],['off','Off']]],
  ['goal','Goal bar','The next goal, under your cash and rating.',[[true,'On'],[false,'Off']]],
  ['recs','Recommendations','Suggested lines, routes, fares and planes at the top of the Region and Routes tabs.',[[true,'On'],[false,'Off']]],
  ['badges','Badges','NEW labels on tabs, counts of things you can afford, and points on the Masterplan button.',[[true,'On'],[false,'Off']]],
];
function settingsHTML(){
  const S=SET(),row=(k,n,d,opts)=>`<div class="polrow"><div class="rt">${n}</div><div class="rd">${d}</div><div class="chips">${opts.map(([v,l])=>`<button class="chip${S[k]===v?' on':''}" data-set='${k}:${JSON.stringify(v)}'>${l}</button>`).join('')}</div></div>`;
  let h=`<div class="sec">Notifications</div>`+SETTINGS.map(([k,n,d,o])=>row(k,n,d,o)).join('');
  h+=`<div class="chips" style="margin-top:10px"><button class="chip" data-setall="quiet">Quiet: hide all of these</button><button class="chip" data-setall="all">Show everything</button></div>`;
  h+=`<div class="sec">Game</div><div class="polrow"><div class="rt">What's new</div><div class="rd">Every version's new features, newest first.</div><div class="chips"><button class="chip" data-news="1">Open</button></div></div>`+row('chal','Weekly challenges','Three challenges each game week. Each pays cash; finish all three for a plan point.',[[true,'On'],[false,'Off']]);
  h+=`<div class="sec">Managers</div><p class="note">Staff who run the details for you. Change something yourself and they leave it to you.</p>`;
  h+=row('autoLines','Transport manager','Runs your lines by what each change is worth: how often they run, fares, meeting flights, night services and extra services on event days.',[[true,'On'],[false,'Off']]);
  h+=row('autoCrews','Fleet manager','Hires crews to match your fleet, and lets spare ones go.',[[true,'On'],[false,'Off']]);
  h+=row('autoFares','Route manager','Sets each route’s fare to whatever earns most: dearer where people will pay, cheaper where seats go empty.',[[true,'On'],[false,'Off']]);
  {const g=gapPref();h+=`<div class="sec">Screen</div><div class="polrow"><div class="rt">Space for the camera</div><div class="rd">Leaves a band at the top of the screen so a phone’s camera or notch doesn’t cover the board. Saved on this device only.</div><div class="chips">${[['off','None'],['small','Small'],['medium','Medium'],['large','Large']].map(([v,l])=>`<button class="chip${g===v?' on':''}" data-gap="${v}">${l}</button>`).join('')}</div></div>`}
  h+=`<div class="sec">Sound</div><div class="polrow"><div class="rd">Chimes, cash tills and the runway.</div><div class="chips"><button class="chip${G.sound?' on':''}" data-sound="1">On</button><button class="chip${G.sound?'':' on'}" data-sound="0">Off</button></div></div>`;
  return h;
}
function applySettings(){R.tipSig=null;renderTip();if(SET().msgs!=='all'){R.toasts=R.toasts.filter(t=>t.choices&&SET().msgs==='key'||t.kind==='warn'&&SET().msgs==='key');renderToasts()}if(SET().pops==='off')R.floaters=[];R.goalSig=null;renderTabs();renderPlanBtn();refreshUI();save()}
function loanPreview(){
  const r=$('#loanRange');if(!r)return;const st=loanStep(),mn=+r.dataset.min;let v=+r.value;
  if(v<mn){v=mn;r.value=mn}
  const d=v-(G.loan||0),rate=loanRate(v),b=$('#loanSet');
  $('#loanOut').textContent=money(v);
  $('#loanInfo').innerHTML=v>0?`At <b>${money(v)}</b> the rate is <b>${(rate*100).toFixed(1)}%</b> an hour: <b>${money(v*rate)}</b> an hour in interest.`:'Slide right to borrow. The more you borrow, the higher the rate on the whole loan.';
  if(Math.abs(d)<st/2){b.disabled=true;b.textContent='No change'}else{b.disabled=false;b.textContent=d>0?`Borrow ${money(d)}`:`Repay ${money(-d)}`}
}
$('#panel').addEventListener('input',e=>{if(e.target.id==='loanRange')loanPreview()});
function upBuyable(k){const u=UPG[k];return G.lv[k]<capOf(k)&&!upLocked(k)&&(!u.req||u.req())&&!isBuilding('up:'+k)}
const standReady=i=>{const p=STAND_AFTER[i];return p<0||G.stands[p].built}; // the stand it follows is built
function standBuyable(i){const s=STAND[i];return i<STAND.length&&!G.stands[i].built&&standReady(i)&&G.level>=s.lvl&&(!s.pier||G.pierB)&&!isBuilding('stand:'+i)}
function affordableIn(tab){
  let n=0;
  for(const k in UPG){if(UPG[k].tab===tab&&upBuyable(k)&&G.cash>=upCost(k))n++}
  if(tab==='stands'){for(const m of METHODS)if(!G.methods[m.id]&&has('meth:'+m.id)&&G.cash>=m.cost)n++;SIDX.forEach(i=>{if(standBuyable(i)&&G.cash>=STAND[i].cost)n++});if(!G.pierB&&!isBuilding('pier:B')&&G.level>=PIER.lvl&&G.cash>=PIER.cost)n++}
  if(tab==='region')n+=regionAffordable();
  if(tab==='office')n+=TECH.filter(T=>techState(T)==='ready').length;
  if(tab==='routes')n+=CITIES.filter(c=>!routeOpen(c[0])&&has('rt:'+c[2])&&G.cash>=ROUTE_FEE[c[2]]).length?1:0;
  if(tab==='sales')G.shops.forEach((s,j)=>{if(!shopOpen(j))return;if(!s&&G.cash>=SHOPS[0].cost)n++;else if(s&&s.lvl<4&&G.cash>=shopUpCost(s))n++});
  return n;
}
function stars(r){const n=clamp(Math.round(r/20),0,5);return `<span class="stars">${'★'.repeat(n)}<span class="off">${'★'.repeat(5-n)}</span></span> <small style="font-size:11px;color:var(--muted)">${Math.round(r)}</small>`}
let lastRepShown=-1;
function refreshUI(){
  if(G.tab==='routes'||G.tab==='office'&&(R.oSub==='reports')){const now=performance.now();if(now-(R.panelT||0)>4000&&now-(R.panelPtr||0)>1500&&!(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#panel input'))){R.panelT=now;const pn=$('#panel'),sc=pn.scrollTop;renderPanel();pn.scrollTop=sc}}
  if(G.tab==='region'&&R.reg&&R.reg.at!==R.regShown&&!R.draft){const now=performance.now();if(now-(R.panelT||0)>4000&&now-(R.panelPtr||0)>1500){R.regShown=R.reg.at;R.panelT=now;const pn=$('#panel'),sc=pn.scrollTop;renderPanel();pn.scrollTop=sc}}
  if(document.body.classList.contains('fs')){$('#fsOn').textContent=(G.flights?Math.round(G.ontime/G.flights*100)+'% on time':'');$('#fsDot').hidden=SET().badges===false||!TABS.some(([id])=>affordableIn(id))}
  {const vb=$('#viewb'),o=tabOpen('region');if(vb.hidden===o)vb.hidden=!o;const wb=$('#worldb'),ow=tabOpen('routes');if(wb.hidden===ow)wb.hidden=!ow;const tb=$('.bmode [data-bm="trn"]'),hasTrn=trnIds().length>0;if(tb.hidden===hasTrn)tb.hidden=!hasTrn;if(R.bm==='trn'){const sig='trn'+trnIds().join(',');if(sig!==boardSig)renderBoard()}}
  if(Math.round(G.rep)!==lastRepShown){lastRepShown=Math.round(G.rep);$('#sRep').innerHTML=stars(G.rep)}
  $('#sOn').textContent=G.flights?Math.round(G.ontime/G.flights*100)+'%':'–';
  {const hb=G.hours.length>1?G.hours[G.hours.length-2]:G.hours[G.hours.length-1],nt=hb?hb.rev-hb.cost:0,el=$('#sFlown');el.textContent=hb?money(nt):'–';el.style.color=nt<0?'var(--bad)':''}
  $$('[data-live^="staff-"]').forEach(el=>{el.textContent=staffed(el.dataset.live.slice(6))});
  $$('#panel [data-cost]').forEach(b=>{b.disabled=G.cash<+b.dataset.cost});
  $$('#tabs [data-tab]').forEach(b=>{const n=b.dataset.tab===G.tab||SET().badges===false?0:affordableIn(b.dataset.tab),c=b.querySelector('.cnt');c.hidden=!n||!!b.querySelector('.newb');c.textContent=n;b.setAttribute('aria-label',b.textContent.replace(/\d+$/,'')+(n?`, ${n} affordable`:''))});
  $$('#panel [data-cost]').forEach(b=>{if(b.disabled&&G.rate>0.05){const m=(+b.dataset.cost-G.cash)/G.rate;if(m<=600)b.dataset.eta=m<1?'in < 1 min':`in ~${Math.ceil(m)} min`;else delete b.dataset.eta}else delete b.dataset.eta});
  $$('[data-live^="stand-"]').forEach(el=>{el.innerHTML=standLive(+el.dataset.live.slice(6))});
  const D=derived(),ls=(sel,t)=>{const el=$(`[data-live="${sel}"]`);if(el)el.textContent=t};
  ls('sec-Check-in',`${R.ciQ.length} queuing · ~${Math.round(R.ciQ.length*D.checkin/(D.desks+D.kiosks*0.6))} min`);
  ls('sec-Arrivals',`${R.arrQ.length} at passports · ~${Math.round(R.arrQ.length*D.passT/(D.officers+D.egates*1.6))} min`);
  ls('sec-Security',`${R.secQ.length+R.ftQ.length} queuing · ~${Math.round(R.secQ.length*D.sec/D.lanes)} min`);
  ls('sec-Runway',`${R.rwy.q.length} waiting · ${R.rwy.act.filter(Boolean).length} on the runway`);
  ls('sec-Landside',`${R.lot.filter(t=>t>G.clock).length}/${carCap()} parked`);
  ls('sec-Demand',demandName().toLowerCase()+` · ×${demandNow().toFixed(2)}`);
  ls('sec-Apron',`${R.st.filter(s=>s.F&&s.F.hold<s.F.bagsIn).length} gates loading`);
  {const gb=$('#goal'),hide=SET().goal===false;if(gb.hidden!==hide)gb.hidden=hide}
  const g=curGoal();
  if(g){const [v,t]=g.p(),sig=g.id+':'+Math.round(clamp(v/t,0,1)*100);if(sig!==R.goalSig){R.goalSig=sig;const el=$('#goal');el.classList.toggle('go',!!g.go);el.setAttribute('role',g.go?'button':'');el.tabIndex=g.go?0:-1;
    el.innerHTML=`<span class="lab">Goal</span><span class="gt">${g.t}</span><span class="gr">${g.r?money(g.r):''}${g.pts?`${g.r?' ':''}+${g.pts}★`:''}${g.go?'<span class="chev">›</span>':''}</span><div class="gbar"><i style="width:${clamp(v/t,0,1)*100}%"></i></div>`}}
  else $('#goal').innerHTML=`<span class="lab">Goals</span><span class="gt">Every goal complete. Keep growing.</span><span></span>`;
  const sea=seasonOf(dayOf(G.clock)).name.toUpperCase(),dt=`DAY ${dayOf(G.clock)} · ${sea}`;if($('#dayTag').textContent!==dt)$('#dayTag').textContent=dt;
}
function checkGoals(){
  const g=curGoal();if(!g)return;const [v,t]=g.p();
  if(v>=t){(G.gdone||(G.gdone={}))[g.id]=1;if(g.r)earn(g.r,'bonus');if(g.pts)G.pts=(G.pts||0)+g.pts;
    if(!R.sim){toast(`Goal complete: ${g.t}.${g.r?` +${money(g.r)}`:''}${g.pts?` <b>+${g.pts} plan point</b>`:''}`,null,null,'goal',5);kaching();if(G.tab==='office')renderPanel();renderPlanBtn();save()}}
}

document.addEventListener('pointerdown',()=>{ensureAudio();R.lastInput=performance.now()},{passive:true});
document.addEventListener('keydown',()=>{R.lastInput=performance.now()},{passive:true,capture:true});
$('#tabs').addEventListener('click',e=>{const t=e.target.closest('[data-tab]');if(t){setTab(t.dataset.tab);save();return}if(e.target.closest('#drawClose')){drawer(false);return}});
let resetArm=0;
function cashPop(v,plus){if(R.sim||SET().pops==='off')return;const host=$('.stat.cash'),e=document.createElement('span');e.className='pop'+(plus?' plus':'');e.textContent=(plus?'+':'')+money(plus?v:-v);host.appendChild(e);setTimeout(()=>e.remove(),1150)}
function buy(c){if(G.cash<c)return false;G.cash-=c;kaching();cashPop(c);return true}
function buyUpgrade(k){
  const u=UPG[k];if(!upBuyable(k))return false;
  if(u.build&&!canBuild())return false;
  if(!buy(upCost(k)))return false;
  if(u.build)startBuild('up:'+k,u.name,u.build);else G.lv[k]++;
  return true;
}
function buyStand(i){if(!standBuyable(i)||!canBuild()||!buy(STAND[i].cost))return false;startBuild('stand:'+i,'Gate '+GATES[i],STAND[i].build);return true}
function buyPier(){if(G.pierB||isBuilding('pier:B')||G.level<PIER.lvl||!canBuild()||!buy(PIER.cost))return false;startBuild('pier:B',p2name(),PIER.build);return true}
function buyAircraft(t){const a=AIRCRAFT[t];if(!has('ac:'+t)||(a.fire&&G.lv.fire<a.fire)||!buy(a.cost))return -1;G.fleet.push({type:t,st:'base',readyAt:G.clock,wear:0});return G.fleet.length-1;}
function highlight(sel,cls){const el=$('#panel '+sel);if(!el)return;const row=el.closest('.row,.stand,.shopcard,.opt,.lvlcard,.acrow,.lcard')||el;row.classList.remove(cls);void row.offsetWidth;row.classList.add(cls);if(cls==='pulse')row.scrollIntoView({block:'center',behavior:REDUCED?'auto':'smooth'});setTimeout(()=>row.classList.remove(cls),2300)}
$('#panel').addEventListener('pointerdown',()=>{R.panelPtr=performance.now()},{passive:true});
$('#panel').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled&&!b.dataset.look)return;const d=b.dataset;
  if(recsClick(d)){refreshUI();return}
  if(TERM_CLICK.some(f=>f(d,b))){refreshUI();return}
  if(layoutClick(d,b)){refreshUI();return}
  if(regionClick(d,b)){refreshUI();return}
  if(routesClick(d)){refreshUI();return}
  if(d.plan){openPlan();return}
  if(d.news){openNews(true,false);return}
  if(d.set){const i=d.set.indexOf(':'),k=d.set.slice(0,i);G.set[k]=JSON.parse(d.set.slice(i+1));applySettings();renderPanel();return}
  if(d.gap){try{localStorage.setItem(GAPKEY,d.gap)}catch(e){}applyGap();renderPanel();return}
  if(d.setall){const q=d.setall==='quiet';Object.assign(G.set,q?{tips:false,msgs:'off',pops:'off',goal:false,badges:false,recs:false}:{tips:true,msgs:'all',pops:'all',goal:true,badges:true,recs:true});applySettings();renderPanel();return}
  if(d.sound!=null){ensureAudio();G.sound=d.sound==='1';syncSound();renderPanel();save();return}
  if(d.research){if(research(d.research)){renderPanel();renderPlanBtn();save()}return}
  if(d.buypt){if(buyPoint()){renderPanel();renderPlanBtn();save()}return}
  if(d.buy){buyUpgrade(d.buy)}
  else if(d.standbuy){buyStand(+d.standbuy)}
  else if(d.pierbuy){buyPier()}
  else if(d.gsub){R.gSub=d.gsub;renderPanel();$('#panel').scrollTop=0;return}
  else if(d.pol){const i=d.pol.indexOf(':'),k=d.pol.slice(0,i),v=JSON.parse(d.pol.slice(i+1));(G.pol||(G.pol={}))[k]=v;renderPanel();save();return}
  else if(d.seg){const [k,v]=d.seg.split(':');R[k]=v;renderPanel();$('#panel').scrollTop=0;return}
  else if(d.partner){const st=G.stands[+d.partner];st.partner=st.partner===false;renderPanel();save();return}
  else if(d.servicet){const t=+d.servicet,due=G.fleet.filter(f=>!f.sold&&f.type===t&&(f.wear||0)>=1&&f.st!=='gate'),c=due.reduce((x,f)=>x+serviceCost(f),0);if(due.length&&buy(c)){due.forEach(f=>f.wear=0);toast(`${due.length} × ${AIRCRAFT[t].short} serviced.`,null,null,'goal',4)}}
  else if(d.crewhire){if(hireCrew(false)){renderPanel();save()}}
  else if(d.crewrel){if(releaseCrew()){renderPanel();save()}}
  else if(d.sellt){const t=+d.sellt,key='sellt'+t;if(!(R.armKey===key&&Date.now()-R.armT<3000)){R.armKey=key;R.armT=Date.now();b.textContent='Tap to confirm';b.classList.add('arm');setTimeout(()=>{if(b.isConnected&&R.armKey===key)renderPanel()},3000);return}R.armKey=null;
    const f=G.fleet.filter(x=>!x.sold&&x.type===t&&x.st==='base').sort((x,y)=>(y.wear||0)-(x.wear||0))[0];if(f){const v=sellValue(f);f.sold=true;G.cash+=v;G.revBy.assets=(G.revBy.assets||0)+v;cashPop(v,true);toast(`${AIRCRAFT[t].short} sold for ${money(v)}.`,null,null,'goal',5)}}
  else if(d.method){const [i,m]=d.method.split(':');G.stands[+i].method=m}
  else if(d.mbuy){const m=METHODS.find(x=>x.id===d.mbuy);if(!G.methods[m.id]&&buy(m.cost)){G.methods[m.id]=true;if(G.stands[R.sel])G.stands[R.sel].method=m.id}}
  else if(d.rear){const i=+d.rear;if(!G.stands[i].rear&&buy(450))G.stands[i].rear=true}
  else if(d.acbuy){buyAircraft(+d.acbuy)}
  else if(d.look){const i=+d.look;selectStand(i,false);focus(i)}
  else if(d.shopbuild){const [j,k]=d.shopbuild.split(':').map(Number);if(!G.shops[j]&&has('shop:'+SHOPS[k].id)&&buy(SHOPS[k].cost))G.shops[j]={type:k,lvl:0,earned:0,spent:SHOPS[k].cost}}
  else if(d.staff){const [t,dv]=d.staff.split(':');G.open[t]=clamp(staffed(t)+(+dv),1,OWN[t]())}
  else if(d.auto){G.auto=!G.auto}
  else if(d.sell||d.shopsell){
    const key=d.sell?'sell'+d.sell:'shop'+d.shopsell;
    if(!(R.armKey===key&&Date.now()-R.armT<3000)){R.armKey=key;R.armT=Date.now();b.textContent='Tap to confirm';b.classList.add('arm');setTimeout(()=>{if(b.isConnected&&R.armKey===key)renderPanel()},3000);return}
    R.armKey=null;
    if(d.sell){const j=+d.sell,f=G.fleet[j];if(!f||f.sold||G.stands.some(s=>s.built&&s.ac===j)||R.st.some(S=>S.F&&S.F.fleetIdx===j))return;const v=sellValue(f);f.sold=true;G.cash+=v;G.revBy.assets=(G.revBy.assets||0)+v;cashPop(v,true);toast(`${AIRCRAFT[f.type].short} #${j+1} sold for ${money(v)}.`,null,null,'goal',5)}
    else{const j=+d.shopsell,sh=G.shops[j];if(!sh)return;const v=shopValue(sh);G.shops[j]=null;G.cash+=v;G.revBy.assets=(G.revBy.assets||0)+v;cashPop(v,true);toast(`${SHOPS[sh.type].name} closed. The unit is free.`,null,null,'goal',5)}
  }
  else if(d.service){const f=G.fleet[+d.service];if(f&&buy(serviceCost(f))){f.wear=0;toast(`${AIRCRAFT[f.type].short} #${+d.service+1} serviced.`,null,null,'goal',4)}}
  else if(d.shopup){const s=G.shops[+d.shopup],c=s&&shopUpCost(s);if(s&&s.lvl<4&&buy(c)){s.spent=(s.spent??shopSpentEst(s))+c;s.lvl++}}
  else if(d.fare){G.fare=clamp(Math.round((G.fare+0.1*+d.fare)*10)/10,0.5,3)}
  else if(d.liv){G.livery=+d.liv}
  else if(b.id==='loanSet'){
    const v=+$('#loanRange').value,dd=v-(G.loan||0);
    if(dd<0&&G.cash<-dd){toast('Not enough cash to repay that much.',null,null,'warn',4);return}
    G.loan=Math.max(0,v);G.cash+=dd;if(dd>0){cashPop(dd,true);kaching()}else cashPop(-dd);
    renderPanel();save();return;
  }
  else if(b.id==='copySave'){
    let code='';try{code=btoa(unescape(encodeURIComponent(JSON.stringify({...G,savedAt:Date.now()}))))}catch(e){}
    const inp=$('#saveIn');const fallback=()=>{inp.value=code;inp.select();toast('Select and copy the code in the box below.',null,null,'',6)};
    try{navigator.clipboard.writeText(code).then(()=>toast('Save code copied. Paste it into the other copy of the game.',null,null,'goal',6),fallback)}catch(e){fallback()}
    return;
  }
  else if(b.id==='loadSave'){
    const raw=($('#saveIn').value||'').trim();let obj=null;try{obj=JSON.parse(decodeURIComponent(escape(atob(raw))))}catch(e){}
    if(!obj||typeof obj.cash!=='number'||!Array.isArray(obj.stands)){toast('That save code didn’t work. Copy it again and paste the whole thing.',null,null,'warn',6);return}
    if(!(R.armKey==='load'&&Date.now()-R.armT<3000)){R.armKey='load';R.armT=Date.now();b.textContent='Tap to replace this airport';return}
    R.armKey=null;resetAll(obj);toast('Airport loaded.',null,null,'goal',5);return;
  }
  else if(b.id==='reset'){
    if(Date.now()-resetArm<3000){try{localStorage.removeItem(KEY)}catch(e){}resetAll(null);return}
    resetArm=Date.now();b.classList.add('arm');b.textContent='Tap again to wipe everything';setTimeout(()=>{if(b.isConnected){b.classList.remove('arm');b.textContent='Reset progress'}},3000);return;
  } else return;
  const fk=Object.keys(d).find(k=>k!=='cost'&&k!=='eta'),fsel=fk?`[data-${fk}="${d[fk]}"]`:null;
  renderPanel();save();
  if(fsel&&(d.buy||d.route||d.staff||d.service||d.shopup||d.rear||d.mbuy||d.acbuy))highlight(fsel,'flash');
});
function subFor(tab,sel){sel=sel||'';if(tab==='terminal'){const k=(sel.match(/data-buy="(\w+)"/)||[])[1];const u=k&&UPG[k];R.tSub=u?(u.sec==='Arrivals'?'arr':u.sec==='Concourse'||u.sec==='Staff'?'staff':'dep'):/staff/.test(sel)?'staff':R.tSub}if(tab==='ground'){const k=(sel.match(/data-buy="(\w+)"/)||[])[1];R.aSub=/^#layout-/.test(sel)?'layout':k&&UPG[k]&&UPG[k].sec==='Landmark projects'?'build':'ops'}if(tab==='office')R.oSub=/loan/.test(sel)?'money':'progress';if(tab==='sales')R.sSub=/shop/.test(sel)?'shops':/carpark|hotel/.test(sel)?'landside':'prices';if(tab==='region')R.regSub=sel.includes('dbuild')?'sites':'lines';if(tab==='stands')R.gSub=/acbuy|servicet|sellt|crewhire/.test(sel)?'fleet':/mbuy/.test(sel)?'methods':'gates';if(tab==='routes')R.rSub=/ropen/.test(sel)?'new':'mine'}
function goTo(tab,sel){subFor(tab,sel);setTab(tab);if(sel)requestAnimationFrame(()=>highlight(sel,'pulse'))}
$('#goal').addEventListener('click',()=>{const g=curGoal();if(!g||!g.go)return;if(g.go[0]==='plan'){openPlan();return}goTo(g.go[0],g.go[1])});
$('#goal').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#goal').click()}});
$$('.hud [data-speed]').forEach(b=>b.addEventListener('click',()=>setSpeed(+b.dataset.speed)));
function syncSound(){$('#snd').classList.toggle('on',G.sound);$('#sndw').style.opacity=G.sound?1:0.15}
$('#viewb').addEventListener('click',()=>{setView(R.view==='region'?'airport':'region')});
$('#worldb').addEventListener('click',()=>{setView(R.view==='world'?'airport':'world')});
$('#snd').addEventListener('click',()=>{ensureAudio();G.sound=!G.sound;syncSound();save();if(G.tab==='office'&&(R.oSub==='settings'||R.oSub==='airline'))renderPanel()});

