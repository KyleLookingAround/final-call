// A network you have to keep (31-routes.js, docs/specs/network-to-keep.md): on a level 5 airport, a route left unflown
// loses market each day and wins it back once flown enough; a partner flight picks the route you serve least; a route
// marked Keep is flown at least that often by your own planes; nothing of it before City Airport; and every save loads.
export default async function({open,ok,saveText,saves}){
  const {ctx,page,errs}=await open(undefined,saveText('v32-L5.json'),false,{still:true});
  const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;R.sim=true;const open=Object.keys(G.routes).filter(c=>S.CITY[c]);
    // the open route flown least, left alone for three days, then flown at what it wants for three
    const c=open.sort((a,b)=>S.serviceOf(a)/S.wantOf(a)-S.serviceOf(b)/S.wantOf(b))[0],rs=S.rsOf(c);
    const m0=S.cityMarket(c),k0=S.keepOf(c);rs.n=0;rs.pn=0;for(let d=0;d<3;d++)S.netDay();const k3=S.keepOf(c),m3=S.cityMarket(c);
    rs.n=S.wantOf(c);S.netDay();const k4=S.keepOf(c);
    // a partner picks the route served least
    const ac=S.AIRCRAFT[0],pd=S.partnerDest({tier:4}),least=open.filter(x=>S.serviceOf(x)/S.wantOf(x)<1).sort((a,b)=>S.serviceOf(a)/S.wantOf(a)-S.serviceOf(b)/S.wantOf(b))[0]||null;
    // Keep: the least-flown short-haul route, two a day, over a day of play
    const kc=open.filter(x=>S.CITY[x].tier===0&&x!==c).sort((a,b)=>S.serviceOf(a)-S.serviceOf(b))[0]||c,ks0=S.rsOf(kc).n;
    G.routes[kc].keep=2;const end=G.clock+1440;while(G.clock<end)S.update(0.1);const ks=S.rsOf(kc).n;
    // before City Airport, nothing moves
    const lv=G.level;G.level=2;const rs2=S.rsOf(c),kb=rs2.keep;rs2.n=0;S.netDay();const kAfter=rs2.keep;const pre=S.partnerDest({tier:4});G.level=lv;
    R.sim=false;return {c,m0,m3,k0,k3,k4,pd,least,kc,ks0,ks,kb,kAfter,pre}});
  ok('network: a route left unflown loses market each day',r.k3<r.k0-0.1&&r.m3<r.m0*0.95&&!errs.length,errs[0]||`${r.c}: kept ${r.k0.toFixed(2)} → ${r.k3.toFixed(2)}, market ${Math.round(r.m0)} → ${Math.round(r.m3)}`);
  ok('network: flown at what it wants, it wins travellers back',r.k4>r.k3,`${r.k3.toFixed(2)} → ${r.k4.toFixed(2)}`);
  ok('network: a partner flies the route you serve least',r.pd===r.least,`picked ${r.pd}, least served ${r.least}`);
  ok('network: a route marked Keep is flown at least that often',r.ks>=1.5,`${r.kc}: ${r.ks0.toFixed(1)} → ${r.ks.toFixed(1)} a day`);
  ok('network: nothing before City Airport',r.kAfter===r.kb&&r.pre===null,`keep ${r.kb} → ${r.kAfter}, partner ${r.pre}`);
  await ctx.close();
  // every save loads and plays two days (so a day change runs the network) without errors
  const bad=[];for(const f of saves.filter(f=>/L[3-9]/.test(f))){const {ctx,page,errs}=await open(undefined,saveText(f),false,{still:true});
    const e=await page.evaluate(()=>{const S=__sim;S.R.sim=true;try{const end=S.G.clock+2880;while(S.G.clock<end)S.update(0.2);return null}catch(e){return e.message}finally{S.R.sim=false}});
    if(e||errs.length)bad.push(f+': '+(e||errs[0]));await ctx.close()}
  ok('network: saves from every version load and play two days',!bad.length,bad.length?bad.slice(0,2).join('; '):'');
}
