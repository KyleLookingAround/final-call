// Quick regression checks for build/test.html (about 1-2 minutes). Run with: npm run check, or npm run check -- <group>
// Each file in tools/checks/ is a group named after it: it exports a default async function that gets the helpers below
// and reports through ok(name, pass, info), and its opening comment says what it covers (docs/SYSTEMS.md lists them all,
// joined from those comments). Add a group by adding a file; nothing here lists them.
// Every page is seeded (window.__seed), so a failure repeats when you run it again.
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
const results=[];const ok=(name,pass,info)=>{results.push([name,pass]);console.log(`${pass?'PASS':'FAIL'}  ${name}${info?'  '+info:''}`)};
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
for(const g of groups)if(!only||only===g)
  await (await import(pathToFileURL(join(root,'tools/checks',g+'.mjs')).href)).default({open,ok,saveText,saves,newest,browser,root,out,url,HIST_TOP});
await browser.close();
const failed=results.filter(r=>!r[1]).length;
console.log(`\n${results.length-failed}/${results.length} passed`);
process.exit(failed?1:0);
