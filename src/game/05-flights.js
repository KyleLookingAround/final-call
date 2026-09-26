/* ================= flights ================= */
function seatPax(g,k,extra){const col=k%g.cols;return Object.assign({row:Math.floor(k/g.cols),col,ct:g.colCt[col],ais:g.colA[col],side:g.colS[col]+2*g.colA[col]},extra)}
function shuffled(n){const a=[...Array(n).keys()];for(let k=a.length-1;k>0;k--){const j=Math.floor(rnd()*(k+1));[a[k],a[j]]=[a[j],a[k]]}return a}
function pickPartner(i){
  const c=AC_ORDER.filter(t=>!AIRCRAFT[t].freighter&&AIRCRAFT[t].lvl<=G.level&&fitsGate(t,i));let tot=0;const w=c.map(t=>{const x=1+AIRCRAFT[t].lvl*1.4;tot+=x;return x});
  let r=rnd()*tot,t=c[0];for(let k=0;k<c.length;k++){r-=w[k];if(r<=0){t=c[k];break}}
  const pa=PARTNERS[Math.floor(rnd()*PARTNERS.length)];return {type:t,name:pa[0],code:pa[1],col:pa[2]};
}
const nightWin=()=>{const h=(G.clock/60)%24;return h>=23.5||h<5.5};
function curfewSoon(){if(!pol('curfew'))return false;const h=(G.clock/60)%24;return nightWin()||(h<23.5&&(23.5-h)*60<90)}
function allocFlight(i){
  if(curfewSoon()||layoutDrains(i))return null;
  const st=G.stands[i],S=R.st[i];let best=-1;
  G.fleet.forEach((f,j)=>{if(!f.sold&&f.st==='base'&&fitsGate(f.type,i)&&(best<0||(f.readyAt||0)<(G.fleet[best].readyAt||0)))best=j});
  if(best>=0)return newFlight(i,{fleet:best});
  if(st.partner!==false&&(S.idleT||0)>(researched('n_alliance')?2:5)&&!G.fleet.some(f=>!f.sold&&f.st==='away'&&fitsGate(f.type,i)&&f.back-G.clock<15))return newFlight(i,{partner:pickPartner(i)});
  return null;
}
function fleetTick(){for(const f of G.fleet)if(!f.sold&&f.st==='away'&&G.clock>=f.back){f.st='base';f.readyAt=f.back}}
/* passengers travel as business travellers, leisure travellers, families, groups, or people who need assistance */
const PTYPE={work:{carry:0.92,checked:0.12,spd:[1,1.35],shop:0.6,ft:3,prio:0.12},lei:{spd:[0.7,1.2],shop:1.15,ft:1,prio:0},fam:{carry:0.5,checked:0.9,spd:[0.64,0.86],shop:1.4,ft:0.5,prio:0},grp:{carry:0.85,checked:0.35,spd:[0.8,1.2],shop:1.3,ft:0.3,prio:0},prm:{carry:0.3,checked:0.85,spd:[0.46,0.52],shop:0.8,ft:0,prio:0}};
function buildManifest(geo,seatsN,booked,bRows,C,D,i,split){
  const b=C?C.biz:0.35,grpP=C&&GROUP_CITIES.has(C.code)?0.16:0.03,famP=(C&&C.sea==='summer'&&seaIdx()===1?0.26:0.15)*(1-b),cols=geo.cols,bizN=bRows*cols,taken=new Uint8Array(seatsN),out=[];
  const run=(n,from,to)=>{if(to<=from)return [];for(let tr=0;tr<10;tr++){const k=from+Math.floor(rnd()*(to-from)),r=[];for(let j=k;j<to&&r.length<n;j++){if(taken[j])break;r.push(j)}if(r.length===n)return r}const r=[];for(let j=from;j<to&&r.length<n;j++)if(!taken[j])r.push(j);return r};
  let left=booked,pid=0;
  while(left>0){
    const x=rnd();let type,n;
    if(x<0.025){type='prm';n=1}else if(x<0.025+b*0.85){type='work';n=1}
    else{const y=rnd();if(y<grpP){type='grp';n=4+Math.floor(rnd()*4)}else if(y<grpP+famP){type='fam';n=rnd()<0.5?3:4}else{type='lei';n=rnd()<0.55?2:1}}
    n=Math.min(n,left);let st=type==='work'?run(1,0,bizN):[];if(st.length<n)st=run(n,bizN,seatsN);if(st.length<n)st=run(n,0,seatsN);if(!st.length)break;
    st.forEach(k=>taken[k]=1);pid++;const T=PTYPE[type],lspd=T.spd[0]+rnd()*(T.spd[1]-T.spd[0]);let lead=null;
    st.forEach((k,m)=>{const p=seatPax(geo,k,{stand:i});p.lane=p.row>=split?1:0;
      const biz=p.row<bRows,kid=type==='fam'&&m>=2,carry=kid?false:rnd()<(biz?0.9:T.carry??D.carryP),checked=kid?false:rnd()<clamp(T.checked??(carry?0.2:0.75),0.02,0.95);
      Object.assign(p,{type,party:pid,kid,biz,prio:!biz&&!kid&&rnd()<D.prioP+T.prio,carry,checked,online:!checked&&rnd()<D.online,fast:false,spd:(type==='fam'||type==='grp')?lspd*(0.95+rnd()*0.1):lspd,rand:rnd(),wait:0,x:0,y:0,tx:0,ty:0,state:'new',spot:-1});
      p.psize=st.length;if(lead){p.leader=lead;p.rand=lead.rand}else lead=p;out.push(p)});
    left-=st.length;
  }
  // parties arrive together: shuffle whole parties, keeping members next to each other
  const parties=[];for(const p of out){const q=parties[parties.length-1];if(q&&q[0].party===p.party)q.push(p);else parties.push([p])}
  for(let k=parties.length-1;k>0;k--){const j=Math.floor(rnd()*(k+1));[parties[k],parties[j]]=[parties[j],parties[k]]}
  return parties.flat().reverse();
}
function newFlight(i,src){
  const st=G.stands[i];if(!st.built||!src) return null;
  const partner=src.partner||null,fl=partner?null:G.fleet[src.fleet];if(!partner&&(!fl||fl.sold))return null;
  const ac=AIRCRAFT[partner?partner.type:fl.type],D=derived(),S=R.st[i];
  const rear=(st.rear||STAND_KIND[i]==='remote')&&ac.tier>=1,geo=geom(ac),cols=geo.cols,seatsN=ac.rows*cols,P=paths(i,geo);
  // where it flies: your planes follow the dispatcher, partners fly their own schedules
  let dc=partner?null:pickRoute(ac);
  if(!dc){const pool=CITIES.filter(c=>c[2]<=ac.tier&&c[2]>=ac.tier-1&&c[0]!==G.lastDest);dc=pool[Math.floor(rnd()*pool.length)][0]}
  const C=CITY[dc],dest=[C.code,C.name];G.lastDest=C.code;
  const FR=!!ac.freighter,lf=partner?paxLF(dc,1):routeLF(dc,seatsN),booked=FR?0:Math.max(4,Math.round(seatsN*lf));
  S.geo=geo;S.P=P;
  const split=rear?Math.ceil(ac.rows/2):ac.rows,bRows=G.lv.business?(cols===4?2:3):0;
  const manifest=FR?[]:buildManifest(geo,seatsN,booked,bRows,C,D,i,split);
  const lastC=fl&&fl.last&&CITY[fl.last[0]]?fl.last:null;
  const from=lastC||(()=>{const pool=CITIES.filter(c=>c[2]<=ac.tier&&c[0]!==C.code);const c=pool[Math.floor(rnd()*pool.length)];return [c[0],c[1]]})(),FC=CITY[from[0]];
  if(fl){fl.last=dest;fl.lastTier=ac.tier;fl.st='gate';fl.gate=i}
  // inbound leg: the aircraft lands full of passengers from its last destination
  const inN=FR?0:Math.max(4,Math.round(seatsN*clamp(paxLF(from[0],1)*0.95,0.1,1)));
  const occIn=new Int8Array(seatsN).fill(-1),fb=FC?FC.biz:0.35;
  const arrPax=shuffled(seatsN).slice(0,inN).map(k=>{occIn[k]=1;const p=seatPax(geo,k,{inbound:true,stand:i});p.lane=p.row>=split?1:0;const r=rnd(),type=r<0.03?'prm':r<0.03+fb*0.85?'work':r<0.8?'lei':'fam';
    return Object.assign(p,{type,biz:p.row<bRows,carry:rnd()<(type==='work'?0.9:0.7),checked:rnd()<(type==='work'?0.15:type==='fam'||type==='prm'?0.85:0.5),elig:rnd()<0.6,spd:type==='prm'?(G.lv.assist?0.95+0.1*G.lv.assist:0.5):type==='work'?1+rnd()*0.3:0.7+rnd()*0.5,wait:0,x:0,y:0,tx:0,ty:0,state:'seatedIn'})});
  arrPax.sort((a,b)=>(a.lane?ac.rows-1-a.row:a.row)-(b.lane?ac.rows-1-b.row:b.row));
  const arrNo=G.flightNo++;
  const F={i,ac,fleetIdx:partner?-1:src.fleet,partner,liv:partner?partner.col:null,geo,P,rear,bRows,seatsN,booked,split,manifest,occ:new Int8Array(seatsN).fill(-1),seated:0,rev:0,bags:0,shuffles:0,
    start:G.clock,std:Math.ceil((G.clock+32+D.clean+booked*ac.perPax+inN*0.3)/5)*5,occIn,no:G.flightNo++,code:partner?partner.code:code(),dest,city:C.code,boardStart:null,firstScan:null,
    checkedTotal:manifest.filter(p=>p.checked).length,bagsIn:0,hold:0,waitSum:0,waitN:0,fault:0,straggler:null,stragglerAt:0,prompted:false,spawnT:0,
    plane:{state:'wait',t:0,offY:-560}};
  F.fare=cityFare(C.code)*G.fare*(partner?1/RFARE[routeFareIx(C.code)]:1);F.op=partner?0:routeOp(ac,C.code)*fuelMul();
  manifest.forEach(p=>p.F=F);
  F.arr={no:arrNo,code:F.code,partner,from,pax:arrPax,n:inN,onboard:inN,bags:arrPax.filter(p=>p.checked).length,unloaded:0,sent:0,reclaim:0,cleared:0,waitSum:0,sta:Math.round(G.clock+4+D.tow),started:null,done:false,stand:i,ac,fare:(FC?TIER_FARE[FC.tier]*(1+0.5*(FC.biz-0.35)):ac.fare)*G.fare};
  arrPax.forEach(p=>{p.F=F;p.A=F.arr});
  if(!partner&&!FR){const rs=rsOf(C.code);rs.s+=seatsN}
  const cands=SIDX.filter(k=>k!==i&&R.st[k].F&&R.st[k].F.manifest.length>8&&R.st[k].F.std-G.clock>45&&!R.st[k].F.xferCancelled);
  if(cands.length){
    const F2=R.st[cands[Math.floor(rnd()*cands.length)]].F,n=Math.min(Math.round(inN*0.18),F2.manifest.length-6,20);
    for(let j=0;j<n;j++){const p=arrPax[Math.floor(rnd()*arrPax.length)];if(p.xfer)continue;const k=F2.manifest.findIndex(q=>!q.leader&&q.type!=='fam'&&q.type!=='grp');if(k<0)break;const q=F2.manifest.splice(k,1)[0];
      if(q.checked){q.checked=false;(F.arr.xb||(F.arr.xb=[])).push(F2)}p.xfer=q;p.checked=false;F2.xferWait=(F2.xferWait||0)+1;F.arr.xferN=(F.arr.xferN||0)+1}
    F.arr.bags=arrPax.filter(p=>p.checked).length;
  }
  if(FR){const fill=clamp(0.55+0.08*G.lv.cargo+(devOn('logistics')?0.2:0)+(R.reg?R.reg.jobs*0.004:0),0.3,1);F.cargo=Math.round(ac.cargo*fill);F.arr.bags=Math.round(ac.cargo*fill*0.85);F.freighter=true;F.std=Math.ceil((G.clock+30+D.clean+(F.cargo+F.arr.bags)*0.35)/5)*5}
  else F.cargo=Math.round(seatsN*0.06*G.lv.cargo);
  F.checkedTotal+=F.cargo;F.bagsIn=F.cargo;
  F.willFault=!partner&&rnd()<faultRisk(fl.wear||0);
  if(booked>8&&G.flights>2&&rnd()<0.12){const k=manifest.findIndex(q=>!q.leader&&q.type!=='fam'&&q.type!=='grp'&&q.type!=='prm');if(k>=0){F.straggler=manifest.splice(k,1)[0];F.stragglerAt=F.std+2+rnd()*6}}
  return F;
}
function laneInfo(p){const F=p.F,laneRows=p.lane?F.ac.rows-F.split:F.split,dist=p.lane?F.ac.rows-1-p.row:p.row;return {laneRows,ord:laneRows-1-dist}}
function groupOf(p){
  if(p.biz||p.prio) return 5;
  switch(G.stands[p.stand].method){case 'random':return 4;case 'btf':{const {laneRows,ord}=laneInfo(p);return Math.min(3,Math.floor(ord/Math.max(1,laneRows/4)))}default:return p.ct}
}
function keyOf(p){
  if(p.leader&&p.leader.F===p.F&&p.leader.stand===p.stand)return keyOf(p.leader)+0.001;
  const {laneRows,ord}=laneInfo(p);let k;
  switch(G.stands[p.stand].method){
    case 'btf':k=Math.min(3,Math.floor(ord/Math.max(1,laneRows/4)))*10+p.rand;break;
    case 'wilma':k=p.ct*10+p.rand;break;
    case 'steffen':k=p.ct*1e5+(ord%2)*1e4+p.side*1e3+ord+p.rand*0.1;break;
    default:k=p.rand;
  }
  return k-(p.type==='prm'?3e6:p.biz?2e6:p.prio?1e6:0);
}
function blockers(p,occ){const F=p.F,base=p.row*F.geo.cols;let n=0;for(const c of F.geo.colBlk[p.col])if((occ||F.occ)[base+c]>=0)n++;return n}
function moveTo(p,tx,ty,sp,dt){const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy);if(d<=sp*dt||d<0.05){p.x=tx;p.y=ty;return true}p.x+=dx/d*sp*dt;p.y+=dy/d*sp*dt;return false}
function repAdj(d,why){if(d>0&&G.lv.saf)d*=1.25;if(d>0&&G.dev&&devSum('green'))d*=1.1;const v=clamp(G.rep+d,5,100),real=v-G.rep;G.rep=v;const w=R.repWhy||(R.repWhy={});w[why]=(w[why]||0)+real;
  if(real){const E=R.repEv||(R.repEv=[]);E.push([G.clock,why,real,d]);while(E.length&&E[0][0]<G.clock-180)E.shift()}}
const REPWHY={care:['passengers who needed help getting around',['assist']],ads:['terminal advertising',[],' Switch it off in Office › Policies.'],noise:['night-flight noise',[],' A curfew (Office › Policies) or noise insulation would help.'],events:['event crowds that couldn’t get home',[],' Give event sites a line that can carry the crowds.'],crowding:['packed buses, trams and trains',[],' Run more services or longer vehicles.'],stranded:['passengers stranded at night',[],' Add night services to your lines.'],traffic:['traffic jams',[],' Trams, trains, the metro or a ring road would ease them.'],queues:['long waits at check-in and security',['lanes','sectech','desks','training','kiosks','online','fasttrack','wifi']],late:['late departures',['atc','crew','tugs','handlers','scanners','bins','walkway']],arrivals:['slow arrivals at passports and reclaim',['officers','egates','training','handlers','wifi']],missed:['missed connections',['walkway','mover']],sponsor:['the sponsorship deal',[]],punctual:['on-time departures',[]]};
const REPLBL={care:'Help for passengers who need it',ads:'Advertising',noise:'Night noise',events:'Match days and events',crowding:'Crowded public transport',stranded:'Stranded without transport',traffic:'Traffic jams',queues:'Check-in and security waits',late:'Late departures',punctual:'On-time departures',arrivals:'Arrivals clearing',missed:'Missed connections',sponsor:'Sponsorship deal'};
function repRecent(){const o={};for(const [t,w,r,d] of (R.repEv||[]))if(t>=G.clock-180)o[w]=(o[w]||0)+d;return o}
function hourBucket(){const h=Math.floor(G.clock/60);let b=G.hours[G.hours.length-1];if(!b||b.h!==h){b={h,rev:0,cost:0,pax:0};G.hours.push(b);if(G.hours.length>24)G.hours.shift()}return b}
function earn(v,kind,x,y,col,F){G.cash+=v;G.earned+=v;G.revBy[kind]=(G.revBy[kind]||0)+v;hourBucket().rev+=v;R.minEarn+=v;if(G.dstat)G.dstat.rev+=v;if(F)F.rev+=v;if(x!=null&&!R.sim)floater('+'+money(v),x,y,col||'#6BE39A')}
function spend(v,kind){kind=kind||'costs';G.cash-=v;G.revBy[kind]=(G.revBy[kind]||0)+v;hourBucket().cost+=v;R.minEarn-=v;if(G.dstat)G.dstat.cost+=v}
function countPax(arr){hourBucket().pax++;if(G.dstat){if(arr)G.dstat.arr++;else G.dstat.pax++}}
function floater(text,x,y,col,big){if(R.sim)return;{const p=SET().pops;if(p==='off'||(p==='big'&&!big))return}if(R.floaters.length>90)R.floaters.shift();R.floaters.push({text,x,y,t:0,col,big})}
const dailyPax=()=>G.hours.slice(-24).reduce((a,b)=>a+(b.pax||0),0);

