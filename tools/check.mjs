// Quick regression checks for build/test.html (about 15–25 minutes in a cloud session). Run with: npm run check, or npm run check -- <group>
// Each file in tools/checks/ is a group named after it: it exports a default async function that gets the helpers below
// and reports through ok(name, pass, info), and its opening comment says what it covers (docs/SYSTEMS.md lists them all,
// joined from those comments). Add a group by adding a file; nothing here lists them.
// Every page is seeded (window.__seed), so a failure repeats when you run it again. Checks written before their code are
// listed in tools/checks/pending.txt: they print PEND while they fail, and fail once they pass until their line comes out.
// Exit code 1 if anything fails. Screenshots of failures go to build/check/.
import {chromium} from 'playwright';
import {readFileSync,readdirSync,mkdirSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..'),url=pathToFileURL(join(root,'build/test.html')).href,out=join(root,'build/check');
mkdirSync(out,{recursive:true});
const only=process.argv[2];
const exe=process.env.CHROMIUM_PATH;
const browser=await chromium.launch(exe?{executablePath:exe}:{});
// pending checks (tools/checks/pending.txt): written before the code they test. One per line, a check's full name or a group
// and '*' ("floors: *"); '#' starts a comment. A failing pending check prints PEND and isn't counted as a failure; one that
// passes fails, so the part that makes it pass takes its line out and switches it on
const PENDING=readFileSync(join(root,'tools/checks/pending.txt'),'utf8').split('\n').map(l=>l.replace(/#.*/,'').trim()).filter(Boolean);
const groupOf=name=>name.split(':')[0].trim(),seenPend=new Set();
const pending=name=>{const hit=PENDING.find(l=>l===name||l===groupOf(name)+': *');if(hit)seenPend.add(hit);return !!hit};
const results=[];const ok=(name,pass,info)=>{
  if(pending(name)){if(pass){results.push([name,false]);console.log(`FAIL  ${name}  pending, but passes: switch it on (take its line out of tools/checks/pending.txt)${info?'  '+info:''}`)}
    else{results.push([name,true,'pend']);console.log(`PEND  ${name}${info?'  '+info:''}`)}return}
  results.push([name,pass]);console.log(`${pass?'PASS':'FAIL'}  ${name}${info?'  '+info:''}`)};
const ignorable=m=>/fonts\.(googleapis|gstatic)|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|net::/.test(m);

// seed: the game's random seed; still: no frame loop, so only the check moves the game on
// news: leave the What's new card as it opens (older saves open it on load); otherwise it's closed first
async function open(vp={width:1280,height:800},save=null,touch=false,{seed=1,still=false,news=false}={}){
  const ctx=await browser.newContext({viewport:vp,deviceScaleFactor:touch?2:1,hasTouch:touch,isMobile:touch,screen:{width:Math.min(vp.width,vp.height)<=520&&touch?Math.min(vp.width,vp.height):vp.width,height:Math.min(vp.width,vp.height)<=520&&touch?Math.max(vp.width,vp.height):vp.height}});
  await ctx.addInitScript(([seed,still])=>{window.__seed=seed;if(still)window.requestAnimationFrame=()=>0},[seed,still]);
  if(save)await ctx.addInitScript(s=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('final-call-save-v2',s);sessionStorage.setItem('seeded','1')}},save);
  const page=await ctx.newPage();const errs=[];
  page.on('pageerror',e=>errs.push(e.message));page.on('console',c=>{if(c.type()==='error'&&!ignorable(c.text()))errs.push(c.text())});
  await page.goto(url);await page.waitForTimeout(800);
  if(!news)await page.evaluate(()=>{const n=document.querySelector('#news');if(n&&!n.hidden)n.querySelector('[data-newsclose]').click()});
  await page.evaluate(()=>{__sim.R.toasts.length=0;document.querySelector('#toasts').innerHTML=''});
  return {ctx,page,errs};
}
const saves=readdirSync(join(root,'tools/saves')).filter(f=>f.endsWith('.json')).sort();
const saveText=f=>readFileSync(join(root,'tools/saves',f),'utf8');
const newest=saves.at(-1); // the latest version's highest level
const HIST_TOP=+(readFileSync(join(root,'docs/HISTORY.md'),'utf8').match(/^\| (\d+) \|/m)||[])[1]; // the newest version in docs/HISTORY.md

// the groups, one file each in tools/checks/, in file-name order
const groups=readdirSync(join(root,'tools/checks')).filter(f=>f.endsWith('.mjs')).sort().map(f=>f.slice(0,-4));
if(only&&!groups.includes(only)){console.log(`no check group "${only}"; the groups are ${groups.join(', ')}`);await browser.close();process.exit(1)}
// a group that throws (a pending group whose code doesn't exist yet) reports one line for the whole group
for(const g of groups)if(!only||only===g)
  try{await (await import(pathToFileURL(join(root,'tools/checks',g+'.mjs')).href)).default({open,ok,saveText,saves,newest,browser,root,out,url,HIST_TOP})}
  catch(e){const msg=String(e&&e.message||e).split('\n')[0].slice(0,200);ok(`${g}: *`,false,'the group stopped: '+msg)}
await browser.close();
// on a full run, every line in pending.txt must name a check that ran, so a renamed check can't sit there unnoticed
if(!only)for(const l of PENDING)if(!seenPend.has(l)){results.push([l,false]);console.log(`FAIL  ${l}  is listed in tools/checks/pending.txt, but no check has that name`)}
const pend=results.filter(r=>r[2]==='pend').length,failed=results.filter(r=>!r[1]).length;
console.log(`\n${results.length-failed-pend}/${results.length-pend} passed${pend?`, ${pend} pending`:''}`);
process.exit(failed?1:0);
