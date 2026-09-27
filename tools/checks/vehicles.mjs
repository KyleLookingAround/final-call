// Vehicles working each stand's turnaround (src/game/55-vehicles.js, docs/specs/real-airport.md): vehicleWork(i) reads
// only the stand's own state, so it's a turnaround (docked, or easing back off the stand) exactly when the stand says
// so, and never at an empty stand or one whose plane is still on its way in.
export default async function({open,ok,saveText,newest}){
  const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});
  const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;
    R.sim=true;for(let i=0;i<600;i++)S.update(0.1);R.sim=false; // an hour in, so every stand is busy (scene.mjs)
    const DOCKED=new Set(['deplaning','turnaround','boarding','closing']);
    const built=S.SIDX.filter(i=>G.stands[i].built&&S.STAND_KIND[i]!=='remote');
    const rows=built.map(i=>{const St=R.st[i],w=S.vehicleWork(i),want=!!St.out||(!!St.F&&DOCKED.has(St.F.plane.state));
      return {want,got:!!w,pushbackOk:!!(w&&w.pushback)===!!St.out}});
    const i=built[0],St=R.st[i],keepF=St.F,keepOut=St.out,keepSt=keepF&&keepF.plane.state;
    St.F=null;St.out=null;const empty=S.vehicleWork(i); // an empty stand is never a turnaround
    let approaching=null;
    if(keepF){St.F=keepF;keepF.plane.state='wait';approaching=S.vehicleWork(i);keepF.plane.state=keepSt} // nor one still arriving
    St.F=keepF;St.out=keepOut;
    return {matched:rows.every(r=>r.want===r.got&&r.pushbackOk),n:rows.length,empty,approaching};
  });
  ok('vehicles: only at a stand with a turnaround, matching whether it is docked or easing back',
    r.matched&&r.n>0&&r.empty===null&&r.approaching===null,JSON.stringify(r));
  if(errs.length)ok('vehicles: no page errors',false,errs[0]);
  await ctx.close();
}
