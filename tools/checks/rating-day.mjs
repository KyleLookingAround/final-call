// A rating that reflects the last day (04-effects.js, docs/systems/effects.md), behind the runtime switch R.rateDay that
// window.__rateDay turns on: off, the rating is a running sum as before; on, it moves over a seeded day with fog and
// storms in the morning, stays inside its 5–100 floor and cap, and saves from every version still load.
export default async function({browser,url,ok,saves,saveText,newest}){
  const open=async(save,rateDay)=>{const ctx=await browser.newContext({viewport:{width:1280,height:800}});
    await ctx.addInitScript(([s,rd])=>{window.__seed=1;window.requestAnimationFrame=()=>0;if(rd)window.__rateDay=rd;localStorage.setItem('final-call-save-v2',s)},[save,rateDay]);
    const page=await ctx.newPage(),errs=[];page.on('pageerror',e=>errs.push(e.message));await page.goto(url);await page.waitForTimeout(500);return {ctx,page,errs}};

  // off by default: nothing sets it, and nothing saves it
  {const {ctx,page,errs}=await open(saveText(newest),null);
    const r=await page.evaluate(()=>{const S=__sim;S.R.sim=true;const rep0=S.G.rep;S.repAdj(-3,'late');return {on:S.R.rateDay,moved:S.G.rep-rep0,saved:'rateDay' in S.G||'rdB' in S.G}});
    ok('rating-day: off by default, a change goes straight onto the rating',r.on==null&&Math.abs(r.moved+3)<1e-9&&!r.saved&&!errs.length,errs[0]||`moved ${r.moved}`);await ctx.close()}

  // on: a level 9 day with fog and storms from 06:00 to 12:00, the rating read every hour
  {const {ctx,page,errs}=await open(saveText(newest),true);
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;R.sim=true;const on=!!R.rateDay,rep0=G.rep;
      const day=Math.floor(G.clock/1440)*1440+1440;while(G.clock<day)S.update(0.1); // to midnight, so the rolling day fills first
      const reps=[],still=[];for(let h=0;h<24;h++){if(h>=6&&h<12){R.fx.fog=G.clock+61;R.fx.storm=G.clock+61}
        const r0=G.rep;for(let k=0;k<600;k++){S.update(0.1);if(G.rep<5||G.rep>100)still.push(G.rep)}reps.push(+G.rep.toFixed(2));if(G.rep===r0)still.push('h'+h)}
      R.sim=false;return {on,rep0,reps,out:still.filter(x=>typeof x==='number'),held:still.filter(x=>typeof x==='string').length}});
    const lo=Math.min(...r.reps),hi=Math.max(...r.reps),fogLow=Math.min(...r.reps.slice(6,14)),before=r.reps[5];
    ok('rating-day: on, the rating moves over a seeded day with bad weather',r.on&&hi-lo>=3&&!errs.length,errs[0]||`hourly ${r.reps.join(' ')}`);
    ok('rating-day: on, the fog and storms pull the rating down that morning',fogLow<before-1,`05:00 ${before}, lowest to 13:00 ${fogLow}`);
    ok('rating-day: on, the rating stays inside its 5–100 floor and cap',!r.out.length,r.out.length?'went to '+r.out.slice(0,3).join(', '):`${lo}–${hi}`);
    await ctx.close()}

  // on: saves from every version load and play an hour without errors
  {const bad=[];for(const f of saves){const {ctx,page,errs}=await open(saveText(f),true);
      const r=await page.evaluate(()=>{const S=__sim;S.R.sim=true;const rep=S.G.rep;for(let k=0;k<600;k++)S.update(0.1);return {on:!!S.R.rateDay,rep,now:S.G.rep}});
      if(!r.on||errs.length||!(r.now>=5&&r.now<=100))bad.push(f+': '+(errs[0]||JSON.stringify(r)));await ctx.close()}
    ok('rating-day: on, saves from every version load and play an hour',!bad.length,bad.length?bad.slice(0,2).join('; '):saves.length+' saves')}
}
