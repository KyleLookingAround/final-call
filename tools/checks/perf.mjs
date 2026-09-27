// How long a level 9 airport, and a fully built sixteen-stand Midfield, take to simulate, against a calibration run
// so machines compare (fails over its budget), and how close a CPU-throttled phone gets to full speed at 8x with each
// (reported only).

export default async function({open,ok,saveText,newest}){
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
