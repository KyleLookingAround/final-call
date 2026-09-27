// A new game starts the guided first hour, and it advances.

export default async function({open,ok}){
  for(const vp of [{width:390,height:844},{width:1440,height:900}]){
    const {ctx,page,errs}=await open(vp,null,vp.width<900);
    const a=await page.evaluate(()=>({s:__sim.G.tour.s,coach:!document.querySelector('#coach').hidden}));
    await page.click('[data-tnext]');await page.waitForTimeout(400);
    const b=await page.evaluate(()=>({s:__sim.G.tour.s,spot:!document.querySelector('#spot').hidden}));
    ok(`tour: ${vp.width}px`,a.coach&&a.s===0&&b.s===1&&b.spot&&!errs.length,JSON.stringify([a,b]));
    await ctx.close();
  }
}
