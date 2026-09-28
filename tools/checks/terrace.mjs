// The roof terrace (docs/specs/terminal-place.md): a Terminal upgrade from level 3, hidden before; on the Roof at every
// zoom and on no other floor; waiting passengers go up and come down when their gate is called, dawdlers run down the
// stairs; a steady handful of spotters, more for a famous face; fewer at night and in rain, and closed to passengers in the
// wet; nothing but the crowd to say so; spotters never in the terminal's queues; small takings; its own line in the
// rating; its card fits a phone. Written before the code (tools/checks/pending.txt). Reads the names in lib/place.mjs,
// plus UPG.terrace and G.lv.terrace; the terrace room 'ter' (hallId('ter'), fl 2) and its floor links ('ter' at one end,
// 'stairs' or 'lift'); R.spot (the public side's spotters), R.spotDrawn (how many the last frame drew); terraceBox() →
// [x0, y0, x1, y1]; the café's and the public side's takings earned as 'shops' and 'landside' by the terrace's own
// functions (named terrace… or ter…, which is how the two are told from the rest); REPLBL.terrace and the rating cause
// 'terrace'; R.famous.p, the celebrity; a dawdler's marks from late runners (p.late, runsOf(F).daw); and its card, #terrace,
// under Terminal › Staff.
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
  const play=had||!!process.env.TP_ALL,none='no UPG.terrace yet'; // the plays take seconds, so they wait for the terrace (TP_ALL=1 plays them anyway)
  // one seeded day at level 9 with the terrace bought, from midnight to midnight: 0.1-minute steps from 12:00 through the
  // rain, where everything is measured, and 0.25 before and after. In order: the night at 02:00; passengers going up and coming down,
  // 12:00-14:00, dry; the Roof and the other floors drawn at 14:00; dry against rain; a steady handful through the biggest
  // arrival and an ordinary one; three terrace passengers made dawdlers with their final call brought forward; and over
  // the whole day the takings, the rating and the queues
  const names=['on the Roof at every zoom, and only there','waiting passengers go up and come down','runners come down in time, or the story says why','a steady handful of spotters',
    'fewer at night and in rain, and closed to passengers in the wet','spotters stay on the roof','small takings','its own line in the rating'];
  if(!play)for(const n of names)ok('terrace: '+n,false,none);
  else{const {ctx,page,errs}=await open({width:1440,height:900},saveText('v29-L9.json'),false,{still:true});await tp(page);
  const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,TP=window.TP,c=document.querySelector('#cv').getContext('2d'),out={};
    const ter=S.hallId('ter'),inTer=p=>ter!=null&&p.room===ter,spot=()=>R.spot||0,dry=()=>{for(const k of ['rain','storm','snow'])R.fx[k]=0};
    // spotters in the terminal's queues, looked for each minute over three busy hours (12:00-15:00)
    let each=dry,queued=0,qn=0;const watch=()=>{const h=G.clock-d0;if(h<720||h>=900||Math.floor(G.clock)===qn)return;qn=Math.floor(G.clock);for(const Q of [R.ciQ,R.secQ,R.ftQ,R.arrQ])for(const p of Q)if(p&&p.spotter)queued++};
    const step=(min,dt=0.1)=>{R.sim=true;const n=Math.round(min/dt);for(let i=0;i<n;i++){S.update(dt);each();watch()}R.sim=false};
    // the café's and the public side's takings: earnings in 'shops' and 'landside' made from inside the terrace's functions
    const take={shops:0,landside:0};G.revBy=new Proxy(G.revBy,{set(o,k,v){if((k==='shops'||k==='landside')&&v>(o[k]||0)&&/at (?:\S+\.)?(?:terrace\w*|ter[A-Z]\w*) /.test(new Error().stack))take[k]+=v-(o[k]||0);o[k]=v;return true}});
    G.lv.terrace=1;G.clock=(Math.floor(G.clock/1440)+1)*1440;const d0=G.clock,e0=G.earned,w0=(R.repWhy||{}).terrace||0;dry();
    // the night
    step(120,0.25);out.night=spot();
    // 02:00-12:00, then two dry hours of passengers going up and coming down: who reaches the terrace, each change of floor
    // to or from it and how far from its links, and anyone still up ten minutes after their gate was called who isn't a runner
    step(600,0.25);
    {const links=TP.terLinks(),fl=new Map(),up=new Set(),left=new Set();let changes=0,far=0,worst=0,k=0;
      each=()=>{dry();for(const p of R.pax){const f=TP.paxFl(p),o=fl.get(p);if(inTer(p))up.add(p);
          if(o!=null&&f!=null&&f!==o&&(f===2||o===2)){changes++;const [d]=TP.nearLink(p.x,p.y,links);if(d>12){far++;worst=Math.max(worst,Math.min(d,9999))}}if(f!=null)fl.set(p,f)}
        if(++k%10)return;for(const p of R.pax){const F=p.F;if(inTer(p)&&F&&F.called!=null&&G.clock-F.called>10&&!p.late&&!S.taleOf(p)?.run)left.add(p)}};
      step(120);each=dry;out.go={up:up.size,changes,far,worst:Math.round(worst),left:left.size,links:links.length,ter:ter!=null}}
    // at 14:00, the Roof zoomed out and at 1.6x, with the terrace and without; then the two floors of halls, and whether any
    // passenger in the terrace is drawn on them
    S.setView('airport');
    {const box=S.terraceBox&&S.terraceBox();if(box){const [x0,y0,x1,y1]=box,x=(x0+x1)/2,y=(y0+y1)/2;R.floor='roof';
      const px=()=>{S.draw();const k=S.viewK()*R.dpr,d=c.getImageData(Math.round((x-R.cam.x)*k),Math.round((y-R.cam.y)*k),1,1).data;return d[0]+','+d[1]+','+d[2]};
      const both=z=>{if(z<1){R.cam.z=z;S.clampCam();S.clampCam()}else TP.look(x,y,z);G.lv.terrace=1;const a=px();G.lv.terrace=0;const b=px();G.lv.terrace=1;return [a,b]};
      out.zoom={out:both(0.01),zin:both(1.6)};R.spotDrawn=null;S.draw();out.drawnSpot=R.spotDrawn}
      const up=R.pax.filter(inTer);out.floors={n:up.length};TP.look(...TP.termMid(),1);
      for(const f of ['up','down']){R.floor=f;S.draw();const seen=TP.drawn();out.floors[f]=up.filter(p=>p.ex!=null&&seen.some(s=>Math.abs(s.at[0]-p.ex)<0.01&&Math.abs(s.at[1]-p.ey)<0.01)).length}R.floor='up'}
    // dry against rain at 14:00, after two dry hours: the spotters and the passengers up, then 30 minutes of rain: the
    // passengers up after 20 minutes and the spotters after 30; then 20 dry minutes to settle
    {out.dryN=spot();out.dryUp=R.pax.filter(inTer).length;each=()=>{R.fx.rain=G.clock+60};step(20);out.rainUp=R.pax.filter(inTer).length;step(10);out.rainN=spot();each=dry;step(20)}
    // a steady handful: the next flight to land made the biggest type, then an ordinary one; the spotters every minute
    // from before the first until 30 minutes after the second
    {const seats=a=>a.rows*a.blocks.reduce((x,y)=>x+y,0),big=S.AIRCRAFT.filter(a=>!a.freighter).reduce((a,b)=>seats(b)>seats(a)?b:a);
      const find=()=>S.SIDX.map(i=>R.st[i].F).find(F=>F&&!F.landed),next=()=>{let F=find(),n=0;while(!F&&n++<60){step(1);F=find()}return F};
      const land=F=>{let n=0;while(F&&!F.landed&&n++<90)step(1);return !!(F&&F.landed)};
      let lo=Infinity,hi=0;each=()=>{dry();const s=spot();lo=Math.min(lo,s);hi=Math.max(hi,s)};
      const before=spot();let F=next();if(F)F.ac=big;const landedBig=land(F);step(30);const afterBig=spot();
      const before2=spot();const F2=next();const landedOrd=land(F2);step(30);const afterOrd=spot();each=dry;
      out.steady={before,afterBig,before2,afterOrd,landedBig,landedOrd,lo,hi,big:big.short}}
    // three passengers on the terrace made dawdlers, their flights' final call brought forward: the floor link each takes
    // down, whether they board, and the last line of their story
    {const pick=R.pax.filter(p=>inTer(p)&&p.F&&!p.inbound&&!p.late&&R.st[p.F.i]&&R.st[p.F.i].F===p.F&&['turnaround','boarding'].includes(p.F.plane.state)).sort((a,b)=>a.F.std-b.F.std).slice(0,3);
      const links=TP.allLinks(),fl=new Map(pick.map(p=>[p,TP.paxFl(p)])),via=new Map();
      for(const p of pick){TP.dawdler(p);TP.hurry(p.F)}
      each=()=>{dry();for(const p of pick){const f=TP.paxFl(p);if(f!=null&&fl.get(p)!=null&&f!==fl.get(p)){const [,k]=TP.nearLink(p.x,p.y,links);(via.get(p)||via.set(p,[]).get(p)).push(k)}if(f!=null)fl.set(p,f)}};
      step(45);each=dry;
      out.run=pick.map(p=>{const L=S.taleLines(p),last=L.length?L[L.length-1][1]:'';return {fl:p.F.code+p.F.no,via:via.get(p)||[],ran:(S.taleOf(p)?.run||0)>=1,boarded:TP.boarded(p),last}})}
    // the rest of the day
    step(d0+1440-G.clock,0.25);
    out.queued=queued;out.income=G.earned-e0;out.take=take;out.rep=((R.repWhy||{}).terrace||0)-w0;out.label=S.REPLBL.terrace||null;return out});
  const e=errs.length?' '+errs[0]:'';
  const z=r.zoom,f=r.floors;
  ok('terrace: on the Roof at every zoom, and only there',!!z&&z.out[0]!==z.out[1]&&z.zin[0]!==z.zin[1]&&f.n>0&&f.up===0&&f.down===0&&!errs.length,
    `${z?`on the Roof zoomed out ${z.out[0]} with it, ${z.out[1]} without; at 1.6x ${z.zin[0]} and ${z.zin[1]}`:'no terraceBox() yet'}; ${f.n} passengers on the terrace, drawn on Departures ${f.up}, on Arrivals ${f.down} (none)`+e);
  const g=r.go;
  ok('terrace: waiting passengers go up and come down',g.up>=10&&!g.far&&!g.left&&!errs.length,`${g.ter?'':'no terrace room yet; '}${g.up} went up between 12:00 and 14:00 (10 or more); ${g.changes} changes of floor to or from it, ${g.far} more than 12 from its ${g.links} links (worst ${g.far?g.worst:'-'}); ${g.left} still up ten minutes after their gate was called`+e);
  ok('terrace: runners come down in time, or the story says why',r.run.length===3&&r.run.every(x=>x.ran&&!x.via.includes('lift')&&(x.boarded||/roof/i.test(x.last))),
    r.run.length?r.run.map(x=>`${x.fl}: ${x.ran?'ran':'never ran'}, down by ${x.via.join(', ')||'nothing'}, ${x.boarded?'boarded':'missed'}, "${x.last}"`).join('; '):'nobody on the terrace to make a dawdler');
  const s=r.steady,near=(a,b)=>Math.abs(a-b)<=Math.max(1,0.2*b);
  ok('terrace: a steady handful of spotters',s.landedBig&&s.landedOrd&&s.lo>=2&&s.hi<=12&&near(s.afterBig,s.before)&&near(s.afterOrd,s.before2),
    `${s.landedBig?'':'the '+s.big+' never landed; '}${s.landedOrd?'':'the ordinary one never landed; '}${s.before} before the ${s.big}, ${s.afterBig} 30 min after; ${s.before2} before an ordinary one, ${s.afterOrd} after (each within 20%); between ${s.lo===Infinity?'-':s.lo} and ${s.hi} throughout (2 to 12)`);
  ok('terrace: fewer at night and in rain, and closed to passengers in the wet',r.night<=2&&r.dryN>0&&r.rainN<=r.dryN/2&&r.dryUp>0&&r.rainUp===0,
    `${r.night} spotters at 02:00 (2 or fewer); ${r.dryN} dry, ${r.rainN} in rain (half or fewer); passengers up ${r.dryUp} dry (some), ${r.rainUp} after 20 min of rain (none)`);
  ok('terrace: spotters stay on the roof',r.queued===0&&r.drawnSpot!=null&&r.drawnSpot<=40,`${r.queued} spotters in the terminal's queues over three hours, ${r.drawnSpot==null?'no R.spotDrawn':r.drawnSpot+' drawn'} (40 or fewer)`);
  const t=r.take.shops+r.take.landside;
  ok('terrace: small takings',r.take.shops>0&&r.take.landside>0&&t<=0.02*r.income,`café ${Math.round(r.take.shops)}, public side ${Math.round(r.take.landside)} (each above 0), together ${(t/r.income*100).toFixed(2)}% of the day's ${Math.round(r.income)} (2% or less)`);
  ok('terrace: its own line in the rating',!!r.label&&r.rep>0&&r.rep<=0.4,`label ${r.label?'"'+r.label+'"':'none'}; the day's rating from the terrace ${r.rep.toFixed(3)} (above 0, at most +0.4)`);
  await ctx.close()}
  // a famous face on the terrace: famous faces' level 5 save with the terrace bought, the celebrity booked on a flight whose
  // gate call is 90 minutes off (caused) and waiting airside; played with toasts and the board on for an hour. Their room,
  // the spotters before and while they're up, and every toast and board line about the terrace or its crowd
  if(!play){ok('terrace: a famous face goes up, and the fans follow',false,none);ok('terrace: the crowd is the only sign',false,none)}
  else{const {ctx,page,errs}=await open({width:1440,height:900},saveText('v32-L5.json'),false,{still:true});await tp(page);
  const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,TP=window.TP,ter=S.hallId('ter'),inTer=p=>ter!=null&&p.room===ter,dry=()=>{for(const k of ['rain','storm','snow'])R.fx[k]=0};
    G.lv.terrace=1;G.clock=(Math.floor(G.clock/1440)+1)*1440+9*60;dry();TP.sim(30,0.1,dry);
    // the celebrity's flight: gates called as boarding starts (Office › Policies › Gate calls at 45, no duty manager), a
    // flight still deplaning with passengers waiting airside, and once it turns round a longer clean, so its gate call is
    // 90 minutes off. Played on in quarter minutes until there is one
    G.set.autoDuty=false;(G.pol||(G.pol={})).gates=45;
    const air=p=>(p.state==='mkt'||p.state==='shop')&&!p.inbound&&!p.kid&&!p.leader,find=()=>S.SIDX.map(i=>R.st[i].F).find(F=>F&&!F.freighter&&F.booked&&F.called==null&&F.plane.state==='deplaning'&&R.pax.some(p=>p.F===F&&air(p)));
    let F=find(),n=0;while(!F&&n++<36){TP.sim(5,0.25,dry);F=find()}if(!F)return {none:true};
    n=0;while(F.plane.state==='deplaning'&&n++<600)TP.sim(0.1,0.1,dry);if(F.plane.state!=='turnaround'||F.called!=null||!R.pax.some(p=>p.F===F&&air(p)))return {none:true,why:`${F.code}${F.no} ${F.plane.state}${F.called!=null?', called':''}`};
    F.plane.t=90;
    const before=R.spot||0,out=Math.round(S.callAt(F)-G.clock);G.famous.v={d:G.day,t:G.clock,who:'Lena Wrenfield',kind:'pop star',st:0,flt:F.code+F.no};TP.sim(1.1,0.1,dry);
    const f=R.famous;if(!f)return {none:true,why:'no R.famous'};if(!air(f.p))f.p=R.pax.find(p=>p.F===F&&air(p));const p=f.p;
    const told=[],heard=new Set(),hear=()=>{for(const t of R.toasts)if(!heard.has(t)){heard.add(t);told.push(t.text)}}; // read each step, as the list can be replaced
    const q=s=>document.querySelector(s),board=()=>['#brows','#ffLine','#bann'].map(s=>q(s)?q(s).textContent:'').join(' '),says=x=>/terrace|roof|spotter/i.test(x);
    let reached=false,upAtCall=null,maxUp=0,lines=0,said=[];R.sim=false;
    for(let k=0;k<600;k++){dry();S.update(0.1);hear();const u=inTer(p);if(u){reached=true;maxUp=Math.max(maxUp,R.spot||0)}if(F.called!=null&&upAtCall==null)upAtCall=u;
      if(k%10===9){S.updateBoard();S.famousLine();const b=board();lines++;if(says(b))said.push('board: '+b.slice(0,80))}}
    said.push(...told.filter(says).map(x=>'toast: '+x));
    return {out,flt:F.code+F.no,before,maxUp,reached,upNow:inTer(p),upAtCall,called:F.called!=null,said,toasts:told.length,lines}});
  const e=errs.length?' '+errs[0]:'';
  ok('terrace: a famous face goes up, and the fans follow',!r.none&&r.reached&&!r.upNow&&r.upAtCall!==true&&r.maxUp-r.before>=12&&!errs.length,
    r.none?'no flight deplaning with passengers airside'+(r.why?': '+r.why:''):`${r.flt}, its gate call ${r.out} min off: ${r.reached?'went up':'never went up'}, ${r.upNow?'still up an hour later':'down an hour later'}${r.called?`, ${r.upAtCall?'up':'down'} when the gate was called`:''}; spotters ${r.before} before, ${r.maxUp} at most while up (12 more or better)`+e);
  ok('terrace: the crowd is the only sign',!r.none&&r.reached&&!r.said.length,r.none?'no famous face':`${r.reached?'':'nobody went up; '}${r.said.length} toasts or board lines about the terrace or its crowd (of ${r.toasts} toasts and ${r.lines} looks at the board)${r.said.length?': '+r.said.slice(0,2).join(' | '):''}`);
  await ctx.close()}
  // its card under Terminal › Staff fits the smallest phones
  {const res=[],{ctx,page,errs}=await open({width:320,height:568},saveText('v29-L9.json'),true);for(const vp of [{width:320,height:568},{width:390,height:844}]){await page.setViewportSize(vp);await page.waitForTimeout(150);
    const r=await page.evaluate(()=>{const S=__sim;S.G.lv.terrace=1;S.R.tSub='staff';S.setTab('terminal');const W=document.documentElement.clientWidth;
      const over=[...document.querySelectorAll('#panel *')].filter(e=>{const b=e.getBoundingClientRect();return b.width&&(b.right>W+1||b.left<-1)}).slice(0,2).map(e=>e.id||String(e.className));
      return {card:!!document.querySelector('#terrace'),over}});
    res.push(`${vp.width}px: ${r.card?'card':'no card'}${r.over.length?', overflow '+r.over.join(' '):''}`+(errs.length?' '+errs[0]:''));if(!r.card||r.over.length||errs.length)res.bad=true}await ctx.close();
  ok('terrace: its card fits a phone',!res.bad,res.join('; '))}
}
