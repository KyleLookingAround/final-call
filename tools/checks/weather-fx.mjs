// Weather and events in one place (28-region-weather.js, docs/systems/weather.md): over a seeded day and a bit on the level 9
// save, the weather and event flags in R.fx (fog, snow, rain, storm, rush, sick, strike, fuel, the lines' faults, replacement
// buses, roadworks and leaves) come on and go off at the same minutes as they did on main before weather.set and weather.on
// (tools/checks/lib/weather-fx.json, recorded from main; WEATHER_FX_RECORD=1 writes it again).
import {readFileSync,writeFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const REC=join(dirname(fileURLToPath(import.meta.url)),'lib/weather-fx.json');
const MINS=25*60;
// runs the save for MINS game minutes and returns each change to the set of flags that are on, as "minute flag,flag,...".
// A keyed flag (a line's fault, its replacement buses) reads kind:id, the fault's reason and the roadworks' edge are kept too
export async function fxLog(page){
  return page.evaluate(MINS=>{const S=__sim,G=S.G,R=S.R;R.sim=true;const log=[];let last='';
    const flags=()=>{const fx=R.fx,o=[];
      for(const k of Object.keys(fx).sort()){const v=fx[k];
        if(typeof v==='number'){if(v>G.clock)o.push(k==='roadworks'?k+':'+fx.rwE:k)}
        else if(v&&typeof v==='object'&&k!=='why')for(const id of Object.keys(v).sort())if(v[id]>G.clock)o.push(k+':'+id+(k==='line'&&fx.why?':'+fx.why[id]:''))}
      return o.join(',')};
    const end=G.clock+MINS;while(G.clock<end){S.update(0.1);const f=flags();if(f!==last){log.push(Math.floor(G.clock)+' '+f);last=f}}
    R.sim=false;return log},MINS);
}
export function summarise(log){
  const on={};let prev=new Set();
  for(const l of log){const now=new Set(l.slice(l.indexOf(' ')+1).split(',').filter(Boolean));for(const f of now)if(!prev.has(f)){const k=f.split(':')[0];on[k]=(on[k]||0)+1}prev=now}
  let h=2166136261;for(const c of log.join('\n'))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;
  return {changes:log.length,hash:h.toString(16),on,first:log.slice(0,40)};
}
export default async function({open,ok,saveText}){
  const {ctx,page,errs}=await open(undefined,saveText('v32-L9.json'),false,{still:true});
  const log=await fxLog(page),now=summarise(log);
  if(process.env.WEATHER_FX_RECORD){writeFileSync(REC,JSON.stringify(now,null,1)+'\n');console.log('recorded',REC)}
  const rec=JSON.parse(readFileSync(REC,'utf8'));
  const kinds=[...new Set([...Object.keys(rec.on),...Object.keys(now.on)])].filter(k=>rec.on[k]!==now.on[k]).map(k=>`${k}: on ${now.on[k]||0}× (was ${rec.on[k]||0}×)`);
  ok('weather-fx: each flag comes on as often as on main',!kinds.length&&!errs.length,kinds.join('; ')||errs[0]||Object.entries(now.on).map(([k,n])=>`${k} ${n}×`).join(', '));
  const at=now.first.findIndex((l,i)=>l!==rec.first[i]);
  ok('weather-fx: the flags change at the same minutes as on main',now.hash===rec.hash,now.hash===rec.hash?`${now.changes} changes, ${now.hash}`:at>=0?`first differs: ${now.first[at]} (was ${rec.first[at]})`:`hash ${now.hash}, was ${rec.hash}`);
  await ctx.close();
}
