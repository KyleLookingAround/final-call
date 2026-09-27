// A rating that reflects the last day (04-effects.js, docs/systems/effects.md): on by default, it moves over a seeded day
// with fog and storms in the morning, stays inside its 5–100 floor and cap, and saves from every version still load;
// window.__rateDay=false (never saved) still plays the old running sum, for comparing.
export default async function({browser,url,ok,saves,saveText,newest}){
  const open=async(save,rateDay)=>{const ctx=await browser.newContext({viewport:{width:1280,height:800}});
    await ctx.addInitScript(([s,rd])=>{window.__seed=1;window.requestAnimationFrame=()=>0;if(rd!=null)window.__rateDay=rd;localStorage.setItem('final-call-save-v2',s)},[save,rateDay]);
    const page=await ctx.newPage(),errs=[];page.on('pageerror',e=>errs.push(e.message));await page.goto(url);await page.waitForTimeout(500);return {ctx,page,errs}};

  // on by default and never saved; switched off, a change goes straight onto the rating as before
  {const on=await open(saveText(newest),null),r0=await on.page.evaluate(()=>({on:!!__sim.R.rateDay,saved:'rateDay' in __sim.G||'rdB' in __sim.G}));await on.ctx.close();
    ok('rating-day: on by default, and nothing of it is saved',r0.on&&!r0.saved,JSON.stringify(r0))}
  {const {ctx,page,errs}=await open(saveText(newest),false);
    const r=await page.evaluate(()=>{const S=__sim;S.R.sim=true;const rep0=S.G.rep;S.repAdj(-3,'late');return {on:S.R.rateDay,moved:S.G.rep-rep0,saved:'rateDay' in S.G||'rdB' in S.G}});
    ok('rating-day: switched off, a change goes straight onto the rating',r.on==null&&Math.abs(r.moved+3)<1e-9&&!r.saved&&!errs.length,errs[0]||`moved ${r.moved}`);await ctx.close()}

  // on: a level 9 airport plays a day to fill its rolling score, then the next day twice from the same seed, once
  // clear and once with fog and storms from 06:00 to 12:00, the rating read every hour
  const day=async fog=>{const {ctx,page,errs}=await open(saveText(newest),null);
    const r=await page.evaluate(fog=>{const S=__sim,G=S.G,R=S.R;R.sim=true;const on=!!R.rateDay,out=[];
      const day=Math.floor(G.clock/1440)*1440+2880;while(G.clock<day)S.update(0.1);
      const reps=[];for(let h=0;h<24;h++){if(fog&&h>=6&&h<12){R.fx.fog=G.clock+61;R.fx.storm=G.clock+61}
        for(let k=0;k<600;k++){S.update(0.1);if(G.rep<5||G.rep>100)out.push(G.rep)}reps.push(+G.rep.toFixed(2))}
      R.sim=false;return {on,reps,out}},fog);await ctx.close();return {...r,errs}};
  {const clear=await day(false),bad=await day(true),all=[...clear.reps,...bad.reps],errs=[...clear.errs,...bad.errs];
    const lo=Math.min(...bad.reps),hi=Math.max(...bad.reps),gap=clear.reps[13]-bad.reps[13];
    ok('rating-day: the rating moves over a seeded day with bad weather',bad.on&&hi-lo>=1&&!errs.length,errs[0]||`hourly ${bad.reps.join(' ')}`);
    ok('rating-day: the fog and storms pull the rating down that morning',gap>=1,`at 14:00 clear ${clear.reps[13]}, fog and storms ${bad.reps[13]}`);
    const out=[...clear.out,...bad.out];
    ok('rating-day: the rating stays inside its 5–100 floor and cap',!out.length,out.length?'went to '+out.slice(0,3).join(', '):`${Math.min(...all)}–${Math.max(...all)}`)}

  // on: saves from every version load and play an hour without errors
  {const bad=[];for(const f of saves){const {ctx,page,errs}=await open(saveText(f),null);
      const r=await page.evaluate(()=>{const S=__sim;S.R.sim=true;const rep=S.G.rep;for(let k=0;k<600;k++)S.update(0.1);return {on:!!S.R.rateDay,rep,now:S.G.rep}});
      if(!r.on||errs.length||!(r.now>=5&&r.now<=100))bad.push(f+': '+(errs[0]||JSON.stringify(r)));await ctx.close()}
    ok('rating-day: saves from every version load and play an hour',!bad.length,bad.length?bad.slice(0,2).join('; '):saves.length+' saves')}
}
