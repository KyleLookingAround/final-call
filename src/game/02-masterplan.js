/* ================= the Masterplan: a tech tree bought with planning points ================= */
const BRANCHES=[['term','Terminal'],['air','Airside'],['net','Fleet and routes'],['com','Commercial'],['reg','Region'],['lay','Layouts']];
const TECH=[
  {id:'l_remote',b:'lay',t:5,c:1,d:'Rebuild with four cheaper remote stands, reached by bus.',n:'Remote apron',u:['lay:remote']},
  {id:'l_stagger',b:'lay',t:3,c:1,d:'Rebuild with ten stands set at two depths.',n:'Staggered apron',u:['lay:stagger']},
  {id:'l_curve',b:'lay',t:4,c:2,d:'Rebuild with a curved front, moving walkways and a control tower.',n:'Curved front',u:['lay:curve']},
  {id:'l_hall',b:'lay',t:5,c:2,d:'Rebuild around a central shopping hall and a long finger pier.',n:'Hall and finger pier',u:['lay:hall']},
  {id:'l_sat',b:'lay',t:7,c:3,d:'Rebuild with a satellite and its own people mover.',n:'Satellite',u:['lay:sat']},
  {id:'l_star',b:'lay',t:9,c:3,d:'Rebuild around a star-shaped hall with the shortest walks.',n:'Starfish',u:['lay:star']},
  {id:'l_round',b:'lay',t:6,c:2,d:'Rebuild around a round terminal, with satellites reached through tunnels.',n:'Round terminal',u:['lay:round']},
  {id:'l_mid',b:'lay',t:9,c:3,d:'Rebuild with midfield concourses along an underground train.',n:'Midfield concourses',u:['lay:mid']},
  {id:'t_self',b:'term',t:1,c:1,d:'Passengers without hold bags skip the desks.',n:'Self-service',u:['up:kiosks','up:online']},
  {id:'t_border',b:'term',t:1,c:1,d:'Fast automatic passport gates for arrivals.',n:'E-gates',u:['up:egates']},
  {id:'t_fast',b:'term',t:1,c:1,d:'A paid lane that skips the security queue.',n:'Fast track',u:['up:fasttrack','up:ftsales']},
  {id:'t_care',b:'term',t:1,c:1,d:'Calmer queues, and help for those who need it.',n:'Passenger care',u:['up:wifi','up:assist']},
  {id:'t_board',b:'term',t:1,c:1,d:'Board window seats first, then middle, then aisle.',n:'Boarding science',u:['meth:wilma']},
  {id:'t_roster',b:'term',t:2,c:1,d:'Counters open and close with the queues.',n:'Smart rostering',u:['up:roster'],r:['t_self']},
  {id:'t_board2',b:'term',t:3,c:1,d:'The fastest boarding method there is.',n:'Steffen boarding',u:['meth:steffen'],r:['t_board']},
  {id:'t_bags',b:'term',t:4,c:2,d:'Belts and loaders that never tire.',n:'Automated baggage',u:['up:bagsys']},
  {id:'t_mover',b:'term',t:6,c:2,d:'A train along Pier B.',n:'People mover',u:['up:mover']},
  {id:'t_mall',b:'term',t:7,c:2,d:'Shops take 40% more.',n:'Airside galleria',u:['up:mall'],r:['c_duty']},
  {id:'t_icon',b:'term',t:9,c:3,d:'A roof people fly in to see.',n:'Landmark roof',u:['up:icon'],r:['t_mall']},
  {id:'a_atc',b:'air',t:1,c:1,d:'Quicker landings and take-offs.',n:'Air traffic control',u:['up:atc']},
  {id:'a_hangar',b:'air',t:1,c:1,d:'Planes wear more slowly.',n:'Maintenance hangar',u:['up:hangar']},
  {id:'a_occ',b:'air',t:4,c:1,d:'Planes lose less time to delays at the far end.',n:'Operations centre',u:['feat:occ']},
  {id:'a_crews',b:'air',t:2,c:1,d:'Build more at once, and faster.',n:'Construction crews',u:['up:crews']},
  {id:'a_weather',b:'air',t:2,c:1,d:'Storms and snow cause shorter delays.',n:'Weather operations',u:['up:radar','up:deice']},
  {id:'a_fire',b:'air',t:3,c:1,d:'Needed for widebodies. Faster repairs.',n:'Fire and rescue',u:['up:fire']},
  {id:'a_runway',b:'air',t:4,c:2,d:'Double the runway capacity. Fog-proof landings.',n:'Second runway',u:['up:runway2','up:ils'],r:['a_atc']},
  {id:'a_fuel',b:'air',t:4,c:1,d:'Cheaper fuel on every flight.',n:'Fuel farm',u:['up:fuelfarm']},
  {id:'a_solar',b:'air',t:4,c:1,d:'Lower running costs.',n:'Solar farm',u:['up:solar']},
  {id:'a_tower',b:'air',t:6,c:2,d:'Every movement 20% quicker.',n:'New control tower',u:['up:tower'],r:['a_runway']},
  {id:'a_saf',b:'air',t:7,c:2,d:'Cheaper fuel and a faster-rising rating.',n:'Sustainable fuel',u:['up:saf'],r:['a_fuel']},
  {id:'n_med',b:'net',t:1,c:1,d:'A bigger jet and eight European cities.',n:'Medium-haul',u:['ac:1','rt:1']},
  {id:'n_neo',b:'net',t:2,c:1,d:'A frugal jet that barely wears.',n:'New-engine jets',u:['ac:5'],r:['n_med']},
  {id:'n_promo',b:'net',t:2,c:1,d:'Pay to boost demand on one route.',n:'Route marketing',u:['feat:promo']},
  {id:'n_sun',b:'net',t:3,c:1,d:'A stretched jet for sun and capital routes.',n:'Sun and capitals',u:['ac:2','rt:2'],r:['n_med']},
  {id:'n_cargo',b:'net',t:3,c:1,d:'Cargo holds and an all-freight plane.',n:'Freight',u:['ac:7','up:cargo']},
  {id:'n_long',b:'net',t:4,c:2,d:'Transatlantic and the Gulf.',n:'Long-haul',u:['ac:3','rt:3'],r:['n_sun']},
  {id:'n_alliance',b:'net',t:5,c:1,d:'Partners fly more and pay you 40%.',n:'Airline alliance',u:['feat:alliance']},
  {id:'n_slots',b:'net',t:5,c:1,d:'Win more travellers from Lowmere, and slow its growth.',n:'Slot agreements',u:['feat:slots']},
  {id:'n_wide',b:'net',t:6,c:2,d:'Twin aisles to Asia, the Americas and Sydney.',n:'Widebodies',u:['ac:6','rt:4'],r:['n_long']},
  {id:'n_cargohub',b:'net',t:6,c:2,d:'Cargo pays double.',n:'Cargo terminal',u:['up:cargohub'],r:['n_cargo']},
  {id:'c_cafe',b:'com',t:1,c:1,d:'Bigger, busier coffee stops.',n:'Café',u:['shop:cafe']},
  {id:'c_cabin',b:'com',t:1,c:1,d:'Front rows at 3× fare, and paid priority.',n:'Premium sales',u:['up:business','up:priority']},
  {id:'c_bar',b:'com',t:2,c:1,d:'Longer stays, bigger spends.',n:'Bars and lounges',u:['shop:bar','shop:lounge']},
  {id:'c_loyal',b:'com',t:3,c:1,d:'Higher fares lose fewer passengers.',n:'Frequent flyer club',u:['up:loyalty']},
  {id:'c_duty',b:'com',t:4,c:1,d:'The biggest earners airside.',n:'Duty free and dining',u:['shop:duty','shop:dining']},
  {id:'c_hotel',b:'com',t:4,c:1,d:'Arrivals book a room for the night.',n:'Airport hotel',u:['up:hotel']},
  {id:'c_lux',b:'com',t:5,c:1,d:'Few stop, but they spend a lot.',n:'Luxury boutique',u:['shop:luxury'],r:['c_duty']},
  {id:'c_spa',b:'com',t:7,c:1,d:'For long-haul travellers with time to kill.',n:'Spa',u:['shop:spa'],r:['c_lux']},
  {id:'r_coach',b:'reg',t:1,c:1,d:'Fast coaches to the towns, and live screens.',n:'Coaches',u:['mode:coach','up:rtinfo']},
  {id:'r_homes',b:'reg',t:1,c:1,d:'Homes and shops that bring more people.',n:'Housing sites',u:['dev:flats','dev:estate','dev:castlehomes','dev:retail','dev:reserve']},
  {id:'r_rail',b:'reg',t:2,c:1,d:'An airport station and train lines.',n:'Railway station',u:['up:rail','mode:rail']},
  {id:'r_tram',b:'reg',t:3,c:1,d:'Trams, water buses and an electric depot.',n:'Trams and water buses',u:['mode:tram','mode:water','up:depot']},
  {id:'r_sites',b:'reg',t:3,c:1,d:'Offices, hotels and attractions: jobs and tourists.',n:'Business and leisure sites',u:['dev:bizpark','dev:logistics','dev:hotels','dev:uni','dev:outlet','dev:marina','dev:oldtown']},
  {id:'r_roads',b:'reg',t:3,c:1,d:'Ease traffic, calm the neighbours.',n:'Roads and noise',u:['dev:ringroad','dev:lowtraffic','up:insul']},
  {id:'r_stn',b:'reg',t:3,c:1,d:'Drivers park at a station and ride on.',n:'Park and ride',u:['stn:pr'],r:['r_coach']},
  {id:'r_net',b:'reg',t:4,c:1,d:'One ticket to the plane; quicker changes.',n:'Integrated network',u:['up:tickets','stn:hub'],r:['r_stn']},
  {id:'r_venues',b:'reg',t:4,c:2,d:'Stadiums, a cruise port and more: big events.',n:'Venues',u:['dev:stadium','dev:cruise','dev:conference','dev:themepark','dev:studios','dev:wind'],r:['r_sites']},
  {id:'r_metro',b:'reg',t:6,c:2,d:'Heavy rail under the city.',n:'Metro',u:['mode:metro','up:control'],r:['r_tram']},
  {id:'r_city',b:'reg',t:6,c:2,d:'An arena and a tech campus.',n:'City landmarks',u:['dev:arena','dev:techcampus'],r:['r_venues']},
  {id:'r_hsr',b:'reg',t:7,c:3,d:'High-speed trains to Lowmere.',n:'High-speed rail',u:['mode:hsr'],r:['r_rail']},
];
const TECH_BY={},NODE_OF={};TECH.forEach(T=>{TECH_BY[T.id]=T;T.u.forEach(k=>NODE_OF[k]=T.id)});
const LEVEL_PTS=4,LV_MAP=[0,1,3,4,6,7,9];
// true only for a key some plan actually unlocks (researched) or a real, deliberately unlocked-from-the-start item
// (the starter plane, the basic upgrades, bus lines...); false for anything else, so a typo hides its feature
// rather than showing it early (row 40)
function keyExists(a,v){
  if(a==='up')return v in UPG;if(a==='ac')return AIRCRAFT[+v]!=null;if(a==='meth')return METHODS.some(m=>m.id===v);
  if(a==='shop')return SHOPS.some(s=>s.id===v);if(a==='mode')return v in MODES;if(a==='dev')return v in DEV;
  if(a==='stn')return v in STN_UP;if(a==='rt')return +v>=0&&+v<5;if(a==='feat')return v in FEAT_NAMES;if(a==='lay')return v in LAYOUTS;
  return false;
}
const has=key=>{if(NODE_OF[key])return !!(G.tech&&G.tech[NODE_OF[key]]);const [a,v]=key.split(':');return keyExists(a,v)};
const researched=id=>!!(G.tech&&G.tech[id]);
function techState(T){if(researched(T.id))return 'done';if(T.t>G.level)return 'level';if((T.r||[]).some(r=>!researched(r)))return 'req';if((G.pts||0)<T.c)return 'pts';return 'ready'}
const FEAT_NAMES={promo:'Route promotions',alliance:'Partners pay 40% and fly more',slots:'An edge over Lowmere',occ:'Fewer delays at the far end'};
function itemName(key){const [k,v]=key.split(':');
  if(k==='up')return UPG[v]?UPG[v].name:v;if(k==='ac')return AIRCRAFT[+v].name;if(k==='meth')return (METHODS.find(m=>m.id===v)||{}).name||v;
  if(k==='shop')return (SHOPS.find(x=>x.id===v)||{}).name||v;if(k==='mode')return MODES[v].name+' lines';if(k==='dev')return DEV[v].name;
  if(k==='stn')return STN_UP[v].name;if(k==='rt')return ['Short-haul','Medium-haul','Sun and capital','Long-haul','Ultra long-haul'][+v]+' routes';if(k==='feat')return FEAT_NAMES[v]||v;if(k==='lay')return 'Rebuild as '+LAYOUTS[v].name+' (Airfield › Layout)';return v}
// display only: the one plan per category that looks best to approve next, and the line saying what it unlocks,
// worded like the level-up card. Changes no cost, effect or unlock — the bot and managers still buy by state alone.
function recommendedTech(b){const rs=TECH.filter(T=>T.b===b&&techState(T)==='ready');return rs.length?rs.reduce((a,c)=>c.t<a.t?c:a):null}
function planUnlockLine(T){const un=T.u.map(k=>k.startsWith('rt:')?`${itemName(k)}: ${lvlCities(+k.slice(3))}`:itemName(k)).filter(x=>x!==T.n);return T.d+(un.length?' '+un.join(' · ')+'.':'')}
function research(id){const T=TECH_BY[id];if(!T||techState(T)!=='ready')return false;G.pts-=T.c;(G.tech||(G.tech={}))[id]=1;
  const nt=new Set(G.newTabs||[]);for(const k of T.u){const [a,v]=k.split(':');if(a==='up'&&UPG[v])nt.add(UPG[v].tab);else if(a==='ac')nt.add('fleet');else if(a==='meth')nt.add('stands');else if(a==='rt'||a==='feat')nt.add('routes');else if(a==='shop')nt.add('sales');else if(a==='mode'||a==='dev'||a==='stn')nt.add('region')}G.newTabs=[...nt];
  if(!R.sim){toast(`Approved: ${T.n}. ${T.u.map(itemName).join(', ')}.`,null,null,'goal',6);kaching();renderTabs();renderPlanBtn()}return true}
const consultCost=()=>Math.round(20000*Math.pow(1.35,G.ptBought||0));
function buyPoint(){if(G.level<4)return false;const c=consultCost();if(!buy(c))return false;G.pts=(G.pts||0)+1;G.ptBought=(G.ptBought||0)+1;if(!R.sim)renderPlanBtn();return true}
const planHint=key=>{const T=TECH_BY[NODE_OF[key]];return T?`Approve <b>${T.n}</b> in the Masterplan${T.t>G.level?` (from ${LEVELS[T.t].name})`:''}.`:''};
const TABS=[['stands','Gates','pier'],['fleet','Fleet','plane'],['routes','Routes','globe'],['terminal','Terminal','lane'],['ground','Airfield','runway'],['sales','Sales','ticket'],['region','Region','map'],['office','Office','chart']];
const nRoutes=()=>Object.keys(G.routes||{}).length;
// a level goal's bar and text follow whichever of that level's requirements is least met, not the level count
// (row 6): levelChecks(n) already has each requirement's value, target, display size and unit
const levelGoalReq=n=>levelChecks(n).reduce((a,c)=>c[1]/c[2]<a[1]/a[2]?c:a);
const levelGoalProgress=n=>{const r=levelGoalReq(n);return [r[1],r[2]]};
const levelGoalText=n=>{const [,v,tg,big,unit]=levelGoalReq(n);return `${LEVELS[n].name}: ${big?num(v):v} / ${big?num(tg):tg} ${unit}`};
const GOALS=[
  {id:'seat',t:'Seat 30 passengers',p:()=>[G.paxSeated,30],r:15},
  {id:'desk',t:'Open a second check-in desk',go:['terminal','[data-buy="desks"]'],p:()=>[G.lv.desks,1],r:15},
  {id:'ontime',t:'Get a flight away on time',p:()=>[G.ontime,1],r:20},
  {id:'lane',t:'Open a second security lane',go:['terminal','[data-buy="lanes"]'],p:()=>[G.lv.lanes,1],r:25},
  {id:'pass',t:'Open a second passport desk',go:['terminal','[data-buy="officers"]'],p:()=>[G.lv.officers,1],r:30},
  {id:'shop',t:'Open a shop in the concourse',go:['sales','.shopcard'],p:()=>[G.shops.filter(Boolean).length,1],r:30},
  {id:'method',t:'Buy a new boarding method',go:['stands','[data-mbuy]'],p:()=>[Object.keys(G.methods).length-1,1],r:40},
  {id:'plane2',t:'Buy a second plane',go:['fleet','[data-acbuy]'],p:()=>[G.fleet.filter(f=>!f.sold).length,2],r:60},
  {id:'a2',t:'Open gate A2',go:['stands','[data-standbuy="1"]'],p:()=>[builtCount()-1,1],r:100},
  {id:'l1',get t(){return levelGoalText(1)},go:['office','#levels'],p:()=>levelGoalProgress(1),r:0},
  {id:'plan',t:'Approve a plan in the Masterplan',go:['plan'],p:()=>[Object.keys(G.tech||{}).length,1],r:100,need:()=>G.level>=1},
  {id:'route',t:'Open a new route',go:['routes','[data-ropen]'],p:()=>[nRoutes(),4],r:150,need:()=>G.level>=1},
  {id:'two',t:'Run flights from two gates at once',go:['fleet','[data-acbuy]'],p:()=>[R.st.filter((S,k)=>G.stands[k].built&&S.F).length,2],r:120},
  {id:'bus',t:'Run a bus to Harbourgate',go:['region','[data-newline]'],p:()=>[Object.values(G.lines||{}).some(L=>L.mode==='bus'&&serves(L,'air')&&['hbc','old','hbs'].some(n=>serves(L,n)))?1:0,1],r:150,need:()=>G.level>=1},
  {id:'streak',t:'Three on-time departures in a row',p:()=>[G.bestStreak,3],r:150,pts:1},
  {id:'l2',get t(){return levelGoalText(2)},go:['office','#levels'],p:()=>levelGoalProgress(2),r:0},
  {id:'a3',t:'Open gate A3',go:['stands','[data-standbuy="2"]'],p:()=>[builtCount()-1,2],r:400,need:()=>G.level>=STAND[2].lvl},
  {id:'shops',t:'Earn $2,000 from shops',go:['sales','.shopcard'],p:()=>[G.revBy.shops,2000],r:300},
  {id:'biz',t:'Fly 500 business travellers',go:['routes','[data-ropen]'],p:()=>[G.bizFlown||0,500],r:500,pts:1},
  {id:'l3',get t(){return levelGoalText(3)},go:['office','#levels'],p:()=>levelGoalProgress(3),r:0},
  {id:'rail',t:'Open the railway station',go:['region','[data-buy="rail"]'],p:()=>[G.lv.rail,1],r:1200,need:()=>has('up:rail')},
  {id:'dev',t:'Build on a development site',go:['region','[data-dbuild]'],p:()=>[Object.keys(G.dev||{}).length,1],r:2000,pts:1,need:()=>G.level>=1},
  {id:'a4',t:'Open all four A gates',go:['stands','[data-standbuy="3"]'],p:()=>[builtCount()-1,3],r:2000,need:()=>G.level>=STAND[3].lvl},
  {id:'r10',t:'Fly to 10 destinations',go:['routes','[data-ropen]'],p:()=>[nRoutes(),10],r:3000,pts:1},
  {id:'l4',get t(){return levelGoalText(4)},go:['office','#levels'],p:()=>levelGoalProgress(4),r:0},
  {id:'tram',t:'Open a tram line',go:['region','[data-newline]'],p:()=>[anyMode('tram')?1:0,1],r:6000,need:()=>has('mode:tram')},
  {id:'link',t:'Link two lines at one station',go:['region','[data-newline]'],p:()=>[NODE_IDS.some(n=>linesAt(n).length>=2)?1:0,1],r:4000,pts:1,need:()=>G.level>=1},
  {id:'pier',t:'Build Pier B',go:['stands','[data-pierbuy]'],p:()=>[G.pierB?1:0,1],r:5000,need:()=>G.level>=PIER.lvl},
  {id:'long',t:'Open a long-haul route',go:['routes','[data-ropen]'],p:()=>[Object.keys(G.routes||{}).some(c=>CITY[c].tier>=3)?1:0,1],r:5000,need:()=>has('rt:3')},
  {id:'event',t:'Host a match, concert, cruise or conference',go:['region','[data-dbuild]'],p:()=>[G.evDone||0,1],r:15000,pts:1,need:()=>has('dev:stadium')},
  {id:'rwy',t:'Build a second runway',go:['ground','[data-buy="runway2"]'],p:()=>[G.lv.runway2,1],r:8000,need:()=>has('up:runway2')},
  {id:'l5',get t(){return levelGoalText(5)},go:['office','#levels'],p:()=>levelGoalProgress(5),r:0},
  {id:'low1',t:'Keep 55% of travellers on routes you share with Lowmere',go:['routes','.lcard.riv'],p:()=>[rivMix()==null?0:Math.round(rivMix()*100),55],r:3000,pts:1,need:()=>rivLive()&&rivMix()!=null},
  {id:'r20',t:'Fly to 20 destinations',go:['routes','[data-ropen]'],p:()=>[nRoutes(),20],r:20000,pts:1},
  {id:'l6',get t(){return levelGoalText(6)},go:['office','#levels'],p:()=>levelGoalProgress(6),r:0},
  {id:'wide',t:'Fly the W-300 Widebody',go:['fleet','[data-acbuy="6"]'],p:()=>[G.fleet.some(f=>f.type===6&&!f.sold)?1:0,1],r:30000,need:()=>has('ac:6')},
  {id:'metro',t:'Dig a metro to the city',go:['region','[data-newline]'],p:()=>[anyMode('metro')?1:0,1],r:80000,need:()=>has('mode:metro')},
  {id:'riders',t:'Carry 1,000 riders an hour',go:['region','[data-newline]'],p:()=>[Math.round(R.reg?R.reg.riders:0),1000],r:120000,pts:1,need:()=>G.level>=1},
  {id:'g8',t:'Open all eight gates',go:['stands','[data-standbuy="7"]'],p:()=>[gatesOpen(),8],r:60000,need:()=>G.level>=STAND[7].lvl},
  {id:'tower',t:'Build the new control tower',go:['ground','[data-buy="tower"]'],p:()=>[G.lv.tower,1],r:100000,need:()=>has('up:tower')},
  {id:'l7',get t(){return levelGoalText(7)},go:['office','#levels'],p:()=>levelGoalProgress(7),r:0},
  {id:'hsr',t:'Run high-speed trains to Lowmere',go:['region','[data-newline]'],p:()=>[anyMode('hsr')?1:0,1],r:250000,need:()=>has('mode:hsr')},
  {id:'r30',t:'Fly to 30 destinations',go:['routes','[data-ropen]'],p:()=>[nRoutes(),30],r:200000,pts:1},
  {id:'m10',t:'Earn $10 million',p:()=>[G.earned,1e7],r:0},
  {id:'l8',get t(){return levelGoalText(8)},go:['office','#levels'],p:()=>levelGoalProgress(8),r:0},
  {id:'buylow',t:'Buy Lowmere Airport',go:['routes','[data-rivbuy]'],p:()=>[G.rival&&G.rival.owned?1:0,1],r:0,pts:1,need:()=>!!(G.rival&&G.rival.opened)},
  {id:'land3',t:'Finish three landmark projects',go:['ground','[data-buy="mall"]'],p:()=>[['tower','cargohub','mall','saf','icon'].filter(k=>G.lv[k]).length,3],r:500000,pts:1},
  {id:'l9',get t(){return levelGoalText(9)},go:['office','#levels'],p:()=>levelGoalProgress(9),r:0},
  {id:'land5',t:'Finish every landmark project',go:['ground','[data-buy="icon"]'],p:()=>[['tower','cargohub','mall','saf','icon'].filter(k=>G.lv[k]).length,5],r:0},
  {id:'m50',t:'Earn $50 million',p:()=>[G.earned,5e7],r:0},
];
const curGoal=()=>GOALS.find(g=>!(G.gdone&&G.gdone[g.id])&&(!g.need||g.need()));
const goalsDone=()=>GOALS.filter(g=>G.gdone&&G.gdone[g.id]).length;

