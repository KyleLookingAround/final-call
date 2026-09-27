// How passengers are seen to move (07-passengers.js walkMul, 41-airside.js walk, 12-drawing.js paxEase and drawMover):
// over a seeded half hour at the 1× frame step, nobody drawn walking moves faster than a walking top speed, and no one's
// drawn speed jumps by more than a set factor from one step to the next. The only exceptions are named, drawn changes:
// boarding a train, the people mover or a bus (hidden, drawn as it), appearing again (drawn where they are), and stepping
// onto a walkway link (drawn), where the pace doubles.
// Run on Classic with the people mover, and on layouts with walkway links (Round) and trains (Satellite).
// Speeds are in px per game minute: the top is the moving walkways upgrade's best pace (80×2.6×1.35) and a little to catch
// up; a walkway link doubles it, and a layout built for connections (LAY.xfer) speeds connecting passengers, drawn ringed.
const STEP=0.034,TOP=330,FACTOR=1.5,FLOOR=40; // from a standstill (under FLOOR) anyone may set off
export default async function({open,ok,saveText,newest}){
  for(const lay of ['classic','round','sat']){
    const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});
    const r=await page.evaluate(([lay,STEP,TOP,FACTOR,FLOOR])=>{const S=__sim,G=S.G,R=S.R;R.sim=true;
      if(lay!=='classic'){S.switchLayout(lay);S.SIDX.forEach(i=>{G.stands[i].built=true})}
      for(let i=0;i<600;i++)S.update(0.1); // an hour in, so every stand is busy
      const hidden=S.paxHidden||(p=>p.riding||(p.state==='bridge'||p.state==='dBridge')&&S.STAND_KIND[p.stand]==='remote');
      const last=new Map(),off=new Map(),fast={},jump={},ex=[];let steps=0,riders=0,snaps=0,maxV=0;
      const note=(o,k,v)=>{o[k]=(o[k]||0)+1;if(ex.length<6)ex.push(k+' '+Math.round(v))};
      for(let s=0;s<Math.round(30/STEP);s++){
        const pre=new Map();if(!S.paxEase)for(const p of R.pax)pre.set(p,[p.x,p.y]);
        S.update(STEP);
        for(const p of R.pax){
          if(hidden(p)){p.et=NaN;last.delete(p);if(S.onMover&&S.onMover(p))riders++;continue} // as drawPax: drawn as what they ride
          let v;
          if(S.paxEase){S.paxEase(p);if(p.snap){snaps++;last.delete(p);continue}v=p.ev}
          else{const a=pre.get(p);if(!a)continue;v=Math.hypot(p.x-a[0],p.y-a[1])/STEP}
          steps++;maxV=Math.max(maxV,v);
          const u=last.get(p),onWay=p.way&&p.way[p.wi+3]===2;if(onWay)off.set(p,G.clock);
          const easing=G.clock-(off.get(p)??-9)<0.5; // stepping onto a walkway link, and easing down for half a minute after
          if(v>TOP*(onWay||easing?2:1)*(p.xferred&&S.LAY.xfer||1)&&!(u>v))note(fast,p.state,v); // slowing down is fine
          if(u!=null&&u>=FLOOR&&v>u*FACTOR&&!onWay)note(jump,p.state,v/u);
          last.set(p,v);
        }
      }
      return {steps,riders,snaps,maxV:Math.round(maxV),fast,jump,ex,mover:G.lv.mover,track:!!S.LAY.track};
    },[lay,STEP,TOP,FACTOR,FLOOR]);
    const n=o=>Object.values(o).reduce((a,b)=>a+b,0);
    ok(`movement: on ${lay}, nobody drawn walking goes faster than ${TOP} px a minute`,r.steps>1000&&!n(r.fast),
      `max ${r.maxV} over ${r.steps} steps; ${JSON.stringify(r.fast)} ${r.ex.join(', ')}`);
    ok(`movement: on ${lay}, no drawn speed jumps more than ${FACTOR}× in a step`,r.steps>1000&&!n(r.jump),
      `${JSON.stringify(r.jump)}; snapped ${r.snaps}`);
    if(lay==='classic')ok('movement: people mover riders are drawn as its cars',r.mover&&r.track&&r.riders>0,`${r.riders} rider-steps`);
    if(errs.length)ok(`movement: no page errors on ${lay}`,false,errs[0]);
    await ctx.close();
  }
}
