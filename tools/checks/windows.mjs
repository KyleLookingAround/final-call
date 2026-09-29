// Windows (docs/specs/terminal-place.md): glass on every airside wall that faces the apron, passengers who are waiting
// drifting to it when a wide-body goes by and never after their gate is called, and lit at night. Written before the code
// (tools/checks/pending.txt). Reads the names in lib/place.mjs, plus glass() → [[x1, y1, x2, y2]…], the glass for the
// layout as built; p.watch, set while a passenger watches; and glassLights, the function the windows add to LIGHTS.
import {tp} from './lib/place.mjs';
const LAYOUT_IDS=['classic','remote','stagger','curve','hall','sat','star','round','mid'];
const APRON_Y=522; // SEC_Y: the apron and the piers are above it, the halls below
export default async function({open,ok,saveText,newest}){
  let play; // the pushback and two hours of play wait until there's glass (TP_ALL=1 plays them anyway)
  // glass on every airside wall facing the apron, and nowhere else; each layout fully built. Then Classic's lit at night
  {const {ctx,page,errs}=await open({width:1440,height:900},saveText(newest),false,{still:true});await tp(page);
  const r=await page.evaluate(([ids,APRON_Y,text])=>{const S=__sim,G=S.G,R=S.R,TP=window.TP,out={};
    const onSeg=(g,[a,b,c,d])=>{const dx=c-a,dy=d-b,l=Math.hypot(dx,dy)||1,off=([x,y])=>Math.abs((x-a)*dy-(y-b)*dx)/l,t=([x,y])=>((x-a)*dx+(y-b)*dy)/(l*l);
      return off([g[0],g[1]])<=3&&off([g[2],g[3]])<=3?[t([g[0],g[1]]),t([g[2],g[3]])].sort((p,q)=>p-q):null};
    for(const id of ids){S.resetAll(JSON.parse(text));S.switchLayout(id);TP.build();S.applyLayout(id);
      const on=TP.built(),rooms=S.ROOMS.filter((r,k)=>on[k]),inAny=(x,y)=>S.ROOMS.some((r,k)=>(on[k]||r.open)&&TP.inPoly(r.poly,x,y));
      // the walls: each edge of an airside room whose outside, 8 units out, is apron: no room there, above the halls, on the map
      const want=[];for(const r of rooms){if(r.land)continue;const [cx,cy]=TP.mid(r.poly);r.poly.forEach(([x1,y1],k)=>{const [x2,y2]=r.poly[(k+1)%r.poly.length],l=Math.hypot(x2-x1,y2-y1);if(l<10)return;
        let nx=(y2-y1)/l,ny=-(x2-x1)/l;const mx=(x1+x2)/2,my=(y1+y2)/2;if((cx-mx)*nx+(cy-my)*ny>0){nx=-nx;ny=-ny}const ox=mx+nx*8,oy=my+ny*8;
        if(!inAny(ox,oy)&&oy<APRON_Y&&ox>0&&ox<S.W)want.push([x1,y1,x2,y2,r.id])})}
      const glass=S.glass?S.glass():null,o=out[id]={walls:want.length,glass:glass?glass.length:null,bare:[],stray:0};
      if(glass){for(const w of want){const cov=glass.map(g=>onSeg(g,w)).filter(Boolean).map(([a,b])=>Math.max(0,Math.min(1,b))-Math.max(0,Math.min(1,a))).reduce((a,b)=>a+b,0);if(cov<0.8)o.bare.push(w[4])}
        o.stray=glass.filter(g=>!want.some(w=>onSeg(g,w))).length}}
    // lit at night: a spot on the apron just outside Classic's glass, with the windows' lights and without
    S.resetAll(JSON.parse(text));S.switchLayout('classic');TP.build();S.applyLayout('classic');S.setView('airport');R.cam.z=0.01;S.clampCam();S.clampCam();
    const glass=S.glass?S.glass():[],c=document.querySelector('#cv').getContext('2d');let lit=null;
    if(glass.length){const [a,b,x2,y2]=glass[0],x=(a+x2)/2,y=Math.min(b,y2)-10,k=S.viewK()*R.dpr,px=()=>{S.draw();const d=c.getImageData(Math.round((x-R.cam.x)*k),Math.round((y-R.cam.y)*k),1,1).data;return d[0]+d[1]+d[2]};
      const at=h=>{TP.day(h);for(const k of ['rain','storm','fog','snow'])R.fx[k]=0;const w=px(),j=S.LIGHTS.indexOf(S.glassLights),keep=j>=0?S.LIGHTS.splice(j,1):[];const wo=px();S.LIGHTS.splice(j,0,...keep);return [w,wo,j>=0]};
      lit={night:at(23),noon:at(12)}}
    return {out,lit}},[LAYOUT_IDS,APRON_Y,saveText(newest)]);
  const all=LAYOUT_IDS.map(id=>[id,r.out[id]]),none=all.every(([,o])=>o.glass==null);play=!none||!!process.env.TP_ALL;
  ok('windows: glass on every airside wall facing the apron',!none&&all.every(([,o])=>o.glass&&!o.bare.length&&!o.stray)&&!errs.length,
    none?`no glass() yet; ${all.map(([id,o])=>`${id} ${o.walls} walls`).join(', ')}`:all.map(([id,o])=>`${id}: ${o.walls} walls, ${o.bare.length} bare, ${o.stray} stray glass`).join('; ')+(errs.length?' '+errs[0]:''));
  const L=r.lit;
  ok('windows: lit at night',!!L&&L.night[2]&&L.night[0]>L.night[1]&&Math.abs(L.noon[0]-L.noon[1])<=3,L?`at 23:00 ${L.night[0]} with the windows' lights, ${L.night[1]} without${L.night[2]?'':' (glassLights isn\'t in LIGHTS)'}; at 12:00 ${L.noon[0]} and ${L.noon[1]}`:'no glass() yet');
  await ctx.close()}
  // a wide-body pushing back from the stand nearest the market place: waiting passengers gather at the glass on that side,
  // and all of them still board; and over two hours, nobody watches once their gate is called. Played only once there's
  // glass (TP_ALL=1 plays it anyway)
  {const {ctx,page,errs}=play?await open(undefined,saveText('v29-L9.json'),false,{still:true}):{errs:[]};if(play)await tp(page);
  const r=!play?{glass:0}:await page.evaluate(all=>{const S=__sim,G=S.G,R=S.R,TP=window.TP,glass=S.glass?S.glass():[];if(!glass.length&&!all)return {glass:0};
    TP.sim(30,0.1);const [mx,my]=TP.mid(TP.room('mkt').poly),face=i=>{const X=S.XF[i];return [X.ox,X.oy]};
    const i=S.SIDX.filter(i=>G.stands[i].built).sort((a,b)=>Math.hypot(face(a)[0]-mx,face(a)[1]-my)-Math.hypot(face(b)[0]-mx,face(b)[1]-my))[0],[fx,fy]=face(i);
    const side=glass.filter(([a,b,c,d])=>Math.hypot((a+c)/2-fx,(b+d)/2-fy)<300),waiting=p=>!p.inbound&&(['gate','mkt','shop','toGate','toShop','outShop'].includes(p.state)||p.state==='watch'&&!!p.watch); // a watcher is still waiting, in the windows' own state
    const near=p=>side.some(([a,b,c,d])=>{const dx=c-a,dy=d-b,t=Math.max(0,Math.min(1,((p.x-a)*dx+(p.y-b)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(a+dx*t-p.x,b+dy*t-p.y)<=8});
    const count=()=>R.pax.filter(p=>waiting(p)&&near(p)).length,before=count(),at0=new Set(R.pax.filter(p=>waiting(p)&&near(p)));
    const any=Object.values(R.st).map(s=>s.F).find(F=>F),wide=S.AIRCRAFT.reduce((a,b)=>b.rows*b.blocks.reduce((x,y)=>x+y,0)>a.rows*a.blocks.reduce((x,y)=>x+y,0)?b:a);
    R.st[i].out={F:{...any,ac:wide},t:0,offY:0,alpha:1};let during=0;const watchers=new Set();
    TP.sim(6,0.1,()=>{during=Math.max(during,count());for(const p of R.pax)if(waiting(p)&&near(p)&&!at0.has(p))watchers.add(p)});
    // each watcher boards before their flight's door closes
    let missed=0,late=0,watchSeen=0;const gone=new Set();
    TP.sim(120,0.1,()=>{for(const p of watchers){if(gone.has(p))continue;const F=p.F;if(!F){gone.add(p);continue}if(['aisle','sitting'].includes(p.state)||!R.pax.includes(p)){gone.add(p);continue}
        if(R.st[p.stand]&&R.st[p.stand].F!==F){missed++;gone.add(p)}}
      for(const p of R.pax)if(p.watch){watchSeen++;if(p.F&&S.isCalled(p.F))late++}});
    return {glass:glass.length,stand:S.STAND_KIND[i]+' '+i,side:side.length,before,during,watchers:watchers.size,missed,late,watchSeen}},!!process.env.TP_ALL);
  ok('windows: passengers watch a big jet go by',r.glass>0&&r.during>=r.before+3&&!r.missed&&!errs.length,r.stand?`${r.glass?'':'no glass() yet; '}${r.side} panes by stand ${r.stand}: ${r.before} waiting at the glass before, ${r.during} during the pushback; ${r.watchers} came to watch, ${r.missed} missed their flight`:'no glass() yet');
  ok('windows: nobody watches after their gate is called',r.glass>0&&r.watchSeen>0&&!r.late&&!errs.length,r.stand?`${r.glass?'':'no glass() yet; '}${r.watchSeen} watcher-steps over two hours, ${r.late} after the gate was called`:'no glass() yet, so nobody watches');
  if(play)await ctx.close()}
}
