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

// what the checks and the bot reach inside the game (window.__sim, in build/test.html only): every top-level name the tools
// use as S.<name> or __sim.<name> (tools/, tools/checks/ and build/*.mjs), found here rather than kept in a list. A top-level let gets a getter and a setter, so it
// stays live; the terminal's parts can also add to SIMX in their own files.
const topLevel=new Map(); // name -> 'let' or 'const'/'function'/'class'
for(const p of parts)for(const line of p.text.split('\n')){
  const m=line.match(/^(?:async\s+)?(function\*?|const|let|class)\s+([A-Za-z_$][\w$]*)/);if(!m)continue;
  const kind=m[1]==='let'?'let':'const';topLevel.set(m[2],kind);
  if(m[1]!=='const'&&m[1]!=='let')continue;
  let d=0,k=m[0].length;for(;k<line.length;k++){const c=line[k]; // more names in the same declaration, outside brackets
    if('([{'.includes(c))d++;else if(')]}'.includes(c))d--;else if(c===';'&&d===0)break;else if(c===','&&d===0){const n=line.slice(k+1).match(/^\s*([A-Za-z_$][\w$]*)\s*=(?!=)/);if(n)topLevel.set(n[1],kind)}
    else if((c==='"'||c==="'"||c==='`')){const e=line.indexOf(c,k+1);if(e<0)break;k=e}}
}
// the tools, their check groups, and any throwaway scripts in build/ (git-ignored) a session writes to look at something
const scripts=d=>existsSync(join(root,d))?readdirSync(join(root,d)).filter(f=>/\.m?js$/.test(f)).map(f=>d+'/'+f):[];
const toolFiles=[...scripts('tools'),...scripts('tools/checks'),...scripts('build')];
const used=new Set();for(const f of toolFiles)for(const m of readFileSync(join(root,f),'utf8').matchAll(/\b(?:S|__sim)\.([A-Za-z_$][\w$]*)/g))used.add(m[1]);
const simNames=[...used].filter(n=>topLevel.has(n)).sort();
const SIM='window.__sim={'+simNames.map(n=>topLevel.get(n)==='let'?`get ${n}(){return ${n}},set ${n}(v){${n}=v}`:n).join(',')+'};Object.assign(window.__sim,SIMX);';

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
writeFileSync(join(root,'build/test.html'),withBuildId(page(shell,game.replace('/*SIM_HOOK*/',()=>SIM))));
{const {build:graph}=await import('./graph.mjs');writeFileSync(join(root,'docs/graph.json'),JSON.stringify(graph(),null,1))} // the map sessions query (tools/graph.mjs)
// the lists joined from one file per entry (tools/join.mjs): lessons, roadmap, decisions, systems, checks and files
{const {joinedFiles,rejoin}=await import('./join.mjs');for(const f of joinedFiles()){let s;try{s=rejoin(f)}catch(e){fail(e.message)}if(s!==readFileSync(join(root,f),'utf8'))writeFileSync(join(root,f),s)}}
console.log(`built dist/index.html (${Math.round(built.length/1024)} KB) from ${parts.length} files, build/test.html (${simNames.length} names in __sim), docs/graph.json and the joined lists`);
