// "The terminal as a place" (docs/specs/terminal-place.md): each layout's own terminal table, floors on rooms and doorways,
// the floor chip, each layout's floor plan, and the scene checks the bundle adds (nothing drawn inside a hall under the roof,
// one floor at a time, and how fast the terminal draws zoomed in). Written before the code: tools/checks/pending.txt lists
// the checks still waiting for it. The names they read are in lib/place.mjs, plus hallLabel(id) → [x, y], where a hall's
// name is drawn (tapping it goes to that hall's floor).
import {tp,DEP_HALLS,ARR_HALLS,AWAY} from './lib/place.mjs';
const LAYOUT_IDS=['classic','remote','stagger','curve','hall','sat','star','round','mid'];
// drawing speed zoomed in on the terminal, against calibration; main's median of three on 27 Sep 2026 (Classic desktop,
// Midfield desktop, Midfield phone) set the budget at 1.5 times it, as the spec asks
const ZOOM_MAIN={'Classic, desktop':0.22,'Midfield, desktop':0.252,'Midfield, phone':0.208},ZOOM_BUDGET=1.5;
const CAL=()=>{const t=performance.now(),a=[];for(let i=0;i<2e5;i++)a.push({x:i%97,y:i%89});a.sort((p,q)=>p.x-q.x||p.y-q.y);let s=0;for(const p of a)s+=Math.hypot(p.x,p.y);return performance.now()-t+s*0};
// the floor chip: Roof, Departures and Arrivals in the airport view at every zoom, not in the region view, inside the canvas
// and clear of the camera band and the sheet's handle; each stop sets R.floor
const CHIP=()=>{const S=__sim,R=S.R,TP=window.TP,q=s=>document.querySelector(s);
      const rect=e=>{const b=e&&e.getBoundingClientRect();return b&&b.width?b:null},hit=(a,b)=>a&&b&&a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;
      const look=()=>{S.renderCam();const cv=rect(q('#cv')),bs=[...document.querySelectorAll('#cam [data-floor]')].filter(b=>rect(b)&&getComputedStyle(b).visibility!=='hidden');
        return {stops:bs.map(b=>b.dataset.floor),inside:bs.every(b=>{const x=rect(b);return cv&&x.left>=cv.left-1&&x.right<=cv.right+1&&x.top>=cv.top-1&&x.bottom<=cv.bottom+1}),
          clear:bs.every(b=>!hit(rect(b),rect(q('#topgap')))&&!hit(rect(b),rect(q('#grip'))))}};
      S.setView('airport');R.cam.z=0.01;S.clampCam();S.clampCam();const out=look();const [mx,my]=TP.termMid();TP.look(mx,my,1.6);const zin=look();
      const set={};for(const f of ['roof','up','down']){const b=q(`#cam [data-floor="${f}"]`);if(b){b.click();set[f]=R.floor}}
      S.setView('region');const away=look();S.setView('airport');return {out,zin,away:away.stops,set}};
const chipSays=(w,r,errs)=>{const want=['roof','up','down'],has=s=>want.every(f=>s.stops.includes(f));
  return [has(r.out)&&has(r.zin)&&r.out.inside&&r.zin.inside&&r.out.clear&&r.zin.clear&&!r.away.length&&want.every(f=>r.set[f]===f)&&!errs.length,
    `${w}px: stops ${JSON.stringify(r.out.stops)} zoomed out, ${JSON.stringify(r.zin.stops)} in, ${r.away.length} in the region, sets ${JSON.stringify(r.set)}${r.out.inside&&r.zin.inside?'':', outside the canvas'}${r.out.clear&&r.zin.clear?'':', under the camera band or handle'}`+(errs.length?' '+errs[0]:'')]};
export default async function({open,ok,saveText,saves,newest}){
  // every layout in turn, fully built: its table, floors, building and ways through, and two hours of play
  let terms=false;const chip=[];
  {const {ctx,page,errs}=await open({width:1440,height:900},saveText(newest),false,{still:true});await tp(page);
  chip.push(chipSays(1440,await page.evaluate(CHIP),errs));
  const r=await page.evaluate(([ids,DEP,ARR,text])=>{const S=__sim,TP=window.TP,out={};
    // each layout from the save afresh: rebuilding twice in a row can stop the game today (#78)
    for(const id of ids){S.resetAll(JSON.parse(text));const G=S.G;S.switchLayout(id);TP.build();S.applyLayout(id);const L=S.LAYOUTS[id],T=L.term,o=out[id]={};
      // its terminal comes from its own table
      const own=new Set(L.rooms.map(r=>r.id)),merged=S.ROOMS.filter(r=>!own.has(r.id)).map(r=>r.id).sort();
      o.table=T?(merged.join()===T.halls.map(h=>h.id).sort().join()&&T.halls.every(h=>{const r=TP.room(h.id);return r&&JSON.stringify(r.poly)===JSON.stringify(h.poly)})):false;
      o.faults=S.layoutFaults(id).slice(0,2);S.applyLayout(id);
      // floors: a hall's is 0, 1, 2 (the roof terrace) or none; a doorway joins rooms that share a floor, or is a floor link
      const fl=k=>S.ROOMS[S.hallId(k)]&&S.ROOMS[S.hallId(k)].fl;
      o.badFl=S.ROOMS.filter(r=>r.fl!=null&&r.fl!==0&&r.fl!==1&&!(r.fl===2&&r.id==='ter')).map(r=>r.id);
      o.badDoor=TP.doors().filter(d=>!TP.anyLink(d)&&fl(d[0])!=null&&fl(d[1])!=null&&fl(d[0])!==fl(d[1])).map(d=>d[0]+'–'+d[1]);
      // halls inside the main building, clear of the airside rooms and the stands
      const halls=TP.halls().filter(r=>!r.open),air=L.rooms.filter(r=>!r.open).map(r=>r.poly);
      const standQ=S.SIDX.map(i=>[[-150,30],[150,30],[150,500],[-150,500]].map(([a,b])=>{const X=S.XF[i];return [X.ox+a*X.c-b*X.s,X.oy+a*X.s+b*X.c]}));
      o.outside=T&&T.outline?halls.filter(r=>{const [cx,cy]=TP.mid(r.poly);return r.poly.some(([x,y])=>!TP.inPoly(T.outline,x+(cx-x)*0.01,y+(cy-y)*0.01))}).map(r=>r.id):null;
      o.overlap=halls.filter(r=>air.some(P=>TP.overlap(r.poly,P)>1)||standQ.some(Q=>TP.overlap(r.poly,Q)>1)).map(r=>r.id);
      // no way from a departures hall to an arrivals hall but through the airside concourse (or out on the forecourt)
      const edges=TP.doors().map(d=>[d[0],d[1]]),through=new Set([...own,'out']),reach=new Set(DEP),todo=[...DEP];
      while(todo.length){const a=todo.pop();for(const [x,y] of edges)for(const [f,t] of [[x,y],[y,x]])if(f===a&&!reach.has(t)&&!through.has(t)){reach.add(t);todo.push(t)}}
      o.leak=ARR.filter(h=>reach.has(h));
      o.term=!!T}
    return out},[LAYOUT_IDS,DEP_HALLS,ARR_HALLS,saveText(newest)]);
  await ctx.close();
  // two hours of play in each layout, from a fresh page each (runtime state carries over between layouts in one page):
  // the halls each passenger goes through, in order; the walk from the forecourt to the gate; anyone stuck in one state for
  // 90 minutes. Only for layouts with their own table, as it takes a second or two each; TP_ALL=1 plays them all
  for(const id of LAYOUT_IDS){if(!r[id].term&&!process.env.TP_ALL){r[id].order={dep:0,arr:0,bad:0};r[id].stuck=0;r[id].walk=0;r[id].played=false;continue}
    const {ctx,page,errs}=await open({width:1440,height:900},saveText(newest),false,{still:true});await tp(page);
    Object.assign(r[id],await page.evaluate(([id,DEP,ARR,AWAY])=>{const S=__sim,R=S.R,TP=window.TP;S.switchLayout(id);TP.build();S.applyLayout(id);
      const outId=S.hallId('out'),seen=new Map(),walks=[];let t=0;
      TP.sim(120,0.25,()=>{t+=0.25;for(const p of R.pax){let s=seen.get(p);if(!s){s={st:p.state,since:t,halls:[],x:p.x,y:p.y,d:0,from:p.state==='walkIn'&&p.room===outId};seen.set(p,s)}
        if(p.state!==s.st){s.st=p.state;s.since=t}if(s.from&&s.d>=0){s.d+=Math.hypot(p.x-s.x,p.y-s.y);if(p.state==='gate'){walks.push(s.d);s.d=-1}}s.x=p.x;s.y=p.y;
        const h=p.room!=null&&S.ROOMS[p.room]?S.ROOMS[p.room].id:null;if(h&&(p.inbound?ARR:DEP).includes(h)&&s.halls.at(-1)!==h)s.halls.push(h);s.inb=p.inbound;if(p.inbound&&p.state==='toArr')s.off=1}});
      const live=new Set(R.pax);let bad=0,dep=0,arr=0,stuck=0;
      // a passenger seen from the start (off the bridge, or in from the forecourt) who reached the last hall passed every one, in order
      for(const [p,s] of seen){const want=s.inb?ARR:DEP,idx=s.halls.map(h=>want.indexOf(h));if(s.halls.length>1){s.inb?arr++:dep++;if(idx.some((v,k)=>k&&v<=idx[k-1]))bad++;
          else if((s.inb?s.off:s.from)&&s.halls.at(-1)===want.at(-1)&&s.halls.length!==want.length)bad++}
        if(live.has(p)&&t-s.since>90&&TP.stuck(p,AWAY))stuck++}
      return {order:{dep,arr,bad},stuck,walk:walks.length?walks.reduce((a,b)=>a+b,0)/walks.length:0,played:true}},[id,DEP_HALLS,ARR_HALLS,AWAY]));
    r[id].errs=errs.slice(0,1);await ctx.close()}
  terms=LAYOUT_IDS.every(id=>r[id].term);
  const all=LAYOUT_IDS.map(id=>[id,r[id]]);
  const noTable=all.filter(([,o])=>!o.table).map(([id])=>id),withTerm=noTable.length<LAYOUT_IDS.length;
  ok('plans: every layout\'s terminal comes from its own table',!noTable.length&&all.every(([,o])=>!o.faults.length)&&!errs.length,(errs.length?errs[0]+'; ':'')+
    (noTable.length?`no term table of its own: ${noTable.join(' ')}`:all.filter(([,o])=>o.faults.length).map(([id,o])=>id+': '+o.faults[0]).join('; ')||'9 layouts, no faults'));
  ok('plans: rooms and doorways have floors',!noTable.length&&all.every(([,o])=>!o.badFl.length&&!o.badDoor.length),
    noTable.length?`no term table (so no floors or floor links) in ${noTable.join(' ')}`:all.flatMap(([id,o])=>[...o.badFl.map(x=>id+' '+x+' floor'),...o.badDoor.map(x=>id+' doorway '+x)]).slice(0,4).join('; ')||'none wrong');
  ok('plans: halls inside each main building',all.every(([,o])=>o.outside&&!o.outside.length&&!o.overlap.length),
    all.map(([id,o])=>`${id}: ${o.outside?o.outside.length?'outside '+o.outside.join(' '):'inside':'no building outline'}${o.overlap.length?', overlaps '+o.overlap.join(' '):''}`).join('; '));
  ok('plans: the way through, in order, in every layout',!noTable.length&&all.every(([,o])=>!o.order.bad&&o.order.dep>0&&o.order.arr>0&&!o.leak.length),
    (noTable.length?`no term table in ${noTable.join(' ')}; `:'')+all.map(([id,o])=>`${id} ${o.order.dep}/${o.order.arr}${o.order.bad?' '+o.order.bad+' out of order':''}${o.leak.length?' leaks to '+o.leak.join(' '):''}`).join(', '));
  const cw=r.classic.walk,ratios=all.map(([id,o])=>[id,cw?o.walk/cw:0]);
  ok('plans: no layout\'s walk is a trap',withTerm&&!noTable.length&&ratios.every(([,x])=>x>=0.7&&x<=1.5),(noTable.length?`no term table in ${noTable.join(' ')}; `:'')+'walk to the gate against Classic\'s '+Math.round(cw)+': '+ratios.map(([id,x])=>id+' '+x.toFixed(2)).join(', '));
  ok('plans: every layout plays two hours',!noTable.length&&all.every(([,o])=>!o.stuck&&!(o.errs||[]).length),(noTable.length?`no term table in ${noTable.join(' ')}; `:'')+all.map(([id,o])=>o.played?`${id} ${o.stuck} stuck${(o.errs||[]).length?' '+o.errs[0]:''}`:`${id} not played`).join(', '));}
  // rebuilding mid-hour, and old saves: every passenger in the terminal is in a room on their own floor. A fresh page for
  // each switch and each save (runtime state outlives loading a save in one page); only once the layouts have their own
  // tables, as it takes a second a page, unless TP_ALL=1
  {const lost=`(()=>{const S=__sim,R=S.R,TP=window.TP,on=TP.built(),AWAY=${JSON.stringify(AWAY)};return R.pax.filter(p=>p.room!=null&&!p.riding&&!AWAY.includes(p.state)&&!p.hotel).filter(p=>{const f=TP.paxFl(p);
      return !S.ROOMS.some((r,k)=>(on[k]||r.open)&&(r.fl==null||f==null||r.fl===f)&&TP.near(r.poly,p.x,p.y,16))}).length})()`;
  const fresh=async(text,fn,arg)=>{const {ctx,page,errs}=await open(undefined,text,false,{still:true});await tp(page);const n=await page.evaluate(fn,arg);const m=await page.evaluate(lost);await ctx.close();return [n,m,errs[0]]};
  const moved={},loaded={};
  if(terms||process.env.TP_ALL){
    for(const id of LAYOUT_IDS.filter(id=>id!=='classic'))moved[id]=await fresh(saveText('v29-L9.json'),id=>{const S=__sim;for(const T of S.TECH)if(T.b==='lay')S.G.tech[T.id]=1;window.TP.sim(30,0.25);S.switchLayout(id)},id);
    for(const f of saves)loaded[f]=await fresh(saveText(f),()=>window.TP.sim(10,0.25))}
  const bad=o=>Object.entries(o).filter(([,x])=>x[1]||x[2]),say=(o,what)=>bad(o).length?bad(o).slice(0,4).map(([k,x])=>`${k} ${x[1]} outside${x[2]?' '+x[2]:''}`).join(', '):`${Object.keys(o).length} ${what}, nobody outside a room`;
  ok('plans: rebuilding moves people into the new plan',terms&&!bad(moved).length,(terms?'':'no term tables yet; ')+say(moved,'switches'));
  ok('plans: old saves load into their layout\'s plan',terms&&!bad(loaded).length,(terms?'':'no term tables yet; ')+say(loaded,'saves'))}
  {const {ctx,page,errs}=await open({width:320,height:568},saveText(newest),true,{still:true});await tp(page);
  chip.push(chipSays(320,await page.evaluate(CHIP),errs));await ctx.close();
  ok('plans: the floor chip',chip.every(x=>x[0]),chip.map(x=>x[1]).join('; '))}
  // how long a frame takes zoomed in on the terminal at night, fully built, in the busiest hour of a level 9 airport
  for(const [name,mid,vp,touch] of [['Classic, desktop',false,{width:1440,height:900},false],['Midfield, desktop',true,{width:1440,height:900},false],['Midfield, phone',true,{width:390,height:844},true]]){
    const {ctx,page,errs}=await open(vp,saveText('v29-L9.json'),touch,{still:true});await tp(page);
    const r=await page.evaluate(([mid,cal])=>{eval('var CAL='+cal);const S=__sim,G=S.G,R=S.R,TP=window.TP,c=document.querySelector('#cv').getContext('2d');
      if(mid)S.switchLayout('mid');TP.build();S.applyLayout(G.layout);TP.sim(60,0.25);TP.day(21);S.setView('airport');const [mx,my]=TP.termMid();TP.look(mx,my,1.6);
      const frame=()=>{S.draw();c.getImageData(0,0,1,1)};for(let i=0;i<5;i++)frame();CAL();const cc=Math.min(CAL(),CAL(),CAL());
      let ms=1e9;for(let b=0;b<3;b++){const t=performance.now();for(let i=0;i<10;i++)frame();ms=Math.min(ms,(performance.now()-t)/10)}
      return {ms:+ms.toFixed(2),ratio:+(ms/cc).toFixed(3),pax:R.pax.length}},[mid,CAL.toString()]);
    const budget=+(ZOOM_MAIN[name]*ZOOM_BUDGET).toFixed(3);
    ok(`scene: drawing speed, terminal zoomed in, ${name}`,!errs.length&&r.ratio<=budget,`${r.ms} ms a frame, ${r.ratio}x calibration (budget ${budget}x, main ${ZOOM_MAIN[name]}x), ${r.pax} passengers`+(errs.length?' '+errs[0]:''));
    // Classic, fully built an hour in, is also the worst scene for the floors: under the roof at night in a storm,
    // nothing inside a hall is drawn; by day zoomed in, no passenger drawn whose room is on the other floor
    if(!mid){
      const u=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,TP=window.TP;TP.day(23);for(const k of ['rain','storm','fog','snow'])R.fx[k]=G.clock+600;
        S.setView('airport');R.cam.z=0.01;S.clampCam();S.clampCam();R.floor='roof';
        const P=S.roofNow(),on=TP.built(),polys=S.ROOMS.filter((r,k)=>on[k]).map(r=>r.poly),bag=P.rooms.length>polys.length?P.rooms.at(-1):{x0:0,y0:0,x1:0,y1:0}; // the baggage hall's roof comes after the rooms', while it isn't a room
        const inHall=([x,y])=>polys.some(Q=>TP.inPoly(Q,x,y))||(x>bag.x0&&x<bag.x1&&y>bag.y0&&y<bag.y1);
        const d=TP.drawn().filter(s=>inHall(s.at)),people=d.filter(s=>s.k==='arc'&&s.r<=4).length;const a=S.roofA();R.floor='halls';return {people,things:d.length-people,a}});
      ok('scene: nothing is drawn inside a hall under the roof',u.a===1&&u.people+u.things===0&&!errs.length,`on the roof (roofA ${u.a}): ${u.people} passengers and ${u.things} other things drawn inside halls`+(errs.length?' '+errs[0]:''));
      const f=await page.evaluate(()=>{const S=__sim,R=S.R,TP=window.TP;for(const k of ['rain','storm','fog','snow'])R.fx[k]=0;TP.day(14);S.setView('airport');const [mx,my]=TP.termMid();TP.look(mx,my,1.6);
        const two=TP.twoFloors(),out={};
        // a dot at a passenger's spot is theirs unless someone on the floor shown (or on both, as on the forecourt) is drawn there too
        for(const [f,n] of [['up',1],['down',0]]){R.floor=f;const on=R.pax.filter(p=>{const x=TP.paxFl(p);return x==null||x===n});
          const arcs=TP.drawn().filter(s=>s.k==='arc'&&s.r<=4&&!on.some(q=>Math.abs(s.at[0]-q.ex)<0.5&&Math.abs(s.at[1]-q.ey)<0.5)),other=R.pax.filter(p=>{const x=TP.paxFl(p);return x!=null&&x!==n});
          out[f]={other:other.length,drawn:other.filter(p=>arcs.some(a=>Math.abs(a.at[0]-p.x)<0.5&&Math.abs(a.at[1]-p.y)<0.5)).length}}
        R.floor='halls';return {two,...out}});
      ok('scene: one floor at a time',f.two&&!f.up.drawn&&!f.down.drawn&&!errs.length,`${f.two?'':'no halls on two floors yet; '}upstairs drew ${f.up.drawn} of ${f.up.other} passengers downstairs, downstairs drew ${f.down.drawn} of ${f.down.other} upstairs`+(errs.length?' '+errs[0]:''));
    }
    await ctx.close();
  }
}
