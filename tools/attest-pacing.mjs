// The attester for level pacing (docs/computations/bot-pacing.md): reads the bot's receipts, build/bot-<seed>.json, and says
// whether each came from the sanctioned run and says what its table says (plain Node, no dependencies, no browser).
//   node tools/attest-pacing.mjs [seed ...]   default seeds 1 2 3; one ATTESTED or REFUSED line each, exit 1 if any is refused
// Provenance: the run kept the bot's default strategy and the game's own rules (no bot options, --rate-day or --pol), ran
// at least tools/baseline.json's hours, played the build/test.html here (its hash), and was judged on the baseline here
// (its hash). Fidelity: no errors, and the table it printed matches one worked out again here from the hours it reached
// each level, against tools/baseline.json. The maths is written out again on purpose rather than imported from
// tools/run-bot.mjs, so a mistake in one shows as a disagreement.
import {readFileSync,existsSync,appendFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execSync} from 'node:child_process';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const hash=p=>createHash('sha256').update(readFileSync(join(root,p))).digest('hex').slice(0,16);

// the rows a run's level hours give against a baseline: ok inside the range, near within the tolerance, off beyond
export function pacingRows(lvlAt,hours,base){
  return Object.entries(base.levels).map(([lv,[lo,hi]])=>{
    const h=lvlAt[lv];
    if(h==null)return {lv,lo,hi,h:null,status:hours<hi?'not run long enough':'off'};
    const out=h<lo?(lo-h)/lo:h>hi?(h-hi)/hi:0;
    return {lv,lo,hi,h,status:out===0?'ok':out<=base.tolerance?'near':'off',dev:Math.round(out*100)};
  });
}
const same=(a,b)=>JSON.stringify(a.map(r=>[r.lv,r.lo,r.hi,r.h,r.status,r.dev||0]))===JSON.stringify(b.map(r=>[r.lv,r.lo,r.hi,r.h,r.status,r.dev||0]));

// one receipt's verdict: {seed, ok, why[], line}
export function attest(seed,{receipt,base=JSON.parse(readFileSync(join(root,'tools/baseline.json'),'utf8')),buildHash,baseHash}={}){
  const why=[],file=`build/bot-${seed}.json`;
  if(!receipt){if(!existsSync(join(root,file)))return {seed,ok:false,why:[`no ${file}: run node tools/run-bot.mjs ${base.hours} --seed ${seed}`]};
    receipt=JSON.parse(readFileSync(join(root,file),'utf8'))}
  const r=receipt;
  buildHash??=existsSync(join(root,'build/test.html'))?hash('build/test.html'):null;baseHash??=hash('tools/baseline.json');
  // provenance
  if(r.seed!==+seed)why.push(`it's seed ${r.seed}'s receipt, not ${seed}'s`);
  if(!('opts' in r)||!('build' in r))why.push('it records neither its options nor its build: an older receipt, so run the bot again');
  else{
    const opts=Object.entries(r.opts||{}).filter(([,v])=>v);if(opts.length)why.push(`it ran with bot options ${JSON.stringify(Object.fromEntries(opts))}, not the default strategy`);
    if(r.rateDay!=null)why.push('it ran with --rate-day');if(r.pols!=null)why.push('it ran with --pol');
    if(!buildHash)why.push('there is no build/test.html here to compare its build with');
    else if(r.build!==buildHash)why.push(`it played another build (${r.build}, this one is ${buildHash})`);
    if(r.baseline!==baseHash)why.push(`it was judged on another tools/baseline.json (${r.baseline}, this one is ${baseHash})`);
  }
  if(!(r.hours>=base.hours))why.push(`it ran ${r.hours} game hours, short of the baseline's ${base.hours}`);
  // fidelity
  if(r.errs&&r.errs.length)why.push(`the game threw ${r.errs.length} error(s), first: ${String(r.errs[0]).slice(0,120)}`);
  const rows=pacingRows(r.lvlAt||{},r.hours,base);
  if(!Array.isArray(r.rows)||!same(rows,r.rows))why.push('its table doesn\'t match the one its level hours give against tools/baseline.json');
  const table=rows.map(x=>`L${x.lv} ${x.h??'—'} ${x.status}${x.dev?` (${x.dev}%)`:''}`).join(' · ');
  const at=`build ${r.build||'?'}${r.commit?', commit '+r.commit.slice(0,7):''}`;
  return {seed,ok:!why.length,why,rows,line:why.length?`REFUSED seed ${seed}: ${why.join('; ')}`:`ATTESTED seed ${seed}, ${r.hours} game hours (${at}): ${table}`};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const seeds=process.argv.slice(2).map(Number).filter(n=>n>0),list=seeds.length?seeds:[1,2,3];
  const out=list.map(s=>attest(s));
  let head=null;try{head=execSync('git rev-parse HEAD',{cwd:root,stdio:['ignore','pipe','ignore']}).toString().trim()}catch(e){}
  for(const v of out)console.log(v.line);
  const moved=out.map(v=>{try{return JSON.parse(readFileSync(join(root,`build/bot-${v.seed}.json`),'utf8')).commit}catch(e){return null}}).filter(c=>c&&head&&c!==head);
  if(moved.length)console.log(`(HEAD is ${head.slice(0,7)}: a receipt from another commit attests if its build is the same as this one)`);
  if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,'\n'+out.map(v=>`- ${v.line}`).join('\n')+'\n');
  process.exit(out.every(v=>v.ok)?0:1);
}
