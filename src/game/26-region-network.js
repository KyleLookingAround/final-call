/* ---------- the network model: whole journeys, with changes between lines ---------- */
function airPerHour(){const h=G.hours;if(!h.length)return 0;const cur=h[h.length-1],prev=h.length>1?h[h.length-2]:null,m=G.clock%60;const v=Math.max(prev?(prev.pax||0):0,m>10?(cur.pax||0)*60/m:0);return isFinite(v)?v:0}
function localProfile(){const h=hour();return h>=7&&h<9.5?1.35:h>=16&&h<19?1.3:h>=9.5&&h<16?0.9:h>=19&&h<23?0.6:h>=5.5&&h<7?0.7:0.15}
function devLocalMulN(n){let m=1;for(const P of PLOTS)if(P.node===n){const d=devAt(P.id);if(d&&d.locals)m+=d.locals-1}return m}
function nodePop(n){const N=NODES[n];return N.sh?placePop(N.pl)*N.sh:0}
function nodeAttr(){ // jobs and visitors drawn to each station
  const jobs={},tour={},sea=seasonOf(dayOf(G.clock)).name;
  for(const P of PLOTS){const d=devAt(P.id);if(!d||!P.node)continue;if(d.jobs)jobs[P.node]=(jobs[P.node]||0)+d.jobs;if(d.tour)tour[P.node]=(tour[P.node]||0)+d.tour*(d.summer?(sea==='Summer'?2:sea==='Winter'?0.4:1):1)}
  jobs.air=(jobs.air||0)+8+3*builtCount()+2*G.level;jobs.ano=(jobs.ano||0)+2;
  return {jobs,tour};
}
function carTimes(C){ // minutes by car between stations (parking included), and the roads each trip uses
  const spd=r=>(r===2?34:22)*(1-0.45*C)*(devOn('ringroad')&&r===1?1.15:1),park=n=>NODES[n].pl==='city'?(devOn('lowtraffic')?14:8):n==='air'?4:2,T={},P={};
  for(const s of NODE_IDS){const d={[s]:0},pv={},done=new Set();
    for(;;){let u=null;for(const k in d)if(!done.has(k)&&(u==null||d[k]<d[u]))u=k;if(u==null)break;done.add(u);
      for(const e of EDGES){if(e.water||!e.road)continue;const v=e.a===u?e.b:e.b===u?e.a:null;if(!v)continue;const w=(e.len+(e.extra||0))/spd(e.road)/(rwOn(e.id)?0.6:1);if(d[v]==null||d[u]+w<d[v]){d[v]=d[u]+w;pv[v]=[u,e]}}}
    T[s]={};for(const n of NODE_IDS)T[s][n]=n===s?0:(d[n]??999)+park(n);P[s]=pv}
  T.P=P;return T;
}
function svcGraph(nominal,prevL){ // every ride you can take from each station; parallel lines share riders by frequency
  const adj={},info={},grp={},rt=G.lv.rtinfo?0.7:1;NODE_IDS.forEach(n=>adj[n]=[]);
  for(const [a,b,t] of WALKS){adj[a].push({walk:1,to:b,t});adj[b].push({walk:1,to:a,t})}
  for(const L of Object.values(G.lines||{})){const f=lineFreq(L,nominal);if(f<=0)continue;const T=lineTiming(L);if(!T)continue;info[L.id]=T;
    const M=MODES[L.mode],pl=prevL&&prevL[L.id],crowd=Math.max(0,((pl&&pl.baseLoad)||0)-0.9)*40;
    const fp=M.fare*fareMul(L)*(L.mode==='hsr'||L.mode==='coach'?0.8:1.2),bonus=L.mode==='water'&&devOn('marina')?6:0,idx=[];
    L.stops.forEach((n,i)=>{if(serves(L,n))idx.push(i)});
    for(const i of idx)for(const j of idx){if(i===j)continue;const a=Math.min(i,j),b=Math.max(i,j),key=L.stops[i]+'|'+L.stops[j];
      (grp[key]||(grp[key]=[])).push({L,i,j,f,ride:T.arr[b]-T.dep[a],crowd,fp,bonus,sy:L.sync&&L.stops[i]==='air'?0.5:1})}}
  for(const key in grp){const g=grp[key],[from,to]=key.split('|');let best=1e9;for(const a of g)best=Math.min(best,a.ride+a.crowd);
    const att=g.filter(a=>a.ride+a.crowd<=best*1.3+3);let F=0;for(const a of att)F+=a.f;const avg=k=>att.reduce((s,a)=>s+a[k]*a.f,0)/F;
    adj[from].push({from,to,wait:clamp(30/F,1.5,40)*rt*avg('sy'),ride:avg('ride'),crowd:avg('crowd'),fp:avg('fp'),bonus:avg('bonus'),alts:att.map(a=>({L:a.L,i:a.i,j:a.j,w:a.f/F}))})}
  return {adj,info};
}
function transitGT(src,adj,tix){ // cheapest journeys from one station (must ride at least one line)
  const dist=new Map(),prev=new Map(),done=new Set(),Q=[[0,src,0]];dist.set(src+'|0',0);
  while(Q.length){let bi=0;for(let k=1;k<Q.length;k++)if(Q[k][0]<Q[bi][0])bi=k;const [du,u,b]=Q[bi];Q[bi]=Q[Q.length-1];Q.pop();const key=u+'|'+b;if(done.has(key))continue;done.add(key);
    for(const s of adj[u]){let c,nb;if(s.walk){c=s.t;nb=b}else{c=Math.max(0.5,s.wait+s.ride+s.crowd+(b?(stnUp(u,'hub')?2:5)+(tix?0:s.fp):s.fp)-s.bonus);nb=1}
      const k2=s.to+'|'+nb,nd=du+c;if(nd<(dist.get(k2)??1e9)){dist.set(k2,nd);prev.set(k2,[key,s]);Q.push([nd,s.to,nb])}}}
  const gt={},legs={};
  for(const n of NODE_IDS){if(n===src)continue;const k=n+'|1',v=dist.get(k);if(v==null)continue;gt[n]=v;const Ls=[];let cur=k;while(prev.has(cur)){const [pk,s]=prev.get(cur);if(!s.walk)Ls.unshift(s);cur=pk}legs[n]=Ls}
  return {gt,legs};
}
const logit=(g,c,b,s)=>1/(1+Math.exp((g-c+b)/s));
function regionTick(){
  const old=R.reg,reg={lines:{},T:0,share:0,airSh:[],rev:0,ops:0,riders:0,flyers:0,locals:0,boardAt:{},q:{},acc:{},cong:old&&isFinite(old.cong)?old.cong:0.3,at:G.clock};
  R.reg=reg;const lines=Object.values(G.lines||{}),prevL=old?old.lines:{};
  // weather over each corridor, and how busy shared track is
  reg.ewx={};for(const e of EDGES){const m=ptOn(e.P,e.len/2),w=wxAt(m[0],m[1]);if(w&&w.d<0.9)reg.ewx[e.id]=w.c.type}
  reg.over={};for(const L of lines){const RE=routeEdges(L.mode,L.stops),tm=trackOf(L.mode);if(!RE||!tm||!TRACKCAP[tm])continue;const f=lineFreq(L,true);for(const {e} of RE){const k=e.id+':'+tm;reg.over[k]=(reg.over[k]||0)+f/TRACKCAP[tm]}}
  let surge=0,bizSurge=0;for(const e of (G.evq||[])){const E=EVT[e.type],dtm=G.clock-e.at;if(Math.abs(dtm)<240){const b=1-Math.abs(dtm)/240;if(E.biz)bizSurge+=E.surge*b;else surge+=E.surge*b}}
  reg.surge=surge;reg.bizSurge=bizSurge;
  // who lives and works near each station
  const {jobs,tour}=nodeAttr(),Pn={},An={};
  for(const n of NODE_IDS){Pn[n]=nodePop(n)*(NODES[n].far?0.25:1);An[n]=(Pn[n]+1.5*(jobs[n]||0)+2*(tour[n]||0))*devLocalMulN(n)}
  const car=carTimes(reg.cong),roadF={},addCar=(a,b,V)=>{const pv=car.P[a];let v=b,g=0;while(v!==a&&pv[v]&&g++<20){const [u,e]=pv[v];roadF[e.id]=(roadF[e.id]||0)+V;v=u}},tix=!!G.lv.tickets,act=svcGraph(false,prevL),nom=svcGraph(true,prevL),GT={},LEG={},GTn={};
  for(const n of NODE_IDS){const a=transitGT(n,act.adj,tix);GT[n]=a.gt;LEG[n]=a.legs;GTn[n]=transitGT(n,nom.adj,tix).gt}
  reg.GT=GT;reg.car=car;
  const F={};for(const L of lines){const ns=Math.max(1,L.stops.length-1);F[L.id]={seg:new Array(ns).fill(0),sb:new Array(ns).fill(0),board:0,fly:0,loc:0,ev:0,at:{}}}
  const add=(o,d,V,kind)=>{const Ls=LEG[o]&&LEG[o][d];if(!Ls||!(V>0))return;for(const s of Ls){reg.boardAt[s.from]=(reg.boardAt[s.from]||0)+V;for(const x of s.alts){const f=F[x.L.id],v=V*x.w;if(!f)continue;const a=Math.min(x.i,x.j),b=Math.max(x.i,x.j);for(let q=a;q<b;q++){f.seg[q]+=v;if(kind!=='ev')f.sb[q]+=v}f.board+=v;f[kind]+=v;f.at[s.from]=(f.at[s.from]||0)+v}}};
  const legK=s=>{let c=0;for(const x of s.alts)c+=x.w*(reg.lines[x.L.id]?reg.lines[x.L.id].k:1);return c};
  // flyers: how many come by public transport, and how much demand good links add
  const air=airPerHour(),polShare=(tix?1.2:1)*(devOn('lowtraffic')?1.15:1)*(devOn('ringroad')?0.95:1);
  const qf=(g,far)=>g==null?0:far?clamp(2.4-(g+5)/110,0,1.2):clamp(1.5-(g+5)/60,0,1.2);
  let Dn=0;const fl=[];
  for(const n of NODE_IDS){if(n==='air'||n==='ano')continue;const far=NODES[n].far,w=(far?placePop('low'):nodePop(n))+1.5*(tour[n]||0)+0.5*(jobs[n]||0),k=far?0.00018:0.0006,pr=stnUp(n,'pr')?6:0,qn=qf(GTn[n].air!=null?GTn[n].air-pr:null,far),qa=qf(GT[n].air!=null?GT[n].air-pr:null,far);
    Dn+=w*qn*k;reg.q[n]=qn;const dA=w*qa*k;if(dA>0)fl.push([n,dA*qa/(qa+0.6)])}
  for(const x of fl){x[1]=x[1]/(1+Dn)*polShare;add(x[0],'air',air*x[1],'fly')}
  {let ws=0;const wn={};for(const n of NODE_IDS){if(n==='air'||n==='ano'||NODES[n].far)continue;wn[n]=nodePop(n);ws+=wn[n]}const sh={};for(const [n,v] of fl)sh[n]=v;for(const n in wn)addCar(n,'air',air*0.3*wn[n]/(ws||1)*Math.max(0,1-(sh[n]||0)*4))}
  reg.T=Math.min(0.7,Dn);
  // local trips between towns: transit or car
  const prof=localProfile();let Ut=0,Uv=0,Ua=0,Uav=0;
  for(let i=0;i<NODE_IDS.length;i++)for(let j=i+1;j<NODE_IDS.length;j++){const a=NODE_IDS[i],b=NODE_IDS[j];if(!Pn[a]&&!Pn[b])continue;
    const ct=car[a][b],U=LOCAL_K*(Pn[a]*An[b]+Pn[b]*An[a])/(1+Math.pow(ct/20,2))*prof;if(U<0.02)continue;
    let g=GT[a][b];if(g!=null&&(stnUp(a,'pr')||stnUp(b,'pr')))g-=6;let s=0;if(g!=null)s=Math.min(0.95,(0.2*clamp(1.5-g/60,0,1)+0.8*logit(g,ct,2,7))*polShare);
    Ut+=U;Uv+=U*s;if(a==='air'||b==='air'){Ua+=U;Uav+=U*s}add(a,b,U*s,'loc');addCar(a,b,U*(1-s))}
  reg.mshare=Ut?Uv/Ut:0;reg.airCommute=Ua?Uav/Ua:0;
  // how well each town is connected (drives growth)
  reg.accN={};for(const a of NODE_IDS){if(!NODES[a].sh||NODES[a].far)continue;let nu=0,de=0;for(const b of NODE_IDS){if(a===b)continue;de+=An[b];const g=GTn[a][b];if(g!=null)nu+=An[b]*logit(g,car[a][b],2,7)}reg.accN[a]=de?nu/de:0}
  for(const pid in PLACES){let s=0,ws=0;for(const n of NODE_IDS)if(NODES[n].pl===pid&&reg.accN[n]!=null){s+=NODES[n].sh*(0.5*reg.accN[n]+0.5*Math.min(1,reg.q[n]||0));ws+=NODES[n].sh}reg.acc[pid]=ws?s/ws:0}
  // event crowds ride the network to the venue and home again
  let evCar=0;
  for(const e of (G.evq||[])){const E=EVT[e.type],dtm=G.clock-e.at,inArr=dtm>-150&&dtm<0,inLeave=dtm>90&&dtm<210,v=plotNode(e.plot);
    if(!(inArr||inLeave)||!v||v==='air'){e.live=null;continue}
    const fans=e.att*E.ride/2.5,airS=EVSRC[e.type]??0.15;let Ps=0;for(const n of NODE_IDS)if(n!==v&&!NODES[n].far)Ps+=Pn[n];
    const live={fans,node:v,walk:0,car:0,trips:[],arr:inArr};
    for(const o of NODE_IDS){if(NODES[o].far)continue;const wo=o==='air'?airS:(1-airS)*Pn[o]/(Ps||1);if(!(wo>0))continue;const V=fans*wo;
      if(o===v){live.walk+=V;continue}
      const from=inArr?o:v,to=inArr?v:o,g=GT[from][to],s=g==null?0:logit(g,car[from][to],-15,8);
      if(s>0){add(from,to,V*s,'ev');live.trips.push([V*s,LEG[from][to]])}live.car+=V*(1-s);addCar(from,to,V*(1-s))}
    evCar+=live.car;e.live=live}
  // capacity, fares and running costs, line by line
  for(const L of lines){const f=F[L.id],M=MODES[L.mode],fr=lineFreq(L),rb=replOn(L.id),T=act.info[L.id]||lineTiming(L);
    const cap=fr*M.cap*(1+0.5*(L.cars||0))*(rb?0.4:1),pk=Math.max(0,...f.seg),pb=Math.max(0,...f.sb);
    const load=cap>0?pk/cap:0,baseLoad=cap>0?pb/cap:0,kk=load>1?1/load:1,rev=(f.board-(1-LOCAL_FARE)*f.loc)*kk*M.fare*fareMul(L)*(tix?0.9:1);
    let vh=M.vh*(1+0.35*(L.cars||0));if(ELECTRIC[L.mode]&&devOn('wind'))vh*=0.75;if(!ELECTRIC[L.mode]||L.mode==='tram')vh*=1-0.15*(G.lv.depot||0);
    const RT=T?T.RT:60,ops=fr*RT/60*vh*(L.sync&&serves(L,'air')?1.1:1);
    reg.lines[L.id]={f:fr,cap,load,baseLoad,k:kk,riders:f.board*kk,board:f.board,fly:f.fly*kk,loc:f.loc*kk,ev:f.ev,rev,ops,one:T?T.one:0,RT,seg:f.seg,sb:f.sb,at:f.at};
    reg.rev+=rev;reg.ops+=ops;reg.riders+=f.board*kk;reg.flyers+=f.fly*kk;reg.locals+=f.loc*kk}
  // flyers actually carried, and which lines they arrive on
  const airW={};let shC=0;
  for(const [n,s] of fl){const Ls=LEG[n].air;if(!Ls||!Ls.length)continue;let kk=1;for(const sv of Ls)kk=Math.min(kk,legK(sv));const eff=s*kk;shC+=eff;const last=Ls[Ls.length-1];if(last.to==='air')for(const x of last.alts)airW[x.L.id]=(airW[x.L.id]||0)+eff*x.w}
  reg.share=shC;reg.airSh=Object.entries(airW);
  for(const e of (G.evq||[]))if(e.live){let c=e.live.walk;for(const [V,Ls] of e.live.trips){let kk=1;for(const sv of (Ls||[]))kk=Math.min(kk,legK(sv));c+=V*kk}e.live.carried=c;e.live.trips=null}
  // traffic: people who don't ride, drive
  let popSum=0;for(const pid in PLACES)if(PLACES[pid].kind!=='far'&&pid!=='air')popSum+=placePop(pid);
  let pos=0,neg=0;for(const p in (G.dev||{})){const d=DEV[G.dev[p]];if(d&&d.cong){if(d.cong>0)pos+=d.cong;else neg+=d.cong}}
  if(devOn('logistics')&&lines.some(L=>L.freight))pos-=8;
  reg.road=(popSum/1000*60+pos)*(1-0.9*reg.mshare)+neg+evCar/400;reg.evCar=evCar;
  reg.cong=clamp((reg.road-20)/60,0,1);
  reg.roadF=roadF;reg.ce={};for(const e of EDGES)if(e.road&&!e.water)reg.ce[e.id]=clamp((roadF[e.id]||0)/(e.road===2?1400:700)*(0.6+0.8*reg.cong),0,1);
  const sea=seasonOf(dayOf(G.clock)).name;reg.jobs=devSum('jobs');let ts=0;for(const n in tour)ts+=tour[n];reg.tour=ts*(sea==='Summer'?1.25:1);
  reg.biz=reg.jobs*0.004*(1+bizSurge*5);reg.leis=reg.tour*0.004;
  reg.hsr=lines.some(L=>L.mode==='hsr'&&serves(L,'air')&&!lineDown(L));
  reg.parkMul=(1-reg.share)*(1-0.3*reg.cong)*(devOn('ringroad')?1.25:1)*(devOn('lowtraffic')?0.75:1);
  reg.wageMul=1-Math.min(0.12,0.2*reg.airCommute);
  reg.income=devSum('income');
  if(!R.evalMode)mgrSample(reg);
  if(!isNight()&&!R.evalMode){const bs=R.boardSum||(R.boardSum={});for(const n in reg.boardAt)bs[n]=(bs[n]||0)+reg.boardAt[n];R.boardN=(R.boardN||0)+1}
  const hr=Math.floor(G.clock/60);
  if(old&&old.hr!=null&&old.hr!==hr&&!R.evalMode){let c=0;for(const id in reg.lines){const l=reg.lines[id];if(l.baseLoad>1.05)c+=Math.min(2,(l.baseLoad-1)*3)}if(c)repAdj(-Math.min(3,c),'crowding');if(reg.cong>0.75)repAdj(-(reg.cong-0.75)*4,'traffic')}
  reg.hr=hr;
}
function regionMoney(dt){
  const r=R.reg;if(!r)return;
  if(r.rev>0)earn(r.rev*dt/60,'transit');if(r.ops>0)spend(r.ops*dt/60,'transitOps');
  if(r.income>0)earn(r.income*dt/60,'region');
}
function pickTransit(){
  const r=R.reg;if(!r)return null;let x=rnd();
  for(const [id,s] of r.airSh){if(x<s){const L=G.lines[id];if(!L||lineFreq(L)<=0)return null;const k=effKind(L);if(k==='train'&&!G.lv.rail)return null;return k}x-=s}
  return null;
}
function exitTarget(p){
  const tk=pickTransit();p.state='exitW';
  if(tk==='train'&&G.lv.rail){p.tx=40+rnd()*260;p.ty=704}
  else if(tk==='tram'){p.tx=40+rnd()*260;p.ty=789}
  else if(tk==='bus'){p.tx=236+rnd()*40;p.ty=641}
  else{p.tx=EXIT.x;p.ty=EXIT.y+(rnd()-0.5)*18}
}
function regionDay(){
  // towns grow towards what their housing, jobs and transport can support; busy stations sprout new buildings
  if(!G.pop)G.pop={};if(!G.tod)G.tod={};const r=R.reg,J=r?r.jobs:0,bs=R.boardSum||{},bn=R.boardN||0;
  for(const n of NODE_IDS){if(!NODES[n].sh||NODES[n].far)continue;const avg=bn?(bs[n]||0)/bn:0,tgt=clamp(avg/250,0,1),cur=G.tod[n]||0;G.tod[n]=Math.round((cur+(tgt-cur)*0.3)*100)/100}
  R.boardSum={};R.boardN=0;
  let wsum=0;const w={};
  for(const pid in PLACES){const pl=PLACES[pid];if(pl.kind==='far'||pid==='air')continue;w[pid]=pl.pop*(0.3+(r&&r.acc?r.acc[pid]||0:0));wsum+=w[pid]}
  const nz=G.noiseDay||0;G.noiseLast=nz;G.noiseDay=0;
  for(const pid in w){const pl=PLACES[pid];let tgt=pl.pop;if(pid==='mill'||pid==='brook'||pid==='city')tgt-=nz*(pid==='city'?0.4:0.25);PLOTS.forEach(p=>{if(p.place===pid){const d=devAt(p.id);if(d&&d.pop)tgt+=d.pop}});tgt+=J*0.9*w[pid]/(wsum||1);
    for(const n of NODE_IDS)if(NODES[n].pl===pid)tgt+=(G.tod[n]||0)*(pid==='city'?14:8);
    const cur=placePop(pid);G.pop[pid]=Math.round((cur+(tgt-cur)*0.2)*10)/10}
}

