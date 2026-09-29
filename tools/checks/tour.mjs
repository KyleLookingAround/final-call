// A new game starts the guided first hour, and it advances. On a phone, step 2's spotlight never points at ground the
// map toolbar covers, the toolbar's background never swallows a tap meant for the map underneath it, and Help (or any
// overlay) hides the coach and spotlight rather than draw over them (issue #103). Step 3 accepts 2x or more, not only
// 4x; step 4's spotlit target scrolls into view when it's off-screen; step 5 has a Next button and never mentions the
// board, which landscape doesn't show.

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
  // row 14: step 3 needs only 2x, not 4x
  {const {ctx,page,errs}=await open({width:390,height:844},null,true);
    const r=await page.evaluate(()=>{const S=__sim,G=S.G;G.tour={s:2};S.setSpeed(2);S.tourStep();return {s:G.tour.s}});
    ok('tour: step 3 accepts 2x or more, not only 4x',r.s===3&&!errs.length,JSON.stringify(r));
    await ctx.close();}
  // row 13: step 5 has a Next button (no need to wait 5-11 min for an on-time flight) and never mentions the board
  {const {ctx,page,errs}=await open({width:844,height:390},null,true);
    const r=await page.evaluate(()=>{const S=__sim,G=S.G;G.tour={s:4};S.tourStep();
      return {next:!!document.querySelector('#coach [data-tnext]'),text:document.querySelector('#coach').textContent}});
    ok('tour: step 5 has a Next button and never mentions the board',r.next&&!/\bboard\b/i.test(r.text)&&!errs.length,JSON.stringify(r));
    await ctx.close();}
  // row 15: step 4's spotlit desk button scrolls into view when it's off-screen at 320px
  {const {ctx,page,errs}=await open({width:320,height:568},null,true);
    const r=await page.evaluate(()=>{const S=__sim,G=S.G;S.setTab('terminal');G.tour={s:3};
      const el=document.querySelector('[data-buy="desks"]')||document.querySelector('[data-tab="terminal"]'),panel=el.closest('.panel');
      if(panel)panel.scrollTop=panel.scrollHeight; // push the target out of view first, as a tall terminal panel would
      const before=el.getBoundingClientRect();S.tourStep();
      const spot=document.querySelector('#spot'),after=spot.getBoundingClientRect();
      return {beforeOff:before.bottom>innerHeight||before.top<0,hidden:spot.hidden,top:after.top,bottom:after.bottom,vh:innerHeight}});
    ok("tour: step 4's spotlit target scrolls into view when it's off-screen at 320px",
      r.beforeOff&&!r.hidden&&r.top>=-10&&r.bottom<=r.vh+10&&!errs.length,JSON.stringify(r));
    await ctx.close();}
}
