// Three phone bugs from the owner (#119, #120, #121): stand cards overlapping, the Pier B people mover's car snapping
// between the piers, and a passenger's drawn step cutting across a hall wall at a doorway. Each check fails on main
// before its fix.
export default async function({open,ok,saveText,newest}){
  // #119: no two stand cards (or a card and a tag) ever overlap, at phone, tablet and desktop widths, over a seeded
  // busy hour on Classic with Pier B. placeGateCards (12-drawing.js) is the same function the game draws with.
  for(const [name,vp] of [['phone',{width:390,height:844}],['tablet',{width:768,height:1024}],['desktop',{width:1440,height:900}]]){
    const {ctx,page,errs}=await open(vp,saveText(newest),vp.width<600,{still:true});
    const r=await page.evaluate(()=>{
      const S=__sim,G=S.G,R=S.R;R.sim=true;
      let overlaps=0,frames=0,cards=0,tested=0,ex=null;
      for(let i=0;i<600;i++){ // an hour in, so stands turn over between built, boarding and deplaning
        S.update(0.1);
        if(i%5)continue; // a rect check every half minute of game time is plenty; drawing itself runs every frame
        frames++;
        S.sceneView(S.derived());
        const built=S.SIDX.filter(k=>G.stands[k].built);
        const placed=S.placeGateCards(built,(S.V.x0+S.V.x1)/2,(S.V.y0+S.V.y1)/2);
        const rects=placed.map(([k,dy])=>{const b=S.badgeRect(k);return dy==null?S.tagRect(b):[b[0],b[1]+dy,b[2],b[3]]});
        cards+=rects.length;
        for(let a=0;a<rects.length;a++)for(let b=a+1;b<rects.length;b++){tested++;if(S.rectsOverlap(rects[a],rects[b])){overlaps++;if(!ex)ex=`${built[a]}×${built[b]} at clock ${Math.round(G.clock)}`}}
      }
      return {overlaps,frames,cards,tested,ex};
    });
    ok(`phone-bugs: no two stand cards overlap at ${name}`,r.overlaps===0&&r.tested>0,r.ex||`${r.cards} cards over ${r.frames} frames, ${r.tested} pairs tested`);
    if(errs.length)ok(`phone-bugs: no page errors (cards, ${name})`,false,errs[0]);
    await ctx.close();
  }

  // #120: the mover's drawn car never jumps more than its own matching distance between frames, whether it's carrying a
  // group, empty and shuttling, or switching between the two. Frames are timed by hand (V.t) so the check runs fast
  // regardless of wall-clock speed, at both a normal frame gap and a slow one (dropped frames, or 8× zoomed in).
  {
    const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});
    const r=await page.evaluate(()=>{
      const S=__sim,G=S.G,R=S.R;R.sim=true;
      S.sceneView(S.derived());S.V.t=0;S.V.x0=-1e6;S.V.x1=1e6;S.V.y0=-1e6;S.V.y1=1e6;
      const cap=S.MV_MATCH,seen=new Map();let maxJump=0,frames=0,sawRider=false,sawShuttle=false,sawSwitch=false,wasEmpty=null;
      for(let i=0;i<2400;i++){
        S.update(0.05*(1+(i%3))); // mixes 1×-ish and faster steps, as the game does at higher speeds
        S.V.t+=(i%17===0)?0.3:1/60; // an occasional slow frame among normal ones
        S.drawPax(S.V);frames++;
        const empty=!S.MV_CARS.some(c=>!c.shuttle);
        if(wasEmpty!=null&&wasEmpty!==empty)sawSwitch=true;
        wasEmpty=empty;
        for(const c of S.MV_CARS){
          if(!c.shuttle)sawRider=true;else sawShuttle=true;
          const prev=seen.get(c);
          if(prev)maxJump=Math.max(maxJump,Math.hypot(c.x-prev.x,c.y-prev.y));
          seen.set(c,{x:c.x,y:c.y});
        }
      }
      return {maxJump:Math.round(maxJump),cap,frames,sawRider,sawShuttle,sawSwitch,mover:G.lv.mover,track:!!S.LAY.track};
    });
    ok('phone-bugs: the mover exists to test (Pier B, the mover bought)',r.mover&&r.track,JSON.stringify(r));
    ok(`phone-bugs: the mover car never jumps more than ${r.cap}px between frames`,r.maxJump<=r.cap,`max ${r.maxJump}px over ${r.frames} frames`);
    ok('phone-bugs: saw both a rider car and the empty shuttle',r.sawRider&&r.sawShuttle,JSON.stringify(r));
    ok('phone-bugs: saw a car switch between carrying riders and shuttling',r.sawSwitch,JSON.stringify(r));
    if(errs.length)ok('phone-bugs: no page errors (mover)',false,errs[0]);
    await ctx.close();
  }

  // #121: no passenger's drawn step (p.ex, p.ey frame to frame) crosses a hall's wall, except through a doorway, over
  // a seeded hour on the newest save. paxEase (12-drawing.js) is meant to jump to the doorway it just used (p.door,
  // set by walk() in 41-airside.js) before easing on, rather than cutting the corner in a straight line.
  {
    const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});
    const r=await page.evaluate(()=>{
      const S=__sim,G=S.G,R=S.R;R.sim=true;
      // does segment (x1,y1)-(x2,y2) cross edge (ax,ay)-(bx,by) at a point strictly between both ends? Both ends of the
      // step must clear the wall by more than a couple of px either side, so walking right along a wall (queuing at a
      // shop hard against it, say) isn't flagged as passing through it.
      const segCross=(x1,y1,x2,y2,ax,ay,bx,by)=>{
        const elen=Math.hypot(bx-ax,by-ay)||1,d1=((bx-ax)*(y1-ay)-(by-ay)*(x1-ax))/elen,d2=((bx-ax)*(y2-ay)-(by-ay)*(x2-ax))/elen;
        const e1=(x2-x1)*(ay-y1)-(y2-y1)*(ax-x1),e2=(x2-x1)*(by-y1)-(y2-y1)*(bx-x1);
        return d1*d2<0&&Math.abs(d1)>2.5&&Math.abs(d2)>2.5&&e1*e2<-1e-9;
      };
      const nearDoor=(x1,y1,x2,y2,dx,dy,hw)=>{ // the step passes within the doorway's own width of its centre
        const len2=(x2-x1)**2+(y2-y1)**2||1,t=Math.max(0,Math.min(1,((dx-x1)*(x2-x1)+(dy-y1)*(y2-y1))/len2));
        const qx=x1+(x2-x1)*t,qy=y1+(y2-y1)*t;return Math.hypot(qx-dx,qy-dy)<=hw+6;
      };
      // passport desks and e-gates are themselves the wall's only doorway between immigration and reclaim (42-terminal.js),
      // not a point in ROOM_DOORS, so crossing anywhere along that shared wall is legitimate, not a hole in the routing
      const immI=S.hallId&&S.hallId('imm'),recI=S.hallId&&S.hallId('rec');
      const secWall=S.ROOMS&&immI!=null&&recI!=null?(()=>{
        const bx=P=>[Math.min(...P.map(q=>q[0])),Math.max(...P.map(q=>q[0])),Math.min(...P.map(q=>q[1])),Math.max(...P.map(q=>q[1]))];
        const [ix0,ix1,,iy1]=bx(S.ROOMS[immI].poly),[rx0,rx1,ry0]=bx(S.ROOMS[recI].poly);
        return Math.abs(iy1-ry0)<1?{y:iy1,x0:Math.max(ix0,rx0),x1:Math.min(ix1,rx1)}:null;
      })():null;
      const crossesSecWall=(x1,y1,x2,y2)=>{
        if(!secWall||(y1-secWall.y)*(y2-secWall.y)>=0)return false;
        const t=(secWall.y-y1)/(y2-y1),x=x1+(x2-x1)*t;return x>=secWall.x0-4&&x<=secWall.x1+4;
      };
      S.sceneView(S.derived());S.V.t=0;S.V.x0=-1e6;S.V.x1=1e6;S.V.y0=-1e6;S.V.y1=1e6;
      const prev=new Map();let steps=0,violations=0,ex=[];
      for(let i=0;i<6000;i++){
        const speed=[1,4,8,8][i%4]; // several sim ticks can land between two drawn frames at 4× and 8×, same as real play
        for(let s=0;s<speed;s++)S.update(0.034);
        S.V.t+=1/30;S.drawPax(S.V);
        for(const p of R.pax){
          if(p.riding||(S.onMover&&S.onMover(p))||p.state==='bridge'||p.state==='dBridge'){prev.delete(p);continue}
          if(p.snap){prev.set(p,[p.ex,p.ey]);continue} // a snap is a designed relocation (appearing, or through a security control), not a walked step
          const q=prev.get(p);
          if(q&&(q[0]!==p.ex||q[1]!==p.ey)){
            steps++;
            let crossed=false,doored=false;
            // a room's own boundary, right where its own stands' or shops' local points sit, isn't a "wall" a step can
            // wrongly cross: only a step that ends up inside a room that isn't p.room is a real violation
            if(S.ROOMS)for(const r of S.ROOMS){if(r.open||r===S.ROOMS[p.room])continue;const P=r.poly;for(let k=0;k<P.length;k++){const [ax,ay]=P[k],[bx,by]=P[(k+1)%P.length];if(segCross(q[0],q[1],p.ex,p.ey,ax,ay,bx,by))crossed=true}}
            if(crossed&&S.ROOM_DOORS)doored=S.ROOM_DOORS.some(([,,dx,dy,hw])=>nearDoor(q[0],q[1],p.ex,p.ey,dx,dy,hw));
            if(crossed&&!doored)doored=crossesSecWall(q[0],q[1],p.ex,p.ey);
            if(crossed&&!doored){violations++;if(ex.length<5)ex.push(`(${Math.round(q[0])},${Math.round(q[1])})→(${Math.round(p.ex)},${Math.round(p.ey)}) ${p.state}`)}
          }
          prev.set(p,[p.ex,p.ey]);
        }
      }
      return {steps,violations,ex};
    });
    ok('phone-bugs: no drawn passenger step crosses a hall wall except through a doorway',r.violations===0&&r.steps>1000,`${r.violations} of ${r.steps} steps; ${r.ex.join(' | ')}`);
    if(errs.length)ok('phone-bugs: no page errors (walls)',false,errs[0]);

    // A direct, deterministic case for every pair of rooms with a route between them: force a passenger the whole way
    // in one go (as several sim ticks at 4×/8× can land between two drawn frames), then ease once, as drawPax would
    // between two frames, and check the single resulting step against the same walls and doorways as above.
    const r2=await page.evaluate(()=>{
      const S=__sim,G=S.G;let tested=0,violations=0,ex=[];
      const segCross=(x1,y1,x2,y2,ax,ay,bx,by)=>{
        const elen=Math.hypot(bx-ax,by-ay)||1,d1=((bx-ax)*(y1-ay)-(by-ay)*(x1-ax))/elen,d2=((bx-ax)*(y2-ay)-(by-ay)*(x2-ax))/elen;
        const e1=(x2-x1)*(ay-y1)-(y2-y1)*(ax-x1),e2=(x2-x1)*(by-y1)-(y2-y1)*(bx-x1);
        return d1*d2<0&&Math.abs(d1)>2.5&&Math.abs(d2)>2.5&&e1*e2<-1e-9;
      };
      if(S.ROOMS)for(let a=0;a<S.ROOMS.length;a++)for(let b=0;b<S.ROOMS.length;b++){
        if(a===b)continue;
        const mid=r=>[r.poly.reduce((s,q)=>s+q[0],0)/r.poly.length,r.poly.reduce((s,q)=>s+q[1],0)/r.poly.length];
        const [sx,sy]=mid(S.ROOMS[a]);
        const p={x:sx,y:sy,ex:sx,ey:sy,esx:sx,esy:sy,ev:0,et:G.clock,room:a,spd:1,wait:0,type:'std',state:'toGate',way:null,wi:0,doors:null};
        S.route(p,b);
        if(!p.way)continue; // adjacent (or no route): nothing multi-hop to cross
        tested++;
        // several ticks' worth, as if many landed between two drawn frames, but staying under EASE_SNAP (80px) from the
        // start so paxEase eases rather than snapping — a snap is a deliberate relocation, not the corner-cut this tests
        for(let t=0;t<200&&p.way&&Math.hypot(p.x-sx,p.y-sy)<70;t++)S.walk(p,300,0.05);
        if(Math.hypot(p.x-sx,p.y-sy)>=79)continue; // this route's doorways are too far apart to test this way
        G.clock+=4;S.paxEase(p);
        if(p.snap)continue;
        let crossed=false;
        for(const r of S.ROOMS){if(r.open||r===S.ROOMS[a]||r===S.ROOMS[b])continue;const P=r.poly;for(let k=0;k<P.length;k++){const [ax,ay]=P[k],[bx,by]=P[(k+1)%P.length];if(segCross(sx,sy,p.ex,p.ey,ax,ay,bx,by))crossed=true}}
        if(crossed){violations++;if(ex.length<5)ex.push(`${S.ROOMS[a].id}→${S.ROOMS[b].id}: (${Math.round(sx)},${Math.round(sy)})→(${Math.round(p.ex)},${Math.round(p.ey)})`)}
      }
      return {tested,violations,ex};
    });
    ok('phone-bugs: a passenger routed across several doorways at once still eases through them, not past them',r2.violations===0&&r2.tested>0,`${r2.violations} of ${r2.tested} multi-hop routes; ${r2.ex.join(' | ')}`);
    await ctx.close();
  }
}
