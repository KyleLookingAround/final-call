// Departures (docs/specs/terminal.md): check-in islands with their own queues, bag drop for kiosk and online passengers
// with bags, and security: the search rate, family and assistance lanes, and no way into the market place but a lane.
export default async function({open,ok,saveText}){
  const {ctx,page,errs}=await open(undefined,saveText('v26-L9.json'),false,{still:true});
  const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;R.sim=true;const L=S.depLog;for(const k in L)delete L[k];
    G.lv.bagdrop=4;G.lv.kiosks=Math.max(2,G.lv.kiosks);G.lv.online=Math.max(2,G.lv.online);
    const ci=S.ROOMS[S.hallId('ci')].poly,sec=S.ROOMS[S.hallId('sec')].poly,mkt=S.hallId('mkt'),inP=(P,x,y)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [xi,yi]=P[i],[xj,yj]=P[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c};
    // every queue place sits in its hall
    const slots=[];for(let j=0;j<240;j+=3){for(let q=0;q<6;q++){const s=S.qSlot(q,j);if(!inP(ci,s.x,s.y))slots.push('check-in queue '+q)}
      for(const [n,f] of [['security',S.secSlot],['family',S.famSlot],['fast track',S.ftSlot],['search',S.srchSlot]]){const s=f(j);if(!inP(sec,s.x,s.y))slots.push(n)}}
    let sneak=0,islOut=0,islSeen=new Set(),bagsBy={};
    const run=mins=>{for(let k=0;k<mins*10;k++){S.update(0.1);if(k%5)continue;
      for(const p of R.pax){if(!p.inbound&&!p.xferred&&p.room===mkt&&!p.cleared)sneak++}
      for(const p of R.ciQ)if(p.isl<4){islSeen.add(p.isl);if(p.x!==undefined&&!inP(ci,p.x,p.y))islOut++}}};
    run(240);const a={...L};
    G.lv.ctscan=1;for(const k in L)delete L[k];run(240);const b={...L};
    R.sim=false;return {slots:[...new Set(slots)],sneak,islOut,isl:islSeen.size,a,b}});
  const {a,b}=r;
  ok('departures: every check-in, security, fast track and search queue place sits in its hall',!r.slots.length,r.slots.join(', '));
  ok('departures: each island’s queue stays in the check-in hall and is served by its own desks',r.isl>=2&&!r.islOut&&!a.wrongIsland&&!b.wrongIsland&&(a['desk:bag']||0)>50,`${r.isl} islands queued, ${r.islOut} out of the hall, ${a.wrongIsland||0} served by another island`);
  ok('departures: passengers with bags who checked in online or at a kiosk use bag drop',(a['dropK:bag']||0)>20&&(a['dropO:bag']||0)>20&&!a['kiosk:bag']&&!b['kiosk:bag'],JSON.stringify(a));
  const ra=(a.searched||0)/(a.screened||1),rb=(b.searched||0)/(b.screened||1);
  ok('departures: about 1 bag in 12 is searched, 1 in 30 with CT scanners',a.screened>1000&&b.screened>1000&&Math.abs(ra-1/12)<0.02&&Math.abs(rb-1/30)<0.012,`1 in ${(1/ra).toFixed(1)} of ${a.screened}, then 1 in ${(1/rb).toFixed(1)} of ${b.screened}`);
  ok('departures: families and passengers who need help use their lane',(a.famLane||0)>100&&!a.famOther&&!b.famOther,`${a.famLane} through their lane, ${a.famOther||0} through another`);
  ok('departures: nobody reaches the market place without passing a lane',!r.sneak&&!errs.length,`${r.sneak} seen${errs.length?' '+errs[0]:''}`);
  await ctx.close();
  // every open search table has a searcher on wages: one per open lane, and one for the fast track
  {const {ctx,page,errs}=await open(undefined,saveText('v28-L9.json'),false,{still:true});
    const w=await page.evaluate(()=>{const S=__sim,D=S.derived(),n=S.tablesOpen(D),with_=S.wageBill(),k=S.WAGE.srch;S.WAGE.srch=0;const without=S.wageBill();S.WAGE.srch=k;
      return {n,lanes:D.lanes,ft:!!D.ft,share:+((with_-without)/Math.max(1e-9,with_)).toFixed(3)}});
    ok('departures: each open search table has a searcher on wages',w.n===Math.min(8,w.lanes+(w.ft?1:0))&&w.share>0.02&&!errs.length,JSON.stringify(w)+(errs.length?' '+errs[0]:''));
    await ctx.close()}
}
