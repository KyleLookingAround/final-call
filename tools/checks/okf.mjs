// The docs as a knowledge bundle (tools/okf.mjs, OKF v0.2): every file in docs/ has frontmatter that parses, with its
// folder's type and the fields its type needs, actors that are people or processes, paths that exist, footnotes keyed to
// its sources, and a status its body agrees with; and the pacing attester (tools/attest-pacing.mjs) attests a sanctioned
// receipt and refuses the ones that aren't. Each rule is also shown failing on a made-up file or receipt.
// No browser.

export default async function({ok}){
  const {check,concept,parse,dump,concepts}=await import('../okf.mjs');
  const {errs,warns,count}=check();
  for(const w of warns)console.log('WARN  okf: '+w);
  ok('okf: every docs file has sound frontmatter for its type',!errs.length,errs.slice(0,3).join('; ')||`${count} files`);

  // the reader: what it refuses, and the writer and reader agree on every real file
  const refused=['---\ntype: System\ndescription: a: b\n---\n','---\ntype: [a, b\n---\n','---\ntype: System\n  indented: x\n---\n',
    '---\ntype: System\ntype: Spec\n---\n','---\ntype: System\ndescription: yes\n---\n','---\ntype: System\n',
    '---\ntype: System\nverified: { by: human:a, at: 2026-10-03T00:00:00Z }\n---\n','---\ntype: System\nstale_after: 2026-10-03\n---\n'].filter(t=>parse(t).data);
  ok('okf: the reader refuses frontmatter other YAML readers would read differently, or not at all',!refused.length,refused.map(t=>JSON.stringify(t)).join('; '));
  // and reads the ordinary YAML editors write: a list at its key's indent, comments inside a block, more than one space
  // after a dash, a byte-order mark
  const read=[['---\ntags:\n- a\n- b\n---\n',{tags:['a','b']}],['---\nexecutor:\n  resource: x.mjs\n# why\n  receipt: [a]\n---\n',{executor:{resource:'x.mjs',receipt:['a']}}],
    ['---\nsources:\n  -   id: a\n      resource: b.md\n---\n',{sources:[{id:'a',resource:'b.md'}]}],['\uFEFF---\ntype: Lesson\n---\n',{type:'Lesson'}]]
    .filter(([t,want])=>JSON.stringify(parse(t).data)!==JSON.stringify(want)).map(([t])=>JSON.stringify(t));
  ok('okf: the reader reads lists at their key\'s indent, comments in a block, wide dashes and a byte-order mark',!read.length,read.join('; '));
  const drift=concepts().filter(c=>c.data&&JSON.stringify(parse(dump(c.data)+'\n').data)!==JSON.stringify(c.data)).map(c=>c.path);
  ok('okf: frontmatter written back reads the same, for every docs file',!drift.length,drift.slice(0,3).join(', '));

  // the profile's rules, each on a made-up file that breaks it
  const bad=(p,text)=>check(undefined,[concept(p,text)]).errs.length>0;
  const cases=[
    ['no frontmatter','docs/systems/x.md','# X\n'],
    ['the wrong type for its folder','docs/systems/x.md','---\ntype: Spec\ndescription: d\nverified: { by: human:a, at: "2026-10-03T00:00:00Z" }\n---\n# X\n'],
    ['a system without a description','docs/systems/x.md','---\ntype: System\n---\n# X\n'],
    ['a tool\'s version as the actor','docs/systems/x.md','---\ntype: System\ndescription: d\nverified: { by: some-agent/1.0, at: "2026-10-03T00:00:00Z" }\n---\n# X\n'],
    ['a time without its offset','docs/systems/x.md','---\ntype: System\ndescription: d\nverified: { by: human:a, at: "2026-10-03T00:00:00" }\n---\n# X\n'],
    ['a process named after a tool','docs/systems/x.md','---\ntype: System\ndescription: d\nverified: { by: process:bot-review, at: "2026-10-03T00:00:00Z" }\n---\n# X\n'],
    ['a footnote in a file without sources','docs/systems/x.md','---\ntype: System\ndescription: d\n---\nSee[^a].\n'],
    ['a footnote no source has','docs/metrics/x.md','---\ntype: Metric\ndescription: d\nsources:\n  - { id: a, resource: ../../tools/baseline.json }\n---\nSee[^b].\n'],
    ['a path that doesn\'t exist','docs/metrics/x.md','---\ntype: Metric\ndescription: d\nsources:\n  - { id: a, resource: ../../tools/nothing.json }\n---\n# X\n'],
    ['an approved spec without the owner\'s approval','docs/specs/x.md','---\ntype: Spec\ndescription: d\nstatus: stable\n---\n# X\n\nIssue: #1 · Status: Approved\n'],
    ['a superseded decision that isn\'t deprecated','docs/decisions/ADR-x.md','---\ntype: Decision\ndescription: d\nstatus: stable\n---\n# X\n\n## Status\n\nSuperseded by another.\n'],
    ['a roadmap item without its section','docs/roadmap.d/x.md','---\ntype: Roadmap item\n---\n- x\n'],
    ['a lesson with its theme in the body','docs/lessons/1-x.md','---\ntype: Lesson\n---\nTheme: checks\n# X\n'],
    ['a computation with no attester','docs/computations/x.md','---\ntype: Attested Computation\ndescription: d\nruntime: node\nexecutor:\n  resource: ../../tools/run-bot.mjs\n  receipt: [a]\n---\n# Computation\n'],
  ].filter(([,p,t])=>!bad(p,t)).map(c=>c[0]);
  ok('okf: each rule fails a made-up file that breaks it',!cases.length,cases.join(', ')&&'not caught: '+cases.join(', '));
  const good=check(undefined,[concept('docs/systems/x.md','---\ntype: System\ndescription: d\nverified: { by: process:notes-review, at: "2026-10-03T00:00:00Z" }\n---\n# X\n')]).errs;
  ok('okf: a sound made-up file passes',!good.length,good[0]||'');

  // the attester: a sanctioned receipt attests; options, another build, another baseline, errors or a changed table don't
  const {attest,pacingRows}=await import('../attest-pacing.mjs');
  const base={hours:1200,tolerance:0.15,levels:{1:[3,6],3:[85,105],5:[275,325]}},lvlAt={1:4,2:60,3:110,4:200,5:300};
  const receipt=x=>({seed:1,hours:1200,lvlAt,rows:pacingRows(lvlAt,1200,base),errs:[],build:'b',baseline:'h',opts:{layouts:false},rateDay:null,pols:null,commit:'c',...x});
  const run=r=>attest(1,{receipt:r,base,buildHash:'b',baseHash:'h'});
  const fine=run(receipt({}));
  ok('okf: the pacing attester attests a sanctioned receipt and reads its table',fine.ok&&/L3 110 near \(5%\)/.test(fine.line),fine.line);
  const wrong=[['bot options',{opts:{layouts:true}}],['--rate-day',{rateDay:{scale:6}}],['--pol',{pols:{late:'close'}}],['another build',{build:'x'}],
    ['another baseline',{baseline:'x'}],['a short run',{hours:600}],['errors',{errs:['boom']}],['a changed table',{rows:pacingRows({...lvlAt,3:95},1200,base)}],
    ['an older receipt',{opts:undefined,build:undefined}]].filter(([,x])=>{const r=receipt(x);for(const k in x)if(x[k]===undefined)delete r[k];return run(r).ok}).map(w=>w[0]);
  ok('okf: the pacing attester refuses a receipt that isn\'t the sanctioned run, or whose table is wrong',!wrong.length,wrong.length?'attested: '+wrong.join(', '):'');
}
