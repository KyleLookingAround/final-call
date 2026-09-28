// Loading saves (22-save.js): every save in tools/saves loads to exactly the airport it did when its hash below was
// recorded, and every field of a new game has its default in FIELDS. Each save is loaded headless with the same seed;
// the hash is of JSON.stringify(G) with savedAt zeroed (wall-clock time) and G's own keys sorted, since the order of
// G's top-level keys is not game state (nothing walks them) while the order inside each field is.
// A new fixture fails until its line is added to GOLD: the check prints the hash to add.
import {createHash} from 'node:crypto';
const GOLD={ // recorded on main; the polish-first-minute PR added G.tip4x, which moved every hash below
  'v14-L0.json':'ef2c8be1d85fe9a0','v14-L2.json':'666f3d37bb499607','v14-L4.json':'41374c4b0bc3ef16','v18-L1.json':'252866b3ab5aedd6',
  'v18-L3.json':'e553943d6ba8e820','v18-L5.json':'708623344150761b','v18-L8.json':'bfe71f80845b55d6','v20-L5.json':'bc38d21557a3c60d',
  'v20-L8.json':'2bd9e401f0be90a8','v21-L1.json':'c363220becf1f1c6','v21-L3.json':'90961164cbd96ee0','v21-L5.json':'52abc9705143fb7f',
  'v21-L9.json':'89dd1fa16a678835','v26-L5.json':'2a7928965a140124','v26-L9.json':'9398595f611fcf6b','v27-L9.json':'243c5ff289d97140',
  'v28-L3.json':'bb239eec2d3c28eb','v28-L5.json':'15ffac63d002b9ea','v28-L9.json':'ae1803bca8312ae5','v29-L1.json':'563109cba274d73c',
  'v29-L3.json':'3c9cfa5beb3f4a43','v29-L5.json':'92c919290b3e6db1','v29-L9.json':'ec2d8aa03b308c96','v32-L1.json':'de4a6ebcf25c13c9',
  'v32-L3.json':'9ee694924c8efb4e','v32-L5.json':'61512f436558d66a','v32-L9.json':'b1528ee6d2d49480',
};
const hash=s=>createHash('sha256').update(s).digest('hex').slice(0,16);

export default async function({open,ok,saves,saveText}){
  const {ctx,page,errs}=await open(undefined,null,false,{still:true});
  const got={};
  for(const f of saves)got[f]=hash(await page.evaluate(t=>{const S=__sim;S.R.sim=true;S.seedRandom(1);S.resetAll(JSON.parse(t));S.R.sim=false;
    const G=S.G,o={};for(const k of Object.keys(G).sort())o[k]=k==='savedAt'?0:G[k];return JSON.stringify(o)},saveText(f)));
  const bad=saves.filter(f=>GOLD[f]&&got[f]!==GOLD[f]),added=saves.filter(f=>!GOLD[f]);
  ok('migrate: every save loads to the same airport as before',!bad.length&&!added.length,
    bad.length?`changed: ${bad.join(' ')}`:added.length?`no hash yet, add to GOLD: ${added.map(f=>`'${f}':'${got[f]}',`).join(' ')}`:`${saves.length} saves`);
  const miss=await page.evaluate(()=>{const S=__sim;if(!S.FIELDS)return ['(no FIELDS table)'];return Object.keys(S.DEFAULT()).filter(k=>!(k in S.FIELDS))});
  ok('migrate: every field of a new game has its default in FIELDS',!miss.length,miss.slice(0,6).join(' '));
  if(errs.length)ok('migrate: no page errors',false,errs[0]);
  await ctx.close();
}
