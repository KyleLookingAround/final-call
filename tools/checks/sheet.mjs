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
  await ctx.close();
}
