// Two floors (docs/specs/terminal-place.md): departures upstairs and arrivals below, people changing floor only on the
// escalators and the lift (families and those who need help by lift), nobody stuck, walks about as long as before, taps
// going to a hall's floor, and old saves landing on the right floor. Written before the code (tools/checks/pending.txt).
// Reads the names in lib/place.mjs, plus a baggage hall room 'bag', hallLabel(id) → [x, y] where a hall's name is drawn,
// and an advisor tip {hall: id} flying the camera to that hall.
import {tp,AWAY} from './lib/place.mjs';
// main's numbers on 27 Sep 2026 (v29-L5.json, seed 1): flights held at the door with passengers missing over three game
// hours fully built, and the mean minutes from the forecourt to the gate lounge and from the stand to the forecourt over six
const MAIN={held:0,dep:42.6,arr:12.2};
export default async function({open,ok,saveText,saves}){
  // the halls' floors in Classic, fully built; then tapping reclaim's name, and a tip about reclaim, go down to it
  let play,two;
  {const {ctx,page,errs}=await open({width:1440,height:900},saveText('v29-L5.json'),false,{still:true});await tp(page);
  const r=await page.evaluate(()=>{const S=__sim,TP=window.TP;const two=TP.twoFloors();TP.build();S.applyLayout(S.G.layout);
    const fl=id=>{const r=TP.room(id);return r?r.fl:'none'},up=['ci','sec','mkt'].map(id=>[id,fl(id)]),down=['imm','rec','cus','arh','bag','wlk'].map(id=>[id,fl(id)]);
    const on=TP.built(),rs=S.ROOMS.filter((r,k)=>on[k]||r.open),over=[];
    rs.forEach((a,i)=>rs.forEach((b,j)=>{if(j>i&&(a.fl==null||b.fl==null||a.fl===b.fl)&&TP.overlap(a.poly,b.poly)>1)over.push(a.id+'/'+b.id)}));
    return {up,down,over,two}});
  two=r.two;play=two||!!process.env.TP_ALL; // the plays below take a few seconds each, so they wait for two floors (TP_ALL=1 plays them anyway)
  ok('floors: departures upstairs, arrivals below',r.up.every(x=>x[1]===1)&&r.down.every(x=>x[1]===0)&&!r.over.length&&!errs.length,
    `upper ${r.up.map(x=>x.join(' ')).join(', ')}; lower ${r.down.map(x=>x.join(' ')).join(', ')}${r.over.length?'; overlapping on one floor: '+r.over.slice(0,4).join(' '):''}`+(errs.length?' '+errs[0]:''));
  const t=await page.evaluate(()=>{const S=__sim,R=S.R,TP=window.TP,rec=TP.room('rec').poly,[x0,y0,x1,y1]=TP.box(rec);S.setView('airport');
    const centre=()=>{const k=S.viewK();return [(R.cam.tx??R.cam.x)+R.sw/k/2,(R.cam.ty??R.cam.y)+R.sh/k/2]},there=()=>{const [x,y]=centre();return x>=x0&&x<=x1&&y>=y0&&y<=y1};
    const reset=()=>{R.floor='up';TP.look(300,300,1.6)};
    reset();const [lx,ly]=S.hallLabel?S.hallLabel('rec'):[x0+8,y0+10];TP.look(lx-300,ly,1.6);R.floor='up';R.lastTap=0;S.tapAt((lx-R.cam.x)*S.viewK(),(ly-R.cam.y)*S.viewK());
    const name={floor:R.floor,there:there()};
    reset();const el=document.querySelector('#tip');el.hidden=false;el._a={text:'Bags are slow at reclaim.',hall:'rec',label:'Reclaim'};el.innerHTML='<button class="buy ghost" data-tipgo="1">Reclaim</button>';el.querySelector('button').click();
    const tip={floor:R.floor,there:there()};R.floor='halls';return {name,tip}});
  ok('floors: tapping a hall goes to its floor',t.name.floor==='down'&&t.name.there&&t.tip.floor==='down'&&t.tip.there&&!errs.length,JSON.stringify(t)+(errs.length?' '+errs[0]:''));
  await ctx.close()}
  // six game hours as it is: every change of floor, how far from a floor link and which kind; the walks
  {const {ctx,page,errs}=play?await open(undefined,saveText('v29-L5.json'),false,{still:true}):{errs:[]};if(play)await tp(page);
  const r=!play?{links:0,changes:0,far:0,worst:0,lift:{fam:[0,0],rest:[0,0]},dep:0,arr:0,nd:0,na:0,skipped:true}:await page.evaluate(play=>{if(!play)return {links:window.TP.links().length,changes:0,far:0,worst:0,lift:{fam:[0,0],rest:[0,0]},dep:0,arr:0,nd:0,na:0,skipped:true};const S=__sim,R=S.R,TP=window.TP,links=TP.links(),outId=S.hallId('out'),seen=new Map(),dep=[],arr=[];let t=0,changes=0,far=0,worst=0;const lift={fam:[0,0],rest:[0,0]};
    TP.sim(360,0.1,()=>{t+=0.1;for(const p of R.pax){let s=seen.get(p);if(!s){s={fl:TP.paxFl(p),dep:p.state==='walkIn'&&p.room===outId?t:null,arr:null};seen.set(p,s)}
      const f=TP.paxFl(p);if(t<=180&&f!=null){if(s.fl!=null&&f!==s.fl){changes++;let d=1e9,k=null;for(const L of links){const e=Math.hypot(L[2]-p.x,L[3]-p.y);if(e<d){d=e;k=L[5]}}
        if(d>12)far++;worst=Math.max(worst,Math.min(d,9999));const g=p.famL?lift.fam:lift.rest;g[0]++;if(k==='lift')g[1]++}s.fl=f}
      if(s.dep!=null&&p.state==='gate'){dep.push(t-s.dep);s.dep=null}
      if(p.inbound&&p.state==='toArr'&&s.arr==null)s.arr=t;if(s.arr>0&&p.room===outId){arr.push(t-s.arr);s.arr=-1}}});
    const mean=a=>a.length?+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):0;
    return {links:links.length,changes,far,worst:Math.round(worst),lift,dep:mean(dep),arr:mean(arr),nd:dep.length,na:arr.length}},play);
  ok('floors: people change floor only on escalators and lifts',r.changes>=50&&!r.far&&!errs.length,`${r.changes} changes of floor in three hours (at least 50), ${r.far} more than 12 from a floor link (worst ${r.changes?r.worst:'-'}), ${r.links} floor links`+(errs.length?' '+errs[0]:''));
  const share=g=>g[0]?g[1]/g[0]:0;
  ok('floors: families take the lift',r.lift.fam[0]>0&&share(r.lift.fam)>=0.8&&share(r.lift.rest)<=0.05,`families and those who need help: ${r.lift.fam[1]} of ${r.lift.fam[0]} by lift (80% or more); others: ${r.lift.rest[1]} of ${r.lift.rest[0]} (5% or fewer)`);
  const within=(a,b)=>b>0&&Math.abs(a/b-1)<=0.15;
  ok('floors: walks stay about the same',r.changes>0&&!r.skipped&&within(r.dep,MAIN.dep)&&within(r.arr,MAIN.arr),`${r.skipped?'not played: no halls on two floors yet; ':r.changes?'':'nobody changes floor yet; '}forecourt to gate ${r.dep} min (main ${MAIN.dep}, ${r.nd} passengers), stand to forecourt ${r.arr} min (main ${MAIN.arr}, ${r.na}); each within 15%`);
  if(play)await ctx.close()}
  // three game hours fully built: nobody stuck in one state, and no more flights held at the door than main
  {const {ctx,page,errs}=play?await open(undefined,saveText('v29-L5.json'),false,{still:true}):{errs:[]};if(play)await tp(page);
  const r=!play?{stuck:[],held:0,changes:0}:await page.evaluate(([AWAY,play])=>{const S=__sim,R=S.R,TP=window.TP;if(!play)return {stuck:[],held:0,changes:0};TP.build();S.applyLayout(S.G.layout);const seen=new Map(),held=new Set();let t=0,changes=0;
    TP.sim(180,0.1,()=>{t+=0.1;for(const p of R.pax){let s=seen.get(p);const f=TP.paxFl(p);if(!s){s={st:p.state,since:t,fl:f};seen.set(p,s)}if(p.state!==s.st){s.st=p.state;s.since=t}if(f!=null){if(s.fl!=null&&f!==s.fl)changes++;s.fl=f}}
      if(Math.round(t*10)%10===0)for(const i of S.SIDX){const F=R.st[i].F;if(F&&F.plane.state==='boarding'&&S.G.clock>F.std&&F.seated<F.booked)held.add(F)}});
    const stuck=R.pax.filter(p=>t-seen.get(p).since>90&&TP.stuck(p,AWAY)).map(p=>p.state);
    return {stuck,held:held.size,changes}},[AWAY,play]);
  ok('floors: nobody is stuck between floors',r.changes>0&&!r.stuck.length&&r.held<=Math.floor(MAIN.held*1.05)&&!errs.length,`${r.changes?'':'nobody changes floor yet; '}${r.stuck.length} stuck over 90 min${r.stuck.length?' ('+[...new Set(r.stuck)].join(' ')+')':''}, ${r.held} flights held at the door (main ${MAIN.held})`+(errs.length?' '+errs[0]:''));
  if(play)await ctx.close()}
  // every old save: after a game minute, nobody on a floor their room isn't on. A fresh page each; only once Classic has
  // two floors (TP_ALL=1 runs them anyway)
  {const bad=[];let n=0;
  if(play)for(const f of saves){const {ctx,page,errs}=await open(undefined,saveText(f),false,{still:true});await tp(page);
    const m=await page.evaluate(()=>{const S=__sim,TP=window.TP;TP.sim(1,0.1);return S.R.pax.filter(p=>p.fl!=null&&TP.roomFl(p.room)!=null&&p.fl!==TP.roomFl(p.room)).length});
    n++;if(m||errs.length)bad.push(`${f} ${m}${errs.length?' '+errs[0]:''}`);await ctx.close()}
  ok('floors: old saves land on the right floor',two&&!bad.length,`${two?'':'no halls on two floors yet; '}${n} saves${bad.length?', on the wrong floor: '+bad.slice(0,4).join(', '):''}`)}
}
