// The market place (docs/specs/terminal.md): shops hold no more than their room, passengers go to their gate only once the
// board calls it, late calls mean more shopping and early ones less, passengers stand only when a lounge's seats are full,
// families use the play area, and with a walk-through duty free everyone out of security walks through it.
export default async function({open,ok,saveText}){
  const save=saveText('v26-L5.json');
  // a busy level 5 airport for eight hours, watched every step
  {const {ctx,page,errs}=await open(undefined,save,false,{still:true});
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;R.sim=true;
      let over=null,full=0,early=null,play=0,playOut=0,wait=0;
      for(let k=0;k<8*600;k++){S.update(0.1);
        const n={};for(const p of R.pax){
          if(p.state==='shop'||p.state==='toShop')n[p.shop]=(n[p.shop]||0)+1;
          else if(!p.inbound&&(p.state==='toGate'||p.state==='gate')&&!S.isCalled(p.F)&&!early)early=`${p.F.code}${p.F.no} ${p.state}`;
          else if(p.state==='mkt'){wait++;if(p.act==='play'){if(p.type==='fam')play++;const [a,b,c,d]=S.mktPlan().playR;if(p.sl>=0&&!(p.x>=a&&p.x<=c&&p.y>=b&&p.y<=d))playOut++}}}
        G.shops.forEach((s,j)=>{if(!s)return;const c=S.shopCap(j);if((n[j]||0)>c&&!over)over=`${S.SHOPS[s.type].name} ${n[j]}/${c}`;if((n[j]||0)===c)full++})}
      R.sim=false;return {over,full,early,play,playOut,wait}});
    ok('market: shops never hold more than their room, and fill up at busy times',!r.over&&r.full>0&&!errs.length,r.over||`full for ${r.full} shop-steps`+(errs.length?' '+errs[0]:''));
    ok('market: passengers go to their gate only once the board calls it',!r.early&&r.wait>0,r.early||`${r.wait} passenger-steps waiting in the market place`);
    ok('market: families use the play area',r.play>0&&!r.playOut,`${r.play} family passenger-steps at play, ${r.playOut} outside it`);
    await ctx.close()}
  // the same airport under each gate call policy: later calls, more shopping
  {const run=async gates=>{const {ctx,page}=await open(undefined,save,false,{still:true});
      const v=await page.evaluate(gates=>{const S=__sim,G=S.G,R=S.R;G.set.autoDuty=false;(G.pol||(G.pol={})).gates=gates;R.sim=true;const s0=G.revBy.shops||0;
        let stand=0,bad=null;for(let k=0;k<16*600;k++){S.update(0.1);if(k%10)continue;
          const st=[];for(const p of R.pax)if(p.state==='gate'&&p.spot<0)st[p.stand]=(st[p.stand]||0)+1;
          st.forEach((c,i)=>{if(!c)return;stand+=c;if(!bad&&R.st[i].spots.includes(null))bad=`${c} standing at stand ${i} with seats free`})}
        R.sim=false;return {shops:Math.round((G.revBy.shops||0)-s0),stand,bad}},gates);
      await ctx.close();return v};
    const [late,std,early]=await Promise.all([30,45,60].map(run));
    ok('market: late gate calls mean more shop spend, and early ones less',late.shops>std.shops&&std.shops>early.shops,`late ${late.shops}, standard ${std.shops}, early ${early.shops}`);
    ok('market: passengers stand only when a lounge’s seats are full',early.stand>0&&!early.bad&&!std.bad&&!late.bad,early.bad||std.bad||late.bad||`${early.stand} passenger-samples standing with early calls`)}
  // walk-through duty free: everyone out of security walks through it
  {const {ctx,page,errs}=await open(undefined,save,false,{still:true});
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;G.lv.wtdf=1;R.sim=true;const e0=G.dfEarned||0;let through=0,skipped=0;for(const p of R.pax)p._seen=1;
      for(let k=0;k<3*600;k++){S.update(0.1);for(const p of R.pax){if(p.inbound||p.xferred)continue;if(p.state==='df')p._df=1;else if(p.state==='mkt'||p.state==='toMkt'||p.state==='toShop'){if(p._seen)continue;p._seen=1;if(p._df)through++;else skipped++}}}
      R.sim=false;return {through,skipped,earned:Math.round((G.dfEarned||0)-e0)}});
    ok('market: with a walk-through duty free, everyone out of security walks through it',r.through>0&&!r.skipped&&r.earned>0&&!errs.length,`${r.through} through, ${r.skipped} not, ${r.earned} earned`+(errs.length?' '+errs[0]:''));
    await ctx.close()}
  // the advisor points at the fullest café, and at a hotel that turned guests away last night
  {const {ctx,page,errs}=await open(undefined,saveText('v28-L9.json'),false,{still:true});
    const t=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;
      const cafes=G.shops.map((s,j)=>s&&['coffee','cafe','bar','dining'].includes(S.SHOPS[s.type].id)?j:-1).filter(j=>j>=0);
      R.awayH=[];const quiet=S.cafeTip();cafes.forEach((j,k)=>R.awayH[j]=6+k*5);const busy=S.cafeTip(),want=cafes.at(-1);
      G.hotelBook.last={...(G.hotelBook.last||{}),away:4};const hq=S.hotelTip();G.hotelBook.last.away=14;const hb=S.hotelTip();
      return {cafes:cafes.length,quiet:!!quiet,busy:busy&&busy.go[1],want:`[data-shopup="${want}"]`,hotel:!!G.lv.hotel,hq:!!hq,hb:hb&&hb.text}});
    ok('advisor: points at the fullest café, and at a hotel that turned guests away',t.cafes>1&&!t.quiet&&t.busy===t.want&&t.hotel&&!t.hq&&/turned away 14/.test(t.hb||'')&&!errs.length,JSON.stringify(t)+(errs.length?' '+errs[0]:''));
    await ctx.close()}
  // a top-level coffee cart in a prime unit is pointed at a better shop on Sales › Shops, and a restaurant isn't; and the
  // terminal's labels (a hall's name, a unit to let) are drawn at least about 8 screen pixels high on a phone and a tablet
  {const {ctx,page,errs}=await open(undefined,saveText('v32-L9.json'),false,{still:true});
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;const kinds=G.shops.map((s,j)=>s&&[S.SHOPS[s.type].id,s.lvl,S.betterShop(j)&&S.betterShop(j).t.id]).filter(Boolean);
      R.sSub='shops';S.setTab('sales');const txt=document.querySelector('#panel').textContent;
      const px=[0.21,0.41,0.58].map(k=>{S.V.k=k;return +(S.labelSize('MARKET PLACE',8.5,536)*k).toFixed(1)});return {kinds,said:/is at its top level/.test(txt),px}});
    const cart=r.kinds.find(k=>k[0]==='coffee'&&k[1]>=4),duty=r.kinds.filter(k=>k[0]==='duty'||k[0]==='dining');
    ok('market: a top-level coffee cart is pointed at a better shop',!!cart&&!!cart[2]&&duty.every(k=>!k[2])&&r.said&&!errs.length,JSON.stringify(r.kinds)+(errs.length?' '+errs[0]:''));
    ok('market: the terminal\'s labels can be read on a phone and a tablet',r.px[1]>=8&&r.px[2]>=8.5,`hall names at ${r.px.join(', ')} screen px (320 phone, 390 phone, tablet, all at their starting zoom)`);
    await ctx.close()}
}
