// The game's rules: the same seed plays the same game; cheaper fares fill more seats and keep more travellers from
// Lowmere; costs rise with level; planes lose value with wear; levels ask for more each time; every layout is sound;
// plan and goal ids are sound; a level goal follows its least-met requirement and a curfew scales it to the hours
// open; the Lowmere goal leads only from Gateway on; has() knows every real unlocked-from-the-start item and hides
// a typo; the newest What's new version matches docs/HISTORY.md; the sim hook reads live values; loading a save
// twice changes nothing; and each passenger goes through the same states as on main over a seeded hour
// (tools/checks/lib/pax-states.json, recorded from main before refactor 7; RULES_PAX_RECORD=1 writes it again).
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const PAX_REC=join(dirname(fileURLToPath(import.meta.url)),'lib/pax-states.json');

export default async function({open,ok,saveText,newest,out,HIST_TOP,root}){
  const run=async seed=>{const {ctx,page}=await open(undefined,null,false,{seed,still:true});
    const r=await page.evaluate(()=>{const S=__sim;S.R.sim=true;for(let i=0;i<24*60*4;i++)S.update(0.25);const G=S.G;return JSON.stringify([Math.round(G.cash*100),G.flights,G.flown,G.rep,G.clock])});
    await ctx.close();return r};
  const a=await run(7),b=await run(7),c=await run(8);
  ok('rules: the same seed plays the same game',a===b&&a!==c,`seed 7 twice ${a===b?'same':'different'}, seed 8 ${a!==c?'different':'same'}`);
  const readme=readFileSync(join(root,'README.md'),'utf8');
  ok('rules: the README has no <owner> or <repo> placeholders in its links',!/<owner>|<repo>/.test(readme),(readme.match(/<owner>|<repo>/)||['none'])[0]);
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
    {bad=[];for(let n=1;n<S.LEVELS.length;n++){const g=S.GOALS.find(x=>x.id==='l'+n),[v,tg]=g.p();
        if(G.level>=n){if(v!==1||tg!==1)bad.push('l'+n+' (reached, should read as met)')}
        else{const min=S.levelChecks(n).reduce((a,c)=>c[1]/c[2]<a[1]/a[2]?c:a);if(v!==min[1]||tg!==min[2])bad.push('l'+n)}}
      t('rules: a level goal\'s bar and text follow its least-met requirement, and reads as met once the level is reached',!bad.length,few(bad))}
    {const gids=S.GOALS.map(g=>g.id);
      t('rules: the Lowmere market-share goal leads only from Gateway on, where slot agreements are within reach',gids.indexOf('low1')>gids.indexOf('l5'),`low1 at ${gids.indexOf('low1')}, l5 at ${gids.indexOf('l5')}`)}
    {const before={level:G.level,flown:G.flown,rep:G.rep,hours:G.hours,pol:G.pol,cash:G.cash,pts:G.pts,newTabs:G.newTabs,built:G.stands.map(s=>s.built)},
      restore=()=>{G.level=before.level;G.flown=before.flown;G.rep=before.rep;G.hours=before.hours;G.pol=before.pol;G.cash=before.cash;G.pts=before.pts;G.newTabs=before.newTabs;G.stands.forEach((s,i)=>s.built=before.built[i])},
      full=S.LEVELS[4].req.daily,scaled=Math.round(full*18/24),setUp=()=>{G.level=3;G.flown=S.LEVELS[4].req.pax;G.rep=S.LEVELS[4].req.rep;G.stands.forEach((s,i)=>s.built=i<4);G.hours=[{pax:scaled}]};
      setUp();G.pol={curfew:true};S.checkLevel();const withCurfew=G.level;restore();
      setUp();G.pol={curfew:false};S.checkLevel();const withoutCurfew=G.level;restore();
      t('rules: a curfew scales the next level\'s daily target to the hours open, so a level-3 airport with 4 gates can still reach level 4',withCurfew===4&&withoutCurfew===3,`curfew on → level ${withCurfew}; off → level ${withoutCurfew} (target ${full}, scaled ${scaled})`)}
    {bad=['mode:bus','up:desks','ac:0','meth:random','shop:coffee','rt:0'].filter(k=>{const [a,v]=k.split(':');return !S.keyExists(a,v)});
      if(S.keyExists('mode','notarealmode'))bad.push('mode:notarealmode (should not exist)');
      t('rules: has() knows every real, unlocked-from-the-start item, and hides a typo rather than showing it early',!bad.length,few(bad))}
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
    {// the sim hook reads live values: a let the game reassigns is exposed through a getter, not copied once at load
      const a=S.AF_Y,top=S.LAYOUTS.mid.top;S.applyLayout('mid');const mid=S.AF_Y;const fl=S.R.floor;S.R.floor='roof';S.draw();const roof=S.ROOF,rooms=S.ROOMS;S.R.floor=fl;S.applyLayout(S.G.layout);
      t('rules: the sim hook reads live values (AF_Y after a layout change, ROOF after a frame on the roof)',mid===top&&a!==mid&&roof!=null&&rooms!=null,`AF_Y ${a} → ${mid} (Midfield's top ${top}), ROOF ${roof?'set':'null'}`)}
    {const s1=JSON.stringify(S.G);S.resetAll(JSON.parse(s1));const g2=S.G,g1=JSON.parse(s1);
      bad=Object.keys(g1).filter(k=>k!=='savedAt'&&JSON.stringify(g1[k])!==JSON.stringify(g2[k])); // savedAt is when it was last saved
      t('rules: loading a save twice changes nothing',!bad.length,few(bad))}
    {const m=[[999960,'$1.00M'],[999949,'$999.9k'],[-0.004,'$0'],[0.004,'$0'],[200000,'$200k'],[15000,'$15k'],[15040,'$15k'],[15150,'$15.2k'],[-12345,'−$12.3k'],[1234.4,'$1,234'],[1.5,'$1.50']].map(([v,w])=>[v,w,S.money(v)]).filter(([,w,g])=>w!==g);
      t('rules: money() picks its unit after rounding and shows no stray zeros',!m.length,m.map(([v,w,g])=>`${v} → ${g}, not ${w}`).join('; ')||'11 values')}
    return out},HIST_TOP);
  for(const [name,pass,info] of res)ok(name,pass&&!errs.length,info+(errs.length?' '+errs[0]:''));
  await ctx.close();
  { // row 40: every literal has('…') call site names a real item, caught here rather than by playing into a typo
    const lits=new Set();
    for(const f of readdirSync(join(root,'src/game')).filter(f=>f.endsWith('.js')))
      for(const m of readFileSync(join(root,'src/game',f),'utf8').matchAll(/\bhas\('([\w:]+)'\)/g))lits.add(m[1]);
    const {ctx,page,errs}=await open(undefined,null,false,{still:true});
    const bad=await page.evaluate(keys=>keys.filter(k=>{const [a,v]=k.split(':');return !__sim.keyExists(a,v)}),[...lits]);
    ok('rules: every literal has(\'…\') key names a real item',!bad.length&&!errs.length,(bad.length?`unknown: ${bad.join(', ')}`:'')+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
  // the passes over passengers (refactor 7): over a seeded hour on the level 9 save, each passenger, numbered in the order
  // they're first seen, goes through the same states, read after every step, as on main
  {const {ctx,page,errs}=await open(undefined,saveText('v32-L9.json'),false,{still:true});
  const now=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;R.sim=true;const id=new Map(),seq=[],who=[];
    const end=G.clock+60;while(G.clock<end){S.update(0.1);
      for(const p of R.pax){let k=id.get(p);if(k==null){k=seq.length;id.set(p,k);seq.push([]);const F=p.F||p.A;who.push(`#${k} ${p.inbound?'arriving':'departing'} ${F?F.code+F.no:''} ${p.type||''}, first seen at ${Math.floor(G.clock)} as ${p.state}`)}
        const s=seq[k];if(s[s.length-1]!==p.state)s.push(p.state)}}
    R.sim=false;
    const h=t=>{let x=2166136261;for(const c of t)x=Math.imul(x^c.charCodeAt(0),16777619)>>>0;return x.toString(16).padStart(8,'0')};
    return {n:seq.length,hashes:seq.map(s=>h(s.join(' '))),seqs:seq.map(s=>s.join(' ')),who}});
  if(process.env.RULES_PAX_RECORD)writeFileSync(PAX_REC,JSON.stringify({n:now.n,hashes:now.hashes.join(' ')})+'\n');
  const rec=JSON.parse(readFileSync(PAX_REC,'utf8')),was=rec.hashes.split(' ');
  const at=now.hashes.findIndex((x,k)=>x!==was[k]),k=at>=0?at:now.n!==rec.n?Math.min(now.n,rec.n):-1;
  ok('rules: each passenger goes through the same states as on main over a seeded hour',k<0&&!errs.length,
    k<0?`${now.n} passengers`+(errs.length?' '+errs[0]:''):k<now.n?`first differs: ${now.who[k]}, now ${now.seqs[k].slice(0,300)}`:`${now.n} passengers, was ${rec.n}`);
  await ctx.close()}
}
