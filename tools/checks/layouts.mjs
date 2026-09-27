// Every airport layout plays two hours fully built without errors, its Layout tab fits a 320 px phone, and a desktop
// screenshot of each goes in build/shots/.
import {join} from 'node:path';

export default async function({open,ok,saveText,newest,root,out}){
  for(const id of ['classic','remote','stagger','curve','hall','sat','star','round','mid']){
    const {ctx,page,errs}=await open({width:1440,height:900},saveText(newest),false);
    const r=await page.evaluate(id=>{const S=__sim,G=S.G;S.switchLayout(id);S.SIDX.forEach(i=>{G.stands[i].built=true});
      const types=G.shops.filter(Boolean).map(s=>s.type);S.SHOP_X.forEach((x,j)=>{if(!G.shops[j])G.shops[j]={type:types[j%types.length]||0,lvl:1,earned:0,spent:500}});
      const f0=G.flights;S.R.sim=true;for(let i=0;i<120*10;i++)S.update(0.1);S.R.sim=false;
      document.querySelectorAll('#tip,#toasts').forEach(e=>e.style.display='none');
      return {flights:G.flights-f0,busy:S.R.st.filter((x,i)=>i<S.SIDX.length&&x.F).length,stands:S.SIDX.length}},id);
    await page.keyboard.press('0');await page.waitForTimeout(500);
    await page.screenshot({path:join(root,'build/shots',`layout-${id}.png`)});
    ok(`layouts: ${id} plays two hours fully built`,!errs.length&&r.flights>0&&r.busy>0,`${r.flights} flights, ${r.busy} of ${r.stands} stands busy`+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
  // the Layout tab on the smallest phone, with every layout approved
  const {ctx,page,errs}=await open({width:320,height:640},saveText(newest),true);
  const o=await page.evaluate(()=>{const S=__sim;for(const T of S.TECH)if(T.b==='lay')S.G.tech[T.id]=1;S.R.aSub='layout';S.setTab('ground');
    const W=document.documentElement.clientWidth;const over=[...document.querySelectorAll('#panel *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.right>W+1||r.left<-1)}).slice(0,2).map(e=>e.className||e.tagName);
    return {over,cards:document.querySelectorAll('.laycard').length,all:Object.keys(S.LAYOUTS).length}});
  if(o.over.length)await page.screenshot({path:join(out,'layouts_tab_320.png')});
  ok('layouts: the Layout tab fits a 320 px phone',!o.over.length&&o.cards===o.all&&!errs.length,`${o.cards} layouts`+(o.over.length?' overflow: '+o.over.join(' '):'')+(errs.length?' '+errs[0]:''));
  await ctx.close();
}
