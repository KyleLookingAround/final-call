/* ================= managers and recommendations: help for players who'd rather not tune everything ================= */
// the transport manager: samples each line through the day, then retimes it every six hours
function mgrSample(reg){if(isNight())return;const A=R.mgr||(R.mgr={});for(const id in reg.lines){const l=reg.lines[id];if(!l.f)continue;const a=A[id]||(A[id]={n:0,load:0,rev:0,ops:0});a.n++;a.load+=l.baseLoad;a.rev+=l.rev;a.ops+=l.ops}}
function managersTick(){
  const A=R.mgr||{};R.mgr={};
  if(SET().autoLines)for(const L of Object.values(G.lines||{})){if(L.man||lineDown(L))continue;const a=A[L.id];if(!a||a.n<3)continue;const load=a.load/a.n,fq=MODES[L.mode].freqs,fi=fq.indexOf(L.freq);
    if(load>0.85&&fi>=0&&fi<fq.length-1)L.freq=fq[fi+1];else if(load<0.3&&a.rev<a.ops&&fi>0)L.freq=fq[fi-1];
    if(!L.night&&(['tram','rail','metro'].includes(L.mode)||(serves(L,'air')&&R.reg&&R.reg.share>0.08)))L.night=true}
  if(SET().autoFares)for(const c in (G.routes||{})){const r=G.routes[c];if(r.man||!CITY[c])continue;if(rsOf(c).n<1)continue;const b=bestFare(c),f=r.f??1;if(b!==f)r.f=f+Math.sign(b-f)}
  if(!R.sim&&(G.tab==='region'||G.tab==='routes'))renderPanel();
}
// what a change would do to the network, measured by running the region model with it and without it
function evalRegion(mutate){
  const keep={reg:R.reg,bs:R.boardSum,bn:R.boardN,ng:R.ng,lines:G.lines,stn:G.stn,lv:G.lv,clock:G.clock,live:(G.evq||[]).map(e=>e.live)};
  const out={tp:0,T:0,cong:0,rid:0,fly:0,wage:0},hrs=[9,17.5];R.evalMode=true;
  try{G.lines=JSON.parse(JSON.stringify(keep.lines));G.stn=JSON.parse(JSON.stringify(keep.stn||{}));G.lv=Object.assign({},keep.lv);mutate&&mutate();
    for(const h of hrs){G.clock=Math.floor(keep.clock/1440)*1440+h*60;R.reg=keep.reg;R.ng=null;regionTick();const r=R.reg;out.tp+=(r.rev-r.ops)/hrs.length;out.T+=r.T/hrs.length;out.cong+=r.cong/hrs.length;out.rid+=r.riders/hrs.length;out.fly+=r.flyers/hrs.length;out.wage+=r.wageMul/hrs.length}}
  finally{Object.assign(G,{lines:keep.lines,stn:keep.stn,lv:keep.lv,clock:keep.clock});R.reg=keep.reg;R.boardSum=keep.bs;R.boardN=keep.bn;R.ng=keep.ng;(G.evq||[]).forEach((e,i)=>e.live=keep.live[i]);R.evalMode=false}
  return out;
}
const tempLine=(mode,stops)=>{const M=MODES[mode];return {id:'Lrec',mode,stops,skip:[],freq:M.freqs[Math.min(1,M.freqs.length-1)],fare:1,night:false,sync:false,cars:0,freight:false,num:nextNum(mode),col:M.cols[(nextNum(mode)-1)%M.cols.length]}};
function recValue(b,a){ // money an hour the change is worth: transit profit, busier flights, cheaper staff
  const air=Math.max(20,(G.rate||0)*60*0.7),dem=((1+a.T)*(1-0.12*a.cong))/((1+b.T)*(1-0.12*b.cong))-1,wage=wageBill()*((b.wage-a.wage)/(b.wage||1));
  return {v:(a.tp-b.tp)+air*dem+wage,dem,dt:a.tp-b.tp,cong:a.cong-b.cong,rid:a.rid-b.rid}}
function computeTransitRecs(){
  const base=evalRegion(null),cands=[];
  const same=(m,st)=>Object.values(G.lines||{}).some(L=>L.mode===m&&st.every(x=>L.stops.includes(x))&&L.stops.length<=st.length+1)||(G.builds||[]).some(b=>b.lid&&b.mode===m&&st.every(x=>b.stops.includes(x)));
  for(const m of MODE_ORDER){if(!has('mode:'+m))continue;for(const st of (SUGGEST[m]||[])){if(same(m,st))continue;const q=lineQuote(m,st,null);if(!q.ok)continue;cands.push({kind:'line',mode:m,stops:st,cost:q.cost,mins:q.mins})}}
  for(const n of NODE_IDS){const N=NODES[n],Ls=linesAt(n);if(!Ls.length||N.far)continue;
    if(has('stn:pr')&&n!=='air'&&n!=='ano'&&!stnUp(n,'pr'))cands.push({kind:'stn',n,k:'pr',cost:STN_UP.pr.cost});
    if(has('stn:hub')&&Ls.length>=2&&!stnUp(n,'hub'))cands.push({kind:'stn',n,k:'hub',cost:STN_UP.hub.cost})}
  for(const k of ['rtinfo','tickets'])if(has('up:'+k)&&!G.lv[k]&&Object.keys(G.lines||{}).length)cands.push({kind:'up',k,cost:upCost(k)});
  const out=[];
  for(const c of cands.slice(0,16)){const a=evalRegion(()=>{if(c.kind==='line')G.lines.Lrec=tempLine(c.mode,c.stops);else if(c.kind==='stn')(G.stn[c.n]||(G.stn[c.n]={}))[c.k]=1;else G.lv[c.k]=1});
    const val=recValue(base,a);if(val.v<=0.5)continue;c.val=val;c.pay=c.cost/val.v;if(c.pay<=96)out.push(c)}
  out.sort((x,y)=>x.pay-y.pay);
  R.trRecs={at:G.clock,sig:recSig(),list:out.slice(0,3)};
}
const recSig=()=>Object.values(G.lines||{}).map(L=>L.id+L.mode+L.stops.join('')).join('|')+'#'+JSON.stringify(G.stn||{})+'#'+(G.builds||[]).length+'#'+Object.keys(G.tech||{}).length+'#'+G.lv.rtinfo+G.lv.tickets;
function lineTweaks(){ // quick fixes for lines already running
  const out=[],r=R.reg;if(!r)return out;
  for(const L of sortedLines()){const st=r.lines[L.id];if(!st||lineDown(L)||buildOf('line:'+L.id))continue;const M=MODES[L.mode],fq=M.freqs,fi=fq.indexOf(L.freq),mgr=SET().autoLines&&!L.man;
    if(st.riders<3&&st.ops>15&&hour()>=8&&hour()<20)out.push({kind:'close',L,text:`${lineCode(L)} carries almost nobody`,sub:`Closing it saves ${money(st.ops)} an hour.`});
    else if(st.baseLoad>0.95&&fi===fq.length-1&&(L.cars||0)<2)out.push({kind:'cars',L,text:`${lineCode(L)} is full at every service`,sub:`Longer ${L.mode==='bus'||L.mode==='coach'?'vehicles':'trains'} carry 50% more.`,cost:carsCost(L)});
    else if(!mgr&&st.baseLoad>0.9&&fi<fq.length-1)out.push({kind:'more',L,text:`${lineCode(L)} is packed`,sub:`Run it every ${Math.round(60/fq[fi+1])} min instead of ${Math.round(60/L.freq)}.`});
    else if(!mgr&&st.baseLoad<0.25&&st.rev<st.ops&&fi>0)out.push({kind:'less',L,text:`${lineCode(L)} runs mostly empty`,sub:`Every ${Math.round(60/fq[fi-1])} min would save money.`})}
  return out.slice(0,3);
}
function recRowLine(c){const M=MODES[c.mode],v=c.val,pay=c.pay;
  return `<div class="recrow"><span class="lbadge sm" style="--c:${M.cols[(nextNum(c.mode)-1)%M.cols.length]}">${M.L}${nextNum(c.mode)}</span><div><div class="rt">${M.name}: ${c.stops.map(n=>NODES[n].n).join(' › ')}</div><div class="rd">${v.v>=1?`+${money(v.v)}/h`:'Small gain'}${v.dem>0.005?` · demand +${(v.dem*100).toFixed(1)}%`:''}${v.cong<-0.01?` · traffic −${Math.round(-v.cong*100)}%`:''} · pays back in ${pay<1?'under an hour':`~${Math.round(pay)} h`}</div></div><div class="btns"><button class="buy" data-recline="${c.mode}|${c.stops.join(',')}" data-cost="${c.cost}">${money(c.cost)}</button><button class="chip" data-recprev="${c.mode}|${c.stops.join(',')}">Preview</button></div></div>`}
function recRowOther(c){const v=c.val,pay=c.pay,name=c.kind==='stn'?`${STN_UP[c.k].name} at ${NODES[c.n].n}`:UPG[c.k].name;
  return `<div class="recrow"><span class="lbadge sm" style="--c:#8C97A1">${c.kind==='stn'?(c.k==='pr'?'P+R':'HUB'):'NET'}</span><div><div class="rt">${name}</div><div class="rd">+${money(v.v)}/h${v.dem>0.005?` · demand +${(v.dem*100).toFixed(1)}%`:''} · pays back in ~${Math.max(1,Math.round(pay))} h</div></div><div class="btns"><button class="buy" data-recother="${c.kind}|${c.n||''}|${c.k}" data-cost="${c.cost}">${money(c.cost)}</button></div></div>`}
function transportRecs(){
  if(SET().recs===false)return '';
  const busy=R.trRecs&&R.trRecs.sig===recSig()&&G.clock-R.trRecs.at<120;
  if(!busy&&!R.trRecQ){R.trRecQ=1;setTimeout(()=>{try{computeTransitRecs()}finally{R.trRecQ=0}if(G.tab==='region'&&!R.draft&&(R.regSub||'lines')==='lines'){const pn=$('#panel'),sc=pn.scrollTop;renderPanel();pn.scrollTop=sc}},30)}
  const list=R.trRecs?R.trRecs.list:[],tw=lineTweaks();
  let h=`<div class="lcard rec"><div class="rechead"><span class="lbl">Recommended</span><button class="chip${SET().autoLines?' on':''}" data-setq="autoLines" title="Adjusts how often lines run, from how full they are">${SET().autoLines?'✓ ':''}Auto timetables</button></div>`;
  if(!R.trRecs)h+=`<div class="rd">Working out what would help most…</div>`;
  else if(!list.length&&!tw.length)h+=`<div class="rd">Nothing obvious to add right now. Your network covers what it can.</div>`;
  h+=list.map(c=>c.kind==='line'?recRowLine(c):recRowOther(c)).join('');
  h+=tw.map(t=>`<div class="recrow"><span class="lbadge sm" style="--c:${t.L.col}">${lineCode(t.L)}</span><div><div class="rt">${t.text}</div><div class="rd">${t.sub}</div></div><div class="btns">${t.kind==='cars'?`<button class="buy" data-lcars="${t.L.id}" data-cost="${t.cost}">${money(t.cost)}</button>`:t.kind==='close'?`<button class="buy sell" data-lclose="${t.L.id}">Close</button>`:`<button class="buy ghost" data-rectweak="${t.L.id}:${t.kind==='more'?1:-1}">Apply</button>`}</div></div>`).join('');
  return h+`</div>`;
}
// routes and fleet: which city next, which fares, which plane
function routeRecs(){
  if(SET().recs===false)return '';
  const own=G.fleet.filter(f=>!f.sold&&!AIRCRAFT[f.type].freighter),mt=Math.max(0,...own.map(f=>AIRCRAFT[f.type].tier)),open=Object.keys(G.routes||{}).filter(c=>CITY[c]),out=[];
  let sup=0,mk=0;for(const c of open){sup+=rsOf(c).s;mk+=cityMarket(c)}
  // a new route when flights are filling their markets, or a new jet has nowhere to go
  const tierOpen=t=>open.some(c=>CITY[c].tier===t),cand=CITIES.filter(c=>!routeOpen(c[0])&&has('rt:'+c[2])&&c[2]<=mt).map(c=>CITY[c[0]]);
  const needTier=own.length&&!tierOpen(mt)&&cand.some(C=>C.tier===mt);
  if(cand.length&&(sup>mk*0.8||needTier)){const pool=needTier?cand.filter(C=>C.tier===mt):cand,best=pool.sort((a,b)=>cityMarket(b.code)*TIER_FARE[b.tier]/(TRIP[b.tier]+45)-cityMarket(a.code)*TIER_FARE[a.tier]/(TRIP[a.tier]+45))[0];
    out.push({text:`Open ${best.name}`,sub:needTier?`Your ${RT_NAMES[mt].toLowerCase()} jets have no ${RT_NAMES[mt].toLowerCase()} route yet.`:`Your flights offer ${Math.round(sup/mk*100)}% of what your cities want. ${best.name}: ${num(cityMarket(best.code))} seats a day, ${profileOf(best).toLowerCase()}.`,btn:`<button class="buy" data-ropen="${best.code}" data-cost="${ROUTE_FEE[best.tier]}">${money(ROUTE_FEE[best.tier])}</button>`,tag:best.code})}
  // fares, unless the route manager handles them
  if(!SET().autoFares){const up=open.filter(c=>rsOf(c).n>=1&&bestFare(c)>routeFareIx(c)),dn=open.filter(c=>rsOf(c).n>=1&&bestFare(c)<routeFareIx(c));
    if(up.length)out.push({text:`Raise fares on ${up.length} route${up.length>1?'s':''}`,sub:`${up.slice(0,4).join(', ')}${up.length>4?'…':''} would earn more at a higher fare${G.lv.loyalty?'':'. A frequent flyer club makes dearer fares stick'}.`,btn:`<button class="buy ghost" data-recfare="${up.join(',')}">Apply</button>`,tag:'FARE'});
    if(dn.length)out.push({text:`Cut fares on ${dn.length} route${dn.length>1?'s':''}`,sub:`${dn.slice(0,4).join(', ')}${dn.length>4?'…':''} would fill enough extra seats to earn more.`,btn:`<button class="buy ghost" data-recfare="${dn.join(',')}">Apply</button>`,tag:'FARE'})}
  // Lowmere: the shared route where you are losing most
  if(rivLive()){const weak=open.filter(c=>rivRoute(c)&&rsOf(c).n>=1).map(c=>[c,rivShare(c)]).filter(x=>x[1]<0.55).sort((a,b)=>a[1]-b[1])[0];
    if(weak){const [c,sh]=weak,fi=routeFareIx(c),cut=fi>0&&rivShare(c,fi-1)>sh+0.04;
      out.push({text:`Defend ${CITY[c].name}`,sub:`Lowmere takes ${Math.round((1-sh)*100)}% of its travellers. ${cut?'A lower fare wins some back, as do more flights and punctuality.':'More flights a day and better punctuality win travellers back.'}`,btn:cut?`<button class="buy ghost" data-rfare="${c}:${fi-1}">Cut fare</button>`:`<button class="buy ghost" data-rlook="${c}">Show</button>`,tag:'LOW'})}}
  // fleet: a jet for routes nobody can fly, or more planes when every flight is full and gates wait
  {const reach=Math.max(...open.map(c=>CITY[c].tier),0);if(reach>mt){const t=AC_ORDER.filter(t=>!AIRCRAFT[t].freighter&&has('ac:'+t)&&AIRCRAFT[t].tier>=reach&&(AIRCRAFT[t].tier<4||G.pierB)).sort((a,b)=>AIRCRAFT[a].cost-AIRCRAFT[b].cost)[0];
      if(t!=null)out.push({text:`Buy an ${AIRCRAFT[t].name}`,sub:`None of your planes can reach your ${RT_NAMES[reach].toLowerCase()} routes.`,btn:`<button class="buy" data-acbuy="${t}" data-cost="${AIRCRAFT[t].cost}">${money(AIRCRAFT[t].cost)}</button>`,tag:'PLANE'})}
    const idle=G.stands.some((s,k)=>s.built&&!R.st[k].F&&(R.st[k].idleT||0)>15),ready=own.some(f=>f.st==='base');
    if(idle&&!ready&&sup<mk*0.9){let bt=null;for(const t of AC_ORDER){const a=AIRCRAFT[t];if(!a.freighter&&has('ac:'+t)&&(!a.fire||G.lv.fire>=a.fire)&&(a.tier<4||G.pierB))bt=t}
      if(bt!=null)out.push({text:`Buy another ${AIRCRAFT[bt].short}`,sub:'Gates sit empty while every plane is away, and your cities want more seats.',btn:`<button class="buy" data-acbuy="${bt}" data-cost="${AIRCRAFT[bt].cost}">${money(AIRCRAFT[bt].cost)}</button>`,tag:'PLANE'})}}
  let h=`<div class="lcard rec"><div class="rechead"><span class="lbl">Recommended</span><button class="chip${SET().autoFares?' on':''}" data-setq="autoFares" title="Sets each route’s fare to whatever earns most">${SET().autoFares?'✓ ':''}Auto fares</button></div>`;
  h+=out.length?out.slice(0,4).map(o=>`<div class="recrow"><span class="lbadge sm" style="--c:#8C97A1">${o.tag}</span><div><div class="rt">${o.text}</div><div class="rd">${o.sub}</div></div><div class="btns">${o.btn}</div></div>`).join(''):`<div class="rd">Your routes, fares and fleet look balanced.</div>`;
  return h+`</div>`;
}
function recsClick(d){
  if(d.setq){G.set[d.setq]=!SET()[d.setq];save();renderPanel();return true}
  if(d.recline){const [m,st]=d.recline.split('|'),stops=st.split(',');if(orderLine(m,stops,[],null)){R.trRecs=null;renderPanel();save()}return true}
  if(d.recprev){const [m,st]=d.recprev.split('|'),stops=st.split(',');R.draft={mode:m,stops,skip:[],edit:null,col:draftCol(m)};R.regSel=null;if(R.view!=='region')setView('region');renderPanel();$('#panel').scrollTop=0;return true}
  if(d.recother){const [kind,n,k]=d.recother.split('|');if(kind==='stn'){const u=STN_UP[k];if(!stnUp(n,k)&&buy(u.cost)){(G.stn||(G.stn={}))[n]=Object.assign(G.stn[n]||{},{[k]:1});regionTick();toast(`${u.name} open at ${NODES[n].n}.`,null,null,'goal',4)}}else buyUpgrade(k);R.trRecs=null;renderPanel();save();return true}
  if(d.rectweak){const [id,dv]=d.rectweak.split(':'),L=G.lines[id];if(L){const fq=MODES[L.mode].freqs;L.freq=fq[clamp(fq.indexOf(L.freq)+(+dv),0,fq.length-1)];L.man=true;regionTick();renderPanel();save()}return true}
  if(d.recfare){for(const c of d.recfare.split(','))if(G.routes[c]){G.routes[c].f=bestFare(c);G.routes[c].man=true}renderPanel();save();return true}
  if(d.lauto){const L=G.lines[d.lauto];if(L){delete L.man;renderPanel();save()}return true}
  if(d.rauto){const r=G.routes[d.rauto];if(r){delete r.man;renderPanel();save()}return true}
  if(d.rivbuy){if(buyRival()){renderPanel();save()}return true}
  return false;
}
