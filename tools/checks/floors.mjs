// Two floors (docs/specs/terminal-place.md): departures upstairs and arrivals below, people changing floor only on the
// escalators and the lift (families and those who need help by lift, runners never), nobody stuck, nobody drawn through a
// floor, walks about as long as before, taps going to a hall's floor, and old saves landing on the right floor. Written
// before the code (tools/checks/pending.txt). Reads the names in lib/place.mjs, plus a baggage hall room 'bag',
// hallLabel(id) → [x, y] where a hall's name is drawn, an advisor tip {hall: id} flying the camera to that hall, and
// paxEase(p), the drawn catch-up (p.ex, p.ey). One page: the floors and taps, one three-hour play for every play check,
// then each old save loaded into the same page (resetAll, as the boot does).
import {tp,AWAY} from './lib/place.mjs';
// main's numbers on 28 Sep 2026 for the play below (v29-L5.json, seed 1, fully built, one dawdler caused): flights held at
// the door with passengers missing, and the mean minutes from the forecourt to the gate lounge and from the stand to the
// forecourt, over the three game hours
const MAIN={held:1,dep:43.6,arr:13.2};
export default async function({open,ok,saveText,saves}){
  const {ctx,page,errs}=await open({width:1440,height:900},saveText('v29-L5.json'),false,{still:true});await tp(page);
  // the halls' floors in Classic, fully built; then tapping reclaim's name, and a tip about reclaim, go down to it
  const r=await page.evaluate(()=>{const S=__sim,TP=window.TP;const two=TP.twoFloors();TP.build();S.applyLayout(S.G.layout);
    const fl=id=>{const r=TP.room(id);return r?r.fl:'none'},up=['ci','sec','mkt'].map(id=>[id,fl(id)]),down=['imm','rec','cus','arh','wlk',...(TP.room('bag')?['bag']:[])].map(id=>[id,fl(id)]); // the baggage hall too, once it's a room
    const on=TP.built(),rs=S.ROOMS.filter((r,k)=>on[k]||r.open),over=[];
    rs.forEach((a,i)=>rs.forEach((b,j)=>{if(j>i&&(a.fl==null||b.fl==null||a.fl===b.fl)&&TP.overlap(a.poly,b.poly)>1)over.push(a.id+'/'+b.id)}));
    return {up,down,over,two}});
  const two=r.two,play=two||!!process.env.TP_ALL; // the play takes seconds, so it waits for two floors (TP_ALL=1 plays it anyway)
  ok('floors: departures upstairs, arrivals below',r.up.every(x=>x[1]===1)&&r.down.every(x=>x[1]===0)&&!r.over.length&&!errs.length,
    `upper ${r.up.map(x=>x.join(' ')).join(', ')}; lower ${r.down.map(x=>x.join(' ')).join(', ')}${r.over.length?'; overlapping on one floor: '+r.over.slice(0,4).join(' '):''}`+(errs.length?' '+errs[0]:''));
  const t=await page.evaluate(()=>{const S=__sim,R=S.R,TP=window.TP,rec=TP.room('rec').poly,[x0,y0,x1,y1]=TP.box(rec);S.setView('airport');
    const centre=()=>{const k=S.viewK();return [(R.cam.tx??R.cam.x)+R.sw/k/2,(R.cam.ty??R.cam.y)+R.sh/k/2]},there=()=>{const [x,y]=centre();return x>=x0&&x<=x1&&y>=y0&&y<=y1};
    const reset=()=>{R.floor='up';TP.look(300,300,1.6)};
    reset();const [lx,ly]=S.hallLabel?S.hallLabel('rec'):[x0+8,y0+10];TP.look(lx-300,ly,1.6);R.floor='up';R.lastTap=0;S.tapAt((lx-R.cam.x)*S.viewK(),(ly-R.cam.y)*S.viewK());
    const name={floor:R.floor,there:there()};
    reset();const el=document.querySelector('#tip');el.hidden=false;el._a={text:'Bags are slow at reclaim.',hall:'rec',label:'Reclaim'};el.innerHTML='<button class="buy ghost" data-tipgo="1">Reclaim</button>';el.querySelector('button').click();
    const tip={floor:R.floor,there:there()};el.hidden=true;R.floor='up';return {name,tip}});
  ok('floors: tapping a hall goes to its floor',t.name.floor==='down'&&t.name.there&&t.tip.floor==='down'&&t.tip.there&&!errs.length,JSON.stringify(t)+(errs.length?' '+errs[0]:''));
  // three game hours fully built, drawn as at 4x (one 1/15-minute step a frame) for the first half and 8x (two a frame) for
  // the second, each passenger's drawn catch-up after every frame. Half an hour in, a dawdler is caused on a flight whose
  // gate is upstairs from where they wait (someone waiting downstairs, where there is anyone). Measured: every change of
  // floor, how far from a floor link and which kind, and whose; the drawn points of each passenger who has just changed
  // floor, until the drawing catches up; the walks; who's stuck; the flights held at the door
  const p=!play?null:await page.evaluate(([AWAY,MIN])=>{const S=__sim,G=S.G,R=S.R,TP=window.TP,links=TP.links(),outId=S.hallId('out'),seen=new Map(),dep=[],arr=[],held=new Set(),lift={fam:[0,0],rest:[0,0]},run={changes:0,lift:0,mine:0};
    let t=0,changes=0,far=0,worst=0,drawn=0,through=0,wd=0,caused=null;const ease=typeof S.paxEase==='function';
    // the floors after every step (a change of floor is seen where it happens), the drawing once a frame
    const frame=(n,dt)=>{for(let k=0;k<n;k++){S.update(dt);t+=dt;look(k===n-1,dt)}};
    const look=(drawNow,dt)=>{
      for(const p of R.pax){let s=seen.get(p);const f=TP.paxFl(p);if(!s){s={fl:f,st:p.state,since:t,dep:p.state==='walkIn'&&p.room===outId?t:null,arr:null,tr:false};seen.set(p,s)}
        if(p.state!==s.st){s.st=p.state;s.since=t}
        if(f!=null){if(s.fl!=null&&f!==s.fl){changes++;const [d,kind]=TP.nearLink(p.x,p.y,links);if(d>12)far++;worst=Math.max(worst,Math.min(d,9999));const g=p.famL?lift.fam:lift.rest;g[0]++;if(kind==='lift')g[1]++;
          const tl=S.taleOf(p);if(tl&&(tl.run===1||tl.run===2)){run.changes++;if(kind==='lift')run.lift++;if(caused&&p===caused.p)run.mine++}s.tr=true}s.fl=f}
        if(ease&&drawNow){S.paxEase(p);if(s.tr){if(p.snap)s.tr=false;else{drawn++;const [d]=TP.nearLink(p.ex,p.ey,links);if(d>12){through++;wd=Math.max(wd,Math.min(d,9999))}if(Math.hypot(p.ex-p.x,p.ey-p.y)<2)s.tr=false}}}
        if(s.dep!=null&&p.state==='gate'){dep.push(t-s.dep);s.dep=null}
        if(p.inbound&&p.state==='toArr'&&s.arr==null)s.arr=t;if(s.arr>0&&p.room===outId){arr.push(t-s.arr);s.arr=-1}}
      if(Math.floor(t)!==Math.floor(t-dt))for(const i of S.SIDX){const F=R.st[i].F;if(F&&F.plane.state==='boarding'&&G.clock>F.std&&F.seated<F.booked)held.add(F)}};
    const cause=()=>{const wait=R.pax.filter(p=>(p.state==='mkt'||p.state==='shop')&&!p.inbound&&!p.kid&&!p.leader&&!p.late&&p.F&&R.st[p.F.i].F===p.F&&['turnaround','boarding'].includes(p.F.plane.state));
      const p=wait.find(p=>TP.paxFl(p)===0)||wait[0];if(!p)return {none:true};const o={p,fl:TP.paxFl(p),state:p.state};TP.dawdler(p);TP.hurry(p.F);return o};
    R.sim=true;
    for(let m=0;m<90*15;m++){frame(1,1/15);if((!caused||caused.none)&&t>=30&&m%15===0)caused=cause()} // tried each minute until a flight is turning round
    for(let m=0;m<90*7.5;m++)frame(2,1/15);R.sim=false;
    const stuck=R.pax.filter(p=>t-seen.get(p).since>90&&TP.stuck(p,AWAY)).map(p=>p.state);
    const mean=a=>a.length?+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):0,cp=caused&&caused.p,tl=cp&&S.taleOf(cp);
    // the runner asked which floor link they'd take in place of the lift (pickLink), as a family would be given it
    const doors=TP.doors(),liftJ=doors.findIndex(d=>d[5]==='lift'),pick=cp&&liftJ>=0&&typeof S.pickLink==='function'?doors[S.pickLink(cp,liftJ)][5]:null;
    return {links:links.length,changes,far,worst:Math.round(worst),lift,run,dep:mean(dep),arr:mean(arr),nd:dep.length,na:arr.length,stuck,held:held.size,ease,drawn,through,wd:Math.round(wd),
      caused:caused&&(caused.none?'none waiting':`${cp.F.code}${cp.F.no}, waiting on floor ${caused.fl??'-'} (${caused.state}), ${tl&&tl.run?'ran':'never ran'}`),ran:!!(tl&&tl.run),up:!!caused&&caused.fl===1,pick}},[AWAY,MAIN]);
  const none='not played: no halls on two floors yet';
  ok('floors: people change floor only on escalators and lifts',!!p&&p.changes>=50&&!p.far&&!errs.length,p?`${p.changes} changes of floor in three hours (at least 50), ${p.far} more than 12 from a floor link (worst ${p.changes?p.worst:'-'}), ${p.links} floor links`+(errs.length?' '+errs[0]:''):none);
  const share=g=>g[0]?g[1]/g[0]:0;
  ok('floors: families take the lift',!!p&&p.lift.fam[0]>0&&share(p.lift.fam)>=0.8&&share(p.lift.rest)<=0.05,p?`families and those who need help: ${p.lift.fam[1]} of ${p.lift.fam[0]} by lift (80% or more); others: ${p.lift.rest[1]} of ${p.lift.rest[0]} (5% or fewer)`:none);
  // a dawdler waiting upstairs, where the gate lounges are, has no floor to change on the way (in Classic nobody waits
  // downstairs), so then the runner is asked which link they'd take in place of the lift
  ok('floors: runners take the stairs or escalator',two&&!!p&&p.ran&&(p.run.mine>0||p.up&&!!p.pick&&p.pick!=='lift')&&!p.run.lift,p?`${two?'':'no halls on two floors yet; '}the dawdler caused on ${p.caused}, changing floor ${p.run.mine} times as they ran (at least once, unless they waited upstairs with the gates), offered the lift they'd take the ${p.pick||'-'}; runners changed floor ${p.run.changes} times, ${p.run.lift} by lift (none)`:none);
  ok('floors: nobody is drawn through a floor',!!p&&p.ease&&p.changes>0&&p.drawn>0&&!p.through,p?`${p.ease?'':'no paxEase; '}${p.changes?'':'nobody changes floor yet; '}${p.drawn} drawn points while the drawing caught up with a change of floor, ${p.through} more than 12 from a floor link (worst ${p.through?p.wd:'-'})`:none);
  const within=(a,b)=>b>0&&Math.abs(a/b-1)<=0.15;
  ok('floors: walks stay about the same',!!p&&p.changes>0&&within(p.dep,MAIN.dep)&&within(p.arr,MAIN.arr),p?`${p.changes?'':'nobody changes floor yet; '}forecourt to gate ${p.dep} min (main ${MAIN.dep}, ${p.nd} passengers), stand to forecourt ${p.arr} min (main ${MAIN.arr}, ${p.na}); each within 15%`:none);
  ok('floors: nobody is stuck between floors',!!p&&p.changes>0&&!p.stuck.length&&p.held<=Math.max(1,Math.floor(MAIN.held*1.05))&&!errs.length,p?`${p.changes?'':'nobody changes floor yet; '}${p.stuck.length} stuck over 90 min${p.stuck.length?' ('+[...new Set(p.stuck)].join(' ')+')':''}, ${p.held} flights held at the door (main ${MAIN.held}; one is allowed)`+(errs.length?' '+errs[0]:''):none);
  // every old save, loaded into this page as the boot loads one: after a game minute, nobody on a floor their room isn't
  // on (only once Classic has two floors; TP_ALL=1 loads them anyway)
  {const bad=[];let n=0,seen=0;
  if(play)for(const f of saves){const e0=errs.length;
    const [m,k]=await page.evaluate(s=>{const S=__sim,TP=window.TP;S.resetAll(JSON.parse(s));TP.sim(1,0.1);const on=S.R.pax.filter(p=>TP.roomFl(p.room)!=null);return [on.filter(p=>TP.paxFl(p)!==TP.roomFl(p.room)).length,on.length]},saveText(f));
    n++;seen+=k;if(m||errs.length>e0)bad.push(`${f} ${m}${errs.length>e0?' '+errs[e0]:''}`)}
  ok('floors: old saves land on the right floor',two&&seen>0&&!bad.length,`${two?'':'no halls on two floors yet; '}${n} saves, ${seen} passengers in a hall with a floor${bad.length?', on the wrong floor: '+bad.slice(0,4).join(', '):''}`)}
  await ctx.close();
}
