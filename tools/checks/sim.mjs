// The headless sim: a new game plays 72 game hours with R.sim on, without errors.

export default async function({open,ok}){
  const {ctx,page,errs}=await open();
  const r=await page.evaluate(()=>{const S=__sim,G=S.G;S.R.sim=true;for(let i=0;i<72*60*4;i++)S.update(0.25);S.R.sim=false;return {flights:G.flights,clock:Math.round(G.clock),cash:Math.round(G.cash)}});
  ok('sim: 72 game hours headless',!errs.length&&r.flights>10,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
  await ctx.close();
}
