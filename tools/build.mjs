// Builds the single-file game from src/:
//   dist/index.html  - the page GitHub Pages publishes
//   build/test.html  - the same page with window.__sim exposed, for the checks and the bot
// Plain Node, no dependencies.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const shell=readFileSync(join(root,'src/shell.html'),'utf8');
const game=readFileSync(join(root,'src/game.js'),'utf8');

const fail=m=>{console.error('build: '+m);process.exit(1)};
if(!shell.includes('/*GAME*/'))fail('src/shell.html has lost its /*GAME*/ marker');
if(!game.includes('/*SIM_HOOK*/'))fail('src/game.js has lost its /*SIM_HOOK*/ marker');
if(/<\/script/i.test(game))fail('src/game.js must not contain a closing script tag');
// two top-level functions with one name silently replace each other
const names=[...game.matchAll(/^function ([A-Za-z0-9_$]+)/gm)].map(m=>m[1]);
const dup=[...new Set(names.filter((n,i)=>names.indexOf(n)!==i))];
if(dup.length)fail('duplicate top-level functions: '+dup.join(', '));

const head='<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n';
const page=js=>head+shell.replace('/*GAME*/',()=>js);

// what the checks and the bot can reach inside the game; add new functions here when a test needs them
const SIM='window.__sim={get G(){return G},set G(v){G=v},R,update,buyUpgrade,buyStand,buyPier,buyAircraft,buy,capOf,upCost,upLocked,UPG,AIRCRAFT,AC_ORDER,LEVELS,STAND,PIER,METHODS,SHOPS,canBuild,isBuilding,buildSlots,sellValue,serviceCost,dailyPax,levelChecks,upkeepRate,wageBill,loanCap,derived,loadFactor,advise,resetAll,DEFAULT,shopUpCost,standOpen,save,advise,checkGoals,standBuyable,upBuyable,builtCount,shopValue,seasonOf,dayOf,fitsGate,TRIP,regionTick,orderLine,lineQuote,closeLine,setTab,draftTap,startDraft,renderPanel,netGeom,buildDev,MODES,DEV,PLOTS,PLACES,NODES,EDGES,modeLocked,serves,lineCode,linesAt,SUGGEST,update,STN_UP,setView,regionPanel,updateEvents,pol,POLICIES,news,scheduleEvent,has,research,TECH,techState,buyPoint,curGoal,GOALS,checkLevel,openPlan,closePlan,renderPlan,CITY,CITIES,routeLF,cityMarket,cityWill,pickRoute,openRoute,rsOf,promoteRoute,ROUTE_FEE,TIERBASE,worldTap,setView,consultCost,computeTransitRecs,evalRegion,managersTick,transportRecs,routeRecs,lineTweaks,rivShare,rivKeep,rivalDay,buyRival,rivMix,rivalPanel,routesPanel,dayTick,routeCard,crewState,crewTarget,hireCrew,nightChecks,farDelay,checkStamps,chalDay,checkChal,recordsPanel,tourStep,startTour,tourNext,cloudPut,CL,cloudNote,rivBuyCost};';

mkdirSync(join(root,'dist'),{recursive:true});
writeFileSync(join(root,'dist/index.html'),page(game));
mkdirSync(join(root,'build'),{recursive:true});
writeFileSync(join(root,'build/test.html'),page(game.replace('/*SIM_HOOK*/',()=>SIM)));
console.log(`built dist/index.html (${Math.round(page(game).length/1024)} KB) and build/test.html`);
