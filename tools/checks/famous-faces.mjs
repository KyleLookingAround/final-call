// Famous faces (docs/systems/famous-faces.md): over a seeded level 5 run a visit is booked a day ahead and announced in the
// region news and under the board; on the day a crowd gathers and clears once their flight leaves, the café's busy hour and
// the rating move through the ledger with the flight's stand as the place, nothing throws with R.sim, and an older save
// without the field loads with its default.
export default async function({open,ok,saveText}){
  const save=saveText('v32-L5.json');
  {const {ctx,page,errs}=await open(undefined,save,false,{still:true});
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;
      const old=JSON.stringify(G.famous),fields=typeof S.FIELDS.famous==='function'&&JSON.stringify(S.FIELDS.famous());
      // the next booking is due at the next day change
      G.famous.next=G.day+1;R.sim=true;const d0=G.day;
      let booked=null,news=null,line='',crowd=0,after=null,rep=null,paidAt=null,steps=0,paid=0;
      while(G.day===d0&&steps<30000){S.update(0.1);steps++}
      booked=G.famous.v&&{...G.famous.v};news=(G.news||[]).find(n=>/^Tomorrow: /.test(n.m));
      // the line under the board, in a page that draws
      R.sim=false;S.famousLine();line=document.querySelector('#ffLine').hidden?'':document.querySelector('#ffLine').textContent;R.sim=true;
      // every place shop money moves at in a step, since another shopper can pay after the busy hour's top-up
      const at=[];{let cur=R.cashAt.shops;Object.defineProperty(R.cashAt,'shops',{configurable:true,enumerable:true,get:()=>cur,set:x=>{cur=x;at.push(x)}})}
      for(let k=0;k<50*600&&G.famous.v&&G.famous.v.st!==2;k++){at.length=0;S.update(0.1);
        const f=R.famous,v=G.famous.v;if(f){crowd=Math.max(crowd,f.ph.length+f.fan.length)}
        if(v&&(v.paid||0)>paid){paid=v.paid;if(paidAt==null)paidAt=R.famous&&at.includes(R.famous.F.i)?R.famous.F.i:at[0]}
        if(!rep){const e=(R.repEv||[]).find(e=>e[1]==='famous');if(e)rep={d:e[3],at:e[4]}}}
      const v=G.famous.v;after={st:v&&v.st,crowd:!!R.famous,at:v&&v.at,paid:v&&v.paid||0,paidAt};
      const told=(G.news||[]).find(n=>/left (on time|\d+ min late) on /.test(n.m));
      R.sim=false;return {old,fields,booked,d0,news:news&&news.m,line,crowd,after,rep,told:told&&told.m}});
    const b=r.booked;
    ok('famous faces: a visit is booked a day ahead, in the news and under the board',b&&b.d===r.d0+2&&b.st===0&&/Tomorrow: .+ flies from here at about \d\d:\d\d\./.test(r.news||'')&&/^★ Tomorrow ~\d\d:\d\d · /.test(r.line)&&!errs.length,JSON.stringify({b,news:r.news,line:r.line})+(errs.length?' '+errs[0]:''));
    ok('famous faces: a crowd gathers on the day and clears when their flight leaves',r.crowd>=10&&r.after.st===2&&!r.after.crowd&&r.told&&!errs.length,JSON.stringify({crowd:r.crowd,after:r.after,told:r.told}));
    ok('famous faces: the busy hour and the rating go through the ledger with the flight’s stand',r.after.paid>0&&r.after.paidAt===r.after.at&&r.rep&&Math.abs(r.rep.d)===1&&r.rep.at===r.after.at&&r.after.at>=0,JSON.stringify({after:r.after,rep:r.rep}));
    ok('famous faces: an older save without the field loads with its default',r.fields==='{"next":0,"v":null}'&&r.old===r.fields,JSON.stringify({old:r.old,fields:r.fields}));
    await ctx.close()}
}
