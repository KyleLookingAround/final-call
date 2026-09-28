// Page size budget (docs/decisions/ADR-2026-09-28-page-size-budget.md): dist/index.html, which grows with every feature,
// stays under a byte budget. Reads the file the build already made; starts no browser.
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

// Today's size (about 749 KB on main, 15:45 on 28 Sep 2026) plus about 15% headroom, rounded. Raise it on purpose in
// this one line, with the reason in the PR.
const BUDGET=861_000;

const KB=n=>(n/1000).toFixed(1)+' KB';

export default async function({ok,root}){
  const html=readFileSync(join(root,'dist/index.html'),'utf8');
  const size=Buffer.byteLength(html,'utf8');

  const styleStart=html.indexOf('<style>'),styleEnd=html.indexOf('</style>')+'</style>'.length;
  const scriptStart=html.indexOf('<script>',styleEnd),scriptEnd=html.indexOf('</script>',scriptStart)+'</script>'.length;
  const css=html.slice(styleStart,styleEnd),script=html.slice(scriptStart,scriptEnd);
  const markup=html.slice(0,styleStart)+html.slice(styleEnd,scriptStart)+html.slice(scriptEnd);
  const data=[...markup.matchAll(/data:[^"'\s)]+/g)].reduce((n,m)=>n+Buffer.byteLength(m[0],'utf8'),0);
  const cssSize=Buffer.byteLength(css,'utf8'),scriptSize=Buffer.byteLength(script,'utf8'),markupSize=Buffer.byteLength(markup,'utf8');

  const info=`${KB(size)} of a ${KB(BUDGET)} budget (css ${KB(cssSize)}, script ${KB(scriptSize)}, inline images/data ${KB(data)}, the rest ${KB(markupSize-data)})`;
  ok('page-size: dist/index.html stays under its budget',size<=BUDGET,info);
}
