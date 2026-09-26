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

// what the checks and the bot can reach inside the game; add new functions here when a test needs them
const SIM='window.__sim={get G(){return G},set G(v){G=v},R,update,buyUpgrade,buyStand,buyPier,buyAircraft,buy,capOf,upCost,upLocked,UPG,AIRCRAFT,AC_ORDER,LEVELS,STAND,PIER,METHODS,SHOPS,canBuild,isBuilding,buildSlots,sellValue,serviceCost,dailyPax,levelChecks,upkeepRate,wageBill,loanCap,derived,loadFactor,advise,resetAll,DEFAULT,shopUpCost,standOpen,save,advise,checkGoals,standBuyable,upBuyable,builtCount,shopValue,seasonOf,dayOf,fitsGate,TRIP,regionTick,orderLine,lineQuote,closeLine,setTab,draftTap,startDraft,renderPanel,netGeom,buildDev,MODES,DEV,PLOTS,PLACES,NODES,EDGES,modeLocked,serves,lineCode,linesAt,SUGGEST,update,STN_UP,setView,regionPanel,updateEvents,pol,POLICIES,news,scheduleEvent,has,research,TECH,techState,buyPoint,curGoal,GOALS,checkLevel,openPlan,closePlan,renderPlan,CITY,CITIES,routeLF,cityMarket,cityWill,pickRoute,openRoute,rsOf,promoteRoute,ROUTE_FEE,TIERBASE,worldTap,setView,consultCost,computeTransitRecs,evalRegion,managersTick,transportRecs,routeRecs,lineTweaks,rivShare,rivKeep,rivalDay,buyRival,rivMix,rivalPanel,routesPanel,dayTick,routeCard,crewState,crewTarget,hireCrew,nightChecks,farDelay,checkStamps,chalDay,checkChal,recordsPanel,tourStep,startTour,tourNext,cloudPut,CL,cloudNote,rivBuyCost,rnd,seedRandom,SIDX,STAND_ORDER,SHOP_X,shopOpen,LAYOUTS,applyLayout,switchLayout,rebuildLayout,layoutTick,layoutPanel,STAND_KIND,STAND_X,get LAY(){return LAY},get W(){return W},UPDATES,openNews,layoutFaults,XF,standBox,get ROOMS(){return ROOMS},busMul,buyLounges,LOUNGES,finishBuild,recCands,recKey,applyRec,REC_PAY,upgradeStops,upTargets,nextNum,lineFreq,lineDown,evExtra,mgrStep,mgrHour,UPGRADE,airWorth};';

mkdirSync(join(root,'dist'),{recursive:true});
writeFileSync(join(root,'dist/index.html'),page(shell,game));
for(const f of readdirSync(pub))copyFileSync(join(pub,f),join(root,'dist',f));
mkdirSync(join(root,'build'),{recursive:true});
writeFileSync(join(root,'build/test.html'),page(shell,game.replace('/*SIM_HOOK*/',()=>SIM)));
console.log(`built dist/index.html (${Math.round(page(shell,game).length/1024)} KB) from ${parts.length} files, and build/test.html`);
