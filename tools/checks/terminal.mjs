// The terminal's halls (docs/specs/terminal.md): every layout's desks, lanes, passport desks, carousels and queues sit in
// their halls, and passengers really go through them: departing ones from the forecourt through check-in and security into
// the market place, arriving ones from the concourse through immigration, reclaim and customs, and out.
export default async function({open,ok,saveText}){
  const {ctx,page,errs}=await open(undefined,saveText('v26-L5.json'),false,{still:true});
  const r=await page.evaluate(()=>{const S=__sim,G=S.G;S.R.sim=true;
    const seen={};for(let k=0;k<90*10;k++){S.update(0.1);if(k%5)continue;for(const p of S.R.pax){const h=p.room!=null&&S.ROOMS[p.room]?S.ROOMS[p.room].id:null;if(h)(seen[h]||(seen[h]=new Set())).add(p.inbound?'arr':'dep')}}
    const faults=Object.keys(S.LAYOUTS).flatMap(id=>S.layoutFaults(id).filter(f=>/hall|queue|desk|lane|kiosk|carousel|e-gate|passengers|room (mkt|imm|sec|ci|rec|cus|arh|out)/.test(f)).map(f=>id+': '+f));
    S.R.sim=false;return {faults,seen:Object.fromEntries(Object.entries(seen).map(([k,v])=>[k,[...v].sort().join('+')]))}});
  ok('terminal: every layout’s desks, lanes, passport desks, carousels and queues sit in their halls',!r.faults.length,r.faults.slice(0,3).join('; '));
  const s=r.seen,dep=['out','ci','mkt'].every(h=>(s[h]||'').includes('dep')),arr=['imm','rec','arh','out'].every(h=>(s[h]||'').includes('arr')),apart=!(s.mkt||'').includes('arr')&&!(s.ci||'').includes('arr')&&!(s.imm||'').includes('dep')&&!(s.rec||'').includes('dep');
  ok('terminal: departing and arriving passengers each go through their own halls',dep&&arr&&apart&&!errs.length,JSON.stringify(s)+(errs.length?' '+errs[0]:''));
  await ctx.close();
}
