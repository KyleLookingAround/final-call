// Quick regression checks for build/test.html (about 1-2 minutes). Run with: npm run check
//   sim      a new game plays 72 game hours headless without errors
//   saves    every save in tools/saves loads, plays two game days and opens every tab
//   layout   no sideways overflow and no page scroll, 320 px phones to 2560 px screens, portrait and landscape
//   sheet    on a phone the bottom panel drags up and down with touch and snaps, and the page never scrolls
//   tour     a new game starts the guided first hour and it advances
//   rules    the same seed plays the same game, and the game's rules hold (fares, shares, costs, levels, saves)
//   transport the transport manager: suggestions are sound, upgrades and extensions work, and it runs only
//            the lines you leave to it, adding services for crowds and events
//   shots    phone, tablet and desktop screenshots of the airport, world and region, in build/shots/
//   layouts  every airport layout plays two hours fully built, its Layout tab fits a 320 px phone, and a
//            desktop screenshot of each goes in build/shots/
//   share    the link preview: tags filled in, preview image and icon present, the right size and small enough
//   news     What's new opens once for an older save and not again, never for a new game, and from Settings
//   perf     how fast a level 9 airport simulates (against a calibration run, so machines compare), and how
//            much of a phone's CPU the game uses at 8x with the CPU slowed 4x
//   ...      and a group for each file in tools/checks/, named after it (terminal: the halls and the way through them)
// Every page is seeded (window.__seed), so a failure repeats when you run it again.
// Exit code 1 if anything fails. Screenshots of failures go to build/check/.
import {chromium} from 'playwright';
import {readFileSync,readdirSync,mkdirSync,statSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..'),url=pathToFileURL(join(root,'build/test.html')).href,out=join(root,'build/check');
mkdirSync(out,{recursive:true});
const only=process.argv[2];
const exe=process.env.CHROMIUM_PATH;
const browser=await chromium.launch(exe?{executablePath:exe}:{});
const results=[];const ok=(name,pass,info)=>{results.push([name,pass]);console.log(`${pass?'PASS':'FAIL'}  ${name}${info?'  '+info:''}`)};
const ignorable=m=>/fonts\.(googleapis|gstatic)|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|net::/.test(m);

// seed: the game's random seed; still: no frame loop, so only the check moves the game on
// news: leave the What's new card as it opens (older saves open it on load); otherwise it's closed first
async function open(vp={width:1280,height:800},save=null,touch=false,{seed=1,still=false,news=false}={}){
  const ctx=await browser.newContext({viewport:vp,deviceScaleFactor:touch?2:1,hasTouch:touch,isMobile:touch,screen:{width:Math.min(vp.width,vp.height)<=520&&touch?Math.min(vp.width,vp.height):vp.width,height:Math.min(vp.width,vp.height)<=520&&touch?Math.max(vp.width,vp.height):vp.height}});
  await ctx.addInitScript(([seed,still])=>{window.__seed=seed;if(still)window.requestAnimationFrame=()=>0},[seed,still]);
  if(save)await ctx.addInitScript(s=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('final-call-save-v2',s);sessionStorage.setItem('seeded','1')}},save);
  const page=await ctx.newPage();const errs=[];
  page.on('pageerror',e=>errs.push(e.message));page.on('console',c=>{if(c.type()==='error'&&!ignorable(c.text()))errs.push(c.text())});
  await page.goto(url);await page.waitForTimeout(800);
  if(!news)await page.evaluate(()=>{const n=document.querySelector('#news');if(n&&!n.hidden)n.querySelector('[data-newsclose]').click()});
  await page.evaluate(()=>{__sim.R.toasts.length=0;document.querySelector('#toasts').innerHTML=''});
  return {ctx,page,errs};
}
const saves=readdirSync(join(root,'tools/saves')).filter(f=>f.endsWith('.json')).sort();
const saveText=f=>readFileSync(join(root,'tools/saves',f),'utf8');
const newest=saves.at(-1); // the latest version's highest level
const HIST_TOP=+(readFileSync(join(root,'docs/HISTORY.md'),'utf8').match(/^\| (\d+) \|/m)||[])[1]; // the newest version in docs/HISTORY.md

if(!only||only==='sim'){
  const {ctx,page,errs}=await open();
  const r=await page.evaluate(()=>{const S=__sim,G=S.G;S.R.sim=true;for(let i=0;i<72*60*4;i++)S.update(0.25);S.R.sim=false;return {flights:G.flights,clock:Math.round(G.clock),cash:Math.round(G.cash)}});
  ok('sim: 72 game hours headless',!errs.length&&r.flights>10,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
  await ctx.close();
}
if(!only||only==='rules'){
  const run=async seed=>{const {ctx,page}=await open(undefined,null,false,{seed,still:true});
    const r=await page.evaluate(()=>{const S=__sim;S.R.sim=true;for(let i=0;i<24*60*4;i++)S.update(0.25);const G=S.G;return JSON.stringify([Math.round(G.cash*100),G.flights,G.flown,G.rep,G.clock])});
    await ctx.close();return r};
  const a=await run(7),b=await run(7),c=await run(8);
  ok('rules: the same seed plays the same game',a===b&&a!==c,`seed 7 twice ${a===b?'same':'different'}, seed 8 ${a!==c?'different':'same'}`);
  const {ctx,page,errs}=await open(undefined,saveText('v20-L8.json'),false,{still:true});
  const res=await page.evaluate(HIST_TOP=>{
    const S=__sim,G=S.G,out=[],t=(name,pass,info='')=>out.push([name,!!pass,info]),few=a=>a.slice(0,4).join(' ');
    S.seedRandom(5);const r1=[S.rnd(),S.rnd(),S.rnd()];S.seedRandom(5);const r2=[S.rnd(),S.rnd(),S.rnd()];
    t('rules: the random generator repeats from a seed and stays in [0, 1)',r1.join()===r2.join()&&r1.every(x=>x>=0&&x<1),r1.map(x=>x.toFixed(3)).join(' '));
    const cities=Object.keys(G.routes),shared=cities.filter(c=>S.rivShare(c)<1);
    let bad=cities.filter(c=>!(S.routeLF(c,0,0)>=S.routeLF(c,0,1)&&S.routeLF(c,0,1)>=S.routeLF(c,0,2)));
    t('rules: cheaper fares fill more seats',cities.length&&!bad.length,`${cities.length} routes ${few(bad)}`);
    bad=shared.filter(c=>!(S.rivShare(c,0)>=S.rivShare(c,1)&&S.rivShare(c,1)>=S.rivShare(c,2)));
    t('rules: Lowmere takes more travellers as your fares rise',shared.length&&!bad.length,`${shared.length} shared routes ${few(bad)}`);
    bad=cities.filter(c=>{const s=S.rivShare(c),k=S.rivKeep(c);return !(s>0&&s<=1&&k>0&&k<=1)});
    t('rules: shares and kept markets stay between 0 and 1',!bad.length,few(bad));
    if(shared.length){const c=shared[0],r=G.rival.routes[c],was=r.sale,before=S.rivShare(c);r.sale=G.clock+60;const after=S.rivShare(c);r.sale=was;
      t('rules: a Lowmere fare sale takes travellers',after<before,`${c} ${before.toFixed(3)} → ${after.toFixed(3)}`)}
    bad=S.CITIES.filter(c=>!(S.cityMarket(c[0])>0)).map(c=>c[0]);
    {const c=cities[0],m0=S.cityMarket(c),lm=G.lv.marketing;G.lv.marketing=lm+1;const m1=S.cityMarket(c);G.lv.marketing=lm;
      t('rules: every city has a market, and marketing grows it',!bad.length&&m1>m0,`${few(bad)} ${Math.round(m0)} → ${Math.round(m1)}`)}
    bad=[];for(const k in S.UPG){const l=G.lv[k];for(let v=0;v+1<S.UPG[k].max;v++){G.lv[k]=v;const a=S.upCost(k);G.lv[k]=v+1;const b=S.upCost(k);if(!(a>0&&b>a)){bad.push(`${k}@${v}`);break}}G.lv[k]=l}
    t('rules: each upgrade level costs more than the last',!bad.length,few(bad));
    bad=S.AC_ORDER.filter(ty=>{const v=w=>S.sellValue({type:ty,wear:w}),cost=S.AIRCRAFT[ty].cost;return !(v(0)<cost&&v(10)<v(0)&&v(100)>=Math.round(cost*0.6*0.4)&&S.serviceCost({type:ty})>0)});
    t('rules: planes lose value with wear, down to a floor',!bad.length,few(bad));
    {const e=G.earned,l=G.loan;G.loan=0;G.earned=0;const a=S.loanCap();G.earned=1e6;const b=S.loanCap();G.earned=1e12;const c=S.loanCap();G.earned=e;G.loan=l;
      t('rules: the loan limit grows with earnings, up to 1M',a>0&&b>a&&c===1000000,`${a} ${b} ${c}`)}
    {const p=G.ptBought,a=S.consultCost();G.ptBought=(p||0)+1;const b=S.consultCost();G.ptBought=p;t('rules: each consultant point costs more',b>a,`${a} → ${b}`)}
    t('rules: there are enough crews for the fleet',S.crewTarget()>=G.fleet.filter(f=>!f.sold).length,`${S.crewTarget()} for ${G.fleet.filter(f=>!f.sold).length} planes`);
    bad=[];for(let n=2;n<S.LEVELS.length;n++){const p=S.LEVELS[n-1].req,q=S.LEVELS[n].req;if(!(q.pax>=p.pax&&q.gates>=p.gates))bad.push(n)}
    t('rules: each level asks for at least as much as the one before',!bad.length,few(bad));
    {const ids=new Set(S.TECH.map(T=>T.id));bad=S.TECH.filter(T=>(T.r||[]).some(r=>!ids.has(r))).map(T=>T.id);
      const gids=new Set(S.GOALS.map(g=>g.id));
      t('rules: plan and goal ids are unique and prerequisites exist',ids.size===S.TECH.length&&gids.size===S.GOALS.length&&!bad.length,few(bad))}
    {bad=[];for(const [id,L] of Object.entries(S.LAYOUTS)){bad.push(...S.layoutFaults(id).map(f=>id+': '+f));const st=L.stands,names=new Set(st.map(x=>x.g));
      if(names.size!==st.length||st.length>16||L.shops.length>20)bad.push(id+': names or counts');
      const order=L.order||st.map((x,i)=>i);if(order.length!==st.length||new Set(order).size!==st.length)bad.push(id+': buying order')}
      t('rules: every layout fits: names, buying order, planes, rooms, lounges, shops, links and cards',!bad.length,few(bad))}
    {// no layout can leave a player stuck: at each level, the gates on bridges they can reach cover the next level's needs
      bad=[];for(const [id,L] of Object.entries(S.LAYOUTS)){const st=L.stands,order=L.order||st.map((x,i)=>i),after=st.map((s,i)=>s.after!=null?s.after:(o=>o>0?order[o-1]:-1)(order.indexOf(i)));
        for(let n=0;n+1<S.LEVELS.length;n++){const got=new Set();let more=true;
          while(more){more=false;st.forEach((s,i)=>{if(!got.has(i)&&s.lvl<=n&&(!s.pier||n>=S.PIER.lvl)&&(after[i]<0||got.has(after[i]))){got.add(i);more=true}})}
          const gates=[...got].filter(i=>st[i].kind!=='remote').length,need=S.LEVELS[n+1].req.gates;if(gates<need){bad.push(`${id}: level ${n} reaches ${gates} gates, ${S.LEVELS[n+1].name} needs ${need}`);break}}}
      t('rules: in every layout, each level can reach the gates the next one needs',!bad.length,few(bad))}
    {// rebuilding carries gates and shops across by position, and sells what doesn't fit
      const G0=S.G,built=G0.stands.filter(s=>s.built).length;S.switchLayout('remote');const a=S.G.stands.filter(s=>s.built).length,w=S.W;
      S.SIDX.forEach(i=>{S.G.stands[i].built=true});const cash=S.G.cash;S.switchLayout('curve');const b=S.G.stands.filter(s=>s.built).length,sold=S.G.cash-cash;
      S.switchLayout('classic');
      t('rules: rebuilding keeps gates and shops, and sells what the new layout has no room for',a===built&&w===S.LAYOUTS.remote.W&&b===8&&sold>0&&S.G.layout==='classic',`kept ${a}/${built}, then ${b} of 12 with ${Math.round(sold)} back`)}
    {// mobile lounges: remote boarding keeps its speed in rain, and they're built as a construction project
      S.switchLayout('remote');const i=S.STAND_KIND.indexOf('remote'),rain=S.R.fx.rain;S.R.fx.rain=S.G.clock+60;const bus=S.busMul(i);S.G.lounges=true;const lounge=S.busMul(i);S.G.lounges=false;S.R.fx.rain=rain;
      const cash=S.G.cash;S.G.cash=1e7;const bought=S.buyLounges(),job=S.G.builds.find(b=>b.id==='lounges');if(job)S.finishBuild(job);S.G.builds=S.G.builds.filter(b=>b.id!=='lounges');
      const built=S.G.lounges;S.G.lounges=false;S.G.cash=cash;S.switchLayout('classic');
      t('rules: mobile lounges keep remote boarding quick in rain, and are built as a project',bus<lounge&&bought&&built,`in rain: buses ${bus}, lounges ${lounge}`)}
    {const v=S.UPDATES.map(u=>u.v);t('rules: What\'s new versions run newest first and match the history',v.every((x,i)=>i===0||x<v[i-1])&&v[0]===HIST_TOP,`newest ${v[0]}, history ${HIST_TOP}`)}
    {const s1=JSON.stringify(S.G);S.resetAll(JSON.parse(s1));const g2=S.G,g1=JSON.parse(s1);
      bad=Object.keys(g1).filter(k=>k!=='savedAt'&&JSON.stringify(g1[k])!==JSON.stringify(g2[k])); // savedAt is when it was last saved
      t('rules: loading a save twice changes nothing',!bad.length,few(bad))}
    return out},HIST_TOP);
  for(const [name,pass,info] of res)ok(name,pass&&!errs.length,info+(errs.length?' '+errs[0]:''));
  await ctx.close();
}
if(!only||only==='transport'){
  const {ctx,page,errs}=await open(undefined,saveText('v26-L9.json'),false,{still:true});
  const res=await page.evaluate(()=>{
    const S=__sim,G=S.G,out=[],t=(name,pass,info='')=>out.push([name,!!pass,info]);S.R.sim=true;G.cash+=5e6;S.regionTick();
    const lines=()=>Object.values(G.lines),code=L=>S.lineCode(L),snap=()=>JSON.stringify(lines().map(L=>[L.id,L.mode,L.freq,L.fare??1,!!L.sync,L.stops.join()]));
    // every suggestion can be built or made, and is worth it
    const recs=S.computeTransitRecs(),kinds=[...new Set(recs.map(c=>c.kind))];
    let bad=recs.filter(c=>!(c.val.v>0.5&&c.pay<=S.REC_PAY&&(!['line','mode','ext'].includes(c.kind)||S.lineQuote(c.mode,c.stops,c.kind==='line'?null:c.id).ok)));
    t('transport: every suggestion is buildable and pays back within a week',recs.length&&!bad.length,`${recs.length} suggestions (${kinds.join(', ')})${bad.length?' bad: '+bad.map(c=>c.kind).join(' '):''}`);
    bad=recs.filter(c=>c.id&&recs.filter(d=>d.id===c.id).length>1);
    t('transport: at most one suggestion per line',!bad.length,bad.map(c=>c.kind+':'+c.id).join(' '));
    // Not now hides a suggestion for a day
    {const c=recs[0],k=S.recKey(c);S.R.recHide={[k]:G.clock+1440};const hid=!S.recCands().some(d=>S.recKey(d)===k);S.R.recHide={};const back=S.recCands().some(d=>S.recKey(d)===k);
      t('transport: Not now hides a suggestion, and it comes back',hid&&back,c.kind)}
    // an extension suggestion extends the line
    {const L=lines().find(L=>L.mode==='bus'),to=S.EDGES.map(e=>e.a===L.stops.at(-1)?e.b:e.b===L.stops.at(-1)?e.a:null).find(n=>n&&!L.stops.includes(n)&&S.lineQuote('bus',[...L.stops,n],L.id).ok),st=[...L.stops,to];
      const ok=S.applyRec({kind:'ext',id:L.id,stops:st});t('transport: an extension suggestion extends the line',ok&&G.lines[L.id].stops.join()===st.join(),`${code(L)} → ${st.join('-')}`)}
    // an upgrade keeps the old line running until it's built, then switches kind, number and colour
    {const L=lines().find(L=>L.mode==='bus'&&S.upTargets(L).some(m=>{const st=S.upgradeStops(L,m);return st&&S.lineQuote(m,st,L.id).ok}));
      const m=S.upTargets(L).find(m=>{const st=S.upgradeStops(L,m);return st&&S.lineQuote(m,st,L.id).ok}),st=S.upgradeStops(L,m),was=code(L);
      const ok=S.applyRec({kind:'mode',id:L.id,mode:m,stops:st}),b=G.builds.find(b=>b.id==='line:'+L.id);
      const during=G.lines[L.id].mode==='bus'&&S.lineFreq(G.lines[L.id],true)>0&&b&&b.up&&b.from===was,held=S.nextNum(m)!==b.num;
      S.finishBuild(b);G.builds=G.builds.filter(x=>x!==b);const N=G.lines[L.id];
      t('transport: an upgrade keeps the old line running until it is built',ok&&during,`${was} → ${S.MODES[m].L}${b&&b.num}`);
      t('transport: an upgrade reserves its number while it is built',held,`next ${S.MODES[m].name} ${S.nextNum(m)}`);
      t('transport: a finished upgrade switches kind, number, colour and route',N.mode===m&&N.num===b.num&&N.col===b.col&&N.stops.join()===st.join(),`${was} is now ${code(N)} ${N.stops.join('-')}, every ${Math.round(60/N.freq)} min`)}
    // the manager leaves lines you've taken over alone
    {for(const L of lines())L.man=true;const a=snap();S.managersTick();for(let i=0;i<90;i++)S.mgrStep();for(const L of lines())S.R.reg.lines[L.id]&&(S.R.reg.lines[L.id].baseLoad=1.3);S.mgrHour();const b=snap();for(const L of lines())delete L.man;S.regionTick();
      t('transport: the manager never changes a line you have taken over',a===b)}
    // it reviews its own lines and makes changes worth having
    {const a=snap();S.managersTick();const q=S.R.mgrQ.length;for(let i=0;i<120&&S.R.mgrQ.length;i++)S.mgrStep();const b=snap();
      t('transport: the manager reviews every line it runs',q===lines().filter(L=>!S.lineDown(L)&&!S.isBuilding('line:'+L.id)).length&&!S.R.mgrQ.length,`${q} lines, ${a===b?'no change':'changes: '+(S.R.mgrLog||[]).map(x=>x.text).join('; ')}`)}
    // a line over 105% full gets more services within the hour
    {const L=lines().find(L=>{const fq=S.MODES[L.mode].freqs,i=fq.indexOf(L.freq);return i>=0&&i<fq.length-1&&!S.lineDown(L)}),f0=L.freq;S.R.reg.lines[L.id].baseLoad=1.2;S.mgrHour();
      t('transport: a line over 105% full gets more services within the hour',G.lines[L.id].freq>f0,`${code(L)} ${f0}/h → ${G.lines[L.id].freq}/h`)}
    // event days: lines to the venue run extra services only while the crowds travel
    {const e=G.evq.find(e=>S.PLOTS.find(p=>p.id===e.plot).node!=='air'),node=S.PLOTS.find(p=>p.id===e.plot).node,L=lines().find(L=>S.serves(L,node)&&!S.lineDown(L)),c0=G.clock,at=e.at;
      const fAt=d=>{G.clock=at+d;return S.lineFreq(L)};const before=fAt(-400),arr=fAt(-60),gap=fAt(30),home=fAt(150),after=fAt(260);G.clock=c0;
      t('transport: lines to an event run extra services only while the crowds travel',arr>before&&home>before&&gap===before&&after===before,`${code(L)} to ${node}: ${before}/h, arriving ${arr}/h, during ${gap}/h, going home ${home}/h, after ${after}/h`)}
    S.R.sim=false;return out});
  for(const [n,p,i] of res)ok(n,p,i);
  ok('transport: no errors',!errs.length,errs[0]||'');
  await ctx.close();
}
if(!only||only==='saves'){
  for(const f of saves){
    const {ctx,page,errs}=await open({width:1280,height:800},saveText(f));
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,lv=G.level;S.R.sim=true;for(let i=0;i<2*24*60*4;i++)S.update(0.25);S.R.sim=false;return {lv,day:G.day,crews:G.crews.length,tour:!!(G.tour&&G.tour.done)}});
    for(const [tab,sub] of [['stands','gates'],['stands','fleet'],['terminal'],['ground'],['sales'],['routes'],['region'],['office','progress'],['office','records'],['office','settings']]){
      await page.evaluate(([tab,sub])=>{if(sub){if(tab==='office')__sim.R.oSub=sub;else __sim.R.gSub=sub}__sim.setTab(tab)},[tab,sub]);await page.waitForTimeout(60)}
    ok(`saves: ${f}`,!errs.length&&r.tour,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
}
if(!only||only==='layout'){
  const save=saveText(newest);
  for(const [w,h] of [[320,640],[360,780],[390,844],[768,1024],[844,390],[915,412],[1024,768],[1440,900],[2560,1440]]){
    const touch=w<1000&&h<1100;const {ctx,page,errs}=await open({width:w,height:h},save,touch);const bad=[];
    for(const [tab,view,sub] of [['stands','airport','fleet'],['routes','world'],['region','region'],['office','airport','records'],['office','airport','settings']]){
      await page.evaluate(([tab,view,sub])=>{__sim.setView(view);if(sub){if(tab==='office')__sim.R.oSub=sub;else __sim.R.gSub=sub}__sim.setTab(tab)},[tab,view,sub]);await page.waitForTimeout(120);
      const o=await page.evaluate(()=>{const W=document.documentElement.clientWidth,H=innerHeight;const over=[...document.querySelectorAll('#panel *, .board *, .hud, .fsbar, #side')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&getComputedStyle(e).visibility!=='hidden'&&(r.right>W+1||r.left<-1)}).slice(0,2).map(e=>e.id||String(e.className));return {scroll:document.documentElement.scrollHeight>H+1||document.documentElement.scrollWidth>W+1,over}});
      if(o.scroll||o.over.length)bad.push(`${tab}/${sub||view} ${JSON.stringify(o)}`);
    }
    if(bad.length)await page.screenshot({path:join(out,`layout_${w}x${h}.png`)});
    ok(`layout: ${w}x${h}`,!bad.length&&!errs.length,bad[0]||errs[0]||'');
    await ctx.close();
  }
}
if(!only||only==='sheet'){
  const {ctx,page,errs}=await open({width:390,height:844},saveText(newest),true);
  const cdp=await ctx.newCDPSession(page);
  const st=()=>page.evaluate(()=>{const g=document.querySelector('#grip').getBoundingClientRect();return {h:Math.round(document.querySelector('#side').getBoundingClientRect().height),grip:Math.round(g.top+g.height/2),scroll:document.documentElement.scrollTop+document.body.scrollTop,docH:document.documentElement.scrollHeight,vh:innerHeight}});
  const swipe=async(y0,y1)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:y0}]});for(let k=1;k<=10;k++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y:y0+(y1-y0)*k/10}]});await page.waitForTimeout(16)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(350)};
  const s0=await st();await swipe(s0.grip,150);const s1=await st();await swipe(s1.grip,s1.grip+900);const s2=await st();await swipe(s2.grip,s2.grip-250);const s3=await st();
  const pass=s1.h>s0.h+100&&s2.h<160&&s3.h>s2.h+100&&[s0,s1,s2,s3].every(s=>s.scroll===0&&s.docH<=s.vh);
  if(!pass)await page.screenshot({path:join(out,'sheet.png')});
  ok('sheet: phone panel drags and snaps',pass&&!errs.length,[s0,s1,s2,s3].map(s=>s.h).join(' → ')+(errs.length?' '+errs[0]:''));
  // full screen: the drawer opens from Manage and hides again
  await page.click('#fsb');await page.waitForTimeout(400);
  const hid=await page.evaluate(()=>document.querySelector('#side').getBoundingClientRect().top>=innerHeight-1);
  await page.click('#fsManage');await page.waitForTimeout(400);
  const shown=await page.evaluate(()=>document.querySelector('#side').getBoundingClientRect().bottom<=innerHeight+1&&document.querySelector('#side').getBoundingClientRect().top<innerHeight*0.7);
  ok('sheet: full-screen drawer hides and opens',hid&&shown,`hidden ${hid}, open ${shown}`);
  await ctx.close();
}
if(!only||only==='tour'){
  for(const vp of [{width:390,height:844},{width:1440,height:900}]){
    const {ctx,page,errs}=await open(vp,null,vp.width<900);
    const a=await page.evaluate(()=>({s:__sim.G.tour.s,coach:!document.querySelector('#coach').hidden}));
    await page.click('[data-tnext]');await page.waitForTimeout(400);
    const b=await page.evaluate(()=>({s:__sim.G.tour.s,spot:!document.querySelector('#spot').hidden}));
    ok(`tour: ${vp.width}px`,a.coach&&a.s===0&&b.s===1&&b.spot&&!errs.length,JSON.stringify([a,b]));
    await ctx.close();
  }
}
if(!only||only==='shots'){
  // for looking at a change by eye; CI keeps them as the "screenshots" artifact on every PR
  const dir=join(root,'build/shots');mkdirSync(dir,{recursive:true});
  for(const [name,vp,touch] of [['phone',{width:390,height:844},true],['tablet',{width:768,height:1024},true],['desktop',{width:1440,height:900},false]]){
    const {ctx,page,errs}=await open(vp,saveText(newest),touch);
    await page.evaluate(()=>{const S=__sim;S.R.sim=true;for(let i=0;i<60*4;i++)S.update(0.25);S.R.sim=false}); // an hour in, so planes are at the gates
    for(const [tab,view] of [['stands','airport'],['routes','world'],['region','region']]){
      await page.evaluate(([tab,view])=>{__sim.setView(view);__sim.setTab(tab)},[tab,view]);await page.waitForTimeout(400);
      await page.screenshot({path:join(dir,`${name}-${view}.png`)});
    }
    ok(`shots: ${name}`,!errs.length,errs[0]||'build/shots/'+name+'-*.png');
    await ctx.close();
  }
}
if(!only||only==='layouts'){
  for(const id of ['classic','remote','stagger','curve','hall','sat','star','round','mid']){
    const {ctx,page,errs}=await open({width:1440,height:900},saveText(newest),false);
    const r=await page.evaluate(id=>{const S=__sim,G=S.G;S.switchLayout(id);S.SIDX.forEach(i=>{G.stands[i].built=true});
      const types=G.shops.filter(Boolean).map(s=>s.type);S.SHOP_X.forEach((x,j)=>{if(!G.shops[j])G.shops[j]={type:types[j%types.length]||0,lvl:1,earned:0,spent:500}});
      const f0=G.flights;S.R.sim=true;for(let i=0;i<120*10;i++)S.update(0.1);S.R.sim=false;
      document.querySelectorAll('#tip,#toasts').forEach(e=>e.style.display='none');
      return {flights:G.flights-f0,busy:S.R.st.filter((x,i)=>i<S.SIDX.length&&x.F).length,stands:S.SIDX.length}},id);
    await page.keyboard.press('0');await page.waitForTimeout(500);
    await page.screenshot({path:join(root,'build/shots',`layout-${id}.png`)});
    ok(`layouts: ${id} plays two hours fully built`,!errs.length&&r.flights>0&&r.busy>0,`${r.flights} flights, ${r.busy} of ${r.stands} stands busy`+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
  // the Layout tab on the smallest phone, with every layout approved
  const {ctx,page,errs}=await open({width:320,height:640},saveText(newest),true);
  const o=await page.evaluate(()=>{const S=__sim;for(const T of S.TECH)if(T.b==='lay')S.G.tech[T.id]=1;S.R.aSub='layout';S.setTab('ground');
    const W=document.documentElement.clientWidth;const over=[...document.querySelectorAll('#panel *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.right>W+1||r.left<-1)}).slice(0,2).map(e=>e.className||e.tagName);
    return {over,cards:document.querySelectorAll('.laycard').length,all:Object.keys(S.LAYOUTS).length}});
  if(o.over.length)await page.screenshot({path:join(out,'layouts_tab_320.png')});
  ok('layouts: the Layout tab fits a 320 px phone',!o.over.length&&o.cards===o.all&&!errs.length,`${o.cards} layouts`+(o.over.length?' overflow: '+o.over.join(' '):'')+(errs.length?' '+errs[0]:''));
  await ctx.close();
}
if(!only||only==='news'){
  // an older save opens the card on load; after closing it, a reload doesn't. The newest save is marked as last
  // seeing the version before the newest, whenever it was made
  const older=JSON.stringify({...JSON.parse(saveText(newest)),seen:HIST_TOP-1});
  const {ctx,page,errs}=await open(undefined,older,false,{news:true});
  // every version newer than the save has seen opens as new (saves from before What's new count as version 21)
  const a=await page.evaluate(()=>({open:!document.querySelector('#news').hidden,fresh:document.querySelectorAll('#newsList details[open]').length,want:__sim.UPDATES.filter(u=>u.v>__sim.G.seen).length,all:document.querySelectorAll('#newsList details').length}));
  await page.click('#news [data-newsclose]');await page.waitForTimeout(200);
  await page.reload();await page.waitForTimeout(900);
  const b=await page.evaluate(()=>!document.querySelector('#news').hidden);
  await page.evaluate(()=>{__sim.R.oSub='settings';__sim.setTab('office')});await page.click('[data-news]');await page.waitForTimeout(200);
  const c=await page.evaluate(()=>({open:!document.querySelector('#news').hidden,all:document.querySelectorAll('#newsList details').length}));
  ok('news: opens once after an update, and from Settings with every version',a.open&&a.fresh===a.want&&!b&&c.open&&c.all===a.all&&!errs.length,JSON.stringify({first:a,again:b,settings:c})+(errs.length?' '+errs[0]:''));
  await ctx.close();
  const n=await open(undefined,null,false,{news:true});
  const d=await n.page.evaluate(()=>new Promise(r=>setTimeout(()=>r(!document.querySelector('#news').hidden),700)));
  ok('news: a new game starts with the guided start, not What\'s new',!d&&!n.errs.length,d?'opened':'');
  await n.ctx.close();
}
if(!only||only==='perf'){
  // the simulation at the 0.1-minute steps the game takes at 4x and 8x, timed against a fixed piece of plain
  // JavaScript in the same page, so the ratio means the same on a fast laptop and a slow CI machine
  const PERF_BUDGET=0.25; // simulation ms per game minute over calibration ms; today it's about 0.11
  {const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});
  const r=await page.evaluate(()=>{
    const S=__sim;S.R.sim=true;for(let i=0;i<600;i++)S.update(0.1); // an hour in, so the code is warmed up
    const cal=()=>{const t=performance.now(),a=[];for(let i=0;i<2e5;i++)a.push({x:i%97,y:i%89});a.sort((p,q)=>p.x-q.x||p.y-q.y);let s=0;for(const p of a)s+=Math.hypot(p.x,p.y);return performance.now()-t+s*0};
    cal();const c=Math.min(cal(),cal(),cal());
    S.managersTick(); // the transport manager reviews every line during the hour timed, its busiest time
    const t=performance.now();for(let i=0;i<600;i++)S.update(0.1);const ms=(performance.now()-t)/60;
    return {ms:+ms.toFixed(2),ratio:+(ms/c).toFixed(3),left:S.R.mgrQ.length}});
  ok('perf: late-game simulation, with the transport manager reviewing',!errs.length&&r.ratio<=PERF_BUDGET,`${r.ms} ms per game minute, ${r.ratio}x calibration (budget ${PERF_BUDGET}x), ${r.left} lines left to review`+(errs.length?' '+errs[0]:''));
  await ctx.close()}
  // the biggest airport: sixteen stands of Midfield concourses, fully built, with its trains
  {const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});
  const r=await page.evaluate(()=>{
    const S=__sim,G=S.G;S.switchLayout('mid');G.pierB=true;S.SIDX.forEach(i=>{G.stands[i].built=true});
    const types=G.shops.filter(Boolean).map(s=>s.type);S.SHOP_X.forEach((x,j)=>{if(!G.shops[j])G.shops[j]={type:types[j%types.length]||0,lvl:1,earned:0,spent:500}});
    S.R.sim=true;for(let i=0;i<1200;i++)S.update(0.1); // two hours in, so every stand is busy
    const cal=()=>{const t=performance.now(),a=[];for(let i=0;i<2e5;i++)a.push({x:i%97,y:i%89});a.sort((p,q)=>p.x-q.x||p.y-q.y);let s=0;for(const p of a)s+=Math.hypot(p.x,p.y);return performance.now()-t+s*0};
    cal();const c=Math.min(cal(),cal(),cal());
    const t=performance.now();for(let i=0;i<600;i++)S.update(0.1);const ms=(performance.now()-t)/60;
    return {ms:+ms.toFixed(2),ratio:+(ms/c).toFixed(3),busy:S.R.st.filter((x,i)=>i<S.SIDX.length&&x.F).length}});
  ok('perf: sixteen stands of Midfield concourses',!errs.length&&r.ratio<=PERF_BUDGET*1.5,`${r.ms} ms per game minute, ${r.ratio}x calibration (budget ${+(PERF_BUDGET*1.5).toFixed(3)}x), ${r.busy} of 16 stands busy`+(errs.length?' '+errs[0]:''));
  await ctx.close()}
  // at 8x on a phone-sized screen with the CPU slowed 4x: how close the game gets to 8 game minutes a second, and the
  // share of the CPU its own code uses. Reported, not judged: headless browsers paint in software, which real phones don't
  {const {ctx,page,errs}=await open({width:390,height:844},saveText(newest),true);
  const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Performance.enable');
  const met=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
  await page.evaluate(()=>{__sim.R.speed=8});await page.waitForTimeout(1000);
  const a=await met(),c0=await page.evaluate(()=>__sim.G.clock);await page.waitForTimeout(4000);const z=await met(),c1=await page.evaluate(()=>__sim.G.clock);
  const secs=z.Timestamp-a.Timestamp;
  ok('perf: phone at 8x, CPU slowed 4x',!errs.length,`${((c1-c0)/secs).toFixed(1)} of 8 game minutes a second, game code ${Math.round((z.ScriptDuration-a.ScriptDuration)/secs*100)}% of the CPU`+(errs.length?' '+errs[0]:''));
  await ctx.close()}
  // the same, fully built as sixteen stands of Midfield concourses
  {const {ctx,page,errs}=await open({width:390,height:844},saveText(newest),true);
  await page.evaluate(()=>{const S=__sim,G=S.G;S.switchLayout('mid');G.pierB=true;S.SIDX.forEach(i=>{G.stands[i].built=true});S.R.sim=true;for(let i=0;i<1200;i++)S.update(0.1);S.R.sim=false});
  const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Performance.enable');
  const met=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
  await page.evaluate(()=>{__sim.R.speed=8});await page.waitForTimeout(1000);
  const a=await met(),c0=await page.evaluate(()=>__sim.G.clock);await page.waitForTimeout(4000);const z=await met(),c1=await page.evaluate(()=>__sim.G.clock);
  const secs=z.Timestamp-a.Timestamp;
  ok('perf: phone at 8x, CPU slowed 4x, sixteen stands',!errs.length,`${((c1-c0)/secs).toFixed(1)} of 8 game minutes a second, game code ${Math.round((z.ScriptDuration-a.ScriptDuration)/secs*100)}% of the CPU`+(errs.length?' '+errs[0]:''));
  await ctx.close()}
}
if(!only||only==='share'){
  // what chat apps and social sites read when the link is shared (dist/index.html, as published)
  const html=readFileSync(join(root,'dist/index.html'),'utf8');
  const tag=(attr,key)=>(html.match(new RegExp(`<(?:meta|link) ${attr}="${key}" (?:content|href)="([^"]*)"`))||[])[1];
  const t={title:tag('property','og:title'),desc:tag('property','og:description'),url:tag('property','og:url'),image:tag('property','og:image'),
    card:tag('name','twitter:card'),meta:tag('name','description'),icon:tag('rel','icon'),touch:tag('rel','apple-touch-icon')};
  const local=u=>u&&u.startsWith(t.url)?join(root,'dist',u.slice(t.url.length).split('?')[0]):null;
  const bad=[];
  if(!/^https:\/\/.+\/$/.test(t.url||''))bad.push('og:url is not an https address ending in /');
  for(const k of ['title','desc','meta'])if(!t[k]||/%[A-Z]+%/.test(t[k]))bad.push(k+' missing');
  if((t.title||'').length>70||(t.desc||'').length>200)bad.push('title or description too long to show in full');
  if(t.card!=='summary_large_image')bad.push('twitter:card is not summary_large_image');
  if(!(t.icon||'').startsWith('data:image/svg+xml,'))bad.push('the icon is not inlined');
  const img=local(t.image),touch=local(t.touch);
  if(!img||!touch)bad.push('og:image or apple-touch-icon is not under og:url');
  const page=await browser.newPage();
  const size=async f=>page.evaluate(async src=>{const i=new Image();i.src=src;await i.decode().catch(()=>{});return [i.naturalWidth,i.naturalHeight]},'data:image/'+(f.endsWith('.png')?'png':'jpeg')+';base64,'+readFileSync(f).toString('base64')).catch(()=>[0,0]);
  let kb=0,w=[0,0],ti=[0,0];
  try{kb=Math.round(statSync(img).size/1024);w=await size(img);ti=await size(touch)}catch(e){bad.push('image missing from dist/: '+e.message)}
  if(w.join()!=='1200,630')bad.push(`preview is ${w.join('x')}, not 1200x630`);
  if(kb>300)bad.push(`preview is ${kb} KB; some chat apps skip images over 300 KB`);
  if(ti.join()!=='180,180')bad.push(`home-screen icon is ${ti.join('x')}, not 180x180`);
  await page.close();
  ok('share: link preview',!bad.length,bad[0]||`${t.image} (${kb} KB)`);
}
// more groups, one file each in tools/checks/ (a group is named after its file): each exports a default async function
// that gets the helpers above and reports through ok(name, pass, info)
for(const f of readdirSync(join(root,'tools/checks')).filter(f=>f.endsWith('.mjs')).sort()){const g=f.slice(0,-4);
  if(!only||only===g)await (await import(pathToFileURL(join(root,'tools/checks',f)).href)).default({open,ok,saveText,saves,newest,browser,root,out});}
await browser.close();
const failed=results.filter(r=>!r[1]).length;
console.log(`\n${results.length-failed}/${results.length} passed`);
process.exit(failed?1:0);
