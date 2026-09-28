// Usage counts (docs/systems/usage-counts.md, 65-usage-counts.js): the GoatCounter script tag loads only on the
// published site, with a site code set, not R.sim, and the player hasn't turned it off; with the code emptied, or
// off the published site, nothing loads and no request is ever made. Named events fire once per save through the
// loaded script and cost nothing when it hasn't loaded.
import {join} from 'node:path';

const FAKE_URL='https://someone.github.io/final-call/';

// a fake GitHub Pages context, as tools/checks/update.mjs and feedback.mjs use: build/test.html served at FAKE_URL,
// any request to GoatCounter recorded (never actually let through) and everything else aborted
async function openPages(browser,root,saveText,newest){
  const ctx=await browser.newContext({viewport:{width:1280,height:800}});
  const reqs=[];
  await ctx.route('**/*',route=>{
    const url=route.request().url(),path=url.split('?')[0];
    if(path===FAKE_URL)return route.fulfill({path:join(root,'build/test.html')});
    if(url.includes('gc.zgo.at')||url.includes('goatcounter.com'))reqs.push(url);
    return route.abort();
  });
  await ctx.addInitScript(([seed,save])=>{window.__seed=seed;if(!sessionStorage.getItem('seeded')){localStorage.setItem('final-call-save-v2',save);sessionStorage.setItem('seeded','1')}},[1,saveText(newest)]);
  const page=await ctx.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(FAKE_URL);await page.waitForTimeout(800);
  await page.evaluate(()=>{const n=document.querySelector('#news');if(n&&!n.hidden)n.querySelector('[data-newsclose]').click();__sim.R.toasts.length=0;document.querySelector('#toasts').innerHTML=''});
  return {ctx,page,errs,reqs};
}

export default async function({open,ok,saveText,newest,browser,root}){
  {const {ctx,page,errs}=await openPages(browser,root,saveText,newest);
    const r=await page.evaluate(()=>{const s=document.querySelector('script[data-goatcounter]');return s&&{site:__sim.USAGE_SITE,src:s.src,gc:s.dataset.goatcounter}});
    ok('usage: the site\'s code on the published site loads the counter script at the right address',
      !!r&&r.site&&r.src.includes('gc.zgo.at/count.js')&&r.gc===`https://${r.site}.goatcounter.com/count`&&!errs.length,JSON.stringify(r));
    await ctx.close();
  }
  {const {ctx,page,errs,reqs}=await openPages(browser,root,saveText,newest); // the real, shipped code already loaded a tag on boot
    const before=reqs.length;
    const r=await page.evaluate(()=>{
      document.querySelectorAll('script[data-goatcounter]').forEach(s=>s.remove()); // start clean, so this only tests the emptied code
      __sim.USAGE_SITE='';__sim.usageInit();
      return {tag:!!document.querySelector('script[data-goatcounter]')};
    });
    await page.waitForTimeout(300);
    ok('usage: with the code emptied, no script tag and no request, even on the published site',!r.tag&&reqs.length===before&&!errs.length,JSON.stringify(r)+' reqs +'+(reqs.length-before));
    await ctx.close();
  }
  {const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});
    const r=await page.evaluate(()=>({tag:!!document.querySelector('script[data-goatcounter]'),site:__sim.USAGE_SITE}));
    ok('usage: the site\'s code set on a host that isn\'t the published site still loads nothing',!r.tag&&!!r.site&&!errs.length,JSON.stringify(r));
    await ctx.close();
  }
  {const {ctx,page,errs}=await openPages(browser,root,saveText,newest); // the real, shipped code already loaded a tag on boot
    const r=await page.evaluate(()=>{
      document.querySelectorAll('script[data-goatcounter]').forEach(s=>s.remove()); // start clean, so this only tests the switch
      __sim.G.set.usage=false;__sim.usageInit();
      return {tag:!!document.querySelector('script[data-goatcounter]')};
    });
    ok('usage: turned off in Settings, nothing loads even with the code set on the published site',!r.tag&&!errs.length,JSON.stringify(r));
    await ctx.close();
  }
  {const {ctx,page,errs}=await openPages(browser,root,saveText,newest);
    const r=await page.evaluate(()=>{
      const before={...__sim.G.usageSent};
      __sim.usageEvent('first-flight'); // the script never loaded in this context: a no-op
      const afterOff={...__sim.G.usageSent};
      __sim.usageLoaded=true;
      __sim.usageEvent('first-flight');
      const afterOn={...__sim.G.usageSent};
      window.goatcounter={count:()=>{window.__gcCalls=(window.__gcCalls||0)+1}};
      __sim.usageEvent('first-flight'); // already sent this save: a no-op even with the script now present
      return {before,afterOff,afterOn,calls:window.__gcCalls||0};
    });
    ok('usage: an event is a no-op until the script has loaded, then fires once per save',
      !r.before['first-flight']&&!r.afterOff['first-flight']&&r.afterOn['first-flight']===true&&!r.calls&&!errs.length,JSON.stringify(r));
    await ctx.close();
  }
  {const {ctx,page,errs}=await openPages(browser,root,saveText,newest);
    const sent=await page.evaluate(()=>{__sim.R.sim=true;__sim.usageLoaded=true;__sim.usageEvent('first-flight');
      const s=!!__sim.G.usageSent['first-flight'];__sim.R.sim=false;return s});
    ok('usage: never fires in R.sim',!sent&&!errs.length,String(sent));
    await ctx.close();
  }
  {const {ctx,page,errs}=await open(undefined,null,false,{still:true});
    const r=await page.evaluate(()=>{const S=__sim;S.R.oSub='settings';S.R.setSub='screen';S.setTab('office');
      const before=S.SET().usage;
      const btn=[...document.querySelectorAll('#panel [data-set^="usage:"]')].find(b=>b.dataset.set==='usage:false');
      btn.click();
      const after=S.SET().usage;S.setTab('stands');return {before,found:!!btn,after}});
    ok('usage: the Settings switch (Screen and sound) is on by default and turns counting off',
      r.before===true&&r.found&&r.after===false&&!errs.length,JSON.stringify(r));
    await ctx.close();
  }
}
