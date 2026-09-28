/* ================= late runners, and a passenger's story ================= */
// Final call comes 12 minutes before departure while the plane boards, when shops send their last browsers out and
// security stops searching bags (46-market.js, 43-departures.js), or sooner once nearly everyone else is aboard. From
// then anyone of that flight still walking to the gate runs.
// Once everyone else is seated after the departure time, the gate holds a little for runners who started before it,
// then closes its door on them; the board shows GATE CLOSING while they run. Latecomers who reach the airside after the
// departure time run too, but the gate waits for them as it always has.
// Every departing passenger also has a story, told by a card when tapped: who they are, where they've been today and
// how they feel about it. Runners and stories are runtime only, kept off the passengers themselves (WeakMaps), so the
// passengers keep their one shape (05-flights.js seatPax) and nothing is saved.
const RUN_AT=12,RUN_CLOSING=5,RUN_MUL=1.8,RUN_PRM=1.2,RUN_TOP=280,RUN_MISS=-0.6; // minutes before departure; pace (top: the best walking pace, so the drawn catch-up stays under the movement check's 330); rating
const RUN_HOLD={wait:3,close:1}; // minutes the gate holds for runners once the rest are seated, by the Late passengers policy
const DAWDLE=0.05,LINGER=15,LINGER_MKT=40,FC_LEFT=3; // odds a shopper browses on past the gate call, for up to LINGER minutes more; final call comes early with this many others left to board
const TALES=new WeakMap(),RUNS=new WeakMap(); // passenger → their story; flight → its runners {list, n (can miss), holdAt}
const RUN_LOG={started:0,boarded:0,missed:0}; // what the checks read
Object.assign(REPWHY,{runner:['passengers who ran for their gate and missed it',['walkway','mover'],' Calling gates earlier (Office › Policies) gives shoppers more time.']});REPLBL.runner='Runners who missed their flight';

/* ---------- a passenger's story: what happened to them, noted as they finish each walk ---------- */
// how they came: read from where walkIn put them, before their first step (07-passengers.js, 28-region-weather.js)
function howCame(p){
  if(p.hotel==='early')return 'hotel';if(p.xferred)return 'xfer';if(p.state!=='walkIn')return null;
  const y=p.y-LAND_DY;
  return Math.abs(y-712)<6?'train':Math.abs(y-792)<6?'tram':Math.abs(y-640)<6?'bus':p.x>=340&&y>=680?'car':'drop';
}
function tale(p){let t=TALES.get(p);if(!t){t={how:howCame(p),ev:[],mood:0,run:0,ci:null,sq:null};if(t.how)t.ev.push([G.clock,'came',t.how,0]);TALES.set(p,t)}return t}
function note(p,k,a,m){const t=tale(p);t.ev.push([G.clock,k,a,m||0]);t.mood=clamp(t.mood+(m||0),-4,4);if(t.ev.length>14)t.ev.splice(1,1)}
const waitMood=(w,ok,bad)=>w>=bad?-1.5:w>=ok?-0.5:0.3;
// wrap a walking step: fn runs when the passenger has just left it (a cheap check on each step, nothing for waiters)
function onLeave(s,fn){const f=PAX_STEP[s];PAX_STEP[s]=(p,dt,D)=>{f(p,dt,D);if(p.state!==s)fn(p)}}
{const f=PAX_STEP.walkIn;PAX_STEP.walkIn=(p,dt,D)=>{if(!TALES.has(p))tale(p);f(p,dt,D);if(p.state!=='walkIn')tale(p).ci=G.clock}}
onLeave('bpGate',p=>{const t=tale(p),w=t.ci==null?0:Math.max(0,Math.round(G.clock-t.ci-0.5)),k=p.online&&!p.checked?'online':p.isl===CI_K?'kiosk':p.isl===CI_B?'drop':'desk';note(p,'ci',k,k==='online'?0.3:waitMood(w,8,18));t.ev[t.ev.length-1].push(w)});
onLeave('bpTap',p=>{tale(p).sq=G.clock});
const cleared=p=>{if(!p.cleared)return;const t=tale(p),w=t.sq==null?0:Math.max(0,Math.round(G.clock-t.sq));note(p,'sec',w,waitMood(w,8,16))};
onLeave('repack',p=>{if(p.state==='srchQ')note(p,'srch',0,-0.7);else cleared(p)});
onLeave('secOut',cleared);
onLeave('toShop',p=>{if(p.state==='shop'&&G.shops[p.shop])note(p,'shop',SHOPS[G.shops[p.shop].type].id,0.8)});
onLeave('toMkt',p=>{if(p.state!=='mkt')return;const t=tale(p),e=t.ev[t.ev.length-1];if(e&&e[1]==='mkt'&&e[2]===p.act)return;note(p,'mkt',p.act,p.act==='wc'?0:p.sl<0?-0.3:0.4)});

/* ---------- runners ---------- */
function runsOf(F){let r=RUNS.get(F);if(!r){r={list:[],n:0,holdAt:null,called:false,fc:false,daw:[]};RUNS.set(F,r)}return r}
function startRun(p,t,F){
  t.run=G.clock<F.std?1:2;const r=runsOf(F);r.list.push(p);if(t.run===1)r.n++;RUN_LOG.started++;note(p,'run',p.stand,-1);
}
function endRun(p,t,how){const r=RUNS.get(p.F),k=r?r.list.indexOf(p):-1;if(k>=0){r.list.splice(k,1);if(t.run===1)r.n--}t.run=how}
const runPace=(p,D)=>{const v=D.cwalk*p.spd*walkMul(p),m=p.type==='prm'?RUN_PRM:RUN_MUL;return Math.max(v,Math.min(v*m,RUN_TOP))};
// to the gate: at a walk, or at a run after final call
{const f=PAX_STEP.toGate;PAX_STEP.toGate=(p,dt,D)=>{
  const F=p.F; // only a late shopper can be called before the last 12 minutes, so only they need the flight's runners looked up
  if((G.clock>=F.std-RUN_AT||p.late&&(RUNS.get(F)?.fc||TALES.get(p)?.run))&&F.plane.state==='boarding'){const t=tale(p);if(!t.run)startRun(p,t,F);
    if(t.run<3){if(walk(p,runPace(p,D),dt)){p.state='gate';PAX_STEP.gate(p,0);endRun(p,t,3);RUN_LOG.boarded++;note(p,'gate',p.stand,1.2)}return}}
  f(p,dt,D);if(p.state!=='toGate'){const t=TALES.get(p);if(t&&(t.run===1||t.run===2))endRun(p,t,3);if(p.state==='gate')note(p,'gate',p.stand,0.2)}
}}
// a runner the gate closed on walks slowly back to the market place and leaves the airport's books
PAX_STEP.missed=(p,dt,D)=>{if(walk(p,D.cwalk*p.spd*0.6,dt))p.dead=true};
function missRun(p,i){
  const t=tale(p),F=p.F;endRun(p,t,4);RUN_LOG.missed++;note(p,'miss',i,-3);
  if(p.spot>=0){R.st[i].spots[p.spot]=null;p.spot=-1}
  F.booked--;repAdj(RUN_MISS,'runner',i);
  const [x0,y0,x1,y1]=mktBox();p.state='missed';p.tx=x0+40+p.rand*(x1-x0-80);p.ty=(y0+y1)/2;route(p,hallId('mkt'));
}
// When a gate is called, a few of its passengers in the shops lose track of time and browse on until final call, when
// the shop sends them out (46-market.js, p.late): they're the runners. A look over the passengers once per call.
function dawdle(F){
  if(G.level<1)return; // not on the first morning: a new airport's first departures go on time
  const d=runsOf(F).daw,lead=new Set(),stay=p=>{const x=Math.max(0,Math.min(F.std-G.clock,p.t+LINGER)-p.t);p.late=true;p.t+=x;p.t0+=x;d.push(p)}; // a longer visit, and a full spend for it
  // or sits on in the market place, holding no seat or shop spot, until final call (state linger)
  const sit=p=>{p.state='linger';p.late=true;p.sl=-1;p.t=G.clock+LINGER_MKT;R.occOut=true;d.push(p);note(p,'linger',p.act,0.3)},on=p=>p.state==='shop'?stay(p):sit(p);
  for(const p of R.pax)if(p.F===F&&(p.state==='shop'||p.state==='mkt')&&!p.late&&!p.inbound&&!p.leader&&!p.kid&&rnd()<DAWDLE){on(p);lead.add(p)}
  if(lead.size)for(const p of R.pax)if(p.leader&&lead.has(p.leader)&&(p.state==='shop'||p.state==='mkt')&&!p.late)on(p); // a party dawdles together
}
PAX_STEP.linger=p=>{const F=p.F;if(G.clock>=F.std-RUN_AT&&F.plane.state==='boarding'||F.plane.state==='closing')toGate(p);else if(G.clock>=p.t){if(F.plane.state==='boarding')startRun(p,tale(p),F);toGate(p)}}; // an early final call sends them too; after LINGER_MKT they remember, and run if it's boarding
// Final call: 12 minutes before departure, or sooner once all but a few are aboard, so dawdlers never hold a plane that
// would otherwise leave early. Then the dawdlers leave their shops and run.
function finalCall(F,r){
  if(r.fc||F.plane.state!=='boarding')return;if(r.daw.length)r.daw=r.daw.filter(p=>(p.state==='shop'||p.state==='linger')&&p.F===F);
  if(G.clock<F.std-RUN_AT&&!(r.daw.length&&F.seated>=F.booked-r.daw.length-FC_LEFT))return;
  r.fc=true;for(const p of r.daw)if(p.F===F){if(p.state==='shop')leaveShop(p);else if(p.state==='linger')toGate(p)}r.daw.length=0;
}
// every game minute: the gates just called, then, once everyone else is seated after the departure time, hold the gate
// and close it on the runners
TERM_MINUTE.push(()=>{
  for(const i of SIDX){const F=R.st[i].F;if(!F||F.freighter)continue;const r=runsOf(F);
    if(!r.called&&F.called!=null){r.called=true;if(G.clock-F.called<1.5)dawdle(F)}
    finalCall(F,r);
    if(!r.n)continue;
    if(F.plane.state!=='boarding'||G.clock<F.std||F.manifest.length||F.straggler||F.seated<F.booked-r.n){r.holdAt=null;continue}
    if(r.holdAt==null)r.holdAt=G.clock;
    if(G.clock-r.holdAt<(RUN_HOLD[pol('late')]??RUN_HOLD.wait))continue;
    const gone=r.list.filter(p=>tale(p).run===1&&p.state==='toGate');for(const p of gone)missRun(p,i);
    toW(i,0,CABIN_TOP-24);floater('GATE CLOSED',WP.x,WP.y,'#FF7A8A',true);r.holdAt=null;
  }
});
BOARD_STATUS.push(F=>{const r=RUNS.get(F);return r&&r.n&&G.clock>=F.std-RUN_CLOSING?'GATE CLOSING':null}); // only while the gate may close on someone

/* ---------- drawing: speed lines behind each runner, and a ring on the passenger whose story is open ---------- */
LAYER.pax.push(()=>{
  ctx.strokeStyle='rgba(255,199,44,.55)';ctx.lineWidth=1;
  for(const i of SIDX){const F=R.st[i].F,r=F&&RUNS.get(F);if(!r||!r.list.length)continue;
    for(const p of r.list){if(p.ex==null||paxHidden(p))continue;const dx=p.x-p.ex,dy=p.y-p.ey,d=Math.hypot(dx,dy);if(d<0.3)continue;const ux=dx/d,uy=dy/d;
      ctx.beginPath();for(const o of [-2,2]){const sx=p.ex-ux*5-uy*o,sy=p.ey-uy*5+ux*o;ctx.moveTo(sx,sy);ctx.lineTo(sx-ux*6,sy-uy*6)}ctx.stroke()}}
  const s=R.story;if(s&&!R.photo&&!s.p.dead&&s.p.ex!=null&&!paxHidden(s.p)){ctx.strokeStyle='#FFC72C';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(s.p.ex,s.p.ey,6.5,0,Math.PI*2);ctx.stroke()}
});

/* ---------- the story card ---------- */
// names and flavour come from the passenger's own rand, so they cost no rnd() and change nothing in the game
const TALE_FIRST=['Alex','Sam','Priya','Tom','Aisha','Jamie','Olu','Maria','Ben','Chloe','Ravi','Ellie','Kwame','Sophie','Dan','Nadia','Owen','Grace','Luca','Fatima','Harry','Mei','Rory','Ines','Callum','Zara','Joe','Hannah','Tariq','Lily','Finn','Amara'];
const TALE_LAST=['Patel','Jones','Okafor','Walsh','Hughes','Khan','Murphy','Evans','Novak','Reid','Clarke','Silva','Byrne','Shaw','Ahmed','Price','Kowalski','Doyle','Hart','Singh'];
const TALE_HOME=['mil','hbc','old','hbs','doc','cas','ash','fel','eas','brk'];
const TALE_WHY={work:['a meeting','a conference','a site visit','a pitch'],lei:['a holiday','a city break','a friend’s birthday','a week of sun'],
  fam:['a family holiday','a visit to the grandparents','half-term by the sea'],grp:['a stag weekend','a hen weekend','a wedding','a football trip'],prm:['a visit to family','a long-planned holiday']};
const TALE_SHOP={coffee:'a coffee at the Coffee cart',books:'a browse in News & books',cafe:'lunch at the Café',bar:'a drink at the Bar',duty:'a look round Duty free',
  lounge:'the Business lounge',dining:'a proper meal at the Restaurant',luxury:'the Luxury boutique',spa:'a shower at the Spa'};
const TALE_ACT={play:'played in the play area',playB:'watched the children play',food:'sat in the food court',charge:'charged a phone',window:'watched the planes from the window',seats:'found a seat',wc:'queued for the toilets'};
const TALE_HOW={train:'Came by train',tram:'Came by tram',bus:'Came by bus',car:'Parked in the car park',drop:'Dropped off at the door',hotel:'Stayed at the airport hotel',xfer:'Landed on a connecting flight'};
const pick=(a,p,k)=>a[Math.floor(((p.rand*9973*(k+1))%1)*a.length)];
function whoIs(p){
  const n=Math.floor(p.rand*1e6),first=TALE_FIRST[n%TALE_FIRST.length],last=TALE_LAST[Math.floor(n/37)%TALE_LAST.length],F=p.F,t=tale(p);
  const home=t.how==='xfer'?null:NODES[TALE_HOME[Math.floor(n/7)%TALE_HOME.length]].n,why=p.kid?'a family trip':pick(TALE_WHY[p.type]||TALE_WHY.lei,p,1);
  return {name:first+(p.kid?'':' '+last),first,home,to:F.dest[1],why,kid:p.kid};
}
function moodOf(m){return m>=2?['Delighted','#6BE39A']:m>=0.8?['Happy','#6BE39A']:m>-0.8?['Fine','#ECE8DF']:m>-2.5?['Fed up','#FFC72C']:['Furious','#FF7A8A']}
// the day as lines with times, and as a few sentences
function taleLines(p){
  const t=tale(p),F=p.F,out=[];
  for(const [c,k,a,m,w] of t.ev){
    const s=k==='came'?TALE_HOW[a]:k==='ci'?(a==='online'?'Checked in online':`Checked in at ${a==='kiosk'?'a kiosk':a==='drop'?'bag drop':'a desk'}`+(w>1?`, ${w} min queue`:'')):
      k==='sec'?`Through security`+(a>1?`, ${a} min queue`:''):k==='srch'?'Bag searched at security':k==='shop'?TALE_SHOP[a][0].toUpperCase()+TALE_SHOP[a].slice(1):
      k==='mkt'?TALE_ACT[a][0].toUpperCase()+TALE_ACT[a].slice(1):k==='linger'?'Lost track of time as the gate was called':k==='run'?`Final call: ran for gate ${GATES[a]}`:k==='gate'?`At gate ${GATES[a]}`+(t.run===3?', just in time':''):
      k==='miss'?`Gate ${GATES[a]} closed. Missed the flight`:k==='board'?'On board':null;
    if(s)out.push([c,s]);
  }
  if(F.called!=null&&t.ev.length&&F.called>=t.ev[0][0])out.push([F.called,`Gate ${GATES[p.stand]} called`]);
  out.sort((a,b)=>a[0]-b[0]);return out.slice(-8);
}
function taleText(p,w){
  const t=tale(p),e=k=>t.ev.find(x=>x[1]===k),S=[];
  S.push(`${w.name} is flying to ${w.to} for ${w.why}${w.home?`, from ${w.home}`:''}.`);
  const ci=e('ci'),sec=e('sec'),shop=e('shop'),srch=e('srch');
  if(sec&&sec[2]>=12)S.push(`Security took ${sec[2]} minutes${srch?', and then a bag search':''}, which didn’t help.`);
  else if(ci&&ci[4]>=12)S.push(`The check-in queue took ${ci[4]} minutes.`);
  else if(sec||ci)S.push(srch?'A bag search held things up at security.':'Check-in and security went smoothly.');
  if(shop)S.push(`${TALE_SHOP[shop[2]][0].toUpperCase()+TALE_SHOP[shop[2]].slice(1)} lifted the mood.`);
  if(t.run===4)S.push('Then came the final call, a run for the gate, and a door closing just ahead. Not a good day.');
  else if(t.run===3)S.push('Then came the final call and a sprint for the gate. Made it, just.');
  else if(t.run)S.push('The final call has gone, and they’re running.');
  else if(p.state==='gate'&&p.spot<0)S.push('No seat at the gate, so they’re standing.');
  return S.join(' ');
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function storyHTML(p){
  const w=whoIs(p),t=tale(p),m=t.mood+(p.state==='gate'&&p.spot<0?-0.5:0),[mw,mc]=moodOf(m),F=p.F;
  const lines=taleLines(p).map(([c,s])=>`<li><b>${hhmm(c)}</b>${esc(s)}</li>`).join('');
  return `<button class="pcx" data-pcx aria-label="Close">×</button><div class="pch"><b>${esc(w.name)}</b><span class="pcm" style="color:${mc};border-color:${mc}">${mw}</span></div>`+
    `<div class="pcs">${esc(F.code+F.no)} to ${esc(w.to)} · gate ${GATES[p.stand]} · ${hhmm(F.std)}</div>`+(lines?`<ol class="pct">${lines}</ol>`:'')+`<p>${esc(taleText(p,w))}</p>`;
}
let storyEl=null;
function openStory(p){
  R.story={p,html:''};
  if(!storyEl){storyEl=document.createElement('div');storyEl.className='paxcard';storyEl.id='paxcard';storyEl.setAttribute('role','dialog');storyEl.setAttribute('aria-label','Passenger');
    storyEl.addEventListener('click',e=>{if(e.target.closest('[data-pcx]'))closeStory()});$('#stage').appendChild(storyEl)}
  storyEl.hidden=false;$('#stage').classList.add('story');refreshStory();
}
function closeStory(){R.story=null;if(storyEl){storyEl.hidden=true;$('#stage').classList.remove('story')}}
function refreshStory(){
  const s=R.story;if(!s||!storyEl)return;if(R.view!=='airport'){closeStory();return}
  const p=s.p,t=tale(p),st=p.state;if(!p.dead&&!R.pax.includes(p)){closeStory();return} // a load or a new gameif((st==='bridge'||st==='aisle'||st==='sitting'||p.dead)&&!t.ev.some(e=>e[1]==='board'))t.ev.push([G.clock,'board',0,0.5]); // noticed here, for the one passenger shown
  const h=storyHTML(p);if(h!==s.html){s.html=h;storyEl.innerHTML=h}
}
setInterval(refreshStory,400); // cosmetic: the open card keeps up with its passenger
// a tap on the airport view: the nearest departing passenger in reach opens their story; any other tap closes it
const TAP_OUT=new Set(['aisle','sitting','bridge','missed']);
PAX_TAP.push((wx,wy,k)=>{
  if(R.floor==='roof'||k<0.9||G.tour&&!G.tour.done){closeStory();return false} // zoomed in far enough to pick one out
  let best=null,bd=Math.max(4,12/k); // a small reach, so taps on shops and stands still land
  for(const p of R.pax){if(p.inbound||p.dead||TAP_OUT.has(p.state)||paxHidden(p))continue;const x=p.ex??p.x,y=p.ey??p.y,d=Math.hypot(x-wx,y-wy);if(d<bd){bd=d;best=p}}
  if(!best){closeStory();return false}
  openStory(best);return true;
});
Object.assign(SIMX,{RUN_LOG,RUN_AT,RUN_TOP,taleOf:p=>TALES.get(p),runsOf:F=>RUNS.get(F),taleLines,storyHTML,openStory,closeStory,missRun});
