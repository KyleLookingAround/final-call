// On a phone the bottom panel drags up and down with touch and snaps, the page never scrolls, and in full screen it
// becomes a drawer.
import {join} from 'node:path';

export default async function({open,ok,saveText,newest,out}){
  const {ctx,page,errs}=await open({width:390,height:844},saveText(newest),true);
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
  // a small phone: fully open, the sheet still shows at least 240px of panel (the board steps aside)
  {const {ctx:c2,page:p2,errs:e2}=await open({width:320,height:568},saveText(newest),true);
    const cd=await c2.newCDPSession(p2);
    const sw=async(y0,y1)=>{await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:160,y:y0}]});for(let k=1;k<=10;k++){await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:160,y:y0+(y1-y0)*k/10}]});await p2.waitForTimeout(16)}await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p2.waitForTimeout(350)};
    const grip=()=>p2.evaluate(()=>{const g=document.querySelector('#grip').getBoundingClientRect();return g.top+g.height/2});
    await sw(await grip(),100);
    const r=await p2.evaluate(()=>({panel:Math.round(document.querySelector('#panel').getBoundingClientRect().height),snap:__sim.G.sheet,scroll:document.documentElement.scrollHeight-innerHeight}));
    if(r.panel<240)await p2.screenshot({path:join(out,'sheet-320.png')});
    ok('sheet: 320px phone keeps 240px of panel when fully open',r.panel>=240&&r.snap===2&&r.scroll<=0&&!e2.length,`panel ${r.panel}px, snap ${r.snap}`+(e2.length?' '+e2[0]:''));
    await c2.close()}
  await ctx.close();
}
