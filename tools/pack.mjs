// Builds a zip of the runbook (the project notes, the playbooks, briefs, checks, workflows, decisions and
// lessons) for the owner to take to another workspace. Nothing about the game itself is meant to be in here,
// though the brief that first asked for this pack (docs/briefs/runbook-pack.md) named docs/PLAN.md too.
//   node tools/pack.mjs      builds build/runbook-pack/ and build/runbook-pack.zip
// Plain Node, one shell-out to the system `zip` (present on the CI image and most dev machines); no npm deps.
// The file list lives here, as [path, note] pairs, so it doubles as the source for the pack's own README: add
// a fixed file or a whole directory here and both the zip and its map of contents pick it up.
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync,rmSync,statSync,copyFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const OUT=join(root,'build/runbook-pack');
const ZIP=join(root,'build/runbook-pack.zip');
const rd=p=>readFileSync(join(root,p),'utf8');
const exists=p=>existsSync(join(root,p));
const dirFiles=d=>exists(d)?readdirSync(join(root,d)).filter(f=>statSync(join(root,d,f)).isFile()).sort().map(f=>d+'/'+f):[];

// [path-or-dir, note, isDir]. A dir entry expands to every file in it at build time, so a new lesson, decision,
// workflow or issue template is picked up without editing this list; an optional example brief only makes the
// pack when it's actually on this branch (docs/briefs/coordinator-2026-09-28.md, launch-triage.md and
// phone-bugs.md are launch-day briefs that may or may not have landed on main yet).
const ENTRIES=[
  ['CLAUDE.md','The project notes: the short core every session reads first, with a table pointing at the rest.'],
  ['.claude/settings.json','Turns commit attribution off and points every session at .githooks on start.'],
  ['.claude/skills/balance/SKILL.md','Playbook: measuring and tuning the economy with the bot, against baselines.'],
  ['.claude/skills/coordinator/SKILL.md','Playbook: running several sessions on one feature - the sweep, starting and retiring sessions, the rate limit, the lessons tidy and watchdog Routines.'],
  ['.claude/skills/feature/SKILL.md','Playbook: one change, start to merged PR - issue, spec, build, checks, review, ship, learn.'],
  ['.claude/skills/release/SKILL.md','Playbook: cutting a release - claiming the version, folding the What’s new fragments, save fixtures.'],
  ['.claude/skills/steward/SKILL.md','Playbook: driving a PR to green and merged - CI failures, review comments, stacked branches, the look back.'],
  ['docs/briefs/TEMPLATE.md','The brief template every session or part starts from; docs/briefs/*.md are checked against it.'],
  ['tools/brief.mjs','The validator: fails a brief that’s missing a section, still has a <fill:...>, or has no cost estimate.'],
  ['docs/briefs/coordinator-2026-09-27e.md','Example: a coordinator’s handover brief, running several sessions overnight.'],
  ['docs/briefs/coordinator-2026-09-28.md','Example: a second coordinator handover, if this branch has it yet.'],
  ['docs/briefs/watchdog.md','Example: the watchdog Routine’s brief (also its prompt) - re-wakes sessions the usage limit stopped.'],
  ['docs/briefs/lessons-tidy.md','Example: the lessons-tidy Routine’s brief (also its prompt) - merges and groups the lessons.'],
  ['docs/briefs/launch-triage.md','Example: a triage brief for launch-day bugs, if this branch has it yet.'],
  ['docs/briefs/runbook-briefs.md','Example: the brief that started the runbook experiments themselves.'],
  ['docs/briefs/phone-bugs.md','Example: a small, scoped bug-fixing brief, if this branch has it yet.'],
  ['docs/briefs/release-32.md','Example: a release brief, scoped to exactly what the release playbook needs.'],
  ['docs/specs/TEMPLATE.md','The one-page spec template for anything a player would notice as new.'],
  ['docs/decisions','dir','Decision records (ADR-*.md) plus their generated index: rules a change must keep, and why.'],
  ['docs/LESSONS.md','The generated index of look-backs, joined from docs/lessons/ and grouped by theme.'],
  ['docs/lessons','dir','One look-back per merged PR (what it cost, what slowed it, what to change), plus the tidy’s own bookkeeping file.'],
  ['docs/ROADMAP.md','Now / Next / the runbook / Done / Ideas, joined from docs/roadmap.d/ (not included: game-specific items).'],
  ['docs/PLAN.md','The game’s own feature plan and status - kept because the brief that shaped this pack named it; otherwise game-specific.'],
  ['docs/SYSTEMS.md','How the checks, the build and the knowledge graph work, and the generated lists of systems, checks and files.'],
  ['.github/workflows','dir','Every CI workflow: checks, balance, catch-up, description, health, pages, parts.'],
  ['.github/pull_request_template.md','The PR description template every session fills in.'],
  ['.github/ISSUE_TEMPLATE','dir','Issue templates: Feature, Bug, Balance, and the template chooser config.'],
  ['.githooks/commit-msg','The hook that strips tool attribution from a commit message and refuses one that still has it.'],
  ['tools/join.mjs','Joins the one-file-per-entry folders (lessons, roadmap items, What’s new, decisions) into their lists.'],
  ['tools/graph.mjs','node tools/graph.mjs <name>: everything related to a system, file, function, hook, field or check.'],
  ['tools/okf.mjs','Reads and checks the frontmatter every docs file opens with (the Open Knowledge Format); join.mjs and graph.mjs use it.'],
  ['docs/index.md','The docs’ index, joined from every file’s frontmatter: what each one is, in a line.'],
  ['tools/touched.mjs','Maps a PR’s changed files to the check groups worth running, for cheaper checks on draft PRs.'],
  ['tools/health.mjs','Turns a weekly bot run into a drift verdict against the balance baselines, for an issue.'],
  ['tools/check.mjs','Runs every check group and reports pass/fail; each group is a file in tools/checks/.'],
  ['tools/sources.mjs','How the source files join into one script; used by the build and by tools/where.mjs.'],
  ['tools/where.mjs','Turns a line number from a build error back into its source file and line.'],
  ['tools/checks/brief.mjs','The check group that runs tools/brief.mjs over every file in docs/briefs/.'],
  ['tools/checks/rules.mjs','An example check group: the game’s rules, one assertion per rule, run against a seeded page.'],
  ['package.json','The scripts every check and build runs through (build, check, bot, preview, pack).'],
];

function resolve(){
  const out=[];
  for(const e of ENTRIES){
    if(e[1]==='dir'){for(const f of dirFiles(e[0]))out.push([f,e[2]]);continue}
    const [path,note]=e;
    if(exists(path))out.push([path,note]);
  }
  return out;
}

function copyPack(files){
  rmSync(OUT,{recursive:true,force:true});
  for(const [f] of files){
    const dest=join(OUT,f);
    mkdirSync(dirname(dest),{recursive:true});
    copyFileSync(join(root,f),dest);
  }
}

// docs/decisions/README.md and docs/lessons/.last-tidy aren't prose to read start to end; RUNBOOK-ALL keeps
// every .md file except those (still shipped as files) and skips code, workflow and hook files entirely.
const SECTIONS=[
  ['Overview',['README.md']],
  ['Project notes',['CLAUDE.md']],
  ['Playbooks',['.claude/skills/balance/SKILL.md','.claude/skills/coordinator/SKILL.md','.claude/skills/feature/SKILL.md','.claude/skills/release/SKILL.md','.claude/skills/steward/SKILL.md']],
  // 'briefs' and the other markers below pick their files from what actually made the pack (the `files` argument
  // to buildAll), never by re-walking the directory: docs/briefs/ and docs/decisions/ hold plenty of game-specific
  // or non-runbook files that ENTRIES/resolve() already left out.
  ['Templates and example briefs','briefs'],
  ['How the game and its checks are put together',['docs/SYSTEMS.md']],
  ['Decisions','decisions'],
  ['Roadmap',['docs/ROADMAP.md','docs/PLAN.md']],
  ['Lessons','lessons'],
];

function buildAll(readmeText,files){
  const packed=files.map(([f])=>f);
  const under=d=>packed.filter(f=>f.startsWith(d+'/'));
  const pick=list=>{
    if(list==='briefs')return ['docs/briefs/TEMPLATE.md',...under('docs/briefs').filter(f=>f!=='docs/briefs/TEMPLATE.md'),'docs/specs/TEMPLATE.md'];
    if(list==='decisions')return ['docs/decisions/README.md',...under('docs/decisions').filter(f=>f!=='docs/decisions/README.md')];
    if(list==='lessons')return ['docs/LESSONS.md',...under('docs/lessons').filter(f=>f.endsWith('.md'))];
    return list;
  };
  const parts=[];
  for(const [title,list] of SECTIONS){
    const secFiles=pick(list).filter(exists);
    if(!secFiles.length)continue;
    parts.push(`# ${title}`);
    for(const f of secFiles){
      const text=f==='README.md'?readmeText:rd(f);
      parts.push(`## \`${f}\`\n\n${text.trim()}`);
    }
  }
  return parts.join('\n\n---\n\n')+'\n';
}

function fileMap(files){
  const rows=[];
  const dirNotes=new Map(ENTRIES.filter(e=>e[1]==='dir').map(e=>[e[0],e[2]]));
  const dirs=[...dirNotes.keys()];
  const seenDir=new Set();
  for(const [f,note] of files){
    const d=dirs.find(dir=>f===dir||f.startsWith(dir+'/'));
    if(d){
      if(seenDir.has(d))continue;
      seenDir.add(d);
      const count=files.filter(([g])=>g===d||g.startsWith(d+'/')).length;
      rows.push(`| \`${d}/\` (${count} files) | ${dirNotes.get(d)} |`);
      continue;
    }
    rows.push(`| \`${f}\` | ${note} |`);
  }
  return rows.join('\n');
}

const README=files=>`# Final Call's runbook pack

This is not the game. It's how one person and several Claude Code sessions run Final Call's
development together: a loop from issue to merged PR, a coordinator that starts and sweeps other
sessions from written briefs, checks that fail on purpose until their code exists, and a habit of
writing everything down in one small file per entry so two sessions never fight over the same
lines. It was pulled from \`kylelookingaround/final-call\` to copy into another workspace and adapt.

## What the runbook is

**The loop.** Work starts from a GitHub issue. Anything a player would notice as new gets a one-page
spec, approved before building starts. Building happens on its own \`feature/<name>\` branch, proven
by checks, screenshots and (for anything touching the economy) a bot run on three seeds against
recorded baselines. It ships as a PR from a template, which the session that built it squash-merges
itself once checks are green - nobody waits on a human to click merge. Afterwards, a short look back
records what the session cost and what slowed it down, in its own file. A lesson seen enough times
turns into a change to a playbook or a check, so the same friction doesn't happen twice.

**Sessions merge their own PRs.** The owner gave standing permission for this, because waiting for a
human to review and click merge costs hours when they're not watching. A PR only waits for the owner
when it's genuinely their call: a balance change beyond the agreed tolerance, or a spec question the
brief doesn't settle - and even then, the session opens an issue with a default answer and keeps
working on other things rather than sitting idle.

**A coordinator runs the other sessions.** For a feature with parts that can be built in different
files at once, one session acts as coordinator: it writes each part's brief from the template, starts
a fresh session for it, sweeps them all at each check-in (cost, context used, open PRs, rate limits),
and retires a session once its PR has merged. It never writes code itself - only briefs. It also
manages two scheduled Routines: a lessons-tidy that fires once enough new look-backs have piled up,
and an hourly watchdog that re-wakes any session the account's usage limit stopped mid-turn (which
would otherwise stay stuck, since the limit kills a turn before it can book its own wake-up).

**Checks fail on purpose.** A check can be written before the code it tests exists, listed in a
pending file so it's allowed to fail without breaking the build; the PR that implements the feature
removes its own line from that list, which is what turns the check on for good. It's a way to write
the test first without a red build blocking everyone else in the meantime.

**One file per entry.** Lessons, roadmap items, What's new fragments, decision records and check
groups are all "one file per entry, never a shared list": a small script joins them into the
human-readable index each time the project builds. Two sessions adding a lesson, or a roadmap item,
never touch the same lines, so they never conflict with each other.

**A knowledge graph, so sessions don't read everything.** One script (\`tools/graph.mjs\` here) walks
the source and the docs fresh each time and answers "what touches X?" for a system, a file, a
function, a hook, a saved field or a check group - the files, functions, docs and lessons around it.
A brief tells a session to read only what a named query lists, instead of the whole runbook end to
end, which is most of what keeps a session's cost and context down on a codebase this size. The same
script has a \`--write\` mode that regenerates a JSON index the project's own build keeps current, and
a \`--check\` mode that fails on a broken doc link or a system's notes that don't name any of its
files - so the map and the docs it points at can't quietly drift apart.

**Cost and rate limits are budgeted, not discovered.** Every brief carries a dollar estimate and a
rule for what to do past twice it (say why, trim, keep going). Sessions check their own usage and
the account's rate-limit status at each stopping point, and a coordinator caps how many full-price
sessions run at once, moving routine work to a cheaper model.

## What's in this pack

| Path | Why it's here |
| --- | --- |
${fileMap(files)}

\`RUNBOOK-ALL.md\` is every prose file above (not the code, workflows or hooks) concatenated in
reading order, each under a heading naming its path, so the whole runbook can be uploaded to a
Claude project as one document.

## Adapting this to another repo

Nothing here should be copied wholesale; it was written for one game repo with one owner. What each
playbook assumes about Final Call, and what's really just "how to run sessions on any repo":

- **\`balance\`** is entirely Final Call-specific: it exists to tune this game's economy with a bot
  that plays 1,200 simulated hours and a baselines file for this game's levels. A different project
  has its own way of judging "did this change break anything that matters", or none at all - keep the
  shape (measure before, measure after, compare against a recorded target) and throw out the rest.
- **\`coordinator\`** carries over almost as it is: starting and sweeping sessions, a cap on how many
  run at once, the lessons-tidy and watchdog Routines. Only the "about four sessions" cap and the
  specific Routine ids are tuned to this account's rate limits.
- **\`feature\`** carries over its shape (issue, spec, build, checks, fresh review, ship, learn) but
  its details are all this game: saved-state rules (\`G\`, \`FIELDS\`, never renaming a field), the
  seeded random generator, the headless simulation, and the owner's own preferences (hide locked
  items, UK English, phones down to 320px). Replace those with whatever this project's own
  non-negotiables are.
- **\`release\`** is built around this game shipping as one static HTML page with save files that
  must keep loading forever; a project with real users and a database, or no released "version" at
  all, needs its own release process, but the idea of "one file per pending change, folded by a
  release rather than claimed by each feature" still saves conflicts.
- **\`steward\`** carries over well: CI check-ins over polling, small review comments fixed and pushed
  immediately, bigger ones proposed rather than assumed, a look back after every merge. Its balance
  and stacked-branch sections are this game's own CI shape.

**The five things to set up first**, in a new repo:

1. **Project notes** (a \`CLAUDE.md\` like this one): the short core every session needs, with a table
   pointing at the details rather than one huge file.
2. **A brief template with a validator** (\`docs/briefs/TEMPLATE.md\` and \`tools/brief.mjs\`): every
   section a session actually needs to start without asking a question the brief should have
   answered, and a script that fails a brief missing one.
3. **A checks script** (\`tools/check.mjs\` and a \`tools/checks/\` folder, one file per group): whatever
   "does this still work" means for this project, run in one command, so a session can prove a change
   before opening a PR rather than finding out from CI.
4. **A commit-msg hook** (\`.githooks/commit-msg\`, turned on with
   \`git config core.hooksPath .githooks\`): strips or refuses whatever this workspace doesn't want
   leaking into commit history - tool attribution here, maybe something else elsewhere.
5. **A PR template** (\`.github/pull_request_template.md\`): the shape every session's PR description
   fills in, so a reviewer (human or the next session) can tell what changed and why without reading
   the diff cold.
`;

function main(){
  const files=resolve();
  copyPack(files);
  const readmeText=README(files);
  writeFileSync(join(OUT,'README.md'),readmeText);
  writeFileSync(join(OUT,'RUNBOOK-ALL.md'),buildAll(readmeText,files));
  rmSync(ZIP,{force:true});
  execFileSync('zip',['-rq',ZIP,'runbook-pack'],{cwd:join(root,'build')});
  console.log(`packed ${files.length} files plus README.md and RUNBOOK-ALL.md into ${ZIP}`);
}

if(process.argv[1]===fileURLToPath(import.meta.url))main();
