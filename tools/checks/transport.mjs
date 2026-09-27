// The transport manager: its suggestions are buildable, pay back within a week and come one per line; Not now hides
// one; extensions and upgrades work (the old line runs until the new one opens, which takes a reserved number); it
// leaves lines you've taken over alone, reviews the rest, adds services to an overfull line within the hour and runs
// event extras only while crowds travel.

export default async function({open,ok,saveText,out}){
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
