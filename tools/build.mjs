// Builds the single-file game from src/:
//   dist/index.html  - the page GitHub Pages publishes
//   build/test.html  - the same page with window.__sim exposed, for the checks and the bot
// Plain Node, no dependencies.
import {copyFileSync,existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {Script} from 'node:vm';
import {root,shell as readShell,parts as readParts,joinGame,page,locate} from './sources.mjs';

const parts=readParts();
const fail=m=>{console.error('build: '+m);process.exit(1)};

// link previews: the address the page is published at (set by the Pages workflow, else package.json "homepage"),
// the icon inlined so the page stays one file, and the preview image's hash so chat apps refetch it when it changes
const pub=join(root,'src/public');
const site=(process.env.SITE_URL||JSON.parse(readFileSync(join(root,'package.json'),'utf8')).homepage||'').replace(/\/*$/,'/').replace(/^\/$/,'');
for(const m of readShell().matchAll(/%SITE%([\w.-]+)/g))if(!existsSync(join(pub,m[1])))fail(`src/shell.html links to ${m[1]}, which isn't in src/public (npm run preview makes it)`);
const shell=readShell().replaceAll('%SITE%',site)
  .replace('%ICON%','data:image/svg+xml,'+encodeURIComponent(readFileSync(join(pub,'icon.svg'),'utf8').trim()))
  .replace('%PREVIEW%',createHash('sha256').update(readFileSync(join(pub,'preview.jpg'))).digest('hex').slice(0,8));
const parse=(code,filename,where=l=>`${filename}:${l}`)=>{try{new Script(code,{filename})}catch(e){
  const l=+((e.stack||'').split('\n')[0].match(/:(\d+)$/)||[])[1];fail(`${e.message} at ${l?where(l):filename}`)}};
if(!shell.includes('/*GAME*/'))fail('src/shell.html has lost its /*GAME*/ marker');
if(!shell.includes('%BUILD_ID%'))fail('src/shell.html has lost its %BUILD_ID% marker');
for(const p of parts){
  if(!p.text.endsWith('\n'))fail(p.file+' must end with a newline');
  if(/<\/script/i.test(p.text))fail(p.file+' must not contain a closing script tag');
  parse(p.text,p.file); // each file is whole statements, so a slip is reported against the right file
  // runs must repeat from a seed: game state takes its randomness from rnd() (00-random.js)
  if(p.file!=='src/game/00-random.js')p.text.split('\n').forEach((l,i)=>{if(/Math\.random\(/.test(l)&&!/\/\/ cosmetic$/.test(l))
    fail(`${p.file}:${i+1} uses Math.random(); use rnd() for anything that can change the game, or end the line with // cosmetic if it only affects sound or drawing`)});
}
const game=joinGame(parts);
if(!game.includes('/*SIM_HOOK*/'))fail('src/game has lost its /*SIM_HOOK*/ marker');
parse(game,'src/game',l=>{const w=locate(parts,l);return w.file+':'+w.line}); // catches a top-level const or let declared twice across files
// two top-level functions with one name silently replace each other
const names=[];
for(const p of parts)for(const m of p.text.matchAll(/^function ([A-Za-z0-9_$]+)/gm))names.push([m[1],p.file]);
const dup=[...new Set(names.filter(([n],i)=>names.findIndex(([o])=>o===n)!==i).map(([n])=>n))];
if(dup.length)fail('duplicate top-level functions: '+dup.map(n=>`${n} in ${names.filter(([o])=>o===n).map(([,f])=>f).join(' and ')}`).join('; '));

// a top-level let must reach the checks through a getter (get X(){return X}): a plain entry is copied once when the page
// loads and never changes after
// the entries of a list, split at its top-level commas (strings and brackets kept whole)
const entries=src=>{const out=[];let d=0,q=null,cur='';for(let i=0;i<src.length;i++){const c=src[i];
  if(q){cur+=c;if(c==='\\'){cur+=src[++i];continue}if(c===q)q=null;continue}
  if(c==='"'||c==="'"||c==='`'){q=c;cur+=c;continue}
  if('([{'.includes(c))d++;else if(')]}'.includes(c))d--;
  if(c===','&&!d){out.push(cur.trim());cur=''}else cur+=c}
  if(cur.trim())out.push(cur.trim());return out};
const block=(text,at)=>{let d=0;for(let i=at;i<text.length;i++){if(text[i]==='{')d++;else if(text[i]==='}'&&!--d)return text.slice(at+1,i)}return ''};
const SIMX_ASSIGN=/Object\.assign\(\s*SIMX\s*,\s*\{/g;
const lets=new Set(),simxBad=[];
// every name a let declares at the start of a line or after a semicolon, up to the end of its statement (a let inside a
// function counts too, which only matters if something exposes a name it shares)
for(const p of parts)for(const m of p.text.matchAll(/(?:^|;[ \t]*)let ([^\n]+)/gm)){let st='',d=0;for(const c of m[1]){if('([{'.includes(c))d++;else if(')]}'.includes(c))d--;if(c===';'&&!d)break;st+=c}
  for(const e of entries(st)){const n=(e.match(/^([A-Za-z_$][\w$]*)/)||[])[1];if(n)lets.add(n)}}
const plain=e=>(e.match(/^([A-Za-z_$][\w$]*)$/)||e.match(/^[A-Za-z_$][\w$]*\s*:\s*([A-Za-z_$][\w$]*)$/)||[])[1];
for(const p of parts){
  for(const m of p.text.matchAll(SIMX_ASSIGN))for(const e of entries(block(p.text,m.index+m[0].length-1))){const n=plain(e);if(n&&lets.has(n))simxBad.push(`${n} (${p.file})`)}
  for(const m of p.text.matchAll(/\bSIMX\.[A-Za-z_$][\w$]*\s*=\s*([A-Za-z_$][\w$]*)\s*[;,\n]/g))if(lets.has(m[1]))simxBad.push(`${m[1]} (${p.file})`);
}

// what the checks and the bot can reach inside the game; add new functions here when a test needs them
const SIM='window.__sim={get G(){return G},set G(v){G=v},R,update,buyUpgrade,buyStand,buyPier,buyAircraft,buy,capOf,upCost,upLocked,UPG,AIRCRAFT,AC_ORDER,LEVELS,STAND,PIER,METHODS,SHOPS,canBuild,isBuilding,buildSlots,sellValue,serviceCost,dailyPax,levelChecks,upkeepRate,wageBill,loanCap,derived,loadFactor,advise,resetAll,DEFAULT,shopUpCost,standOpen,save,advise,checkGoals,standBuyable,upBuyable,builtCount,shopValue,seasonOf,dayOf,fitsGate,TRIP,regionTick,orderLine,lineQuote,closeLine,setTab,draftTap,startDraft,renderPanel,netGeom,buildDev,MODES,DEV,PLOTS,PLACES,NODES,EDGES,modeLocked,serves,lineCode,linesAt,SUGGEST,update,STN_UP,setView,regionPanel,updateEvents,pol,POLICIES,news,scheduleEvent,has,research,TECH,techState,buyPoint,curGoal,GOALS,checkLevel,openPlan,closePlan,renderPlan,CITY,CITIES,routeLF,cityMarket,cityWill,pickRoute,openRoute,rsOf,promoteRoute,ROUTE_FEE,TIERBASE,worldTap,setView,consultCost,computeTransitRecs,evalRegion,managersTick,transportRecs,routeRecs,lineTweaks,rivShare,rivKeep,rivalDay,buyRival,rivMix,rivalPanel,routesPanel,dayTick,routeCard,crewState,crewTarget,hireCrew,nightChecks,farDelay,checkStamps,chalDay,checkChal,recordsPanel,tourStep,startTour,tourNext,rivBuyCost,rnd,seedRandom,SIDX,STAND_ORDER,SHOP_X,shopOpen,LAYOUTS,applyLayout,switchLayout,rebuildLayout,layoutTick,layoutPanel,STAND_KIND,STAND_X,get LAY(){return LAY},get W(){return W},get AF_Y(){return AF_Y},UPDATES,openNews,layoutFaults,XF,standBox,get ROOMS(){return ROOMS},busMul,buyLounges,LOUNGES,finishBuild,recCands,recKey,applyRec,REC_PAY,upgradeStops,upTargets,nextNum,lineFreq,lineDown,evExtra,mgrStep,mgrHour,UPGRADE,airWorth,terminalFaults,TERM_ROOMS,hallId,BUILD_ID,updCheckNow,updTryShow,updApply,updChecking,feedbackRepo,toast,dropToast,tickToasts,renderTip,renderNews};Object.defineProperties(window.__sim,Object.getOwnPropertyDescriptors(SIMX));function simAssign(t,...o){for(const s of o)Object.defineProperties(t,Object.getOwnPropertyDescriptors(s));return t}';
for(const e of entries(block(SIM,SIM.indexOf('{'))))if(lets.has(plain(e)))simxBad.push(`${e} (the SIM list in tools/build.mjs)`);
if(simxBad.length)fail('the checks would read a copy of '+simxBad.join(', ')+': expose a top-level let with a getter, get X(){return X}');
// getters stay getters all the way: the parts add to SIMX with Object.assign(SIMX,{…}), which would read a getter once and
// store its value, so in the test page those calls keep each property as it was written (simAssign, declared in the hook)
const simGame=game.replace(SIMX_ASSIGN,'simAssign(SIMX,{').replace('/*SIM_HOOK*/',()=>SIM);

// the build id: a short hash of the built page, stamped into it (%BUILD_ID%, in the meta tag and in 37-update-check.js)
// and written to dist/version.json next to index.html, so a running page can tell it's grown stale
const built=page(shell,game);
const buildId=createHash('sha256').update(built).digest('hex').slice(0,10);
const withBuildId=s=>s.replaceAll('%BUILD_ID%',buildId);

mkdirSync(join(root,'dist'),{recursive:true});
writeFileSync(join(root,'dist/index.html'),withBuildId(built));
writeFileSync(join(root,'dist/version.json'),JSON.stringify({id:buildId})+'\n');
for(const f of readdirSync(pub))copyFileSync(join(pub,f),join(root,'dist',f));
mkdirSync(join(root,'build'),{recursive:true});
writeFileSync(join(root,'build/test.html'),withBuildId(page(shell,simGame)));
{const {build:graph}=await import('./graph.mjs');writeFileSync(join(root,'docs/graph.json'),JSON.stringify(graph(),null,1))} // the map sessions query (tools/graph.mjs)
console.log(`built dist/index.html (${Math.round(built.length/1024)} KB) from ${parts.length} files, build/test.html and docs/graph.json`);
