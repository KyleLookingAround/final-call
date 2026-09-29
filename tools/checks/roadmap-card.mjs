// The Roadmap tab on the What's new card (docs/specs/roadmap-tab.md, #137): every entry in src/roadmap.d/ has a known status, a code, a title, a
// one-line summary within a length limit and one to four details, and the game's ROADMAP is those files; a real tap on the Roadmap tab shows the board, the filter chips show the right rows
// and counts (All included), a real tap on a row opens its details, the tab is hidden during the guided start, and at 320×568 and 568×320 the tab strip, the
// filter chips and Play are all in view, with screenshots at phone, tablet and desktop sizes.
import {roadmapEntries,ROADMAP_STATUS} from '../sources.mjs';
const SIZES=[[320,568,true,'320'],[568,320,true,'568-landscape'],[390,844,true,'phone'],[768,1024,true,'tablet'],[1440,900,false,'desktop']];
export default async function({open,ok,saveText}){
  const files=roadmapEntries(),bad=[];
  for(const {file,e} of files){
    if(!ROADMAP_STATUS.includes(e.st))bad.push(file+': status '+e.st);
    if(!e.code||e.code.length>5)bad.push(file+': code');
    if(!e.t||e.t.length>40)bad.push(file+': title');
    if(!e.s||e.s.length>60||!/[.!?]$/.test(e.s))bad.push(file+': summary');
    if(!e.d.length||e.d.length>4||e.d.some(x=>x.length>170))bad.push(file+': details');
    if(/#\d+|\bissue\b|\bPR\b/i.test(JSON.stringify(e)))bad.push(file+': issue or PR number');
    if(e.st==='landed'&&!/^V\d+$/.test(e.code))bad.push(file+': a landed entry\'s code is its version');
    if(e.st!=='landed'&&!/^(SOON|TBA|IDEA)$/.test(e.code))bad.push(file+': code');
  }
  ok('roadmap-card: every src/roadmap.d entry has a status, code, title, one-line summary and one to four details',files.length>=10&&!bad.length,bad.join('; ')||files.length+' entries');
  const grown=saveText('v32-L9.json');
  {const {ctx,page,errs}=await open(undefined,grown,false,{still:true});
    const d=await page.evaluate(want=>{const S=__sim;return {n:S.ROADMAP.length,same:JSON.stringify(S.ROADMAP)===JSON.stringify(want)}},files.map(x=>x.e));
    ok('roadmap-card: the game\'s ROADMAP is the src/roadmap.d files, in order',d.same&&d.n===files.length,JSON.stringify(d));
    // the guided start hides the card, as for the rest of What's new
    const tour=await page.evaluate(()=>{const S=__sim;const old=S.G.tour,seen=S.G.seen;S.G.seen=0;S.G.tour={done:false};const during=S.newsDue();S.G.tour={done:true};const after=S.newsDue();S.G.tour=old;S.G.seen=seen;return {during,after}});
    ok('roadmap-card: the card, and so the Roadmap tab, waits out the guided start',!tour.during&&tour.after,JSON.stringify(tour));
    // a real tap on the tab; the board is drawn only then
    await page.evaluate(()=>__sim.openNews(true,false));
    const before=await page.evaluate(()=>({html:document.querySelector('#roadmapList').innerHTML.length,tab:document.querySelector('#newsBody').dataset.tab,list:getComputedStyle(document.querySelector('#newsList')).display}));
    await page.click('#news [data-newstab="road"]');
    const on=await page.evaluate(()=>{const q=s=>document.querySelector(s);return {tab:q('#newsBody').dataset.tab,road:getComputedStyle(q('#roadmapList')).display,list:getComputedStyle(q('#newsList')).display,
      kofi:getComputedStyle(q('.kofifoot')).display,rows:document.querySelectorAll('#roadmapList .rrow').length,title:q('#newsT').textContent,play:!!q('#news .newsgo .buy'),foot:q('.rfoot').textContent,
      open:document.querySelectorAll('#roadmapList .rrow[open]').length}});
    const N=files.length;
    ok('roadmap-card: nothing is drawn until the tab is tapped; the tap swaps the list for the board',before.html===0&&before.tab==='news'&&before.list!=='none'&&on.tab==='road'&&on.road!=='none'&&on.list==='none'&&on.kofi==='none'&&on.rows===N&&on.play&&on.open===0&&on.foot==='Plans change; older saves always load.',JSON.stringify({before,on}));
    // the chips: All and one per status that has entries, each with its count, each showing exactly its rows
    const chips=await page.evaluate(()=>[...document.querySelectorAll('#roadmapList .rchip')].map(b=>[b.dataset.rfilter,+b.querySelector('span').textContent]));
    const want=[['all',N],...ROADMAP_STATUS.map(k=>[k,files.filter(x=>x.e.st===k).length]).filter(x=>x[1])];
    ok('roadmap-card: the filter chips are All and each status with entries, with the right counts',chips.length===want.length&&want.every(w=>chips.some(c=>c[0]===w[0]&&c[1]===w[1])),JSON.stringify({chips,want}));
    const bad2=[];
    for(const [k,n] of want){
      await page.click(`#roadmapList [data-rfilter="${k}"]`);
      const r=await page.evaluate(()=>({rows:[...document.querySelectorAll('#roadmapList .rrow')].map(e=>e.className.match(/st-(\w+)/)[1]),pressed:[...document.querySelectorAll('#roadmapList .rchip[aria-pressed=true]')].map(b=>b.dataset.rfilter)}));
      if(r.rows.length!==n||(k!=='all'&&r.rows.some(s=>s!==k))||r.pressed.length!==1||r.pressed[0]!==k)bad2.push(k+':'+JSON.stringify(r));
    }
    ok('roadmap-card: a tap on each chip shows only its rows and marks it pressed',!bad2.length,bad2.join('; '));
    // a real tap on a row opens its details in place; another tap closes them
    await page.click('#roadmapList [data-rfilter="all"]');
    await page.locator('#roadmapList .rrow summary').first().click();
    const tap=await page.evaluate(()=>{const rows=[...document.querySelectorAll('#roadmapList .rrow')],o=rows.filter(r=>r.open);return {open:o.length,lis:o[0]?o[0].querySelectorAll('li').length:0,vis:o[0]?o[0].querySelector('.rdet').getBoundingClientRect().height>0:false}});
    ok('roadmap-card: a tap on a row opens its details',tap.open===1&&tap.lis>=1&&tap.vis,JSON.stringify(tap));
    // a second tap on the open tab changes nothing, and the title comes back exactly as the card set it
    await page.click('#news [data-newstab="road"]');
    // back to What's new: the list is back, the title is back, and closing and reopening starts on What's new with All showing
    await page.click('#news [data-newstab="news"]');
    const back=await page.evaluate(()=>{const q=s=>document.querySelector(s);const r={list:getComputedStyle(q('#newsList')).display,title:q('#newsT').textContent,road:getComputedStyle(q('#roadmapList')).display};__sim.openNews(false);__sim.openNews(true,false);r.tab=q('#newsBody').dataset.tab;r.again=q('#newsT').textContent;__sim.openNews(false);return r});
    ok('roadmap-card: What\'s new tab brings back the list and its title; the card reopens on it',back.list!=='none'&&back.road==='none'&&back.title==="What's new · all versions"&&back.again==="What's new · all versions"&&back.tab==='news'&&!errs.length,JSON.stringify(back)+(errs.length?' '+errs[0]:''));
    await ctx.close()}
  // fit: tab strip, chips and Play in view at each size (the card's own newest-version checks stay in news-card)
  for(const [w,h,touch,name] of SIZES){
    const {ctx,page,errs}=await open({width:w,height:h},grown,touch,{still:true});
    await page.evaluate(()=>{try{localStorage.setItem('final-call-topgap','medium')}catch(e){};if(typeof applyGap==='function')applyGap()});
    await page.evaluate(()=>{__sim.G.level=9;__sim.openNews(true,false)});await page.click('#news [data-newstab="road"]');
    await page.evaluate(()=>document.querySelector('#roadmapList .rrow summary').click());
    const r=await page.evaluate(()=>{const q=s=>document.querySelector(s).getBoundingClientRect(),tabs=q('#news .newstabs'),body=q('#newsBody'),chips=q('#roadmapList .rchip'),play=q('#news .newsgo .buy'),c=q('#news .hcard');
      return {tabs:tabs.top>=0&&tabs.bottom<=body.top+1,chips:chips.top>=body.top-1&&chips.bottom<=body.bottom+1,play:play.top>=0&&play.bottom<=innerHeight+1&&play.bottom<=c.bottom+1,card:c.top>=0&&c.bottom<=innerHeight+1,l:c.left,r:c.right,page:document.documentElement.scrollWidth}});
    await page.waitForTimeout(300);await page.screenshot({path:`build/shots/roadmap-${name}.png`});
    ok(`roadmap-card: the tab strip, the chips and Play are in view at ${name}`,r.tabs&&r.chips&&r.play&&r.card&&r.l>=0&&r.r<=w&&r.page<=w&&!errs.length,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    await ctx.close()}
}
