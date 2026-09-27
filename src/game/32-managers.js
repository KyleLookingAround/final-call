/* ================= managers and recommendations: help for players who'd rather not tune everything ================= */
// the transport manager runs every line you haven't taken over, by what each change is worth to the network and the airport
const mgrOn=L=>!!L&&SET().autoLines&&!L.man;
function mgrNote(text){const l=R.mgrLog||(R.mgrLog=[]);l.unshift({t:G.clock,text});if(l.length>3)l.length=3}
function trackRoom(L,f){ // would running L at f services an hour overfill track it shares?
  const tm=trackOf(L.mode),cap=tm&&TRACKCAP[tm],ov=R.reg&&R.reg.over;if(!cap||!ov)return true;
  for(const {e} of (routeEdges(L.mode,L.stops)||[]))if((ov[e.id+':'+tm]||0)+(f-L.freq)/cap>1)return false;return true}
function evExtra(L){ // the event whose crowds this line is carrying now, when the manager runs it
  if(!mgrOn(L)||!G.evq||!G.evq.length)return null;
  for(const e of G.evq){const v=plotNode(e.plot),d=G.clock-e.at;if(v&&v!=='air'&&((d>-150&&d<0)||(d>90&&d<210))&&serves(L,v))return e}return null}
function mgrCands(L,full){ // one step either way on services; on every other review, fares and meeting flights too
  const fq=MODES[L.mode].freqs,fi=fq.indexOf(L.freq),f=L.fare??1,c=[];
  if(fi>0)c.push(['freq',fq[fi-1]]);if(fi>=0&&fi<fq.length-1&&trackRoom(L,fq[fi+1]))c.push(['freq',fq[fi+1]]);
  if(full){if(f>0)c.push(['fare',f-1]);if(f<2)c.push(['fare',f+1]);if(serves(L,'air'))c.push(['sync',!L.sync])}return c}
function mgrSet(L,[k,v]){L[k]=v}
function mgrSay(L,[k,v]){const code=lineCode(L);return k==='freq'?`${code} every ${Math.round(60/v)} min (was ${Math.round(60/L.freq)})`:k==='fare'?`${['Cheap','Standard','Premium'][v]} fares on ${code}`:`${code} ${v?'meets':'no longer waits for'} flights`}
function managersTick(){ // every six hours: queue a review of each line, and night services
  R.mgrQ=[];R.mgrN=(R.mgrN||0)+1;const full=R.mgrN%2===1;
  if(SET().autoLines)for(const L of sortedLines()){if(!mgrOn(L)||lineDown(L)||buildOf('line:'+L.id))continue;R.mgrQ.push({id:L.id,full,c:null,i:0,best:null,bv:0,base:null,fix:null});
    if(!L.night&&(['tram','rail','metro'].includes(L.mode)||(serves(L,'air')&&R.reg&&R.reg.share>0.08)))L.night=true}
  if(SET().autoFares)for(const c in (G.routes||{})){const r=G.routes[c];if(r.man||!CITY[c])continue;if(rsOf(c).n<1)continue;const b=bestFare(c),f=r.f??1;if(b!==f)r.f=f+Math.sign(b-f)}
  if(!R.sim&&(G.tab==='region'||G.tab==='routes'))renderPanel();
}
clock(MINUTE,'managersTick',360,0,managersTick);
function mgrStep(){ // every game minute during a review: one measurement of one line, so the game never stalls
  const Q=R.mgrQ;if(!Q||!Q.length)return;const j=Q[0],L=G.lines[j.id];
  if(!mgrOn(L)||lineDown(L)||buildOf('line:'+j.id)){Q.shift();return}
  if(!j.c){j.c=mgrCands(L,j.full);j.fix=evalFix();j.base=evalRegion(null,j.fix);return} // the line as it runs now, pinned to this moment
  if(j.i<j.c.length){const c=j.c[j.i++],v=recValue(j.base,evalRegion(()=>mgrSet(G.lines[j.id],c),j.fix)).v;if(v>j.bv){j.bv=v;j.best=c}return}
  Q.shift();const st=R.reg&&R.reg.lines[L.id];
  if(j.best&&j.bv>=Math.max(5,0.03*(st?st.ops:0))){const say=mgrSay(L,j.best);mgrSet(L,j.best);regionTick();mgrNote(`${say}: +${money(Math.round(j.bv))}/h`);if(!R.sim&&G.tab==='region')renderPanel()}
}
clock(MINUTE,'mgrStep',1,0,mgrStep);
function mgrHour(){ // a line so full it costs rating gets more services at once
  if(!SET().autoLines||!R.reg)return;let n=0;
  for(const L of sortedLines()){if(!mgrOn(L)||lineDown(L))continue;const st=R.reg.lines[L.id],fq=MODES[L.mode].freqs,fi=fq.indexOf(L.freq);
    if(!st||st.baseLoad<=1.05||fi<0||fi>=fq.length-1||!trackRoom(L,fq[fi+1]))continue;mgrNote(`${lineCode(L)} was overfull: every ${Math.round(60/fq[fi+1])} min now`);L.freq=fq[fi+1];n++}
  if(n){regionTick();if(!R.sim&&G.tab==='region')renderPanel()}
}
clock(HOUR,'mgrHour',60,0,mgrHour);
// what a change would do to the network, measured by running the region model with it and without it
const evalFix=()=>({reg:R.reg,air:airPerHour(),ewx:R.reg&&R.reg.ewx||{}}); // the moment a run of measurements compares against
function evalRegion(mutate,fix){
  const keep={reg:R.reg,bs:R.boardSum,bn:R.boardN,ng:R.ng,lines:G.lines,stn:G.stn,lv:G.lv,clock:G.clock,live:(G.evq||[]).map(e=>e.live)},seed=fix?fix.reg:R.reg;
  const out={tp:0,T:0,cong:0,rid:0,fly:0,wage:0,lr:{}},hrs=[9,17.5];R.evalMode=true;R.evalFix=fix||null;
  try{G.lines=JSON.parse(JSON.stringify(keep.lines));G.stn=JSON.parse(JSON.stringify(keep.stn||{}));G.lv=Object.assign({},keep.lv);mutate&&mutate();
    for(const h of hrs){G.clock=Math.floor(keep.clock/1440)*1440+h*60;R.reg=seed;R.ng=null;regionTick();const r=R.reg;out.tp+=(r.rev-r.ops)/hrs.length;out.T+=r.T/hrs.length;out.cong+=r.cong/hrs.length;out.rid+=r.riders/hrs.length;out.fly+=r.flyers/hrs.length;out.wage+=r.wageMul/hrs.length;
      for(const id in r.lines)out.lr[id]=(out.lr[id]||0)+r.lines[id].riders/hrs.length}}
  finally{Object.assign(G,{lines:keep.lines,stn:keep.stn,lv:keep.lv,clock:keep.clock});R.reg=keep.reg;R.boardSum=keep.bs;R.boardN=keep.bn;R.ng=keep.ng;(G.evq||[]).forEach((e,i)=>e.live=keep.live[i]);R.evalMode=false;R.evalFix=null}
  return out;
}
const tempLine=(mode,stops)=>{const M=MODES[mode];return {id:'Lrec',mode,stops,skip:[],freq:M.freqs[Math.min(1,M.freqs.length-1)],fare:1,night:false,sync:false,cars:0,freight:false,num:nextNum(mode),col:M.cols[(nextNum(mode)-1)%M.cols.length]}};
function airWorth(){ // what an hour of the airport's business is worth: the median of recent hours, so a one-off windfall doesn't skew it
  const hs=(G.hours||[]).slice(0,-1).map(h=>h.rev).sort((a,b)=>a-b);return Math.max(20,0.7*(hs.length>=3?hs[hs.length>>1]:(G.rate||0)*60))}
function recValue(b,a){ // money an hour the change is worth: transit profit, busier flights, cheaper staff
  const air=airWorth(),dem=((1+a.T)*(1-0.12*a.cong))/((1+b.T)*(1-0.12*b.cong))-1,wage=wageBill()*((b.wage-a.wage)/(b.wage||1));
  return {v:(a.tp-b.tp)+air*dem+wage,dem,dt:a.tp-b.tp,cong:a.cong-b.cong,rid:a.rid-b.rid}}
// suggestions: new lines, upgrades, extensions, closures, station and network upgrades
const REC_PAY=168; // a suggestion must pay back within a week
function recCands(){
  const cands=[];
  const same=(m,st)=>Object.values(G.lines||{}).some(L=>L.mode===m&&st.every(x=>L.stops.includes(x))&&L.stops.length<=st.length+1)||(G.builds||[]).some(b=>b.lid&&b.mode===m&&st.every(x=>b.stops.includes(x)));
  for(const m of MODE_ORDER){if(!has('mode:'+m))continue;for(const st of (SUGGEST[m]||[])){if(same(m,st))continue;const q=lineQuote(m,st,null);if(!q.ok)continue;cands.push({kind:'line',mode:m,stops:st,cost:q.cost,mins:q.mins})}}
  for(const L of sortedLines()){if(buildOf('line:'+L.id)||lineDown(L))continue;
    for(const m of upTargets(L)){const st=upgradeStops(L,m);if(!st)continue;const q=lineQuote(m,st,L.id);if(q.ok)cands.push({kind:'mode',id:L.id,mode:m,stops:st,cost:q.cost,mins:q.mins})}
    [L.stops[0],L.stops[L.stops.length-1]].forEach((n,e)=>{for(const [o] of neighbours(n,L.mode)){if(L.stops.includes(o))continue;const st=e?[...L.stops,o]:[o,...L.stops];
      if(cands.some(c=>c.kind==='ext'&&c.id===L.id&&c.to===o))continue;const q=lineQuote(L.mode,st,L.id);if(q.ok)cands.push({kind:'ext',id:L.id,mode:L.mode,stops:st,to:o,cost:q.cost,mins:q.mins})}});
    cands.push({kind:'close',id:L.id,cost:0})}
  for(const n of NODE_IDS){const N=NODES[n],Ls=linesAt(n);if(!Ls.length||N.far)continue;
    if(has('stn:pr')&&n!=='air'&&n!=='ano'&&!stnUp(n,'pr'))cands.push({kind:'stn',n,k:'pr',cost:STN_UP.pr.cost});
    if(has('stn:hub')&&Ls.length>=2&&!stnUp(n,'hub'))cands.push({kind:'stn',n,k:'hub',cost:STN_UP.hub.cost})}
  for(const k of ['rtinfo','tickets'])if(has('up:'+k)&&!G.lv[k]&&Object.keys(G.lines||{}).length)cands.push({kind:'up',k,cost:upCost(k)});
  return cands.filter(c=>!((R.recHide||{})[recKey(c)]>G.clock));
}
const recKey=c=>[c.kind,c.id||c.n||'',c.mode||c.k||'',(c.stops||[]).join(',')].join('|');
function recTry(c){ // the change itself, on the copy of the network evalRegion hands over
  if(c.kind==='line')G.lines.Lrec=tempLine(c.mode,c.stops);
  else if(c.kind==='mode'){const X=G.lines[c.id];X.freq=upFreq(X,c.mode);Object.assign(X,{mode:c.mode,stops:c.stops,skip:[],cars:0})}
  else if(c.kind==='ext')G.lines[c.id].stops=c.stops;
  else if(c.kind==='close')delete G.lines[c.id];
  else if(c.kind==='stn')(G.stn[c.n]||(G.stn[c.n]={}))[c.k]=1;else G.lv[c.k]=1}
function recEval(base,c,out,fix){
  if(c.id&&!G.lines[c.id])return;const a=evalRegion(()=>recTry(c),fix),val=recValue(base,a);if(val.v<=0.5)return;
  c.val=val;c.pay=c.cost/val.v;if(c.kind==='close')c.gain=Object.keys(a.lr).filter(id=>id!==c.id&&a.lr[id]>(base.lr[id]||0)+2).sort((x,y)=>(a.lr[y]-base.lr[y])-(a.lr[x]-base.lr[x])).slice(0,2);
  if(c.pay<=REC_PAY)out.push(c)}
const recSort=out=>{const seen=new Set();return out.sort((x,y)=>x.pay-y.pay||y.val.v-x.val.v).filter(c=>!c.id||!seen.has(c.id)&&seen.add(c.id)).slice(0,8)}; // quickest payback first, one suggestion per line
function computeTransitRecs(){ // all at once: the bot and the checks
  const base=evalRegion(null),out=[];for(const c of recCands())recEval(base,c,out);
  R.trRecs={at:G.clock,sig:recSig(),list:recSort(out)};return R.trRecs.list;
}
function recStart(){if(!R.trJob){R.trJob={sig:recSig(),at:G.clock,c:recCands(),i:0,out:[],base:null};setTimeout(recJob,30)}}
function recTip(c){ // the advisor's line for a suggestion, and the button it points at
  const L=c.id&&G.lines[c.id],M=MODES[c.mode],w=`would earn about ${money(c.val.v)} an hour.`;
  if(c.kind==='line')return {text:`A ${M.name.toLowerCase()} ${recPath(c.stops).replace(/ › /g,'–')} ${w}`,go:['region','[data-recline]']};
  if(c.kind==='mode')return {text:`Upgrading ${lineCode(L)} to ${M.name==='Metro'?'the metro':M.name.toLowerCase()} ${w}`,go:['region','[data-recmode]']};
  if(c.kind==='ext')return {text:`Extending ${lineCode(L)} to ${NODES[c.to].n} ${w}`,go:['region','[data-recext]']};
  if(c.kind==='close')return {text:`${lineCode(L)} costs more than it brings in. Closing it saves ${money(c.val.v)} an hour.`,go:['region','.rec [data-lclose]']};
  return {text:`${c.kind==='stn'?STN_UP[c.k].name+' at '+NODES[c.n].n:UPG[c.k].name} ${w}`,go:['region','[data-recother]']};
}
function recJob(){ // on screen: a few options per slice between frames, so a big network never stalls the game
  const J=R.trJob;if(!J)return;const t0=performance.now();
  if(!J.base){J.fix=evalFix();J.base=evalRegion(null,J.fix)} // every option measured against the same moment, however long it takes
  while(J.i<J.c.length&&performance.now()-t0<8)recEval(J.base,J.c[J.i++],J.out,J.fix);
  if(J.i<J.c.length){setTimeout(recJob,20);return}
  R.trJob=null;if(recSig()!==J.sig)return;R.trRecs={at:G.clock,sig:J.sig,list:recSort(J.out)};
  if(G.tab==='region'&&!R.draft&&(R.regSub||'lines')==='lines'){const pn=$('#panel'),sc=pn.scrollTop;renderPanel();pn.scrollTop=sc}
}
const recSig=()=>Object.values(G.lines||{}).map(L=>L.id+L.mode+L.stops.join('')).join('|')+'#'+JSON.stringify(G.stn||{})+'#'+(G.builds||[]).length+'#'+Object.keys(G.tech||{}).length+'#'+G.lv.rtinfo+G.lv.tickets;
function applyRec(c){ // buy or make a suggestion; true when it went ahead
  if(c.kind==='line')return orderLine(c.mode,c.stops,[],null);
  if(c.kind==='mode')return orderLine(c.mode,c.stops,[],c.id);
  if(c.kind==='ext'){const L=G.lines[c.id];return !!L&&orderLine(L.mode,c.stops,L.skip||[],c.id)}
  if(c.kind==='close'){if(!G.lines[c.id])return false;closeLine(c.id);return true}
  if(c.kind==='stn'){const u=STN_UP[c.k];if(stnUp(c.n,c.k)||!buy(u.cost))return false;(G.stn||(G.stn={}))[c.n]=Object.assign(G.stn[c.n]||{},{[c.k]:1});regionTick();toast(`${u.name} open at ${NODES[c.n].n}.`,null,null,'goal',4);return true}
  return buyUpgrade(c.k)!==false;
}
function lineTweaks(){ // quick fixes for lines already running
  const out=[],r=R.reg;if(!r)return out;
  for(const L of sortedLines()){const st=r.lines[L.id];if(!st||lineDown(L)||buildOf('line:'+L.id))continue;const M=MODES[L.mode],fq=M.freqs,fi=fq.indexOf(L.freq),mgr=mgrOn(L);
    if(st.baseLoad>0.95&&fi===fq.length-1&&(L.cars||0)<2)out.push({kind:'cars',L,text:`${lineCode(L)} is full at every service`,sub:`Longer ${L.mode==='bus'||L.mode==='coach'?'vehicles':'trains'} carry 50% more.`,cost:carsCost(L)});
    else if(!mgr&&st.baseLoad>0.9&&fi<fq.length-1)out.push({kind:'more',L,text:`${lineCode(L)} is packed`,sub:`Run it every ${Math.round(60/fq[fi+1])} min instead of ${Math.round(60/L.freq)}.`});
    else if(!mgr&&st.baseLoad<0.25&&st.rev<st.ops&&fi>0)out.push({kind:'less',L,text:`${lineCode(L)} runs mostly empty`,sub:`Every ${Math.round(60/fq[fi-1])} min would save money.`})}
  return out.slice(0,3);
}
const payTxt=p=>p<=0?'no cost':p<1?'pays back within the hour':p<48?`pays back in ~${Math.round(p)} h`:`pays back in ~${Math.round(p/24)} days`;
function recWorth(v,pay){return `${v.v>=1?`+${money(Math.round(v.v))}/h`:'Small gain'}${v.dem>0.005?` · demand +${(v.dem*100).toFixed(1)}%`:''}${v.cong<-0.01?` · traffic −${Math.round(-v.cong*100)}%`:''} · ${payTxt(pay)}`}
const recHideBtn=c=>` <button class="linkb" data-rechide="${recKey(c)}">Not now</button>`;
const recPath=st=>st.map(n=>NODES[n].n).join(' › ');
function recRow(c){
  const M=MODES[c.mode],L=c.id&&G.lines[c.id],cost=c.cost?money(c.cost):'Free';
  if(c.kind==='line')return `<div class="recrow"><span class="lbadge sm" style="--c:${M.cols[(nextNum(c.mode)-1)%M.cols.length]}">${M.L}${nextNum(c.mode)}</span><div><div class="rt">${M.name}: ${recPath(c.stops)}</div><div class="rd">${recWorth(c.val,c.pay)}${recHideBtn(c)}</div></div><div class="btns"><button class="buy" data-recline="${c.mode}|${c.stops.join(',')}" data-cost="${c.cost}">${cost}</button><button class="chip" data-recprev="${c.mode}|${c.stops.join(',')}">Preview</button></div></div>`;
  if(c.kind==='mode')return `<div class="recrow"><span class="lbadge sm" style="--c:${L.col}">${lineCode(L)}</span><div><div class="rt">Upgrade ${lineCode(L)} to ${M.name==='Train'?'a train':M.name==='Metro'?'the metro':'a '+M.name.toLowerCase()}</div><div class="rd">${recPath(c.stops)} · ${recWorth(c.val,c.pay)}${recHideBtn(c)}</div></div><div class="btns"><button class="buy" data-recmode="${c.id}|${c.mode}|${c.stops.join(',')}" data-cost="${c.cost}">${cost}</button><button class="chip" data-recprev="${c.mode}|${c.stops.join(',')}|${c.id}">Preview</button></div></div>`;
  if(c.kind==='ext')return `<div class="recrow"><span class="lbadge sm" style="--c:${L.col}">${lineCode(L)}</span><div><div class="rt">Extend ${lineCode(L)} to ${NODES[c.to].n}</div><div class="rd">${recWorth(c.val,c.pay)}${recHideBtn(c)}</div></div><div class="btns"><button class="buy" data-recext="${c.id}|${c.stops.join(',')}"${c.cost?` data-cost="${c.cost}"`:''}>${c.cost?cost:'Extend'}</button><button class="chip" data-recprev="${c.mode}|${c.stops.join(',')}|${c.id}">Preview</button></div></div>`;
  if(c.kind==='close'){const g=(c.gain||[]).map(id=>G.lines[id]&&lineCode(G.lines[id])).filter(Boolean);
    return `<div class="recrow"><span class="lbadge sm" style="--c:${L.col}">${lineCode(L)}</span><div><div class="rt">Close ${lineCode(L)}</div><div class="rd">${g.length?`${g.join(' and ')} carr${g.length>1?'y':'ies'} its riders. `:''}Saves ${money(Math.round(c.val.v))}/h.${recHideBtn(c)}</div></div><div class="btns"><button class="buy sell" data-lclose="${c.id}">Close</button></div></div>`}
  const name=c.kind==='stn'?`${STN_UP[c.k].name} at ${NODES[c.n].n}`:UPG[c.k].name;
  return `<div class="recrow"><span class="lbadge sm" style="--c:#8C97A1">${c.kind==='stn'?(c.k==='pr'?'P+R':'HUB'):'NET'}</span><div><div class="rt">${name}</div><div class="rd">+${money(c.val.v)}/h${c.val.dem>0.005?` · demand +${(c.val.dem*100).toFixed(1)}%`:''} · ${payTxt(c.pay)}${recHideBtn(c)}</div></div><div class="btns"><button class="buy" data-recother="${c.kind}|${c.n||''}|${c.k}" data-cost="${c.cost}">${money(c.cost)}</button></div></div>`;
}
function transportRecs(){
  if(SET().recs===false)return '';
  const fresh=R.trRecs&&R.trRecs.sig===recSig()&&G.clock-R.trRecs.at<120;
  if(!fresh)recStart();
  const list=R.trRecs?R.trRecs.list.filter(c=>!((R.recHide||{})[recKey(c)]>G.clock)&&(!c.id||G.lines[c.id])).slice(0,4):[],tw=lineTweaks(),log=SET().autoLines?(R.mgrLog||[]):[];
  let h=`<div class="lcard rec"><div class="rechead"><span class="lbl">Transport manager</span><button class="chip${SET().autoLines?' on':''}" data-setq="autoLines" title="Runs your lines: how often, fares, meeting flights and extra services on event days">${SET().autoLines?'✓ ':''}Runs your lines</button></div>`;
  if(log.length)h+=`<div class="rd mlog">${log.map(x=>`<div>${x.text}</div>`).join('')}</div>`;
  if(!R.trRecs)h+=`<div class="rd">Working out what would help most…</div>`;
  else if(!list.length&&!tw.length)h+=`<div class="rd">Nothing worth building right now. Your network covers what it can.</div>`;
  h+=list.map(recRow).join('');
  h+=tw.map(t=>`<div class="recrow"><span class="lbadge sm" style="--c:${t.L.col}">${lineCode(t.L)}</span><div><div class="rt">${t.text}</div><div class="rd">${t.sub}</div></div><div class="btns">${t.kind==='cars'?`<button class="buy" data-lcars="${t.L.id}" data-cost="${t.cost}">${money(t.cost)}</button>`:`<button class="buy ghost" data-rectweak="${t.L.id}:${t.kind==='more'?1:-1}">Apply</button>`}</div></div>`).join('');
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
  if(d.recprev){const [m,st,id]=d.recprev.split('|'),stops=st.split(','),L=id&&G.lines[id];R.draft={mode:m,stops,skip:L&&L.mode===m?(L.skip||[]).filter(n=>stops.includes(n)):[],edit:L?id:null,col:L&&L.mode===m?L.col:draftCol(m)};R.regSel=null;if(R.view!=='region')setView('region');focusStops(stops);renderPanel();$('#panel').scrollTop=0;return true}
  if(d.recmode){const [id,m,st]=d.recmode.split('|');if(applyRec({kind:'mode',id,mode:m,stops:st.split(',')})){R.trRecs=null;R.regSel=id;renderPanel();save()}return true}
  if(d.recext){const [id,st]=d.recext.split('|');if(applyRec({kind:'ext',id,stops:st.split(',')})){R.trRecs=null;renderPanel();save()}return true}
  if(d.rechide){(R.recHide||(R.recHide={}))[d.rechide]=G.clock+1440;renderPanel();return true}
  if(d.recother){const [kind,n,k]=d.recother.split('|');applyRec({kind,n,k});R.trRecs=null;renderPanel();save();return true}
  if(d.rectweak){const [id,dv]=d.rectweak.split(':'),L=G.lines[id];if(L){const fq=MODES[L.mode].freqs;L.freq=fq[clamp(fq.indexOf(L.freq)+(+dv),0,fq.length-1)];L.man=true;regionTick();renderPanel();save()}return true}
  if(d.recfare){for(const c of d.recfare.split(','))if(G.routes[c]){G.routes[c].f=bestFare(c);G.routes[c].man=true}renderPanel();save();return true}
  if(d.lauto){const L=G.lines[d.lauto];if(L){delete L.man;renderPanel();save()}return true}
  if(d.rauto){const r=G.routes[d.rauto];if(r){delete r.man;renderPanel();save()}return true}
  if(d.rivbuy){if(buyRival()){renderPanel();save()}return true}
  return false;
}
