// Loading saves (22-save.js): every save in tools/saves loads to exactly the airport it did when its hash below was
// recorded, and every field of a new game has its default in FIELDS. Each save is loaded headless with the same seed;
// the hash is of JSON.stringify(G) with savedAt zeroed (wall-clock time) and G's own keys sorted, since the order of
// G's top-level keys is not game state (nothing walks them) while the order inside each field is.
// A new fixture fails until its line is added to GOLD: the check prints the hash to add.
import {createHash} from 'node:crypto';
const GOLD={ // recorded on main before save migration became a table
  'v14-L0.json':'67c207d62aa51481','v14-L2.json':'cecde1ac09669661','v14-L4.json':'2608ebd96ffd4eff','v18-L1.json':'bd410367929bcc36',
  'v18-L3.json':'4bfc436b70c862fa','v18-L5.json':'445dfdb7bdcd33ef','v18-L8.json':'c880ddfe86091122','v20-L5.json':'250bac0aed639aee',
  'v20-L8.json':'6a2089081603da30','v21-L1.json':'51aee1b2e833d45c','v21-L3.json':'bf4f4f271e09a44d','v21-L5.json':'536c07f715d9b3bd',
  'v21-L9.json':'84de46b5a7e1b8e0','v26-L5.json':'2393aa1d1f634195','v26-L9.json':'74199fd3ef48ea35','v27-L9.json':'57d182e074838415',
  'v28-L3.json':'36e42374552180bc','v28-L5.json':'dcfce7c0386ff3ee','v28-L9.json':'69f52c24848b924c','v29-L1.json':'b0631c34f5e26052',
  'v29-L3.json':'4a8bb1848d459dc5','v29-L5.json':'c423b103de609f14','v29-L9.json':'8434f6ffb54930c3','v32-L1.json':'3001757033878320',
  'v32-L3.json':'6025665f69921d71','v32-L5.json':'7a8f5cdb8b02f564','v32-L9.json':'e4542b2808e2bfa6',
};
const hash=s=>createHash('sha256').update(s).digest('hex').slice(0,16);
// fields added to FIELDS since GOLD was recorded: left out of the hash, and every save must load them at their default
const ADDED=['famous'];

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
