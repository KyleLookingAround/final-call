// The Ko-fi link (docs/specs/kofi-link.md): a quiet link to https://ko-fi.com/kylemck in What's new, Settings and the
// level-up card, nowhere else (not the airport view, the board or the goal bar), and it doesn't stop the level-up
// card fitting a 320 px phone.
const want=el=>el&&{href:el.getAttribute('href'),target:el.target,rel:el.getAttribute('rel'),visible:el.offsetWidth>0&&el.offsetHeight>0};
const isKofi=r=>r&&r.href==='https://ko-fi.com/kylemck'&&r.target==='_blank'&&r.rel==='noopener'&&r.visible;

export default async function({open,ok}){
  {const {ctx,page,errs}=await open(undefined,null,false,{still:true});
    await page.evaluate(()=>{__sim.G.tour={done:1}});

    const none=await page.evaluate(()=>[...document.querySelectorAll('.kofi')].some(el=>el.offsetWidth>0&&el.offsetHeight>0));
    ok('kofi: not on the airport view',!none,String(none));

    const news=await page.evaluate(()=>{const S=__sim;S.openNews(true,false);
      const el=document.querySelector('#news .kofi'),r=el&&{href:el.getAttribute('href'),target:el.target,rel:el.getAttribute('rel'),visible:el.offsetWidth>0&&el.offsetHeight>0};
      S.openNews(false);return r});
    ok("kofi: in What's new",isKofi(news),JSON.stringify(news));

    const settings=await page.evaluate(()=>{const S=__sim;S.R.oSub='settings';S.setTab('office');
      const el=document.querySelector('#panel .kofi'),reset=document.querySelector('#panel #reset'),r=el&&{href:el.getAttribute('href'),target:el.target,rel:el.getAttribute('rel'),visible:el.offsetWidth>0&&el.offsetHeight>0,
        afterReset:!!(reset&&el.compareDocumentPosition(reset)&Node.DOCUMENT_POSITION_PRECEDING)};
      S.setTab('stands');return r});
    ok('kofi: in Settings, under Your save',isKofi(settings)&&settings.afterReset,JSON.stringify(settings));

    const lvl=await page.evaluate(()=>{const S=__sim;S.R.lvlCard={from:3,to:5};S.lvlTick();
      const list=document.querySelector('#lvlList'),el=list.querySelector('.kofi'),r=el&&{href:el.getAttribute('href'),target:el.target,rel:el.getAttribute('rel'),visible:el.offsetWidth>0&&el.offsetHeight>0,
        last:list.lastElementChild===el.closest('.kofifoot')};
      S.lvlCardOpen(false);return r});
    ok('kofi: in the level-up card, under the unlocks and never above them',isKofi(lvl)&&lvl.last,JSON.stringify(lvl));

    if(errs.length)ok('kofi: no page errors',false,errs[0]);
    await ctx.close();}

  // the level-up card still fits a 320 px phone with the line added
  {const {ctx,page,errs}=await open({width:320,height:640},null,true,{still:true});
    await page.evaluate(()=>{try{localStorage.setItem('final-call-topgap','medium')}catch(e){};if(typeof applyGap==='function')applyGap()});
    const r=await page.evaluate(()=>{const S=__sim;S.G.tour={done:1};document.querySelector('#coach').hidden=true;document.querySelector('#spot').hidden=true;S.R.lvlCard={from:3,to:5};S.lvlTick();
      const c=document.querySelector('#lvlup .lvcard').getBoundingClientRect();return {l:c.left,r:c.right,page:document.documentElement.scrollWidth}});
    ok('kofi: the level-up card still fits a 320 px phone',r.l>=0&&r.r<=320&&r.page<=320&&!errs.length,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    await ctx.close();}
}
