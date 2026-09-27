// Weather you can see (src/game/54-weather.js, docs/specs/real-airport.md): rain, settled snow, puddles, fog and cloud
// shadows draw only while R.fx says they're on (fading out after, never a new saved field), settled snow is cleared from
// every built stand, and the windsock is always up.
export default async function({open,ok,saveText,newest}){
  const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});
  const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,c=document.querySelector('#cv').getContext('2d');
    const realNow=performance.now.bind(performance);performance.now=()=>12345000; // one frozen instant, so two draws differ only in R.fx
    const region=(x,y,rad)=>{const k=S.viewK()*R.dpr,s=Math.max(2,Math.round(rad*k)),px=Math.round((x-R.cam.x)*k-s/2),py=Math.round((y-R.cam.y)*k-s/2);
      const d=c.getImageData(px,py,s,s).data;let t=0;for(let i=0;i<d.length;i+=8)t+=d[i];return t};
    // a draw of the game centred tightly on (x,y), then the pixels straight around it. A camera move's first draw can
    // read back differently from the next identical one (a one-off paint quirk, same as scene.mjs's own calibration
    // warm-up), so settle it with a throwaway draw before the one that's measured
    const shot=(x,y)=>{R.cam.z=1.2;R.cam.tx=null;const k=S.viewK();R.cam.x=x-R.sw/k/2;R.cam.y=y-R.sh/k/2;S.clampCam();
      S.draw();c.getImageData(0,0,1,1);S.draw();return region(x,y,22)};
    const whole=()=>{const cv=document.querySelector('#cv'),d=c.getImageData(0,0,cv.width,cv.height).data;let t=0;for(let i=0;i<d.length;i+=8)t+=d[i];return t};
    // an apron point clear of every built stand, and a built stand's own centre; the runway's top comes from the
    // windsock's own position (S.AF_Y gives the same)
    const afY=S.windsockPos()[1]-60;
    const boxes=S.SIDX.filter(i=>G.stands[i].built).map(S.standBox);
    let openPt=null;
    for(let y=afY+24;y<S.TERM_Y-16&&!openPt;y+=8)for(let x=16;x<S.W-16&&!openPt;x+=16){
      if(boxes.every(([bx,by,bw,bh])=>x<bx||x>bx+bw||y<by||y>by+bh))openPt=[x,y];}
    const standPt=[boxes[0][0]+boxes[0][2]/2,boxes[0][1]+boxes[0][3]/2];
    const windPt=S.windsockPos(),skyPt=[windPt[0]-300,windPt[1]];
    G.clock=100000;for(const k2 of ['rain','snow','fog','storm'])R.fx[k2]=0;
    const base={open:shot(...openPt),stand:shot(...standPt),wind:shot(...windPt),sky:shot(...skyPt)};
    // settled snow: covers the open apron but is clipped out over every built stand; splice out the falling-snow layer
    // (also gated on R.fx.snow, but drawn over everything including the stands) so only the settled wash is measured
    const wi=S.LAYER.weather.indexOf(S.wxFalling);S.LAYER.weather.splice(wi,1);
    R.fx.snow=G.clock+50;const snowOn={open:shot(...openPt),stand:shot(...standPt)};
    R.fx.snow=G.clock-45;const snowGone={open:shot(...openPt)}; // long past the 40-minute fade
    S.LAYER.weather.splice(wi,0,S.wxFalling);R.fx.snow=0;
    // rain and its puddles, and their fade after
    R.fx.rain=G.clock+50;const rainOn={open:shot(...openPt)};
    R.fx.rain=G.clock-25;const rainGone={open:shot(...openPt)}; // long past the 20-minute fade
    R.fx.rain=0;
    // fog banks
    R.cam.z=0.01;R.cam.tx=null;S.clampCam();S.clampCam();S.draw();c.getImageData(0,0,1,1); // settle this camera move once
    R.fx.fog=G.clock+50;S.draw();const fogOn=whole();
    R.fx.fog=G.clock-5;S.draw();const fogGone=whole();
    R.fx.fog=0;S.draw();const fogBase=whole();
    performance.now=realNow;
    return {base,snowOn,snowGone,rainOn,rainGone,fogOn,fogGone,fogBase,
      decay:{wetNow:S.wetness(),snowNow:S.snowCover(),wetPast:(()=>{R.fx.rain=G.clock-25;const v=S.wetness();R.fx.rain=0;return v})(),
        snowPast:(()=>{R.fx.snow=G.clock-45;const v=S.snowCover();R.fx.snow=0;return v})()}};
  });
  ok('weather: settled snow covers the open apron but is cleared from every built stand, and fades after',
    r.snowOn.open!==r.base.open&&r.snowOn.stand===r.base.stand&&r.snowGone.open===r.base.open,JSON.stringify({base:r.base,snowOn:r.snowOn,snowGone:r.snowGone}));
  ok('weather: rain and its puddles show only while it rains, and fade after',
    r.rainOn.open!==r.base.open&&r.rainGone.open===r.base.open,JSON.stringify({base:r.base,rainOn:r.rainOn,rainGone:r.rainGone}));
  ok('weather: fog banks show only while fog is on',r.fogOn!==r.fogBase&&r.fogGone===r.fogBase,JSON.stringify({fogOn:r.fogOn,fogGone:r.fogGone,fogBase:r.fogBase}));
  ok('weather: the windsock is always up',r.base.wind!==r.base.sky,JSON.stringify(r.base));
  ok('weather: wetness and snow cover are read straight off R.fx, with no state of their own',
    r.decay.wetNow===0&&r.decay.snowNow===0&&r.decay.wetPast===0&&r.decay.snowPast===0,JSON.stringify(r.decay));
  ok('weather: draws without error',!errs.length,errs[0]||'');
  await ctx.close();
}
