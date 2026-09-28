// Day in a minute (src/game/63-day-in-a-minute.js, docs/systems/day-in-a-minute.md): after a seeded day the recording holds
// samples across the whole of it, within its caps and 2 MB, and nothing is recorded headless (R.sim); recording costs at
// most 0.01x of the perf budget; the Office's button plays it back, every frame draws without throwing on a desktop and
// a phone, and a tap stops it and puts the speed back; G and the random stream are the same with and without it.
const PERF_BUDGET=0.25; // perf.mjs: simulation ms per game minute over calibration ms

// plays the level 9 save for a day and a bit at the game's 0.1-minute steps, headless; with rec, the recorder takes its
// sample at each of its minutes as the game (not headless) would. Returns what the page ended with
async function day(page,rec){
  await page.evaluate(()=>{window.NOCLOCK=(k,v)=>k==='savedAt'?0:v}); // G without the wall clock it was saved at
  return page.evaluate(rec=>{const S=__sim,G=S.G,R=S.R;R.sim=true;
    const end=(Math.floor(G.clock/1440)+2)*1440+30;let last=Math.floor(G.clock);
    while(G.clock<end){S.update(0.1);const m=Math.floor(G.clock);if(m!==last){last=m;if(rec&&m%S.DIM_EVERY===0){R.sim=false;S.dayRec();R.sim=true}}}
    R.sim=false;const headless=R.dim; // the recorder, reached through the clock with R.sim, never records
    return {headless:!!headless,clock:G.clock}},rec);
}
export default async function({open,ok,saveText,newest}){
  const out={};
  // the same save and seed twice: once recorded and played back, once not. G and the next random number must match
  const runs=[];
  for(const [name,vp,touch] of [['desktop',{width:1280,height:800},false],['phone',{width:375,height:667},true],['none',{width:1280,height:800},false]]){
    const {ctx,page,errs}=await open(vp,saveText(newest),touch,{still:true});
    if(name==='none'){const h=await day(page,false);ok('day-in-a-minute: nothing is recorded headless',!h.headless,'');
      runs.push(await page.evaluate(()=>({G:JSON.stringify(__sim.G,NOCLOCK),r:__sim.rnd()})));await ctx.close();continue}
    await day(page,true);runs.push(await page.evaluate(()=>({G:JSON.stringify(__sim.G,NOCLOCK),r:__sim.rnd()})));
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,P=S.dimReady(),M=R.dim;
      const cal=()=>{const t=performance.now(),a=[];for(let i=0;i<2e5;i++)a.push({x:i%97,y:i%89});a.sort((p,q)=>p.x-q.x||p.y-q.y);let s=0;for(const p of a)s+=Math.hypot(p.x,p.y);return performance.now()-t+s*0};
      cal();const c=Math.min(cal(),cal(),cal());
      let t=performance.now();for(let i=0;i<200;i++)S.dimSample({cols:[]});const per=(performance.now()-t)/200/S.DIM_EVERY/c; // per game minute, over calibration
      const s=P?P.s:[],span=s.length?[s[0].c%1440,s[s.length-1].c%1440]:null;
      // the button in Office › Money, then every frame of the playback
      R.speed=2;G.tab='office';R.oSub='money';S.renderPanel();const b=document.querySelector('#panel [data-dim]'),g0=JSON.stringify(G,NOCLOCK);
      const out={samples:s.length,cap:S.DIM_CAP,span,today:M.cur.length,bytes:S.dimBytes(),per,button:!!b,fin:!!(P&&P.fin)};
      if(!b)return out;b.click();out.playing=!!R.dimT&&R.speed===0&&!document.querySelector('#dim').hidden;
      const T=R.dimT,frames=[];let thrown=null;const hours=new Set(),dark=[];
      try{for(let k=0;k<=100;k++){T.t0=performance.now()-k/100.5*T.dur*1000;S.draw();hours.add(Math.floor(S.V.hour));dark.push(S.V.d);
        frames.push(document.querySelector('#dimClock').textContent)}}catch(e){thrown=String(e&&e.stack||e).slice(0,300)}
      out.thrown=thrown;out.hours=hours.size;out.night=Math.max(...dark)>0.4&&Math.min(...dark)===0;
      out.clockMoves=new Set(frames).size>50;out.lastFl=document.querySelector('#dimFl').textContent;out.canvasOk=S.ctx?S.ctx.globalAlpha===1:true;
      document.querySelector('#dim').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
      out.stopped=!R.dimT&&R.speed===2&&document.querySelector('#dim').hidden;
      // and a playback left to run out stops by itself
      S.dimPlay();R.dimT.t0=performance.now()-R.dimT.dur*1000-10;S.draw();out.ends=!R.dimT&&R.speed===2;
      // and so does a tap on the panel's tabs, before the tab opens
      S.dimPlay();document.querySelector('#tabs [data-tab]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));out.tabStops=!R.dimT&&R.view==='airport';
      out.gSame=JSON.stringify(G,NOCLOCK)===g0;R.speed=0;return out});
    out[name]=r;
    // a recording made on one layout still plays after moving to another (stands it doesn't know are left empty)
    if(name==='desktop')r.otherLayout=await page.evaluate(()=>{const S=__sim;try{S.switchLayout('mid');S.G.pierB=true;S.SIDX.forEach(i=>{S.G.stands[i].built=true});
      S.dimPlay();for(let k=0;k<=20;k++){S.R.dimT.t0=performance.now()-k/20.5*S.R.dimT.dur*1000;S.draw()}S.dimStop();return 'ok'}catch(e){return String(e).slice(0,200)}});
    if(errs.length)ok(`day-in-a-minute: no page errors (${name})`,false,errs[0]);
    await ctx.close();
  }
  const d=out.desktop,p=out.phone;
  ok('day-in-a-minute: the recording holds the whole of yesterday within its caps',
    d.samples>=280&&d.samples<=d.cap&&d.span[0]<5&&d.span[1]>=1430&&d.today>0&&d.bytes<2*1024*1024&&d.fin,
    `${d.samples} samples (cap ${d.cap}) from minute ${d.span.map(Math.round).join(" to ")} into the day, ${d.today} today, ${(d.bytes/1024).toFixed(0)} KB, report ${d.fin}`);
  ok('day-in-a-minute: recording costs at most 0.01x of the perf budget',d.per<=PERF_BUDGET*0.01,`${d.per.toFixed(5)}x calibration a game minute (limit ${PERF_BUDGET*0.01}x)`);
  for(const [n,r] of [['desktop',d],['phone',p]]){
    ok(`day-in-a-minute: the Office's button plays it, and every frame draws (${n})`,r.button&&r.playing&&!r.thrown&&r.hours>=20&&r.night&&r.clockMoves,
      r.thrown||`button ${r.button}, playing ${r.playing}, ${r.hours} hours lit, night ${r.night}, clock moves ${r.clockMoves}, ${r.lastFl} flights at the end`);
    if(r.otherLayout)ok('day-in-a-minute: it still plays after a change of layout',r.otherLayout==='ok',r.otherLayout);
    ok(`day-in-a-minute: a tap on it or the panel stops it and puts the speed back; it stops by itself at the end (${n})`,r.stopped&&r.ends&&r.tabStops,`tap ${r.stopped}, end ${r.ends}, a tab ${r.tabStops}`);
  }
  const same=runs.every(x=>x.G===runs[2].G&&x.r===runs[2].r)&&d.gSame&&p.gSame;
  ok('day-in-a-minute: G and the random stream are the same with and without recording and playback',same,
    same?`${runs.length} runs match`:runs.map(x=>{const a=x.G,b=runs[2].G;let i=0;while(i<a.length&&a[i]===b[i])i++;return i>=a.length?'same':'differs at '+a.slice(Math.max(0,i-40),i+20)}).join(' | ')+` playback ${d.gSame}/${p.gSame}`);
}
