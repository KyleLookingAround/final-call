// Quick regression checks for build/test.html (about 1-2 minutes). Run with: npm run check
//   sim      a new game plays 72 game hours headless without errors
//   saves    every save in tools/saves loads, plays two game days and opens every tab
//   layout   no sideways overflow and no page scroll, 320 px phones to 2560 px screens, portrait and landscape
//   sheet    on a phone the bottom panel drags up and down with touch and snaps, and the page never scrolls
//   tour     a new game starts the guided first hour and it advances
// Exit code 1 if anything fails. Screenshots of failures go to build/check/.
import {chromium} from 'playwright';
import {readFileSync,readdirSync,mkdirSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..'),url=pathToFileURL(join(root,'build/test.html')).href,out=join(root,'build/check');
mkdirSync(out,{recursive:true});
const only=process.argv[2];
const exe=process.env.CHROMIUM_PATH;
const browser=await chromium.launch(exe?{executablePath:exe}:{});
const results=[];const ok=(name,pass,info)=>{results.push([name,pass]);console.log(`${pass?'PASS':'FAIL'}  ${name}${info?'  '+info:''}`)};
const ignorable=m=>/fonts\.(googleapis|gstatic)|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|net::/.test(m);

async function open(vp={width:1280,height:800},save=null,touch=false){
  const ctx=await browser.newContext({viewport:vp,deviceScaleFactor:touch?2:1,hasTouch:touch,isMobile:touch,screen:{width:Math.min(vp.width,vp.height)<=520&&touch?Math.min(vp.width,vp.height):vp.width,height:Math.min(vp.width,vp.height)<=520&&touch?Math.max(vp.width,vp.height):vp.height}});
  if(save)await ctx.addInitScript(s=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('final-call-save-v2',s);sessionStorage.setItem('seeded','1')}},save);
  const page=await ctx.newPage();const errs=[];
  page.on('pageerror',e=>errs.push(e.message));page.on('console',c=>{if(c.type()==='error'&&!ignorable(c.text()))errs.push(c.text())});
  await page.goto(url);await page.waitForTimeout(800);
  await page.evaluate(()=>{__sim.R.toasts.length=0;document.querySelector('#toasts').innerHTML=''});
  return {ctx,page,errs};
}
const saves=readdirSync(join(root,'tools/saves')).filter(f=>f.endsWith('.json')).sort();
const saveText=f=>readFileSync(join(root,'tools/saves',f),'utf8');

if(!only||only==='sim'){
  const {ctx,page,errs}=await open();
  const r=await page.evaluate(()=>{const S=__sim,G=S.G;S.R.sim=true;for(let i=0;i<72*60*4;i++)S.update(0.25);S.R.sim=false;return {flights:G.flights,clock:Math.round(G.clock),cash:Math.round(G.cash)}});
  ok('sim: 72 game hours headless',!errs.length&&r.flights>10,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
  await ctx.close();
}
if(!only||only==='saves'){
  for(const f of saves){
    const {ctx,page,errs}=await open({width:1280,height:800},saveText(f));
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,lv=G.level;S.R.sim=true;for(let i=0;i<2*24*60*4;i++)S.update(0.25);S.R.sim=false;return {lv,day:G.day,crews:G.crews.length,tour:!!(G.tour&&G.tour.done)}});
    for(const [tab,sub] of [['stands','gates'],['stands','fleet'],['terminal'],['ground'],['sales'],['routes'],['region'],['office','progress'],['office','records'],['office','settings']]){
      await page.evaluate(([tab,sub])=>{if(sub){if(tab==='office')__sim.R.oSub=sub;else __sim.R.gSub=sub}__sim.setTab(tab)},[tab,sub]);await page.waitForTimeout(60)}
    ok(`saves: ${f}`,!errs.length&&r.tour,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
}
if(!only||only==='layout'){
  const save=saveText(saves.filter(f=>f.startsWith('v20')).pop()||saves.pop());
  for(const [w,h] of [[320,640],[360,780],[390,844],[768,1024],[844,390],[915,412],[1024,768],[1440,900],[2560,1440]]){
    const touch=w<1000&&h<1100;const {ctx,page,errs}=await open({width:w,height:h},save,touch);const bad=[];
    for(const [tab,view,sub] of [['stands','airport','fleet'],['routes','world'],['region','region'],['office','airport','records'],['office','airport','settings']]){
      await page.evaluate(([tab,view,sub])=>{__sim.setView(view);if(sub){if(tab==='office')__sim.R.oSub=sub;else __sim.R.gSub=sub}__sim.setTab(tab)},[tab,view,sub]);await page.waitForTimeout(120);
      const o=await page.evaluate(()=>{const W=document.documentElement.clientWidth,H=innerHeight;const over=[...document.querySelectorAll('#panel *, .board *, .hud, .fsbar, #side')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&getComputedStyle(e).visibility!=='hidden'&&(r.right>W+1||r.left<-1)}).slice(0,2).map(e=>e.id||String(e.className));return {scroll:document.documentElement.scrollHeight>H+1||document.documentElement.scrollWidth>W+1,over}});
      if(o.scroll||o.over.length)bad.push(`${tab}/${sub||view} ${JSON.stringify(o)}`);
    }
    if(bad.length)await page.screenshot({path:join(out,`layout_${w}x${h}.png`)});
    ok(`layout: ${w}x${h}`,!bad.length&&!errs.length,bad[0]||errs[0]||'');
    await ctx.close();
  }
}
if(!only||only==='sheet'){
  const {ctx,page,errs}=await open({width:390,height:844},saveText(saves.filter(f=>f.startsWith('v20')).pop()||saves.pop()),true);
  const cdp=await ctx.newCDPSession(page);
  const st=()=>page.evaluate(()=>{const g=document.querySelector('#grip').getBoundingClientRect();return {h:Math.round(document.querySelector('#side').getBoundingClientRect().height),grip:Math.round(g.top+g.height/2),scroll:document.documentElement.scrollTop+document.body.scrollTop,docH:document.documentElement.scrollHeight,vh:innerHeight}});
  const swipe=async(y0,y1)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:y0}]});for(let k=1;k<=10;k++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y:y0+(y1-y0)*k/10}]});await page.waitForTimeout(16)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(350)};
  const s0=await st();await swipe(s0.grip,150);const s1=await st();await swipe(s1.grip,s1.grip+900);const s2=await st();await swipe(s2.grip,s2.grip-250);const s3=await st();
  const pass=s1.h>s0.h+100&&s2.h<160&&s3.h>s2.h+100&&[s0,s1,s2,s3].every(s=>s.scroll===0&&s.docH<=s.vh);
  if(!pass)await page.screenshot({path:join(out,'sheet.png')});
  ok('sheet: phone panel drags and snaps',pass&&!errs.length,[s0,s1,s2,s3].map(s=>s.h).join(' → ')+(errs.length?' '+errs[0]:''));
  // full screen: the drawer opens from Manage and hides again
  await page.click('#fsb');await page.waitForTimeout(400);
  const hid=await page.evaluate(()=>document.querySelector('#side').getBoundingClientRect().top>=innerHeight-1);
  await page.click('#fsManage');await page.waitForTimeout(400);
  const shown=await page.evaluate(()=>document.querySelector('#side').getBoundingClientRect().bottom<=innerHeight+1&&document.querySelector('#side').getBoundingClientRect().top<innerHeight*0.7);
  ok('sheet: full-screen drawer hides and opens',hid&&shown,`hidden ${hid}, open ${shown}`);
  await ctx.close();
}
if(!only||only==='tour'){
  for(const vp of [{width:390,height:844},{width:1440,height:900}]){
    const {ctx,page,errs}=await open(vp,null,vp.width<900);
    const a=await page.evaluate(()=>({s:__sim.G.tour.s,coach:!document.querySelector('#coach').hidden}));
    await page.click('[data-tnext]');await page.waitForTimeout(400);
    const b=await page.evaluate(()=>({s:__sim.G.tour.s,spot:!document.querySelector('#spot').hidden}));
    ok(`tour: ${vp.width}px`,a.coach&&a.s===0&&b.s===1&&b.spot&&!errs.length,JSON.stringify([a,b]));
    await ctx.close();
  }
}
await browser.close();
const failed=results.filter(r=>!r[1]).length;
console.log(`\n${results.length-failed}/${results.length} passed`);
process.exit(failed?1:0);
