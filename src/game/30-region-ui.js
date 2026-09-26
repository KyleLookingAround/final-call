/* ---------- view switching, camera and taps ---------- */
function setView(v){
  if(R.view===v)return;const cams=R.cams||(R.cams={});cams[R.view]=R.cam;R.view=v;
  const c=cams[v]||(cams[v]={x:0,y:0,z:v==='airport'?1:0.01,tx:null,ty:null});R.cam=c;if(v!=='airport'&&!c.init&&R.sw>1){c.init=1;c.z=zMin();c.x=0;c.y=0}
  clampCam();renderCam();$('#viewb').classList.toggle('on',v==='region');{const wb=$('#worldb');if(wb)wb.classList.toggle('on',v==='world')}$('#viewb').setAttribute('aria-label',v==='region'?'Show the airport':'Show the region');$('#viewb').title=v==='region'?'Back to the airport (R)':'Region map (R)';
}
function regionFocus(pid){const c=R.cam;if(pid==='all'){c.z=zMin();c.tx=0;c.ty=0;return}const pl=PLACES[pid]||PLOTS.find(p=>p.id===pid);c.z=Math.max(c.z,zMin()*2.2);const k=viewK();c.tx=pl.x-R.sw/k/2;c.ty=pl.y-R.sh/k/2;const b=camBounds(),vw=R.sw/k,vh=R.sh/k;c.tx=clamp(c.tx,b.x0,Math.max(b.x0,b.x1-vw));c.ty=clamp(c.ty,b.y0,Math.max(b.y0,b.y1-vh))}
function nearestNode(wx,wy,r){let best=null,bd=r;for(const n of NODE_IDS){const N=NODES[n];let d=Math.hypot(wx-N.x,wy-N.y);if(N.pier)d=Math.min(d,Math.hypot(wx-N.pier[0],wy-N.pier[1]));if(d<bd){bd=d;best=n}}return best}
function showCard(id){requestAnimationFrame(()=>{const el=document.getElementById(id);if(el)el.scrollIntoView({block:'start',behavior:REDUCED?'auto':'smooth'})})}
function regionTap(wx,wy){
  const k=viewK(),rr=Math.max(14,20/k);
  if(R.draft){const n=nearestNode(wx,wy,rr*1.5);if(n)draftTap(n);return}
  const open=()=>{R.regSub='lines';if(G.tab!=='region')setTab('region');else renderPanel()};
  const n=nearestNode(wx,wy,rr);
  if(n){R.regSel='node:'+n;open();showCard('node-'+n);return}
  const g=R.ng;let best=null,bd=Math.max(10,12/k);if(g)for(const id in g.lines){const d=distToPath(g.lines[id].P,wx,wy);if(d<bd){bd=d;best=id}}
  if(best){R.regSel=best;open();showCard('line-'+best);return}
  let bp=null,bpd=34;for(const P of PLOTS){if(!plotOpen(P))continue;const d=Math.hypot(wx-P.x,wy-P.y);if(d<bpd){bpd=d;bp=P}}
  if(bp){R.regSel='plot:'+bp.id;R.regSub='sites';if(G.tab!=='region')setTab('region');else renderPanel();showCard('plot-'+bp.id);return}
  if(Math.hypot(wx-900,wy-630)<80){setView('airport');setTab(G.tab==='region'?'stands':G.tab);return}
  if(R.regSel){R.regSel=null;if(G.tab==='region')renderPanel()}
}
/* ---------- drafting a line: pick a mode, tap stations ---------- */
function draftCol(mode){const M=MODES[mode];return M.cols[(nextNum(mode)-1)%M.cols.length]}
function startDraft(from){
  let m=R.lastMode&&MODES[R.lastMode]&&has('mode:'+R.lastMode)?R.lastMode:'bus';
  if(from&&!neighbours(from,m).length)m=MODE_ORDER.find(x=>has('mode:'+x)&&neighbours(from,x).length)||m;
  R.draft={mode:m,stops:from&&neighbours(from,m).length?[from]:[],skip:[],edit:null,col:draftCol(m)};R.regSel=null;R.regSub='lines';
  if(R.view!=='region')setView('region');if(isPhone()&&!document.body.classList.contains('fs'))setSheetSnap(1);
  renderPanel();$('#panel').scrollTop=0;
}
function setDraftMode(m){const D=R.draft;if(!D||!has('mode:'+m))return;R.lastMode=m;D.mode=m;D.col=draftCol(m);D.skip=[];
  if(!routeEdges(m,D.stops))D.stops=D.stops.length&&neighbours(D.stops[0],m).length?[D.stops[0]]:[]}
function draftTap(n){
  const D=R.draft,st=D.stops,M=MODES[D.mode],name=NODES[n].n;
  if(!st.length){if(!neighbours(n,D.mode).length){toast(`${M.name} lines can’t reach ${name}.`,null,null,'warn',4);return}st.push(n)}
  else if(n===st[st.length-1])st.pop();
  else if(n===st[0])st.shift();
  else if(st.includes(n)){const i=D.skip.indexOf(n);if(i>=0)D.skip.splice(i,1);else D.skip.push(n)}
  else{const av=new Set(st),pe=modePath(st[st.length-1],n,D.mode,av),ps=modePath(st[0],n,D.mode,av);
    if(!pe&&!ps){toast(`No ${M.name.toLowerCase()} route to ${name} from here.`,null,null,'warn',4);return}
    if(pe&&(!ps||pathLen(pe,D.mode)<=pathLen(ps,D.mode)))st.push(...pe.slice(1));else st.unshift(...ps.slice(1).reverse())}
  D.skip=D.skip.filter(x=>st.slice(1,-1).includes(x));tick();
  if(G.tab!=='region')setTab('region');else renderPanel();
}

/* ---------- the Region tab ---------- */
function regionPanel(){
  const r=R.reg||{lines:{},T:0,share:0,cong:0.3,jobs:0,tour:0,rev:0,ops:0,riders:0};const sub=R.regSub||'lines';
  let h=`<div class="segs" role="tablist">${[['lines','Transport'],['sites','Development'],['overview','Overview']].map(([id,n])=>`<button class="chip${sub===id?' on':''}" data-rsub="${id}">${n}</button>`).join('')}</div>`;
  if(sub==='lines'){
    const Ls=sortedLines();
    if(Ls.length){const p=r.rev-r.ops;h+=`<div class="report"><b>${num(r.riders)}</b> riders/h · <b>${Math.round(r.share*100)}%</b> of flyers · demand <b>+${Math.round(r.T*100)}%</b> · profit <b style="color:${p<0?'var(--bad)':'var(--good)'}">${money(p)}</b>/h</div>`}
    else h+=`<p class="note">Draw lines between stations. Links to the airport bring flyers; links between towns carry commuters and ease traffic.</p>`;
    if(!R.draft)h+=transportRecs();
    h+=R.draft?draftCard():`<button class="buy newline" data-newline="">+ New line</button>`;
    const sn=R.regSel&&R.regSel.startsWith('node:')?R.regSel.slice(5):null;if(sn&&NODES[sn]&&!R.draft)h+=stationCard(sn,r);
    for(const b of (G.builds||[]))if(b.lid&&!b.edit)h+=buildCard(b);
    for(const L of Ls)h+=lineCard(L,r);
    const lm=MODE_ORDER.filter(m=>!has('mode:'+m)).length;if(lm)h+=`<p class="note soon">${lm} more kind${lm>1?'s':''} of transport in the <button class="linkb" data-plan="1">Masterplan</button>.</p>`;
    h+=upSection('region');
  } else if(sub==='sites'){
    h+=`<p class="note">One build per site. They feed each other: homes need transport, jobs grow towns, crowds need trams.</p>`;
    for(const P of PLOTS)if(plotOpen(P))h+=plotCard(P,r);
    const hp=PLOTS.filter(P=>!plotOpen(P)).length;if(hp)h+=`<p class="note soon">${hp} more site${hp>1?'s':''} in the <button class="linkb" data-plan="1">Masterplan</button>.</p>`;
  } else {
    const popSum=Object.keys(PLACES).filter(p=>PLACES[p].kind!=='far'&&p!=='air').reduce((a,p)=>a+placePop(p),0);
    const bar=(v,col)=>`<div class="prog"><i style="width:${clamp(v,0,1)*100}%;background:${col}"></i></div>`;
    const nSt=NODE_IDS.filter(n=>linesAt(n).length).length;
    h+=`<div class="sec">The region</div><table class="fin">
      <tr><td>People living nearby</td><td>${num(popSum*1000)}</td></tr>
      <tr><td>Jobs created</td><td>${num(r.jobs*1000)}</td></tr>
      <tr><td>Stations with a service</td><td>${nSt} of ${NODE_IDS.length}</td></tr>
      <tr><td>Local trips by public transport</td><td>${Math.round((r.mshare||0)*100)}%</td></tr>
      <tr><td>Demand from public transport</td><td>+${Math.round(r.T*100)}%</td></tr>
      <tr><td>Business-city demand, from jobs</td><td>+${Math.round((r.biz||0)*100)}%</td></tr>
      <tr><td>Holiday-city demand, from tourism</td><td>+${Math.round((r.leis||0)*100)}%</td></tr>
      <tr><td>Staff wages, as staff ride to work</td><td>${Math.round(((r.wageMul||1)-1)*100)}%</td></tr>
      <tr><td>Development rents</td><td>${money(r.income||0)}/h</td></tr></table>`;
    {const fc=wxForecast(),on=wxAt(900,640);h+=`<div class="sec">Weather</div><div class="report">${on?`<b>${on.c.type}</b> over the airport now.`:'Clear at the airport.'} ${fc?`Next: <b>${fc.type}</b> in about <b>${Math.round(fc.eta)} min</b>.`:'Nothing heading this way.'} ${(G.wx||[]).length} weather system${(G.wx||[]).length===1?'':'s'} on the map.</div>`}
    h+=`<div class="sec">Traffic<span>${r.cong<0.35?'flowing':r.cong<0.6?'busy':r.cong<0.8?'congested':'gridlocked'}</span></div>${bar(r.cong,r.cong>0.75?'var(--bad)':r.cong>0.5?'var(--sign)':'var(--good)')}<p class="note">Everyone who doesn’t ride, drives. Jams slow buses, cut demand up to 12% and, when gridlocked, your rating.</p>`;
    const up=(G.evq||[]).slice().sort((a,b)=>a.at-b.at);
    h+=`<div class="sec">Coming up</div>`+(up.length?up.map(e=>`<div class="report"><b>${EVT[e.type].label}</b> · ${e.name} · day ${dayOf(e.at)} at <b>${hhmm(e.at)}</b> · about ${num(e.att)}</div>`).join(''):`<div class="report">Nothing booked. A stadium, cruise terminal, conference centre, arena or film studio adds events.</div>`);
    const towns=Object.keys(PLACES).filter(p=>p!=='air'&&PLACES[p].kind!=='far');
    h+=`<div class="sec">Towns</div><table class="fin">${towns.map(p=>{const pp=placePop(p),g=pp-PLACES[p].pop;return `<tr><td>${PLACES[p].name}</td><td>${num(pp*1000)}${g>=0.5?` <span style="color:var(--good)">+${num(g*1000)}</span>`:''}</td></tr>`}).join('')}</table>`;
  }
  return h;
}
function stopChips(stops,skip,attr){
  return `<div class="stops">${stops.map((n,i)=>{const mid=i>0&&i<stops.length-1,sk=(skip||[]).includes(n);return (i?'<span class="arr">›</span>':'')+(attr?attr(n,i,mid,sk):`<span class="chip static">${NODES[n].n}</span>`)}).join('')}</div>`;
}
function draftCard(){
  const D=R.draft,M=MODES[D.mode],edit=D.edit&&G.lines[D.edit],q=lineQuote(D.mode,D.stops,D.edit),code=edit?lineCode(edit):M.L+nextNum(D.mode);
  let h=`<div class="lcard draft" id="draft"><div class="lh"><span class="lbadge" style="--c:${D.col}">${code}</span><div><div class="rt">${edit?'Edit '+code:'New '+M.name.toLowerCase()+' line'}</div><div class="rd">${D.stops.length?'Tap stations to extend it. Tap an end to drop it.':'Tap a station on the map to start.'}</div></div><button class="chip" data-dcancel="">Cancel</button></div>`;
  if(!edit)h+=`<div class="chips">${MODE_ORDER.filter(m=>has('mode:'+m)).map(m=>`<button class="chip${m===D.mode?' on':''}" data-dmode="${m}">${MODES[m].name}</button>`).join('')}</div><div class="rd" style="margin:7px 0 2px">${M.desc} ${M.cap} seats · ${money(M.fare)} a ride${trackOf(D.mode)&&D.mode!=='water'?' · lays its own track':''}.</div>`;
  if(D.stops.length)h+=stopChips(D.stops,D.skip,(n,i,mid,sk)=>`<button class="chip${sk?' skip':''}" ${mid?`data-dskip="${n}" title="${sk?'Stop here':'Skip this stop'}"`:`data-dend="${i?'end':'start'}" title="Remove"`}>${NODES[n].n}${mid?'':' ×'}</button>`);
  const sug=edit?[]:(SUGGEST[D.mode]||[]).filter(s=>!Object.values(G.lines||{}).some(L=>L.mode===D.mode&&L.stops.join()===s.join())&&!modeLocked(D.mode,s)).slice(0,4);
  if(sug.length&&D.stops.length<2)h+=`<div class="rd" style="margin-top:8px">Ideas</div><div class="chips" style="margin-top:4px">${sug.map(s=>`<button class="chip" data-dsug="${s.join(',')}">${s.map(n=>NODES[n].n).join(' › ')}</button>`).join('')}</div>`;
  if(D.stops.length>=2){
    const parts=[];if(!edit)parts.push(`${M.name==='Bus'?'Buses':M.name==='Coach'?'Coaches':M.name+'s'} ${money(M.fix)}`);if(q.track.length)parts.push(`${q.track.length} new track section${q.track.length>1?'s':''} ${money(q.tcost)}`);else if(trackOf(D.mode))parts.push('track already laid');
    h+=`<div class="report">${parts.join(' · ')} · about <b>${q.ride} min</b> end to end · ${q.mins?`<b>${Math.round(q.mins/60*10)/10} h</b> to build`:'ready at once'}</div>`;
    if(q.why)h+=`<div class="rd" style="color:var(--bad);margin-top:6px">${q.why}</div>`;
    h+=`<div style="margin-top:8px;display:flex;justify-content:flex-end"><button class="buy" data-dgo="" ${q.ok?`data-cost="${q.cost}"`:'disabled'}>${edit&&!q.cost?'Save route':'Build '+money(q.cost)}</button></div>`;
  }
  return h+`</div>`;
}
function stationCard(n,r){
  const N=NODES[n],Ls=linesAt(n),pl=PLACES[N.pl],b=Math.round((r.boardAt&&r.boardAt[n])||0),g=r.GT&&r.GT[n]?r.GT[n].air:null;
  const who=N.far?'1.2M people, 140 km away':n==='air'?'Your terminal':n==='ano'?'Airport jobs and the north site':`${num(nodePop(n)*1000)} people nearby`;
  let h=`<div class="lcard sel" id="node-${n}"><div class="lh"><span class="lsw" style="background:#F4F1EA"></span><div><div class="rt">${N.n}${N.n!==pl.name&&n!=='air'&&n!=='ano'?` <small style="color:var(--muted);font-weight:500">${pl.name}</small>`:''}</div><div class="rd">${who} · ${num(b)} boarding/h</div></div><button class="chip" data-nclose="" aria-label="Close">✕</button></div>`;
  h+=Ls.length?`<div class="chips">${Ls.map(L=>`<button class="lbadge sm" style="--c:${L.col}" data-lsel="${L.id}" title="${lineName(L)}">${lineCode(L)}</button>`).join('')}</div>`:`<div class="rd">No lines call here yet.</div>`;
  if(n!=='air')h+=`<div class="rd" style="margin-top:6px">${g!=null?`To the airport: about <b>${Math.round(g)} min</b> door to door, waits and changes included.`:'No public transport to the airport yet.'}</div>`;
  const ups=Object.entries(STN_UP).filter(([k,u])=>has('stn:'+k)&&!N.far&&!(k==='pr'&&(n==='air'||n==='ano')));
  if(ups.length&&Ls.length)h+=`<div class="opts" style="margin-top:6px">${ups.map(([k,u])=>`<div class="opt"><div><div class="rt">${u.name}${stnUp(n,k)?' <span class="live">✓</span>':''}</div><div class="rd">${u.desc}</div></div>${stnUp(n,k)?'<button class="buy chipd" disabled>Built</button>':`<button class="buy" data-supg="${n}:${k}" data-cost="${u.cost}">${money(u.cost)}</button>`}</div>`).join('')}</div>`;
  h+=`<div style="margin-top:8px"><button class="buy ghost" data-newline="${n}">New line from here</button></div>`;
  return h+`</div>`;
}
function buildCard(b){const M=MODES[b.mode];return `<div class="lcard" id="line-${b.lid}"><div class="lh"><span class="lbadge" style="--c:${b.col}">${M.L}${b.num}</span><div><div class="rt">${NODES[b.stops[0]].n} – ${NODES[b.stops[b.stops.length-1]].n}</div><div class="rd">${M.name} · ${Math.ceil(b.done-G.clock)} min to go</div></div><span class="pill" style="--c:var(--sign)">BUILDING</span></div><div class="prog"><i style="width:${bprog(b.id)*100}%;background:var(--sign)"></i></div></div>`}
function lineCard(L,r){
  const M=MODES[L.mode],st=r.lines[L.id],sel=R.regSel===L.id,down=lineDown(L),eb=buildOf('line:'+L.id);
  let pill=null;if(replOn(L.id))pill=['BUSES','var(--good)'];else if(down)pill=['STOPPED','var(--bad)'];else if(eb)pill=['EXTENDING','var(--sign)'];else if(st&&st.f===0)pill=['NO SERVICE','var(--muted)'];else if(st&&st.load>1)pill=['FULL','var(--bad)'];else if(st&&st.load>0.85)pill=['BUSY','var(--sign)'];
  let h=`<div class="lcard${sel?' sel':''}" id="line-${L.id}"><button class="lhb" data-lsel="${L.id}" aria-expanded="${sel}"><span class="lbadge" style="--c:${L.col}">${lineCode(L)}</span><div><div class="rt">${lineName(L)}</div><div class="rd">${M.name} · every ${Math.round(60/L.freq)} min${st?` · ${num(st.riders)} riders/h`:''}</div></div>${pill?`<span class="pill" style="--c:${pill[1]}">${pill[0]}</span>`:`<span class="chev">${sel?'⌃':'⌄'}</span>`}</button>`;
  if(!sel)return h+`</div>`;
  if(eb)h+=`<div class="rd">Extending to ${lineName({stops:eb.stops})} · ${Math.ceil(eb.done-G.clock)} min to go.</div><div class="prog"><i style="width:${bprog(eb.id)*100}%;background:var(--sign)"></i></div>`;
  if(st){const profit=st.rev-st.ops;
    h+=`<div class="lstats"><div><b>${num(st.riders)}</b><span>riders/h</span></div><div><b>${num(st.fly)}</b><span>flyers/h</span></div><div><b style="color:${st.load>1?'var(--bad)':st.load>0.85?'var(--sign)':''}">${Math.round(st.load*100)}%</b><span>full</span></div><div><b>${Math.round(st.one)}</b><span>min trip</span></div><div><b style="color:${profit<0?'var(--bad)':'var(--good)'}">${money(profit)}</b><span>profit/h</span></div></div>`;
    h+=`<div class="prog"><i style="width:${clamp(st.load,0,1)*100}%;background:${st.load>1?'var(--bad)':L.col}"></i></div>`}
  h+=stopChips(L.stops,L.skip,(n,i,mid,sk)=>mid?`<button class="chip${sk?' skip':''}" data-lskip="${L.id}:${n}" title="${sk?'Stop here':'Skip this stop'}">${NODES[n].n}</button>`:`<span class="chip static">${NODES[n].n}</span>`);
  if(L.stops.length>2)h+=`<div class="rd">Tap a middle stop to skip it: quicker trips, but no riders there.</div>`;
  const fi=M.freqs.indexOf(L.freq),full=(routeEdges(L.mode,L.stops)||[]).some(({e})=>trackOf(L.mode)&&r.over&&(r.over[e.id+':'+L.mode]||0)>1);
  h+=`<div class="lrowc"><span class="rt">Every ${Math.round(60/L.freq)} min</span><div class="lever"><button data-lfreq="${L.id}:-1" aria-label="Fewer services" ${fi<=0?'disabled':''}>−</button><output>${L.freq}/h</output><button data-lfreq="${L.id}:1" aria-label="More services" ${fi>=M.freqs.length-1?'disabled':''}>+</button></div></div>`;
  if(SET().autoLines)h+=L.man?`<div class="rd">You set this line’s timetable. <button class="linkb" data-lauto="${L.id}">Hand it back to the manager</button></div>`:`<div class="rd">The transport manager sets how often it runs. Change it to take over.</div>`;
  if(full)h+=`<div class="rd" style="color:var(--bad)">Shared track is full, so every line on it runs slower.</div>`;
  h+=`<div class="lrowc"><span class="rt">Fares</span><div class="chips">${['Cheap','Standard','Premium'].map((n,i)=>`<button class="chip${(L.fare??1)===i?' on':''}" data-lfare="${L.id}:${i}">${n} <small>${money(M.fare*[0.7,1,1.5][i])}</small></button>`).join('')}</div></div>`;
  const tg=[];if(serves(L,'air'))tg.push(['sync','Meet flights','Waits for arriving flights: flyers wait half as long. Running +10%.']);tg.push(['night','Night service','Runs all night at half frequency']);if(L.mode==='rail'&&G.lv.cargo&&serves(L,'air'))tg.push(['freight','Freight paths','One path an hour carries cargo: +15% cargo']);
  h+=`<div class="chips" style="margin:6px 0">${tg.map(([k,n,t])=>`<button class="chip${L[k]?' on':''}" data-ltog="${L.id}:${k}" title="${t}">${L[k]?'✓ ':''}${n}</button>`).join('')}</div>`;
  const cc=carsCost(L);
  h+=`<div class="opt"><div><div class="rt">${L.mode==='bus'||L.mode==='coach'?'Bigger vehicles':'Longer '+(L.mode==='water'?'boats':L.mode==='tram'?'trams':'trains')} ${pips(L.cars||0,2)}</div><div class="rd">+50% seats each step, +35% running cost.</div></div>${(L.cars||0)<2?`<button class="buy" data-lcars="${L.id}" data-cost="${cc}">${money(cc)}</button>`:'<button class="buy chipd" disabled>Max</button>'}</div>`;
  h+=`<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="buy ghost" data-ledit="${L.id}" ${eb?'disabled':''}>Edit route</button><button class="buy sell" data-lclose="${L.id}">Close line</button></div>`;
  return h+`</div>`;
}
function plotCard(P,r){
  const id=G.dev[P.id],b=buildOf('dev:'+P.id);
  let h=`<div class="lcard${R.regSel==='plot:'+P.id?' sel':''}" id="plot-${P.id}"><div class="lh"><span class="lsw" style="background:${id?'var(--good)':b?'var(--sign)':'#3A424B'}"></span><div><div class="rt">${P.name}</div><div class="rd">${PLACES[P.place].name}</div></div>${id?`<span class="pill" style="--c:var(--good)">BUILT</span>`:b?`<span class="pill" style="--c:var(--sign)">BUILDING</span>`:''}</div>`;
  const fx=d=>{const o=[];if(d.pop)o.push(`+${d.pop}k people`);if(d.jobs)o.push(`+${d.jobs}k jobs`);if(d.tour)o.push(`tourism +${d.tour}`);if(d.cong>0)o.push(`traffic +${d.cong}`);if(d.cong<0)o.push(`traffic ${d.cong}`);if(d.income)o.push(`rent ${money(d.income)}/h`);if(d.upk)o.push(`costs ${money(d.upk)}/h`);if(d.ev)o.push(`${EVT[d.ev].label.toLowerCase()}s`);return o.join(' · ')};
  if(id){const d=DEV[id];h+=`<div class="rt" style="margin-top:6px">${d.name}</div><div class="rd">${d.desc}</div><div class="rd" style="margin-top:4px;color:var(--muted)">${fx(d)}</div>`;
    const nx=(G.evq||[]).find(e=>e.plot===P.id);if(nx)h+=`<div class="report">Next: <b>${nx.name}</b>, day ${dayOf(nx.at)} at <b>${hhmm(nx.at)}</b>, about ${num(nx.att)}.</div>`;
    h+=`<div style="margin-top:8px"><button class="buy sell" data-ddemo="${P.id}">Knock it down</button></div>`}
  else if(b){h+=`<div class="rd">Building the ${DEV[b.opt].name.toLowerCase()} · ${Math.ceil(b.done-G.clock)} min left.</div><div class="prog"><i style="width:${bprog(b.id)*100}%;background:var(--sign)"></i></div>`}
  else h+=`<div class="opts">`+P.opts.filter(o=>has('dev:'+o)).map(o=>{const d=DEV[o],lk=false;return `<div class="opt${lk?' lockd':''}"><div><div class="rt">${d.name}</div><div class="rd">${d.desc}</div><div class="rd" style="color:var(--muted);font-size:12px;margin-top:2px">${fx(d)} · ${Math.round(buildMins(d.build)/60*10)/10} h to build</div></div>${lk?`<button class="buy" disabled>Level ${d.lvl+1}</button>`:`<button class="buy" data-dbuild="${P.id}:${o}" data-cost="${d.cost}">${money(d.cost)}</button>`}</div>`}).join('')+`</div>`;
  return h+`</div>`;
}
function regionClick(d,b){
  const re=()=>{renderPanel();save()};
  if(d.rsub){R.regSub=d.rsub;renderPanel();$('#panel').scrollTop=0;return true}
  if(d.newline!=null){startDraft(d.newline||null);return true}
  if(d.dcancel!=null){R.draft=null;renderPanel();return true}
  if(d.dmode){setDraftMode(d.dmode);renderPanel();return true}
  if(d.dskip){const s=R.draft.skip,i=s.indexOf(d.dskip);if(i>=0)s.splice(i,1);else s.push(d.dskip);renderPanel();return true}
  if(d.dend){const D=R.draft;if(d.dend==='end')D.stops.pop();else D.stops.shift();D.skip=D.skip.filter(x=>D.stops.slice(1,-1).includes(x));renderPanel();return true}
  if(d.dsug){R.draft.stops=d.dsug.split(',');R.draft.skip=[];renderPanel();return true}
  if(d.dgo!=null){const D=R.draft;if(orderLine(D.mode,D.stops,D.skip,D.edit)){R.regSel=D.edit||null;R.draft=null;re();if(R.regSel)showCard('line-'+R.regSel)}return true}
  if(d.lsel){R.regSel=R.regSel===d.lsel&&b.classList.contains('lhb')?null:d.lsel;renderPanel();if(R.regSel)showCard('line-'+R.regSel);return true}
  if(d.nclose!=null){R.regSel=null;renderPanel();return true}
  if(d.supg){const [n,k]=d.supg.split(':'),u=STN_UP[k];if(u&&!stnUp(n,k)&&buy(u.cost)){(G.stn||(G.stn={}))[n]=Object.assign(G.stn[n]||{},{[k]:1});regionTick();re();toast(`${u.name} open at ${NODES[n].n}.`,null,null,'goal',4)}return true}
  if(d.lfreq){const [c,dv]=d.lfreq.split(':'),L=G.lines[c],fq=MODES[L.mode].freqs;L.man=true;L.freq=fq[clamp(fq.indexOf(L.freq)+(+dv),0,fq.length-1)];regionTick();re();return true}
  if(d.lfare){const [c,i]=d.lfare.split(':');G.lines[c].fare=+i;regionTick();re();return true}
  if(d.ltog){const [c,k]=d.ltog.split(':');G.lines[c][k]=!G.lines[c][k];if(k==='night')G.lines[c].man=true;regionTick();re();return true}
  if(d.lskip){const [c,n]=d.lskip.split(':'),L=G.lines[c],s=L.skip||(L.skip=[]),i=s.indexOf(n);if(i>=0)s.splice(i,1);else s.push(n);R.ng=null;regionTick();re();return true}
  if(d.lcars){const L=G.lines[d.lcars],cc=carsCost(L);if((L.cars||0)<2&&buy(cc)){L.cars=(L.cars||0)+1;regionTick();re()}return true}
  if(d.ledit){const L=G.lines[d.ledit];R.draft={mode:L.mode,stops:L.stops.slice(),skip:(L.skip||[]).slice(),edit:L.id,col:L.col};R.regSel=null;if(R.view!=='region')setView('region');renderPanel();$('#panel').scrollTop=0;return true}
  if(d.lclose){const key='close'+d.lclose;if(!(R.armKey===key&&Date.now()-R.armT<3000)){R.armKey=key;R.armT=Date.now();b.textContent='Tap to confirm';b.classList.add('arm');return true}R.armKey=null;closeLine(d.lclose);re();return true}
  if(d.dbuild){const [p,o]=d.dbuild.split(':');if(buildDev(p,o)){R.regSel='plot:'+p;re()}return true}
  if(d.ddemo){const key='demo'+d.ddemo;if(!(R.armKey===key&&Date.now()-R.armT<3000)){R.armKey=key;R.armT=Date.now();b.textContent='Tap to confirm';b.classList.add('arm');return true}R.armKey=null;delete G.dev[d.ddemo];G.evq=(G.evq||[]).filter(e=>e.plot!==d.ddemo);regionTick();re();return true}
  return false;
}
const plotOpen=P=>!!(G.dev&&G.dev[P.id])||isBuilding('dev:'+P.id)||P.opts.some(o=>has('dev:'+o));
function regionAffordable(){
  let n=0;
  outer:for(const m of MODE_ORDER){if(!has('mode:'+m))continue;for(const s of (SUGGEST[m]||[])){
    if(Object.values(G.lines||{}).some(L=>L.mode===m&&s.every(x=>L.stops.includes(x)))||(G.builds||[]).some(b=>b.lid&&b.mode===m&&s.every(x=>b.stops.includes(x))))continue;
    const q=lineQuote(m,s,null);if(q.ok&&G.cash>=q.cost){n=1;break outer}}}
  for(const P of PLOTS){if(!G.dev[P.id]&&!isBuilding('dev:'+P.id)&&P.opts.some(o=>has('dev:'+o)&&G.cash>=DEV[o].cost))n++}
  return n;
}

