// The first level-up comes early (docs/specs/early-first-level.md): a fresh airport at 1× with the bot's default play
// (tools/bot.js) is a Local Airport by game hour 6 on seeds 1–3, and its first departure has gone on time by then.
import {join} from 'node:path';

export default async function({open,ok,root}){
  for(const seed of [1,2,3]){
    const {ctx,page,errs}=await open({width:1280,height:800},null,false,{seed,still:true});
    await page.addScriptTag({path:join(root,'tools/bot.js')});
    const r=await page.evaluate(()=>{const S=__sim;S.R.speed=1;const B=BOT({});const out={};
      for(let h=0;h<6&&S.G.level<1;h++)Object.assign(out,B.run(60,0.1).lvlAt);
      return {at:out[1]??null,level:S.G.level,flown:S.G.flown,ontime:S.G.ontime,flights:S.G.flights,rep:Math.round(S.G.rep)}});
    ok(`first-level: seed ${seed} is a Local Airport by game hour 6, with a departure gone on time`,r.level>=1&&r.at!=null&&r.at<=6&&r.ontime>=1&&!errs.length,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
}
