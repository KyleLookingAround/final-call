// The map in tools/graph.mjs: every link in the docs resolves, every system in docs/systems/ names its files, and the
// joined lists (tools/join.mjs) are sound; a system's file changed without its notes is a warning.

export default async function({ok}){
  const {build,check}=await import('../graph.mjs'),g=build(),{errs,warns}=check(g);
  for(const w of warns)console.log('WARN  graph: '+w);
  ok('graph: doc links resolve and every system section names its files',!errs.length,errs.slice(0,3).join('; '));
  ok('graph: it maps every game file, check group and saved field',Object.keys(g.files).length>=40&&Object.keys(g.checks).length>=15&&Object.keys(g.saved).length>=50,`${Object.keys(g.files).length} files, ${Object.keys(g.checks).length} check groups, ${Object.keys(g.saved).length} saved fields`);
  // the joined lists: every entry in the shape its list needs, and each list rebuilt from them
  const {problems,stale}=await import('../join.mjs'),bad=problems(),old=stale();
  ok('graph: the joined lists\' entries are sound (tools/join.mjs)',!bad.length,bad.slice(0,3).join('; ')||'');
  if(old.length)console.log(`WARN  graph: ${old.join(', ')} out of date: node tools/join.mjs --write (npm run build does)`);
}
