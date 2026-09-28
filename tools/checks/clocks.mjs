// The clocks (02-clocks.js, docs/SYSTEMS.md "Time"): over a seeded day and a bit, the hooks run in the same order and at the
// same cadence as they did on main before the tables (tools/checks/lib/clocks.json, recorded from main with a log call at
// each hook, and re-recorded with the hooks added since, such as dayRec), and every hook the order lists is registered once, from its system's own file.
import {readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const REC=join(dirname(fileURLToPath(import.meta.url)),'lib/clocks.json');
const MINS=25*60; // a day change and a 03:00 inside it, from the level 9 save's clock
// runs the level 9 save for MINS game minutes and returns each hook call as "minute id", in order. With the tables, a
// log call is wrapped round each hook; without them (main, recording) the page's own log calls fill window.__clk.
export async function hookLog(page){
  return page.evaluate(MINS=>{const S=__sim,R=S.R;R.sim=true;window.__clk=[];
    if(S.CLOCKS)for(const T of Object.values(S.CLOCKS))for(const h of T)if(!h.table){const f=h.fn;h.fn=(...a)=>{window.__clk.push(R.lastMin+' '+h.id);return f(...a)}}
    const end=S.G.clock+MINS;while(S.G.clock<end)S.update(0.1);R.sim=false;return window.__clk},MINS);
}
// the log as each minute's list of hooks (the distinct lists and how often each ran), each hook's cadence, and a hash of the lot
export function summarise(log){
  const mins=new Map();for(const l of log){const [m,id]=l.split(' ');if(!mins.has(m))mins.set(m,[]);mins.get(m).push(id)}
  const patterns={},seen={};
  for(const [m,ids] of mins){const p=ids.join(' ');patterns[p]=(patterns[p]||0)+1;for(const id of ids)(seen[id]||(seen[id]=[])).push(+m)}
  const gcd=(a,b)=>b?gcd(b,a%b):a,cadence={};
  for(const [id,ms] of Object.entries(seen)){const every=ms.slice(1).reduce((g,m,i)=>gcd(g,m-ms[i]),0)||1440;cadence[id]=`${ms.length}× every ${every} at ${ms[0]%every}`}
  let h=2166136261;for(const c of log.join('\n'))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;
  return {calls:log.length,minutes:mins.size,hash:h.toString(16),cadence,patterns};
}
export default async function({open,ok,saveText}){
  const {ctx,page,errs}=await open(undefined,saveText('v32-L9.json'),false,{still:true});
  const tables=await page.evaluate(()=>{const C=__sim.CLOCKS;if(!C)return null;
    return {order:__sim.CLOCK_ORDER,have:Object.fromEntries(Object.entries(C).map(([k,T])=>[k,T.map(h=>h.id)]))}});
  if(!tables){ok('clocks: the hook tables are there',false,'no __sim.CLOCKS');await ctx.close();return}
  const bad=Object.keys(tables.order).filter(k=>JSON.stringify(tables.order[k])!==JSON.stringify(tables.have[k]));
  ok('clocks: every hook the order lists is registered once, in that order',!bad.length,bad.map(k=>`${k}: ${tables.have[k].join(', ')}`).join('; ')||Object.values(tables.have).flat().length+' hooks');
  const now=summarise(await hookLog(page)),rec=JSON.parse(readFileSync(REC,'utf8'));
  const diff=[...new Set([...Object.keys(rec.cadence),...Object.keys(now.cadence)])].filter(id=>rec.cadence[id]!==now.cadence[id]).map(id=>`${id}: ${now.cadence[id]||'never'} (was ${rec.cadence[id]||'never'})`);
  ok('clocks: each hook runs as often as on main',!diff.length&&!errs.length,diff.join('; ')||errs[0]||`${now.calls} calls over ${now.minutes} minutes`);
  const pd=Object.keys(now.patterns).filter(p=>rec.patterns[p]!==now.patterns[p]);
  ok('clocks: the hooks run in the same order as on main',!pd.length&&now.hash===rec.hash,pd.length?'new order: '+pd[0]:now.hash===rec.hash?now.hash:`hash ${now.hash}, was ${rec.hash}`);
  await ctx.close();
}
