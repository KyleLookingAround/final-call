/* ================= main update ================= */
function update(dt){
  G.clock+=dt;
  if(Math.floor(G.clock)!==R.lastMin){R.lastMin=Math.floor(G.clock);G.rate=G.rate*0.98+R.minEarn*0.02;R.minEarn=0;
    if(G.lv.roster&&G.auto&&R.lastMin%2===0)R.autoN={desks:clamp(Math.ceil(R.ciQ.length/6),1,OWN.desks()),lanes:clamp(Math.ceil(R.secQ.length/6),1,OWN.lanes()),officers:clamp(Math.ceil(R.arrQ.length/6),1,OWN.officers())};
    updateBuilds();dayTick();checkLevel();fleetTick();if(R.lastMin%360===0)managersTick();if(R.lastMin%30===0)crewTick();if(R.lastMin%60===0)recordsHour();if(R.lastMin%1440===180)nightChecks();if(pol('ads')&&R.lastMin%60===0)repAdj(-0.8,'ads');}
  if(G.clock>=R.nextEvent){R.nextEvent=G.clock+55+Math.random()*70;if(G.flights>=3)fireEvent()}
  const D=derived();
  spend(((D.desks*WAGE.desks+D.lanes*WAGE.lanes+D.officers*WAGE.officers)*(G.wageMul||1)*payMul()*(R.reg?R.reg.wageMul:1))/60*dt,'wages');
  if(G.crews.length)spend(G.crews.length*crewWage()/60*dt,'wages');
  spend(upkeepRate()/60*dt,'upkeep');
  if(G.loan>0)spend(G.loan*loanRate(G.loan)/60*dt,'interest');
  updateRunway(dt,D);updateTrain(dt);
  for(const i of SIDX)if(G.stands[i].built){updateStand(i,dt,D);stepDeplaneBridges(i,D,dt)}
  updateLandside(dt,D);updateStopVehicles(dt);
  updateWeather(dt);if(!R.reg||G.clock-R.reg.at>=5)regionTick();updateEvents(dt);regionMoney(dt);
  updateArrivals(dt,D);
  for(const p of R.pax){
    if(p.state==='bridge'||p.state==='aisle'||p.state==='dAisle'||p.state==='dBridge')moveTo(p,p.tx,p.ty,260,dt);
    else if(p.state==='sitting'){if(moveTo(p,p.tx,p.ty,140,dt))p.dead=true}
  }
  if(R.pax.some(p=>p.dead))R.pax=R.pax.filter(p=>!p.dead);
  if(!R.sim){for(const f of R.floaters)f.t+=dt;R.floaters=R.floaters.filter(f=>f.t<(f.big?2.2:1))}
}

