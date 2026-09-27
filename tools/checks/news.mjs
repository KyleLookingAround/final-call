// What's new opens once for an older save and not again, never for a new game, and from Settings with every version.
// It waits for the page's state (R.newsBoot), not set times.

export default async function({open,ok,saveText,saves,newest,HIST_TOP}){
  // an older save opens the card on load; after closing it, a reload doesn't. The newest save is marked as last
  // seeing the version before the newest, whenever it was made
  const older=JSON.stringify({...JSON.parse(saveText(newest)),seen:HIST_TOP-1});
  // each step waits for the page's state rather than a set time, as a full run can make the page slow to boot
  const booted=p=>p.waitForFunction(()=>window.__sim&&__sim.R.newsBoot&&__sim.R.newsBoot!=='due',null,{timeout:15000}).catch(()=>{});
  const shown=(p,on)=>p.waitForFunction(on=>!document.querySelector('#news').hidden===on,on,{timeout:15000}).catch(()=>{}); // judged below
  const {ctx,page,errs}=await open(undefined,older,false,{news:true});
  await booted(page);
  // every version newer than the save has seen opens as new (saves from before What's new count as version 21)
  const a=await page.evaluate(()=>({open:!document.querySelector('#news').hidden,fresh:document.querySelectorAll('#newsList details[open]').length,want:__sim.UPDATES.filter(u=>u.v>__sim.G.seen).length,all:document.querySelectorAll('#newsList details').length}));
  if(a.open){await page.click('#news [data-newsclose]');await shown(page,false)}
  await page.reload();await booted(page);
  const b=await page.evaluate(()=>!document.querySelector('#news').hidden||__sim.R.newsBoot==='shown');
  await page.evaluate(()=>{__sim.R.oSub='settings';__sim.setTab('office')});await page.click('[data-news]');await shown(page,true);
  const c=await page.evaluate(()=>({open:!document.querySelector('#news').hidden,all:document.querySelectorAll('#newsList details').length}));
  ok('news: opens once after an update, and from Settings with every version',a.open&&a.fresh===a.want&&!b&&c.open&&c.all===a.all&&!errs.length,JSON.stringify({first:a,again:b,settings:c})+(errs.length?' '+errs[0]:''));
  await ctx.close();
  const n=await open(undefined,null,false,{news:true});
  await booted(n.page);
  const d=await n.page.evaluate(()=>!document.querySelector('#news').hidden||__sim.R.newsBoot==='shown');
  ok('news: a new game starts with the guided start, not What\'s new',!d&&!n.errs.length,d?'opened':'');
  await n.ctx.close();
}
