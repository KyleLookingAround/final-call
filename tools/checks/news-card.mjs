// The What's new card (docs/specs/whats-new.md, #128): every point, in UPDATES and the waiting fragments, is a short bold lead and one sentence, every "Show me"
// target is real and every level is a real level; a young save sees no point above its level until it taps that version's
// Show (for this viewing only), and a grown one sees them all;
// a real tap on each "Show me" button closes the card and lands on its target; and at 320×568 and 568×320 the newest
// version and Play are both in view without scrolling, with screenshots at phone, tablet and desktop sizes.
const SIZES=[[320,568,true,'320'],[390,844,true,'phone'],[568,320,true,'568-landscape'],[844,390,true,'landscape'],[1440,900,false,'desktop']];
import {readdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
// a waiting fragment's points (src/updates.d/README.md): "- **Lead.** Sentence. (go: tab:fleet · level: 1)"
const fragPoints=root=>readdirSync(join(root,'src/updates.d')).filter(f=>f.endsWith('.md')&&f!=='README.md').flatMap(f=>
  readFileSync(join(root,'src/updates.d',f),'utf8').split('\n').filter(l=>l.startsWith('- ')).map(l=>{const m=l.match(/^- \*\*(.+?)\.\*\* (.+?)(?: \((.+)\))?$/);
    if(!m)return {f,b:l,t:''};const o=Object.fromEntries((m[3]||'').split(' · ').filter(Boolean).map(x=>x.split(': ')));
    return {f,b:m[1],t:m[2],go:o.go,lv:o.level===undefined?undefined:+o.level}}));
export default async function({open,ok,saveText,root}){
  const frags=fragPoints(root);
  const grown=saveText('v32-L9.json');
  {const {ctx,page,errs}=await open(undefined,grown,false,{still:true});
    // the data: leads, sentences, targets and levels
    const d=await page.evaluate(frags=>{const S=__sim,bad=[];
      for(const u of [...S.UPDATES,...frags.map(p=>({v:p.f,points:[p]}))])for(const p of u.points){const w=`v${u.v} ${p.b||p}`;
        if(typeof p!=='object'){bad.push(w+': not a {b,t} point');continue}
        if(!p.b||p.b.split(' ').length>4||/[.!?]$/.test(p.b))bad.push(w+': lead');
        if(!p.t||p.t.length>90||!/[.!?]$/.test(p.t)||/[.!?] ./.test(p.t))bad.push(w+': sentence');
        if(p.go!==undefined&&!S.newsOk(p.go))bad.push(w+': target '+p.go);
        if(p.lv!==undefined&&!(Number.isInteger(p.lv)&&p.lv>=0&&p.lv<S.LEVELS.length))bad.push(w+': level '+p.lv)}
      return {bad,points:S.UPDATES.reduce((n,u)=>n+u.points.length,0),targets:S.UPDATES.flatMap(u=>u.points).filter(p=>p.go).length,
        fake:['tab:nowhere','office:nope','up:nothing','gate:99','shop'].filter(g=>S.newsOk(g)),frags:frags.length}},frags);
    ok('news-card: every point, released or waiting, has a short lead and one sentence, a real target and a real level',!d.bad.length&&!d.fake.length&&d.targets>10,JSON.stringify(d));
    // hiding: count what each level shows, with every version opened
    const S_N=await page.evaluate(()=>__sim.UPDATES.length);
    const shown=await page.evaluate(()=>{const S=__sim,G=S.G,out={};
      for(const lv of [1,9]){G.level=lv;S.openNews(true,false);document.querySelectorAll('#newsList details').forEach(e=>e.open=true);
        const leads=[...document.querySelectorAll('#newsList li b')].map(b=>b.textContent.replace(/\.$/,''));
        const want=S.UPDATES.flatMap(u=>u.points).filter(p=>!(p.lv>lv)).length,above=S.UPDATES.flatMap(u=>u.points).filter(p=>p.lv>lv).map(p=>p.b);
        out[lv]={leads:leads.length,want,above:above.filter(b=>leads.includes(b)&&!S.UPDATES.flatMap(u=>u.points).some(p=>p.b===b&&!(p.lv>lv))),
          spoil:document.querySelectorAll('#newsList [data-newsspoil]').length,locked:S.UPDATES.filter(u=>u.points.some(p=>p.lv>lv)).length,titles:document.querySelectorAll('#newsList [data-v]').length,versions:document.querySelectorAll('#newsList > details').length};S.openNews(false)}
      G.level=9;return out});
    ok('news-card: a young save sees no point above its level, with one Show per version that has them; a grown one sees them all',
      shown[1].leads===shown[1].want&&!shown[1].above.length&&shown[1].spoil===shown[1].locked&&shown[1].titles===S_N&&shown[9].leads===shown[9].want&&!shown[9].spoil,JSON.stringify(shown));
    // a real tap on Show reveals that version's later points in place, marked with their level and with no Show me; the next viewing hides them again
    const spoilV=await page.evaluate(()=>{const S=__sim;S.G.level=1;S.openNews(true,false);document.querySelectorAll('#newsList details').forEach(e=>e.open=true);
      return S.UPDATES.find(u=>u.points.every(p=>p.lv>1)).v});
    await page.click(`#newsList [data-newsspoil="${spoilV}"]`);
    const sp=await page.evaluate(v=>{const S=__sim,el=document.querySelector(`#newsList [data-v="${v}"]`),u=S.UPDATES.find(x=>x.v===v);
      const r={open:el.tagName==='DETAILS'&&el.open,leads:el.querySelectorAll('li b').length,want:u.points.length,tags:[...el.querySelectorAll('.ulv')].map(t=>t.textContent),showMe:el.querySelectorAll('[data-newsgo]').length,control:!!el.querySelector('[data-newsspoil]'),card:!document.querySelector('#news').hidden};
      S.openNews(false);S.openNews(true,false);r.again=document.querySelectorAll(`#newsList [data-v="${v}"] li`).length;S.openNews(false);S.G.level=9;return r},spoilV);
    ok('news-card: Show reveals a version\'s later-level points in place, marked, for this viewing only',
      sp.open&&sp.leads===sp.want&&sp.tags.length===sp.want&&sp.tags.every(t=>/^Level \d$/.test(t))&&!sp.showMe&&!sp.control&&sp.card&&sp.again===0,JSON.stringify(sp));
    // a real tap on each Show me button lands on its target and closes the card
    const gos=await page.evaluate(()=>{const S=__sim;S.openNews(true,false);const g=[...new Set([...document.querySelectorAll('#newsList [data-newsgo]')].map(b=>b.dataset.newsgo))];S.openNews(false);return g});
    const land={};
    for(const g of gos){
      await page.evaluate(()=>{const S=__sim;S.setSpeed(2);S.openNews(true,false);document.querySelectorAll('#newsList details').forEach(e=>e.open=true)});
      await page.click(`#newsList [data-newsgo="${g}"]`);
      land[g]=await page.evaluate(g=>{const S=__sim,G=S.G,R=S.R,$=s=>document.querySelector(s),r={card:!$('#news').hidden,tab:G.tab,plan:!$('#plan').hidden,help:!$('#help').hidden,photo:!!R.photo,
        sub:S.NEWS_SUB[g.split(':')[0]]&&R[S.NEWS_SUB[g.split(':')[0]][0]]};
        if(r.plan)$('#plan .close').click();if(r.help)S.openHelp(false);if(r.photo)S.photoOff();return r},g);
    }
    const wrong=Object.entries(land).filter(([g,r])=>{const [a,b]=g.split(':');if(r.card)return true;
      if(g==='plan')return !r.plan;if(g==='help')return !r.help;if(g==='photo')return !r.photo;if(a==='tab')return r.tab!==b;if(g==='chal')return r.tab!=='office';if(g==='pier')return r.tab!=='stands';
      return r.tab!==a||r.sub!==b});
    ok('news-card: a tap on each Show me button closes the card and lands on its target',gos.length>=8&&!wrong.length&&!errs.length,JSON.stringify(wrong.length?wrong:gos)+(errs.length?' '+errs[0]:''));
    await ctx.close()}
  // fit: the newest version's title and first point, and Play, in view without scrolling
  // one page per size: the level 9 save, then the same save shown as a young one (the card reads only G.level and G.seen)
  for(const [w,h,touch,name] of SIZES){
    const {ctx,page,errs}=await open({width:w,height:h},grown,touch,{still:true});
    await page.evaluate(()=>{try{localStorage.setItem('final-call-topgap','medium')}catch(e){};if(typeof applyGap==='function')applyGap()});
    for(const [lv,who] of [[1,'young'],[9,'L9']]){
      const r=await page.evaluate(lv=>{const S=__sim;S.openNews(false);S.G.level=lv;S.G.seen=S.UPDATES[1].v;S.openNews(true,true);
        const q=s=>document.querySelector(s).getBoundingClientRect(),body=q('#newsBody'),top=q('#newsList > details summary'),pt=q('#newsList > details li'),play=q('#news .newsgo .buy'),c=q('#news .hcard');
        return {inBody:top.top>=body.top-1&&pt.bottom<=body.bottom+1,play:play.top>=0&&play.bottom<=innerHeight+1&&play.bottom<=c.bottom+1,l:c.left,r:c.right,page:document.documentElement.scrollWidth}},lv);
      await page.waitForTimeout(300);await page.screenshot({path:`build/shots/news-${name}-${who}.png`});
      if(name==='320'||name==='568-landscape'||who==='L9')ok(`news-card: the newest version and Play in view at ${name} (${who})`,r.inBody&&r.play&&r.l>=0&&r.r<=w&&r.page<=w&&!errs.length,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    }
    await ctx.close()}
}
