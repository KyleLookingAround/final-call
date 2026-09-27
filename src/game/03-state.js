/* ================= state ================= */
const DEFAULT=()=>({cash:25,rep:60,flown:0,flights:0,ontime:0,streak:0,bestStreak:0,earned:0,paxSeated:0,level:0,pierB:false,builds:[],day:1,dstat:null,lastDay:null,
  lv:Object.fromEntries(Object.keys(UPG).map(k=>[k,0])),
  methods:{random:true},
  layout:'classic',lounges:false,stands:[...Array(NG).keys()].map(i=>({built:i===0,ac:i===0?0:null,method:'random',rear:false,route:'mixed'})),
  open:{desks:null,lanes:null,officers:null},auto:true,wageMul:1,loan:0,gstats:[...Array(NG)].map(()=>[]),
  fleet:[{type:0,st:'base',readyAt:0,wear:0}],shops:Array(NU).fill(null),
  fare:1,name:'Northwind',livery:0,clock:360,flightNo:101,history:[],best:{},reports:Array(NG).fill(null),
  sound:true,tab:'stands',goal:0,lines:{},infra:{},tod:{},stn:{},lineSeq:0,goalV:2,dev:{},pop:{},evq:[],evDone:0,revBy:{transit:0,transitOps:0,region:0,wages:0,upkeep:0,interest:0,assets:0,fares:0,inbound:0,landside:0,cargo:0,bags:0,shops:0,fast:0,priority:0,bonus:0,costs:0},hours:[],arrReports:Array(NG).fill(null),
  savedAt:0,rate:0,lastDest:'',tech:{},pts:0,ptBought:0,pv:2,gdone:{},routes:{DUB:{f:1},EDI:{f:1},AMS:{f:1}},rs:{},crews:[{free:0,back:0,duty:0,res:0},{free:0,back:0,duty:0,res:0}],tour:{s:0},nv3:1,set:{tips:true,msgs:'all',pops:'all',goal:true,badges:true,recs:true,autoLines:true,autoFares:true,autoCrews:true,autoDuty:true,chal:true,sndAnn:'on',sndVoice:true,sndAmb:true,sndFx:true}});
const SET=()=>G.set||{};
let G=DEFAULT();
const mkStandRT=()=>({F:null,out:null,bridge:[[],[]],aisle:[[],[],[],[]],dAisle:[[],[],[],[]],dBridge:[[],[]],scanT:[0,0],spots:new Array(80).fill(null),ext:0,geo:null,P:null});
const R={rwy:{q:[],act:[null,null]},lot:new Array(540).fill(0),platform:[],train:{state:'away',t:3,x:null},lotFull:0,arrQ:[],booths:[],egates:[],arrBelt:[],bm:'dep',pax:[],ciQ:[],secQ:[],ftQ:[],desks:[],kiosks:[],lanes:[],ftL:{p:null,t:0},belt:[],st:[...Array(NG).keys()].map(mkStandRT),
  floaters:[],toasts:[],fx:{fog:0,rush:0,sick:0,strike:0,hedge:0,fuelUp:0,fuelDown:0,snow:0},autoN:{},nextEvent:420,speed:1,cam:{x:0,y:0,z:1,tx:null,ty:null},
  sw:1,sh:1,baseK:1,dpr:1,sel:0,minEarn:0,lastMin:360,toastId:0,sim:false,view:'airport',regSub:'lines',tram:{state:'away',t:2,x:null},bus:{state:'away',t:1,x:null},tramQ:[],busQ:[],reg:null};

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const cv=$('#cv'),ctx=cv.getContext('2d');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pad=n=>String(n).padStart(2,'0');
const hhmm=m=>{m=Math.floor(m);return pad(Math.floor(m/60)%24)+':'+pad(m%60)};
function money(v){
  const s=v<0?'−':'';v=Math.abs(v);
  if(v>=1e6) return s+'$'+(v/1e6).toFixed(2)+'M';
  if(v>=1e4) return s+'$'+(v/1e3).toFixed(1)+'k';
  if(v>=100) return s+'$'+Math.round(v).toLocaleString('en-GB');
  const r=Math.round(v*100)/100;return s+'$'+(Number.isInteger(r)?r:r.toFixed(2));
}
const num=v=>v>=1e6?(v/1e6).toFixed(2)+'M':v>=1e4?(v/1e3).toFixed(1)+'k':Math.round(v).toLocaleString('en-GB');
const code=()=>{const n=(G.name||'Northwind').toUpperCase().replace(/[^A-Z ]/g,'').trim()||'NW';const w=n.split(/\s+/);if(w.length>1&&w[1]) return w[0][0]+w[1][0];if(n==='NORTHWIND')return 'NW';const c=n.slice(1).match(/[^AEIOU]/);return n[0]+(c?c[0]:'X')};
const PRICE=[1,1.6,3,5,15,25,40,90,120,150];
const capAt=(k,L)=>{const u=UPG[k];if(u.max<=1)return u.max;return Math.min(u.max,Math.max(1,Math.ceil(u.max*CAPFRAC[L])))};
const lvlFor=(k,l)=>{for(let L=0;L<CAPFRAC.length;L++)if(capAt(k,L)>l)return L;return CAPFRAC.length-1};
const upCost=k=>{const u=UPG[k],l=G.lv[k],b=u.lvl||0;return Math.round(u.base*Math.pow(u.mult,l)*PRICE[Math.max(b,lvlFor(k,l))]/PRICE[b])};
const capOf=k=>capAt(k,G.level);
const upLocked=k=>!has('up:'+k);
const builtCount=()=>G.stands.filter(s=>s.built).length;
const gatesOpen=()=>G.stands.filter((s,i)=>s.built&&STAND_KIND[i]!=='remote').length; // what levels count: remote stands aren't gates
const shopUpCost=s=>Math.round(SHOPS[s.type].cost*0.8*Math.pow(1.7,s.lvl));
const livery=()=>LIVERIES[G.livery][1];
const dayOf=c=>Math.floor(c/1440)+1;
const seasonOf=d=>SEASONS[Math.floor(((d-1)%12)/3)];

const patience=()=>2*G.lv.wifi+(G.lv.icon?4:0);
const SPD=()=>[1.1,1,0.9][pol('pay')];
function derived(){
  const l=G.lv,fog=R.fx.fog>G.clock,snow=R.fx.snow>G.clock;
  const strike=R.fx.strike>G.clock,half=n=>strike?Math.max(1,Math.ceil(n/2)):n;
  const rwFog=fog?(l.ils?1.08:1.5):1,rwSnow=snow?1.3:1,snowClean=snow?8*(1-0.3*l.deice):0;
  return {desks:half(staffed('desks')),kiosks:l.kiosks,online:0.12*l.online,checkin:EF.checkin(l.training)*SPD(),kiosk:EF.kiosk(l.training),
    officers:half(staffed('officers')),egates:l.egates,passT:0.95*Math.pow(0.93,l.training)*SPD(),egateT:0.35,
    lanes:Math.max(1,half(staffed('lanes'))-(R.fx.sick>G.clock?1:0)),sec:EF.sec(l.sectech)*SPD(),ft:l.fasttrack>0,ftBuy:0.06*l.ftsales,
    scan:EF.scan(l.scanners),walk:110*(1+0.2*l.walkway),cwalk:80*(1+0.2*l.walkway),aisleSpd:3.2,stow:EF.stow(l.bins),shuffle:1.6,
    bag:EF.bag(l.handlers)*(1+0.35*l.bagsys),clean:EF.clean(l.crew)*(fog?1.6:1)+snowClean,tow:EF.tow(l.tugs)*(fog?1.6:1),carryP:EF.carry(l.bagfee),prioP:0.05*l.priority,
    rush:R.fx.rush>G.clock,fog,snow,land:EF.land(l.atc)*rwFog*rwSnow*(l.tower?0.8:1),takeoff:EF.tko(l.atc)*rwFog*rwSnow*(l.tower?0.8:1),runways:1+l.runway2,patience:patience()};
}
/* ---------- route demand: how many people want to fly each route, and how full a flight will be ---------- */
const TIERBASE=[70,120,170,260,330],TIER_FARE=[2.7,4.5,5.9,8.5,11.5],ROUTE_FEE=[100,600,2500,10000,30000],RFARE=[0.8,1,1.25];
const RT_NAMES=['Short-haul','Medium-haul','Sun and capitals','Long-haul','Ultra long-haul'];
const SEA_MUL={flat:[1,1.05,1,.95],summer:[1,1.35,1,.7],wsun:[1,.8,1.1,1.4],ski:[.9,.8,1,1.45]};
const seaIdx=()=>Math.floor(((dayOf(G.clock)-1)%12)/3);
const routeOpen=c=>!!(G.routes&&G.routes[c]);
const routeFareIx=c=>{const r=G.routes&&G.routes[c];return r&&r.f!=null?r.f:1};
const promoOn=c=>{const r=G.routes&&G.routes[c];return !!(r&&r.promo>G.clock)};
function rsOf(c){const rs=G.rs||(G.rs={});const s=rs[c]||(rs[c]={s:0,p:0,v:0,n:0,t:G.clock,tp:0,tv:0,tn:0,lf:0});const dt=G.clock-s.t;if(dt>0){const k=Math.exp(-dt/1440);s.s*=k;s.p*=k;s.v*=k;s.n*=k;if(s.c)s.c*=k;s.t=G.clock}return s}
const attract=()=>0.36+G.rep/100*0.5+0.022*G.lv.marketing+(R.fx.rush>G.clock?0.15:0)+(G.lv.rail?0.06:0);
const fareEl=m=>Math.exp(-1.3*(1-0.12*G.lv.loyalty)*(m-1));
function regionMul(C){const r=R.reg;if(!r)return 1;let m=(1+r.T)*(1-0.12*r.cong)*(1+r.surge)*(1+C.biz*r.biz+(1-C.biz)*r.leis);if(r.hsr){if(C.tier<=1)m*=0.85;else if(C.tier>=3)m*=1.12}return m}
// how many seats a day the route can fill (the market), and how willing each traveller is right now
const cityMarket=(c,fi)=>{const C=CITY[c];return TIERBASE[C.tier]*C.size*(1+0.03*G.lv.marketing)*regionMul(C)*(promoOn(c)?1.25:1)*SEA_MUL[C.sea][seaIdx()]*rivKeep(c,fi)};
function cityWill(c,fm){const C=CITY[c];return attract()*regionMul(C)*(1+(demandNow()-1)*(0.3+2*C.biz))*(1.15-0.45*C.biz)*SEA_MUL[C.sea][seaIdx()]*(promoOn(c)?1.15:1)*fareSplit(G.fare*(fm??RFARE[routeFareIx(c)]))[0]}
// cheaper fares win extra travellers; dearer fares lose some even when flights would otherwise sell out
const fareSplit=m=>m<1?[fareEl(m),1]:[1,fareEl(m)];
const paxLF=(c,fm,sat)=>{const m=G.fare*(fm??RFARE[routeFareIx(c)]);const lf=clamp(cityWill(c,fm)*(sat??1),0.08,1)*fareSplit(m)[1];return isFinite(lf)?clamp(lf,0.05,1):0.7};
const cityFare=c=>{const C=CITY[c];return TIER_FARE[C.tier]*(1+0.5*(C.biz-0.35))*RFARE[routeFareIx(c)]};
function routeLF(c,seats,fi){const sat=Math.min(1,cityMarket(c,fi)/Math.max(1,rsOf(c).s+seats));return paxLF(c,RFARE[fi??routeFareIx(c)],sat)}
// the fare that earns most on a route right now
function bestFare(c){const s=rsOf(c),seats=s.n>0.5?Math.max(40,s.s/Math.max(1,s.n)):150,cur=routeFareIx(c);let best=cur,bv=RFARE[cur]*routeLF(c,0,cur);for(let i=0;i<3;i++){const v=RFARE[i]*routeLF(c,0,i);if(v>bv*1.03){bv=v;best=i}}return best}
function loadFactor(c){if(c)return routeLF(c,0);const ks=Object.keys(G.routes||{});if(!ks.length)return 0.7;let t=0;for(const k of ks)t+=routeLF(k,150);return t/ks.length}
const routeOp=(ac,c)=>ac.op*(0.35+0.65*TRIP[CITY[c].tier]/TRIP[ac.tier]);
// the dispatcher: send each plane where it earns most per hour, among the routes it can reach
function pickRoute(ac){
  let best=null,bs=-1e18;const seats=ac.rows*ac.blocks.reduce((x,y)=>x+y,0);
  for(const c in (G.routes||{})){const C=CITY[c];if(!C||C.tier>ac.tier)continue;
    const sc=ac.freighter?-TRIP[C.tier]*(0.8+rnd()*0.4):(seats*routeLF(c,seats)*cityFare(c)*G.fare-routeOp(ac,c)*fuelMul())/(TRIP[C.tier]+45)*(0.92+rnd()*0.16);
    if(sc>bs){bs=sc;best=c}}
  return best;
}
function openRoute(c){const C=CITY[c];if(!C||routeOpen(c)||!has('rt:'+C.tier)||!buy(ROUTE_FEE[C.tier]))return false;(G.routes||(G.routes={}))[c]={f:1};rsOf(c);if(!R.sim)toast(`New route: ${C.name}. Planes will start flying there.`,null,null,'goal',5);return true}
const promoCost=c=>Math.round(ROUTE_FEE[CITY[c].tier]*0.3+40);
function promoteRoute(c){if(!has('feat:promo')||!routeOpen(c)||promoOn(c)||!buy(promoCost(c)))return false;G.routes[c].promo=G.clock+1440;return true}
const partnerCut=()=>researched('n_alliance')?0.4:PARTNER_CUT;
const arrivalRate=F=>2*(1+0.15*G.lv.marketing)*Math.sqrt(F.seatsN/48)*(R.fx.rush>G.clock?1.3:1)*(G.lv.rail?1.1:1);
const LEVEL_UPKEEP=[0,10,25,50,200,400,600,1400,1900,2400];
function upkeepRate(){
  let u=(LEVEL_UPKEEP[G.level]||0)+(LAY.upk||0);G.stands.forEach((s,i)=>{if(!s.built)return;const o=STAND_ORDER.indexOf(i);u+=o<4?4+o*4:120+(o-4)*60});
  if(G.pierB)u+=250;if(G.lv.runway2)u+=500;if(G.lv.rail)u+=120;u+=G.lv.hotel*60+G.lv.fire*80+G.lv.fuelfarm*40+G.lv.mover*400+G.lv.tower*300+G.lv.cargohub*500+G.lv.mall*800+G.lv.saf*400+G.lv.icon*1000;
  u+=G.dev?devSum('upk'):0;
  return u*(1-0.12*G.lv.solar)*(G.dev&&devOn('wind')?0.85:1);
}

