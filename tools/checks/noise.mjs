// Less noise (polish audit rows 11, 15, 16, 27): repeated region incidents fold into one Reports line;
// a full stack of choice toasts still resolves the one the cap evicts, and informational toasts expire on
// their own; the advisor's tip clears off the airport view and returns on it; a young save's What's new
// folds older versions away. Row 29 (the update-checker's fetch) is confirmed by reading the source: it's
// already wrapped in try/catch, so nothing here exercises it.
export default async function({open,ok,saveText,newest}){
  const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});
  const toasts=await page.evaluate(()=>{
    const S=__sim;
    S.R.toasts.length=0;const resolved=[];
    for(let i=1;i<=4;i++)S.toast('Choice '+i,[{label:'A',fn:()=>resolved.push(i+'A')},{label:'B',fn:()=>resolved.push(i+'B')}],'c'+i,'',60);
    const stack={count:S.R.toasts.length,ids:S.R.toasts.map(t=>t.id),resolved:resolved.slice()};
    S.R.toasts.length=0;
    S.toast('Info toast',null,null,'',2);
    S.tickToasts(1);S.tickToasts(1.5);
    return {stack,infoLeft:S.R.toasts.length};
  });
  ok('noise: a full stack of choice toasts still resolves the one the cap evicts',
    toasts.stack.count===3&&toasts.stack.resolved.length===1&&toasts.stack.resolved[0]==='1B'&&!toasts.stack.ids.includes('c1'),
    JSON.stringify(toasts.stack));
  ok('noise: an informational toast expires on its own',toasts.infoLeft===0,JSON.stringify(toasts));

  const news=await page.evaluate(()=>{
    const S=__sim,G=S.G;G.news=[];
    S.news('A signal failure stopped R2 for 30 min.');
    S.news('A wire fault stopped M1 for 30 min.');
    S.news('A signal failure stopped T1 for 22.5 min.');
    S.news('Full time: Harbourgate FC 2–1 Rivals.');
    const mixed={count:G.news.length,rows:G.news.map(n=>n.m)};
    G.news=[];
    S.news('A signal failure stopped R2 for 30 min.');
    S.news('A signal failure stopped R2 for 20 min.');
    const sameLine={count:G.news.length,rows:G.news.map(n=>n.m)};
    return {mixed,sameLine};
  });
  ok('noise: repeated region incidents on different lines fold into one Reports line naming every line hit',
    news.mixed.count===2&&news.mixed.rows[1]==='Signal and wire faults have stopped R2, M1 and T1 today.',
    JSON.stringify(news.mixed));
  ok('noise: the same line failing twice folds into one line too',
    news.sameLine.count===1&&news.sameLine.rows[0]==='Signal failures have stopped R2 today.',
    JSON.stringify(news.sameLine));

  const whatsNew=await page.evaluate(()=>{
    const S=__sim,G=S.G;
    G.level=1;G.seen=S.UPDATES[1].v;S.openNews(true,false);
    const young={all:document.querySelectorAll('#newsList > details').length,open:document.querySelectorAll('#newsList > details[open]').length};
    S.openNews(false);
    G.level=9;G.seen=S.UPDATES[1].v;S.openNews(true,false);
    const grown={all:document.querySelectorAll('#newsList > details').length};
    S.openNews(false);
    return {young,grown,total:S.UPDATES.length};
  });
  ok('noise: a young save folds older What\'s new versions away, a grown one sees them all',
    whatsNew.young.all<whatsNew.total&&whatsNew.young.open===1&&whatsNew.grown.all===whatsNew.total,JSON.stringify(whatsNew));

  const tip=await page.evaluate(()=>{
    const S=__sim,G=S.G,el=document.querySelector('#tip');G.cash=-500;
    S.setView('airport');S.renderTip();const airport=el.hidden;
    S.setView('region');S.renderTip();const region=el.hidden;
    S.setView('airport');S.renderTip();const back=el.hidden;
    return {airport,region,back};
  });
  ok('noise: the advisor tip clears off the airport view and returns on it',
    !tip.airport&&tip.region&&!tip.back,JSON.stringify(tip));

  if(errs.length)ok('noise: no page errors',false,errs[0]);
  await ctx.close();
}
