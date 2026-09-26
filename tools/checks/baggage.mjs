// The baggage system (src/game/45-baggage.js): every checked bag ends in a hold or is left behind and counted, every
// arriving bag reaches its carousel, an overloaded sorter backs up, a tight transfer can miss, and early bags wait in the store.
export default async function({open,ok,saveText}){
  const {ctx,page,errs}=await open(undefined,saveText('v26-L5.json'),false,{still:true});
  // eight game hours of a level 5 airport, following every flight's bags, with the screening and sorter squeezed so some miss
  const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;R.sim=true;G.lv.screen=0;G.lv.bagsys=0;
    const first=new Map(),bad=[],arr=new Set(),board=new Set();let deps=0,missed=0,arrDone=0,maxSort=0;
    for(let k=0;k<480*10;k++){
      if(k===600)for(const i of S.SIDX){const F=R.st[i].F;if(F&&!F.freighter)for(let j=0;j<40;j++){R.belt.push({x:560,F});F.checkedTotal++}} // a rush of bags
      if(k===620){const F=S.SIDX.map(i=>R.st[i].F).find(F=>F&&!F.freighter&&(F.plane.state==='turnaround'||F.plane.state==='boarding')&&F.checkedTotal>F.bagsIn+(F.bg?F.bg.tug:0)+5);
        if(F){F.manifest.length=0;F.straggler=null;F.seated=F.booked;F.plane.state='boarding';F.std=G.clock}} // a flight that goes before its bags are through
      S.update(0.1);
      const B=S.bagRT();maxSort=Math.max(maxSort,B.sort.reduce((s,g)=>s+g[1],0)+B.scr.reduce((s,g)=>s+g[1],0));
      for(const i of S.SIDX){const F=R.st[i].F;if(!F||F.freighter)continue;
        if(!first.has(F))first.set(F,{n:F.checkedTotal,extra:0});
        if(k===600)first.get(F).extra=40;
        if(F.plane.state==='closing'&&!first.get(F).seen){const o=first.get(F);o.seen=1;deps++;const m=F.bg?F.bg.miss:0;missed+=m;
          if(Math.round(F.hold)!==F.checkedTotal||F.checkedTotal+m!==o.n+o.extra)bad.push(`${F.code}${F.no}: ${o.n+o.extra} checked, ${Math.round(F.hold)} in the hold, ${m} left behind`)}
        if(F.arr.started){arr.add(F.arr);const b=S.bagStatus(F.arr);if(b)board.add(b.replace(/\d+$/,'n'))}}}
    for(const A of arr){const fed=A.bg?A.bg.fed:0;if(A.done){arrDone++;if(fed!==A.bags)bad.push(`arrival ${A.code}${A.no}: ${fed} of ${A.bags} bags reached the carousel`)}else if(fed>A.bags)bad.push(`arrival ${A.code}${A.no}: too many bags`)}
    R.sim=false;return {deps,missed,arrDone,bad:bad.slice(0,3),maxSort,xin:S.bagRT().xin||0,board:[...board]}});
  ok('baggage: every checked bag ends in a hold or is left behind and counted',r.deps>=10&&r.missed>0&&r.xin>0&&!r.bad.some(b=>!b.startsWith('arrival'))&&!errs.length,`${r.deps} departures, ${r.missed} bags left behind, ${r.xin} transfer bags through the hall ${r.bad.join('; ')}${errs[0]||''}`);
  ok('baggage: every arriving bag reaches its carousel, and the board says which',r.arrDone>=10&&r.board.includes('ON BELT n')&&!r.bad.some(b=>b.startsWith('arrival')),`${r.arrDone} arrivals cleared, board: ${r.board.join(', ')} ${r.bad.join('; ')}`);
  // the sorter: the same pile of bags clears more slowly without the automated system, and backs up
  const s=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;R.sim=true;
    const run=l=>{G.lv.bagsys=l;G.lv.screen=5;G.lv.makeup=6;const B=S.bagRT();B.scr=[];B.sort=[];B.late=0;
      const Fs=S.SIDX.map(i=>R.st[i].F).filter(F=>F&&!F.freighter&&F.bg&&!F.bg.cut);for(const F of Fs){S.givePos(F);B.sort.push([F,300])}
      const n0=B.sort.reduce((s,g)=>s+g[1],0);for(let k=0;k<100;k++)S.update(0.1);const left=B.sort.reduce((s,g)=>s+g[1],0);return {moved:n0-left,left,late:B.late}};
    const slow=run(0),fast=run(3);R.sim=false;return {slow,fast,cap:[S.bagCaps().sort]}});
  ok('baggage: an overloaded sorter backs up, and the automated system clears it faster',s.slow.left>0&&s.slow.late>=3&&s.slow.moved<=21*10&&s.fast.moved>s.slow.moved*1.8,JSON.stringify(s));
  // a carousel full of one flight's uncollected bags holds up the next flight's: the board says so for that one only
  const c=await page.evaluate(()=>{const S=__sim,R=S.R;R.sim=true;const B=S.bagRT();
    const As=S.SIDX.map(i=>R.st[i].F).filter(F=>F&&!F.freighter).map(F=>F.arr).slice(0,2);if(As.length<2){R.sim=false;return {none:true}}
    const [A1,A2]=As;for(const L of B.car)L.length=0;for(const A of As){A.car=0;A.started=A.started??S.G.clock;B.car[0].push(A);A.bg=A.bg||{ap:0,ap0:0,hall:0,fed:0,acc:0,first:null,last:null,stall:0,xs:true}}
    A1.reclaim=45;A1.bg.fed=0;A1.bags=Math.max(A1.bags,90);A1.bg.hall=0;A2.reclaim=0;A2.bg.fed=0;A2.bags=Math.max(A2.bags,30);A2.bg.hall=30;A2.bg.stall=0;
    const pax=R.pax;R.pax=[];for(let k=0;k<30;k++)S.update(0.1);R.pax=pax;const r={a1:S.bagStatus(A1),a2:S.bagStatus(A2)};R.sim=false;return r});
  ok('baggage: bags held up by another flight’s on the carousel show BAGS LATE',c.a2==='BAGS LATE'&&c.a1!=='BAGS LATE',JSON.stringify(c));
  // a tight transfer: the next flight is ready to go before the bag gets there
  const t=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;R.sim=true;G.lv.bagsys=0;
    let A=null,F2=null;for(let k=0;k<600*10&&!F2;k++){S.update(0.1);for(const i of S.SIDX){const F=R.st[i].F;if(F&&F.arr.xb&&!F.arr.started){A=F.arr;F2=A.xb.find(x=>R.st[x.i].F===x&&!x.bg?.cut);if(F2)break}}}
    if(!F2){R.sim=false;return {none:true}}
    const cash=G.cash,miss=G.bagMiss||0,xin=S.bagRT().xin||0;
    F2.manifest.length=0;F2.straggler=null;F2.seated=F2.booked;F2.plane.state='boarding';F2.std=G.clock;
    for(let k=0;k<20;k++)S.update(0.1);
    R.sim=false;return {miss:(G.bagMiss||0)-miss,f2:F2.bg?F2.bg.miss:0,paid:cash-G.cash,xin:(S.bagRT().xin||0)-xin}});
  ok('baggage: a tight transfer misses its flight, and a courier takes it on',!t.none&&t.f2>=1&&t.miss>=1&&t.paid>0,JSON.stringify(t));
  await ctx.close();
  // early bags: with fewer make-up positions than flights, later flights' bags wait in the store, or circle the sorter without one
  const e=await (async()=>{const {ctx,page}=await open(undefined,saveText('v27-L9.json'),false,{still:true});
    const res=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;R.sim=true;G.lv.makeup=0;G.lv.screen=5;
      const go=l=>{G.lv.ebs=l;let ebs=0,loop=0;for(let k=0;k<90*10;k++){S.update(0.1);const B=S.bagRT();ebs=Math.max(ebs,B.ebs);loop=Math.max(loop,B.loop)}return {ebs,loop}};
      const none=go(0),store=go(3),B=S.bagRT();R.sim=false;return {none,store,flights:S.SIDX.filter(i=>R.st[i].F).length,pos:B.pos.length}});
    await ctx.close();return res})();
  ok('baggage: early bags wait in the store, and circle the sorter without one',e.store.ebs>0&&e.none.loop>0&&e.none.ebs===0&&e.flights>e.pos,JSON.stringify(e));
}
