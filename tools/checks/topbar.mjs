// The top bar (help, pause, speeds, the views, full screen, sound) keeps every button on one row, at touch size on
// phones, in portrait down to 320 px, in landscape, and on tablet and desktop, in the airport view and the Region, with
// and without full screen.
import {join} from 'node:path';

// [width, height, touch, full screen and sound stay in the bar, narrowest touch target]: targets are at least 40px, but
// 36px wide on a map under 272px and 29px under 240px (a small phone on its side)
const SIZES=[[320,568,true,false],[390,844,true,true],[844,390,true,false],[667,375,true,false,36],[568,320,true,false,29],[768,1024,true,true],[1440,900,false,true]];
export default async function({open,ok,saveText,newest,out}){
  for(const [w,h,touch,bar,minW=40] of SIZES){
    const {ctx,page,errs}=await open({width:w,height:h},saveText(newest),touch,{still:true});
    const bad=[];
    for(const fs of [false,true])for(const view of ['airport','region']){
      await page.evaluate(([fs,view])=>{
        const b=document.body;if(b.classList.contains('fs')!==fs)document.querySelector('#fsb').click();
        const v=document.querySelector('#viewb');if(v.classList.contains('on')!==(view==='region'))v.click();
        dispatchEvent(new Event('resize'));
      },[fs,view]);
      await page.waitForTimeout(250);
      const r=await page.evaluate(()=>{
        const hud=document.querySelector('.hud').getBoundingClientRect();
        const bs=[...document.querySelectorAll('.hud button')].filter(b=>b.offsetParent).map(b=>{const r=b.getBoundingClientRect();return {id:b.id||b.dataset.speed||b.textContent,top:r.top,w:r.width,h:r.height,l:r.left,r:r.right}});
        // full screen and sound leave the bar only on the narrowest maps, and then the help card carries them
        const inBar=!!document.querySelector('#snd').offsetParent&&!!document.querySelector('#fsb').offsetParent;
        document.querySelector('#helpb').click();const inHelp=!!document.querySelector('#hfs').offsetParent&&!!document.querySelector('#hsnd').offsetParent;
        document.querySelector('[data-helpclose]').click();
        return {bs,hud:{l:hud.left,r:hud.right},vw:innerWidth,inBar,inHelp};
      });
      const tops=r.bs.map(b=>b.top),spread=Math.max(...tops)-Math.min(...tops);
      const small=touch?r.bs.filter(b=>b.w<minW-0.5||b.h<40-0.5):[];
      const off=r.bs.filter(b=>b.l<0||b.r>r.vw);
      const lost=!r.inBar&&(bar||!r.inHelp);
      if(spread>2||small.length||off.length||r.bs.length<6||lost)bad.push(`${fs?'fs ':''}${view}: ${r.bs.length} buttons, rows ${spread.toFixed(0)}px apart${small.length?', small '+small.map(b=>`${b.id} ${b.w.toFixed(0)}×${b.h.toFixed(0)}`).join(' '):''}${off.length?', off screen '+off.map(b=>b.id).join(' '):''}${lost?', full screen and sound '+(r.inHelp?'out of the bar':'missing'):''}`);
      if(bad.length&&!bad.shot){bad.shot=1;await page.screenshot({path:join(out,`topbar-${w}x${h}.png`)})}
    }
    ok(`topbar: one row at ${w}×${h}`,!bad.length&&!errs.length,bad.join('; ')+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
}
