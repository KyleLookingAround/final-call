// The docs as a knowledge bundle in the Open Knowledge Format, OKF v0.2 (docs/decisions/ADR-2026-10-03-docs-as-okf.md):
// every markdown file in docs/ opens with YAML frontmatter naming its type, and this reads it, checks it and lists it
// (plain Node, no dependencies).
//   node tools/okf.mjs                 the bundle by type: how many of each, and any problems
//   node tools/okf.mjs list [type]     each concept's path and description, all or one type ("System", "Decision", …)
//   node tools/okf.mjs --check         fails on a file without frontmatter, the wrong type for its folder, a missing or
//                                      malformed field, a path that doesn't exist, or a status its body contradicts
// The profile (the decision record has the reasons):
//   every file    type (its folder's, below); optional description, status (draft|stable|deprecated), tags, verified,
//                 stale_after, sources. Actors are human:<login> or process:<name>, never a tool's name.
//   docs/*.md and README.md files are guides (any type, with a description); TEMPLATE.md files carry their folder's type
//   and are left out of the index. docs/index.md is the bundle's index (joined by tools/join.mjs) and is reserved.
// The frontmatter is a small YAML subset: key: value, flow lists [a, b] and maps { a: x }, block lists of scalars, flow
// maps or maps, and block maps. It refuses the plain values other YAML readers turn into something other than text
// (times and dates, yes and no, numbers written other ways), so they must be quoted and read the same everywhere.
import {readFileSync,readdirSync,existsSync,statSync} from 'node:fs';
import {dirname,join,posix} from 'node:path';
import {fileURLToPath} from 'node:url';

export const root=join(dirname(fileURLToPath(import.meta.url)),'..');
export const BUNDLE='docs',OKF_VERSION='0.2';
// folder in docs/, its type, and the fields it needs beyond `type`
export const KINDS=[
  ['systems','System',['description']],
  ['decisions','Decision',['description','status']],
  ['specs','Spec',['description','status']],
  ['metrics','Metric',['description']],
  ['computations','Attested Computation',['description','runtime','executor','attester']],
  ['ideas','Ideas',['description']],
  ['lessons','Lesson',[]],
  ['briefs','Brief',[]],
  ['roadmap.d','Roadmap item',['section']],
];
export const STATUSES=['draft','stable','deprecated'],SECTIONS=['now','next','runbook','done'];
const ACTOR=/^(human|process):[A-Za-z0-9._@-]+$/,TOOLISH=/(^|[^a-z])(ai|llm|bot|agent|assistant|model|claude|anthropic|openai|gpt|gemini|copilot|llama|mistral)([^a-z]|$)/i,WHEN=/^\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d(\.\d+)?)?(Z|[+-]\d\d:\d\d)$/;

// ---- the YAML subset ----
class YamlError extends Error{constructor(line,msg){super(msg);this.line=line}}
const indentOf=l=>l.match(/^ */)[0].length;
// split a flow collection's inside at top-level commas, minding quotes and brackets
function splitFlow(s,line){
  const out=[];let depth=0,q=null,cur='';
  for(let i=0;i<s.length;i++){const c=s[i];
    if(q){cur+=c;if(c==='\\'&&q==='"'){cur+=s[++i]??'';continue}if(c===q)q=null;continue}
    if(c==='"'||c==="'"){q=c;cur+=c;continue}
    if('[{'.includes(c))depth++;else if(']}'.includes(c))depth--;
    if(c===','&&depth===0){out.push(cur.trim());cur='';continue}
    cur+=c;
  }
  if(q||depth)throw new YamlError(line,'unclosed quote or bracket');
  if(cur.trim())out.push(cur.trim());else if(out.length)throw new YamlError(line,'trailing comma');
  return out;
}
// a comment starts at " #" outside quotes
function stripComment(s){let q=null;for(let i=0;i<s.length;i++){const c=s[i];if(q){if(c==='\\'&&q==='"')i++;else if(c===q)q=null;continue}
  if(c==='"'||c==="'")q=c;else if(c==='#'&&(i===0||s[i-1]===' '))return s.slice(0,i).trimEnd()}return s}
function scalar(s,line,flow){
  s=s.trim();
  if(s.startsWith('"')){if(!/^"(?:[^"\\]|\\.)*"$/.test(s))throw new YamlError(line,`bad double-quoted string ${s}`);try{return JSON.parse(s)}catch(e){throw new YamlError(line,`bad escape in ${s}`)}}
  if(s.startsWith("'")){if(!/^'(?:[^']|'')*'$/.test(s))throw new YamlError(line,`bad single-quoted string ${s}`);return s.slice(1,-1).replace(/''/g,"'")}
  if(s===''||s==='~'||s==='null')return null;
  if(/^[-?:](\s|$)/.test(s)||/^[,\[\]{}#&*!|>'"%@`]/.test(s))throw new YamlError(line,`quote ${s}: it starts with a YAML indicator`);
  if(/:(\s|$)/.test(s)||/\s#/.test(s))throw new YamlError(line,`quote ${s}: it has ": " or " #" in it`);
  if(flow&&/[,\[\]{}]/.test(s))throw new YamlError(line,`quote ${s}: it has a comma or bracket in a flow collection`);
  if(s==='true'||s==='false')return s==='true';
  if(/^-?(0|[1-9]\d*)(\.\d+)?$/.test(s))return +s;
  if(/^\d{4}-\d\d?-\d\d?([Tt ]|$)/.test(s))throw new YamlError(line,`quote ${s}: other YAML readers take it for a date or time`);
  // words and numbers other YAML readers would take for a boolean or a number
  if(/^(yes|no|on|off|y|n|true|false|null)$/i.test(s)||/^[-+]?(0b[01_]+|0x[\da-f_]+|0o?[0-7_]+|[\d_]*\.?[\d_]+([e][-+]?\d+)?|\.(inf|nan)|[\d_]+(:[0-5]?\d)+(\.\d*)?)$/i.test(s))
    throw new YamlError(line,`quote ${s}: other YAML readers take it for a boolean or a number`);
  return s;
}
function value(s,line,flow=false){
  s=stripComment(s).trim();
  if(s.startsWith('[')){if(!s.endsWith(']'))throw new YamlError(line,`unclosed [ in ${s}`);return splitFlow(s.slice(1,-1),line).map(x=>value(x,line,true))}
  if(s.startsWith('{')){if(!s.endsWith('}'))throw new YamlError(line,`unclosed { in ${s}`);const o={};
    for(const part of splitFlow(s.slice(1,-1),line)){const m=part.match(/^([A-Za-z_][\w-]*):(?:\s+(.*))?$/);if(!m)throw new YamlError(line,`bad entry "${part}" in a flow map`);
      if(m[1] in o)throw new YamlError(line,`${m[1]} twice`);o[m[1]]=value(m[2]??'',line,true)}return o}
  return scalar(s,line,flow);
}
function block(lines,first){ // a mapping, from lines with no indent of their own
  const out={};let i=0;
  while(i<lines.length){
    const l=lines[i],at=first+i;
    if(!l.trim()||/^\s*#/.test(l)){i++;continue}
    if(indentOf(l))throw new YamlError(at,'unexpected indent');
    if(l.includes('\t'))throw new YamlError(at,'tabs aren\'t allowed');
    const m=l.match(/^([A-Za-z_][\w-]*):(?:\s+(.*))?$/);if(!m)throw new YamlError(at,`expected "key: value", found "${l}"`);
    if(m[1] in out)throw new YamlError(at,`${m[1]} twice`);
    const rest=m[2]==null?'':stripComment(m[2]);i++;
    if(rest.trim()){out[m[1]]=value(rest,at);continue}
    // the nested block: indented lines, comments and blank lines, and a list written at the key's own indent
    const sub=[];while(i<lines.length&&(!lines[i].trim()||indentOf(lines[i])>0||/^#/.test(lines[i])||/^-(\s|$)/.test(lines[i]))){sub.push(lines[i]);i++}
    out[m[1]]=nested(sub,at+1);
  }
  return out;
}
function nested(lines,first){
  const live=lines.map((l,k)=>[l,first+k]).filter(([l])=>l.trim()&&!/^\s*#/.test(l));
  if(!live.length)return null;
  const base=indentOf(live[0][0]);
  if(live.some(([l])=>indentOf(l)<base))throw new YamlError(live[0][1],'uneven indent');
  if(/^-(\s|$)/.test(live[0][0].trim())){
    const items=[];
    for(const [l,at] of live){const t=l.slice(base);
      if(indentOf(l)===base){const d=t.match(/^-(\s+|$)/);if(!d)throw new YamlError(at,'a list item must start with "- "');items.push([[t.slice(d[0].length)],at,base+d[0].length])}
      else{const pad=items.at(-1)[2];if(indentOf(l)<pad)throw new YamlError(at,'uneven indent in a list item');items.at(-1)[0].push(l.slice(pad))}}
    return items.map(([ls,at])=>{
      if(/^[A-Za-z_][\w-]*:(\s|$)/.test(ls[0]))return block(ls,at);
      if(ls.length>1)throw new YamlError(at,'a list item that runs on must be a map');
      return value(ls[0],at);
    });
  }
  return block(live.map(([l])=>l.slice(base)),live[0][1]);
}
// a file's frontmatter and body; data is null when there's no frontmatter, and error says why it didn't parse
export function parse(text){
  const lines=text.replace(/^\uFEFF/,'').split('\n');
  if(lines[0].replace(/\r$/,'')!=='---')return {data:null,body:text,error:'no frontmatter (the file must open with a "---" line)'};
  const end=lines.findIndex((l,i)=>i>0&&l.replace(/\r$/,'')==='---');
  if(end<0)return {data:null,body:text,error:'frontmatter has no closing "---" line'};
  const body=lines.slice(end+1).join('\n');
  try{return {data:block(lines.slice(1,end).map(l=>l.replace(/\r$/,'')),2)||{},body,lines:end+1}}
  catch(e){if(e instanceof YamlError)return {data:null,body,error:`frontmatter line ${e.line}: ${e.message}`};throw e}
}
export const body=text=>parse(text).body;
// writes a value back as the same subset: plain where that reads the same, quoted where it wouldn't
export function dumpScalar(v,flow=false){
  if(v==null)return 'null';if(typeof v==='boolean'||typeof v==='number')return String(v);
  const s=String(v);
  try{if(s&&s.trim()===s&&scalar(s,0,flow)===s)return s}catch(e){}
  return JSON.stringify(s);
}
const flowMap=o=>'{ '+Object.entries(o).map(([k,v])=>`${k}: ${Array.isArray(v)?'['+v.map(x=>dumpScalar(x,true)).join(', ')+']':dumpScalar(v,true)}`).join(', ')+' }';
export function dump(data){
  const out=['---'];
  for(const [k,v] of Object.entries(data)){
    if(v===undefined)continue;
    if(Array.isArray(v)){
      if(v.every(x=>x==null||typeof x!=='object'))out.push(`${k}: [${v.map(x=>dumpScalar(x,true)).join(', ')}]`);
      else{out.push(`${k}:`);for(const x of v){
        if(x&&typeof x==='object'&&Object.values(x).every(y=>y==null||typeof y!=='object'||Array.isArray(y))&&flowMap(x).length<=110)out.push('  - '+flowMap(x));
        else if(x&&typeof x==='object'){const ls=dump(x).split('\n').slice(1,-1);out.push('  - '+ls[0],...ls.slice(1).map(l=>'    '+l))}
        else out.push('  - '+dumpScalar(x))}}
    }
    else if(v&&typeof v==='object'){
      if(Object.values(v).every(y=>y==null||typeof y!=='object')&&flowMap(v).length<=110)out.push(`${k}: ${flowMap(v)}`);
      else{out.push(`${k}:`);for(const l of dump(v).split('\n').slice(1,-1))out.push('  '+l)}
    }
    else out.push(`${k}: ${dumpScalar(v)}`);
  }
  out.push('---');return out.join('\n');
}

// ---- the bundle ----
const rd=p=>readFileSync(join(root,p),'utf8');
function walk(dir){
  const out=[];if(!existsSync(join(root,dir)))return out;
  for(const f of readdirSync(join(root,dir)).sort()){const p=dir+'/'+f;
    if(statSync(join(root,p)).isDirectory())out.push(...walk(p));else if(f.endsWith('.md'))out.push(p)}
  return out;
}
// one docs file, from its path and text: {path, id, folder, kind, guide, template, data, body, title, error}
export function concept(p,text){
  const rel=p.slice(BUNDLE.length+1),folder=rel.includes('/')?rel.split('/')[0]:'',name=posix.basename(p);
  const {data,body,error}=parse(text),kind=KINDS.find(k=>k[0]===folder)||null;
  const title=((body.match(/^# (.+)$/m)||[])[1]||name.slice(0,-3)).trim();
  return {path:p,id:'/'+rel.slice(0,-3),folder,kind,guide:!kind||name==='README.md',template:name==='TEMPLATE.md',data,body,title,error};
}
// every markdown file in docs/ but the index
export const concepts=()=>walk(BUNDLE).filter(p=>p!==BUNDLE+'/index.md').map(p=>concept(p,rd(p)));
export const verifiedList=v=>v==null?[]:Array.isArray(v)?v:[v];
// unverified, machine-confirmed or human-reviewed (OKF §5.3)
export const trustTier=d=>{const v=verifiedList(d&&d.verified);return !v.length?'unverified':v.some(x=>x&&/^human:/.test(x.by))?'human-reviewed':'machine-confirmed'};
export const lastVerified=d=>verifiedList(d&&d.verified).map(x=>x&&x.at).filter(Boolean).sort().at(-1)||null;
const isUrl=s=>/^[a-z][a-z0-9+.-]*:\/\//i.test(s);
const looksLikePath=s=>typeof s==='string'&&!isUrl(s)&&!/\s/.test(s)&&/\.\w+$/.test(s);
// a path-valued field as a path from the repo's root: "/x" from the bundle's root, anything else from the file's folder
export const resolve=(from,p)=>p.startsWith('/')?posix.join(BUNDLE,p.slice(1)):posix.normalize(posix.join(posix.dirname(from),p));
// the path-valued fields of one concept (OKF §6.2)
export function paths(c){
  const d=c.data||{},out=[];
  const add=(field,p)=>{if(looksLikePath(p))out.push([field,p,resolve(c.path,p)])};
  add('resource',d.resource);add('computation',d.computation);
  if(d.executor)add('executor.resource',d.executor.resource);if(d.attester)add('attester.resource',d.attester.resource);
  for(const s of Array.isArray(d.sources)?d.sources:[])if(s&&typeof s==='object')add('sources[].resource',s.resource);
  return out;
}

// problems: errs fail the check, warns don't (a date passing can't turn a build red)
export function check(now=new Date().toISOString(),all=concepts()){
  const errs=[],warns=[],err=(c,m)=>errs.push(`${c.path}: ${m}`);
  for(const c of all){
    if(!c.data){err(c,c.error);continue}
    const d=c.data;
    if(typeof d.type!=='string'||!d.type.trim()){err(c,'needs a type');continue}
    if(c.kind&&!c.guide&&d.type!==c.kind[1])err(c,`type must be "${c.kind[1]}" in docs/${c.folder}/ (it's "${d.type}")`);
    const need=c.guide?['description']:c.template?[]:c.kind[2];
    for(const k of need)if(d[k]==null||d[k]==='')err(c,`needs ${k}`);
    if(d.description!=null&&(typeof d.description!=='string'||/\n/.test(d.description)))err(c,'description must be one line of text');
    if(d.status!=null&&!STATUSES.includes(d.status))err(c,`status must be ${STATUSES.join(', ')} (it's "${d.status}")`);
    if(d.tags!=null&&!(Array.isArray(d.tags)&&d.tags.every(t=>typeof t==='string')))err(c,'tags must be a list of words');
    for(const [k,v] of [['generated',d.generated],...verifiedList(d.verified).map(v=>['verified',v])]){
      if(v==null)continue;
      if(typeof v!=='object'||Array.isArray(v)){err(c,`${k} must be { by, at }`);continue}
      if(!ACTOR.test(String(v.by)))err(c,`${k} by "${v.by}" must be human:<login> or process:<name>`);
      else if(/^process:/.test(v.by)&&TOOLISH.test(v.by.slice(8)))err(c,`${k} by "${v.by}": name the process by what it does, not the tool that ran it`);
      if(v.at!=null&&!WHEN.test(String(v.at)))err(c,`${k} at "${v.at}" must be a date and time with its offset, such as 2026-10-03T09:00:00Z`);
      else if(k==='verified'&&v.at==null)err(c,'verified needs at');
    }
    if(d.stale_after!=null){if(!WHEN.test(String(d.stale_after)))err(c,`stale_after "${d.stale_after}" must be a date and time with its offset`);
      else if(Date.parse(d.stale_after)<=Date.parse(now))warns.push(`${c.path}: stale since ${d.stale_after}: check it against its sources and move stale_after on`)}
    // sources: each names its resource; footnotes in the body are keyed to their ids (OKF §5.1)
    if(d.sources!=null){
      const src=Array.isArray(d.sources)?d.sources:[];if(!Array.isArray(d.sources))err(c,'sources must be a list');
      for(const s of src)if(!s||typeof s!=='object'||!s.resource)err(c,'each of sources needs a resource');
    }
    // footnotes cite sources by id, outside code
    const ids=(Array.isArray(d.sources)?d.sources:[]).map(s=>s&&s.id).filter(Boolean),prose=c.body.replace(/```[\s\S]*?```/g,'').replace(/`[^`\n]*`/g,'');
    for(const m of prose.matchAll(/\[\^([\w-]+)\](?!:)/g))if(!ids.includes(m[1]))err(c,`footnote [^${m[1]}] matches no sources id`);
    for(const [field,p,at] of paths(c))if(!existsSync(join(root,at)))err(c,`${field} ${p} doesn't exist (${at})`);
    // per type
    if(d.type==='Roadmap item'&&!c.template&&!SECTIONS.includes(d.section))err(c,`section must be ${SECTIONS.join(', ')}`);
    if(c.folder==='roadmap.d'&&/^Section:/m.test(c.body))err(c,'"Section:" lives in the frontmatter now (section: now|next|runbook|done)');
    if(c.folder==='lessons'&&/^Theme:/m.test(c.body))err(c,'"Theme:" lives in the frontmatter now (theme: <theme>)');
    if(d.theme!=null&&typeof d.theme!=='string')err(c,'theme must be a word or two');
    if(d.type==='Attested Computation'&&!c.template){
      for(const p of Array.isArray(d.parameters)?d.parameters:[])if(!p||!p.name||!p.type)err(c,'each parameter needs a name and a type');
      if(d.executor&&!Array.isArray(d.executor.receipt))err(c,'executor needs a receipt: the fields a run must return');
      if(d.executor&&!d.executor.resource)err(c,'executor needs a resource');if(d.attester&&!d.attester.resource)err(c,'attester needs a resource');
      if(!d.computation&&!/^# Computation\s*$/m.test(c.body))err(c,'needs a computation file or a "# Computation" section');
    }
    if(d.type==='Decision'&&!c.template){
      const st=((c.body.match(/## Status\s*\n+([^\n]+)/)||[])[1]||'').trim(),tags=d.tags||[];
      if(/^superseded by/i.test(st)!==(d.status==='deprecated'))err(c,`status is ${d.status} but its Status section reads "${st.slice(0,40)}…": superseded is deprecated, anything else isn't`);
      if(/^superseded in part/i.test(st)!==tags.includes('superseded-in-part'))err(c,'tag superseded-in-part goes with a Status section that says "Superseded in part", and only then');
      if(/experiment/i.test(st)!==tags.includes('experiment'))err(c,'tag experiment goes with a Status section that names an experiment, and only then');
    }
    if(d.type==='Spec'&&!c.template){
      const st=(c.body.match(/Status:([^\n]*)/)||[])[1]||'',approved=/\b(Approved|Built)\b/.test(st);
      if(approved&&d.status!=='stable')err(c,`its Status line says Approved or Built, so status is stable (it's ${d.status})`);
      if(!approved&&d.status==='stable')err(c,'its Status line says neither Approved nor Built, so status is draft');
      if(approved&&trustTier(d)!=='human-reviewed')err(c,'an approved spec records the owner\'s approval: verified: { by: human:<login>, at: … }');
    }
  }
  return {errs,warns,count:all.length};
}

// the bundle's root index (OKF §8), joined into docs/index.md by tools/join.mjs: one section per folder
export function indexText(){
  const all=concepts().filter(c=>!c.template),line=c=>{const d=c.data||{},st=d.status&&d.status!=='stable'?` (${d.status})`:'';
    return `* [${c.title.replace(/[[\]]/g,'')}](${c.path.slice(BUNDLE.length+1)})${st}${d.description?' - '+d.description:''}`};
  const out=['# Guides','',...all.filter(c=>c.guide).map(line)];
  for(const [folder,type] of KINDS){const cs=all.filter(c=>c.folder===folder&&!c.guide);if(!cs.length)continue;
    out.push('',`# ${type}${/s$/.test(type)?'':'s'} (\`${folder}/\`)`,'',...cs.map(line))}
  return out.join('\n');
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const a=process.argv.slice(2);
  if(a[0]==='--check'){const {errs,warns,count}=check();for(const w of warns)console.log('WARN  '+w);for(const e of errs)console.log('FAIL  '+e);
    console.log(errs.length?`${errs.length} problem(s) in ${count} files`:`okf: ${count} files, all sound`);process.exit(errs.length?1:0)}
  else if(a[0]==='list'){const t=a.slice(1).join(' ').toLowerCase();
    for(const c of concepts())if(c.data&&(!t||String(c.data.type).toLowerCase()===t))console.log(`${c.path}  [${c.data.type}${c.data.status&&c.data.status!=='stable'?', '+c.data.status:''}, ${trustTier(c.data)}]${c.data.description?'\n    '+c.data.description:''}`)}
  else{const by={};for(const c of concepts()){const t=c.data?c.data.type:'(no frontmatter)';by[t]=(by[t]||0)+1}
    for(const [t,n] of Object.entries(by).sort((x,y)=>y[1]-x[1]))console.log(`${String(n).padStart(4)}  ${t}`);
    const {errs,warns}=check();for(const w of warns)console.log('WARN  '+w);for(const e of errs.slice(0,20))console.log('FAIL  '+e);if(errs.length>20)console.log(`… and ${errs.length-20} more`)}
}
