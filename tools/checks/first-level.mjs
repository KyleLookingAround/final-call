// The first level-up comes early (docs/specs/early-first-level.md): a fresh airport at 1× with the bot's default play
// (tools/bot.js) is a Local Airport by game hour 6 on seeds 1–3, and has had a departure go on time by then on at least two
// of them (#161: two floors reshuffled the first morning's random order; first-morning punctuality is followed in #147).
import {join} from 'node:path';

export default async function({open,ok,root}){
  const runs=[];
  for(const seed of [1,2,3]){
    const {ctx,page,errs}=await open({width:1280,height:800},null,false,{seed,still:true});
    await page.addScriptTag({path:join(root,'tools/bot.js')});
    // the bot moves the game on headless, so the speed setting changes nothing: a game hour is a game hour at 1× or 4×
    const r=await page.evaluate(()=>{const S=__sim;const B=BOT({});const out={};
      for(let h=0;h<6&&S.G.level<1;h++){Object.assign(out,B.run(60,0.1).lvlAt);S.checkLevel()}
      return {at:out[1]??null,level:S.G.level,name:S.LEVELS[S.G.level].name,req:S.LEVELS[1].req,flown:S.G.flown,ontime:S.G.ontime,flights:S.G.flights,rep:Math.round(S.G.rep)}});
    ok(`first-level: seed ${seed} is a Local Airport by game hour 6`,r.level>=1&&r.name==='Local Airport'&&r.at!=null&&r.at<=6&&!errs.length,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    runs.push(r.ontime);await ctx.close();
  }
  ok('first-level: a departure gone on time by then on at least two of seeds 1–3',runs.filter(n=>n>=1).length>=2,`on-time departures by the level-up: ${runs.join(', ')}`);
}
