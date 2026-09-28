// Two phone bugs from the owner (#119, #120): stand cards overlapping, and the Pier B people mover's car snapping
// between the piers. Each check fails on main before its fix. (#121, passengers walking through a wall, is still
// open: see the comment on the issue and docs/lessons/ for what was found.)
export default async function({open,ok,saveText,newest}){
  // #119: no two stand cards (or a card and a tag) ever overlap, at phone, tablet and desktop widths, over a seeded
  // busy hour on Classic with Pier B. placeGateCards (12-drawing.js) is the same function the game draws with.
  for(const [name,vp] of [['phone',{width:390,height:844}],['tablet',{width:768,height:1024}],['desktop',{width:1440,height:900}]]){
    const {ctx,page,errs}=await open(vp,saveText(newest),vp.width<600,{still:true});
    const r=await page.evaluate(()=>{
      const S=__sim,G=S.G,R=S.R;R.sim=true;
      let overlaps=0,frames=0,cards=0,tested=0,ex=null;
      for(let i=0;i<600;i++){ // an hour in, so stands turn over between built, boarding and deplaning
        S.update(0.1);
        if(i%5)continue; // a rect check every half minute of game time is plenty; drawing itself runs every frame
        frames++;
        S.sceneView(S.derived());
        const built=S.SIDX.filter(k=>G.stands[k].built);
        const placed=S.placeGateCards(built,(S.V.x0+S.V.x1)/2,(S.V.y0+S.V.y1)/2);
        const rects=placed.map(([k,dy])=>{const b=S.badgeRect(k);return dy==null?S.tagRect(b):[b[0],b[1]+dy,b[2],b[3]]});
        cards+=rects.length;
        for(let a=0;a<rects.length;a++)for(let b=a+1;b<rects.length;b++){tested++;if(S.rectsOverlap(rects[a],rects[b])){overlaps++;if(!ex)ex=`${built[a]}×${built[b]} at clock ${Math.round(G.clock)}`}}
      }
      return {overlaps,frames,cards,tested,ex};
    });
    ok(`phone-bugs: no two stand cards overlap at ${name}`,r.overlaps===0&&r.tested>0,r.ex||`${r.cards} cards over ${r.frames} frames, ${r.tested} pairs tested`);
    if(errs.length)ok(`phone-bugs: no page errors (cards, ${name})`,false,errs[0]);
    await ctx.close();
  }

  // #120: the mover's drawn car never jumps more than its own matching distance between frames, whether it's carrying a
  // group, empty and shuttling, or switching between the two. Frames are timed by hand (V.t) so the check runs fast
  // regardless of wall-clock speed, at both a normal frame gap and a slow one (dropped frames, or 8× zoomed in).
  {
    const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});
    const r=await page.evaluate(()=>{
      const S=__sim,G=S.G,R=S.R;R.sim=true;
      S.sceneView(S.derived());S.V.t=0;
      const cap=S.MV_MATCH,seen=new Map();let maxJump=0,frames=0,sawRider=false,sawShuttle=false,sawSwitch=false,wasEmpty=null;
      for(let i=0;i<2400;i++){
        S.update(0.05*(1+(i%3))); // mixes 1×-ish and faster steps, as the game does at higher speeds
        S.V.t+=(i%17===0)?0.3:1/60; // an occasional slow frame among normal ones
        S.drawPax(S.V);frames++;
        const empty=!S.MV_CARS.some(c=>!c.shuttle);
        if(wasEmpty!=null&&wasEmpty!==empty)sawSwitch=true;
        wasEmpty=empty;
        for(const c of S.MV_CARS){
          if(!c.shuttle)sawRider=true;else sawShuttle=true;
          const prev=seen.get(c);
          if(prev)maxJump=Math.max(maxJump,Math.hypot(c.x-prev.x,c.y-prev.y));
          seen.set(c,{x:c.x,y:c.y});
        }
      }
      return {maxJump:Math.round(maxJump),cap,frames,sawRider,sawShuttle,sawSwitch,mover:G.lv.mover,track:!!S.LAY.track};
    });
    ok('phone-bugs: the mover exists to test (Pier B, the mover bought)',r.mover&&r.track,JSON.stringify(r));
    ok(`phone-bugs: the mover car never jumps more than ${r.cap}px between frames`,r.maxJump<=r.cap,`max ${r.maxJump}px over ${r.frames} frames`);
    ok('phone-bugs: saw both a rider car and the empty shuttle',r.sawRider&&r.sawShuttle,JSON.stringify(r));
    if(errs.length)ok('phone-bugs: no page errors (mover)',false,errs[0]);
    await ctx.close();
  }
}
