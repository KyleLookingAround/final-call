/* ================= AIRLINE OPERATIONS: crews on duty limits, overnight checks, delays at the far end ================= */
const CREW_DUTY=600,CREW_REST=720;
const crewFee=()=>Math.round(10+18*G.level*G.level),crewWage=()=>0.6*G.level*G.level;
const crewTarget=()=>{const n=G.fleet.filter(f=>!f.sold).length;return Math.ceil(n*1.3)+(n>=3?1:0)};
const mkCrew=at=>({free:at,back:at,duty:0,res:0});
function crewState(){let fly=0,rest=0,ready=0;for(const c of G.crews){if(c.res||c.back>G.clock)fly++;else if(c.free>G.clock)rest++;else ready++}return {fly,rest,ready,n:G.crews.length}}
// a rested crew for the next departure, reserved until push-back
// the crew already on duty that still has time for this trip, so rest periods stay staggered; otherwise the freshest
function pickCrew(trip){let fit=null,fresh=null;for(const c of G.crews){if(c.res&&G.clock-c.res>180)c.res=0;if(c.res||c.free>G.clock)continue;if(G.clock-c.free>=CREW_REST)c.duty=0;
  if(c.duty+trip<=CREW_DUTY&&(!fit||c.duty>fit.duty))fit=c;if(!fresh||c.duty<fresh.duty)fresh=c}
  const b=fit||fresh;if(b)b.res=G.clock||1;return b}
function crewReady(i,F){
  if(F.partner||F.crew)return true;
  const c=pickCrew(TRIP[(CITY[F.city]||F.ac).tier]);if(c){F.crew=c;return true}
  if(!F.crewWait){F.crewWait=G.clock;toW(i,0,CABIN_TOP-24);floater('CREW DELAY',WP.x,WP.y,'#FF7A8A',true);if(G.dstat)G.dstat.crewDl=(G.dstat.crewDl||0)+1;if(SET().autoCrews!==false)hireCrew(true)}
  return false;
}
function crewAway(F,back){const c=F.crew;if(!c)return;c.res=0;c.back=back;c.duty+=back-G.clock;if(c.duty>=CREW_DUTY-50){c.free=back+crewRest(back);c.duty=0}else c.free=back+10}
function hireCrew(quiet){const fee=crewFee();if(G.cash<fee)return false;spend(fee,'costs');G.crews.push(mkCrew(G.clock+(quiet?30:20)));if(!quiet&&!R.sim)toast(`Crew hired. They report for duty in 20 min.`,null,null,'goal',4);return true}
function releaseCrew(){const k=G.crews.findIndex(c=>!c.res&&c.back<=G.clock);if(k<0||G.crews.length<=1)return false;G.crews.splice(k,1);return true}
function crewTick(){ // the fleet manager keeps enough crews for the fleet
  if(SET().autoCrews===false)return;const t=crewTarget();
  while(G.crews.length<t&&G.cash>=crewFee()*2)hireCrew(true);
  if(G.crews.length>t+2)releaseCrew();
}
// knock-on: weather and slots at the far end can bring a plane back late
function farDelay(C){const w=seasonOf(dayOf(G.clock)).name==='Winter',p=(0.05+0.02*C.tier+(w?0.05:0))*(has('feat:occ')?0.5:1);if(rnd()>=p)return 0;return Math.round((10+rnd()*35*(1+0.25*C.tier))*(has('feat:occ')?0.6:1))}
// overnight checks: at 03:00 planes parked at base are serviced
function nightChecks(){
  if(!pol('checks'))return;const due=G.fleet.filter(f=>!f.sold&&f.st==='base'&&(f.wear||0)>=4);if(!due.length)return;
  const k=0.8*(1-0.1*G.lv.hangar);let cost=0,n=0;for(const f of due){const c=Math.round(serviceCost(f)*k);if(G.cash<c)break;spend(c,'costs');cost+=c;f.wear=0;n++}
  if(n&&!R.sim){toW(0,200,CABIN_TOP-70);floater(`OVERNIGHT CHECKS · ${n} PLANE${n>1?'S':''} · ${money(cost)}`,WP.x,WP.y,'#5CC8FF',true)}
  if(G.dstat)G.dstat.checks=(G.dstat.checks||0)+n;
}
function crewPanel(){
  const s=crewState(),t=crewTarget(),auto=SET().autoCrews!==false;
  return `<div class="sec">Crews<span>wages ${money(s.n*crewWage())} an hour</span></div>
    <div class="lstats fl4" style="grid-template-columns:repeat(4,1fr)"><div><b>${s.n}</b><span>crews</span></div><div><b>${s.fly}</b><span>flying</span></div><div><b>${s.rest}</b><span>resting</span></div><div><b style="color:${s.ready?'':'var(--bad)'}">${s.ready}</b><span>ready</span></div></div>
    <p class="note">Each departure of your own plane needs a rested crew. After about 10 hours on duty a crew rests for 12. No crew free means a crew delay.${auto?` The fleet manager keeps about ${t} crews for your fleet.`:''}</p>
    <div class="chips"><button class="chip" data-crewhire="1" data-cost="${crewFee()}">Hire a crew <small>${money(crewFee())}</small></button>${s.n>1?`<button class="chip" data-crewrel="1">Release one</button>`:''}<button class="chip${auto?' on':''}" data-setq="autoCrews">${auto?'✓ ':''}Auto crews</button></div>`;
}
