// Every save in tools/saves loads, plays two game days and opens every tab.

export default async function({open,ok,saveText,saves}){
  for(const f of saves){
    const {ctx,page,errs}=await open({width:1280,height:800},saveText(f));
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,lv=G.level;S.R.sim=true;for(let i=0;i<2*24*60*4;i++)S.update(0.25);S.R.sim=false;return {lv,day:G.day,crews:G.crews.length,tour:!!(G.tour&&G.tour.done)}});
    for(const [tab,sub] of [['stands','gates'],['stands','fleet'],['terminal'],['ground'],['sales'],['routes'],['region'],['office','progress'],['office','records'],['office','settings']]){
      await page.evaluate(([tab,sub])=>{if(sub){if(tab==='office')__sim.R.oSub=sub;else __sim.R.gSub=sub}__sim.setTab(tab)},[tab,sub]);await page.waitForTimeout(60)}
    ok(`saves: ${f}`,!errs.length&&r.tour,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
}
