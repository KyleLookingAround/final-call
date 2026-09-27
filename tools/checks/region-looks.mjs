// The region map's look (29-region-map.js, docs/systems/region.md): drawing it at level 3, 5 and 9, by day, dusk and
// night, zoomed out and in, in rain and fog, changes nothing in G and throws nothing; the land is painted to its cache
// once, not every frame; the labels stay inside the view on a 320 px phone; and how long a frame of the level 9 region
// takes to draw on a desktop, against a calibration run (so machines compare).
const DRAW_BUDGET=0.2; // draw ms a frame over calibration ms, the worse of noon and night. Main before the restyle and
// the restyle both measured about 0.12x (the brief's 10% limit was measured against main in its PR); like the scene
// check's, the budget is about 1.6 times that, so CI's noise doesn't fail it but a real slowdown does
const CAL=()=>{const t=performance.now(),a=[];for(let i=0;i<2e5;i++)a.push({x:i%97,y:i%89});a.sort((p,q)=>p.x-q.x||p.y-q.y);let s=0;for(const p of a)s+=Math.hypot(p.x,p.y);return performance.now()-t+s*0};
const SAVES=['v32-L3.json','v32-L5.json','v32-L9.json'];
// into the region view, at an hour of the day, zoomed out ('out') or three times in on the airport ('in')
function at(h,zoom){const S=__sim,G=S.G,R=S.R;if(R.view!=='region'){S.setView('region');S.regionTick()}
  G.clock=Math.floor(G.clock/1440)*1440+h*60;R.cam.z=zoom==='in'?S.zMin()*3:S.zMin();const k=S.viewK();
  R.cam.x=900-R.sw/k/2;R.cam.y=600-R.sh/k/2;R.cam.tx=null;S.clampCam()}
export default async function({open,ok,saveText}){
  // drawing changes nothing in G, throws nothing, and paints the land once
  for(const f of SAVES){const {ctx,page,errs}=await open(undefined,saveText(f),false,{still:true});
    const r=await page.evaluate(at=>{at=eval('('+at+')');const S=__sim,G=S.G,R=S.R,bad=[];let thrown='',paints=0;
      R.sim=true;for(let i=0;i<240;i++)S.update(0.25);R.sim=false;
      G.wx=[{type:'rain',x:500,y:420,r:240,vx:0,vy:0,seed:3},{type:'fog',x:1200,y:520,r:200,vx:0,vy:0,seed:5}];R.fx.fog=G.clock+600;
      for(const zoom of ['out','in'])for(const h of [12,19.6,23]){at(h,zoom);const before=JSON.stringify(G);
        // drawn, then again as if the zoom had settled (so the land is painted for this view), then three more that mustn't paint it
        try{S.draw();R.regZT=-1e9;S.draw();const T=S.RTER;for(let i=0;i<3;i++)S.draw();if(S.RTER!==T)paints++}catch(e){thrown=thrown||String(e&&e.message||e)}
        if(JSON.stringify(G)!==before)bad.push(`${zoom} ${h}h`)}
      return {bad,thrown,paints}},at.toString());
    ok(`region-looks: drawing the ${f.slice(4,6)} region changes nothing in G and throws nothing`,!r.bad.length&&!r.thrown&&!errs.length,(r.bad.length?'G changed at '+r.bad.join(', '):'')+(r.thrown||errs[0]||''));
    ok(`region-looks: the ${f.slice(4,6)} land is painted once, not every frame`,!r.paints,r.paints?`painted again in ${r.paints} of 6 views`:'');
    await ctx.close()}
  // labels stay inside the view on a 320 px phone, zoomed out and in, over the airport and the city
  {const {ctx,page,errs}=await open({width:320,height:640},saveText('v32-L9.json'),true,{still:true});
  const r=await page.evaluate(at=>{at=eval('('+at+')');const S=__sim,R=S.R,out=[];let n=0;
    for(const zoom of ['out','in'])for(const x of [900,400,1300]){at(12,zoom);const k=S.viewK();R.cam.x=x-R.sw/k/2;S.clampCam();S.draw();
      for(const b of R.regLbl||[]){n++;if(b[0]<0||b[1]<0||b[2]>R.sw||b[3]>R.sh)out.push(`${zoom}@${x}: ${b.map(Math.round).join(',')}`)}}
    return {n,out,w:R.sw,h:R.sh}},at.toString());
  ok('region-looks: labels stay inside the view at 320 px',r.n>0&&!r.out.length&&!errs.length,`${r.n} labels in a ${Math.round(r.w)}x${Math.round(r.h)} view`+(r.out.length?'; outside: '+r.out.slice(0,3).join('; '):'')+(errs[0]||''));
  await ctx.close()}
  // a frame of the level 9 region on a desktop, zoomed out, at noon and at night
  {const {ctx,page,errs}=await open({width:1440,height:900},saveText('v32-L9.json'),false,{still:true});
  const r=await page.evaluate(([at,cal])=>{at=eval('('+at+')');cal=eval('('+cal+')');const S=__sim,R=S.R;R.sim=true;for(let i=0;i<120;i++)S.update(0.25);R.sim=false;
    cal();const c=Math.min(cal(),cal(),cal()),ms=[];
    for(const h of [12,23]){at(h,'out');for(let i=0;i<10;i++)S.draw();const runs=[];for(let j=0;j<3;j++){const t=performance.now();for(let i=0;i<40;i++)S.draw();runs.push((performance.now()-t)/40)}ms.push(runs.sort((a,b)=>a-b)[1])}
    const worst=Math.max(...ms);return {ms:ms.map(x=>+x.toFixed(2)),ratio:+(worst/c).toFixed(3)}},[at.toString(),CAL.toString()]);
  ok('region-looks: a frame of the level 9 region within the speed budget',!errs.length&&r.ratio<=DRAW_BUDGET,`noon ${r.ms[0]} ms, night ${r.ms[1]} ms, ${r.ratio}x calibration (budget ${DRAW_BUDGET}x)`+(errs[0]?' '+errs[0]:''));
  await ctx.close()}
}
