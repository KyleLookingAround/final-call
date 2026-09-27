// The update-check toast (docs/specs/update-toast.md, src/game/37-update-check.js): quiet when the running build
// matches dist/version.json, a toast when it doesn't, Update now saves then reloads, Later holds it back an hour,
// and none of it runs off GitHub Pages or in the headless sim.
import {join} from 'node:path';

const FAKE_URL='https://someone.github.io/final-call/';

// a fake GitHub Pages context: build/test.html at FAKE_URL, version.json served with the given id, everything else aborted
async function openPages(browser,root,saveText,newest,versionId){
  const ctx=await browser.newContext({viewport:{width:1280,height:800}});
  await ctx.route('**/*',route=>{
    const path=route.request().url().split('?')[0]; // Update now reloads to a cache-busting query on the same address
    if(path===FAKE_URL)return route.fulfill({path:join(root,'build/test.html')});
    if(path===FAKE_URL+'version.json')return route.fulfill({contentType:'application/json',body:JSON.stringify({id:versionId})});
    return route.abort();
  });
  // seeded once per context, like the main checks' open(): a reload must not overwrite the save the game just wrote
  await ctx.addInitScript(([seed,save])=>{window.__seed=seed;if(!sessionStorage.getItem('seeded')){localStorage.setItem('final-call-save-v2',save);sessionStorage.setItem('seeded','1')}},[1,saveText(newest)]);
  const page=await ctx.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(FAKE_URL);await page.waitForTimeout(800);
  await page.evaluate(()=>{const n=document.querySelector('#news');if(n&&!n.hidden)n.querySelector('[data-newsclose]').click();__sim.R.toasts.length=0;document.querySelector('#toasts').innerHTML=''});
  return {ctx,page,errs};
}
const toastState=page=>page.evaluate(()=>{const t=__sim.R.toasts.find(t=>t.id==='update');const el=document.querySelector('.toast[data-id="update"]');
  return {shown:!!t,buttons:el?[...el.querySelectorAll('[data-k]')].map(b=>b.textContent):[],text:t?t.text:null}});

export default async function({ok,saveText,newest,browser,root,open}){
  // the running build's own id, read back through window.__sim rather than duplicating tools/build.mjs's hash
  const buildId=await (async()=>{const {ctx,page}=await openPages(browser,root,saveText,newest,'x');const id=await page.evaluate(()=>__sim.BUILD_ID);await ctx.close();return id})();

  {const {ctx,page,errs}=await openPages(browser,root,saveText,newest,buildId);
    await page.evaluate(()=>{__sim.R.updLoadedAt=-1e9;return __sim.updCheckNow()}); // past the quiet first minute
    const t=await toastState(page);
    ok('update: no toast when the running build matches version.json',!t.shown&&!errs.length,JSON.stringify(t)+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
  {const {ctx,page,errs}=await openPages(browser,root,saveText,newest,buildId+'-new');
    await page.evaluate(()=>{__sim.R.updLoadedAt=-1e9;return __sim.updCheckNow()});
    const t=await toastState(page);
    ok('update: a toast when version.json names a different build',t.shown&&t.text==='A new version of Final Call is ready'&&t.buttons.join()==='Update now,Later'&&!errs.length,
      JSON.stringify(t)+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
  {const {ctx,page,errs}=await openPages(browser,root,saveText,newest,buildId+'-new');
    await page.evaluate(async()=>{__sim.R.speed=0;__sim.G.cash=123456;__sim.R.updLoadedAt=-1e9;await __sim.updCheckNow()}); // paused, so cash can't drift before the reload
    await page.click('.toast[data-id="update"] [data-k="0"]'); // Update now
    await page.waitForLoadState();
    const r=await page.evaluate(()=>({cash:__sim.G.cash,url:location.href}));
    // a little upkeep runs in the real seconds the reload takes, so allow for that rather than needing an exact match
    ok('update: Update now saves the game and reloads past the cache',Math.abs(r.cash-123456)<500&&r.url!==FAKE_URL&&r.url.startsWith(FAKE_URL)&&!errs.length,
      JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
  {const {ctx,page,errs}=await openPages(browser,root,saveText,newest,buildId+'-new');
    await page.evaluate(()=>{__sim.R.updLoadedAt=-1e9;return __sim.updCheckNow()});
    await page.click('.toast[data-id="update"] [data-k="1"]'); // Later
    const gone=await toastState(page);
    const soon=await page.evaluate(()=>{__sim.updTryShow();return !!document.querySelector('.toast[data-id="update"]')});
    const later=await page.evaluate(()=>{__sim.R.updSnoozeUntil=0;__sim.updTryShow();return !!document.querySelector('.toast[data-id="update"]')});
    ok('update: Later hides the toast and holds it back for an hour, then it can show again',
      !gone.shown&&!soon&&later&&!errs.length,JSON.stringify({gone,soon,later})+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
  {const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});
    const reqs=[];page.on('request',r=>{if(r.url().endsWith('version.json'))reqs.push(r.url())});
    const r=await page.evaluate(async()=>{const repo=__sim.feedbackRepo();await __sim.updCheckNow();return {repo,pending:!!__sim.R.updPending}});
    ok('update: nothing runs off GitHub Pages (build/test.html)',!r.repo&&!r.pending&&!reqs.length&&!errs.length,JSON.stringify(r)+' '+reqs.length);
    await ctx.close();
  }
  {const {ctx,page,errs}=await openPages(browser,root,saveText,newest,buildId+'-new');
    const r=await page.evaluate(async()=>{__sim.R.sim=true;await __sim.updCheckNow();const pending=!!__sim.R.updPending;__sim.R.sim=false;return {pending}});
    ok('update: nothing runs in R.sim, even on GitHub Pages',!r.pending&&!errs.length,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
}
