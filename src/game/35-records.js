/* ================= RECORDS, STAMPS AND WEEKLY CHALLENGES ================= */
const RECS=[
  ['dayPax','Busiest day',v=>`${num(v)} passengers`],['dayProfit','Best day',v=>money(v)],['dayOT','Most punctual day',v=>`${v}% on time`],
  ['streak','Longest on-time run',v=>`${v} departures`],['routes','Most destinations',v=>`${v} cities`],['rep','Highest rating',v=>`${v}`],
  ['riders','Busiest hour on public transport',v=>`${num(v)} riders`],['share','Best share against Lowmere',v=>`${v}%`]];
function setRec(k,v,show){const r=G.rec||(G.rec={});v=Math.round(v);if(!(v>(r[k]||0)))return false;const had=r[k]>0;r[k]=v;
  if(show&&had&&!R.sim){const d=RECS.find(x=>x[0]===k);toast(`Record: <b>${d[1]}</b>. ${d[2](v)}.`,null,null,'goal',5)}return had}
const railAir=()=>Object.values(G.lines||{}).some(L=>MODES[L.mode].kind==='rail'&&serves(L,'air'));
const STAMPS=[
  {id:'first',n:'First away',d:'Your first departure',c:'#FFC72C',t:()=>G.flights>=1},
  {id:'clock10',n:'Like clockwork',d:'10 on-time departures in a row',c:'#6BE39A',t:()=>G.bestStreak>=10},
  {id:'clock40',n:'Swiss watch',d:'40 on-time departures in a row',c:'#6BE39A',t:()=>G.bestStreak>=40},
  {id:'full',n:'Full house',d:'10 flights with every seat sold in one day',c:'#FF9F43',t:()=>(G.rec&&G.rec.fullDay||0)>=10},
  {id:'night',n:'Night owl',d:'15 departures between 23:00 and 05:00 in one day',c:'#5CC8FF',t:()=>(G.rec&&G.rec.nightDay||0)>=15},
  {id:'snow',n:'Snow day',d:'10 on-time departures in snow in one day',c:'#DCE6F2',t:()=>(G.rec&&G.rec.snowDay||0)>=10},
  {id:'stars',n:'Five stars',d:'A rating of 90',c:'#FFC72C',t:()=>G.rep>=90},
  {id:'k100',n:'Six figures',d:'100,000 passengers',c:'#ECE8DF',t:()=>G.flown>=1e5},
  {id:'m1',n:'A million flyers',d:'1,000,000 passengers',c:'#ECE8DF',t:()=>G.flown>=1e6},
  {id:'cash1m',n:'Millionaire',d:'$1 million in the bank',c:'#6BE39A',t:()=>G.cash>=1e6},
  {id:'rail',n:'Rail link',d:'Trains to the terminal',c:'#E8B04A',t:railAir},
  {id:'metro',n:'Underground',d:'A metro line',c:'#FF7AB6',t:()=>anyMode('metro')},
  {id:'hsr',n:'Two cities',d:'High-speed trains to Lowmere',c:'#F5D08A',t:()=>anyMode('hsr')},
  {id:'rings',n:'Around the world',d:'A route on every range, short-haul to ultra long-haul',c:'#5CC8FF',t:()=>[0,1,2,3,4].every(t=>Object.keys(G.routes||{}).some(c=>CITY[c]&&CITY[c].tier===t))},
  {id:'heavy',n:'Heavy metal',d:'Fly a widebody',c:'#909AA4',t:()=>G.fleet.some(f=>!f.sold&&AIRCRAFT[f.type].tier>=4)},
  {id:'cargo',n:'Forwarder',d:'$100,000 from cargo',c:'#D9A066',t:()=>(G.revBy.cargo||0)>=1e5},
  {id:'events',n:'Showtime',d:'Host five events',c:'#FF7AB6',t:()=>(G.evDone||0)>=5},
  {id:'crews',n:'Well rested',d:'A week of busy days without a crew delay',c:'#5CC8FF',t:()=>(G.rec&&G.rec.crewRun||0)>=7},
  {id:'won',n:'Route won',d:'Lowmere pulled out of a route',c:RIV,t:()=>!!(G.rival&&G.rival.cut)},
  {id:'home',n:'Home advantage',d:'75% of travellers on routes shared with Lowmere',c:RIV,t:()=>(G.rec&&G.rec.share||0)>=75},
  {id:'takeover',n:'Takeover',d:'Buy Lowmere Airport',c:RIV,t:()=>!!(G.rival&&G.rival.owned)},
  {id:'chal',n:'Challenger',d:'Finish a week’s three challenges',c:'#FFC72C',t:()=>(G.chal&&G.chal.sets||0)>=1},
  {id:'chal5',n:'Regular',d:'Finish five weeks of challenges',c:'#FFC72C',t:()=>(G.chal&&G.chal.sets||0)>=5},
  {id:'top',n:'Airport of the Year',d:'Reach the top level',c:'#FFC72C',t:()=>G.level>=LEVELS.length-1},
];
function checkStamps(){
  const st=G.stamps||(G.stamps={});let did=false;
  for(const S of STAMPS){if(st[S.id])continue;let ok=false;try{ok=S.t()}catch(e){}if(!ok)continue;st[S.id]=dayOf(G.clock);did=true;
    if(!R.sim)toast(`Stamp: <b>${S.n}</b>. ${S.d}.`,null,null,'goal',6)}
  if(did)awardChime();
}
// weekly challenges: sized from how your airport did last week
const CH_POOL=[
  {id:'pax',n:v=>`Fly ${num(v)} passengers`,m:()=>G.flown,min:200},
  {id:'ontime',n:v=>`${num(v)} on-time departures`,m:()=>G.ontime,min:10},
  {id:'shops',n:v=>`Take ${money(v)} in the shops`,m:()=>G.revBy.shops||0,min:100,need:()=>G.shops.some(Boolean)},
  {id:'biz',n:v=>`Fly ${num(v)} business travellers`,m:()=>G.bizFlown||0,min:50},
  {id:'transit',n:v=>`Earn ${money(v)} from public transport fares`,m:()=>G.revBy.transit||0,min:100,need:()=>Object.keys(G.lines||{}).length>0},
  {id:'cargo',n:v=>`Earn ${money(v)} from cargo`,m:()=>G.revBy.cargo||0,min:200,need:()=>(G.revBy.cargo||0)>0},
  {id:'dest',n:(v,c)=>`Fly ${num(v)} passengers to ${CITY[c].name}`,m:c=>rsOf(c).tp,min:60,city:1},
];
function chalDay(){
  if(SET().chal===false||G.level<1)return;
  const C=G.chal||(G.chal={wk:-1,list:[],snap:null,sets:0});const wk=Math.floor((G.day-1)/7);if(wk===C.wk)return;
  const prev=C.snap,days=Math.max(1,G.day-(C.start||1)),n=C.wk<0?Math.max(1,G.day-1):days,snap={};
  const pool=CH_POOL.filter(p=>!p.need||p.need()),pick=[];
  while(pick.length<3&&pool.length){pick.push(pool.splice(Math.floor(rnd()*pool.length),1)[0])}
  C.list=pick.map(p=>{let c=null;if(p.city){const cs=Object.keys(G.routes||{}).filter(k=>CITY[k]&&rsOf(k).tn>5).sort(()=>rnd()-0.5);c=cs[0];if(!c)return null}
    const now=p.city?p.m(c):p.m(),before=prev&&prev[p.id+(c||'')]!=null?prev[p.id+(c||'')]:null,per=before!=null?(now-before)/n:now/Math.max(1,G.day-1);
    const goal=Math.max(p.min,Math.round(per*7*(p.city?1.15:1.12)/10)*10);return {id:p.id,c,goal,base:now,done:0}}).filter(Boolean);
  for(const p of CH_POOL){if(p.city)for(const k of Object.keys(G.routes||{}))snap[p.id+k]=p.m(k);else snap[p.id]=p.m()}
  C.wk=wk;C.start=G.day;C.snap=snap;C.all=0;
  const ds=(G.days||[]).slice(-7),pr=ds.length?ds.reduce((a,x)=>a+Math.max(0,x.p),0)/ds.length:G.rate*60*12;C.pay=Math.max(100,Math.round(pr*0.12/50)*50);
  if(!R.sim)toast('New weekly challenges are in the Office.',[{label:'Show',fn:()=>goTo('office','#chal')},{label:'Later',fn:()=>{}}],'chal','',12);
}
clock(DAY,'chalDay',1,0,chalDay);
function chalProg(x){const p=CH_POOL.find(q=>q.id===x.id);return Math.max(0,(x.c?p.m(x.c):p.m())-x.base)}
function checkChal(){
  const C=G.chal;if(!C||!C.list||SET().chal===false)return;let did=false;
  for(const x of C.list){if(x.done||chalProg(x)<x.goal)continue;x.done=1;earn(C.pay,'bonus');did=true;
    if(!R.sim)toast(`Challenge done: ${CH_POOL.find(q=>q.id===x.id).n(x.goal,x.c)}. +${money(C.pay)}`,null,null,'goal',6)}
  if(!C.all&&C.list.length===3&&C.list.every(x=>x.done)){C.all=1;C.sets=(C.sets||0)+1;did=true;
    if(TECH.some(T=>!G.tech[T.id])){G.pts=(G.pts||0)+1;renderPlanBtn()}else earn(C.pay*2,'bonus');
    if(!R.sim)toast(`All three challenges done this week. <b>${TECH.some(T=>!G.tech[T.id])?'+1 plan point':'+'+money(C.pay*2)}</b>`,null,null,'goal',8)}
  if(did)awardChime();
}
// daily records, from yesterday's figures
function recordsDay(s){
  if(!s||!s.flights)return;
  setRec('dayPax',s.pax,true);setRec('dayProfit',s.rev-s.cost,true);if(s.flights>=10)setRec('dayOT',s.ontime/s.flights*100,true);
  const r=G.rec;r.fullDay=Math.max(r.fullDay||0,dayVal(s,'full'));r.nightDay=Math.max(r.nightDay||0,dayVal(s,'night'));r.snowDay=Math.max(r.snowDay||0,dayVal(s,'snowOT'));
  r.crewRunCur=dayVal(s,'crewDl')===0&&s.flights>=20?(r.crewRunCur||0)+1:0;r.crewRun=Math.max(r.crewRun||0,r.crewRunCur);
  {const mx=rivMix();if(mx!=null)setRec('share',mx*100,true)}
}
clock(DAY,'recordsDay',1,0,recordsDay);
function recordsHour(){setRec('streak',G.bestStreak);setRec('routes',nRoutes());setRec('rep',G.rep);if(R.reg)setRec('riders',R.reg.riders||0);checkStamps();checkChal()}
clock(HOUR,'recordsHour',60,0,recordsHour);
// this week's challenges, under the goals on Office › Progress
function chalPanel(){
  let h='';const C=G.chal;
  if(SET().chal!==false){h+=`<div class="sec" id="chal">This week’s challenges<span>${C&&C.list&&C.list.length?`${7-((G.day-1)%7)} day${7-((G.day-1)%7)===1?'':'s'} left`:''}</span></div>`;
    if(!C||!C.list||!C.list.length)h+=`<p class="note">${G.level<1?'Challenges start when you become a Local Airport.':'New challenges arrive at the start of the next game day.'}</p>`;
    else{h+=C.list.map(x=>{const p=CH_POOL.find(q=>q.id===x.id),v=chalProg(x);return `<div class="lreq chal${x.done?' done':''}"><span>${x.done?'✓ ':''}${p.n(x.goal,x.c)}</span><span class="live"><b>${num(Math.min(v,x.goal))}</b> / ${num(x.goal)}</span><div class="prog"><i style="width:${clamp(v/x.goal,0,1)*100}%;background:${x.done?'var(--good)':'var(--sign)'}"></i></div></div>`}).join('');
      h+=`<p class="note">Each pays ${money(C.pay)}. Finish all three for ${TECH.some(T=>!G.tech[T.id])?'a plan point':'a bonus'}.</p>`}}
  return h;
}
function recordsPanel(){
  let h='';const r=G.rec||{};h+=`<div class="sec">Records</div><table class="fin rec">${RECS.filter(([k])=>r[k]>0).map(([k,n,f])=>`<tr><td>${n}</td><td>${f(r[k])}</td></tr>`).join('')||'<tr><td>Finish a day to set your first records.</td><td></td></tr>'}</table>`;
  const st=G.stamps||{},got=STAMPS.filter(S=>st[S.id]),left=STAMPS.length-got.length;
  h+=`<div class="sec">Stamps<span>${got.length} of ${STAMPS.length}</span></div><div class="stamps">${got.map((S,i)=>`<div class="stamp" style="--c:${S.c};--r:${((i*37)%13)-6}deg" title="${S.d}"><b>${S.n}</b><span>${S.d}</span><i>Day ${st[S.id]}</i></div>`).join('')}</div>${left?`<p class="note">${left} more to find.</p>`:''}`;
  return h;
}
