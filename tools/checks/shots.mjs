// Phone, tablet and desktop screenshots of the airport, world and region, in build/shots/ (CI keeps them as the
// "screenshots" artifact on every PR).
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

export default async function({open,ok,saveText,newest,root}){
  // for looking at a change by eye; CI keeps them as the "screenshots" artifact on every PR
  const dir=join(root,'build/shots');mkdirSync(dir,{recursive:true});
  for(const [name,vp,touch] of [['phone',{width:390,height:844},true],['tablet',{width:768,height:1024},true],['desktop',{width:1440,height:900},false]]){
    const {ctx,page,errs}=await open(vp,saveText(newest),touch);
    await page.evaluate(()=>{const S=__sim;S.R.sim=true;for(let i=0;i<60*4;i++)S.update(0.25);S.R.sim=false}); // an hour in, so planes are at the gates
    for(const [tab,view] of [['stands','airport'],['routes','world'],['region','region']]){
      await page.evaluate(([tab,view])=>{__sim.setView(view);__sim.setTab(tab)},[tab,view]);await page.waitForTimeout(400);
      await page.screenshot({path:join(dir,`${name}-${view}.png`)});
    }
    // the What's new card's Roadmap tab, on the same page
    await page.evaluate(()=>{__sim.openNews(true,false);document.querySelector('#news [data-newstab="road"]').click();document.querySelector('#roadmapList .rrow summary').click()});await page.waitForTimeout(300);
    await page.screenshot({path:join(dir,`${name}-roadmap.png`)});await page.evaluate(()=>__sim.openNews(false));
    ok(`shots: ${name}`,!errs.length,errs[0]||'build/shots/'+name+'-*.png');
    await ctx.close();
  }
}
