// Every save in tools/saves loads, plays two game days and opens every tab. And a save is never frozen or lost
// (22-save.js, 23-boot.js): one error keeps the loop running, paused, with the save untouched; a save that fails to load is
// kept byte for byte (and copied to -broken); a second tab or an older page never overwrites a newer save; a full storage
// says so once; and the welcome-back bonus stays out of the next minute's rate, so reloading never pays more.

const KEY='final-call-save-v2';
export default async function({open,ok,saveText,saves,newest,url}){
  for(const f of saves){
    const {ctx,page,errs}=await open({width:1280,height:800},saveText(f));
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,lv=G.level;S.R.sim=true;for(let i=0;i<2*24*60*4;i++)S.update(0.25);S.R.sim=false;return {lv,day:G.day,crews:G.crews.length,tour:!!(G.tour&&G.tour.done)}});
    for(const [tab,sub,ss] of [['stands','gates'],['fleet'],['terminal'],['ground'],['sales'],['routes'],['region'],['office','progress'],['office','records'],...['managers','alerts','screen','save'].map(ss=>['office','settings',ss])]){
      await page.evaluate(([tab,sub,ss])=>{if(sub){if(tab==='office')__sim.R.oSub=sub;else __sim.R.gSub=sub}if(ss)__sim.R.setSub=ss;__sim.setTab(tab)},[tab,sub,ss]);await page.waitForTimeout(60)}
    ok(`saves: ${f}`,!errs.length&&r.tour,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
  const base=JSON.parse(saveText(newest)),away=o=>JSON.stringify({...o,savedAt:Date.now()-120000});

  { // welcome back: three loads two minutes apart pay no more than the first, and none of it reaches the minute's takings
    const {ctx,page}=await open(undefined,away(base),false,{still:true});const pays=[];let clean=true,info='';
    for(let i=0;i<3;i++){
      if(i){await page.evaluate(k=>{const S=__sim;S.save();const o=JSON.parse(localStorage.getItem(k));o.savedAt=Date.now()-120000;localStorage.setItem(k,JSON.stringify(o));
          Storage.prototype.setItem=()=>{}},KEY); // the unload's own save would mark it as just saved
        await page.reload();await page.waitForTimeout(800)}
      const r=await page.evaluate(()=>{const S=__sim,G=S.G;const o={minEarn:S.R.minEarn,bonus:G.revBy.bonus,rate:G.rate};
        for(let k=0;k<8;k++)S.update(0.25); // two game minutes, as a player would play before leaving again
        o.bonusAfter=G.revBy.bonus;return o});
      pays.push(r.bonus-(i?pays.after:(base.revBy.bonus||0)));pays.after=r.bonusAfter;if(r.minEarn!==0){clean=false;info=`load ${i+1}: ${Math.round(r.minEarn)} in the minute's takings`}
      if(!i)pays.rate0=r.rate;
    }
    const gain=pays;
    ok('saves: the welcome-back bonus stays out of the rate',clean,info||`rate ${Math.round(pays.rate0)}`);
    ok('saves: reloading never pays more than the first time',gain[0]>0&&gain.every(g=>g<=gain[0]*1.05),gain.map(Math.round).join(' → '));
    await ctx.close();
  }

  { // a save whose loading throws: the stored save is kept byte for byte, and a copy goes to the -broken key
    const text=JSON.stringify({...base,fleet:'broken'});
    const {ctx,page}=await open(undefined,text);
    await page.evaluate(()=>{__sim.save();document.dispatchEvent(new Event('visibilitychange'))});await page.waitForTimeout(5500);
    const r=await page.evaluate(k=>({kept:localStorage.getItem(k),copy:localStorage.getItem(k+'-broken'),stopped:__sim.R.saveBlock,running:!!__sim.G.fleet.length}),KEY);
    ok('saves: a save that fails to load is kept byte for byte',r.kept===text&&r.copy===text,`kept ${r.kept===text}, copied ${r.copy===text}`);
    ok('saves: a save that fails to load stops saving and still plays',r.stopped==='broken'&&r.running,`stopped: ${r.stopped}`); // open() clears the boot's toasts
    await ctx.close();
  }

  { // two tabs on one storage: the one that saved last keeps saving, the other stops and says so
    const {ctx,page:a}=await open(undefined,saveText(newest));
    const b=await ctx.newPage();await b.goto(url);await b.waitForTimeout(800);
    const bw=await b.evaluate(k=>{__sim.save();return localStorage.getItem(k)},KEY);
    const r=await a.evaluate(k=>{__sim.R.toasts.length=0;__sim.save();return {kept:localStorage.getItem(k),toasts:__sim.R.toasts.length}},KEY);
    const b2=await b.evaluate(k=>{__sim.G.cash+=1;__sim.save();return localStorage.getItem(k)},KEY);
    ok('saves: a second tab never overwrites a newer save',r.kept===bw&&r.toasts>0&&b2!==bw,`kept ${r.kept===bw}, ${r.toasts} toasts, newer tab still saves ${b2!==bw}`);
    await ctx.close();
  }

  { // a save from a newer build, by its stamp or by upgrades this page doesn't know, is never overwritten
    for(const [name,o] of [['a newer stamp',{...base,ver:9999}],['an unknown upgrade',{...base,ver:1,lv:{...base.lv,warp:2}}]]){
      const text=JSON.stringify(o);const {ctx,page}=await open(undefined,text);
      const r=await page.evaluate(k=>{__sim.save();return {kept:localStorage.getItem(k),toasts:__sim.R.toasts.length}},KEY);
      ok(`saves: an older page never overwrites a newer build's save (${name})`,r.kept===text,`kept ${r.kept===text}`);
      await ctx.close();
    }
    const {ctx,page}=await open(undefined,saveText(newest));
    const v=await page.evaluate(k=>{__sim.save();return [JSON.parse(localStorage.getItem(k)).ver,__sim.UPDATES[0].v]},KEY);
    ok('saves: every save carries its build stamp',v[0]===v[1],v.join(' vs '));
    await ctx.close();
  }

  { // a full storage: saving fails with one toast, not silently and not every five seconds
    const {ctx,page}=await open(undefined,saveText(newest));
    const n=await page.evaluate(()=>{const S=__sim,set=Storage.prototype.setItem;S.R.toasts.length=0;
      Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError')};
      try{S.save();S.save();S.save()}finally{Storage.prototype.setItem=set}return S.R.toasts.length});
    ok('saves: a full storage says so once',n===1,`${n} toasts`);
    await ctx.close();
  }

  { // one error in a frame: the loop keeps running, the game pauses and says so, and the save is untouched
    const {ctx,page}=await open(undefined,saveText(newest));
    const before=await page.evaluate(k=>{const S=__sim,G=S.G,raf=window.requestAnimationFrame.bind(window);window.__raf=0;
      window.requestAnimationFrame=f=>{window.__raf++;return raf(f)};S.setSpeed(1);S.R.toasts.length=0;S.save();
      const v=G.cash,plain=x=>Object.defineProperty(G,'cash',{value:x,writable:true,enumerable:true,configurable:true});
      Object.defineProperty(G,'cash',{configurable:true,enumerable:true,get(){plain(v);throw new Error('saves check: one throw')},set(x){plain(x);throw new Error('saves check: one throw')}});
      return localStorage.getItem(k)},KEY);
    await page.waitForTimeout(400);const n0=await page.evaluate(()=>window.__raf);await page.waitForTimeout(400);
    const r=await page.evaluate(k=>{__sim.save();document.dispatchEvent(new Event('visibilitychange'));return {raf:window.__raf,speed:__sim.R.speed,toasts:__sim.R.toasts.length,kept:localStorage.getItem(k)}},KEY);
    ok('saves: one error keeps the game running, paused, with the save untouched',r.raf>n0&&n0>0&&r.speed===0&&r.toasts>0&&r.kept===before,
      `frames ${n0} → ${r.raf}, speed ${r.speed}, ${r.toasts} toasts, save kept ${r.kept===before}`);
    await ctx.close();
  }
  { // Settings › Save › Load: the first tap arms it, the label comes back after 3 s, and only a second tap inside 3 s loads
    const {ctx,page}=await open(undefined,saveText(newest),false,{still:true});
    const r=await page.evaluate(async()=>{const S=__sim,G=S.G,wait=ms=>new Promise(r=>setTimeout(r,ms));
      S.R.setSub='save';S.setTab('office');S.R.oSub='settings';S.setTab('office');
      const code=btoa(unescape(encodeURIComponent(JSON.stringify({...G,cash:12345,savedAt:Date.now()}))));
      const box=document.querySelector('#saveIn'),btn=()=>document.querySelector('#loadSave');
      if(!box)return {err:'no Save panel'};
      box.value=code;btn().click();const armed=btn().textContent;
      await wait(3500);const back=btn().textContent,cashAfterWait=G.cash;
      btn().click();const rearmed=btn().textContent;btn().click();
      return {armed,back,rearmed,loaded:S.G.cash===12345,notLoadedEarly:cashAfterWait!==12345}});
    ok('saves: Load re-arms after 3 s, and two taps inside 3 s replace the airport',!r.err&&r.armed==='Tap to replace this airport'&&r.back==='Load'&&r.rearmed==='Tap to replace this airport'&&r.loaded&&r.notLoadedEarly,JSON.stringify(r));
    await ctx.close();
  }
}
