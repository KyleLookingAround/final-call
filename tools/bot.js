// in-page bot; injected via page.addScriptTag
window.BOT=function(opts){
  const S=__sim;S.R.sim=true;opts=opts||{};
  const log=[];let lastLvl=-1,lastH=-1;const lvlAt={};
  function G(){return S.G}
  function best(){ // best unlocked aircraft index by AC_ORDER
    let b=null;for(const t of S.AC_ORDER){const a=S.AIRCRAFT[t];if(a.freighter)continue;if(S.has('ac:'+t)&&(!a.fire||G().lv.fire>=a.fire))b=t}return b}
  const rank=t=>S.AC_ORDER.indexOf(t);
  const PRI=opts.pri||['n_med','a_atc','t_self','c_cabin','t_board','a_hangar','c_cafe','r_coach','n_sun','a_crews','n_cargo','n_neo','r_rail','t_border','t_fast','t_care','r_homes','t_roster','a_weather','c_bar','t_board2','a_fire','n_long','c_loyal','r_tram','r_sites','r_stn','a_runway','t_bags','c_duty','a_fuel','r_roads','n_promo','c_hotel','r_net','r_venues','a_solar','n_alliance','n_wide','c_lux','r_metro','t_mover','a_tower','n_cargohub','r_city','r_hsr','t_mall','a_saf','c_spa','t_icon'];
  function act(){
    const g=G(),reserve=opts.reserve??50;
    // masterplan: approve in priority order
    // layouts (only with opts.layouts:true; the baselines are for an airport that never rebuilds): approve the next one
    // on the path before other plans, keeping points for it once its level is reached, and rebuild into the furthest
    // approved one when it's affordable twice over and no other rebuild is under way
    let hold=false;
    if(opts.layouts){const path=opts.layoutPath||['remote','sat','star'];
      const next=path.map(id=>S.TECH.find(x=>x.id==='l_'+id)).find(T=>T&&S.techState(T)!=='done');
      if(next){const st=S.techState(next);if(st==='ready')S.research(next.id);else hold=st==='pts'}
      const target=[...path].reverse().find(id=>S.has('lay:'+id));
      if(target&&target!==g.layout&&!g.layoutNext&&S.canBuild()&&g.cash>=S.LAYOUTS[target].cost*2+reserve&&path.indexOf(target)>path.indexOf(g.layout))S.rebuildLayout(target)
      // mobile lounges for remote stands, once some are built and they're affordable twice over
      if(!g.lounges&&S.STAND_KIND.some((k,i)=>k==='remote'&&g.stands[i].built)&&S.canBuild()&&g.cash>=S.LOUNGES.cost*2+reserve)S.buyLounges()}
    for(let n=0;n<4&&!hold;n++){const T=PRI.map(id=>S.TECH.find(x=>x.id===id)).find(T=>T&&S.techState(T)==='ready')||S.TECH.find(T=>T.b!=='lay'&&S.techState(T)==='ready');if(!T||!S.research(T.id))break}

    if(g.level>=4&&S.TECH.some(T=>S.techState(T)==='pts')&&g.cash>S.consultCost()*(opts.ptMul??6)+reserve)S.buyPoint();
    if(!opts.noBuyLow&&g.rival&&!g.rival.owned&&g.level>=8&&g.cash>S.rivBuyCost()*1.1)S.buyRival();
    // routes: open the biggest market the fleet can reach
    if(opts.routes!==false){const own=g.fleet.filter(f=>!f.sold&&!S.AIRCRAFT[f.type].freighter),mt=Math.max(0,...own.map(f=>S.AIRCRAFT[f.type].tier));
      const cand=S.CITIES.filter(c=>!g.routes[c[0]]&&c[2]<=mt&&S.has('rt:'+c[2])).sort((a,b)=>b[2]-a[2]||S.cityMarket(b[0])-S.cityMarket(a[0]));
      let sup=0,mk=0;for(const c in g.routes){sup+=S.rsOf(c).s;mk+=S.cityMarket(c)}
      if(sup>=mk*(opts.rtSat??0.75))for(const c of cand){if(g.cash>=S.ROUTE_FEE[c[2]]*(opts.rtMul??1.5)+reserve){S.openRoute(c[0]);break}}}
    // service
    g.fleet.forEach((f,j)=>{if(f.sold)return;const c=S.serviceCost(f);if((f.wear||0)>=6&&g.cash>c+reserve*0.2){if(S.buy(c))f.wear=0}});
    // fleet: keep enough planes for the gates, upgrade to better types
    {const gates=S.builtCount(),own=g.fleet.filter(f=>!f.sold);const bt=best();
      const ratio=[1.7,1.8,2,2.4,2.8][bt!=null?S.AIRCRAFT[bt].tier:0]*(opts.fleetMul??1);
      const target=Math.ceil(gates*ratio);
      if(own.length<target){for(let k=S.AC_ORDER.length-1;k>=0;k--){const t=S.AC_ORDER[k],a=S.AIRCRAFT[t];if(a.freighter)continue;if(S.has('ac:'+t)&&(!a.fire||g.lv.fire>=a.fire)&&g.cash>=a.cost*(own.length<gates?1:1.4)+reserve){if(a.tier>=4&&!g.pierB)continue;S.buyAircraft(t);break}}}
      else if(bt!=null){const worst=own.filter(f=>f.st==='base'&&!S.AIRCRAFT[f.type].freighter).sort((x,y)=>rank(x.type)-rank(y.type))[0];const a=S.AIRCRAFT[bt];
        if(worst&&rank(worst.type)<rank(bt)&&g.cash>=a.cost*(opts.acMul??1.6)+reserve){S.buyAircraft(bt);worst.sold=true;const v=S.sellValue(worst);g.cash+=v;g.revBy.assets+=v}}
    }
    {const fr=g.fleet.filter(f=>!f.sold&&S.AIRCRAFT[f.type].freighter).length,want=opts.freighters===false?0:Math.floor(S.builtCount()/4);if(S.has('ac:7')&&fr<want&&g.cash>S.AIRCRAFT[7].cost*2+reserve)S.buyAircraft(7)}
    // stands & pier
    for(const i of S.STAND_ORDER){if(S.standBuyable(i)&&S.canBuild()&&g.cash>=S.STAND[i].cost*1.1+reserve){S.buyStand(i)}}
    if(!g.pierB&&!S.isBuilding('pier:B')&&g.level>=S.PIER.lvl&&S.canBuild()&&g.cash>=S.PIER.cost*1.1)S.buyPier();
    let goal=0;for(const i of S.STAND_ORDER)if(S.standBuyable(i)){goal=S.STAND[i].cost;break}
    if(!goal&&!g.pierB&&!S.isBuilding('pier:B')&&g.level>=S.PIER.lvl)goal=S.PIER.cost;
    const lim=goal?goal*(opts.saveFrac??0.12):1e18;
    // methods
    for(const m of S.METHODS){if(!g.methods[m.id]&&S.has('meth:'+m.id)&&g.cash>=m.cost*2.5+reserve){if(S.buy(m.cost)){g.methods[m.id]=true}}}
    const bm=[...S.METHODS].reverse().find(m=>g.methods[m.id]);if(bm)g.stands.forEach(s=>s.method=opts.method||bm.id);
    g.stands.forEach(s=>{if(s.built&&!s.rear&&g.cash>=1500+reserve&&S.buy(450))s.rear=true});
    // shops
    // a shop unit opens once the stands around it are built: unit j of n goes with the (j*stands/n)th stand bought
    g.shops.forEach((sh,j)=>{if(!S.shopOpen(j)||S.builtCount()<=Math.floor(j*S.SIDX.length/S.SHOP_X.length))return;
      if(!sh){if(goal&&goal<g.cash*0.5)return;let pick=-1;S.SHOPS.forEach((t,k)=>{if(S.has('shop:'+t.id)&&g.cash>=t.cost*2+reserve)pick=k});if(pick>=0&&S.buy(S.SHOPS[pick].cost))g.shops[j]={type:pick,lvl:0,earned:0,spent:S.SHOPS[pick].cost}}
      else if(sh.lvl<4){const c=S.shopUpCost(sh);if(g.cash>=c*2.5+reserve&&S.buy(c)){sh.spent+=c;sh.lvl++}}});
    // fares: raise when rating sags, drift back when it's healthy
    if(opts.fare!==false&&g.clock>=(window._fareT||0)){window._fareT=g.clock+120;
      if(g.rep<70&&g.fare<2.5)g.fare=Math.round((g.fare+0.1)*10)/10;else if(g.rep>=92&&g.fare>1)g.fare=Math.round((g.fare-0.1)*10)/10}
    // region: transport and development
    if(opts.region!==false&&S.NODES){
      const plan=opts.plan||[['bus',['air','mil','hbc']],['bus',['air','hbs','doc']],['coach',['air','cas']],['coach',['air','low']],['bus',['air','brk','eas']],['bus',['hbc','old']],
        ['tram',['air','mil','hbc','old']],['tram',['doc','hbs','hbc','old']],['rail',['air','ash','cas']],['rail',['air','brk','eas']],['tram',['air','ano','fel']],
        ['metro',['air','mil','hbc','old']],['hsr',['air','low']],['metro',['doc','hbs','hbc']]];
      for(const [m,st] of plan){const same=L=>L.mode===m&&L.stops.join()===st.join();if(Object.values(g.lines).some(same)||g.builds.some(b=>b.lid&&same(b)))continue;const q=S.lineQuote(m,st,null);if(!q.ok)continue;if(g.cash>=q.cost*2.2+reserve&&g.builds.length<1+g.lv.crews){S.orderLine(m,st,[],null)}break}
      for(const L of Object.values(g.lines)){const st=S.R.reg&&S.R.reg.lines[L.id];if(!st||!st.f)continue;const fq=S.MODES[L.mode].freqs,fi=fq.indexOf(L.freq);
        if(!(g.set&&g.set.autoLines)){if(st.baseLoad>0.85&&fi<fq.length-1)L.freq=fq[fi+1];else if(st.baseLoad<0.3&&fi>0&&st.rev<st.ops)L.freq=fq[fi-1];}
        if(st.baseLoad>0.9&&fi===fq.length-1&&(L.cars||0)<2){const cc=Math.round(S.MODES[L.mode].fix*1.5*((L.cars||0)+1));if(g.cash>cc*2&&S.buy(cc))L.cars=(L.cars||0)+1}
        if(!(g.set&&g.set.autoLines)&&!L.night&&['tram','rail','metro'].includes(L.mode))L.night=true}
      if(opts.stn!==false)for(const [n,k] of [['mil','pr'],['hbc','hub'],['air','hub'],['brk','pr']]){const u=S.STN_UP[k];if(S.has('stn:'+k)&&!(g.stn&&g.stn[n]&&g.stn[n][k])&&S.linesAt(n).length&&g.cash>u.cost*5+reserve&&S.buy(u.cost)){(g.stn||(g.stn={}))[n]=Object.assign(g.stn[n]||{},{[k]:1})}}
      const dp={docks:'stadium',mill:'bizpark',north:'logistics',castle:'uni',fell:'themepark',sea:'wind',centre:'techcampus',roads:'lowtraffic'};
      for(const pl in dp){if(g.dev[pl]||S.isBuilding('dev:'+pl))continue;const d=S.DEV[dp[pl]];if(S.has('dev:'+dp[pl])&&g.cash>=d.cost*1.5+reserve&&S.canBuild())S.buildDev(pl,dp[pl])}
    }
    // follow the tip first
    {const a=S.advise&&S.advise();if(a&&a.k&&g.cash>=a.c+reserve*0.5)S.buyUpgrade(a.k);}
    // upgrades: cheapest buyable
    for(let n=0;n<4;n++){let bk=null,bc=1e18;for(const k in S.UPG){if(!S.upBuyable(k))continue;if(S.UPG[k].build&&!S.canBuild())continue;const c=S.upCost(k);if(c<bc){bc=c;bk=k}}
      if(bk&&bc<=lim&&g.cash>=bc*(opts.upMul??1.3)+reserve)S.buyUpgrade(bk);else break}
  }
  function snap(){const g=G();const D=S.dayOf(g.clock);const on=g.flights?Math.round(g.ontime/g.flights*100):0;
    return {d:D,h:Math.floor(g.clock/60)%24,cash:Math.round(g.cash),earned:Math.round(g.earned||0),lvl:g.level,rep:Math.round(g.rep),gates:S.builtCount(),daily:Math.round(S.dailyPax()),flown:g.flown,on,fleet:Object.entries(g.fleet.filter(f=>!f.sold).reduce((o,f)=>{const n=S.AIRCRAFT[f.type].short;o[n]=(o[n]||0)+1;return o},{})).map(e=>e[0]+'x'+e[1]).join(','),idle:S.R.st.filter((x,k)=>g.stands[k].built&&!x.F).length,partner:Math.round((g.revBy.handling||0)/1000),up:Object.values(g.lv).reduce((a,b)=>a+b,0),upk:Math.round(S.upkeepRate()),rate:Math.round(g.rate*60),q:[S.R.ciQ.length,S.R.secQ.length,S.R.arrQ.length,S.R.pax.length].join("/"),rw:S.R.rwy.q.length,why:JSON.stringify(Object.fromEntries(Object.entries(S.R.repWhy||{}).map(e=>[e[0],Math.round(e[1])]))),_w:(S.R.repWhy={}),fare:g.fare,riv:g.rival?(g.rival.owned?'own':Object.keys(g.rival.routes).length+'r/'+Math.round((S.rivMix()??1)*100)+'%'):'-',crews:(g.crews||[]).length,chal:g.chal?g.chal.sets||0:0,st:Object.keys(g.stamps||{}).length,T:S.R.reg?Math.round(S.R.reg.T*100):0,tsh:S.R.reg?Math.round(S.R.reg.share*100):0,cong:S.R.reg?Math.round(S.R.reg.cong*100):0,lines:Object.values(g.lines||{}).map(L=>S.lineCode(L)+':'+L.freq+(S.R.reg&&S.R.reg.lines[L.id]?'/'+Math.round(S.R.reg.lines[L.id].riders):'')).join(' '),rid:S.R.reg?Math.round(S.R.reg.riders):0,tp:S.R.reg?Math.round(S.R.reg.rev-S.R.reg.ops):0,dev:Object.values(g.dev||{}).join(' '),evd:g.evDone||0,wt:g.reports.filter(Boolean).map(r=>r.wait.toFixed(1)+"/"+r.pax).join(" "),left:(()=>{let n=0,c=0;for(const k in S.UPG){if(S.upLocked(k))continue;const cap=S.capOf(k);if(S.G.lv[k]<cap){n+=cap-S.G.lv[k];c+=S.upCost(k)}}return n+"/$"+Math.round(c)})(),rev:JSON.stringify(Object.fromEntries(Object.entries(g.revBy).map(e=>[e[0],Math.round(e[1]/1000)]))),D:(()=>{const D=S.derived();return [D.desks,D.kiosks,D.online.toFixed(2),D.checkin.toFixed(2),D.lanes,D.sec.toFixed(2),D.officers,D.egates].join(",")})(),lv:Object.entries(g.lv).filter(e=>e[1]).map(e=>e[0]+e[1]).join(" "),pts:g.pts||0,tech:Object.keys(g.tech||{}).length,routes:Object.keys(g.routes||{}).length,rl:(()=>{let s=0,n=0;for(const c in g.routes){const r=S.rsOf(c);if(r.tn){s+=r.lf*r.n;n+=r.n}}return n?Math.round(s/n*100):0})(),rsup:(()=>{let a=0,b=0;for(const c in g.routes){a+=S.rsOf(c).s;b+=S.cityMarket(c)}return Math.round(a)+'/'+Math.round(b)})()}}
  return {run(mins,dt){dt=dt||0.1;const g0=G();const end=g0.clock+mins;let nextAct=0;
      while(G().clock<end){S.update(dt);const g=G();
        if(g.clock>=nextAct){nextAct=g.clock+5;act();S.checkGoals()}
        if(g.level!==lastLvl){lastLvl=g.level;(window.SAVES||(window.SAVES={}))[g.level]=JSON.stringify(g);lvlAt[g.level]=+(g.clock/60-6).toFixed(1)}
        const h=Math.floor(g.clock/60);if(h!==lastH){lastH=h;if(h%(opts.every||6)===0)log.push(snap())}}
      return {log:log.splice(0),lvlAt,snap:snap()}}}
};
