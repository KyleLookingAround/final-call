/* ---------- events ---------- */
function scheduleEvent(plot){
  const d=devAt(plot);if(!d||!d.ev)return;if((G.evq||[]).some(e=>e.plot===plot))return;
  const E=EVT[d.ev],off=E.every[0]+rnd()*(E.every[1]-E.every[0]),day=Math.floor(G.clock/1440)+Math.max(1,Math.round(off));
  let at=day*1440+pickOf(E.times);if(at<G.clock+300)at+=1440;
  const att=Math.round((E.att[0]+rnd()*(E.att[1]-E.att[0]))*(1+(R.reg?R.reg.tour:0)*0.004)/100)*100;
  let name='';
  if(d.ev==='match')name=`Harbourgate FC v ${pickOf(TEAMS)}`;else if(d.ev==='cruise')name=pickOf(SHIPS);else if(d.ev==='concert')name=pickOf(ARTISTS);else if(d.ev==='conference')name=pickOf(CONFS);else name=pickOf(FILMS);
  (G.evq||(G.evq=[])).push({type:d.ev,plot,at,att,name,dem:0,car:0,warned:false});
}
function evPlace(e){return PLOTS.find(p=>p.id===e.plot).place}
function updateEvents(dt){
  if(!G.evq)G.evq=[];
  for(const e of G.evq.slice()){
    const E=EVT[e.type],pid=evPlace(e);
    if(!e.warned&&G.clock>=e.at-200&&G.clock<e.at){e.warned=true}
    if(e.live&&pid!=='air'){const fans=e.live.fans;e.dem+=fans*dt/60;e.car+=Math.min(fans,e.live.carried||0)*dt/60}
    if(G.clock>=e.at+210){
      const C=R.reg?R.reg.cong:0.3;let f=pid==='air'?1:e.dem>0?(e.car+(e.dem-e.car)*0.6*(1-C))/e.dem:0.6*(1-C);f=clamp(f,0,1);
      let levy=e.att*E.levy*(0.5+0.5*f);
      if(e.type==='conference'){levy*=(devOn('hotels')?1.5:1)*(1+0.1*G.lv.hotel)*(devOn('techcampus')?1.3:1)}
      earn(levy,'region');
      let head='';
      if(e.type==='match'){const a=Math.floor(rnd()*4),b=Math.floor(rnd()*3);head=`Full time: ${e.name.replace(' v ',` ${a}–${b} `)}.`}
      else if(e.type==='cruise')head=`${e.name} has sailed.`;else if(e.type==='concert')head=`${e.name} played to ${num(e.att)}.`;else if(e.type==='conference')head=`${e.name} has wrapped up.`;else head=`The premiere of ${e.name} is over.`;
      const pct=Math.round(f*100);
      let tail=pid==='air'?'Everyone walked straight from the terminal.':f>=0.75?`${pct}% got there and back easily.`:f>=0.5?`Only ${pct}% got there and back easily; the rest sat in traffic.`:`Chaos: just ${pct}% got there and back easily.`;
      if(f>=0.75)repAdj(2,'events');else if(f<0.5)repAdj(-(0.5-f)*10,'events');
      news(`${head} ${tail} Takings ${money(levy)}.`);e.res={f,levy,t:G.clock};(R.evDoneFx||(R.evDoneFx=[])).push({plot:e.plot,text:`${EVT[e.type].label.toUpperCase()} · ${Math.round(f*100)}% GOT HOME · +${money(levy)}`,t:G.clock,good:f>=0.5});toast(`${EVT[e.type].label}: +${money(levy)}, ${Math.round(f*100)}% got there and back easily.`,null,null,f>=0.5?'goal':'warn',6);
      G.evDone=(G.evDone||0)+1;G.evq.splice(G.evq.indexOf(e),1);scheduleEvent(e.plot);
    }
  }
}

/* ---------- building and editing lines ---------- */
function modeLocked(mode,stops){const M=MODES[mode];if(!has('mode:'+mode))return `Approve ${TECH_BY[NODE_OF['mode:'+mode]].n} in the Masterplan first.`;if(M.kind==='rail'&&stops&&stops.includes('air')&&!G.lv.rail)return 'Trains need the airport station first (below)';return ''}
const pendingTrack=(eid,m)=>(G.builds||[]).some(b=>b.track&&b.mode===m&&b.track.includes(eid));
function trackCost(e,m){return Math.round((e.len+(e.extra||0))*MODES[m].tpx*(e.old?0.4:1)*(e.cost||1)*(devOn('wind')?0.85:1))}
function nextNum(mode){const used=new Set();for(const L of Object.values(G.lines||{}))if(L.mode===mode)used.add(L.num);for(const b of (G.builds||[]))if(b.lid&&!b.edit&&b.mode===mode)used.add(b.num);let n=1;while(used.has(n))n++;return n}
function lineQuote(mode,stops,editId){
  const M=MODES[mode],q={ok:false,cost:0,track:[],tcost:0,mins:0,ride:0,why:''};
  if(!stops||stops.length<2){q.why='Pick at least two stations.';return q}
  const RE=routeEdges(mode,stops);if(!RE){q.why='Stations must be next to each other.';return q}
  if(new Set(stops).size!==stops.length){q.why='A line can’t visit a station twice.';return q}
  const tm=trackOf(mode);let tmins=0,ride=0;
  for(const {e} of RE){ride+=edgeMins({mode,id:''},e,M,false);if(tm&&!hasTrack(e,mode)){if(pendingTrack(e.id,mode)){q.why='Track here is still being laid.';return q}q.track.push(e.id);q.tcost+=trackCost(e,mode);tmins+=(e.len+(e.extra||0))*M.tbuild*(e.old?0.6:1)}}
  const edit=editId&&G.lines[editId];
  q.cost=q.tcost+(edit?(q.track.length?Math.round(M.fix*0.1):0):M.fix);
  q.mins=edit&&!q.track.length?0:buildMins(Math.max(M.build,tmins));
  q.ride=Math.round(ride+Math.max(0,stops.length-2));
  q.why=modeLocked(mode,stops);if(!q.why&&edit&&isBuilding('line:'+editId))q.why='This line is already being extended.';q.ok=!q.why;
  return q;
}
function orderLine(mode,stops,skip,editId){
  const q=lineQuote(mode,stops,editId);if(!q.ok){toast(q.why||'That line can’t be built.',null,null,'warn',5);return false}
  const edit=editId&&G.lines[editId],sk=(skip||[]).filter(n=>stops.slice(1,-1).includes(n));
  if(edit&&!q.mins){if(q.cost&&!buy(q.cost))return false;edit.stops=stops.slice();edit.skip=sk;R.ng=null;regionTick();toast(`${lineCode(edit)} now runs ${lineName(edit)}.`,null,null,'',5);return true}
  if(!canBuild()||!buy(q.cost))return false;
  const M=MODES[mode],lid=edit?edit.id:'L'+(G.lineSeq=(G.lineSeq||0)+1),num=edit?edit.num:nextNum(mode),col=edit?edit.col:M.cols[(num-1)%M.cols.length];
  const label=edit?`the ${M.L}${num} extension`:`${M.name.toLowerCase()} line ${M.L}${num}`;
  G.builds.push({id:'line:'+lid,label:label[0].toUpperCase()+label.slice(1),start:G.clock,done:G.clock+q.mins,mode,stops:stops.slice(),skip:sk,track:q.track,edit:edit?lid:null,lid,num,col});
  toast(`Work has started on ${label}. Ready in about ${Math.round(q.mins/60*10)/10} h.`,null,null,'',6);return true;
}
function finishLine(b){
  if(!b.stops)return;if(!G.infra)G.infra={};
  for(const eid of (b.track||[]))(G.infra[eid]||(G.infra[eid]={}))[b.mode]=1;
  const L=G.lines[b.lid];
  if(b.edit){if(L){L.stops=b.stops;L.skip=b.skip||[]}}
  else{const M=MODES[b.mode];G.lines[b.lid]={id:b.lid,mode:b.mode,stops:b.stops,skip:b.skip||[],freq:M.freqs[Math.min(1,M.freqs.length-1)],fare:1,night:false,sync:false,cars:0,freight:false,num:b.num,col:b.col}}
  R.ng=null;regionTick();
}
function closeLine(id){delete G.lines[id];G.builds=(G.builds||[]).filter(b=>b.id!=='line:'+id);if(R.regSel===id)R.regSel=null;R.ng=null;regionTick()}
/* saves from before the network: one line per corridor becomes a numbered line on real track */
const OLD_ROUTES={city:{mill:['air','mil','hbc'],exp:['air','hbs','hbc']},castle:{old:['air','ash','cas'],new:['air','cas']},docks:{road:['air','hbs','doc'],water:['air','hbs','doc']},east:{hill:['air','ano','fel','eas'],valley:['air','brk','eas']},low:{main:['air','low']}};
function oldRoute(cid,align,mode){const o=OLD_ROUTES[cid];if(!o)return null;let st=o[align]||Object.values(o)[0];if(mode==='metro'&&cid==='city')st=o.mill;if(mode==='water')st=o.water;if(cid==='docks'&&mode!=='water')st=o.road;return routeEdges(mode,st)?st:null}
function migrateLines(){
  for(const cid of Object.keys(G.lines||{})){const L=G.lines[cid];if(L&&L.stops)continue;delete G.lines[cid];if(!L||!MODES[L.mode])continue;const st=oldRoute(cid,L.align,L.mode);if(!st)continue;
    for(const {e} of routeEdges(L.mode,st))if(trackOf(L.mode))(G.infra[e.id]||(G.infra[e.id]={}))[L.mode]=1;
    const M=MODES[L.mode],id='L'+(G.lineSeq=(G.lineSeq||0)+1),num=nextNum(L.mode),fr=M.freqs.reduce((a,x)=>Math.abs(x-L.freq)<Math.abs(a-L.freq)?x:a,M.freqs[0]);
    G.lines[id]={id,mode:L.mode,stops:st,skip:L.exp||(cid==='city'&&L.align==='exp')?st.slice(1,-1):[],freq:fr,fare:L.fare??1,night:!!L.night,sync:!!L.sync,cars:L.cars||0,freight:!!L.freight,num,col:M.cols[(num-1)%M.cols.length]}}
  G.builds=(G.builds||[]).filter(b=>{if(!b.id.startsWith('line:')||b.stops)return true;const cid=b.id.slice(5),st=MODES[b.mode]&&oldRoute(cid,b.align,b.mode);if(!st)return false;
    const M=MODES[b.mode],lid='L'+(G.lineSeq=(G.lineSeq||0)+1),num=nextNum(b.mode);Object.assign(b,{id:'line:'+lid,lid,stops:st,skip:[],edit:null,num,col:M.cols[(num-1)%M.cols.length],track:(routeEdges(b.mode,st)||[]).filter(({e})=>trackOf(b.mode)&&!hasTrack(e,b.mode)).map(({e})=>e.id),label:`${M.name} line ${M.L}${num}`});return true});
}
const carsCost=L=>Math.round(MODES[L.mode].fix*1.5*((L.cars||0)+1));

function buildDev(plot,opt){
  const d=DEV[opt];if(!d||!has('dev:'+opt)||G.dev[plot]||isBuilding('dev:'+plot))return false;if(!canBuild())return false;if(!buy(d.cost))return false;
  G.builds.push({id:'dev:'+plot,label:d.name,start:G.clock,done:G.clock+buildMins(d.build),opt});
  toast(`Work has started on the ${d.name.toLowerCase()}. Ready in about ${Math.round(buildMins(d.build)/60*10)/10} hours.`,null,null,'',7);return true;
}
function finishDev(b){const plot=b.id.split(':')[1];G.dev[plot]=b.opt;scheduleEvent(plot);regionTick()}

