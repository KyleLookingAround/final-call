// Loading saves (22-save.js): every save in tools/saves loads to exactly the airport it did when its hash below was
// recorded, and every field of a new game has its default in FIELDS. Each save is loaded headless with the same seed;
// the hash is of JSON.stringify(G) with savedAt zeroed (wall-clock time) and G's own keys sorted, since the order of
// G's top-level keys is not game state (nothing walks them) while the order inside each field is.
// A new fixture fails until its line is added to GOLD: the check prints the hash to add.
import {createHash} from 'node:crypto';
const GOLD={ // recorded on main, and again for every save fixture after 65-usage-counts.js added G.usageSent and G.set.usage
  'v14-L0.json':'b82d72ab3d95a1bf','v14-L2.json':'8ec9c9c47498fd15','v14-L4.json':'aed84b77b606b187','v18-L1.json':'3c38484244407876',
  'v18-L3.json':'0156f069c5ac8657','v18-L5.json':'ac878b5b766383fa','v18-L8.json':'1104ee94f0c6124a','v20-L5.json':'46feefff4a0f335b',
  'v20-L8.json':'85d49b56feca9b29','v21-L1.json':'f4239cce48dff1d7','v21-L3.json':'25fe0235a031b294','v21-L5.json':'c62aeb053cb829c9',
  'v21-L9.json':'ef82f4bc523722b3','v26-L5.json':'8a81bdf86f764609','v26-L9.json':'1c6f28e60b86e4f0','v27-L9.json':'6519f5b74d87acd2',
  'v28-L3.json':'4855692106241f8e','v28-L5.json':'81784467e362aa56','v28-L9.json':'7daf76978102c1da','v29-L1.json':'141a006d5d75d13c',
  'v29-L3.json':'95a0a82ddc44c4b4','v29-L5.json':'edf5cfb6001348f8','v29-L9.json':'105d8d38d8e94718','v32-L1.json':'b6b19b6cd98e3566',
  'v32-L3.json':'01fd53c62f63ae54','v32-L5.json':'02f08e7c2515cd7d','v32-L9.json':'840ce9a3af7e2a33',
};
const hash=s=>createHash('sha256').update(s).digest('hex').slice(0,16);
// fields added to FIELDS since GOLD was recorded: left out of the hash, and every save must load them at their default
const ADDED=['famous','tip4x'];

export default async function({open,ok,saves,saveText}){
  const {ctx,page,errs}=await open(undefined,null,false,{still:true});
  const got={};
  for(const f of saves)got[f]=hash(await page.evaluate(([t,ADDED])=>{const S=__sim;S.R.sim=true;S.seedRandom(1);S.resetAll(JSON.parse(t));S.R.sim=false;
    const G=S.G,o={};for(const k of Object.keys(G).sort())if(!ADDED.includes(k))o[k]=k==='savedAt'?0:G[k];
    const off=ADDED.filter(k=>JSON.stringify(G[k])!==JSON.stringify(S.FIELDS[k]()));return JSON.stringify(o)+(off.length?' not at their default: '+off.join(' '):'')},[saveText(f),ADDED]));
  const bad=saves.filter(f=>GOLD[f]&&got[f]!==GOLD[f]),added=saves.filter(f=>!GOLD[f]);
  ok('migrate: every save loads to the same airport as before',!bad.length&&!added.length,
    bad.length?`changed: ${bad.join(' ')}`:added.length?`no hash yet, add to GOLD: ${added.map(f=>`'${f}':'${got[f]}',`).join(' ')}`:`${saves.length} saves`);
  const miss=await page.evaluate(()=>{const S=__sim;if(!S.FIELDS)return ['(no FIELDS table)'];return Object.keys(S.DEFAULT()).filter(k=>!(k in S.FIELDS))});
  ok('migrate: every field of a new game has its default in FIELDS',!miss.length,miss.slice(0,6).join(' '));
  if(errs.length)ok('migrate: no page errors',false,errs[0]);
  await ctx.close();
}
