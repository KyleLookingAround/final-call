// The feedback link in Help (docs/specs/feedback-link.md): hidden outside GitHub Pages; on GitHub Pages it opens a
// prefilled issue for the repo the page is served from, and the body stays well under GitHub's URL length limit.
import {join} from 'node:path';

const FAKE_URL='https://someone.github.io/final-call/';
const URL_LIMIT=8000; // GitHub trims a much longer issue body from the address bar; stay well clear of that

export default async function({open,ok,saveText,browser,root}){
  {const {ctx,page,errs}=await open(undefined,saveText('v29-L9.json'),false,{still:true});
    await page.click('#helpb');
    const hidden=await page.evaluate(()=>document.querySelector('#feedbackLink').hidden);
    ok('feedback: the link is hidden on build/test.html',hidden&&!errs.length,errs[0]||'');
    await ctx.close();
  }
  {const ctx=await browser.newContext({viewport:{width:1280,height:800}});
    await ctx.route('**/*',route=>route.request().url().startsWith(FAKE_URL)?route.fulfill({path:join(root,'build/test.html')}):route.abort());
    await ctx.addInitScript(([seed,save])=>{window.__seed=seed;localStorage.setItem('final-call-save-v2',save)},[1,saveText('v29-L9.json')]);
    const page=await ctx.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
    await page.goto(FAKE_URL);await page.waitForTimeout(800);
    await page.evaluate(()=>{const n=document.querySelector('#news');if(n&&!n.hidden)n.querySelector('[data-newsclose]').click()});
    await page.click('#helpb');
    const r=await page.evaluate(()=>{const el=document.querySelector('#feedbackLink');return {hidden:el.hidden,href:el.href}});
    const u=r.href?new URL(r.href):null,body=u?decodeURIComponent(u.searchParams.get('body')||''):'';
    const right=!r.hidden&&u&&u.origin==='https://github.com'&&u.pathname==='/someone/final-call/issues/new'&&['Version:','Level:','Layout:','Game day:','Screen:','Device:'].every(k=>body.includes(k));
    ok('feedback: on GitHub Pages the link opens a prefilled issue for that repo',right&&!errs.length,r.href||errs[0]||'');
    ok('feedback: the body stays well under GitHub\'s URL length limit on a level 9 airport',r.href.length<URL_LIMIT,`${r.href.length} chars`);
    await ctx.close();
  }
}
