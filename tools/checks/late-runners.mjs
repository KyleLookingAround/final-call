// Late runners and passengers' stories (61-late-runners.js, docs/systems/late-runners.md): at final call anyone still
// walking to the gate runs, faster than they walk, and either boards or misses; a flight with runners shows GATE CLOSING;
// a runner the gate closes on costs a little rating at its stand and leaves the flight; tapping a passenger opens their
// story with a timeline; a day headless throws nothing.
export default async function({open,ok,saveText}){
  const save=saveText('v29-L5.json');
  // late gate calls, so more passengers are still out at final call, for eight hours: each runner watched every step, and
  // faster than they walk (or at the top pace, RUN_TOP, for those who already walk near it)
  {const {ctx,page,errs}=await open(undefined,save,false,{still:true});
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;G.set.autoDuty=false;(G.pol||(G.pol={})).gates=30;R.sim=true;
      const L0={...S.RUN_LOG},seen=new Set(),pace=[];let closing=0,closingNoRun=0,early=null,lines=0;
      for(let k=0;k<8*600;k++){
        const before=new Map();for(const p of R.pax)if(p.state==='toGate'&&!p.way)before.set(p,[p.x,p.y,p.tx,p.ty]);
        S.update(0.1);const D=S.derived();
        for(const [p,[x,y,tx,ty]] of before){const t=S.taleOf(p);if(!t||t.run!==1&&t.run!==2||p.state!=='toGate'||p.way||tx!==p.tx||ty!==p.ty)continue;
          const d=Math.hypot(p.x-x,p.y-y),left=Math.hypot(p.tx-p.x,p.ty-p.y);if(left<1)continue;seen.add(p);
          const w=D.cwalk*p.spd*S.walkMul(p);pace.push(d/0.1/Math.min(w,S.RUN_TOP/1.16));if(G.clock<p.F.std-S.RUN_AT&&!S.runsOf(p.F).fc&&!t.ev.some(e=>e[1]==='linger')&&!early)early=`${p.F.code}${p.F.no} ran at ${Math.round(p.F.std-G.clock)} min to go`}
        if(k%10)continue;
        for(const i of S.SIDX){const F=R.st[i].F;if(!F||F.freighter)continue;const s=S.statusText(F);if(s==='GATE CLOSING'){closing++;const u=S.runsOf(F);if(!u||!u.n)closingNoRun++}}
        if(k%600===0)for(const p of R.pax){const t=S.taleOf(p);if(t&&!p.inbound)lines=Math.max(lines,S.taleLines(p).length)}
      }
      pace.sort((a,b)=>a-b);R.sim=false;
      return {started:S.RUN_LOG.started-L0.started,boarded:S.RUN_LOG.boarded-L0.boarded,missed:S.RUN_LOG.missed-L0.missed,runners:seen.size,
        slow:pace.filter(v=>v<1.15).length,n:pace.length,med:+(pace[pace.length>>1]||0).toFixed(2),closing,closingNoRun,early,lines}});
    ok('late-runners: runners appear at final call, run faster than they walk, and board or miss',!errs.length&&r.started>0&&r.runners>0&&!r.early&&r.n>0&&r.slow/r.n<0.05&&r.boarded+r.missed>0,
      `${r.started} started, ${r.boarded} boarded, ${r.missed} missed; pace ${r.med}× walking (median of ${r.n} steps, ${r.slow} slower than 1.15×)`+(r.early?'; '+r.early:'')+(errs.length?' '+errs[0]:''));
    ok('late-runners: the board never shows GATE CLOSING without a runner on the way',!r.closingNoRun,`${r.closing} board-samples, ${r.closingNoRun} with no runner`);
    ok('late-runners: passengers carry a story with a timeline',r.lines>=4,`longest timeline ${r.lines} lines`);
    await ctx.close()}
  // a runner too slow to make it: the gate holds, then closes on them; it costs rating at the stand and the flight goes
  {const {ctx,page,errs}=await open(undefined,save,false,{still:true});
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;G.set.autoDuty=false;(G.pol||(G.pol={})).gates=30;(G.pol||(G.pol={})).late='close';R.sim=true;
      let slow=null,F=null,out=null,held=null,closing=0;
      for(let k=0;k<12*600&&!out;k++){S.update(0.1);
        if(!slow){for(const p of R.pax){const t=S.taleOf(p);if(t&&t.run===1&&p.state==='toGate'&&(p.way||Math.hypot(p.tx-p.x,p.ty-p.y)>60)){slow=p;F=p.F;p.spd=0.002;break}}continue}
        const t=S.taleOf(slow);if(t.run===1&&G.clock>=F.std-5&&S.statusText(F)==='GATE CLOSING')closing++;if(t.run===4){const ev=R.repEv.filter(e=>e[1]==='runner');out={booked:F.booked,state:slow.state,stand:ev.length?ev[ev.length-1][4]:null,want:slow.stand,rep:ev.reduce((a,e)=>a+e[2],0),at:Math.round(G.clock-F.std)}}
        else if(t.run===3){out={boarded:true};break}
        if(held==null&&S.runsOf(F)&&S.runsOf(F).holdAt!=null)held=Math.round(G.clock-F.std)}
      let gone=false;if(out&&!out.boarded)for(let k=0;k<600&&!gone;k++){S.update(0.1);gone=F.plane.state==='closing'||!R.st.some(s=>s.F===F)}
      R.sim=false;return {found:!!slow,out,gone,held,closing,lines:slow?S.taleLines(slow).map(l=>l[1]):[]}});
    const o=r.out||{};
    ok('late-runners: the gate holds, then closes on a runner who is too slow',r.found&&o.state==='missed'&&r.gone&&!errs.length,JSON.stringify({held:r.held,...o,gone:r.gone})+(errs.length?' '+errs[0]:''));
    ok('late-runners: the board shows GATE CLOSING while the runner is on the way',r.closing>0,`${r.closing} steps`);
    ok('late-runners: a missed runner costs rating at their stand',o.rep<0&&o.stand===o.want,`rating ${o.rep}, at stand ${o.stand} of ${o.want}`);
    ok('late-runners: a missed runner’s story says so',r.lines.some(l=>/Missed the flight/.test(l))&&r.lines.some(l=>/ran for gate/.test(l)),r.lines.join(' · '))}
  // tapping a passenger on the airport view opens their story, with a timeline; a tap elsewhere closes it
  {const {ctx,page,errs}=await open({width:1280,height:800},save,true);
    const r=await page.evaluate(async()=>{const S=__sim,G=S.G,R=S.R;R.speed=0;R.sim=true;for(let k=0;k<3*600;k++)S.update(0.1);R.sim=false;
      await new Promise(f=>requestAnimationFrame(()=>requestAnimationFrame(f)));
      const p=R.pax.find(p=>!p.inbound&&(p.state==='mkt'||p.state==='gate')&&S.taleOf(p)&&S.taleLines(p).length>=3);if(!p)return {none:true};
      R.cam.z*=2/S.viewK();const k=S.viewK(),x=(p.ex??p.x),y=(p.ey??p.y);R.cam.x=x-R.sw/k/2;R.cam.y=y-R.sh/k/2;R.cam.tx=R.cam.ty=null; // zoomed in, as a player would to pick one out
      S.tapAt((x-R.cam.x)*k,(y-R.cam.y)*k);
      const el=document.getElementById('paxcard'),open=!!el&&!el.hidden,li=el?el.querySelectorAll('.pct li').length:0,text=el?el.textContent:'';
      R.lastTap=0;S.tapAt(5,5);const closed=!el||el.hidden;
      return {open,li,text:text.slice(0,160),closed,sel:R.story}});
    await page.waitForTimeout(100);
    ok('late-runners: tapping a passenger opens their story with a timeline',!r.none&&r.open&&r.li>=3&&!errs.length,r.none?'no passenger with a story found':`${r.li} lines: ${r.text}`+(errs.length?' '+errs[0]:''));
    ok('late-runners: a tap elsewhere closes the story',r.closed,'');
    await ctx.close()}
  // a day headless, with runners and stories, throws nothing
  {const {ctx,page,errs}=await open(undefined,saveText('v29-L9.json'),false,{still:true});
    const r=await page.evaluate(()=>{const S=__sim,R=S.R;R.sim=true;let e=null;try{for(let k=0;k<24*600;k++)S.update(0.1)}catch(x){e=String(x)}R.sim=false;return {e,started:S.RUN_LOG.started}});
    ok('late-runners: a day headless at level 9 throws nothing',!r.e&&!errs.length,(r.e||errs[0]||'')+` ${r.started} runners`);
    await ctx.close()}
}
