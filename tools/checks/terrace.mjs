// The roof terrace and its spotters (docs/specs/terminal-place.md): a Terminal upgrade from level 3, hidden before; seen on
// the roof at every zoom; a crowd for something rare and nothing else to say so; fewer at night and in rain; never in the
// terminal's queues; small takings; its card fits a phone. Written before the code (tools/checks/pending.txt). Reads the
// names in lib/place.mjs, plus UPG.terrace and G.lv.terrace, R.spot (how many spotters are up there), R.spotDrawn (how many
// the last frame drew), terraceBox() → [x0, y0, x1, y1], its takings earned as 'terrace' (G.revBy.terrace), and its card,
// #terrace, under Terminal › Staff.
import {tp} from './lib/place.mjs';
export default async function({open,ok,saveText}){
  let had;
  // hidden at level 1; at level 3 the upgrade shows; once bought, the card, the terrace and its spotters
  {const {ctx,page,errs}=await open({width:1440,height:900},saveText('v29-L1.json'),false,{still:true});await tp(page);
  const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,TP=window.TP,q=s=>document.querySelector(s);
    const look=()=>{const o={up:false,card:false};for(const sub of ['dep','arr','staff']){R.tSub=sub;S.setTab('terminal');if(q('[data-buy="terrace"]'))o.up=true;if(q('#terrace'))o.card=true}
      o.box=!!(S.terraceBox&&S.terraceBox());TP.sim(30,0.1);o.spot=R.spot||0;return o};
    const l1=look();G.level=Math.max(G.level,3);const l3=look();const had=!!S.UPG.terrace;if(had)G.lv.terrace=1;TP.day(14);const bought=look();
    return {l1,l3,bought,had}});
  had=r.had;
  ok('terrace: hidden until it can be built',!r.l1.up&&!r.l1.card&&!r.l1.box&&!r.l1.spot&&r.l3.up&&!r.l3.card&&r.bought.card&&r.bought.box&&r.bought.spot>0&&!errs.length,
    `${r.had?'':'no UPG.terrace yet; '}level 1 ${JSON.stringify(r.l1)}, level 3 ${JSON.stringify(r.l3)}, bought ${JSON.stringify(r.bought)}`+(errs.length?' '+errs[0]:''));
  await ctx.close()}
  // on the roof at every zoom: the terrace's middle looks different with it and without it, zoomed out and at 1.6x
  // (a level 9 airport, opened only once the terrace exists, or with TP_ALL=1)
  if(!had&&!process.env.TP_ALL){const none='no UPG.terrace yet';for(const n of ['seen at every zoom','spotters crowd for something rare','fewer at night and in rain','the crowd is the only sign','spotters stay on the roof','small takings'])ok('terrace: '+n,false,none)}
  else{const {ctx,page,errs}=await open({width:1440,height:900},saveText('v29-L9.json'),false,{still:true});await tp(page);
  const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,TP=window.TP,c=document.querySelector('#cv').getContext('2d');if(!S.terraceBox||!S.UPG.terrace)return null;
    G.lv.terrace=1;TP.day(12);S.setView('airport');R.floor='roof';const [x0,y0,x1,y1]=S.terraceBox(),x=(x0+x1)/2,y=(y0+y1)/2;
    const px=()=>{S.draw();const k=S.viewK()*R.dpr,d=c.getImageData(Math.round((x-R.cam.x)*k),Math.round((y-R.cam.y)*k),1,1).data;return d[0]+','+d[1]+','+d[2]};
    const both=z=>{if(z<1){R.cam.z=z;S.clampCam();S.clampCam()}else TP.look(x,y,z);G.lv.terrace=1;const a=px();G.lv.terrace=0;const b=px();G.lv.terrace=1;return [a,b]};
    const out=both(0.01),zin=both(1.6);R.floor='halls';return {out,zin}});
  ok('terrace: seen at every zoom',!!r&&r.out[0]!==r.out[1]&&r.zin[0]!==r.zin[1]&&!errs.length,r?`zoomed out ${r.out[0]} with it, ${r.out[1]} without; at 1.6x ${r.zin[0]} and ${r.zin[1]}`:'no terraceBox() or UPG.terrace yet');
  // then spotters through an afternoon, played once the terrace exists (TP_ALL=1 plays it anyway): a rare arrival (the
  // biggest type) and an ordinary one; the night and the rain; queues, drawing and takings
  {const r=await page.evaluate(all=>{const S=__sim,G=S.G,R=S.R,TP=window.TP;if(!S.UPG.terrace&&!all)return null;G.lv.terrace=1;
    const spot=()=>R.spot||0,dry=()=>{for(const k of ['rain','storm','snow'])R.fx[k]=0};
    const seats=a=>a.rows*a.blocks.reduce((x,y)=>x+y,0),big=S.AIRCRAFT.filter(a=>!a.freighter).reduce((a,b)=>seats(b)>seats(a)?b:a);
    const find=()=>S.SIDX.map(i=>R.st[i].F).find(F=>F&&!F.landed),next=()=>{let F=find(),n=0;while(!F&&n++<600){dry();R.sim=true;S.update(0.1);R.sim=false;F=find()}return F}; // the next flight still to land
    const land=F=>{let n=0;while(F&&!F.landed&&n++<600){dry();S.R.sim=true;S.update(0.1);S.R.sim=false}return !!(F&&F.landed)};
    const toasts0=R.toasts.length,said=()=>R.toasts.slice(toasts0).filter(t=>/spott|terrace|enthusiast/i.test(t.text)||t.text.includes(big.short)).length;
    // the night
    TP.day(1.5);dry();TP.sim(30,0.1);const night=spot();
    // a rare arrival at about 14:00, then back to normal, then an ordinary one
    TP.day(13.5);dry();TP.sim(20,0.1,dry);const before=spot();let F=next();if(F)F.ac=big;const landedRare=land(F);TP.sim(30,0.1,dry);const rare=spot();
    let back=Infinity;for(let m=0;m<150;m+=10){TP.sim(10,0.1,dry);back=Math.min(back,Math.abs(spot()-before))}const saidRare=said();
    const before2=spot();const F2=next();const landedOrd=land(F2);TP.sim(30,0.1,dry);const ord=spot();
    // rain against dry at 14:00
    TP.day(14);dry();TP.sim(30,0.1,dry);const dryN=spot();TP.sim(30,0.1,()=>{R.fx.rain=G.clock+60});const rainN=spot();dry();
    // three busy hours: nobody in a queue is a spotter; the drawing shows at most 40; the takings against the income
    const e0=G.earned,t0=G.revBy.terrace||0;let queued=0;TP.day(12);TP.sim(180,0.1,()=>{for(const Q of [R.ciQ,R.secQ,R.ftQ,R.arrQ])for(const p of Q)if(p&&p.spotter)queued++});
    const take=(G.revBy.terrace||0)-t0,income=G.earned-e0;S.setView('airport');R.floor='roof';S.draw();const drawn=R.spotDrawn;R.floor='halls';
    return {night,before,rare,back,landedRare,saidRare,before2,ord,landedOrd,dryN,rainN,queued,drawn,take,income,big:big.short}},!!process.env.TP_ALL);
  const has=!!r&&r.rare>0,none='no UPG.terrace yet';
  ok('terrace: spotters crowd for something rare',has&&r.landedRare&&r.rare>=12&&r.rare>=3*r.before&&r.landedOrd&&Math.abs(r.ord-r.before2)<=0.2*Math.max(1,r.before2)&&r.back<=0.2*Math.max(1,r.before)&&!errs.length,
    r?`${r.landedRare?'':'the rare arrival never landed; '}${r.landedOrd?'':'the ordinary one never landed; '}${r.before} before the ${r.big}, ${r.rare} after it (12 or more, and three times before); ${r.before2} before an ordinary one, ${r.ord} after (within 20%); back to within ${r.back===Infinity?'-':r.back} of before in three hours`:none);
  ok('terrace: fewer at night and in rain',has&&r.night<=2&&r.dryN>0&&r.rainN<=r.dryN/2,r?`${r.night} at 02:00 (2 or fewer); at 14:00 ${r.dryN} dry, ${r.rainN} in rain (half or fewer)`:none);
  ok('terrace: the crowd is the only sign',has&&r.rare>r.before&&!r.saidRare,r?`${r.saidRare} toasts about spotters or the ${r.big}; the crowd went from ${r.before} to ${r.rare}`:none);
  ok('terrace: spotters stay on the roof',has&&!r.queued&&r.drawn!=null&&r.drawn<=40,r?`${r.queued} spotters in the terminal's queues over three hours, ${r.drawn==null?'no R.spotDrawn':r.drawn+' drawn'} (40 or fewer)`:none);
  ok('terrace: small takings',has&&r.take>0&&r.take<=0.02*r.income,r?`${Math.round(r.take)} from the terrace of ${Math.round(r.income)} earned over three hours (${r.income?(r.take/r.income*100).toFixed(2):0}%, 2% or less)`:none);
  }await ctx.close()}
  // its card under Terminal › Staff fits the smallest phones
  {const res=[],{ctx,page,errs}=await open({width:320,height:568},saveText('v29-L9.json'),true);for(const vp of [{width:320,height:568},{width:390,height:844}]){await page.setViewportSize(vp);await page.waitForTimeout(150);
    const r=await page.evaluate(()=>{const S=__sim;S.G.lv.terrace=1;S.R.tSub='staff';S.setTab('terminal');const W=document.documentElement.clientWidth;
      const over=[...document.querySelectorAll('#panel *')].filter(e=>{const b=e.getBoundingClientRect();return b.width&&(b.right>W+1||b.left<-1)}).slice(0,2).map(e=>e.id||String(e.className));
      return {card:!!document.querySelector('#terrace'),over}});
    res.push(`${vp.width}px: ${r.card?'card':'no card'}${r.over.length?', overflow '+r.over.join(' '):''}`+(errs.length?' '+errs[0]:''));if(!r.card||r.over.length||errs.length)res.bad=true}await ctx.close();
  ok('terrace: its card fits a phone',!res.bad,res.join('; '))}
}
