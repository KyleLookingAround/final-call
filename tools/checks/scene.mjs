// The airport view's drawing layers and lighting pass (src/game/50-scene.js, docs/specs/real-airport.md): every layer
// draws once a frame, in order, and only in the airport view; the lighting pass darkens the apron at night and adds its
// lights; drawing never changes the game; and how long a frame takes to draw, against a calibration run (so machines
// compare) and the speed budget the real airport's parts share.
const DRAW_BUDGET=0.55; // draw ms a frame over calibration ms, in each scene. Main before the real airport: 0.30-0.36x;
// the budget is about 1.6 times that, shared between the groundwork and the parts (docs/specs/real-airport.md)
const CAL=()=>{const t=performance.now(),a=[];for(let i=0;i<2e5;i++)a.push({x:i%97,y:i%89});a.sort((p,q)=>p.x-q.x||p.y-q.y);let s=0;for(const p of a)s+=Math.hypot(p.x,p.y);return performance.now()-t+s*0};
// the worst case to draw: fully built, the whole airport in view, at night in a storm with fog and snow
function scene(mid){const S=__sim,G=S.G,R=S.R;
  if(mid){S.switchLayout('mid');G.pierB=true;S.SIDX.forEach(i=>{G.stands[i].built=true})}
  R.sim=true;for(let i=0;i<600;i++)S.update(0.1);R.sim=false; // an hour in, so every stand is busy
  G.clock=Math.floor(G.clock/1440)*1440+23*60;for(const k of ['rain','storm','fog','snow'])R.fx[k]=G.clock+600;
  R.cam.z=0.01;S.clampCam();S.clampCam()}
export default async function({open,ok,saveText,newest}){
  // every layer draws once a frame, in order, with the frame's view; none in the region or world view
  {const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});
  const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,seen=[],views=[];
    for(const n of S.LAYERS)S.LAYER[n].push(V=>{seen.push(n);views.push(V)});S.LIGHTS.push(()=>seen.push('(lights)'));
    G.clock=Math.floor(G.clock/1440)*1440+23*60;S.draw();const night=seen.slice(),V=views[0];
    seen.length=0;G.clock+=13*60;S.draw();const day=seen.slice();
    seen.length=0;S.setView('region');S.draw();S.setView('world');S.draw();const away=seen.slice();S.setView('airport');
    return {night,day,away,names:S.LAYERS,one:views.every(v=>v===V),view:{x:V.x1>V.x0,y:V.y1>V.y0,k:V.k>0,z:V.z>0,t:V.t>0,D:!!V.D,d:typeof V.d==='number'}}});
  const want=r.names.slice(),wantN=want.slice();wantN.splice(want.indexOf('lit'),0,'(lights)');
  ok('scene: every layer draws once a frame, in order, and only in the airport view',r.night.join()===wantN.join()&&r.day.join()===want.join()&&!r.away.length&&r.one&&Object.values(r.view).every(Boolean)&&!errs.length,
    JSON.stringify({night:r.night,away:r.away,view:r.view})+(errs.length?' '+errs[0]:''));
  // the lighting pass: nothing at noon; at night the apron is darker (with the stands' own lights set aside) and a lamp
  // lights its own spot
  const L=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,c=document.querySelector('#cv').getContext('2d');
    R.cam.z=0.01;S.clampCam();S.clampCam();const k=S.viewK()*R.dpr,px=(x,y)=>{const d=c.getImageData(Math.round((x-R.cam.x)*k),Math.round((y-R.cam.y)*k),1,1).data;return d[0]+d[1]+d[2]};
    const x=40,y=S.AF_Y+120,at=h=>{G.clock=Math.floor(G.clock/1440)*1440+h*60;S.draw();return {d:S.V.d,v:px(x,y)}};
    const keep=S.LIGHTS.splice(0),noon=at(12),night=at(23);S.LIGHTS.push(()=>S.lamp(x,y,60,'255,214,150',0.5));const lit=at(23),litNoon=at(12);S.LIGHTS.splice(0,1,...keep);
    return {noon,night,lit,litNoon}});
  ok('scene: the lighting pass darkens the apron at night, and its lamps light their spot',L.noon.d===0&&L.night.d===0.5&&L.night.v<L.noon.v&&L.lit.v>L.night.v&&L.litNoon.v===L.noon.v,JSON.stringify(L));
  await ctx.close()}
  // drawing never changes the game: the same seed plays the same with a frame drawn every few steps as without
  {const play=async draw=>{const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});
    const s=await page.evaluate(draw=>{const S=__sim,G=S.G,R=S.R;R.sim=true;
      for(let i=0;i<1800;i++){S.update(0.1);if(draw&&i%3===0){R.sim=false;S.draw();R.sim=true}}
      const g=JSON.parse(JSON.stringify(G));delete g.savedAt;return JSON.stringify(g)+'|'+S.rnd()},draw);
    await ctx.close();return [s,errs]};
  const [a,e1]=await play(false),[b,e2]=await play(true);
  ok('scene: drawing never changes the game',a===b&&!e1.length&&!e2.length,a===b?`${a.length} bytes of state match`:'state differs after three game hours'+(e1[0]||e2[0]?' '+(e1[0]||e2[0]):''))}
  // how long a frame takes to draw, worst case: fully built, all in view, at night in a storm with fog and snow
  for(const [name,mid,vp,touch] of [['Classic, desktop',false,{width:1440,height:900},false],['Midfield, desktop',true,{width:1440,height:900},false],['Midfield, phone',true,{width:390,height:844},true]]){
    const {ctx,page,errs}=await open(vp,saveText(newest),touch,{still:true});
    const r=await page.evaluate(([mid,sc,cal])=>{eval('var scene='+sc+',CAL='+cal);const S=__sim,c=document.querySelector('#cv').getContext('2d');scene(mid);
      const frame=()=>{S.draw();c.getImageData(0,0,1,1)}; // reading a pixel makes the canvas finish drawing
      for(let i=0;i<5;i++)frame();CAL();const cc=Math.min(CAL(),CAL(),CAL());
      let ms=1e9;for(let b=0;b<3;b++){const t=performance.now();for(let i=0;i<15;i++)frame();ms=Math.min(ms,(performance.now()-t)/15)}
      return {ms:+ms.toFixed(2),ratio:+(ms/cc).toFixed(3),stands:S.SIDX.filter(i=>S.G.stands[i].built).length}},[mid,scene.toString(),CAL.toString()]);
    ok(`scene: drawing speed, ${name}`,!errs.length&&r.ratio<=DRAW_BUDGET,`${r.ms} ms a frame, ${r.ratio}x calibration (budget ${DRAW_BUDGET}x), ${r.stands} stands`+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
}
