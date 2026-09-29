// Tips that point the right way (release audit rows 1, 4, 5, 25, 26 and 27; issue #148): a player who follows every tip
// for 200 hours from a new game never has ticket prices above 120%, and sees a rating tip for under a fifth of the hours;
// the rating tip shows only near the next level's need and quotes the change in the rating shown; late departures with
// every upgrade bought point at gates, not prices; a coffee cart at its top level suggests a roomier kind, and no tip
// over a level 9 day names an upgrade already at its top; purchase tips hold back the cash the current goal needs;
// partner airlines holding the gates bring a fleet recommendation; overnight checks service worn planes at the gate and
// drop the service tip; and buying from a tip flies the camera to the hall it bought for.
export default async function({open,ok,saveText,newest}){
  // following every tip for 200 hours from a new game
  {const {ctx,page,errs}=await open(undefined,null,false,{seed:1,still:true});
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;R.sim=true;G.tour.done=1;
      let maxFare=G.fare,rating=0,hours=0,lastH=-1,prices=0;
      for(let step=0;G.clock<200*60+360;step++){S.update(0.25);
        if(step%20)continue;S.checkGoals();const a=S.advise();const h=Math.floor(G.clock/60);
        if(h!==lastH){lastH=h;hours++;if(a&&/rating fell/.test(a.text))rating++}
        const sel=a&&a.go&&a.go[1]||'';let m;
        if(!a);else if(a.k){if(G.cash>=a.c)S.buyUpgrade(a.k)}
        else if(/data-fare="1"/.test(sel)){G.fare=Math.round((G.fare+0.1)*10)/10;prices++}
        else if((m=/data-acbuy="(\d+)"/.exec(sel)))S.buyAircraft(+m[1]);
        else if((m=/data-standbuy="(\d+)"/.exec(sel)))S.buyStand(+m[1]);
        else if(/crewhire/.test(sel))S.hireCrew(true);
        // and, as the audit's scripted player did, the goal bar's purchase, the Masterplan's plans, and a gate the level asks for
        {const T=S.TECH.find(T=>S.techState(T)==='ready');if(T)S.research(T.id)}
        {const i=S.STAND_ORDER.find(i=>S.standBuyable(i));if(i!=null&&S.builtCount()<(S.LEVELS[G.level+1]||{req:{}}).req.gates&&S.canBuild()&&G.cash>=S.STAND[i].cost)S.buyStand(i)}
        const g=S.curGoal(),gs=g&&g.go&&g.go[1]||'';
        if(/data-standbuy/.test(gs)){const i=S.STAND_ORDER.find(i=>S.standBuyable(i));if(i!=null&&G.cash>=S.STAND[i].cost)S.buyStand(i)}
        else if((m=/data-buy="(\w+)"/.exec(gs))&&S.upBuyable(m[1])&&G.cash>=S.upCost(m[1]))S.buyUpgrade(m[1]);
        else if(/data-acbuy/.test(gs)&&G.cash>=S.AIRCRAFT[0].cost)S.buyAircraft(0);
        maxFare=Math.max(maxFare,G.fare)}
      return {maxFare,prices,rating,hours,level:G.level}});
    ok('tips: following every tip for 200 hours never takes ticket prices above 120%',r.maxFare<=1.2+1e-9,JSON.stringify(r));
    ok('tips: a rating tip shows for under a fifth of the hours',r.rating<r.hours*0.2,JSON.stringify(r));
    if(errs.length)ok('tips: no page errors while following tips',false,errs[0]);
    await ctx.close()}

  const {ctx,page,errs}=await open(undefined,null,false,{seed:2,still:true});
  const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,out={},lv0={...G.lv};G.tour.done=1;G.tip4x=1;
    // the rating tip: near the need only, and quoting the change shown
    const need=S.LEVELS[G.level+1].req.rep;G.clock=600;
    const rating=rep=>{G.rep=rep;R.repH=[[G.clock-180,rep+8],[G.clock-120,rep+5]];R.repHG=G;R.repEv=[[G.clock-30,'queues',-6,-6]];const a=S.advise();return a&&a.text};
    out.near=rating(need+2);out.far=rating(need+15);
    // late departures with every upgrade for them bought: no price tip
    for(const k of S.R.effects.REPWHY.late[1])G.lv[k]=S.capOf(k);
    G.rep=need;R.repH=[[G.clock-180,need+6]];R.repEv=[[G.clock-30,'late',-9,-9]];G.fare=1;G.cash=1e6;
    const lt=S.advise();out.late=lt&&{text:lt.text,go:lt.go};
    // crowds with every upgrade bought: prices only up to 120%
    for(const k of S.R.effects.REPWHY.queues[1])G.lv[k]=S.capOf(k);
    R.repEv=[[G.clock-30,'queues',-9,-9]];G.fare=1.1;const q1=S.advise();G.fare=1.2;const q2=S.advise();
    out.fare11=q1&&q1.go&&q1.go[1];out.fare12=q2&&q2.go&&q2.go[1];
    R.repEv=[];R.repH=[];G.rep=need+20;G.fare=1;Object.assign(G.lv,lv0);
    return out});
  ok('tips: the rating tip shows near the next level\'s need, quoting the fall in the rating shown',/fell 8 points/.test(r.near||'')&&!/fell/.test(r.far||''),JSON.stringify([r.near,r.far]));
  ok('tips: late departures with every upgrade bought never point at ticket prices',r.late&&!/data-fare/.test(r.late.go[1])&&!/price/i.test(r.late.text),JSON.stringify(r.late));
  ok('tips: crowds with every upgrade bought suggest prices only while they are under 120%',/data-fare/.test(r.fare11||'')&&!/data-fare/.test(r.fare12||''),JSON.stringify([r.fare11,r.fare12]));

  const c=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,out={};
    // a coffee cart at its top level, turning people away
    const j=G.shops.findIndex((x,k)=>S.shopOpen(k)),tech=G.tech;G.tech=Object.assign({},tech,{c_cafe:1});G.shops[j]={type:0,lvl:4,earned:0,spent:50};R.awayH={[j]:12};
    const a=S.cafeTip();G.tech=tech;out.cart=a&&{text:a.text,go:a.go[1]};G.shops[j].lvl=2;const b=S.cafeTip();out.low=b&&b.go[1];G.shops[j]=null;R.awayH={};
    // a purchase tip holds back the cash the goal's purchase needs
    G.gdone={};for(const g of S.GOALS){if(g.id==='a2')break;G.gdone[g.id]=1}
    const gc=S.goalCost(),l0=G.lv.lanes,s0=G.lv.sectech;G.lv.sectech=S.capOf('sectech');while(S.upBuyable('lanes')&&S.upCost('lanes')<=0.1*gc.c)G.lv.lanes++;out.lc=S.upCost('lanes');R.secQ.length=0;for(let i=0;i<60;i++)R.secQ.push({});
    G.cash=gc.c+5;const held=S.advise();G.cash=gc.c*20;const free=S.advise();R.secQ.length=0;
    out.gc=gc;out.held=held&&held.k;out.free=free&&free.k;G.lv.lanes=l0;G.lv.sectech=s0;
    return out});
  ok('tips: a café tip at its top level suggests a roomier kind, never an upgrade',c.cart&&!/data-shopup/.test(c.cart.go)&&!/Upgrading/.test(c.cart.text)&&/data-shopup/.test(c.low||''),JSON.stringify(c));
  ok('tips: an upgrade tip holds back the cash the current goal needs',c.gc&&c.gc.k==='stand'&&!['lanes','sectech'].includes(c.held)&&['lanes','sectech'].includes(c.free),JSON.stringify(c));

  const f=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,out={};
    // partner airlines hold the gates: buy planes of your own
    for(const i of [0,1,2,3])G.stands[i].built=true;G.fleet=[{type:0,st:'away',readyAt:0,wear:0}];
    const keep=R.st.map(s=>s.F);for(const i of [0,1,2])R.st[i].F={partner:{name:'x'}};R.ptG=null;
    const a=S.fleetRec();out.more=a&&{kind:a.kind,text:a.text,tip:a.tip};R.st.forEach((s,i)=>s.F=keep[i]);
    // overnight checks service a worn plane at the gate, and the service tip goes while they're on
    G.fleet=[{type:0,st:'gate',gate:0,readyAt:0,wear:9},{type:0,st:'base',readyAt:0,wear:9}];G.cash=1e6;
    const t1=S.advise();out.tipOn=t1&&t1.text;S.turnChecks();out.gateWear=G.fleet[0].wear;out.baseWear=G.fleet[1].wear;
    G.pol=Object.assign(G.pol||{},{checks:false});const t2=S.advise();out.tipOff=t2&&t2.text;G.pol.checks=true;
    return out});
  ok('tips: partner airlines holding the gates bring a recommendation to buy planes of your own',f.more&&f.more.kind==='more'&&/Partner airlines hold about 3 of your 4 gates/.test(f.more.tip),JSON.stringify(f.more));
  ok('tips: overnight checks service a worn plane at the gate, and the service tip shows only while they are off',
    f.gateWear===0&&f.baseWear===9&&!/overdue a service/.test(f.tipOn||'')&&/overdue a service/.test(f.tipOff||''),JSON.stringify(f));
  if(errs.length)ok('tips: no page errors',false,errs[0]);
  await ctx.close();

  // a level 9 day: no tip names an upgrade at its top level, or a café upgrade at MAX
  {const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;R.sim=true;const bad=[];let n=0;
      for(let step=0;step<24*60*4;step++){S.update(0.25);if(step%20)continue;const a=S.advise();if(!a)continue;n++;
        if(a.k&&!S.upBuyable(a.k))bad.push(a.k);const m=a.go&&/data-shopup="(\d+)"/.exec(a.go[1]);if(m&&G.shops[+m[1]].lvl>=4)bad.push('shop'+m[1])}
      return {n,bad:bad.slice(0,4)}});
    ok('tips: no tip over a level 9 day names an upgrade already at its top level',!r.bad.length,JSON.stringify(r));
    if(errs.length)ok('tips: no page errors on the level 9 save',false,errs[0]);
    await ctx.close()}

  // buying from a tip at 1440 x 900 flies the camera to the check-in hall, below the map's first view
  {const {ctx,page,errs}=await open({width:1440,height:900},null,false,{still:true});
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;G.tour.done=1;G.tip4x=1;G.cash=1e5;
      R.ciQ.length=0;for(let i=0;i<80;i++)R.ciQ.push({});S.focus('all');R.cam.tx=null;const y0=R.cam.y;
      R.tipSig=null;S.renderTip();const b=document.querySelector('#tip [data-tipbuy]');const k=b&&b.dataset.tipbuy;if(b)b.click();R.ciQ.length=0;
      const ty=R.cam.ty,z=R.cam.z,vh=R.sh/S.viewK();return {k,y0,ty,z,sec:S.UPG[k]&&S.UPG[k].sec,inView:ty!=null&&ty<=700&&ty+vh>=700}});
    ok('tips: buying from a tip flies the camera to the hall it bought for',r.k&&r.sec==='Check-in'&&r.inView,JSON.stringify(r));
    if(errs.length)ok('tips: no page errors on a tip purchase',false,errs[0]);
    await ctx.close()}
}
