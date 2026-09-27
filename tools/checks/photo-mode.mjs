// Photo mode (src/game/62-photo-mode.js, docs/specs/photo-mode.md): the camera button hides every panel, chip, toast and the
// phone chrome at every screen size and leaves the map and the photo bar; every drawn time and sky draws, in the airport
// view and the Region; the shutter makes a PNG the size of the canvas; Done, Esc and a tap leave and bring the panels back;
// and none of it changes G, R.fx or the random stream.
const SIZES=[['320 px phone',{width:320,height:640},true],['phone',{width:390,height:844},true],['landscape phone',{width:844,height:390},true],
  ['tablet',{width:820,height:1180},true],['desktop',{width:1440,height:900},false]];
// what must go: the board, the side panel or sheet, the speed bar, the camera chips, toasts, the tip, the paused tag, the
// full-screen bar and button, the camera band and the guided start's spotlight
const CHROME=['.board','#side','.hud','#cam','#toasts','#tip','#ptag','.fsbar','#fsManage','#topgap','#spot','#coach'];

export default async function({open,ok,saveText,newest}){
  for(const [name,vp,touch] of SIZES){
    const {ctx,page,errs}=await open(vp,saveText(newest),touch,{still:true});
    const r=await page.evaluate(CHROME=>{const S=__sim,R=S.R;S.toast('A toast to hide');S.setSpeed(0);S.setSpeed(1);
      const shown=q=>{const e=document.querySelector(q);if(!e)return false;const b=e.getBoundingClientRect();return b.width>0&&b.height>0&&getComputedStyle(e).visibility!=='hidden'},
        seen=()=>Object.fromEntries(CHROME.map(q=>[q,shown(q)])),inside=q=>{const b=document.querySelector(q).getBoundingClientRect();return b.width>0&&b.left>=0&&b.top>=0&&b.right<=innerWidth+0.5&&b.bottom<=innerHeight+0.5};
      const before=seen(),button=inside('#photob');
      document.querySelector('#photob').click();
      const cv=document.querySelector('#cv').getBoundingClientRect(),during=seen(),bar=inside('#photobar'),
        full=Math.abs(cv.width-innerWidth)<1&&Math.abs(cv.height-innerHeight)<1,on=!!R.photo;
      document.querySelector('#photobar [data-ph="done"]').click();
      return {before,button,during,bar,full,on,after:seen(),off:R.photo==null}},CHROME);
    const left=Object.keys(r.during).filter(q=>r.during[q]),lost=Object.keys(r.before).filter(q=>r.before[q]&&!r.after[q]);
    ok(`photo-mode: entering hides every panel on a ${name}`,r.button&&r.on&&!left.length&&r.bar&&r.full&&!errs.length,
      left.length?'still shown: '+left.join(', '):!r.button?'the camera button is off screen':!r.bar?'the photo bar is off screen':!r.full?'the map does not fill the screen':errs[0]||'');
    ok(`photo-mode: leaving brings the panels back on a ${name}`,r.off&&!lost.length&&r.before['.hud'],lost.length?'not back: '+lost.join(', '):'');
    await ctx.close();
  }

  const {ctx,page,errs}=await open({width:1440,height:900},saveText(newest),false,{still:true});
  const r=await page.evaluate(async()=>{const S=__sim,G=S.G,R=S.R,c=document.querySelector('#cv').getContext('2d');
    G.clock=Math.floor(G.clock/1440)*1440+12*60;R.fx.rain=R.fx.snow=R.fx.fog=R.fx.storm=0;S.setView('airport');S.draw();
    const state=()=>JSON.stringify(G)+'|'+S.rndState+'|'+JSON.stringify(R.fx),start=state(),bad=[],px=()=>{const w=c.canvas.width,h=c.canvas.height,d=c.getImageData(0,0,w,h).data;let n=0,t=0;for(let y=0;y<h;y+=17)for(let x=0;x<w;x+=17){const i=(y*w+x)*4;t+=d[i]+d[i+1]+d[i+2];n++}return Math.round(t/n)}; // the frame's mean brightness
    S.photoOn();const lit={};
    // every time of day with every sky, in both views
    for(const view of ['airport','region']){if(view==='region'){R.view='region';S.clampCam()}
      for(let t=0;t<S.PH_TIME.length;t++){for(let s=0;s<S.PH_SKY.length;s++){
        try{S.draw();if(view==='region')S.photoRegionSky()}catch(e){bad.push(`${view} ${S.PH_TIME[R.photo.ti][0]} ${S.PH_SKY[R.photo.si]}: ${e.message}`)}
        if(view==='airport'&&s===0){const L=S.LIGHTS,keep=L.splice(0);S.draw();lit[S.PH_TIME[R.photo.ti][0]]={hour:S.V.hour,d:S.V.d,px:px()};L.push(...keep)} // darker by night, lamps aside
        if(view==='airport'&&S.PH_SKY[R.photo.si]==='Rain'&&!(S.drawnFx().rain>G.clock&&!(S.drawnFx().snow>G.clock)))bad.push('Rain is not the drawn sky');
        S.photoStep('sky')}
        S.photoStep('time')}}
    R.view='airport';S.clampCam();S.draw();
    const b=S.photoShot(),head=[...new Uint8Array(await b.slice(0,4).arrayBuffer())].join(),img=await createImageBitmap(b),
      shot={type:b.type,png:head==='137,80,78,71',size:[img.width,img.height].join('x'),canvas:[c.canvas.width,c.canvas.height].join('x')};
    S.photoOff();const same=state()===start,cleared=R.photo==null&&S.drawnHour()===(G.clock/60)%24&&S.drawnFx()===R.fx;
    // pause, then leave: the speed goes back as it was; Esc and a tap on the map leave too, and the tap reaches nothing under it
    S.setSpeed(1);document.querySelector('#photob').click();document.querySelector('#photobar [data-ph="pause"]').click();const paused=R.speed===0;
    document.querySelector('#photobar [data-ph="done"]').click();const resumed=R.speed===1;
    return {bad,lit,shot,same,cleared,paused,resumed,start:start.length}});
  ok('photo-mode: every time of day and sky draws, in the airport view and the Region',!r.bad.length&&!errs.length,r.bad[0]||errs[0]||'');
  const L=r.lit;
  ok('photo-mode: the drawn hour sets the lighting',L.Noon&&L.Noon.hour===12&&L.Noon.d===0&&L.Night.d===0.5&&L.Dawn.d>0&&L.Dawn.d<0.5&&L.Dusk.d>0&&L.Dusk.d<0.5&&L.Night.px<L.Noon.px,JSON.stringify(L));
  ok('photo-mode: the shutter makes a PNG the size of the canvas',r.shot.type==='image/png'&&r.shot.png&&r.shot.size===r.shot.canvas,JSON.stringify(r.shot));
  ok('photo-mode: G, R.fx and the random stream are unchanged, and leaving clears the overrides',r.same&&r.cleared,JSON.stringify({same:r.same,cleared:r.cleared}));
  ok('photo-mode: Pause pauses, and leaving puts the speed back',r.paused&&r.resumed,JSON.stringify({paused:r.paused,resumed:r.resumed}));
  const e=await page.evaluate(()=>{const S=__sim,R=S.R;R.speed=1;document.querySelector('#photob').click();return !!R.photo});
  await page.keyboard.press('Escape');
  const esc=await page.evaluate(()=>__sim.R.photo==null);
  const t0=await page.evaluate(()=>{const S=__sim;S.selectStand(0,false);document.querySelector('#photob').click();return {tab:S.G.tab,sel:S.R.sel}});
  const box=await page.locator('#cv').boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height*0.35);
  const t1=await page.evaluate(()=>({off:__sim.R.photo==null,tab:__sim.G.tab,sel:__sim.R.sel}));
  ok('photo-mode: Esc and a tap on the map leave, and the tap reaches nothing under it',e&&esc&&t1.off&&t1.tab===t0.tab&&t1.sel===t0.sel,JSON.stringify({esc,t0,t1}));
  await ctx.close();

  // on a phone, the click a tap sends after leaving lands where the panels have come back: it must reach none of them
  {const {ctx,page,errs}=await open({width:390,height:844},saveText(newest),true,{still:true});
    const t0=await page.evaluate(()=>{const S=__sim;document.querySelector('#photob').click();return {view:S.R.view,speed:S.R.speed,snd:S.G.sound,tab:S.G.tab,on:!!S.R.photo}});
    const out=[];for(const [fx,fy] of [[0.9,0.3],[0.5,0.2],[0.5,0.75]]){await page.evaluate(()=>{if(!__sim.R.photo)document.querySelector('#photob').click()});
      await page.touchscreen.tap(390*fx,844*fy);await page.waitForTimeout(700);out.push(await page.evaluate(()=>{const S=__sim;return {off:!S.R.photo,view:S.R.view,speed:S.R.speed,snd:S.G.sound,tab:S.G.tab}}))}
    const bad=out.find(o=>!o.off||o.view!==t0.view||o.speed!==t0.speed||o.snd!==t0.snd||o.tab!==t0.tab);
    ok('photo-mode: a tap on a phone leaves, and its click reaches nothing that comes back under it',t0.on&&!bad&&!errs.length,JSON.stringify(bad||t0)+(errs[0]||''));
    await ctx.close()}
}
