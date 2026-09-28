// #105's default option A: once the first flight has departed, the advisor offers one tip to try 4x while the game
// is still under 4x (docs/systems/guided-start.md doesn't cover this; see docs/SYSTEMS.md "Views and phone layout").
// It changes no pacing. Shown once per save (G.tip4x): reaching 4x by any control resolves it, not just its own
// button, and it never shows during the guided start, the headless sim (bot.js reads advise() every step; a tip
// that could never resolve there would crowd out every other one for the rest of the run) or while two toasts are up.
export default async function({open,ok}){
  const {ctx,page,errs}=await open(undefined,null,false,{still:true});
  const r=await page.evaluate(()=>{
    const S=__sim,G=S.G,R=S.R;
    G.tour.done=1;R.speed=1; // past the guided start
    const before=S.advise();
    G.flights=1;
    const after=S.advise();
    S.renderTip();
    const el=document.querySelector('#tip'),shown=!el.hidden,hasBtn=!!el.querySelector('[data-tipspeed="4"]');
    el.querySelector('[data-tipspeed]').click();
    const afterClick={speed:R.speed,tip4x:G.tip4x,hidden:el.hidden};
    R.speed=1; // drop back to 1x: it must not return
    const again=S.advise();
    return {before,after:after&&{sp:after.sp,label:after.label},shown,hasBtn,afterClick,again};
  });
  ok('speed-tip: offered once the first flight departs, while still under 4x',
    !r.before&&r.after&&r.after.sp===4&&r.shown&&r.hasBtn,JSON.stringify(r));
  ok('speed-tip: clicking it sets the speed and never offers it again on this save',
    r.afterClick.speed===4&&r.afterClick.tip4x===1&&r.afterClick.hidden&&!r.again,
    JSON.stringify(r.afterClick)+' '+JSON.stringify(r.again));

  const ordinary=await page.evaluate(()=>{
    const S=__sim,G=S.G,R=S.R;
    G.tip4x=false;G.tour.done=1;G.flights=1;R.speed=1;
    const before=S.advise();
    R.speed=4; // the player used the ordinary speed control, not the tip's own button
    const resolved=S.advise();
    R.speed=1;
    const again=S.advise();
    return {before:before&&before.sp,resolved,tip4x:G.tip4x,again};
  });
  ok('speed-tip: reaching 4x by the ordinary speed control resolves it too, so it never gets stuck blocking every other tip',
    ordinary.before===4&&!ordinary.resolved&&ordinary.tip4x===1&&!ordinary.again,JSON.stringify(ordinary));

  const guided=await page.evaluate(()=>{
    const S=__sim,G=S.G,R=S.R;
    G.tip4x=false;G.flights=1;R.speed=1;
    G.tour={s:0}; // the guided start is still running
    const during=S.advise();
    G.tour.done=1;
    const after=S.advise();
    return {during,after:after&&after.sp};
  });
  ok('speed-tip: never offered while the guided start is still running',
    !guided.during&&guided.after===4,JSON.stringify(guided));

  const sim=await page.evaluate(()=>{
    const S=__sim,G=S.G,R=S.R;
    G.tip4x=false;G.tour.done=1;G.flights=1;R.speed=1;R.sim=true;
    const during=S.advise();
    R.sim=false;
    const after=S.advise();
    return {during,after:after&&after.sp,tip4x:G.tip4x};
  });
  ok('speed-tip: never offered in the headless sim, which could never resolve it',
    !sim.during&&sim.after===4&&!sim.tip4x,JSON.stringify(sim));

  const jumble=await page.evaluate(()=>{
    const S=__sim,G=S.G,R=S.R;
    G.tip4x=false;G.tour.done=1;G.flights=1;R.speed=1;R.toasts.length=0;
    S.renderTip();const alone=!document.querySelector('#tip').hidden;
    S.toast('One',null,'j1','',60);S.toast('Two',null,'j2','',60);
    S.renderTip();const withTwo=document.querySelector('#tip').hidden;
    R.toasts.length=0;
    return {alone,withTwo};
  });
  ok('speed-tip: holds back while two toasts are already up',
    jumble.alone&&jumble.withTwo,JSON.stringify(jumble));

  if(errs.length)ok('speed-tip: no page errors',false,errs[0]);
  await ctx.close();
}
