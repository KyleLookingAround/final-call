// No sideways overflow and no page scroll, from 320 px phones to 2560 px screens, portrait and landscape.
import {join} from 'node:path';

export default async function({open,ok,saveText,newest,out}){
  const save=saveText(newest);
  for(const [w,h] of [[320,640],[360,780],[390,844],[768,1024],[844,390],[915,412],[1024,768],[1440,900],[2560,1440]]){
    const touch=w<1000&&h<1100;const {ctx,page,errs}=await open({width:w,height:h},save,touch);const bad=[];
    for(const [tab,view,sub,ss] of [['stands','airport','fleet'],['routes','world'],['region','region'],['office','airport','progress'],['office','airport','records'],...['managers','alerts','screen','save'].map(ss=>['office','airport','settings',ss])]){
      await page.evaluate(([tab,view,sub,ss])=>{__sim.setView(view);if(sub){if(tab==='office')__sim.R.oSub=sub;else __sim.R.gSub=sub}if(ss)__sim.R.setSub=ss;__sim.setTab(tab)},[tab,view,sub,ss]);await page.waitForTimeout(120);
      const o=await page.evaluate(()=>{const W=document.documentElement.clientWidth,H=innerHeight;const over=[...document.querySelectorAll('#panel *, .board *, .hud, .fsbar, #side')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&getComputedStyle(e).visibility!=='hidden'&&(r.right>W+1||r.left<-1)}).slice(0,2).map(e=>e.id||String(e.className));return {scroll:document.documentElement.scrollHeight>H+1||document.documentElement.scrollWidth>W+1,over}});
      if(o.scroll||o.over.length)bad.push(`${tab}/${sub||view}${ss?'/'+ss:''} ${JSON.stringify(o)}`);
    }
    if(bad.length)await page.screenshot({path:join(out,`layout_${w}x${h}.png`)});
    ok(`layout: ${w}x${h}`,!bad.length&&!errs.length,bad[0]||errs[0]||'');
    await ctx.close();
  }
}
