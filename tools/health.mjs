// Weekly health check: turns the bot's own build/bot-<seed>.json files (seeds 1-3, keeping Classic,
// already run by `npm run bot`) into one table and a drift verdict, for the "Health check" workflow
// to put in an issue. Recomputes each level's status itself (the same maths as tools/run-bot.mjs)
// rather than trusting the file's own `rows`, so a manual run can pass HEALTH_BASELINE_OVERRIDE (a
// JSON object of level: [lo, hi]) to tighten a range for that run only, without touching
// tools/baseline.json, to prove the workflow catches drift.
//   node tools/health.mjs [seed ...]     default seeds 1 2 3; prints one JSON line to stdout
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argSeeds = process.argv.slice(2).map(Number).filter(n => n > 0);
const seeds = argSeeds.length ? argSeeds : [1, 2, 3];

const base = JSON.parse(readFileSync(join(root, 'tools/baseline.json'), 'utf8'));
const override = process.env.HEALTH_BASELINE_OVERRIDE ? JSON.parse(process.env.HEALTH_BASELINE_OVERRIDE) : null;
const levels = {...base.levels, ...(override || {})};

const runs = seeds.map(seed => {
  let j;
  try {
    j = JSON.parse(readFileSync(join(root, `build/bot-${seed}.json`), 'utf8'));
  } catch (e) {
    return {seed, errs: [`no build/bot-${seed}.json (the bot run didn't finish)`], rows: []};
  }
  const rows = Object.entries(levels).map(([lv, [lo, hi]]) => {
    const h = j.lvlAt[lv];
    if (h == null) return {lv, lo, hi, h: null, status: j.hours < hi ? 'not run long enough' : 'off'};
    const dev = h < lo ? (lo - h) / lo : h > hi ? (h - hi) / hi : 0;
    return {lv, lo, hi, h, status: dev === 0 ? 'ok' : dev <= base.tolerance ? 'near' : 'off', dev: Math.round(dev * 100)};
  });
  return {seed, lvlAt: j.lvlAt, errs: j.errs, rows};
});

const lvls = Object.keys(levels);
const cell = row => !row ? '—' : row.h == null ? `— (${row.status})` : `${row.h} (${row.status}${row.dev ? ` ${row.dev}%` : ''})`;
const table = [
  `Bot, ${base.hours} game hours, keeping Classic${override ? ', with a tightened baseline for this run only' : ''}`, '',
  `| Level | Baseline | ${seeds.map(s => `Seed ${s}`).join(' | ')} |`,
  `| --- | --- | ${seeds.map(() => '---').join(' | ')} |`,
  ...lvls.map(lv => `| ${lv} | ${levels[lv][0]}–${levels[lv][1]} | ${runs.map(r => cell(r.rows.find(row => row.lv === lv))).join(' | ')} |`),
].join('\n');

const drift = runs.some(r => (r.errs && r.errs.length) || r.rows.some(row => row.status === 'off' || row.status === 'not run long enough'));
console.log(JSON.stringify({drift, table, runs}));
