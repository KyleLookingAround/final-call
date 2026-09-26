// Long-run balance check: a bot plays build/test.html headless for N game hours.
//   npm run bot -- 1150            (about 3-4 minutes; progress on stderr)
//   npm run bot -- 300 '{"noBuyLow":true}'
// Prints one JSON line per 6 game hours, then LVLAT {level: hour reached} and ERR [...].
// Saves reached at each level go to build/saves/L<n>.json for checks and screenshots.
import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const hours=+process.argv[2]||48,opts=JSON.parse(process.argv[3]||'{}');
const exe=process.env.CHROMIUM_PATH;
const b=await chromium.launch(exe?{executablePath:exe}:{});
const m=await (await b.newContext({viewport:{width:1200,height:800}})).newPage();
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
mkdirSync(join(root,'build/saves'),{recursive:true});for(const k in sv)writeFileSync(join(root,'build/saves/L'+k+'.json'),sv[k]);
console.log('LVLAT',JSON.stringify(fin.lvlAt));console.log('ERR',JSON.stringify(errs.slice(0,5)));
await b.close();process.exit(errs.length?1:0);
