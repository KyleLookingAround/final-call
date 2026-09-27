// Arrivals (docs/specs/terminal.md): passengers off domestic flights walk straight past immigration and everyone else goes
// through it; e-gates take only e-gate passports; about 1 in 40 is checked at customs; everyone who lands ends up out, at a
// stop or the station, or at the hotel; and nobody arriving walks into a departures hall.
export default async function({open,ok,saveText}){
  const {ctx,page,errs}=await open(undefined,saveText('v27-L9.json'),false,{still:true});
  const r=await page.evaluate(()=>{const S=__sim,R=S.R,G=S.G;R.sim=true;
    const all=new Set(),id=p=>p.room!=null&&S.ROOMS[p.room]?S.ROOMS[p.room].id:null,bad={egate:0,depHall:[],stuck:0};
    for(let k=0;k<60*10*8;k++){S.update(0.1);
      for(const E of R.egates)for(const q of [E&&E.p,E&&E.n])if(q&&!q.elig)bad.egate++;
      for(const p of R.pax){if(!p.inbound)continue;
        if(!all.has(p)){all.add(p);p._seen={};p._at=G.clock}
        if(!p._seen[p.state]){p._seen[p.state]=1;p._at=G.clock}
        const h=id(p);if(h==='ci'||h==='sec'||h==='mkt')bad.depHall.push(h+':'+p.state)}}
    let dom=0,domImm=0,intl=0,intlSkip=0,cusN=0,cusChk=0,done=0,wrongEnd=[];
    for(const p of all){
      const s=p._seen,imm=!!(s.arrQ||s.passport),landside=!!(s.toArr);if(!landside)continue; // transfers stay airside
      if(p.cus){cusN++;if(p.cus===2)cusChk++}
      if(!p.dead)continue;done++;
      if(S.isDomestic(p.A)){dom++;if(imm)domImm++}else{intl++;if(!imm)intlSkip++}
      const h=id(p);if(h!=='out'&&h!=='hot')wrongEnd.push(h+':'+p.state)}
    for(const p of R.pax)if(p.inbound&&p._at!=null&&G.clock-p._at>150&&p.state!=='sitting')bad.stuck++;
    R.sim=false;return {dom,domImm,intl,intlSkip,cusN,cusChk,done,wrongEnd:wrongEnd.slice(0,4),nWrong:wrongEnd.length,...bad,depHall:bad.depHall.slice(0,4),egates:G.lv.egates}});
  ok('arrivals: domestic passengers skip immigration and everyone else goes through it',r.dom>20&&!r.domImm&&r.intl>200&&!r.intlSkip,`${r.dom} domestic (${r.domImm} at passports), ${r.intl} international (${r.intlSkip} skipped)`);
  ok('arrivals: e-gates take only e-gate passports',r.egates>0&&!r.egate,`${r.egate} not eligible`);
  const rate=r.cusChk/Math.max(1,r.cusN);
  ok('arrivals: about 1 in 40 is checked at customs',r.cusN>500&&rate>1/60&&rate<1/28,`${r.cusChk} of ${r.cusN} (1 in ${Math.round(1/Math.max(rate,1e-9))})`);
  ok('arrivals: everyone who lands ends up out, at a stop or the station, or at the hotel',r.done>500&&!r.nWrong&&!r.stuck&&!errs.length,`${r.done} out, ${r.nWrong} elsewhere ${r.wrongEnd.join(' ')}, ${r.stuck} stuck${errs.length?' '+errs[0]:''}`);
  ok('arrivals: nobody arriving walks into a departures hall',!r.depHall.length,r.depHall.join(' '));
  await ctx.close();
}
