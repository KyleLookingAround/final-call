// The first level-up comes early (docs/specs/early-first-level.md): a fresh airport at 1× with the bot's default play
// (tools/bot.js) is a Local Airport by game hour 6 on seeds 1–3, and has had a departure go on time by then on at least two
// of them (#161: two floors reshuffled the first morning's random order). And the first morning goes well on any seed
// (#147): on each of seeds 1–12, at least one of the first three departures leaves on time.
import {join} from 'node:path';

export default async function({open,ok,root}){
  const runs=[],firsts=[];
  for(let seed=1;seed<=12;seed++){
    const {ctx,page,errs}=await open({width:1280,height:800},null,false,{seed,still:true});
    await page.addScriptTag({path:join(root,'tools/bot.js')});
    // the bot moves the game on headless, so the speed setting changes nothing: a game hour is a game hour at 1× or 4×
    const r=await page.evaluate(lv=>{const S=__sim;const B=BOT({});const out={};let at1=null;
      for(let h=0;h<6&&S.G.level<1&&lv;h++){Object.assign(out,B.run(60,0.1).lvlAt);S.checkLevel()}
      if(lv)at1={at:out[1]??null,level:S.G.level,name:S.LEVELS[S.G.level].name,req:S.LEVELS[1].req,flown:S.G.flown,ontime:S.G.ontime,flights:S.G.flights,rep:Math.round(S.G.rep)};
      // then on to the first three departures (by about 11:00 on day 1)
      for(let m=0;m<720&&S.G.history.length<3;m+=10)B.run(10,0.1);
      return {at1,first:[...S.G.history].sort((a,b)=>a.dep-b.dep).slice(0,3).map(h=>({tag:h.tag,std:h.std,late:h.late}))}},seed<=3);
    if(seed<=3){const a=r.at1;ok(`first-level: seed ${seed} is a Local Airport by game hour 6`,a.level>=1&&a.name==='Local Airport'&&a.at!=null&&a.at<=6&&!errs.length,JSON.stringify(a)+(errs.length?' '+errs[0]:''));runs.push(a.ontime)}
    firsts.push({seed,ok:r.first.length===3&&r.first.some(h=>h.late<=0)&&!errs.length,late:r.first.map(h=>h.late).join('/')+(errs.length?' '+errs[0]:'')});
    await ctx.close();
  }
  ok('first-level: a departure gone on time by then on at least two of seeds 1–3',runs.filter(n=>n>=1).length>=2,`on-time departures by the level-up: ${runs.join(', ')}`);
  ok('first-level: one of the first three departures on time on each of seeds 1–12',firsts.every(f=>f.ok),`minutes late, by seed: ${firsts.map(f=>f.seed+': '+f.late).join(', ')}`);
}
