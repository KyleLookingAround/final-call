/* ================= construction, levels, days ================= */
const buildSlots=()=>1+G.lv.crews;
const buildMins=m=>m*Math.pow(0.8,G.lv.crews);
const isBuilding=id=>(G.builds||[]).some(b=>b.id===id);
const buildOf=id=>(G.builds||[]).find(b=>b.id===id);
function canBuild(){if(G.builds.length>=buildSlots()){toast(`Crews are busy with ${G.builds.map(b=>b.label).join(' and ')}. Wait, or hire more crews (Airfield › Projects).`,null,null,'warn',7);return false}return true}
function startBuild(id,label,mins){const m=buildMins(mins);G.builds.push({id,label,start:G.clock,done:G.clock+m});toast(`Construction of ${label} has started. Ready in about ${Math.round(m/60*10)/10} hours.`,null,null,'',7)}
function updateBuilds(){
  let ch=false;
  for(const b of G.builds){if(G.clock>=b.done){b.fin=true;ch=true;finishBuild(b)}}
  if(ch){G.builds=G.builds.filter(b=>!b.fin);if(!R.sim)renderPanel()}
}
function freeAircraft(){return G.fleet.findIndex((f,j)=>!f.sold&&!G.stands.some(s=>s.built&&s.ac===j))}
function finishBuild(b){
  const [kind,arg]=b.id.split(':');
  if(kind==='stand'){const i=+arg;G.stands[i].built=true;if(!R.sim){renderBoard();renderCam()}}
  else if(kind==='pier')G.pierB=true;
  else if(kind==='up')G.lv[arg]=Math.min(UPG[arg].max,G.lv[arg]+1);
  else if(kind==='line')finishLine(b);
  else if(kind==='dev')finishDev(b);
  else if(kind==='layout'){layoutReady(arg);return}
  else if(kind==='lounges')G.lounges=true;
  toast(`${b.label} is finished.`,null,null,'goal',7);fanfare();
}
function levelChecks(n){
  const q=LEVELS[n].req,out=[['Passengers flown',G.flown,q.pax,true],['Rating',Math.round(G.rep),q.rep],['Gates open',gatesOpen(),q.gates]];
  if(q.daily)out.splice(1,0,['Passengers in the last 24 hours',dailyPax(),q.daily,true]);
  return out;
}
const LVL_PTS=n=>[0,6,5,5,6,5,5,5,5,5][n]||0;
function unlocksAt(n){
  const out=[`${LVL_PTS(n)} plan points`];
  STAND.forEach((s,i)=>{if(i>0&&s.lvl===n)out.push('Gate '+GATES[i])});
  if(PIER.lvl===n)out.push('Pier B');
  if(n===1)out.push('the region map');
  const nodes=TECH.filter(T=>T.t===n);if(nodes.length)out.push(`${nodes.length} new plan${nodes.length>1?'s':''} (${nodes.map(T=>T.n).slice(0,3).join(', ')}${nodes.length>3?'…':''})`);
  if(n>0&&CAPFRAC[n]>CAPFRAC[n-1])out.push('more upgrade levels');
  return out;
}
function checkLevel(){
  const n=G.level+1;if(!LEVELS[n])return;
  if(levelChecks(n).every(([_,v,t])=>v>=t)){
    G.level=n;earn(LEVELS[n].reward,'bonus');G.pts=(G.pts||0)+LVL_PTS(n);
    {const nt=new Set(G.newTabs||[]);nt.add('office');if(STAND.some(x=>x.lvl===n)||PIER.lvl===n)nt.add('stands');if(n===1)nt.add('region');G.newTabs=[...nt]}
    if(!R.sim){if(!lvlUp(n))toast(`Now ${aL(n,1)}! +${money(LEVELS[n].reward)} and <b>${LVL_PTS(n)} plan points</b> to spend.`,[{label:'Open the Masterplan',fn:()=>openPlan()},{label:'Later',fn:()=>{}}],null,'goal',14);fanfare();
      renderTabs();renderPanel();$('#lvlName').textContent=LEVELS[n].name;renderPlanBtn()}
  }
}
function dayTick(){
  const d=dayOf(G.clock);if(d===G.day)return;
  const s=G.dstat;
  if(s&&s.flights>0){
    const profit=s.rev-s.cost;G.lastDay={day:G.day,...s,profit};
    (G.days||(G.days=[])).push({d:G.day,pax:s.pax,arr:s.arr,fl:s.flights,ot:s.ontime,p:Math.round(profit),rep:Math.round(G.rep),rt:Object.keys(G.routes||{}).length,rd:R.reg?Math.round(R.reg.riders||0):0,lv:G.level});if(G.days.length>40)G.days.shift();
    toast(`Day ${G.day} report: ${num(s.pax)} passengers departed and ${num(s.arr)} arrived, ${s.ontime}/${s.flights} flights on time, profit ${money(profit)}.`,null,null,profit>=0?'goal':'warn',12);
  }
  if(s&&s.flights>=3)G.otp=G.otp==null?s.ontime/s.flights:G.otp*0.6+0.4*s.ontime/s.flights;
  recordsDay(s);
  G.day=d;G.dstat={pax:0,arr:0,flights:0,ontime:0,rev:0,cost:0,rep0:G.rep};regionDay();rivalDay();chalDay();for(const f of TERM_DAY)f();
  const sea=seasonOf(d),prev=seasonOf(d-1);
  if(sea!==prev)toast(sea.name==='Winter'?'Winter: ski and winter-sun routes are busiest. Expect snow; de-icing pads keep turnarounds moving.':sea.name==='Summer'?'Summer holidays: beach cities and families fill flights. Ski routes go quiet.':`${sea.name} is here.`,null,null,'',9);
}

