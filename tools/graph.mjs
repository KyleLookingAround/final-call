// A map of the game for sessions finding their way around, built from the source every time (plain Node, no dependencies).
//   node tools/graph.mjs <name>     everything related to a system, file, function, hook, saved field or check group
//   node tools/graph.mjs --write    writes docs/graph.json (git-ignored; npm run build does this too)
//   node tools/graph.mjs --check    fails on broken doc links and docs/systems/ files that name no game files; warns when a
//                                   system's file changed on this branch but its notes didn't, and when a system's notes
//                                   name three or more functions that live in one file outside its own
// What it reads: src/game/*.js (top-level functions and names, the hooks each file registers, saved fields),
// tools/checks/*.mjs (each group and what it calls through window.__sim), and the docs' own link lines: docs/systems/
// (one file per system, and the game files it names), docs/decisions/, docs/specs/ (issue and PRs), and docs/lessons/
// (each "→" line's targets).
import {readFileSync,readdirSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execSync} from 'node:child_process';

const root=join(dirname(fileURLToPath(import.meta.url)),'..'),rd=p=>readFileSync(join(root,p),'utf8'),ls=d=>readdirSync(join(root,d)).sort();
const uniq=a=>[...new Set(a)].sort(),all=(s,re,k=1)=>[...s.matchAll(re)].map(m=>m[k]);

export function build(){
  const files={},defs={},src={};
  for(const f of ls('src/game').filter(f=>f.endsWith('.js'))){
    const s=rd('src/game/'+f);src[f]=s;
    const funcs=uniq([...all(s,/^function\s+(\w+)/gm),...all(s,/^(?:const|let)\s+(\w+)\s*=\s*(?:\([^)]*\)|\w+)\s*=>/gm)]);
    const names=uniq(all(s,/^(?:const|let)\s+(\w+)\s*=/gm).concat(all(s,/^(?:const|let)\s+\w+\s*=[^;]*?,\s*(\w+)\s*=/gm))).filter(n=>!funcs.includes(n));
    const hooks=uniq([...all(s,/\b((?:PAX_STEP|ARR_STEP|TERM_PANEL|TERM_FIELDS|SIMX)\.\w+)\s*=/g),...all(s,/\b(TERM_(?:CLICK|MINUTE|DAY|DRAW|SPAWN|EXIT))\.push\(/g),
      ...all(s,/\bUPG\.(\w+)\s*=/g).map(k=>'UPG.'+k)]);
    files[f]={funcs,names,hooks};for(const n of [...funcs,...names])(defs[n]||(defs[n]=[])).push(f);
  }
  // upgrades declared in the UPG table, and the file each belongs to
  const upg=all(src['01-constants.js'],/^\s{2}(\w+):\{tab:'/gm);files['01-constants.js'].hooks=uniq(files['01-constants.js'].hooks.concat(upg.map(k=>'UPG.'+k)));
  // saved fields: DEFAULT()'s top-level keys, G.set's, and TERM_FIELDS'
  const dm=src['03-state.js'].match(/const DEFAULT=\(\)=>\(\{([\s\S]*?)\}\);\n/),top=[];
  if(dm){let d=0,key='';for(const ch of dm[1]){if('{(['.includes(ch))d++;else if('})]'.includes(ch))d--;else if(d===0&&ch===','){key='';continue}if(d===0&&/[\w$]/.test(ch))key+=ch;else if(d===0&&ch===':'&&key){top.push(key);key='#'}}}
  const setKeys=all((src['03-state.js'].match(/set:\{([^}]*)\}/)||['',''])[1],/(\w+):/g);
  const termFields=Object.values(files).flatMap(x=>x.hooks).filter(h=>h.startsWith('TERM_FIELDS.')).map(h=>h.slice(12));
  const saved={};for(const k of uniq(top.filter(k=>k!=='#'))){saved['G.'+k]=Object.keys(src).filter(f=>new RegExp('\\bG\\.'+k+'\\b').test(src[f]))}
  for(const k of setKeys)saved['G.set.'+k]=Object.keys(src).filter(f=>new RegExp(`\\bG\\.set\\.${k}\\b|SET\\(\\)\\.${k}\\b|'${k}'`).test(src[f]));
  for(const k of termFields)saved['G.'+k]=Object.keys(src).filter(f=>new RegExp('\\bG\\.'+k+'\\b').test(src[f]));
  // check groups and what each calls through window.__sim
  const checks={};
  for(const f of ls('tools/checks').filter(f=>f.endsWith('.mjs'))){const s=rd('tools/checks/'+f);checks[f.slice(0,-4)]={file:'tools/checks/'+f,sim:uniq(all(s,/\bS\.(\w+)/g).concat(all(s,/__sim\.(\w+)/g)))}}
  // the docs' link lines
  const sys=systems(),decisions=ls('docs/decisions').filter(f=>f.startsWith('ADR')).map(f=>{const s=rd('docs/decisions/'+f);return {file:'docs/decisions/'+f,title:(s.match(/^# (.*)/m)||[])[1]||f,refs:refsIn(s.replace(/## Context[\s\S]*?(?=\n## )/,''))}});
  const specs=ls('docs/specs').filter(f=>f.endsWith('.md')&&f!=='TEMPLATE.md').map(f=>{const s=rd('docs/specs/'+f);return {file:'docs/specs/'+f,issue:(s.match(/Issue: #(\d+)/)||[])[1]||null,prs:uniq(all(s,/PRs?:? ([#\d, and]+)/g).flatMap(x=>all(x,/#(\d+)/g))),refs:refsIn(s)}});
  const lessons=ls('docs/lessons').filter(f=>f.endsWith('.md')).map(f=>{const s=rd('docs/lessons/'+f);
    return {file:'docs/lessons/'+f,title:(s.match(/^# (.*)/m)||[])[1]||f,to:uniq(s.split('\n').filter(l=>l.includes('→')).flatMap(l=>refsIn(l.slice(l.indexOf('→')))))}});
  return {files,defs,upg,saved,checks,systems:sys,decisions,specs,lessons};
}
// file and name references in a piece of docs: `12-drawing.js`, src/game/…, tools/…, docs/…, .claude/skills/<name>, and `feature` playbook mentions
function refsIn(s){
  s=s.replace(/`[^`]*\bNN-[^`]*`/g,''); // placeholders such as src/game/NN-name.js
  const r=[...all(s,/\b(\d\d-[\w-]+\.js)\b/g).map(f=>'src/game/'+f),...all(s,/\b((?:src|tools|docs|\.github)\/[\w./-]+\.(?:js|mjs|md|json|html|yml))\b/g,1),
    ...all(s,/`(\w+)` playbook/g).map(p=>'.claude/skills/'+p+'/SKILL.md'),...all(s,/\.claude\/skills\/(\w+)/g).map(p=>'.claude/skills/'+p+'/SKILL.md')];
  // "`42-terminal.js` to `47-hotel.js`": the files between
  for(const m of s.matchAll(/`(\d\d)-[\w-]+\.js` to `(\d\d)-[\w-]+\.js`/g)){const a=+m[1],b=+m[2];for(const f of ls('src/game'))if(+f.slice(0,2)>a&&+f.slice(0,2)<b)r.push('src/game/'+f)}
  return uniq(r);
}
// docs/systems/: each file is a system, named by its "# " line; its files are the game files its text names
function systems(){
  const out={};
  for(const f of ls('docs/systems').filter(f=>f.endsWith('.md'))){const s=rd('docs/systems/'+f),k=(s.match(/^# (.+)/m)||[])[1]||f;
    const par=(s.match(/^\*\*.+?\*\*\s*\(([^)]*)\)/m)||[])[1]||'',aside=refsIn(par.split(';').slice(1).join(';')),files=refsIn(s).filter(x=>x.startsWith('src/game/'));
    // the functions its text names, and its own files: all it names but those its first line only mentions after a ";" ("… stay in 03-state.js")
    out[k]={doc:'docs/systems/'+f,files,refs:refsIn(s),names:uniq(all(s,/`(\w+)(?:\([^`]*\))?`/g)),own:files.filter(x=>!aside.includes(x)||refsIn(par.split(';')[0]).includes(x))}}
  return out;
}
// everything related to a name, in a short list
export function query(g,q){
  const lo=q.toLowerCase(),out=[],add=(k,v)=>{v=[].concat(v).filter(Boolean);if(v.length)out.push(`${k}: ${uniq(v).join(', ')}`)};
  const file=Object.keys(g.files).find(f=>f===q||f.replace(/\.js$/,'')===q||f.slice(3).replace(/\.js$/,'')===lo);
  const sysName=Object.keys(g.systems).find(k=>k.toLowerCase()===lo)||Object.keys(g.systems).find(k=>k.toLowerCase().includes(lo));
  const src=f=>readFileSync(join(root,'src/game',f),'utf8'),users=n=>Object.keys(g.files).filter(f=>new RegExp('\\b'+n.replace('.','\\.')+'\\b').test(src(f)));
  const checksCalling=names=>Object.entries(g.checks).filter(([,c])=>c.sim.some(n=>names.includes(n))).map(([k])=>k);
  const docsFor=paths=>({sys:Object.entries(g.systems).filter(([,s])=>s.files.some(f=>paths.includes(f))).map(([k])=>k),
    dec:g.decisions.filter(d=>d.refs.some(f=>paths.includes(f))).map(d=>d.file),les:g.lessons.filter(l=>l.to.some(f=>paths.includes(f))).map(l=>l.title),spec:g.specs.filter(s=>s.refs.some(f=>paths.includes(f))).map(s=>s.file)});
  const sysExact=Object.keys(g.systems).find(k=>k.toLowerCase()===lo);
  if(file&&!sysExact){const F=g.files[file],p='src/game/'+file,d=docsFor([p]);out.push(`file src/game/${file}`);add('functions',F.funcs);add('hooks',F.hooks);
    add('saved fields',Object.entries(g.saved).filter(([,fs])=>fs.includes(file)).map(([k])=>k));add('checks',checksCalling(F.funcs.concat(F.hooks.filter(h=>h.startsWith('SIMX.')).map(h=>h.slice(5)))));
    add('systems',d.sys);add('specs',d.spec);add('decisions',d.dec);add('lessons',d.les);return out}
  if(sysName){const S=g.systems[sysName],d=docsFor(S.files);out.push(`system "${sysName}" (${S.doc})`);add('files',S.files.map(f=>f.slice(9)));
    add('hooks',S.files.flatMap(f=>(g.files[f.slice(9)]||{hooks:[]}).hooks).filter(h=>!h.startsWith('UPG.')));add('saved fields',Object.entries(g.saved).filter(([,fs])=>fs.some(f=>S.files.includes('src/game/'+f))).map(([k])=>k).slice(0,40));
    add('checks',checksCalling(S.files.flatMap(f=>(g.files[f.slice(9)]||{funcs:[]}).funcs)));add('specs',d.spec);add('decisions',d.dec);add('lessons',d.les);return out}
  if(g.checks[q]){const c=g.checks[q];out.push(`check group ${q} (${c.file})`);add('calls',c.sim);add('defined in',c.sim.flatMap(n=>g.defs[n]||[]));return out}
  const sv=Object.keys(g.saved).filter(k=>k==='G.'+q||k===q||k==='G.set.'+q);
  if(sv.length){for(const k of sv){out.push(`saved field ${k}`);add('used in',g.saved[k])}return out}
  const hook=Object.entries(g.files).filter(([,F])=>F.hooks.some(h=>h===q||h.endsWith('.'+q)||h===q.replace(/\.push$/,''))).map(([f])=>f);
  if(g.defs[q]||hook.length){const at=(g.defs[q]||[]).concat(hook);out.push(`${g.defs[q]?'name':'hook'} ${q}`);add(g.defs[q]?'defined in':'registered by',at);add('used in',users(q).filter(f=>!at.includes(f)));
    add('checks',checksCalling([q]));const d=docsFor(at.map(f=>'src/game/'+f));add('systems',d.sys);add('decisions',d.dec);return out}
  // anything else: names and files that contain it
  add('names like it',Object.keys(g.defs).filter(n=>n.toLowerCase().includes(lo)).slice(0,20));add('systems like it',Object.keys(g.systems).filter(k=>k.toLowerCase().includes(lo)));
  add('files like it',Object.keys(g.files).filter(f=>f.includes(lo)));return out.length?out:[`nothing found for ${q}`];
}
// broken links, systems without files, and systems whose files changed without their section
export function check(g){
  const errs=[],warns=[],exists=p=>existsSync(join(root,p));
  for(const [k,S] of Object.entries(g.systems)){if(!S.files.length)errs.push(`${S.doc}: "${k}" names no game files`);for(const f of S.refs)if(!exists(f))errs.push(`${S.doc} links to ${f}, which doesn't exist`)}
  for(const d of g.decisions)for(const f of d.refs)if(!exists(f))errs.push(`${d.file} links to ${f}, which doesn't exist`);
  for(const s of g.specs)for(const f of s.refs)if(!exists(f)&&!/\/(new|parts?)\b/.test(f))errs.push(`${s.file} links to ${f}, which doesn't exist`);
  for(const l of g.lessons)for(const f of l.to)if(!exists(f))errs.push(`${l.file} points at ${f}, which doesn't exist`);
  let changed=[];try{const base=execSync('git merge-base HEAD origin/main',{cwd:root,stdio:['ignore','pipe','ignore']}).toString().trim();changed=execSync(`git diff --name-only ${base}`,{cwd:root}).toString().split('\n').filter(Boolean)}catch(e){}
  if(changed.length)for(const [k,S] of Object.entries(g.systems)){const hit=S.files.filter(f=>changed.includes(f));if(hit.length&&!changed.includes(S.doc))warns.push(`${hit.join(', ')} changed but ${S.doc} ("${k}") didn't: is it still true?`)}
  // a system's notes that name three or more functions living in one file outside its own: they belong with the system, or the file with the section
  for(const [k,S] of Object.entries(g.systems)){const by={};
    for(const n of S.names){const at=(g.defs[n]||[]).filter(f=>g.files[f].funcs.includes(n));if(at.length&&!at.some(f=>S.own.includes('src/game/'+f)))(by[at[0]]||(by[at[0]]=[])).push(n)}
    for(const [f,ns] of Object.entries(by))if(ns.length>=3)warns.push(`${S.doc} ("${k}") names ${ns.join(', ')}, which live in ${f}, outside its files`)}
  return {errs,warns};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const a=process.argv.slice(2),g=build();
  if(a[0]==='--write'){mkdirSync(join(root,'docs'),{recursive:true});writeFileSync(join(root,'docs/graph.json'),JSON.stringify(g,null,1));console.log('wrote docs/graph.json')}
  else if(a[0]==='--check'){const {errs,warns}=check(g);for(const w of warns)console.log('WARN  '+w);for(const e of errs)console.log('FAIL  '+e);console.log(errs.length?`${errs.length} broken`:'graph: links and sections all sound');process.exit(errs.length?1:0)}
  else if(a.length)for(const q of a)console.log(query(g,q).join('\n')+'\n');
  else console.log('node tools/graph.mjs <system | file | function | hook | saved field | check group>   (--write, --check)');
}
