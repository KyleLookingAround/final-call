// A day's stats (DAY_STATS in 09-construction-levels-days.js, docs/SYSTEMS.md "Time"): over two seeded days at a level 9
// airport, the day report (G.lastDay) has the fields it had on main (tools/checks/lib/daystats.json, recorded there;
// DAYSTATS_RECORD=1 writes it again after a change that moves the dice on purpose, such as #101's rating), every
// field G.dstat gets is in DAY_STATS, and a new day starts with the fields DAY_STATS resets.
import {readFileSync,writeFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const REC=join(dirname(fileURLToPath(import.meta.url)),'lib/daystats.json');
// each day report's fields, and G.dstat's fields just after each new day and at the end
export async function dayFields(page){
  return page.evaluate(()=>{const S=__sim,R=S.R;R.sim=true;const out={reports:[],fresh:[],written:new Set()};let day=S.G.day;
    while(out.reports.length<3){S.update(0.1);const G=S.G;for(const k in G.dstat||{})out.written.add(k);
      if(G.day!==day){day=G.day;out.reports.push(Object.keys(G.lastDay||{}));out.fresh.push(Object.keys(G.dstat))}}
    R.sim=false;return {reports:out.reports,fresh:out.fresh,written:[...out.written].sort()}});
}
export default async function({open,ok,saveText}){
  const {ctx,page,errs}=await open(undefined,saveText('v32-L9.json'),false,{still:true});
  const reg=await page.evaluate(()=>__sim.DAY_STATS&&__sim.DAY_STATS.map(s=>({key:s.key,label:s.label,reset:'reset' in s})));
  const now=await dayFields(page);
  if(process.env.DAYSTATS_RECORD){writeFileSync(REC,JSON.stringify({reports:now.reports,fresh:now.fresh})+'\n');console.log('recorded',REC)}
  const rec=JSON.parse(readFileSync(REC,'utf8'));
  const same=JSON.stringify(now.reports)===JSON.stringify(rec.reports);
  ok('daystats: the day report has the fields it had on main',same&&!errs.length,same?now.reports.map(r=>r.length).join(', ')+' fields':`now ${JSON.stringify(now.reports)}, was ${JSON.stringify(rec.reports)}`+(errs[0]||''));
  if(!reg){ok('daystats: DAY_STATS is there',false,'no __sim.DAY_STATS');await ctx.close();return}
  const keys=reg.map(s=>s.key),loose=now.written.filter(k=>!keys.includes(k)),noLabel=reg.filter(s=>!s.label).map(s=>s.key);
  ok('daystats: every field a day counts is in DAY_STATS, with a label',!loose.length&&!noLabel.length,loose.length?'not listed: '+loose.join(', '):noLabel.length?'no label: '+noLabel.join(', '):now.written.join(', '));
  const reset=reg.filter(s=>s.reset).map(s=>s.key).join(),fresh=now.fresh.filter(f=>f.join()!==reset);
  ok('daystats: a new day starts with the fields DAY_STATS resets',!fresh.length&&JSON.stringify(now.fresh)===JSON.stringify(rec.fresh),fresh.length?`${fresh[0].join()} (resets ${reset})`:reset);
  await ctx.close();
}
