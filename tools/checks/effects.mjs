// The effects ledger (04-effects.js, docs/SYSTEMS.md): every cause the rating moves for over a day of play has a
// REPWHY entry (what the advisor says) and a REPLBL label (the Money tab's rating list); R.repWhy adds up to the
// change in G.rep; and the airport's own rating events carry the stand they happened at.
const AT_STAND=['late','punctual','queues','missed','care','lounge','bus','noise'];
export default async function({open,ok,saveText}){
  // a day at a level 9 airport as it is, a few hours with buses to remote stands, and a layout that pleases
  // passengers at noon; each on a fresh page, since a layout is switched before its passengers arrive
  const runs=[['classic',24*60],['remote',6*60],['curve',24*60]],res=[],errs=[];
  for(const [id,mins] of runs){const {ctx,page,errs:e}=await open(undefined,saveText('v32-L9.json'),false,{still:true});
    res.push(await page.evaluate(([id,mins,AT_STAND])=>{const S=__sim,R=S.R;R.sim=true;
      if(id!=='classic'){S.switchLayout(id);S.SIDX.forEach(i=>{S.G.stands[i].built=true});S.G.lounges=false}
      const placed={n:0,bad:[]},seen=new WeakSet(),look=()=>{for(const e of R.repEv||[])if(!seen.has(e)){seen.add(e);
        if(AT_STAND.includes(e[1])){placed.n++;if(typeof e[4]!=='number'&&placed.bad.length<4)placed.bad.push(e[1])}}};
      // the guard: over a seeded hour, the causes add up to the change in the rating
      R.repWhy={};const rep0=S.G.rep;for(let k=0;k<600;k++){S.update(0.1);look()}
      const sum=Object.values(R.repWhy).reduce((a,b)=>a+b,0),moved=S.G.rep-rep0;
      for(let k=0;k<mins*10;k++){S.update(0.1);look();if(id==='curve'&&R.repWhy.layout!=null)break}
      R.sim=false;const T=R.effects||{};
      return {id,sum,moved,used:Object.keys(R.repWhy),REPWHY:Object.keys(T.REPWHY||{}),REPLBL:Object.keys(T.REPLBL||{}),placed}},[id,mins,AT_STAND]));
    errs.push(...e);await ctx.close()}
  const used=[...new Set(res.flatMap(r=>r.used))].sort(),T=res[0],noWhy=used.filter(k=>!T.REPWHY.includes(k)),noLbl=used.filter(k=>!T.REPLBL.includes(k));
  ok('effects: every cause the rating moved for over a day has a REPWHY entry',!noWhy.length&&!errs.length,noWhy.length?'missing: '+noWhy.join(', '):errs[0]||used.join(', '));
  ok('effects: every cause the rating moved for over a day has a label',!noLbl.length,noLbl.length?'missing: '+noLbl.join(', '):'');
  const off=res.filter(r=>Math.abs(r.sum-r.moved)>1e-9);
  ok('effects: the causes add up to the change in the rating over a seeded hour',!off.length,res.map(r=>`${r.id}: causes ${r.sum.toFixed(4)}, rating ${r.moved.toFixed(4)}`).join('; '));
  const n=res.reduce((a,r)=>a+r.placed.n,0),bad=res.flatMap(r=>r.placed.bad);
  ok('effects: the airport\'s rating events carry the stand they happened at',n>50&&!bad.length,`${n} events`+(bad.length?', none at: '+bad.join(', '):''));
}
