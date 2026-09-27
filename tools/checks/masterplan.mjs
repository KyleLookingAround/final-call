// The Masterplan overlay (issue #73, polish audit rows 6-7): opening it on a small phone keeps the
// header and buy-point button in view, and one plan per category is marked as the recommended next
// pick, worded like the level-up card's "what this unlocks" line. The recommendation is display only.
export default async function({open,ok}){
  {
    const {ctx,page,errs}=await open({width:320,height:568},null,true,{still:true});
    const r=await page.evaluate(()=>{
      const S=__sim,G=S.G;G.level=4;G.pts=6;G.cash=1e6;
      S.openPlan();
      const head=document.querySelector('#planBody .phead').getBoundingClientRect();
      const buy=document.querySelector('#planBody .phead [data-buypt]').getBoundingClientRect();
      return {headTop:head.top,headBottom:head.bottom,buyTop:buy.top,buyBottom:buy.bottom,vh:innerHeight};
    });
    ok('masterplan: opening it on a 320×568 phone keeps the header and buy-point button in view',
      r.headTop>=0&&r.headBottom<=r.vh&&r.buyTop>=0&&r.buyBottom<=r.vh,JSON.stringify(r));
    if(errs.length)ok('masterplan: no page errors (small phone)',false,errs[0]);
    await ctx.close();
  }
  {
    const {ctx,page,errs}=await open({width:1440,height:900},null,false,{still:true});
    const r=await page.evaluate(()=>{
      const S=__sim,G=S.G;G.level=5;G.pts=8;
      S.openPlan();
      const branches=[...new Set(S.TECH.map(T=>T.b))];
      const recs=branches.map(b=>S.recommendedTech(b)).filter(Boolean);
      const badges=document.querySelectorAll('#planBody .trec').length;
      const oneEach=recs.every(T=>{
        const card=document.querySelector(`#planBody .tnode[data-node="${T.id}"]`);
        return card&&card.classList.contains('s-rec')&&card.querySelector('.trec')&&
          card.querySelector('.td').textContent===S.planUnlockLine(T)&&!card.querySelector('.tu');
      });
      // the recommended line never says less than the normal card's separate unlock list would
      const noLoss=recs.every(T=>T.u.map(S.itemName).filter(x=>x!==T.n).every(n=>S.planUnlockLine(T).includes(n)));
      // it only marks plans that are actually ready to approve, and never a locked or already-approved one
      const soundly=recs.every(T=>S.techState(T)==='ready');
      return {branches:branches.length,recs:recs.length,badges,oneEach,noLoss,soundly};
    });
    ok('masterplan: one recommended plan per category, worded like the level-up card',
      r.recs>0&&r.badges===r.recs&&r.oneEach&&r.noLoss&&r.soundly,JSON.stringify(r));
    if(errs.length)ok('masterplan: no page errors (recommendation)',false,errs[0]);
    await ctx.close();
  }
}
