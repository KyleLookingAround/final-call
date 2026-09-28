// A new game starts the guided first hour, and it advances. On a phone, step 2's spotlight never points at ground the
// map toolbar covers, the toolbar's background never swallows a tap meant for the map underneath it, and Help (or any
// overlay) hides the coach and spotlight rather than draw over them (issue #103).

export default async function({open,ok}){
  for(const vp of [{width:320,height:568},{width:390,height:844},{width:1440,height:900}]){
    const {ctx,page,errs}=await open(vp,null,vp.width<900);
    const a=await page.evaluate(()=>({s:__sim.G.tour.s,coach:!document.querySelector('#coach').hidden}));
    await page.click('[data-tnext]');await page.waitForTimeout(400);
    const b=await page.evaluate(()=>({s:__sim.G.tour.s,spot:!document.querySelector('#spot').hidden}));
    ok(`tour: ${vp.width}px`,a.coach&&a.s===0&&b.s===1&&b.spot&&!errs.length,JSON.stringify([a,b]));
    if(vp.width<900){
      const r=await page.evaluate(()=>{
        const spot=document.querySelector('#spot').getBoundingClientRect(),hud=document.querySelector('.hud').getBoundingClientRect();
        const overlap=!(spot.right<hud.left||spot.left>hud.right||spot.bottom<hud.top||spot.top>hud.bottom);
        const bg=getComputedStyle(document.querySelector('.hud')).pointerEvents,btn=getComputedStyle(document.querySelector('#helpb')).pointerEvents;
        return {overlap,bg,btn};
      });
      ok(`tour: step 2's spotlight clears the map toolbar at ${vp.width}px`,!r.overlap,JSON.stringify(r));
      ok(`tour: the toolbar's own background never blocks a tap at ${vp.width}px`,r.bg==='none'&&r.btn==='auto',JSON.stringify(r));
      await page.click('#helpb');await page.waitForTimeout(200);
      const c=await page.evaluate(()=>({coach:!document.querySelector('#coach').hidden,spot:!document.querySelector('#spot').hidden}));
      ok(`tour: Help hides the coach and spotlight at ${vp.width}px`,!c.coach&&!c.spot,JSON.stringify(c));
    }
    await ctx.close();
  }
}
