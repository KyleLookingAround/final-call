// Rebuilding twice (bug #78, src/game/39-layouts.js): switching layouts back to back with a busy airport never throws
// or loses anyone. A flight at a stand the new layout drops moves to a free built stand with everyone who belongs to it;
// with no stand free, the switch waits for those stands to empty, as a rebuild does.
const IDS=['classic','remote','stagger','curve','hall','sat','star','round','mid'];
// in the page: what's wrong right now (a flight or someone stranded past the layout's stands, a flight on the wrong index)
const HEALTH=`S.__bad=()=>{const n=S.SIDX.length,bad=[],AT=new Set(['gate','toGate','bridge','aisle','sitting','dAisle','dBridge']);
  S.R.st.forEach((T,i)=>{if(T.F&&i>=n)bad.push('flight left at stand '+i);if(T.F&&T.F.i!==i)bad.push('flight at '+i+' thinks it is at '+T.F.i)});
  for(const p of S.R.pax)if(AT.has(p.state)&&p.stand>=n)bad.push(p.state+' at stand '+p.stand);return bad}`;

export default async function({open,ok,saveText}){
  const save=saveText('v32-L9.json');
  // the issue's steps: Curved front has no stand free, so it waits; the Central hall opens at once
  {const {ctx,page,errs}=await open(undefined,save,false,{still:true});
    const r=await page.evaluate(h=>{const S=__sim;eval(h);S.switchLayout('stagger');S.G.pierB=true;S.SIDX.forEach(i=>{S.G.stands[i].built=true});
      S.R.sim=true;for(let i=0;i<480;i++)S.update(0.25);S.R.sim=false;
      const pax=S.R.pax.length,out={};
      try{out.curve=S.switchLayout('curve');out.next=S.G.layoutNext;out.hall=S.switchLayout('hall');out.layout=S.G.layout}catch(e){out.err=e.message}
      out.kept=S.R.pax.length===pax;out.bad=S.__bad();
      S.R.sim=true;for(let i=0;i<240;i++)S.update(0.25);S.R.sim=false;out.after=S.__bad();return out},HEALTH);
    ok('rebuild: the issue\'s steps (Staggered, Curved front, Central hall) run without errors',
      !r.err&&r.curve===false&&r.next==='curve'&&r.hall===true&&r.layout==='hall'&&r.kept&&!r.bad.length&&!r.after.length&&!errs.length,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    await ctx.close();}

  // a flight at a dropped stand moves to a free one, with everyone aboard, on its bridge, at its gate and still to come
  {const {ctx,page,errs}=await open(undefined,save,false,{still:true});
    const r=await page.evaluate(h=>{const S=__sim,G=S.G;eval(h);S.switchLayout('stagger');G.pierB=true;S.SIDX.forEach(i=>{G.stands[i].built=i<6||i>=8});
      S.R.sim=true;for(let i=0;i<480;i++)S.update(0.25);S.R.sim=false;
      const Fs=[8,9].map(i=>S.R.st[i].F).filter(Boolean),fl0=G.flown;G.stands[6].built=true;G.stands[7].built=true;
      const pax=S.R.pax.length,ok=S.switchLayout('curve');
      const at=Fs.map(F=>S.R.st.indexOf(S.R.st.find(T=>T.F===F))),own=Fs.map(F=>S.R.pax.filter(p=>p.F===F).every(p=>p.stand===F.i)&&F.manifest.every(p=>p.stand===F.i));
      const near=Fs.every(F=>S.R.pax.filter(p=>p.F===F&&(p.state==='sitting'||p.state==='aisle')).every(p=>{const T=S.XF[F.i];return Math.hypot(p.x-T.ox,p.y-T.oy)<700}));
      const bad=S.__bad(),kept=S.R.pax.length===pax;S.R.sim=true;for(let i=0;i<1440;i++)S.update(0.25);S.R.sim=false; // six hours: time for a late passenger
      return {n:Fs.length,ok,layout:G.layout,at,own,near,kept,bad,gone:Fs.every(F=>!S.R.st.some(T=>T.F===F)),flown:G.flown>fl0,after:S.__bad()}},HEALTH);
    ok('rebuild: a flight at a dropped stand moves to a free one with all its passengers, and leaves',
      r.n>0&&r.ok&&r.layout==='curve'&&r.at.every(j=>j===6||j===7)&&r.own.every(Boolean)&&r.near&&r.kept&&!r.bad.length&&r.gone&&r.flown&&!r.after.length&&!errs.length,
      JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    await ctx.close();}

  // every pair of layouts back to back, there and back again, with every stand busy but two kept free until the switch,
  // so some flights move and some switches wait
  const fails=[];let moved=0,waited=0,switches=0;
  for(const a of IDS){const {ctx,page,errs}=await open(undefined,save,false,{still:true});
    const r=await page.evaluate(([h,a,ids])=>{const S=__sim,G=S.G;eval(h);const out={fails:[],moved:0,waited:0,n:0};
      const busy=()=>{G.pierB=true;S.SIDX.forEach(i=>{G.stands[i].built=!(i===1||i===3)||!!S.R.st[i].F})},run=m=>{S.R.sim=true;for(let i=0;i<m*10;i++)S.update(0.1);S.R.sim=false};
      const sw=id=>{G.stands[1].built=G.stands[3].built=true;const pax=S.R.pax.length,from=S.R.st.map(T=>T.F);let res;
        try{res=S.switchLayout(id)}catch(e){out.fails.push(`${G.layout}→${id}: ${e.message}`);return}
        out.n++;if(res===false)out.waited++;else out.moved+=S.R.st.filter((T,i)=>T.F&&from[i]!==T.F).length;
        const bad=S.__bad();if(bad.length)out.fails.push(`${G.layout}→${id}: ${bad[0]}`);if(S.R.pax.length!==pax)out.fails.push(`${G.layout}→${id}: passengers lost`)};
      sw(a);busy();run(60);
      for(const b of ids){if(b===a)continue;sw(b);busy();run(15);sw(a);busy();run(15)}
      return out},[HEALTH,a,IDS]);
    fails.push(...r.fails,...errs.map(e=>`${a}: ${e}`));moved+=r.moved;waited+=r.waited;switches+=r.n;
    await ctx.close();}
  ok('rebuild: every pair of layouts switched back to back with a busy airport, without errors',!fails.length&&switches===IDS.length*(1+2*(IDS.length-1)),
    `${switches} switches, ${moved} flights moved stand, ${waited} waited`+(fails.length?' · '+fails.slice(0,3).join(' · '):''));
}
