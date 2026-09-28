// The level-up card (docs/specs/level-up.md): it opens once on a level-up, pauses the game and puts the speed back; it
// lists only what has just unlocked, at most 5 plans and one upgrade chip a tab; each link lands on the right tab; two
// levels at once make one card; the setting and the headless sim keep it closed; the guided start queues it and opens
// it once the tour ends; and it fits phones, tablets and desktops.
const EASY=()=>{const S=__sim;window.easy=(...ns)=>{for(const n of ns)S.LEVELS[n].req={pax:0,rep:0,gates:1}};
  window.card=()=>{const el=document.querySelector('#lvlup');return el.hidden?null:{title:el.querySelector('#lvlT').textContent.replace(/^(Now an?)/,'$1 '),text:el.textContent,go:[...el.querySelectorAll('#lvlList [data-lvgo]')].map(b=>b.dataset.lvgo)}}};
export default async function({open,ok}){
  {const {ctx,page,errs}=await open(undefined,null,false,{still:true});await page.evaluate(EASY);
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,out={};G.tour={done:1};S.setSpeed(4);
      // only what's new at level 1: gate A3, the Region and the World map, level-1 plans; nothing from later levels
      const U=S.lvlUnlocks(0,1),later=S.TECH.filter(T=>T.t>1).map(T=>T.n),names=U.plans.map(p=>p.t);
      out.only={gates:U.gates.map(g=>g.t),plans:names.length,all1:S.TECH.filter(T=>T.t===1).every(T=>names.includes(T.n)),later:names.filter(n=>later.includes(n)),
        region:U.open.some(o=>o.go==='tab:region'),world:U.open.some(o=>o.go==='tab:routes'),more:U.more.length,none:JSON.stringify(S.lvlUnlocks(1,1))};
      // the real thing: a level-up opens the card once, at the next UI tick, and pauses
      easy(1);S.checkLevel();out.before=!!card();S.lvlTick();const c=card();S.lvlTick();S.checkLevel();
      out.open={level:G.level,title:c&&c.title,speed:R.speed,once:document.querySelectorAll('#lvlup:not([hidden])').length,go:c&&c.go};
      S.lvlCardOpen(false);out.closed={shown:!!card(),speed:R.speed};S.lvlTick();out.again=!!card();return out});
    const o=r.only;
    ok('levelup: it lists only what has just unlocked',o.gates.join()==='Gate A3'&&o.all1&&!o.later.length&&o.region&&o.world&&o.more>0&&o.none==='{"gates":[],"more":[],"plans":[],"open":[]}',JSON.stringify(o));
    ok('levelup: it opens once on a level-up, pauses the game and puts the previous speed back',
      !r.before&&r.open.level===1&&/^Now a Local Airport$/.test(r.open.title)&&r.open.speed===0&&r.open.once===1&&r.closed.speed===4&&!r.closed.shown&&!r.again,JSON.stringify(r.open)+JSON.stringify(r.closed));
    // each link lands on the right tab, and closes the card
    const links=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,out={};
      const go=g=>{R.lvlCard={from:0,to:1};S.lvlTick();const b=document.querySelector(`#lvlList [data-lvgo="${g}"]`);if(!b)return 'missing';S.setSpeed(2);R.lvlPrev=2;b.click();
        const plan=!document.querySelector('#plan').hidden,res={tab:G.tab,plan,card:!!card(),sub:R.oSub};if(plan)document.querySelector('#plan .close').click();return res};
      const up=[...document.querySelectorAll('x')];R.lvlCard={from:0,to:1};S.lvlTick();const chip=document.querySelector('#lvlList .chip[data-lvgo^="up:"]').dataset.lvgo;S.lvlCardOpen(false);
      out.plan=go('plan');out.region=go('tab:region');out.world=go('tab:routes');out.up=go(chip);out.upTab=S.UPG[chip.slice(3)].tab;out.gate=go('gate:2');out.records=go('chal');return out});
    const L=links,shut=['plan','region','world','up','gate','records'].every(k=>L[k]&&L[k].card===false);
    ok('levelup: each link lands on the right tab and closes the card',shut&&L.plan.plan&&L.region.tab==='region'&&L.world.tab==='routes'&&L.up.tab===L.upTab&&L.gate.tab==='stands'&&L.records.tab==='office'&&L.records.sub==='progress',JSON.stringify(L));
    // Escape and a tap outside close it
    const keys=await page.evaluate(()=>{const S=__sim,R=S.R;R.lvlCard={from:0,to:1};S.lvlTick();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));const esc=!card();
      R.lvlCard={from:0,to:1};S.lvlTick();document.querySelector('#lvlup').dispatchEvent(new MouseEvent('click',{bubbles:true}));return {esc,outside:!card()}});
    ok('levelup: Escape and a tap outside close it',keys.esc&&keys.outside,JSON.stringify(keys));
    // two levels at once: one card
    const two=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;easy(2,3);S.checkLevel();S.checkLevel();S.lvlTick();const c=card();S.lvlCardOpen(false);S.lvlTick();
      return {level:G.level,title:c&&c.title,two:!!c&&/Two levels up/.test(c.text),after:!!card()}});
    ok('levelup: two levels at once make one card',two.level===3&&/City Airport/.test(two.title)&&two.two&&!two.after,JSON.stringify(two));
    // the setting and the headless sim keep it closed; with the setting off, the toast comes as before
    const off=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,out={};const t0=R.toasts.length;
      G.set.lvlCard=false;easy(4);S.checkLevel();S.lvlTick();out.setting={card:!!card()||!!R.lvlCard,toast:R.toasts.slice(t0).some(t=>/Now /.test(t.msg||t.text||JSON.stringify(t)))};G.set.lvlCard=true;
      // during the tour: level 5's card queues but stays shut, and the queueing means no fallback toast either
      G.tour={s:0};const t1=R.toasts.length;easy(5);S.checkLevel();S.lvlTick();
      out.tour={shown:!!card(),queued:!!R.lvlCard,toast:R.toasts.slice(t1).some(t=>/Now /.test(t.msg||t.text||JSON.stringify(t)))};
      // the tour's own last step opens the card it was holding back
      G.tour.s=S.TOUR.length-1;S.tourNext();out.tourEnd={shown:!!card(),title:card()&&card().title};S.lvlCardOpen(false);
      R.sim=true;easy(6);S.checkLevel();S.lvlTick();out.sim=!!card()||!!R.lvlCard;R.sim=false;out.level=G.level;return out});
    ok('levelup: the setting and the headless sim keep it closed',off.level===6&&!off.setting.card&&off.setting.toast&&!off.sim,JSON.stringify(off));
    ok('levelup: the guided start queues the card, with no toast, and opens it once the tour ends',
      !off.tour.shown&&off.tour.queued&&!off.tour.toast&&off.tourEnd.shown&&/^Now a Gateway Airport$/.test(off.tourEnd.title),JSON.stringify(off));
    // row 39: a level with lots to list still fits — at most 5 plan rows plus "and N more", one chip a tab not one a upgrade
    const big=await page.evaluate(()=>{const S=__sim,R=S.R;R.lvlCard={from:0,to:9};S.lvlCardOpen(true);
      const U=S.lvlUnlocks(0,9),tabs=new Set(U.more.map(x=>x.tab));
      // isolate the Masterplan section's own rows: 'go:plan' is shared with the tiles button and Consultants' "Opens up" row
      const section=document.querySelector('#lvlList').innerHTML.split('New in the Masterplan')[1].split('<div class="lvsec">')[0];
      const out={plansData:U.plans.length,moreData:U.more.length,tabs:tabs.size,
        planRows:(section.match(/class="lvgo"/g)||[]).length,
        note:(/and (\d+) more in the Masterplan/.exec(section)||[])[1],
        chips:document.querySelectorAll('#lvlList .lvchip').length};
      S.lvlCardOpen(false);return out});
    ok('levelup: at most 5 plans (plus "and N more") and one upgrade chip a tab',
      big.plansData>5&&big.planRows===5&&+big.note===big.plansData-5&&big.moreData>big.tabs&&big.chips===big.tabs,JSON.stringify(big));
    if(errs.length)ok('levelup: no page errors',false,errs[0]);
    await ctx.close();}
  // it fits: phones (320 px and 390×844, portrait and landscape, with the camera band), a tablet and a desktop
  for(const [w,h,touch,name] of [[320,640,true,'320'],[390,844,true,'phone'],[844,390,true,'landscape'],[768,1024,false,'tablet'],[1440,900,false,'desktop']]){
    const {ctx,page,errs}=await open({width:w,height:h},null,touch,{still:true});
    await page.evaluate(()=>{try{localStorage.setItem('final-call-topgap','medium')}catch(e){};if(typeof applyGap==='function')applyGap()});
    const r=await page.evaluate(()=>{const S=__sim;S.G.tour={done:1};document.querySelector('#coach').hidden=true;document.querySelector('#spot').hidden=true;S.R.lvlCard={from:3,to:5};S.lvlTick();
      const c=document.querySelector('#lvlup .lvcard').getBoundingClientRect(),x=document.querySelector('#lvlup .close').getBoundingClientRect(),gap=document.querySelector('#topgap').getBoundingClientRect();
      return {l:c.left,r:c.right,t:c.top,b:c.bottom,closeTop:x.top,gap:document.querySelector('#topgap').hidden?0:gap.bottom,page:document.documentElement.scrollWidth,vh:innerHeight}});
    await page.waitForTimeout(1200);await page.screenshot({path:`build/shots/levelup-${name}.png`});
    ok(`levelup: the card fits a ${name} screen`,r.l>=0&&r.r<=w&&r.page<=w&&r.closeTop>=r.gap&&r.b<=r.vh+1&&!errs.length,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
}
