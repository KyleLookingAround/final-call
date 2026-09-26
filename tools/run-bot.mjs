// Long-run balance check: a bot plays build/test.html headless for N game hours.
//   npm run bot -- 1150                      (about 3-4 minutes; progress on stderr)
//   npm run bot -- 1150 --seed 2             (another run of the dice; the default seed is 1)
//   npm run bot -- 300 '{"noBuyLow":true}'   (bot options, see tools/bot.js)
//   npm run bot -- 1150 '{"layouts":true}'   (also rebuilds into better layouts; the baselines are for never rebuilding)
// The same seed and the same code always give the same run, so a difference between two
// versions is the code's doing. Compare a few seeds before calling a balance change good.
// Prints one JSON line per 6 game hours, then LVLAT {level: hour reached}, STATE <fingerprint>, ERR [...], and a
// table against tools/baseline.json. Writes build/bot-<seed>.json (bot-<seed>-layouts.json when rebuilding), and
// saves reached at each level to build/saves/L<n>.json for checks and screenshots (not when rebuilding).
import {chromium} from 'playwright';
import {appendFileSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),flag=k=>{const i=args.indexOf(k);return i<0?null:args.splice(i,2)[1]};
const seed=+(flag('--seed')??1)>>>0,hours=+args[0]||48,opts=JSON.parse(args[1]||'{}'),tag=seed+(opts.layouts?'-layouts':'');
const exe=process.env.CHROMIUM_PATH;
const b=await chromium.launch(exe?{executablePath:exe}:{});
const ctx=await b.newContext({viewport:{width:1200,height:800}});
// seed the game before it boots, and stop the frame loop so only the bot moves the game on
await ctx.addInitScript(s=>{window.__seed=s;window.requestAnimationFrame=()=>0},seed);
const m=await ctx.newPage();
const errs=[];m.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join('|')));
await m.goto(pathToFileURL(join(root,'build/test.html')).href);await m.waitForTimeout(500);
await m.addScriptTag({path:join(root,'tools/bot.js')});
await m.evaluate(o=>{__sim.R.sim=true;__sim.R.speed=0;window.B=BOT(o)},opts);
const t0=Date.now();
for(let h=0;h<hours;h+=6){
  const r=await m.evaluate(()=>B.run(360,0.1));r.log.forEach(l=>console.log(JSON.stringify(l)));
  if(h%48===0)console.error('levels reached at hour',JSON.stringify(r.lvlAt),'after',((Date.now()-t0)/1000).toFixed(0)+'s');
  if(errs.length)break;
}
const fin=await m.evaluate(()=>B.run(1,0.1)),sv=await m.evaluate(()=>window.SAVES||{});
// a fingerprint of the whole saved state: two runs with the same seed and the same game give the same one
// savedAt is wall-clock time, not game state, so it's left out
const gJson=await m.evaluate(()=>JSON.stringify({...__sim.G,savedAt:0}));writeFileSync(join(root,`build/state-${tag}.json`),gJson);
const state=createHash('sha256').update(gJson).digest('hex').slice(0,16);
if(!opts.layouts){mkdirSync(join(root,'build/saves'),{recursive:true});for(const k in sv)writeFileSync(join(root,'build/saves/L'+k+'.json'),sv[k])}
console.log('SEED',seed);console.log('LVLAT',JSON.stringify(fin.lvlAt));console.log('STATE',state);console.log('ERR',JSON.stringify(errs.slice(0,5)));
await b.close();

// against the baseline: inside the range is ok, within the tolerance of it is near, beyond that is off
const base=JSON.parse(readFileSync(join(root,'tools/baseline.json'),'utf8'));
const rows=Object.entries(base.levels).map(([lv,[lo,hi]])=>{
  const h=fin.lvlAt[lv];
  if(h==null)return {lv,lo,hi,h:null,status:hours<hi?'not run long enough':'off'};
  const dev=h<lo?(lo-h)/lo:h>hi?(h-hi)/hi:0;
  return {lv,lo,hi,h,status:dev===0?'ok':dev<=base.tolerance?'near':'off',dev:Math.round(dev*100)};
});
const table=[`Bot, seed ${seed}, ${hours} game hours${opts.layouts?', rebuilding into better layouts':''}${errs.length?`, ${errs.length} error(s)`:', no errors'}`,'',
  '| Level | Reached at hour | Baseline | |','| --- | --- | --- | --- |',
  ...rows.map(r=>`| ${r.lv} | ${r.h??'—'} | ${r.lo}–${r.hi} | ${r.status}${r.dev?` (${r.dev}% outside)`:''} |`)].join('\n');
console.log('\n'+table);
mkdirSync(join(root,'build'),{recursive:true});
writeFileSync(join(root,`build/bot-${tag}.json`),JSON.stringify({seed,hours,lvlAt:fin.lvlAt,state,errs,rows},null,1));
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,table+'\n');
for(const r of rows)if(r.status==='off'&&process.env.GITHUB_ACTIONS)console.log(`::warning::Level ${r.lv} reached at hour ${r.h??'never'}, baseline ${r.lo}–${r.hi} (seed ${seed}${opts.layouts?', rebuilding':''})`);
process.exit(errs.length?1:0);
