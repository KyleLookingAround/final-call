// Maps a pull request's changed files to the check groups worth running for them (plain Node, no dependencies).
//   node tools/touched.mjs [base]   prints "groups=<space-separated groups>" for $GITHUB_OUTPUT, or "groups="
//                                   (nothing) when every group should run
// Used by .github/workflows/checks.yml on a draft PR, so it only spends time on the check groups the PR's
// changed files touch, plus `brief` and `graph` (cheap) and `sim` (a floor). Only src/game/ files, the graph
// and brief scripts, tools/checks/*.mjs and the SAFE list below map to a narrower set; anything else
// (tools/build.mjs, src/shell.html, package*.json, a workflow file in .github/workflows/, tools/check.mjs…)
// falls back to every group, same as a change this script itself fails to read. Never exits non-zero: an
// unreadable diff falls back to every group too.
import {execSync} from 'node:child_process';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build,checksCalling} from './graph.mjs';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const FLOOR=['brief','graph','sim'];
// files whose change needs no check beyond the floor: docs, playbooks and templates, and the bot (which the
// Balance workflow covers, not npm run check)
const SAFE=/^(docs\/|\.claude\/|\.github\/(ISSUE_TEMPLATE|pull_request_template\.md)|tools\/bot\.js$|tools\/run-bot\.mjs$|tools\/baseline\.json$|README)/;

// the check groups worth running for a list of changed files, or null when one of them needs every group
export function groupsFor(files,g=build()){
  const groups=new Set(FLOOR);
  for(const f of files){
    if(f==='tools/graph.mjs'){groups.add('graph');continue}
    if(f==='tools/brief.mjs'||f==='tools/touched.mjs'){groups.add('brief');continue}
    if(f.startsWith('tools/checks/')&&f.endsWith('.mjs')){groups.add(f.slice('tools/checks/'.length,-4));continue}
    if(f.startsWith('src/game/')){
      const file=g.files[f.slice('src/game/'.length)];
      if(file)for(const c of checksCalling(g,file.funcs.concat(file.hooks.filter(h=>h.startsWith('SIMX.')).map(h=>h.slice(5)))))groups.add(c);
      continue;
    }
    if(SAFE.test(f))continue;
    return null; // can't confidently map this file to a narrower set: run every group
  }
  return [...groups].sort();
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const base=process.argv[2]||'origin/main';
  let files=null;
  try{files=execSync(`git diff --name-only ${base}...HEAD`,{cwd:root,stdio:['ignore','pipe','pipe']}).toString().split('\n').filter(Boolean)}
  catch(e){console.error('touched: git diff failed, falling back to every group: '+e.message)}
  let groups=null;
  try{groups=files&&files.length?groupsFor(files):null}
  catch(e){console.error('touched: mapping failed, falling back to every group: '+e.message)}
  console.log(groups?'groups='+groups.join(' '):'groups=');
}
