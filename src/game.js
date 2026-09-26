(()=>{
'use strict';
/* ================= constants ================= */
const NG=8,W=2480,H=640,SEATW=15,AISLE=16,CABIN_TOP=110,CABIN_MAX=250,TERM_Y=446,SEC_Y=522,LAND_B=614,LAND_R=1232,GAP=0.95,SPACING=8.5;
const SIDX=[...Array(NG).keys()];
const STAND_X=[170,470,770,1070,1370,1670,1970,2270];
const GATES=['A1','A2','A3','A4','B1','B2','B3','B4'];
const STAND=[
  {cost:0,build:0,lvl:0},{cost:400,build:30,lvl:0},{cost:3000,build:60,lvl:1},{cost:12000,build:90,lvl:3},
  {cost:80000,build:120,lvl:4,pier:1},{cost:150000,build:150,lvl:4,pier:1},{cost:300000,build:180,lvl:6,pier:1},{cost:500000,build:210,lvl:6,pier:1}];
const PIER={cost:60000,build:300,lvl:4};
const GROUPC=['#5CC8FF','#FF9F43','#C39BFF','#6BE39A','#E6E1D6','#F5D08A'];
const LAND_C='#A7A296';
const KEY='final-call-save-v2',OLDKEY='final-call-save-v1';
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
const LIVERIES=[['Signal','#FFC72C'],['Poppy','#E5484D'],['Lagoon','#2BB3A3'],['Cobalt','#4C7DFF'],['Heather','#9B6BFF']];
const AIRCRAFT=[
  {name:'R-48 Regional',short:'R-48',rows:12,blocks:[2,2],fare:2.5,perPax:1.6,cost:120,op:12,tier:0,span:40,lvl:0,wear:1,blurb:'Short hops. Cheap to buy and run.'},
  {name:'N-120',short:'N-120',rows:20,blocks:[3,3],fare:4,perPax:1.2,cost:1200,op:60,tier:1,span:45,lvl:1,wear:1,blurb:'City breaks across Europe.'},
  {name:'N-186 Stretch',short:'N-186',rows:31,blocks:[3,3],fare:5.5,perPax:1.0,cost:9000,op:300,tier:2,span:45,lvl:3,wear:1,blurb:'Longer sun and capital routes.'},
  {name:'N-222 Long-haul',short:'N-222',rows:37,blocks:[3,3],fare:8,perPax:0.85,cost:40000,op:700,tier:3,span:45,lvl:4,wear:1.1,blurb:'Transatlantic and the Gulf.'},
  {name:'T-72 Turboprop',short:'T-72',rows:18,blocks:[2,2],fare:3,perPax:1.4,cost:350,op:20,tier:0,span:44,lvl:0,wear:0.8,blurb:'Frugal and tough. Short hops.'},
  {name:'N-150 Neo',short:'N-150',rows:25,blocks:[3,3],fare:4.8,perPax:1.1,cost:6000,op:80,tier:1,span:45,lvl:3,wear:0.7,blurb:'New engines: small fuel bills and slow wear.'},
  {name:'W-300 Widebody',short:'W-300',rows:34,blocks:[3,3,3],fare:11,perPax:0.7,cost:200000,op:1500,tier:4,span:34,lvl:6,wear:1.2,fire:2,blurb:'Twin aisles and 306 seats, to Asia and the Americas.'},
  {name:'F-200 Freighter',short:'F-200',rows:22,blocks:[3,3],fare:0,perPax:1,cost:18000,op:220,tier:2,span:45,lvl:3,wear:1,freighter:1,cargo:80,blurb:'All cargo, no passengers. No queues, and happy to fly at night.'}
];
const POLICIES=[
  {k:'late',name:'Late passengers',opts:[['wait','Wait for them'],['close','Close on time']],desc:'Waiting risks a delay. Closing on time refunds their fare and hurts your rating.'},
  {k:'xfer',name:'Connections',opts:[['hold','Hold the flight'],['leave','Leave on time']],desc:'Leaving pays half the fare as compensation and upsets them.'},
  {k:'repair',name:'Faults',opts:[['std','Standard repair'],['rush','Rush repair']],desc:'Rush repairs cost double the flight’s fuel but take 4 min, not 20.'},
  {k:'pay',name:'Staff pay',opts:[[0,'Low −20%'],[1,'Standard'],[2,'Good +25%']],desc:'Low pay: 10% slower staff, more sick days and strikes. Good pay: 10% faster, no strikes.'},
  {k:'agency',name:'Sick cover',opts:[[false,'Run short'],[true,'Agency staff']],desc:'Agency staff keep every lane open when someone calls in sick, for a fee.'},
  {k:'ads',name:'Terminal advertising',opts:[[false,'None'],[true,'FIZZCO banners']],desc:'Earns per passenger, but passengers dislike it: rating drifts down.'},
  {k:'repl',name:'Rail and tram failures',opts:[[false,'Suspend the line'],[true,'Replacement buses']],desc:'Replacement buses cost money and carry 40% as many.',show:()=>Object.keys(G.lines||{}).length>0},
  {k:'checks',name:'Maintenance',opts:[[false,'When I say'],[true,'Overnight checks']],desc:'Overnight checks service worn planes parked at 03:00 for 80% of the price, less with a maintenance hangar. Worn planes break down more.'},
  {k:'curfew',name:'Night flights',opts:[[false,'Allowed'],[true,'Curfew 23:30–05:30']],desc:'Night flights make noise that slows nearby towns and costs rating. A curfew parks planes overnight.',show:()=>G.level>=1}
];
const POLDEF={late:'wait',xfer:'hold',repair:'std',pay:1,agency:false,ads:false,repl:false,curfew:false,checks:true};
const pol=k=>(G.pol&&G.pol[k]!=null)?G.pol[k]:POLDEF[k];
const payMul=()=>[0.8,1,1.25][pol('pay')];
const CARGO_RATE=()=>12*(1+0.1*G.lv.cargo);
const TRIP=[60,85,120,180,240];
const PARTNERS=[['Blue Heron','BH','#4C7DFF'],['Aerolux','AX','#E5484D'],['Nordvind','NV','#9B6BFF'],['Sahara Air','SH','#FF9F43'],['Kestrel','KE','#6BE39A'],['Skyline Pacific','SP','#2BB3A3']];
const PARTNER_CUT=0.3;
const fitsGate=(t,i)=>{const a=AIRCRAFT[t];return !(a.tier>=4&&i<4)&&!(a.fire&&G.lv.fire<a.fire)};
const tripMins=a=>Math.round(TRIP[a.tier]*(0.85+Math.random()*0.3));
const AC_ORDER=[0,4,1,5,2,7,3,6];
/* the cities you can fly to: code, name, haul (0 short … 4 ultra long), business share, size 1–5, compass bearing, season */
const CITIES=[
  ['DUB','Dublin',0,.45,4,285,'flat'],['EDI','Edinburgh',0,.35,3,350,'flat'],['BFS','Belfast',0,.3,2,316,'flat'],['AMS','Amsterdam',0,.5,5,72,'flat'],['BRU','Brussels',0,.6,3,106,'flat'],['CDG','Paris',0,.55,5,145,'flat'],['JER','Jersey',0,.1,1,192,'summer'],
  ['BCN','Barcelona',1,.2,5,174,'summer'],['FCO','Rome',1,.3,4,140,'summer'],['BER','Berlin',1,.4,4,76,'flat'],['CPH','Copenhagen',1,.45,3,52,'flat'],['PRG','Prague',1,.15,3,96,'flat'],['VIE','Vienna',1,.4,3,114,'flat'],['ZRH','Zurich',1,.7,3,124,'ski'],['GVA','Geneva',1,.6,2,157,'ski'],
  ['LIS','Lisbon',2,.2,4,200,'summer'],['ATH','Athens',2,.15,3,130,'summer'],['OSL','Oslo',2,.45,2,42,'flat'],['KEF','Reykjavik',2,.1,2,328,'ski'],['BUD','Budapest',2,.15,3,104,'flat'],['MAD','Madrid',2,.35,4,181,'flat'],['TFS','Tenerife',2,.05,4,219,'wsun'],
  ['JFK','New York',3,.45,5,278,'flat'],['BOS','Boston',3,.5,3,293,'flat'],['YYZ','Toronto',3,.35,3,308,'flat'],['DXB','Dubai',3,.4,4,105,'wsun'],['ORD','Chicago',3,.5,3,323,'flat'],['IAD','Washington',3,.55,2,262,'flat'],
  ['SIN','Singapore',4,.5,4,96,'flat'],['HND','Tokyo',4,.5,4,25,'flat'],['LAX','Los Angeles',4,.3,4,332,'flat'],['HKG','Hong Kong',4,.6,3,50,'flat'],['BOM','Mumbai',4,.35,3,118,'flat'],['GRU','São Paulo',4,.35,2,222,'flat'],['SYD','Sydney',4,.2,3,72,'wsun'],
];
const CITY={};CITIES.forEach(([code,name,tier,biz,size,brg,sea])=>CITY[code]={code,name,tier,biz,size,brg,sea});
const DESTS=[0,1,2,3,4].map(t=>CITIES.filter(c=>c[2]===t).map(c=>[c[0],c[1]]));
const GROUP_CITIES=new Set(['PRG','BUD','DUB','BCN','AMS']);
const METHODS=[
  {id:'random',name:'Random',cost:0,lvl:0,desc:'Whoever reaches the scanner first boards first.'},
  {id:'btf',name:'Back to front',cost:60,lvl:0,desc:'Four zones, rear first. Popular, but zones still jam.'},
  {id:'wilma',name:'Window, middle, aisle',cost:220,lvl:1,desc:'Window, then middle, then aisle. No climbing over.'},
  {id:'steffen',name:'Steffen method',cost:1500,lvl:3,desc:'Alternate rows, window first, so many stow at once.'},
];
const LEGENDS={random:[[4,'Everyone']],btf:[[0,'Zone 1'],[1,'Zone 2'],[2,'Zone 3'],[3,'Zone 4']],wilma:[[0,'Window'],[1,'Middle'],[2,'Aisle']],steffen:[[0,'Window'],[1,'Middle'],[2,'Aisle']]};
const SHOPS=[
  {id:'coffee',name:'Coffee cart',cost:50,spend:0.6,dwell:3,pull:0.28,col:'#C08A5B',ic:'cup',lvl:0},
  {id:'books',name:'News & books',cost:260,spend:1.4,dwell:4,pull:0.22,col:'#6FA8DC',ic:'book',lvl:0},
  {id:'cafe',name:'Café',cost:700,spend:2.2,dwell:5,pull:0.3,col:'#D9A066',ic:'cup',lvl:1},
  {id:'bar',name:'Bar',cost:2200,spend:3,dwell:7,pull:0.26,col:'#C39BFF',ic:'glass',lvl:3},
  {id:'duty',name:'Duty free',cost:7000,spend:6,dwell:8,pull:0.35,col:'#F5D08A',ic:'gift',lvl:4},
  {id:'lounge',name:'Business lounge',cost:1800,spend:4,dwell:9,pull:0.9,col:'#8FB8E0',ic:'seat',vip:true,lvl:3},
  {id:'dining',name:'Restaurant',cost:15000,spend:8,dwell:10,pull:0.22,col:'#E5484D',ic:'cup',lvl:4},
  {id:'luxury',name:'Luxury boutique',cost:45000,spend:18,dwell:7,pull:0.12,col:'#B8A1FF',ic:'gift',lvl:6},
  {id:'spa',name:'Spa and showers',cost:90000,spend:26,dwell:14,pull:0.07,col:'#6BE3C9',ic:'seat',lvl:7},
];
const LEVELS=[
  {name:'Airfield'},
  {name:'Local Airport',req:{pax:600,rep:50,gates:2},reward:500},
  {name:'Regional Airport',req:{pax:2000,daily:1500,rep:52,gates:3},reward:1500},
  {name:'City Airport',req:{pax:6000,daily:3200,rep:55,gates:3},reward:4000},
  {name:'International Airport',req:{pax:30000,daily:8000,rep:60,gates:4},reward:15000},
  {name:'Gateway Airport',req:{pax:60000,daily:13000,rep:62,gates:5},reward:30000},
  {name:'Major Hub',req:{pax:110000,daily:19000,rep:65,gates:6},reward:60000},
  {name:'Global Hub',req:{pax:210000,daily:28000,rep:70,gates:8},reward:150000},
  {name:'World Gateway',req:{pax:380000,daily:33000,rep:75,gates:8},reward:300000},
  {name:'Airport of the Year',req:{pax:560000,daily:36000,rep:80,gates:8},reward:600000},
];
const CAPFRAC=[0.35,0.5,0.58,0.65,0.8,0.85,0.9,1,1,1];
const SEASONS=[{name:'Spring',dem:1},{name:'Summer',dem:1.1},{name:'Autumn',dem:1},{name:'Winter',dem:0.9}];
const EF={
  checkin:l=>1.8*Math.pow(0.88,l), kiosk:l=>1.0*Math.pow(0.93,l), sec:l=>1.5*Math.pow(0.87,l), scan:l=>1.3*Math.pow(0.85,l),
  stow:l=>2.6*Math.pow(0.86,l), carry:l=>Math.max(0.2,0.85-0.13*l), clean:l=>6*Math.pow(0.8,l), bag:l=>2.4*Math.pow(1.28,l), tow:l=>3*Math.pow(0.85,l), land:l=>6*Math.pow(0.86,l), tko:l=>4.5*Math.pow(0.86,l),
};
const f1=v=>v.toFixed(1),f2=v=>v.toFixed(2);
const UPG={
  desks:{tab:'terminal',sec:'Check-in',icon:'desk',name:'Check-in desks',max:7,base:12,mult:2.3,fx:(l,m)=>m?`<b>${1+l}</b> desks`:`<b>${1+l}</b> → <b>${2+l}</b> desks`},
  training:{tab:'terminal',sec:'Check-in',icon:'watch',name:'Agent training',max:15,base:8,mult:1.5,fx:(l,m)=>m?`<b>${f2(EF.checkin(l))}</b> min per check-in`:`<b>${f2(EF.checkin(l))}</b> → <b>${f2(EF.checkin(l+1))}</b> min per check-in, faster passports too`},
  kiosks:{tab:'terminal',sec:'Check-in',icon:'kiosk',name:'Self-service kiosks',max:4,base:45,mult:2.2,lvl:1,fx:(l,m)=>m?`<b>${l}</b> kiosks for passengers without hold bags`:`<b>${l}</b> → <b>${l+1}</b> kiosks. Only for passengers without hold bags. No wages.`},
  online:{tab:'terminal',sec:'Check-in',icon:'phone',name:'Online check-in',max:5,base:70,mult:2,lvl:1,fx:(l,m)=>m?`<b>${l*12}%</b> of cabin-bag-only passengers skip the hall`:`<b>${l*12}%</b> → <b>${(l+1)*12}%</b> of cabin-bag-only passengers go straight to security`},
  lanes:{tab:'terminal',sec:'Security',icon:'lane',name:'Security lanes',max:7,base:20,mult:2.3,fx:(l,m)=>m?`<b>${1+l}</b> lanes`:`<b>${1+l}</b> → <b>${2+l}</b> lanes`},
  sectech:{tab:'terminal',sec:'Security',icon:'scan',name:'Scanner technology',max:15,base:25,mult:1.65,fx:(l,m)=>m?`<b>${f2(EF.sec(l))}</b> min per passenger`:`<b>${f2(EF.sec(l))}</b> → <b>${f2(EF.sec(l+1))}</b> min per passenger`},
  fasttrack:{tab:'terminal',sec:'Security',icon:'fast',name:'Fast track lane',max:1,base:300,mult:1,lvl:1,fx:(l,m)=>m?'Business and priority passengers skip the main queue':'A separate lane for business and priority passengers'},
  ftsales:{tab:'terminal',sec:'Security',icon:'ticket',name:'Fast track sales',max:5,base:150,mult:1.8,lvl:1,req:()=>G.lv.fasttrack>0,reqText:'Needs the fast track lane',fx:(l,m)=>m?`<b>${l*6}%</b> of passengers pay for fast track`:`<b>${l*6}%</b> → <b>${(l+1)*6}%</b> of passengers pay to skip the queue`},
  officers:{tab:'terminal',sec:'Arrivals',icon:'passport',name:'Passport desks',max:7,base:20,mult:2.3,fx:(l,m)=>m?`<b>${1+l}</b> passport desks`:`<b>${1+l}</b> → <b>${2+l}</b> passport desks`},
  egates:{tab:'terminal',sec:'Arrivals',icon:'scan',name:'E-gates',max:8,base:90,mult:2.2,lvl:1,fx:(l,m)=>m?`<b>${l}</b> e-gates for eligible passports`:`<b>${l}</b> → <b>${l+1}</b> e-gates. Three times faster, for about 60% of arrivals. No wages.`},
  walkway:{tab:'terminal',sec:'Concourse',icon:'walk',name:'Moving walkways',max:8,base:18,mult:1.9,fx:(l,m)=>m?`Walking pace <b>${100+20*l}%</b>`:`Walking pace <b>${100+20*l}%</b> → <b>${120+20*l}%</b> in the concourse and jet bridges`},
  wifi:{tab:'terminal',sec:'Concourse',icon:'wifi',name:'Free Wi-Fi',max:3,base:180,mult:3,lvl:1,fx:(l,m)=>m?`Passengers tolerate <b>+${l*2}</b> min of queueing`:`Queue patience <b>+${l*2}</b> → <b>+${(l+1)*2}</b> min before your rating suffers`},
  assist:{tab:'terminal',sec:'Concourse',icon:'walk',name:'Assistance service',max:3,base:120,mult:2.4,lvl:1,fx:(l,m)=>m?`<b>${l}</b> buggies: passengers who need help ride at full speed`:`<b>${l}</b> → <b>${l+1}</b> buggies. Passengers who need help ride instead of shuffling, and rate you higher.`},
  mover:{tab:'terminal',sec:'Concourse',icon:'train',name:'Pier B people mover',max:1,base:20000,mult:1,lvl:6,req:()=>G.pierB,reqText:'Needs Pier B',fx:(l,m)=>m?'Long walks along the piers are 2.5× faster':'An airside train for long walks along the piers: 2.5× faster'},
  roster:{tab:'terminal',sec:'Staff',icon:'crew',name:'Rostering system',max:1,base:250,mult:1,lvl:3,fx:(l,m)=>m?'Auto rostering is available under Staffing':'Opens counters as queues grow and closes them when quiet.'},
  scanners:{tab:'ground',sec:'Gates',icon:'scan',name:'Gate scanners',max:12,base:15,mult:1.65,fx:(l,m)=>m?`A boarding pass every <b>${f2(EF.scan(l))}</b> min`:`A boarding pass every <b>${f2(EF.scan(l))}</b> → <b>${f2(EF.scan(l+1))}</b> min`},
  bins:{tab:'ground',sec:'Gates',icon:'bin',name:'Bigger overhead bins',max:12,base:25,mult:1.7,fx:(l,m)=>m?`Stowing a bag takes <b>${f1(EF.stow(l))}</b> min`:`Stowing a bag <b>${f1(EF.stow(l))}</b> → <b>${f1(EF.stow(l+1))}</b> min`},
  handlers:{tab:'ground',sec:'Apron',icon:'cart',name:'Baggage handlers',max:12,base:30,mult:1.7,fx:(l,m)=>m?`<b>${f1(EF.bag(l))}</b> bags a minute per gate`:`<b>${f1(EF.bag(l))}</b> → <b>${f1(EF.bag(l+1))}</b> bags a minute per gate. Big jets load faster.`},
  bagsys:{tab:'ground',sec:'Apron',icon:'box',name:'Automated baggage system',max:3,base:6000,mult:2.5,lvl:4,fx:(l,m)=>m?`Bags move <b>${100+35*l}%</b> as fast`:`Belts and loading <b>${100+35*l}%</b> → <b>${135+35*l}%</b> as fast`},
  crew:{tab:'ground',sec:'Apron',icon:'crew',name:'Turnaround crew',max:10,base:25,mult:1.75,fx:(l,m)=>m?`Cleaning and refuelling take <b>${f1(EF.clean(l))}</b> min`:`Cleaning and refuelling <b>${f1(EF.clean(l))}</b> → <b>${f1(EF.clean(l+1))}</b> min`},
  tugs:{tab:'ground',sec:'Apron',icon:'tug',name:'Tow tugs',max:6,base:60,mult:2.1,fx:(l,m)=>m?`Tow-in takes <b>${f1(EF.tow(l))}</b> min`:`Tow-in <b>${f1(EF.tow(l))}</b> → <b>${f1(EF.tow(l+1))}</b> min`},
  deice:{tab:'ground',sec:'Apron',icon:'snow',name:'De-icing pads',max:3,base:900,mult:2.4,lvl:3,fx:(l,m)=>m?`Snow delays cut by <b>${l*30}%</b>`:`Snow delays cut by <b>${l*30}%</b> → <b>${(l+1)*30}%</b>. Winter brings snow.`},
  fuelfarm:{tab:'ground',sec:'Apron',icon:'fuel',name:'Fuel farm',max:4,base:5000,mult:2.2,lvl:4,fx:(l,m)=>m?`Fuel costs <b>−${l*6}%</b>`:`Fuel costs <b>−${l*6}%</b> → <b>−${(l+1)*6}%</b> on every flight`},
  atc:{tab:'ground',sec:'Runway',icon:'tower',name:'Air traffic control',max:10,base:60,mult:1.8,lvl:1,fx:(l,m)=>m?`Landing <b>${f1(EF.land(l))}</b> min, take-off <b>${f1(EF.tko(l))}</b> min`:`Landing <b>${f1(EF.land(l))}</b> → <b>${f1(EF.land(l+1))}</b> min, take-off <b>${f1(EF.tko(l))}</b> → <b>${f1(EF.tko(l+1))}</b> min`},
  ils:{tab:'ground',sec:'Runway',icon:'runway',name:'Instrument landing system',max:1,base:12000,mult:1,lvl:4,fx:(l,m)=>m?'Fog barely slows the runway':'Fog barely slows landings and take-offs'},
  radar:{tab:'ground',sec:'Runway',icon:'tower',name:'Weather radar',max:1,base:8000,mult:1,lvl:3,fx:(l,m)=>m?'Storms close the runway only when right overhead':'Storms close the runway only when their core is right overhead.'},
  runway2:{tab:'ground',sec:'Runway',icon:'runway',name:'Second runway',max:1,base:15000,mult:1,lvl:4,build:360,fx:(l,m)=>m?'Two runways share the landings and take-offs':'Doubles landing and take-off capacity. 6 h build.'},
  fire:{tab:'ground',sec:'Runway',icon:'fire',name:'Fire and rescue',max:3,base:2000,mult:2.5,lvl:4,fx:(l,m)=>m?`Category <b>${l}</b>. Repairs ${l*15}% faster.`:`Category <b>${l}</b> → <b>${l+1}</b>. Widebodies need category 2. Repairs faster.`},
  hangar:{tab:'ground',sec:'Engineering',icon:'wrench',name:'Maintenance hangar',max:3,base:400,mult:2.4,lvl:1,fx:(l,m)=>m?`Aircraft wear <b>${100-25*l}%</b> as fast`:`Aircraft wear <b>${100-25*l}%</b> → <b>${75-25*l}%</b> as fast, so fewer breakdowns`},
  crews:{tab:'ground',sec:'Engineering',icon:'crane',name:'Construction crews',max:3,base:1500,mult:3,lvl:3,fx:(l,m)=>m?`<b>${1+l}</b> projects at once, <b>${Math.round((1-Math.pow(0.8,l))*100)}%</b> quicker`:`<b>${1+l}</b> → <b>${2+l}</b> projects at once, and each builds 20% quicker`},
  solar:{tab:'ground',sec:'Engineering',icon:'solar',name:'Solar farm',max:4,base:8000,mult:2,lvl:4,fx:(l,m)=>m?`Running costs <b>−${l*12}%</b>`:`Running costs <b>−${l*12}%</b> → <b>−${(l+1)*12}%</b>`},
  tower:{tab:'ground',sec:'Landmark projects',icon:'tower',name:'New control tower',max:1,base:1200000,mult:1,lvl:6,build:360,fx:(l,m)=>m?'Landings and take-offs 20% quicker':'Landings and take-offs 20% quicker. 6 h build.'},
  cargohub:{tab:'ground',sec:'Landmark projects',icon:'box',name:'Cargo terminal',max:1,base:2500000,mult:1,lvl:6,build:480,req:()=>G.lv.cargo>0,reqText:'Needs cargo sales',fx:(l,m)=>m?'Cargo pays double':'A dedicated freight shed and forwarders. Cargo pays double. Takes 8 hours to build.'},
  mall:{tab:'ground',sec:'Landmark projects',icon:'store',name:'Airside galleria',max:1,base:4000000,mult:1,lvl:7,build:480,fx:(l,m)=>m?'Shoppers spend 40% more':'A shopping hall airside. Shops take 40% more a visit. 8 h build.'},
  saf:{tab:'ground',sec:'Landmark projects',icon:'fuel',name:'Sustainable fuel plant',max:1,base:8000000,mult:1,lvl:7,build:600,fx:(l,m)=>m?'Fuel 20% cheaper, rating rises faster':'Jet fuel from waste. Fuel −20%, rating gains +25%. 10 h build.'},
  icon:{tab:'ground',sec:'Landmark projects',icon:'crane',name:'Architect’s new terminal roof',max:1,base:12000000,mult:1,lvl:9,build:720,fx:(l,m)=>m?'Passengers wait 4 minutes longer before complaining':'A roof people travel to see. Passengers tolerate 4 more minutes of queueing. 12 h build.'},
  marketing:{tab:'sales',sec:'Demand',icon:'mega',name:'Marketing',max:15,base:30,mult:1.75,fx:(l,m)=>m?`Demand <b>+${f1(l*3.5)}%</b>, route markets <b>+${l*3}%</b>`:`Demand <b>+${f1(l*3.5)}%</b> → <b>+${f1((l+1)*3.5)}%</b>. Every route’s market grows 3%.`},
  loyalty:{tab:'sales',sec:'Demand',icon:'prio',name:'Frequent flyer club',max:5,base:800,mult:2.2,lvl:3,fx:(l,m)=>m?`Price sensitivity <b>−${l*12}%</b>`:`Price sensitivity <b>−${l*12}%</b> → <b>−${(l+1)*12}%</b>, so higher fares lose fewer passengers`},
  bagfee:{tab:'sales',sec:'Extras',icon:'bag',name:'Cabin bag fee',max:5,base:40,mult:2.1,fx:(l,m)=>m?`<b>${Math.round(EF.carry(l)*100)}%</b> bring a carry-on`:`Carry-ons <b>${Math.round(EF.carry(l)*100)}%</b> → <b>${Math.round(EF.carry(l+1)*100)}%</b>. Hold bags pay at the desk, but take longer to load.`},
  priority:{tab:'sales',sec:'Extras',icon:'prio',name:'Priority boarding',max:5,base:120,mult:1.9,lvl:1,fx:(l,m)=>m?`<b>${l*5}%</b> buy priority`:`<b>${l*5}%</b> → <b>${(l+1)*5}%</b> buy priority. They pay extra and board first, scrambling your method.`},
  business:{tab:'sales',sec:'Extras',icon:'seat',name:'Business cabin',max:1,base:180,mult:1,lvl:1,fx:(l,m)=>m?'Front rows pay 3× fare':'Front rows pay 3× fare. Starts with each gate’s next flight.'},
  cargo:{tab:'sales',sec:'Extras',icon:'box',name:'Cargo sales',max:5,base:150,mult:2,lvl:3,fx:(l,m)=>m?`Hold space for <b>${l*6}%</b> of seats sold as cargo`:`Cargo <b>${l*6}%</b> → <b>${(l+1)*6}%</b> of seat count. Pays on departure; slows loading.`},
  carpark:{tab:'sales',sec:'Landside',icon:'car',name:'Car park',max:8,base:80,mult:2.1,fx:(l,m)=>m?`<b>${carCap(l)}</b> spaces at <b>${money(carFeeBase(l))}</b> a car`:`<b>${carCap(l)}</b> → <b>${carCap(l+1)}</b> spaces, <b>${money(carFeeBase(l))}</b> → <b>${money(carFeeBase(l+1))}</b> a car`},
  rail:{tab:'region',sec:'Airport station',icon:'train',name:'Railway station',max:1,base:2500,mult:1,lvl:3,build:180,fx:(l,m)=>m?'Trains, the metro and high-speed rail can reach the terminal. Demand +6%.':'Lets trains, the metro and high-speed rail reach the terminal. Demand +6%. 3 h build.'},
  rtinfo:{tab:'region',sec:'Network',icon:'phone',name:'Live departure screens',max:1,base:600,mult:1,lvl:1,fx:(l,m)=>m?'Waits feel 30% shorter':'Waits for buses, trams and trains feel 30% shorter, so more people ride.'},
  insul:{tab:'region',sec:'Network',icon:'hotel',name:'Noise insulation',max:3,base:20000,mult:2.2,lvl:3,fx:(l,m)=>m?`Night noise −${30*l}%`:`Night noise −${30*l}% → −${30*(l+1)}%`},
  depot:{tab:'region',sec:'Network',icon:'bus',name:'Electric bus depot',max:2,base:25000,mult:3,lvl:3,fx:(l,m)=>m?`Bus, coach and tram running costs −${15*l}%`:`Bus, coach and tram running costs −${15*l}% → −${15*(l+1)}%`},
  tickets:{tab:'region',sec:'Network',icon:'ticket',name:'Through ticketing',max:1,base:40000,mult:1,lvl:4,fx:(l,m)=>m?'One ticket from any stop to the plane':'One ticket from any stop to the plane: +20% riders, −10% per fare.'},
  control:{tab:'region',sec:'Network',icon:'tower',name:'Transport control centre',max:1,base:400000,mult:1,lvl:6,build:360,fx:(l,m)=>m?'Disruptions last half as long; services 8% quicker':'Disruptions last half as long; services 8% quicker. 6 h build.'},
  hotel:{tab:'sales',sec:'Landside',icon:'hotel',name:'Airport hotel',max:5,base:6000,mult:2,lvl:4,fx:(l,m)=>m?`<b>${l*5}%</b> of arrivals stay the night`:`<b>${l*5}%</b> → <b>${(l+1)*5}%</b> of arriving passengers book a room`},
};
const ICON={
  map:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
  bus:'<rect x="4" y="4" width="16" height="13" rx="2"/><path d="M4 11h16M7 20v-3M17 20v-3"/><circle cx="8" cy="14" r=".8"/><circle cx="16" cy="14" r=".8"/>',
  desk:'<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M9 20h6M12 16v4"/>',
  watch:'<circle cx="12" cy="13" r="7"/><path d="M12 13V9.5M10 3h4M12 3v3"/>',
  scan:'<path d="M4 6v12M7 6v12M10.5 6v12M14 6v12M16.5 6v12M20 6v12"/>',
  walk:'<path d="M3 18h18M5 14l3-3.5L5 7M11 14l3-3.5L11 7M17 14l3-3.5L17 7"/>',
  bin:'<path d="M3 5h18v8H3zM3 9h18M7 17h10M9 21h6"/>',
  mega:'<path d="M4 10v4h3l8 4.5v-13L7 10H4zM18.5 9a4 4 0 010 6"/>',
  bag:'<rect x="5" y="8" width="14" height="12" rx="2"/><path d="M9 8V5h6v3M9 12v4M15 12v4"/>',
  seat:'<path d="M8 3v11h9M8 14l-1.5 7M17 14v7M11 10h7"/>',
  crew:'<path d="M20 12a8 8 0 11-2.4-5.7M20 4v5h-5"/>',
  plane:'<path d="M12 2.5c1 0 1.5 1.5 1.5 3V10l7 4v2l-7-2v4.5l2.5 2V22L12 21l-4 1v-1.5l2.5-2V14l-7 2v-2l7-4V5.5c0-1.5.5-3 1.5-3z"/>',
  kiosk:'<rect x="6" y="3" width="12" height="11" rx="1"/><path d="M9 21h6M12 14v7M9 7h6"/>',
  phone:'<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M10 18h4M10 7h4v4h-4z"/>',
  lane:'<path d="M4 20V8a8 8 0 0116 0v12M8 20v-9M16 20v-9"/>',
  fast:'<path d="M4 12h10M10 7l5 5-5 5M16 7l5 5-5 5"/>',
  ticket:'<path d="M3 8a2 2 0 002-2h14a2 2 0 002 2v8a2 2 0 00-2 2H5a2 2 0 00-2-2z"/><path d="M13 6v12" stroke-dasharray="2 2"/>',
  cart:'<rect x="2" y="9" width="8" height="7" rx="1"/><rect x="12" y="9" width="8" height="7" rx="1"/><path d="M10 13h2M5 19h.01M8 19h.01M15 19h.01M18 19h.01"/>',
  tug:'<rect x="4" y="9" width="12" height="8" rx="1.5"/><path d="M16 13h5M8 9V6h5v3M7 20h.01M13 20h.01"/>',
  prio:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
  cup:'<path d="M5 8h11v6a5 5 0 01-5 5h-1a5 5 0 01-5-5zM16 10h2a2 2 0 010 4h-2M8 3v2M11 3v2"/>',
  book:'<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 5v16M8 7h7"/>',
  glass:'<path d="M6 3h12l-6 8zM12 11v9M8 21h8"/>',
  gift:'<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 12h18M12 8v13M12 8C10 3 6 4 7.5 7.5M12 8c2-5 6-4 4.5-.5"/>',
  passport:'<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M9 16h6"/>',
  chart:'<path d="M5 20V11M11 20V5M17 20v-7M3 20h18"/>',
  tower:'<path d="M9 21l1-10h4l1 10M7 11h10l-1.5-4h-7zM12 7V3"/>',
  runway:'<path d="M7 21L9 3M17 21L15 3M12 5v2M12 10v2M12 15v2"/>',
  wrench:'<path d="M14.5 5.5a4 4 0 00-5 5L4 16l4 4 5.5-5.5a4 4 0 005-5l-2.5 2.5-3-3z"/>',
  car:'<path d="M5 16v-5l2-5h10l2 5v5M3 16h18v3H3zM7 19v2M17 19v2M5 11h14"/>',
  train:'<rect x="6" y="3" width="12" height="14" rx="3"/><path d="M6 11h12M9 20l-2 2M15 20l2 2M9 14h.01M15 14h.01"/>',
  box:'<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
  store:'<path d="M3 9l2-5h14l2 5M3 9v11h18V9M3 9h18M9 20v-6h6v6"/>',
  wifi:'<path d="M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0M12 19.5h.01"/>',
  snow:'<path d="M12 2v20M4 6l16 12M20 6L4 18M9 3l3 3 3-3M9 21l3-3 3 3"/>',
  fuel:'<path d="M5 21V5a2 2 0 012-2h6a2 2 0 012 2v16M3 21h14M15 9h2a2 2 0 012 2v6a1.5 1.5 0 003 0V8l-3-3M8 7h4"/>',
  fire:'<path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
  solar:'<path d="M4 14l2-8h12l2 8zM4 14h16M9 6l-1 8M15 6l1 8M5 10h14M12 14v5M8 21h8"/>',
  crane:'<path d="M6 21V4M6 4h14M6 8l4-4M20 4v5M18 9h4v3h-4zM3 21h6"/>',
  hotel:'<path d="M4 21V5a1 1 0 011-1h14a1 1 0 011 1v16M2 21h20M8 8h2M14 8h2M8 12h2M14 12h2M10 21v-4h4v4"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
  pier:'<path d="M3 12h18M3 12v6M21 12v6M7 12V8M12 12V6M17 12V8"/>',
};
/* ================= the Masterplan: a tech tree bought with planning points ================= */
const BRANCHES=[['term','Terminal'],['air','Airside'],['net','Fleet and routes'],['com','Commercial'],['reg','Region']];
const TECH=[
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
const has=key=>!NODE_OF[key]||!!(G.tech&&G.tech[NODE_OF[key]]);
const researched=id=>!!(G.tech&&G.tech[id]);
function techState(T){if(researched(T.id))return 'done';if(T.t>G.level)return 'level';if((T.r||[]).some(r=>!researched(r)))return 'req';if((G.pts||0)<T.c)return 'pts';return 'ready'}
const FEAT_NAMES={promo:'Route promotions',alliance:'Partners pay 40% and fly more',slots:'An edge over Lowmere',occ:'Fewer delays at the far end'};
function itemName(key){const [k,v]=key.split(':');
  if(k==='up')return UPG[v]?UPG[v].name:v;if(k==='ac')return AIRCRAFT[+v].name;if(k==='meth')return (METHODS.find(m=>m.id===v)||{}).name||v;
  if(k==='shop')return (SHOPS.find(x=>x.id===v)||{}).name||v;if(k==='mode')return MODES[v].name+' lines';if(k==='dev')return DEV[v].name;
  if(k==='stn')return STN_UP[v].name;if(k==='rt')return ['Short-haul','Medium-haul','Sun and capital','Long-haul','Ultra long-haul'][+v]+' routes';if(k==='feat')return FEAT_NAMES[v]||v;return v}
function research(id){const T=TECH_BY[id];if(!T||techState(T)!=='ready')return false;G.pts-=T.c;(G.tech||(G.tech={}))[id]=1;
  const nt=new Set(G.newTabs||[]);for(const k of T.u){const [a,v]=k.split(':');if(a==='up'&&UPG[v])nt.add(UPG[v].tab);else if(a==='ac'||a==='meth')nt.add('stands');else if(a==='rt'||a==='feat')nt.add('routes');else if(a==='shop')nt.add('sales');else if(a==='mode'||a==='dev'||a==='stn')nt.add('region')}G.newTabs=[...nt];
  if(!R.sim){toast(`Approved: ${T.n}. ${T.u.map(itemName).join(', ')}.`,null,null,'goal',6);kaching();renderTabs();renderPlanBtn()}return true}
const consultCost=()=>Math.round(20000*Math.pow(1.35,G.ptBought||0));
function buyPoint(){if(G.level<4)return false;const c=consultCost();if(!buy(c))return false;G.pts=(G.pts||0)+1;G.ptBought=(G.ptBought||0)+1;if(!R.sim)renderPlanBtn();return true}
const planHint=key=>{const T=TECH_BY[NODE_OF[key]];return T?`Approve <b>${T.n}</b> in the Masterplan${T.t>G.level?` (from ${LEVELS[T.t].name})`:''}.`:''};
const TABS=[['stands','Gates','plane'],['routes','Routes','globe'],['terminal','Terminal','lane'],['ground','Airfield','runway'],['sales','Sales','ticket'],['region','Region','map'],['office','Office','chart']];
const nRoutes=()=>Object.keys(G.routes||{}).length;
const GOALS=[
  {id:'seat',t:'Seat 30 passengers',p:()=>[G.paxSeated,30],r:15},
  {id:'desk',t:'Open a second check-in desk',go:['terminal','[data-buy="desks"]'],p:()=>[G.lv.desks,1],r:15},
  {id:'ontime',t:'Get a flight away on time',p:()=>[G.ontime,1],r:20},
  {id:'lane',t:'Open a second security lane',go:['terminal','[data-buy="lanes"]'],p:()=>[G.lv.lanes,1],r:25},
  {id:'pass',t:'Open a second passport desk',go:['terminal','[data-buy="officers"]'],p:()=>[G.lv.officers,1],r:30},
  {id:'shop',t:'Open a shop in the concourse',go:['sales','.shopcard'],p:()=>[G.shops.filter(Boolean).length,1],r:30},
  {id:'method',t:'Buy a new boarding method',go:['stands','[data-mbuy]'],p:()=>[Object.keys(G.methods).length-1,1],r:40},
  {id:'plane2',t:'Buy a second plane',go:['stands','[data-acbuy]'],p:()=>[G.fleet.filter(f=>!f.sold).length,2],r:60},
  {id:'a2',t:'Open gate A2',go:['stands','[data-standbuy="1"]'],p:()=>[builtCount()-1,1],r:100},
  {id:'l1',t:'Become a Local Airport',go:['office','#levels'],p:()=>[G.level,1],r:0},
  {id:'plan',t:'Approve a plan in the Masterplan',go:['plan'],p:()=>[Object.keys(G.tech||{}).length,1],r:100,need:()=>G.level>=1},
  {id:'route',t:'Open a new route',go:['routes','[data-ropen]'],p:()=>[nRoutes(),4],r:150,need:()=>G.level>=1},
  {id:'two',t:'Run flights from two gates at once',go:['stands','[data-acbuy]'],p:()=>[R.st.filter((S,k)=>G.stands[k].built&&S.F).length,2],r:120},
  {id:'bus',t:'Run a bus to Harbourgate',go:['region','[data-newline]'],p:()=>[Object.values(G.lines||{}).some(L=>L.mode==='bus'&&serves(L,'air')&&['hbc','old','hbs'].some(n=>serves(L,n)))?1:0,1],r:150,need:()=>G.level>=1},
  {id:'streak',t:'Three on-time departures in a row',p:()=>[G.bestStreak,3],r:150,pts:1},
  {id:'l2',t:'Become a Regional Airport',go:['office','#levels'],p:()=>[G.level,2],r:0},
  {id:'a3',t:'Open gate A3',go:['stands','[data-standbuy="2"]'],p:()=>[builtCount()-1,2],r:400,need:()=>G.level>=STAND[2].lvl},
  {id:'shops',t:'Earn $2,000 from shops',go:['sales','.shopcard'],p:()=>[G.revBy.shops,2000],r:300},
  {id:'biz',t:'Fly 500 business travellers',go:['routes','[data-ropen]'],p:()=>[G.bizFlown||0,500],r:500,pts:1},
  {id:'l3',t:'Become a City Airport',go:['office','#levels'],p:()=>[G.level,3],r:0},
  {id:'rail',t:'Open the railway station',go:['region','[data-buy="rail"]'],p:()=>[G.lv.rail,1],r:1200,need:()=>has('up:rail')},
  {id:'dev',t:'Build on a development site',go:['region','[data-dbuild]'],p:()=>[Object.keys(G.dev||{}).length,1],r:2000,pts:1,need:()=>G.level>=1},
  {id:'low1',t:'Keep 55% of travellers on routes you share with Lowmere',go:['routes','.lcard.riv'],p:()=>[rivMix()==null?0:Math.round(rivMix()*100),55],r:3000,pts:1,need:()=>rivLive()&&rivMix()!=null},
  {id:'a4',t:'Open all four A gates',go:['stands','[data-standbuy="3"]'],p:()=>[builtCount()-1,3],r:2000,need:()=>G.level>=STAND[3].lvl},
  {id:'r10',t:'Fly to 10 destinations',go:['routes','[data-ropen]'],p:()=>[nRoutes(),10],r:3000,pts:1},
  {id:'l4',t:'Become an International Airport',go:['office','#levels'],p:()=>[G.level,4],r:0},
  {id:'tram',t:'Open a tram line',go:['region','[data-newline]'],p:()=>[anyMode('tram')?1:0,1],r:6000,need:()=>has('mode:tram')},
  {id:'link',t:'Link two lines at one station',go:['region','[data-newline]'],p:()=>[NODE_IDS.some(n=>linesAt(n).length>=2)?1:0,1],r:4000,pts:1,need:()=>G.level>=1},
  {id:'pier',t:'Build Pier B',go:['stands','[data-pierbuy]'],p:()=>[G.pierB?1:0,1],r:5000,need:()=>G.level>=PIER.lvl},
  {id:'long',t:'Open a long-haul route',go:['routes','[data-ropen]'],p:()=>[Object.keys(G.routes||{}).some(c=>CITY[c].tier>=3)?1:0,1],r:5000,need:()=>has('rt:3')},
  {id:'event',t:'Host a match, concert, cruise or conference',go:['region','[data-dbuild]'],p:()=>[G.evDone||0,1],r:15000,pts:1,need:()=>has('dev:stadium')},
  {id:'rwy',t:'Build a second runway',go:['ground','[data-buy="runway2"]'],p:()=>[G.lv.runway2,1],r:8000,need:()=>has('up:runway2')},
  {id:'l5',t:'Become a Gateway Airport',go:['office','#levels'],p:()=>[G.level,5],r:0},
  {id:'r20',t:'Fly to 20 destinations',go:['routes','[data-ropen]'],p:()=>[nRoutes(),20],r:20000,pts:1},
  {id:'l6',t:'Become a Major Hub',go:['office','#levels'],p:()=>[G.level,6],r:0},
  {id:'wide',t:'Fly the W-300 Widebody',go:['stands','[data-acbuy="6"]'],p:()=>[G.fleet.some(f=>f.type===6&&!f.sold)?1:0,1],r:30000,need:()=>has('ac:6')},
  {id:'metro',t:'Dig a metro to the city',go:['region','[data-newline]'],p:()=>[anyMode('metro')?1:0,1],r:80000,need:()=>has('mode:metro')},
  {id:'riders',t:'Carry 1,000 riders an hour',go:['region','[data-newline]'],p:()=>[Math.round(R.reg?R.reg.riders:0),1000],r:120000,pts:1,need:()=>G.level>=1},
  {id:'g8',t:'Open all eight gates',go:['stands','[data-standbuy="7"]'],p:()=>[builtCount(),8],r:60000,need:()=>G.level>=STAND[7].lvl},
  {id:'tower',t:'Build the new control tower',go:['ground','[data-buy="tower"]'],p:()=>[G.lv.tower,1],r:100000,need:()=>has('up:tower')},
  {id:'l7',t:'Become a Global Hub',go:['office','#levels'],p:()=>[G.level,7],r:0},
  {id:'hsr',t:'Run high-speed trains to Lowmere',go:['region','[data-newline]'],p:()=>[anyMode('hsr')?1:0,1],r:250000,need:()=>has('mode:hsr')},
  {id:'r30',t:'Fly to 30 destinations',go:['routes','[data-ropen]'],p:()=>[nRoutes(),30],r:200000,pts:1},
  {id:'m10',t:'Earn $10 million',p:()=>[G.earned,1e7],r:0},
  {id:'l8',t:'Become a World Gateway',go:['office','#levels'],p:()=>[G.level,8],r:0},
  {id:'buylow',t:'Buy Lowmere Airport',go:['routes','[data-rivbuy]'],p:()=>[G.rival&&G.rival.owned?1:0,1],r:0,pts:1,need:()=>!!(G.rival&&G.rival.opened)},
  {id:'land3',t:'Finish three landmark projects',go:['ground','[data-buy="mall"]'],p:()=>[['tower','cargohub','mall','saf','icon'].filter(k=>G.lv[k]).length,3],r:500000,pts:1},
  {id:'l9',t:'Become Airport of the Year',go:['office','#levels'],p:()=>[G.level,9],r:0},
  {id:'land5',t:'Finish every landmark project',go:['ground','[data-buy="icon"]'],p:()=>[['tower','cargohub','mall','saf','icon'].filter(k=>G.lv[k]).length,5],r:0},
  {id:'m50',t:'Earn $50 million',p:()=>[G.earned,5e7],r:0},
];
const curGoal=()=>GOALS.find(g=>!(G.gdone&&G.gdone[g.id])&&(!g.need||g.need()));
const goalsDone=()=>GOALS.filter(g=>G.gdone&&G.gdone[g.id]).length;

/* ================= state ================= */
const DEFAULT=()=>({cash:25,rep:60,flown:0,flights:0,ontime:0,streak:0,bestStreak:0,earned:0,paxSeated:0,level:0,pierB:false,builds:[],day:1,dstat:null,lastDay:null,
  lv:Object.fromEntries(Object.keys(UPG).map(k=>[k,0])),
  methods:{random:true},
  stands:SIDX.map(i=>({built:i===0,ac:i===0?0:null,method:'random',rear:false,route:'mixed'})),
  open:{desks:null,lanes:null,officers:null},auto:true,wageMul:1,loan:0,gstats:SIDX.map(()=>[]),
  fleet:[{type:0,st:'base',readyAt:0,wear:0}],shops:SIDX.map(()=>null),
  fare:1,name:'Northwind',livery:0,clock:360,flightNo:101,history:[],best:{},reports:SIDX.map(()=>null),
  sound:true,tab:'stands',goal:0,lines:{},infra:{},tod:{},stn:{},lineSeq:0,goalV:2,dev:{},pop:{},evq:[],evDone:0,revBy:{transit:0,transitOps:0,region:0,wages:0,upkeep:0,interest:0,assets:0,fares:0,inbound:0,landside:0,cargo:0,bags:0,shops:0,fast:0,priority:0,bonus:0,costs:0},hours:[],arrReports:SIDX.map(()=>null),
  savedAt:0,rate:0,lastDest:'',tech:{},pts:0,ptBought:0,pv:2,gdone:{},routes:{DUB:{f:1},EDI:{f:1},AMS:{f:1}},rs:{},crews:[{free:0,back:0,duty:0,res:0},{free:0,back:0,duty:0,res:0}],tour:{s:0},nv3:1,set:{tips:true,msgs:'all',pops:'all',goal:true,badges:true,recs:true,autoLines:true,autoFares:true,autoCrews:true,chal:true}});
const SET=()=>G.set||{};
let G=DEFAULT();
const mkStandRT=()=>({F:null,out:null,bridge:[[],[]],aisle:[[],[],[],[]],dAisle:[[],[],[],[]],dBridge:[[],[]],scanT:[0,0],spots:new Array(80).fill(null),ext:0,geo:null,P:null});
const R={rwy:{q:[],act:[null,null]},lot:new Array(540).fill(0),platform:[],train:{state:'away',t:3,x:null},lotFull:0,arrQ:[],booths:[],egates:[],arrBelt:[],bm:'dep',pax:[],ciQ:[],secQ:[],ftQ:[],desks:[],kiosks:[],lanes:[],ftL:{p:null,t:0},belt:[],st:SIDX.map(mkStandRT),
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
    const sc=ac.freighter?-TRIP[C.tier]*(0.8+Math.random()*0.4):(seats*routeLF(c,seats)*cityFare(c)*G.fare-routeOp(ac,c)*fuelMul())/(TRIP[C.tier]+45)*(0.92+Math.random()*0.16);
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
  let u=LEVEL_UPKEEP[G.level]||0;G.stands.forEach((s,i)=>{if(s.built)u+=i<4?4+i*4:120+(i-4)*60});
  if(G.pierB)u+=250;if(G.lv.runway2)u+=500;if(G.lv.rail)u+=120;u+=G.lv.hotel*60+G.lv.fire*80+G.lv.fuelfarm*40+G.lv.mover*400+G.lv.tower*300+G.lv.cargohub*500+G.lv.mall*800+G.lv.saf*400+G.lv.icon*1000;
  u+=G.dev?devSum('upk'):0;
  return u*(1-0.12*G.lv.solar)*(G.dev&&devOn('wind')?0.85:1);
}

/* ================= geometry ================= */
function mkPath(pts){const segs=[];let L=0;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);segs.push({a,b,len,start:L});L+=len}return {pts,segs,len:L}}
function ptAt(p,s){s=clamp(s,0,p.len);for(const g of p.segs){if(s<=g.start+g.len+1e-6){const t=g.len?(s-g.start)/g.len:0;return [g.a[0]+(g.b[0]-g.a[0])*t,g.a[1]+(g.b[1]-g.a[1])*t]}}const e=p.pts[p.pts.length-1];return [e[0],e[1]]}
function geom(ac){
  const blocks=ac.blocks,cols=blocks.reduce((a,b)=>a+b,0),nA=blocks.length-1,total=cols*SEATW+nA*AISLE;
  const pitch=Math.min(16,CABIN_MAX/ac.rows),fw=total/2+7,rowsStart=CABIN_TOP+16,end=rowsStart+ac.rows*pitch+12;
  const seatXs=[],aisleX=[],colA=[],colS=[],colCt=[],colBlk=[];let x=-total/2;
  blocks.forEach((n,b)=>{for(let s=0;s<n;s++){seatXs.push(x+SEATW/2);x+=SEATW}if(b<nA){aisleX.push(x+AISLE/2);x+=AISLE}});
  let start=0;
  blocks.forEach((n,b)=>{
    for(let s=0;s<n;s++){
      const c=start+s;let a,side;
      if(b===0){a=0;side=0}else if(b===nA){a=nA-1;side=1}else if(s<n/2){a=b-1;side=1}else{a=b;side=0}
      const blk=[];if(side===0){for(let k=c+1;k<start+n;k++)blk.push(k)}else{for(let k=start;k<c;k++)blk.push(k)}
      colA[c]=a;colS[c]=side;colBlk[c]=blk;colCt[c]=blk.length===0?2:((b===0&&s===0)||(b===nA&&s===n-1))?0:1;
    }
    start+=n;
  });
  return {cols,nA,pitch,fw,rowsStart,end,seatXs,aisleX,colA,colS,colCt,colBlk,fd:{x:-fw,y:CABIN_TOP+8},rd:{x:-fw,y:end-6},
    P0:(CABIN_TOP+8-rowsStart)/pitch-0.5,P1:(end-6-rowsStart)/pitch-0.5,
    wingY:rowsStart+ac.rows*pitch*0.36,chord:Math.max(38,ac.rows*pitch*0.26),span:ac.span,holdY:rowsStart+ac.rows*pitch*0.78};
}
function paths(i,g){
  const sx=STAND_X[i];
  return {bridge:mkPath([[sx-120,TERM_Y+2],[sx-120,g.fd.y+20],[sx+g.fd.x-3,g.fd.y]]),
    rear:mkPath([[sx-70,TERM_Y+2],[sx-g.fw-16,g.rd.y+12],[sx-g.fw-3,g.rd.y]]),
    cart:mkPath([[sx+114,TERM_Y],[sx+114,g.holdY+16],[sx+g.fw+12,g.holdY]])};
}
const seatX=(F,c)=>F.geo.seatXs[c];
const rowY=(F,p)=>F.geo.rowsStart+(p+0.5)*F.geo.pitch;
const ARR_DOOR={x:487,y:512},EXIT={x:1238,y:578};
const Y0=-180,Y1=830,RWY_Y=[-140,-88],DOOR={x:156,y:618};
const BAY=i=>i<360?{x:344+Math.floor(i/5)*12,y:686+(i%5)*19}:{x:1264+Math.floor((i-360)/5)*12,y:686+(i%5)*19};
const carCap=(l=G.lv.carpark)=>60+60*l, carFeeBase=(l=G.lv.carpark)=>0.8*(1+0.35*l);
const WAGE={desks:3,lanes:4,officers:3.5},OWN={desks:()=>1+G.lv.desks,lanes:()=>1+G.lv.lanes,officers:()=>1+G.lv.officers};
function staffed(t){const own=OWN[t]();if(G.lv.roster&&G.auto)return clamp((R.autoN&&R.autoN[t])||own,1,own);const v=G.open&&G.open[t];return v==null?own:clamp(v,1,own)}
const fuelMul=()=>(R.fx.hedge>G.clock?0.8:R.fx.fuelUp>G.clock?1.35:R.fx.fuelDown>G.clock?0.85:1)*(1-0.06*G.lv.fuelfarm)*(G.lv.saf?0.8:1);
const sellValue=f=>Math.round(AIRCRAFT[f.type].cost*0.6*Math.max(0.4,1-(f.wear||0)*0.03));
const shopSpentEst=s=>{let t=SHOPS[s.type].cost;for(let k=0;k<s.lvl;k++)t+=Math.round(SHOPS[s.type].cost*0.8*Math.pow(1.7,k));return t};
const shopValue=s=>Math.round(0.4*(s.spent??shopSpentEst(s)));
const loanCap=()=>Math.max(G.loan||0,Math.min(1000000,2000+Math.floor(G.earned*0.3/1000)*1000));
const loanRate=v=>0.01+0.04*Math.pow(clamp(v/loanCap(),0,1),1.5);
const loanStep=()=>{const c=loanCap();return c<=10000?100:c<=100000?500:c<=500000?1000:5000};
const serviceCost=f=>Math.round(AIRCRAFT[f.type].cost*0.05+15);
const faultRisk=w=>clamp((w-5)*0.035,0,0.5);
function demandNow(){const h=(G.clock/60)%24;return h>=5&&h<9?1.2:h>=9&&h<16?0.95:h>=16&&h<20?1.15:h>=20&&h<23?0.9:0.6}
function demandName(){const h=(G.clock/60)%24;return h>=5&&h<9?'MORNING PEAK':h>=9&&h<16?'DAYTIME':h>=16&&h<20?'EVENING PEAK':h>=20&&h<23?'LATE':'NIGHT'}
const boothPos=i=>({x:704,y:531+i*10}),egatePos=i=>({x:i<4?728:744,y:531+(i%4)*12}),carX=i=>800+(i%4)*108,carY=i=>i<4?566:600;
function arrSlot(i){if(i>=168)return {x:492+(i%4)*3,y:604};const per=24,r=Math.floor(i/per),k=i%per;return {x:r%2===0?678-k*8:678-(per-1-k)*8,y:534+r*12}}
const deskX=i=>32+i*26, kioskX=i=>230+i*17, laneX=i=>304+i*20, FT_X=462;
function ciSlot(i){if(i>=165)return {x:14+(i%4)*3,y:562+(i%7)*3};const per=33,r=Math.floor(i/per),k=i%per;return {x:r%2===0?24+k*8:24+(per-1-k)*8,y:553+r*12}}
function secSlot(i){if(i>=85)return {x:296+(i%3)*3,y:604};const per=17,r=Math.floor(i/per),k=i%per;return {x:r%2===0?302+k*8:302+(per-1-k)*8,y:553+r*12}}
const ftSlot=i=>({x:FT_X,y:Math.min(606,553+i*8)});
function spotPos(i,j){return {x:STAND_X[i]-138+(j%16)*9,y:456+Math.floor(j/16)*8.5}}
const shopX=j=>STAND_X[j]+22;
const standOpen=i=>i<4||G.pierB;

/* ================= flights ================= */
function seatPax(g,k,extra){const col=k%g.cols;return Object.assign({row:Math.floor(k/g.cols),col,ct:g.colCt[col],ais:g.colA[col],side:g.colS[col]+2*g.colA[col]},extra)}
function shuffled(n){const a=[...Array(n).keys()];for(let k=a.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[a[k],a[j]]=[a[j],a[k]]}return a}
function pickPartner(i){
  const c=AC_ORDER.filter(t=>!AIRCRAFT[t].freighter&&AIRCRAFT[t].lvl<=G.level&&fitsGate(t,i));let tot=0;const w=c.map(t=>{const x=1+AIRCRAFT[t].lvl*1.4;tot+=x;return x});
  let r=Math.random()*tot,t=c[0];for(let k=0;k<c.length;k++){r-=w[k];if(r<=0){t=c[k];break}}
  const pa=PARTNERS[Math.floor(Math.random()*PARTNERS.length)];return {type:t,name:pa[0],code:pa[1],col:pa[2]};
}
const nightWin=()=>{const h=(G.clock/60)%24;return h>=23.5||h<5.5};
function curfewSoon(){if(!pol('curfew'))return false;const h=(G.clock/60)%24;return nightWin()||(h<23.5&&(23.5-h)*60<90)}
function allocFlight(i){
  if(curfewSoon())return null;
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
  const run=(n,from,to)=>{if(to<=from)return [];for(let tr=0;tr<10;tr++){const k=from+Math.floor(Math.random()*(to-from)),r=[];for(let j=k;j<to&&r.length<n;j++){if(taken[j])break;r.push(j)}if(r.length===n)return r}const r=[];for(let j=from;j<to&&r.length<n;j++)if(!taken[j])r.push(j);return r};
  let left=booked,pid=0;
  while(left>0){
    const x=Math.random();let type,n;
    if(x<0.025){type='prm';n=1}else if(x<0.025+b*0.85){type='work';n=1}
    else{const y=Math.random();if(y<grpP){type='grp';n=4+Math.floor(Math.random()*4)}else if(y<grpP+famP){type='fam';n=Math.random()<0.5?3:4}else{type='lei';n=Math.random()<0.55?2:1}}
    n=Math.min(n,left);let st=type==='work'?run(1,0,bizN):[];if(st.length<n)st=run(n,bizN,seatsN);if(st.length<n)st=run(n,0,seatsN);if(!st.length)break;
    st.forEach(k=>taken[k]=1);pid++;const T=PTYPE[type],lspd=T.spd[0]+Math.random()*(T.spd[1]-T.spd[0]);let lead=null;
    st.forEach((k,m)=>{const p=seatPax(geo,k,{stand:i});p.lane=p.row>=split?1:0;
      const biz=p.row<bRows,kid=type==='fam'&&m>=2,carry=kid?false:Math.random()<(biz?0.9:T.carry??D.carryP),checked=kid?false:Math.random()<clamp(T.checked??(carry?0.2:0.75),0.02,0.95);
      Object.assign(p,{type,party:pid,kid,biz,prio:!biz&&!kid&&Math.random()<D.prioP+T.prio,carry,checked,online:!checked&&Math.random()<D.online,fast:false,spd:(type==='fam'||type==='grp')?lspd*(0.95+Math.random()*0.1):lspd,rand:Math.random(),wait:0,x:0,y:0,tx:0,ty:0,state:'new',spot:-1});
      p.psize=st.length;if(lead){p.leader=lead;p.rand=lead.rand}else lead=p;out.push(p)});
    left-=st.length;
  }
  // parties arrive together: shuffle whole parties, keeping members next to each other
  const parties=[];for(const p of out){const q=parties[parties.length-1];if(q&&q[0].party===p.party)q.push(p);else parties.push([p])}
  for(let k=parties.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[parties[k],parties[j]]=[parties[j],parties[k]]}
  return parties.flat().reverse();
}
function newFlight(i,src){
  const st=G.stands[i];if(!st.built||!src) return null;
  const partner=src.partner||null,fl=partner?null:G.fleet[src.fleet];if(!partner&&(!fl||fl.sold))return null;
  const ac=AIRCRAFT[partner?partner.type:fl.type],D=derived(),S=R.st[i];
  const rear=st.rear&&ac.tier>=1,geo=geom(ac),cols=geo.cols,seatsN=ac.rows*cols,P=paths(i,geo);
  // where it flies: your planes follow the dispatcher, partners fly their own schedules
  let dc=partner?null:pickRoute(ac);
  if(!dc){const pool=CITIES.filter(c=>c[2]<=ac.tier&&c[2]>=ac.tier-1&&c[0]!==G.lastDest);dc=pool[Math.floor(Math.random()*pool.length)][0]}
  const C=CITY[dc],dest=[C.code,C.name];G.lastDest=C.code;
  const FR=!!ac.freighter,lf=partner?paxLF(dc,1):routeLF(dc,seatsN),booked=FR?0:Math.max(4,Math.round(seatsN*lf));
  S.geo=geo;S.P=P;
  const split=rear?Math.ceil(ac.rows/2):ac.rows,bRows=G.lv.business?(cols===4?2:3):0;
  const manifest=FR?[]:buildManifest(geo,seatsN,booked,bRows,C,D,i,split);
  const lastC=fl&&fl.last&&CITY[fl.last[0]]?fl.last:null;
  const from=lastC||(()=>{const pool=CITIES.filter(c=>c[2]<=ac.tier&&c[0]!==C.code);const c=pool[Math.floor(Math.random()*pool.length)];return [c[0],c[1]]})(),FC=CITY[from[0]];
  if(fl){fl.last=dest;fl.lastTier=ac.tier;fl.st='gate';fl.gate=i}
  // inbound leg: the aircraft lands full of passengers from its last destination
  const inN=FR?0:Math.max(4,Math.round(seatsN*clamp(paxLF(from[0],1)*0.95,0.1,1)));
  const occIn=new Int8Array(seatsN).fill(-1),fb=FC?FC.biz:0.35;
  const arrPax=shuffled(seatsN).slice(0,inN).map(k=>{occIn[k]=1;const p=seatPax(geo,k,{inbound:true,stand:i});p.lane=p.row>=split?1:0;const r=Math.random(),type=r<0.03?'prm':r<0.03+fb*0.85?'work':r<0.8?'lei':'fam';
    return Object.assign(p,{type,biz:p.row<bRows,carry:Math.random()<(type==='work'?0.9:0.7),checked:Math.random()<(type==='work'?0.15:type==='fam'||type==='prm'?0.85:0.5),elig:Math.random()<0.6,spd:type==='prm'?(G.lv.assist?0.95+0.1*G.lv.assist:0.5):type==='work'?1+Math.random()*0.3:0.7+Math.random()*0.5,wait:0,x:0,y:0,tx:0,ty:0,state:'seatedIn'})});
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
    const F2=R.st[cands[Math.floor(Math.random()*cands.length)]].F,n=Math.min(Math.round(inN*0.18),F2.manifest.length-6,20);
    for(let j=0;j<n;j++){const p=arrPax[Math.floor(Math.random()*arrPax.length)];if(p.xfer)continue;const k=F2.manifest.findIndex(q=>!q.leader&&q.type!=='fam'&&q.type!=='grp');if(k<0)break;const q=F2.manifest.splice(k,1)[0];
      if(q.checked){q.checked=false;F2.checkedTotal--}p.xfer=q;p.checked=false;F2.xferWait=(F2.xferWait||0)+1;F.arr.xferN=(F.arr.xferN||0)+1}
    F.arr.bags=arrPax.filter(p=>p.checked).length;
  }
  if(FR){const fill=clamp(0.55+0.08*G.lv.cargo+(devOn('logistics')?0.2:0)+(R.reg?R.reg.jobs*0.004:0),0.3,1);F.cargo=Math.round(ac.cargo*fill);F.arr.bags=Math.round(ac.cargo*fill*0.85);F.freighter=true;F.std=Math.ceil((G.clock+30+D.clean+(F.cargo+F.arr.bags)*0.35)/5)*5}
  else F.cargo=Math.round(seatsN*0.06*G.lv.cargo);
  F.checkedTotal+=F.cargo;F.bagsIn=F.cargo;
  F.willFault=!partner&&Math.random()<faultRisk(fl.wear||0);
  if(booked>8&&G.flights>2&&Math.random()<0.12){const k=manifest.findIndex(q=>!q.leader&&q.type!=='fam'&&q.type!=='grp'&&q.type!=='prm');if(k>=0){F.straggler=manifest.splice(k,1)[0];F.stragglerAt=F.std+2+Math.random()*6}}
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

/* ================= sound ================= */
let AC=null,lastTick=0;
function ensureAudio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null}}
function tone(f,d,v,type,when){if(!G.sound||!AC||R.sim)return;try{const t=AC.currentTime+(when||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d+0.02)}catch(e){}}
function tick(){const n=performance.now();if(n-lastTick<60)return;lastTick=n;tone(1250+Math.random()*300,0.05,0.03,'triangle')}
function chime(){tone(659,0.5,0.05);tone(523,0.7,0.05,'sine',0.28)}
function kaching(){tone(988,0.08,0.045,'square');tone(1319,0.18,0.045,'square',0.07)}
function alertTone(){tone(440,0.18,0.05,'triangle');tone(440,0.18,0.05,'triangle',0.22)}
function fanfare(){[523,659,784,1047].forEach((f,k)=>tone(f,0.35,0.05,'triangle',k*0.12))}

/* ================= passengers: landside & airside ================= */
function carFee(F){return carFeeBase()*(1+0.3*F.ac.tier)}
function parkCar(){const cap=carCap();for(let b=0;b<cap;b++){if(R.lot[b]<=G.clock){R.lot[b]=G.clock+150+Math.random()*300;return b}}return -1}
function spawn(p){
  if(p.type==='prm')p.spd=G.lv.assist?0.95+0.1*G.lv.assist:0.5;
  const tk=pickTransit();
  if(tk==='train'){p.state='train';R.platform.push(p);return}
  if(tk==='tram'){p.state='tram';R.tramQ.push(p);return}
  if(tk==='bus'){p.state='bus';R.busQ.push(p);return}
  let x=null,y=0;
  if(Math.random()<0.42*(R.reg?R.reg.parkMul:1)){const b=parkCar();if(b>=0){const q=BAY(b);x=q.x;y=q.y;earn(carFee(p.F),'landside',q.x,q.y-8,'#9FC2E0')}else R.lotFull=G.clock}
  if(x==null){x=40+Math.random()*260;y=648+Math.random()*12}
  walkIn(p,x,y);
}
function spawnParty(list){const L=list[0];spawn(L);for(let k=1;k<list.length;k++){const p=list[k];if(L.state==='train'){p.state='train';R.platform.push(p)}else if(L.state==='tram'){p.state='tram';R.tramQ.push(p)}else if(L.state==='bus'){p.state='bus';R.busQ.push(p)}else walkIn(p,L.x+(k%2?6:-6)*Math.ceil(k/2),L.y+(k%2?3:-2))}}
function walkIn(p,x,y){p.x=x;p.y=y;p.state='walkIn';p.tx=DOOR.x+(Math.random()-0.5)*22;p.ty=DOOR.y-6;R.pax.push(p)}
function enterLandside(p){if(p.online)enterSecurity(p);else{p.state='queue';R.ciQ.push(p)}}
function updateTrain(dt){
  if(!G.lv.rail)return;const T=R.train,ft=vehFreq('train');
  if(!ft&&R.platform.length){R.platform.forEach(p=>walkIn(p,40+Math.random()*260,648+Math.random()*12));R.platform=[]}
  if(T.state==='away'){if(!ft)return;T.t-=dt;if(T.t<=0){T.state='in';T.t=0;const L=vehLine('train');T.col=L?shade(L.col,L.mode==='hsr'?0.85:0.62):'#3E6A8C';T.cars=L?(L.mode==='hsr'?3:2)+(L.cars||0):3;T.nose=L&&L.mode==='hsr'}}
  else if(T.state==='in'){T.t+=dt;const k=Math.min(1,T.t/1.2);T.x=-300+330*(1-Math.pow(1-k,2));if(k>=1){T.state='dwell';T.t=1.4;
    const n=R.platform.length;R.platform.forEach(p=>walkIn(p,T.x+20+Math.random()*230,712));R.platform=[]}}
  else if(T.state==='dwell'){T.t-=dt;if(T.t<=0&&syncKind('train')&&walkersTo(704)&&(T.extra=(T.extra||0)+dt)<3)T.t=0.05;if(T.t<=0){T.state='out';T.t=0;T.extra=0}}
  else if(T.state==='out'){T.t+=dt;const k=Math.min(1,T.t/1.2);T.x=30-330*k*k;if(k>=1){T.state='away';T.t=Math.max(1.5,60/Math.max(1,vehFreq('train'))-3.8);T.x=null}}
}
function updateRunway(dt,D){
  const Q=R.rwy;
  for(let r=0;r<2;r++){
    const a=Q.act[r];
    if(a){a.t+=dt;if(a.t>=a.dur){if(a.type==='arr')a.F.landed=true;Q.act[r]=null;G.moves=(G.moves||0)+1}}
    if(r<D.runways&&!Q.act[r]&&Q.q.length&&!(R.fx.storm>G.clock)){let k=Q.q.findIndex(m=>m.type==='arr');if(k<0)k=0;const m=Q.q.splice(k,1)[0];m.t=0;m.dur=m.type==='arr'?D.land:D.takeoff;Q.act[r]=m}
  }
}
function enterSecurity(p){
  const D=derived();
  const vip=p.biz||p.prio,ftW=R.ftQ.length*0.6,secW=R.secQ.length/Math.max(1,D.lanes);
  if(D.ft&&(vip?ftW<=secW+2:R.ftQ.length<8&&Math.random()<D.ftBuy*PTYPE[p.type||'lei'].ft)){
    if(!vip) earn(p.F.fare*0.6,'fast',null,null,null,p.F);
    p.fast=true;p.state='ftQ';R.ftQ.push(p);
  } else {p.state='secQ';R.secQ.push(p)}
}
function finishCheckin(p,x){
  if(p.checked){if(G.lv.bagfee>0)earn(p.F.ac.fare*0.5,'bags',x,535,'#D9A066',p.F);R.belt.push({x,F:p.F})}
  enterSecurity(p);
}
function airside(p,x){
  p.x=x;p.y=516;
  const F=p.F,left=F.std-G.clock,built=[];G.shops.forEach((s,j)=>{if(s&&standOpen(j))built.push(j)});
  if(p.leader){const L=p.leader;if((L.state==='toShop'||L.state==='shop')&&G.shops[L.shop]&&left>15){p.state='toShop';p.shop=L.shop;p.tx=clamp(L.tx+(Math.random()-0.5)*16,shopX(L.shop),shopX(L.shop)+116);p.ty=499+(Math.random()-0.5)*4;return}toGate(p);return}
  if(left>15&&built.length){
    for(let k=built.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[built[k],built[j]]=[built[j],built[k]]}
    if(p.biz||p.prio){const L=built.find(j=>SHOPS[G.shops[j].type].vip);if(L!=null&&Math.random()<0.9){p.state='toShop';p.shop=L;p.tx=shopX(L)+8+Math.random()*100;p.ty=499;return}}
    for(const j of built){const sh=SHOPS[G.shops[j].type];if(sh.vip)continue;if(Math.random()<Math.min(0.95,sh.pull*PTYPE[p.type||'lei'].shop*(p.type==='grp'&&sh.id==='bar'?2.5:1)*(1+0.3*((p.psize||1)-1)))){p.state='toShop';p.shop=j;p.tx=shopX(j)+8+Math.random()*100;p.ty=499;return}}
  }
  toGate(p);
}
function toGate(p){
  const S=R.st[p.stand],j=S.spots.indexOf(null);
  if(j>=0){S.spots[j]=p;p.spot=j;const s=spotPos(p.stand,j);p.tx=s.x;p.ty=s.y}
  else{p.spot=-1;p.tx=STAND_X[p.stand]-135+Math.random()*130;p.ty=500+Math.random()*12}
  p.state='toGate';
}
function serve(sv,x,y,dt,done,wx,wy){
  const p=sv.p;
  if(sv.n)moveTo(sv.n,wx,wy,210*sv.n.spd,dt);
  if(moveTo(p,x,y,150*p.spd,dt)){sv.t-=dt;if(sv.t<=0){sv.p=sv.n||null;sv.t=sv.tn||0;sv.n=null;done(p)}}
}
/* a counter calls the next passenger forward while it serves the current one */
function take(sv,pick,state,t){
  if(sv.p&&sv.n)return;const q=pick();if(!q)return;q.state=state;if(typeof t==='function')t=t(q);
  if(!sv.p){sv.p=q;sv.t=t}else{sv.n=q;sv.tn=t}
}
const walkMul=p=>G.lv.mover&&Math.abs(p.tx-p.x)>300?2.5:1;
function updateLandside(dt,D){
  for(let i=0;i<8;i++){
    const d=R.desks[i]||(R.desks[i]={p:null,t:0});
    if(i<D.desks&&R.ciQ.length)take(d,()=>R.ciQ.shift(),'desk',q=>D.checkin*(q.leader?0.4:1)*(q.type==='prm'?1.5:1));
    if(d.p) serve(d,deskX(i),541,dt,p=>finishCheckin(p,deskX(i)),deskX(i)+4,549);
  }
  for(let i=0;i<4;i++){
    const k=R.kiosks[i]||(R.kiosks[i]={p:null,t:0});
    if(i<D.kiosks)take(k,()=>{const n=Math.min(14,R.ciQ.length);for(let j=0;j<n;j++)if(!R.ciQ[j].checked)return R.ciQ.splice(j,1)[0];return null},'desk',D.kiosk);
    if(k.p) serve(k,kioskX(i),541,dt,p=>finishCheckin(p,kioskX(i)),kioskX(i)+3,549);
  }
  R.ciQ.forEach((p,i)=>{p.wait+=dt;const s=ciSlot(i);moveTo(p,s.x,s.y,70*p.spd,dt)});
  for(let i=0;i<8;i++){
    const L=R.lanes[i]||(R.lanes[i]={p:null,t:0});
    if(i<D.lanes&&R.secQ.length)take(L,()=>R.secQ.shift(),'sec',D.sec);
    if(L.p) serve(L,laneX(i),534,dt,p=>airside(p,laneX(i)),laneX(i),544);
  }
  if(D.ft){const L=R.ftL;if(R.ftQ.length)take(L,()=>R.ftQ.shift(),'sec',D.sec*0.6);if(L.p)serve(L,FT_X,534,dt,p=>airside(p,FT_X),FT_X,544)}
  else if(R.ftQ.length){while(R.ftQ.length){const p=R.ftQ.shift();p.state='secQ';R.secQ.push(p)}}
  R.secQ.forEach((p,i)=>{p.wait+=dt;const s=secSlot(i);moveTo(p,s.x,s.y,75*p.spd,dt)});
  R.ftQ.forEach((p,i)=>{p.wait+=dt;const s=ftSlot(i);moveTo(p,s.x,s.y,75*p.spd,dt)});
  const beltV=80*(1+0.3*G.lv.bagsys);
  for(const b of R.belt){b.x+=beltV*dt;if(b.x>=478){b.F.bagsIn++;b.done=true}}
  if(R.belt.some(b=>b.done)) R.belt=R.belt.filter(b=>!b.done);
  for(const p of R.pax){
    const sp=D.cwalk*p.spd;
    if(p.state==='walkIn'){if(moveTo(p,p.tx,p.ty,110*p.spd,dt))enterLandside(p)}
    else if(p.state==='toShop'){if(!G.shops[p.shop])toGate(p);else if(moveTo(p,p.tx,p.ty,sp*walkMul(p),dt)){p.state='shop';p.t=SHOPS[G.shops[p.shop].type].dwell;p.t0=p.t}}
    else if(p.state==='shop'){
      const F=p.F,hurry=F.plane.state==='boarding'&&G.clock>=F.std-12;
      p.t-=dt;
      if(p.t<=0||hurry){
        const s=G.shops[p.shop];
        if(s){const frac=clamp(1-Math.max(0,p.t)/p.t0,0.3,1),v=SHOPS[s.type].spend*Math.pow(1.25,s.lvl)*(1+0.6*F.ac.tier)*frac*(G.lv.mall?1.4:1);s.earned=(s.earned||0)+v;earn(v,'shops',p.x,p.y-6,'#F5D08A',F)}
        toGate(p);
      }
    }
    else if(p.state==='toGate'){if(moveTo(p,p.tx,p.ty,sp*walkMul(p),dt))p.state='gate'}
  }
}

/* ================= stands ================= */
function updateStand(i,dt,D){
  const S=R.st[i],st=G.stands[i];
  if(S.out){S.out.t+=dt;const k=Math.min(1,S.out.t/2.6);S.out.offY=-230*k*k;S.out.alpha=1-k;if(k>=1)S.out=null}
  if(!S.F){if((S.hold||0)>0)S.hold-=dt;else if(st.built){S.idleT=(S.idleT||0)+dt;S.F=allocFlight(i);if(S.F)S.idleT=0}if(!S.F){S.ext=clamp(S.ext-dt*1.6,0,1);return}}
  const F=S.F,pl=F.plane,g=F.geo,sx=STAND_X[i];
  if(pl.state==='wait'){if(!F.rwyReq){F.rwyReq=true;R.rwy.q.push({type:'arr',F,stand:i})}pl.state='approach'}
  else if(pl.state==='approach'){if(F.landed&&!S.out){pl.state='inbound';pl.t=0}}
  else if(pl.state==='inbound'){pl.t+=dt;const k=Math.min(1,pl.t/D.tow);pl.offY=-200*Math.pow(1-k,3);pl.alpha=Math.min(1,k*3);if(k>=1){pl.alpha=1;pl.state='deplaning';pl.offY=0;F.arr.started=G.clock}}
  else if(pl.state==='deplaning'){if(F.arr.onboard<=0){pl.state='turnaround';pl.t=D.clean}}
  else if(pl.state==='turnaround'){if(F.willFault&&!F.faultFired){F.faultFired=true;techFault(i,F)}pl.t-=dt;if(pl.t<=0){pl.state='boarding';F.boardStart=G.clock;chime()}}
  else if(pl.state==='boarding'){
    if(!F.manifest.length&&!F.straggler&&F.seated>=F.booked&&F.hold>=F.checkedTotal-1e-6&&F.arr.sent>=F.arr.bags&&!(F.xferWait>0)&&F.fault<=0&&crewReady(i,F)){pl.state='closing';pl.t=0.8;settle(i)}
  }
  else if(pl.state==='closing'){if(pol('curfew')&&nightWin()){F.curfewHeld=true;pl.t=0.2}pl.t-=dt;if(pl.t<=0){S.out={F,t:0,offY:0,alpha:1};R.rwy.q.push({type:'dep',F,stand:i});{const fl=G.fleet[F.fleetIdx];if(fl&&!fl.sold){fl.st='away';fl.dep=G.clock;const dl=CITY[F.city]?farDelay(CITY[F.city]):0;fl.late=dl;fl.back=G.clock+tripMins(CITY[F.city]||F.ac)+dl;crewAway(F,fl.back);fl.dest=F.dest[0];fl.trips=(fl.trips||0)+1;fl.gate=null}}S.F=null;S.idleT=0;return}}
  if(pl.state==='boarding'&&F.xferWait>0&&pol('xfer')==='leave'&&G.clock>=F.std){
    const m=F.xferWait;spend(m*F.fare*0.5,'costs');F.booked-=m;F.xferWait=0;F.xferCancelled=true;repAdj(-1,'missed');floater(`LEFT ${m} CONNECTING`,STAND_X[i],CABIN_TOP-24,'#FF7A8A',true);
  }
  const docked=pl.state==='deplaning'||pl.state==='turnaround'||pl.state==='boarding'||pl.state==='closing';
  S.ext=clamp(S.ext+(docked?dt:-dt)*1.6,0,1);
  if(docked&&F.fault>0){F.fault-=dt}
  const bagRate=D.bag*(F.ac.tier>=2?1.8:1),A=F.arr;
  if(docked&&A.unloaded<A.bags){A.unloaded=Math.min(A.bags,A.unloaded+bagRate*dt);while(A.sent<Math.floor(A.unloaded+1e-6)){A.sent++;R.arrBelt.push({A,t:2.5/(1+0.3*G.lv.bagsys)})}}
  else if(docked&&F.hold<F.bagsIn){F.hold=Math.min(F.bagsIn,F.hold+bagRate*dt)}
  if(pl.state==='deplaning')deplane(i,S,F,dt,D);
  if(F.manifest.length){F.spawnT-=dt;const rate=arrivalRate(F);while(F.spawnT<=0&&F.manifest.length){const L=F.manifest.pop(),pt=[L];while(F.manifest.length&&F.manifest[F.manifest.length-1].leader===L)pt.push(F.manifest.pop());spawnParty(pt);F.spawnT+=pt.length>1?1.6/rate:1/rate}}
  if(F.straggler&&G.clock>=F.stragglerAt){spawn(F.straggler);F.straggler=null}
  if(F.straggler&&pol('late')==='close'&&pl.state==='boarding'&&F.seated>=F.booked-1&&G.clock>=F.std){
    if(F.straggler.checked)F.checkedTotal--;F.booked--;spend(F.fare,'costs');F.straggler=null;repAdj(-1.5,'missed');floater('DOORS CLOSED',STAND_X[i],CABIN_TOP-24,'#FFC72C',true);
  }
  // gate scanners, one per door
  if(pl.state==='boarding'){
    for(const door of (F.rear?[0,1]:[0])){
      S.scanT[door]-=dt;if(S.scanT[door]>0)continue;
      const br=S.bridge[door];if(br.length&&br[br.length-1].s<SPACING)continue;
      let best=null,bk=Infinity;
      for(const p of R.pax){if(p.state==='gate'&&p.stand===i&&p.lane===door&&p.F===F){const k=keyOf(p);if(k<bk){bk=k;best=p}}}
      if(best){
        if(F.firstScan==null)F.firstScan=G.clock;
        if(best.prio)earn(F.fare*0.4,'priority',null,null,null,F);
        best.state='bridge';best.s=0;if(best.spot>=0)S.spots[best.spot]=null;best.spot=-1;br.push(best);S.scanT[door]=D.scan;
      } else S.scanT[door]=0;
    }
  }
  // jet bridge and rear stairs
  for(const door of [0,1]){
    const br=S.bridge[door];if(!br.length)continue;
    const path=door?F.P.rear:F.P.bridge;
    br.sort((a,b)=>b.s-a.s);let lead=Infinity;
    for(const p of br){p.s=Math.max(p.s,Math.min(p.s+D.walk*p.spd*dt,lead-SPACING,path.len));const q=ptAt(path,p.s);p.tx=q[0];p.ty=q[1];lead=p.s}
    if(br[0].s>=path.len-0.01){
      const p=br[0],al=S.aisle[door+2*p.ais];let clear=true;
      for(const a of al){if(door===0?a.pos<g.P0+GAP:a.pos>g.P1-GAP){clear=false;break}}
      if(clear){br.shift();p.state='aisle';p.phase='walk';p.pos=door?g.P1:g.P0;al.push(p)}
    }
  }
  // aisles: lane = door + 2 × aisle
  for(let L=0;L<4;L++){
    const al=S.aisle[L];if(!al.length)continue;
    const dir=L%2,ax=sx+g.aisleX[L>>1];
    al.sort(dir===0?(a,b)=>b.pos-a.pos:(a,b)=>a.pos-b.pos);
    let lead=dir===0?Infinity:-Infinity;
    for(const p of al){
      const v=D.aisleSpd*p.spd*dt;
      if(p.phase==='walk'){
        if(dir===0){p.pos=Math.max(p.pos,Math.min(p.pos+v,p.row,lead-GAP));if(p.pos>=p.row-1e-6)arrive(p,D)}
        else{p.pos=Math.min(p.pos,Math.max(p.pos-v,p.row,lead+GAP));if(p.pos<=p.row+1e-6)arrive(p,D)}
      } else if(p.phase!=='done'){
        p.t-=dt;
        if(p.t<=0){if(p.phase==='stow'){F.bags++;const b=blockers(p);if(b>0){p.phase='shuffle';p.t=b*D.shuffle;F.shuffles+=b}else sit(p)}else sit(p)}
      }
      if(p.phase!=='done'){p.tx=ax;p.ty=rowY(F,p.pos);lead=p.pos}
    }
    S.aisle[L]=al.filter(p=>p.phase!=='done');
  }
}
function deplane(i,S,F,dt,D){
  const A=F.arr,g=F.geo,sx=STAND_X[i];
  if(A.pax.length){
    let any=false;
    for(const p of A.pax){
      const al=S.dAisle[p.lane+2*p.ais];let free=true;
      for(const q of al){if(Math.abs(q.pos-p.row)<GAP){free=false;break}}
      if(!free||blockers(p,F.occIn)>0)continue;
      F.occIn[p.row*g.cols+p.col]=-1;p.state='dAisle';p.pos=p.row;p.phase=p.carry?'grab':'walk';p.t=D.stow*0.55;
      p.x=sx+seatX(F,p.col);p.y=rowY(F,p.row);al.push(p);R.pax.push(p);p.up=true;any=true;
    }
    if(any)A.pax=A.pax.filter(p=>!p.up);
  }
  for(let L=0;L<4;L++){
    const al=S.dAisle[L];if(!al.length)continue;
    const door=L%2,exitPos=door?g.P1:g.P0,br=S.dBridge[door],path=door?F.P.rear:F.P.bridge,ax=sx+g.aisleX[L>>1];
    al.sort(door===0?(a,b)=>a.pos-b.pos:(a,b)=>b.pos-a.pos);
    let lead=door===0?-Infinity:Infinity;
    for(const p of al){
      if(p.phase==='grab'){p.t-=dt;if(p.t<=0)p.phase='walk'}
      else{const v=D.aisleSpd*p.spd*dt;
        if(door===0)p.pos=Math.min(p.pos,Math.max(p.pos-v,exitPos,lead+GAP));else p.pos=Math.max(p.pos,Math.min(p.pos+v,exitPos,lead-GAP));
        if(Math.abs(p.pos-exitPos)<1e-6&&!br.some(q=>q.s>path.len-SPACING)){p.state='dBridge';p.s=path.len;br.push(p);A.onboard--;p.gone=true}
      }
      if(!p.gone){p.tx=ax;p.ty=rowY(F,p.pos);lead=p.pos}
    }
    S.dAisle[L]=al.filter(p=>!p.gone);
  }
}
function stepDeplaneBridges(i,D,dt){
  const S=R.st[i];
  for(const door of [0,1]){
    const br=S.dBridge[door];if(!br.length)continue;
    const F=br[0].F,path=door?F.P.rear:F.P.bridge;
    br.sort((a,b)=>a.s-b.s);let lead=-Infinity;
    for(const p of br){p.s=Math.min(p.s,Math.max(p.s-D.walk*p.spd*dt,lead+SPACING,0));const q=ptAt(path,p.s);p.tx=q[0];p.ty=q[1];lead=p.s;if(p.s<=0.01){p.out=true;if(!(p.xfer&&connect(p))){p.state='toArr';p.tx=ARR_DOOR.x+(Math.random()-0.5)*6;p.ty=ARR_DOOR.y}}}
    S.dBridge[door]=br.filter(p=>!p.out);
  }
}
function connect(p){
  const q=p.xfer,F2=q.F;
  if(F2.xferCancelled||R.st[q.stand].F!==F2||F2.plane.state==='closing')return false;
  F2.xferWait--;q.xferred=true;R.pax.push(q);airside(q,p.x);q.x=p.x;q.y=p.y+4;
  G.xfers=(G.xfers||0)+1;finishArrival(p);return true;
}
function afterControl(p){
  if(p.checked){p.state='toReclaim';const a=Math.random()*Math.PI*2;p.tx=carX(p.stand)+Math.cos(a)*48;p.ty=carY(p.stand)+Math.sin(a)*15}
  else exitTarget(p);
}
function finishArrival(p){
  const A=p.A;p.dead=true;A.cleared++;A.waitSum+=p.wait;countPax(true);
  {const v=(A.fare||A.ac.fare*G.fare)*0.6*(p.biz?3:1);if(A.partner)earn(v*partnerCut(),'handling');else earn(v,'inbound')}
  if(G.lv.hotel&&Math.random()<0.05*G.lv.hotel)earn(6*(1+0.3*A.ac.tier)*(devOn('hotels')?2:1),'landside',1360,540,'#9FC2E0');
  if(A.cleared>=A.n&&!A.done){
    A.done=true;const avg=A.waitSum/A.n,mins=G.clock-(A.started??G.clock),pat=patience();
    if(avg<8+pat)repAdj(0.8,'arrivals');else if(avg>18+pat)repAdj(-Math.min(4,(avg-18-pat)*0.2),'arrivals');
    if(isNight()&&R.reg&&R.reg.share>0.08&&!Object.values(G.lines||{}).some(L=>L.night))repAdj(-Math.min(2.5,R.reg.share*8),'stranded');
    G.arrReports[A.stand]={tag:A.code+A.no,from:A.from,n:A.n,avg,mins:Math.round(mins),bags:A.bags};
    floater(`${A.code}${A.no} CLEARED · ${Math.round(mins)} MIN`,1150,540,avg>18+pat?'#FF7A8A':'#9FC2E0',true);
  }
}
function updateArrivals(dt,D){
  for(const b of R.arrBelt){b.t-=dt;if(b.t<=0){b.A.reclaim++;b.done=true}}
  if(R.arrBelt.some(b=>b.done))R.arrBelt=R.arrBelt.filter(b=>!b.done);
  for(let i=0;i<8;i++){
    const B=R.booths[i]||(R.booths[i]={p:null,t:0});
    if(i<D.officers&&R.arrQ.length)take(B,()=>R.arrQ.shift(),'passport',D.passT);
    if(B.p){const bp=boothPos(i);serve(B,bp.x-7,bp.y,dt,afterControl,bp.x-15,bp.y)}
  }
  for(let i=0;i<8;i++){
    const E=R.egates[i]||(R.egates[i]={p:null,t:0});
    if(i<D.egates)take(E,()=>{const n=Math.min(14,R.arrQ.length);for(let j=0;j<n;j++)if(R.arrQ[j].elig)return R.arrQ.splice(j,1)[0];return null},'passport',D.egateT);
    if(E.p){const ep=egatePos(i);serve(E,ep.x-6,ep.y,dt,afterControl,ep.x-13,ep.y)}
  }
  R.arrQ.forEach((p,i)=>{p.wait+=dt;const s=arrSlot(i);moveTo(p,s.x,s.y,75*p.spd,dt)});
  for(const p of R.pax){
    if(!p.inbound)continue;
    if(p.state==='toArr'){if(moveTo(p,p.tx,p.ty,D.cwalk*p.spd*walkMul(p),dt)){p.state='arrQ';R.arrQ.push(p)}}
    else if(p.state==='toReclaim'){p.wait+=dt;if(moveTo(p,p.tx,p.ty,80*p.spd,dt))p.state='reclaim'}
    else if(p.state==='reclaim'){p.wait+=dt;if(p.A.reclaim>0){p.A.reclaim--;exitTarget(p)}}
    else if(p.state==='exitW'){if(moveTo(p,p.tx,p.ty,80*p.spd,dt))finishArrival(p)}
  }
}
function arrive(p,D){
  const F=p.F;p.pos=p.row;
  if(p.carry){p.phase='stow';p.t=D.stow*(1+0.9*F.bags/F.seatsN)}
  else{const b=blockers(p);if(b>0){p.phase='shuffle';p.t=b*D.shuffle;F.shuffles+=b}else sit(p)}
}
function sit(p){
  const F=p.F,idx=p.row*F.geo.cols+p.col,sx=STAND_X[p.stand];
  F.occ[idx]=groupOf(p);F.seated++;p.phase='done';p.state='sitting';
  p.tx=sx+seatX(F,p.col);p.ty=rowY(F,p.row);
  F.waitSum+=p.wait;F.waitN++;G.paxSeated++;countPax(false);
  if(p.type==='prm')repAdj(G.lv.assist?0.25+0.1*G.lv.assist:-0.5,'care');if(p.type==='work'&&!F.partner)G.bizFlown=(G.bizFlown||0)+1;
  {const v=(F.fare||F.ac.fare*G.fare)*(p.row<F.bRows?3:1);if(F.partner)earn(v*partnerCut(),'handling',p.tx,p.ty-4,'#9FC2E0',F);else earn(v,'fares',p.tx,p.ty-4,null,F);if(pol('ads'))earn(0.3*(1+0.4*F.ac.tier),'ads')}tick();
}
function settle(i){
  const F=R.st[i].F,late=F.curfewHeld?0:Math.max(0,Math.floor(G.clock)-F.std),onTime=late<=0,sx=STAND_X[i],pat=patience();
  let bonus=0;
  if(onTime){bonus=F.partner?0:Math.round(F.rev*0.2*100)/100;if(bonus)earn(bonus,'bonus',null,null,null,F);repAdj(2.5,'punctual');G.ontime++;G.streak++;G.bestStreak=Math.max(G.bestStreak,G.streak);floater(bonus?'ON TIME  +'+money(bonus):'ON TIME',sx,CABIN_TOP-40,'#FFC72C',true);kaching()}
  else{repAdj(-Math.min(8,1.5+late*0.2),'late');G.streak=0;floater(`LATE ${late} MIN`,sx,CABIN_TOP-40,'#FF7A8A',true);tone(220,0.35,0.04,'sawtooth')}
  const wait=F.waitN?F.waitSum/F.waitN:0;
  if(F.freighter){}else if(wait<5+pat)repAdj(1,'queues');else if(wait>12+pat)repAdj(-Math.min(5,(wait-12-pat)*0.25),'queues');
  if(F.cargo)earn((F.partner?partnerCut():1)*(F.freighter?(F.cargo+F.arr.bags)*CARGO_RATE():F.cargo*F.ac.fare*0.8)*(G.lv.cargohub?2:1)*(1+devSum('cargo')+0.15*Object.values(G.lines||{}).filter(L=>L.freight).length),'cargo',null,null,null,F);
  const op=F.partner?0:(F.op??F.ac.op*fuelMul());if(op)spend(op,'costs');else earn(F.ac.op*0.6,'handling',null,null,null,F);
  {const fl=G.fleet[F.fleetIdx];if(fl)fl.wear=(fl.wear||0)+F.ac.wear*(1-0.25*G.lv.hangar)}
  if(nightWin()&&!pol('curfew')){const nz=(1-0.3*G.lv.insul)*(F.freighter?1.5:1)*(1+0.25*G.level);G.noiseDay=(G.noiseDay||0)+nz;R.noiseT=G.clock;repAdj(-0.4*nz,'noise')}
  if(!F.partner&&F.city&&!F.freighter){const rs=rsOf(F.city),lf=F.booked/F.seatsN;rs.p+=F.booked;rs.v+=F.rev;rs.n++;rs.c=(rs.c||0)+op;rs.tp+=F.booked;rs.tv+=F.rev;rs.tn++;rs.tc=(rs.tc||0)+op;rs.lf=rs.tn>1?rs.lf*0.7+lf*0.3:lf}
  G.flights++;G.flown+=F.booked;if(G.dstat){const ds=G.dstat,h=Math.floor(G.clock/60)%24;ds.flights++;if(onTime)ds.ontime++;if(!F.freighter&&F.booked>=F.seatsN)ds.full=(ds.full||0)+1;if(h>=23||h<5)ds.night=(ds.night||0)+1;if(onTime&&R.fx.snow>G.clock)ds.snowOT=(ds.snowOT||0)+1}
  const mins=Math.max(1,G.clock-(F.firstScan??F.boardStart??F.start));
  const profit=F.rev-op;
  G.gstats[i]=(G.gstats[i]||[]).concat([{p:profit,o:onTime}]).slice(-5);
  G.reports[i]={tag:F.code+F.no,plane:F.ac.short,method:G.stands[i].method,pax:F.booked,mins:Math.round(mins),rate:F.booked/mins,shuffles:F.shuffles,wait:wait,onTime,late,profit,bags:F.checkedTotal};
  const bk=F.ac.short+'-'+G.stands[i].method;G.best[bk]=Math.max(G.best[bk]||0,F.booked/mins);
  G.history.unshift({std:F.std,tag:F.code+F.no,dest:F.dest,gate:GATES[i],dep:Math.floor(G.clock),late,profit});
  G.history.length=Math.min(G.history.length,5);
  if(R.sim)return;
  renderHist();save();
  if(G.tab==='office')renderPanel();
}

/* ================= construction, levels, days ================= */
const buildSlots=()=>1+G.lv.crews;
const buildMins=m=>m*Math.pow(0.8,G.lv.crews);
const isBuilding=id=>(G.builds||[]).some(b=>b.id===id);
const buildOf=id=>(G.builds||[]).find(b=>b.id===id);
function canBuild(){if(G.builds.length>=buildSlots()){toast(`Crews are busy with ${G.builds.map(b=>b.label).join(' and ')}. Wait, or hire more crews (Airfield › Projects).`,null,null,'warn',7);return false}return true}
function startBuild(id,label,mins){const m=buildMins(mins);G.builds.push({id,label,start:G.clock,done:G.clock+m});toast(`Construction of ${label} has started. Ready in about ${Math.round(m/60*10)/10} hours.`,null,null,'',7)}
function updateBuilds(){
  let ch=false;
  for(const b of G.builds){if(G.clock>=b.done){b.fin=true;ch=true;finishBuild(b)}}
  if(ch){G.builds=G.builds.filter(b=>!b.fin);if(!R.sim)renderPanel()}
}
function freeAircraft(){return G.fleet.findIndex((f,j)=>!f.sold&&!G.stands.some(s=>s.built&&s.ac===j))}
function finishBuild(b){
  const [kind,arg]=b.id.split(':');
  if(kind==='stand'){const i=+arg;G.stands[i].built=true;if(!R.sim){renderBoard();renderCam()}}
  else if(kind==='pier')G.pierB=true;
  else if(kind==='up')G.lv[arg]=Math.min(UPG[arg].max,G.lv[arg]+1);
  else if(kind==='line')finishLine(b);
  else if(kind==='dev')finishDev(b);
  toast(`${b.label} is finished.`,null,null,'goal',7);fanfare();
}
function levelChecks(n){
  const q=LEVELS[n].req,out=[['Passengers flown',G.flown,q.pax,true],['Rating',Math.round(G.rep),q.rep],['Gates open',builtCount(),q.gates]];
  if(q.daily)out.splice(1,0,['Passengers in the last 24 hours',dailyPax(),q.daily,true]);
  return out;
}
const LVL_PTS=n=>[0,6,5,5,6,5,5,5,5,5][n]||0;
function unlocksAt(n){
  const out=[`${LVL_PTS(n)} plan points`];
  STAND.forEach((s,i)=>{if(i>0&&s.lvl===n)out.push('Gate '+GATES[i])});
  if(PIER.lvl===n)out.push('Pier B');
  if(n===1)out.push('the region map');
  const nodes=TECH.filter(T=>T.t===n);if(nodes.length)out.push(`${nodes.length} new plan${nodes.length>1?'s':''} (${nodes.map(T=>T.n).slice(0,3).join(', ')}${nodes.length>3?'…':''})`);
  if(n>0&&CAPFRAC[n]>CAPFRAC[n-1])out.push('more upgrade levels');
  return out;
}
function checkLevel(){
  const n=G.level+1;if(!LEVELS[n])return;
  if(levelChecks(n).every(([_,v,t])=>v>=t)){
    G.level=n;earn(LEVELS[n].reward,'bonus');G.pts=(G.pts||0)+LVL_PTS(n);
    {const nt=new Set(G.newTabs||[]);nt.add('office');if(STAND.some(x=>x.lvl===n)||PIER.lvl===n)nt.add('stands');if(n===1)nt.add('region');G.newTabs=[...nt]}
    if(!R.sim){toast(`Now ${aL(n,1)}! +${money(LEVELS[n].reward)} and <b>${LVL_PTS(n)} plan points</b> to spend.`,[{label:'Open the Masterplan',fn:()=>openPlan()},{label:'Later',fn:()=>{}}],null,'goal',14);fanfare();
      renderTabs();renderPanel();$('#lvlName').textContent=LEVELS[n].name;renderPlanBtn()}
  }
}
function dayTick(){
  const d=dayOf(G.clock);if(d===G.day)return;
  const s=G.dstat;
  if(s&&s.flights>0){
    const profit=s.rev-s.cost;G.lastDay={day:G.day,...s,profit};
    (G.days||(G.days=[])).push({d:G.day,pax:s.pax,arr:s.arr,fl:s.flights,ot:s.ontime,p:Math.round(profit),rep:Math.round(G.rep),rt:Object.keys(G.routes||{}).length,rd:R.reg?Math.round(R.reg.riders||0):0,lv:G.level});if(G.days.length>40)G.days.shift();
    toast(`Day ${G.day} report: ${num(s.pax)} passengers departed and ${num(s.arr)} arrived, ${s.ontime}/${s.flights} flights on time, profit ${money(profit)}.`,null,null,profit>=0?'goal':'warn',12);
  }
  if(s&&s.flights>=3)G.otp=G.otp==null?s.ontime/s.flights:G.otp*0.6+0.4*s.ontime/s.flights;
  recordsDay(s);
  G.day=d;G.dstat={pax:0,arr:0,flights:0,ontime:0,rev:0,cost:0,rep0:G.rep};regionDay();rivalDay();chalDay();
  const sea=seasonOf(d),prev=seasonOf(d-1);
  if(sea!==prev)toast(sea.name==='Winter'?'Winter: ski and winter-sun routes are busiest. Expect snow; de-icing pads keep turnarounds moving.':sea.name==='Summer'?'Summer holidays: beach cities and families fill flights. Ski routes go quiet.':`${sea.name} is here.`,null,null,'',9);
}

/* ================= events & toasts ================= */
function toast(text,choices,id,kind,ttl){
  if(R.sim){if(choices)choices[choices.length-1].fn();return}
  {const m=SET().msgs,reply=performance.now()-(R.lastInput||-1e9)<900;if(!reply&&(m==='off'||(m==='key'&&!choices&&kind!=='warn')))return}
  id=id||('t'+(++R.toastId));
  if(R.toasts.some(t=>t.id===id))return;
  const tl=ttl??(choices?30:8);R.toasts.push({id,text,choices:choices||null,kind:kind||'',ttl:tl,max:tl});
  if(R.toasts.length>3){const k=R.toasts.findIndex(t=>!t.choices);R.toasts.splice(k>=0?k:0,1)}
  renderToasts();
  if(choices)alertTone();
}
function dropToast(id){const n=R.toasts.length;R.toasts=R.toasts.filter(t=>t.id!==id);if(R.toasts.length!==n)renderToasts()}
function renderToasts(){
  const ic={goal:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',warn:'<path d="M12 4l9 16H3zM12 10v4M12 17h.01"/>','':'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>'};
  $('#toasts').innerHTML=R.toasts.map(t=>`<div class="toast ${t.kind}" data-id="${t.id}"><svg viewBox="0 0 24 24" aria-hidden="true">${ic[t.kind]||ic['']}</svg><div class="tx">${t.text}</div>${t.choices?'':`<button class="x" data-close="${t.id}" aria-label="Dismiss">×</button>`}${t.choices?`<div class="acts">${t.choices.map((c,k)=>`<button data-tid="${t.id}" data-k="${k}">${c.label}</button>`).join('')}</div>${t.choices.length>1&&t.kind==='warn'?`<div class="auto">If you don’t choose: ${t.choices[t.choices.length-1].label.toLowerCase()}</div>`:''}`:''}<i class="life" style="width:${t.ttl/t.max*100}%"></i></div>`).join('');
}
$('#toasts').addEventListener('click',e=>{
  const c=e.target.closest('[data-close]');if(c){dropToast(c.dataset.close);return}
  const b=e.target.closest('[data-tid]');if(!b)return;
  const t=R.toasts.find(x=>x.id===b.dataset.tid);if(!t)return;
  const ok=t.choices[+b.dataset.k].fn();
  if(ok!==false)dropToast(t.id);
});
function tickToasts(realDt){
  let ch=false;
  for(const t of R.toasts){t.ttl-=realDt;if(t.ttl<=0){if(t.choices)t.choices[t.choices.length-1].fn();t.gone=true;ch=true}}
  if(ch){R.toasts=R.toasts.filter(t=>!t.gone);renderToasts()}
  else for(const t of R.toasts){const el=document.querySelector(`.toast[data-id="${t.id}"] .life`);if(el)el.style.width=clamp(t.ttl/t.max,0,1)*100+'%'}
}
function techFault(i,F){
  const cost=Math.round(F.ac.op*2),fl=G.fleet[F.fleetIdx],w=fl?fl.wear||0:0,mins=Math.round(20*(1-0.15*G.lv.fire));F.fault=mins;
  if(pol('repair')==='rush'&&G.cash>=cost){spend(cost,'costs');F.fault=Math.min(F.fault,4);floater(`FAULT · RUSH REPAIR ${money(cost)}`,STAND_X[i],CABIN_TOP-24,'#FF9F43',true)}
  else floater(`FAULT · ${mins} MIN REPAIR`,STAND_X[i],CABIN_TOP-24,'#FF7A8A',true);
}
function wageBill(){const D=derived();return (D.desks*WAGE.desks+D.lanes*WAGE.lanes+D.officers*WAGE.officers)*(G.wageMul||1)*payMul()*(R.reg?R.reg.wageMul:1)}
function fireEvent(){
  if(G.lines&&Object.keys(G.lines).length&&Math.random()<0.3&&regionEvent())return;
  const winter=seasonOf(dayOf(G.clock)).name==='Winter',p=pol('pay');
  const opts=['rush','rush'];if(G.lv.lanes>0){opts.push('sick');if(p===0)opts.push('sick','sick');if(p===1)opts.push('sick')}if(G.flights>=8){if(p===0)opts.push('strike','strike');if(p===1&&Math.random()<0.4)opts.push('strike')}
  const e=opts[Math.floor(Math.random()*opts.length)];
  if(e==='fog')R.fx.fog=G.clock+45;
  else if(e==='snow')R.fx.snow=G.clock+90;
  else if(e==='rush')R.fx.rush=G.clock+90;
  else if(e==='strike'){R.fx.strike=G.clock+45;floater('STAFF WALKOUT',150,600,'#FF7A8A',true)}
  else if(e==='sick'){const cost=Math.round(30+G.lv.lanes*30);if(pol('agency')&&G.cash>=cost){spend(cost,'costs');floater(`AGENCY COVER ${money(cost)}`,380,515,'#FFC72C',true)}else{R.fx.sick=G.clock+40;floater('LANE CLOSED · STAFF SICK',380,515,'#FF7A8A',true)}}
}

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

/* ================= drawing ================= */
function rrect(x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h)}
function sign(x,y,text,bg,fg){ctx.font='700 9px "Saira Condensed","Arial Narrow",sans-serif';const w=ctx.measureText(text).width+8;ctx.fillStyle=bg||'#FFC72C';ctx.fillRect(x,y,w,12);ctx.fillStyle=fg||'#17181A';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText(text,x+4,y+6.5);return w}
function mono(t,x,y,col,size,align){ctx.font=`500 ${size||9}px "IBM Plex Mono",monospace`;ctx.fillStyle=col||'#909AA4';ctx.textAlign=align||'left';ctx.textBaseline='alphabetic';ctx.fillText(t,x,y)}
function hatch(x,y,w,h,prog,label){
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  ctx.fillStyle='rgba(255,199,44,.06)';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='rgba(255,199,44,.22)';ctx.lineWidth=6;for(let k=-h;k<w;k+=22){ctx.beginPath();ctx.moveTo(x+k,y+h);ctx.lineTo(x+k+h,y);ctx.stroke()}
  ctx.restore();ctx.strokeStyle='rgba(255,199,44,.6)';ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.strokeRect(x,y,w,h);ctx.setLineDash([]);
  const cx=x+w/2,cy=y+h/2;ctx.fillStyle='rgba(10,12,15,.88)';rrect(cx-80,cy-22,160,40,4);ctx.fill();
  ctx.font='800 12px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle='#FFC72C';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText(label,cx,cy-6);
  ctx.fillStyle='#232930';ctx.fillRect(cx-66,cy+3,132,5);ctx.fillStyle='#FFC72C';ctx.fillRect(cx-66,cy+3,132*prog,5);
}
function bprog(id){const b=buildOf(id);return b?clamp((G.clock-b.start)/(b.done-b.start),0,1):0}
function drawPlane(F,sx,offY,tow,alpha){
  const g=F.geo,ac=F.ac,fw=g.fw,top=CABIN_TOP,end=g.end;
  ctx.save();ctx.globalAlpha=alpha??1;ctx.translate(sx,offY);
  ctx.fillStyle='#A9B3BC';
  for(const s of [-1,1]){
    const sw=g.span*0.55;
    ctx.beginPath();ctx.moveTo(s*fw,g.wingY);ctx.lineTo(s*(fw+g.span),g.wingY+sw);ctx.lineTo(s*(fw+g.span),g.wingY+sw+11);ctx.lineTo(s*fw,g.wingY+g.chord);ctx.closePath();ctx.fill();
    ctx.fillStyle='#7F8A94';rrect(s*(fw+g.span*0.45)-5,g.wingY+sw*0.45-10,10,24,4);ctx.fill();ctx.fillStyle='#A9B3BC';
    ctx.beginPath();ctx.moveTo(s*6,end+10);ctx.lineTo(s*(fw*0.8+14),end+32);ctx.lineTo(s*(fw*0.8+14),end+40);ctx.lineTo(s*6,end+34);ctx.closePath();ctx.fill();
  }
  ctx.fillStyle='#CDD4DA';ctx.beginPath();ctx.moveTo(-fw,top+10);
  ctx.bezierCurveTo(-fw,top-30,-fw*0.55,top-62,0,top-64);ctx.bezierCurveTo(fw*0.55,top-62,fw,top-30,fw,top+10);
  ctx.lineTo(fw,end);ctx.bezierCurveTo(fw,end+22,10,end+46,0,end+48);ctx.bezierCurveTo(-10,end+46,-fw,end+22,-fw,end);ctx.closePath();ctx.fill();
  ctx.fillStyle='#22303C';ctx.beginPath();ctx.moveTo(-fw*0.55,top-30);ctx.quadraticCurveTo(0,top-50,fw*0.55,top-30);ctx.lineTo(fw*0.5,top-25);ctx.quadraticCurveTo(0,top-41,-fw*0.5,top-25);ctx.closePath();ctx.fill();
  const liv=F.liv||livery();
  ctx.strokeStyle=liv;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,end+8);ctx.lineTo(0,end+46);ctx.stroke();
  ctx.fillStyle=liv;ctx.fillRect(-fw,top+2,3,end-top-6);ctx.fillRect(fw-3,top+2,3,end-top-6);
  ctx.fillStyle='#252B32';rrect(-fw+4,top,fw*2-8,end-top-2,4);ctx.fill();
  ctx.fillStyle='#2F363E';for(const ax of g.aisleX)ctx.fillRect(ax-AISLE/2+2,g.rowsStart-4,AISLE-4,ac.rows*g.pitch+8);
  const gx=g.aisleX[0]+AISLE/2;ctx.fillStyle='#39414A';ctx.fillRect(gx,top+3,fw-4-gx,9);ctx.fillRect(gx,end-12,fw-4-gx,8);
  const sh=Math.max(3.5,g.pitch-2.4),sw=SEATW-3;
  for(let r=0;r<ac.rows;r++){
    const y=rowY(F,r)-sh/2,biz=r<F.bRows;
    if(F.freighter){const lo=F.checkedTotal?F.hold/F.checkedTotal:0,un=F.arr.bags?1-F.arr.unloaded/F.arr.bags:0,full=Math.max(lo,un)*ac.rows;ctx.fillStyle=r<full?'#B07A45':'#2F363E';rrect(g.seatXs[0]-sw/2,y,g.seatXs[g.cols-1]-g.seatXs[0]+sw,sh,1.5);ctx.fill();if(r<full){ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(0-0.5,y,1,sh)}continue}
    for(let c=0;c<g.cols;c++){const o=F.occ[r*g.cols+c];ctx.fillStyle=o>=0?GROUPC[o]:(F.occIn&&F.occIn[r*g.cols+c]>=0)?'#4F6478':(biz?'#4A4131':'#39414A');rrect(g.seatXs[c]-sw/2,y,sw,sh,Math.min(2,sh/3));ctx.fill()}
  }
  if(F.bRows){const y=g.rowsStart+F.bRows*g.pitch;ctx.strokeStyle='#8A7A55';ctx.lineWidth=1;ctx.setLineDash([2,2]);ctx.beginPath();ctx.moveTo(-fw+6,y);ctx.lineTo(fw-6,y);ctx.stroke();ctx.setLineDash([])}
  ctx.fillStyle='#FFC72C';ctx.fillRect(g.fd.x-1,g.fd.y-5,3,10);if(F.rear)ctx.fillRect(g.rd.x-1,g.rd.y-5,3,10);
  ctx.fillStyle='#8C97A1';ctx.fillRect(fw-2,g.holdY-5,3,10);
  if(tow){ctx.strokeStyle='#5A646E';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,top-64);ctx.lineTo(0,top-74);ctx.stroke();ctx.fillStyle='#3A424B';rrect(-8,top-86,16,12,2);ctx.fill();ctx.fillStyle='#FFC72C';ctx.fillRect(-2,top-84,4,3)}
  ctx.restore();
}
function drawStandApron(i){
  const sx=STAND_X[i],st=G.stands[i],S=R.st[i];
  if(!st.built){
    if(isBuilding('stand:'+i)){hatch(sx-140,44,280,TERM_Y-60,bprog('stand:'+i),'BUILDING STAND '+GATES[i]);return}
    if(!standOpen(i))return;
    ctx.strokeStyle='#2B3238';ctx.lineWidth=1.5;ctx.setLineDash([6,6]);ctx.strokeRect(sx-140,44,280,TERM_Y-60);ctx.setLineDash([]);
    ctx.font='800 22px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle='#2E363E';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText('STAND '+GATES[i],sx,236);
    mono(STAND[i].lvl>G.level?`Needs ${LEVELS[STAND[i].lvl].name}`:'For sale · '+money(STAND[i].cost),sx,256,'#56606A',11,'center');
    return;
  }
  ctx.strokeStyle='rgba(255,199,44,.4)';ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(sx,32);ctx.lineTo(sx,TERM_Y-8);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='rgba(255,199,44,.5)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sx-26,44);ctx.lineTo(sx+26,44);ctx.stroke();
  ctx.font='800 26px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle='rgba(255,199,44,.16)';ctx.textAlign='right';ctx.textBaseline='alphabetic';ctx.fillText(GATES[i],sx+140,TERM_Y-12);
  if(S.out)drawPlane(S.out.F,sx,S.out.offY,false,S.out.alpha);
  const F=S.F;if(F&&F.plane.state!=='wait'&&F.plane.state!=='approach')drawPlane(F,sx,F.plane.offY,F.plane.state==='inbound',F.plane.alpha??1);
}
function drawBridge(i){
  const S=R.st[i];if(!G.stands[i].built)return;
  const sx=STAND_X[i],g=S.geo||geom(AIRCRAFT[0]),e=S.ext;
  const cornerY=g.fd.y+20,dx=sx+g.fd.x-3,tx=sx-120+(dx-(sx-120))*e,ty=cornerY+(g.fd.y-cornerY)*e;
  ctx.lineJoin='round';ctx.lineCap='butt';
  for(const [w,c] of [[14,'#46505A'],[10,'#2A3037']]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(sx-120,TERM_Y);ctx.lineTo(sx-120,cornerY);if(e>0.02)ctx.lineTo(tx,ty);ctx.stroke()}
  ctx.fillStyle='#46505A';ctx.beginPath();ctx.arc(sx-120,cornerY,8.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2A3037';ctx.beginPath();ctx.arc(sx-120,cornerY,5.5,0,Math.PI*2);ctx.fill();
  const F=S.F;
  if(F&&F.rear){
    ctx.strokeStyle='#56616B';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();F.P.rear.pts.forEach((p,k)=>k?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.setLineDash([]);
    if(e>0.5){ctx.fillStyle='#7F8A94';ctx.fillRect(sx+g.rd.x-15,g.rd.y-5,13,10);ctx.strokeStyle='#4A545E';ctx.lineWidth=1;for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(sx+g.rd.x-15+k*3.3,g.rd.y-5);ctx.lineTo(sx+g.rd.x-15+k*3.3,g.rd.y+5);ctx.stroke()}}
  }
  if(F&&e>0.6&&(F.hold<F.bagsIn||F.arr.unloaded<F.arr.bags)){
    const ph=(performance.now()/1000*0.45+i*0.3)%2,s=(ph<1?ph:2-ph)*F.P.cart.len,q=ptAt(F.P.cart,s);
    ctx.fillStyle='#3A424B';ctx.fillRect(q[0]-5,q[1]-4,10,8);ctx.fillStyle='#D9A066';ctx.fillRect(q[0]-4,q[1]+6,8,7);ctx.fillRect(q[0]-4,q[1]+15,8,7);ctx.fillStyle='#FFC72C';ctx.fillRect(q[0]-1.5,q[1]-3,3,2);
  }
}
function drawTerminal(D){
  const concR=G.pierB?W-8:LAND_R;
  ctx.fillStyle='#1C2228';ctx.fillRect(8,TERM_Y,concR-8,SEC_Y-TERM_Y);
  ctx.fillStyle='#191D22';ctx.fillRect(8,SEC_Y,LAND_R-8,LAND_B-SEC_Y);
  if(!G.pierB){
    if(isBuilding('pier:B'))hatch(LAND_R+4,TERM_Y,W-12-LAND_R,SEC_Y-TERM_Y,bprog('pier:B'),'BUILDING PIER B');
    else{ctx.strokeStyle='#2B3238';ctx.lineWidth=1.5;ctx.setLineDash([6,6]);ctx.strokeRect(LAND_R+4,TERM_Y,W-12-LAND_R,SEC_Y-TERM_Y);ctx.setLineDash([]);mono(G.level>=PIER.lvl?`PIER B · ${money(PIER.cost)}`:`PIER B · needs ${LEVELS[PIER.lvl].name}`,(LAND_R+W)/2,488,'#4A535D',11,'center')}
  }
  const ciW=R.ciQ.length*D.checkin/(D.desks+D.kiosks*0.6),seW=R.secQ.length*D.sec/D.lanes,tint=w=>w>15?'rgba(255,122,138,.11)':w>8?'rgba(255,199,44,.07)':null;
  let tc=tint(ciW);if(tc){ctx.fillStyle=tc;ctx.fillRect(8,SEC_Y+22,284,LAND_B-SEC_Y-22)}
  tc=tint(seW);if(tc){ctx.fillStyle=tc;ctx.fillRect(292,SEC_Y+22,182,LAND_B-SEC_Y-22)}
  tc=tint(R.arrQ.length*D.passT/(D.officers+D.egates*1.6));if(tc){ctx.fillStyle=tc;ctx.fillRect(476,SEC_Y+2,266,LAND_B-SEC_Y-2)}
  ctx.fillStyle='#101316';ctx.fillRect(0,LAND_B+2,W,H-LAND_B-2);
  // hotel beside the arrivals hall
  if(G.lv.hotel){const x0=1262,w=210;ctx.fillStyle='#232A31';ctx.fillRect(x0,530,w,78);ctx.fillStyle='#2F363E';ctx.fillRect(x0,530,w,6);
    for(let r=0;r<4;r++)for(let c=0;c<12;c++){const lit=(r*12+c)%5<G.lv.hotel;ctx.fillStyle=lit?'rgba(255,214,150,.75)':'#1A1F24';ctx.fillRect(x0+10+c*16,544+r*15,8,7)}
    sign(x0,516,'AIRPORT HOTEL')}
  for(const i of SIDX){
    if(!standOpen(i))continue;
    const built=G.stands[i].built;
    ctx.fillStyle=built?'#252C33':'#1F242A';
    for(let j=0;j<80;j++){const s=spotPos(i,j);ctx.fillRect(s.x-3,s.y-3,6,6)}
    const s=G.shops[i],x=shopX(i);
    if(s){
      const t=SHOPS[s.type];ctx.fillStyle='#242A31';ctx.fillRect(x,452,118,40);ctx.fillStyle=t.col;ctx.fillRect(x,490,118,3);
      ctx.font='700 11px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle=t.col;ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillText(t.name.toUpperCase(),x+7,468);
      mono(`Lv ${s.lvl+1} · ${money(s.earned||0)}`,x+7,482,'#909AA4',8.5);
    } else {ctx.strokeStyle='#343C45';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.strokeRect(x+.5,452.5,117,39);ctx.setLineDash([]);mono('UNIT TO LET',x+59,476,'#4A535D',8.5,'center')}
  }
  if(G.lv.mover&&G.pierB){ctx.fillStyle='#2A3037';ctx.fillRect(360,515,W-380,3);const t=(performance.now()/1000*0.12)%2,px=360+(t<1?t:2-t)*(W-460);ctx.fillStyle='#5CC8FF';rrect(px,512,80,9,3);ctx.fill()}
  ctx.strokeStyle='#4E5964';ctx.lineWidth=3;ctx.lineCap='square';
  const gaps=[];for(const i of SIDX)if(G.stands[i].built){gaps.push([STAND_X[i]-127,STAND_X[i]-113]);const F=R.st[i].F;if(F&&F.rear)gaps.push([STAND_X[i]-77,STAND_X[i]-63])}
  gaps.sort((a,b)=>a[0]-b[0]);
  ctx.beginPath();let x=8;for(const [a,b] of gaps){ctx.moveTo(x,TERM_Y);ctx.lineTo(a,TERM_Y);x=b}ctx.moveTo(x,TERM_Y);ctx.lineTo(concR,TERM_Y);
  ctx.moveTo(8,TERM_Y);ctx.lineTo(8,LAND_B);ctx.lineTo(140,LAND_B);ctx.moveTo(172,LAND_B);ctx.lineTo(LAND_R,LAND_B);ctx.lineTo(LAND_R,596);ctx.moveTo(LAND_R,560);ctx.lineTo(LAND_R,SEC_Y);
  if(G.pierB){ctx.moveTo(LAND_R,SEC_Y);ctx.lineTo(W-8,SEC_Y);ctx.lineTo(W-8,TERM_Y)}else{ctx.moveTo(LAND_R,SEC_Y);ctx.lineTo(LAND_R,TERM_Y)}
  const sg=[];for(let i=0;i<8;i++)if(i<D.lanes)sg.push([laneX(i)-5,laneX(i)+5]);if(D.ft)sg.push([FT_X-5,FT_X+5]);
  sg.push([480,494]);sg.sort((a,b)=>a[0]-b[0]);x=8;for(const [a,b] of sg){ctx.moveTo(x,SEC_Y);ctx.lineTo(a,SEC_Y);x=b}ctx.moveTo(x,SEC_Y);ctx.lineTo(LAND_R,SEC_Y);
  ctx.moveTo(474,SEC_Y);ctx.lineTo(474,LAND_B);ctx.stroke();
  ctx.lineWidth=1;ctx.strokeStyle='#39414A';ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(292,SEC_Y+26);ctx.lineTo(292,LAND_B-4);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#2A3037';ctx.fillRect(16,524,462,4);
  ctx.fillStyle='#D9A066';for(const b of R.belt)ctx.fillRect(b.x-2,523.5,4,4);
  for(let i=0;i<8;i++){const open=i<D.desks,own=i<OWN.desks(),x0=deskX(i)-8;ctx.fillStyle=open?'#6A7580':own?'#3A424B':'#262C32';ctx.fillRect(x0,533,16,4);if(open){ctx.fillStyle='#FFC72C';ctx.fillRect(x0+5.5,527.5,5,5)}}
  for(let i=0;i<4;i++){const open=i<D.kiosks,x0=kioskX(i)-4;ctx.fillStyle=open?'#5CC8FF':'#262C32';ctx.fillRect(x0,530,8,6)}
  for(let i=0;i<8;i++){const lx=laneX(i),open=i<D.lanes,own=i<OWN.lanes(),closed=i===D.lanes&&R.fx.sick>G.clock;
    ctx.fillStyle=open?'#8C97A1':closed?'#7A3A42':own?'#3A424B':'#262C32';ctx.fillRect(lx-6,SEC_Y-3,3,9);ctx.fillRect(lx+3,SEC_Y-3,3,9);
    ctx.fillStyle=open?'#39414A':'#1F242A';ctx.fillRect(lx+6,527,6,14);if(open){ctx.fillStyle='#FFC72C';ctx.fillRect(lx+7,543,4,4)}}
  if(D.ft){ctx.fillStyle='#F5D08A';ctx.fillRect(FT_X-6,SEC_Y-3,3,9);ctx.fillRect(FT_X+3,SEC_Y-3,3,9);ctx.fillStyle='#FFC72C';ctx.fillRect(FT_X+7,543,4,4)}
  ctx.fillStyle='#FFC72C';for(const i of SIDX)if(G.stands[i].built){ctx.fillRect(STAND_X[i]-112,450,5,5);const F=R.st[i].F;if(F&&F.rear)ctx.fillRect(STAND_X[i]-62,450,5,5)}
  mono('PASSPORT CONTROL',492,531,'#56606A',8.5);
  for(let i=0;i<8;i++){const b=boothPos(i),open=i<D.officers;ctx.fillStyle=open?'#6A7580':i<OWN.officers()?'#3A424B':'#262C32';ctx.fillRect(b.x-2,b.y-4,6,9);if(open){ctx.fillStyle='#FFC72C';ctx.fillRect(b.x+6,b.y-2,5,5)}}
  for(let i=0;i<8;i++){const e=egatePos(i),open=i<D.egates;ctx.fillStyle=open?'#5CC8FF':'#262C32';ctx.fillRect(e.x-2,e.y-3,4,7);ctx.fillRect(e.x+4,e.y-3,4,7)}
  ctx.strokeStyle='#39414A';ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(744,SEC_Y+6);ctx.lineTo(744,LAND_B-6);ctx.stroke();ctx.setLineDash([]);
  mono('BAGGAGE RECLAIM',758,540,'#56606A',8.5);
  for(const i of SIDX){if(!G.stands[i].built)continue;
    const cx=carX(i),cy=carY(i),F=R.st[i].F,A=F&&F.arr;
    ctx.strokeStyle='#39414A';ctx.lineWidth=6;rrect(cx-40,cy-10,80,20,10);ctx.stroke();
    const bags=Math.min(20,Math.max(A?A.reclaim:0,R.pax.reduce((m,q)=>q.inbound&&q.stand===i&&q.A?Math.max(m,q.A.reclaim):m,0)));
    ctx.fillStyle='#D9A066';for(let k=0;k<bags;k++){const a=(k/20+performance.now()/9000)%1,t=a*2*Math.PI;ctx.fillRect(cx+Math.cos(t)*40-2,cy+Math.sin(t)*10-2,4,4)}
    mono(GATES[i],cx,cy+3,'#909AA4',9,'center');
  }
}
function paxColor(p){
  if(p.state==='walkIn'||p.state==='queue'||p.state==='desk'||p.state==='secQ'||p.state==='ftQ'||p.state==='sec'||p.state==='new')return p.fast||p.biz?'#F5D08A':LAND_C;
  return GROUPC[groupOf(p)];
}
const BUGGY_ST=new Set(['walkIn','toShop','toGate','gate','toArr','exitW','toReclaim','queue','secQ','ftQ']);
function drawPax(vx0,vx1){
  for(const p of R.pax){
    if(p.x<vx0-10||p.x>vx1+10)continue;
    const inCabin=p.state==='aisle'||p.state==='sitting'||p.state==='dAisle',r=inCabin?clamp(p.F.geo.pitch*0.42,2.7,3.8):3;
    if(p.inbound){
      ctx.fillStyle='#14171B';ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=p.xfer?'#6BE39A':p.stand===R.sel?'#ECE8DF':'#9FC2E0';ctx.lineWidth=1.5;ctx.stroke();
      if(p.state==='dAisle'&&p.phase==='grab'){ctx.fillStyle='#D9A066';ctx.fillRect(p.x+r,p.y-r-2,4,4)}
      if(p.state==='exitW'&&p.checked){ctx.fillStyle='#D9A066';ctx.fillRect(p.x+r-1,p.y-1,4,4)}
      continue;
    }
    const rr=p.kid?r*0.68:r;
    if(!inCabin&&p.type==='prm'&&BUGGY_ST.has(p.state)){if(G.lv.assist){ctx.fillStyle='#CDD4DA';rrect(p.x-5.5,p.y-2.2,11,6,1.6);ctx.fill();ctx.fillStyle='#14171B';ctx.fillRect(p.x-4,p.y+3.2,2,1.2);ctx.fillRect(p.x+2,p.y+3.2,2,1.2)}else{ctx.strokeStyle='#909AA4';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(p.x+r+0.5,p.y+r);ctx.lineTo(p.x+r+0.5,p.y-r*0.4);ctx.lineTo(p.x+r+3,p.y-r*0.4);ctx.lineTo(p.x+r+3,p.y+r);ctx.stroke()}}
    ctx.fillStyle=paxColor(p);ctx.beginPath();ctx.arc(p.x,p.y,rr,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=p.xferred&&!inCabin?'#6BE39A':p.stand===R.sel&&!inCabin?'#ECE8DF':p.type==='grp'&&!inCabin?'#FF7AB6':'#14171B';ctx.lineWidth=(p.xferred||p.stand===R.sel||p.type==='grp')&&!inCabin?1.1:1;ctx.stroke();
    if(p.type==='work'&&!inCabin&&!p.kid){ctx.fillStyle='#0E1114';ctx.fillRect(p.x+r-0.4,p.y+0.2,2.8,2.3)}
    if(p.state==='aisle'){
      if(p.phase==='stow'){ctx.fillStyle='#D9A066';ctx.fillRect(p.x+r,p.y-r-2,4,4)}
      else if(p.phase==='shuffle'){ctx.strokeStyle='#FF7A8A';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(p.x,p.y,r+2.2,0,Math.PI*2);ctx.stroke()}
    }
  }
}
function statusCol(s){if(s==='DEPLANING'||s==='LANDED'||s==='AT GATE')return '#5CC8FF';if(s==='ARRIVED')return '#6BE39A';if(s==='EXPECTED'||s==='COMPLETE')return '#909AA4';return s==='CARGO'||s==='LOADING'?'#D9A066':s==='BOARDING'||s==='GO TO GATE'?'#6BE39A':s==='FINAL CALL'||s==='BAGGAGE'?'#FFC72C':s==='DELAYED'||s==='TECH DELAY'||s==='CREW DELAY'?'#FF7A8A':s==='CLOSED'?'#5CC8FF':'#909AA4'}
function gateBadge(i){
  const sx=STAND_X[i],F=R.st[i].F,x=sx-146,y=34,w=96,h=F?60:30,sel=i===R.sel;
  ctx.fillStyle='rgba(10,12,15,.84)';rrect(x,y,w,h,4);ctx.fill();
  if(sel){ctx.strokeStyle='#FFC72C';ctx.lineWidth=1.2;rrect(x+.5,y+.5,w-1,h-1,4);ctx.stroke()}
  ctx.fillStyle=sel?'#FFC72C':'#3A424B';ctx.fillRect(x+6,y+6,20,13);
  ctx.font='800 10px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle=sel?'#17181A':'#ECE8DF';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(GATES[i],x+16,y+13);
  const dep=F&&F.plane.state==='deplaning',st=F?(dep?'DEPLANING':statusText(F)):gateStatus(i),col=F?statusCol(st):'#909AA4';
  ctx.font='700 9.5px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle=col;ctx.textAlign='left';ctx.fillText(st,x+31,y+13.5);
  if(!F)return;
  mono(dep?`${F.arr.code}${F.arr.no} ← ${F.arr.from[0]}`:`${F.code}${F.no} → ${F.dest[0]}`,x+6,y+32,'#ECE8DF',9.5);
  ctx.fillStyle='#232930';ctx.fillRect(x+6,y+38,w-12,4);ctx.fillStyle=col;ctx.fillRect(x+6,y+38,(w-12)*(dep?(F.arr.n-F.arr.onboard)/F.arr.n:F.seated/F.booked),4);
  const pl=F.plane;let left;
  if(dep)left=`${F.arr.n-F.arr.onboard}/${F.arr.n} off`;else if(pl.state==='turnaround')left=`cleaning ${Math.ceil(pl.t)}m`;else if(pl.state==='wait'||pl.state==='approach')left=F.landed?'taxiing in':'on approach';else if(pl.state==='inbound')left='towing in';else if(F.fault>0)left=`repair ${Math.ceil(F.fault)}m`;else if(F.seated>=F.booked&&F.hold<F.checkedTotal)left=`hold ${Math.floor(F.hold)}/${F.checkedTotal}`;else left=`${F.seated}/${F.booked}`;
  const m=Math.ceil(F.std-G.clock);let rt=m>=0?`dep ${m}m`:`+${-m}m`;
  ctx.font='500 8.5px "IBM Plex Mono",monospace';
  if(ctx.measureText(left).width+ctx.measureText(rt).width+6>w-12){left=left.replace('on approach','approach').replace('taxiing in','taxi in').replace('towing in','tow in').replace('cleaning','clean');if(ctx.measureText(left).width+ctx.measureText(rt).width+6>w-12&&m>=0)rt=`${m}m`}
  mono(left,x+6,y+54,F.fault>0?'#FF7A8A':'#909AA4',8.5);
  mono(rt,x+w-6,y+54,m<0?'#FF7A8A':m<=10?'#FFC72C':'#909AA4',8.5,'right');
}
function miniPlane(x,y,ang,sc,alpha,col){
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(sc,sc);ctx.globalAlpha=alpha??1;ctx.fillStyle=col||'#CDD4DA';
  rrect(-14,-2.4,28,4.8,2.4);ctx.fill();
  for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(3,s*2);ctx.lineTo(-4,s*13);ctx.lineTo(-7.5,s*13);ctx.lineTo(-3.5,s*2);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-10,s*1.5);ctx.lineTo(-14,s*6);ctx.lineTo(-16,s*6);ctx.lineTo(-14,s*1);ctx.closePath();ctx.fill()}
  ctx.fillStyle=livery();ctx.fillRect(-14.5,-0.7,5,1.4);ctx.restore();
}
function drawAirfield(d){
  ctx.fillStyle='#12171A';ctx.fillRect(0,Y0,W,-Y0);
  const HX=W-60;
  ctx.fillStyle='#101316';ctx.fillRect(48,RWY_Y[0],24,-RWY_Y[0]);ctx.fillRect(HX-12,RWY_Y[0],24,-RWY_Y[0]);
  ctx.strokeStyle='rgba(255,199,44,.5)';ctx.lineWidth=1.2;ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(60,RWY_Y[0]);ctx.lineTo(60,0);ctx.moveTo(HX,RWY_Y[0]);ctx.lineTo(HX,0);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='#FFC72C';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(HX-12,-60);ctx.lineTo(HX+12,-60);ctx.moveTo(HX-12,-56);ctx.lineTo(HX+12,-56);ctx.stroke();
  for(let r=0;r<2;r++){
    const y=RWY_Y[r],h=r?28:32,open=r<1+G.lv.runway2;
    if(!open){
      if(r===1&&isBuilding('up:runway2')){hatch(20,y-h/2,W-40,h,bprog('up:runway2'),'BUILDING RUNWAY');continue}
      ctx.strokeStyle='#2B3238';ctx.lineWidth=1.5;ctx.setLineDash([6,6]);ctx.strokeRect(20,y-h/2,W-40,h);ctx.setLineDash([]);mono('SECOND RUNWAY · FOR SALE',W/2,y+4,'#4A535D',10,'center');continue}
    ctx.fillStyle='#0B0E11';ctx.fillRect(20,y-h/2,W-40,h);
    ctx.strokeStyle='rgba(236,232,223,.45)';ctx.lineWidth=1.5;ctx.setLineDash([16,14]);ctx.beginPath();ctx.moveTo(90,y);ctx.lineTo(W-90,y);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='rgba(236,232,223,.55)';for(let k=0;k<5;k++){const yy=y-h/2+4+k*(h-8)/4.5;ctx.fillRect(26,yy,18,2);ctx.fillRect(W-44,yy,18,2)}
    ctx.font='800 13px "Saira Condensed","Arial Narrow",sans-serif';ctx.fillStyle='rgba(236,232,223,.4)';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(G.lv.runway2?(r?'09R':'09L'):'09',62,y+1);ctx.fillText(G.lv.runway2?(r?'27L':'27R'):'27',W-62,y+1);
    if(d>0){ctx.fillStyle=`rgba(255,236,190,${0.35+d})`;for(let x=24;x<W-20;x+=40){ctx.fillRect(x,y-h/2-1,2,2);ctx.fillRect(x,y+h/2-1,2,2)}}
    if(R.fx.snow>G.clock){ctx.fillStyle='rgba(236,240,245,.12)';ctx.fillRect(20,y-h/2,W-40,h)}
  }
  // tower, fire station, fuel farm, solar farm
  ctx.fillStyle='#2A3037';ctx.fillRect(612,-44,16,30);ctx.fillStyle='#46505A';rrect(604,-58,32,16,4);ctx.fill();ctx.fillStyle='#5CC8FF';ctx.globalAlpha=0.5;ctx.fillRect(608,-54,24,6);ctx.globalAlpha=1;
  for(let k=0;k<Math.min(10,G.lv.atc);k++){ctx.fillStyle='#FFC72C';ctx.fillRect(606+k*3,-62,2,3)}
  if(G.lv.fire){ctx.fillStyle='#3A2A2E';ctx.fillRect(500,-46,70,34);ctx.fillStyle='#E5484D';for(let k=0;k<G.lv.fire;k++)ctx.fillRect(506+k*21,-26,16,12);mono('FIRE',535,-34,'#ECE8DF',8,'center')}
  for(let k=0;k<G.lv.fuelfarm;k++){ctx.fillStyle='#39414A';ctx.beginPath();ctx.arc(700+k*38,-30,15,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#56606A';ctx.lineWidth=1.5;ctx.stroke()}
  if(G.lv.solar){ctx.fillStyle='#22364A';for(let k=0;k<G.lv.solar*14;k++){ctx.fillRect(1320+(k%28)*28,-60+Math.floor(k/28)*22,24,16)}}
  for(let r=0;r<2;r++){const a=R.rwy.act[r];if(!a)continue;const y=RWY_Y[r],k=a.t/a.dur;let x,alt;
    if(a.type==='arr'){x=W+120-(1-Math.pow(1-k,2))*(W+120-90);alt=Math.max(0,1-k/0.3)*24}else{x=HX-10-k*k*(HX+150);alt=Math.max(0,(k-0.6)/0.4)*28}
    if(alt>0)miniPlane(x+alt*0.4,y+2,Math.PI,1.05,0.25);miniPlane(x,y-alt,Math.PI,1.05+alt/60)}
  const deps=R.rwy.q.filter(m=>m.type==='dep'),arrs=R.rwy.q.filter(m=>m.type==='arr');
  deps.slice(0,2).forEach((m,j)=>miniPlane(HX,-40+j*28,-Math.PI/2,0.95));
  if(deps.length>2)mono('+'+(deps.length-2),HX+18,-8,'#ECE8DF',9);
  const tt=performance.now()/1000;arrs.slice(0,4).forEach((m,j)=>{const a=tt*0.5+j*Math.PI/2;miniPlane(W-120+Math.cos(a)*60,-168+Math.sin(a)*6,a+Math.PI/2,0.8)});
  ctx.fillStyle='rgba(10,12,15,.8)';rrect(22,Y0+6,300,18,3);ctx.fill();
  mono(`RUNWAY · ${arrs.length} holding to land · ${deps.length} waiting to take off`,30,Y0+19,R.rwy.q.length>=3?'#FF7A8A':'#909AA4',9.5);
}
function drawLandside(D){
  ctx.fillStyle='#15191D';ctx.fillRect(0,H,W,Y1-H);
  ctx.fillStyle='#0F1215';ctx.fillRect(0,642,W,22);ctx.strokeStyle='rgba(236,232,223,.25)';ctx.lineWidth=1;ctx.setLineDash([10,10]);ctx.beginPath();ctx.moveTo(0,653);ctx.lineTo(W,653);ctx.stroke();ctx.setLineDash([]);
  if(G.lv.rail){
    ctx.fillStyle='#262C33';ctx.fillRect(16,696,300,16);ctx.fillStyle='#FFC72C';ctx.fillRect(16,711,300,1.5);
    ctx.strokeStyle='#4A545E';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,722);ctx.lineTo(318,722);ctx.moveTo(0,734);ctx.lineTo(318,734);ctx.stroke();
    ctx.fillStyle='#2F363E';for(let x=4;x<318;x+=9)ctx.fillRect(x,720,3,16);ctx.fillStyle='#7A3A42';ctx.fillRect(316,718,5,20);
    const T=R.train;if(T.x!=null){const nc=T.cars||3,cw=Math.min(88,300/nc);for(let c=0;c<nc;c++){ctx.fillStyle=T.col||'#3E6A8C';rrect(T.x+c*cw,720,cw-4,16,T.nose&&c===nc-1?8:3);ctx.fill();ctx.fillStyle='#A9D2F0';for(let w=0;w<Math.floor((cw-12)/12);w++)ctx.fillRect(T.x+c*cw+8+w*12,724,6,4)}}
    sign(16,676,'RAILWAY STATION');mono(!vehFreq('train')&&T.state==='away'?'no trains running · build a rail line on the Region tab':T.state==='away'?`next train ${Math.ceil(T.t)} min · ${R.platform.length} aboard`:'train in',110,686,'#909AA4',9);
  } else if(isBuilding('up:rail'))hatch(16,676,302,86,bprog('up:rail'),'BUILDING STATION');
  else {ctx.strokeStyle='#2B3238';ctx.lineWidth=1.5;ctx.setLineDash([6,6]);ctx.strokeRect(16,676,302,86);ctx.setLineDash([]);mono('RAILWAY STATION · FOR SALE',167,724,'#4A535D',10,'center')}
  const cap=carCap();let occ=0;
  for(let b=0;b<cap;b++){const q=BAY(b);ctx.strokeStyle='#262C32';ctx.lineWidth=1;ctx.strokeRect(q.x-4.5+.5,q.y-7+.5,9,14);
    if(R.lot[b]>G.clock){occ++;ctx.fillStyle=['#6E7883','#8C97A1','#5C6670','#A7A296','#4F6478'][b%5];rrect(q.x-3.5,q.y-6,7,12,2);ctx.fill()}}
  drawStopVehicles();
  sign(334,668,'CAR PARK');mono(`${occ}/${cap} spaces`,390,678,occ>=cap?'#FF7A8A':'#909AA4',9);
}
function darkness(){const h=(G.clock/60)%24;if(h<5||h>=21)return 0.5;if(h<7)return 0.5*(7-h)/2;if(h>=19)return 0.5*(h-19)/2;return 0}
function draw(){
  if(R.view==='region'){drawRegion();return}
  if(R.view==='world'){drawWorld();return}
  const D=derived(),k=R.baseK*R.cam.z,s=k*R.dpr,cam=R.cam;
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0F1215';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(s,0,0,s,-cam.x*s,-cam.y*s);
  const vx0=cam.x,vx1=cam.x+R.sw/k;
  ctx.fillStyle='#14171B';ctx.fillRect(0,Y0,W,Y1-Y0);
  const d=darkness();drawAirfield(d);
  ctx.strokeStyle='#1A1E23';ctx.lineWidth=1;ctx.beginPath();for(let x=0;x<=W;x+=50){ctx.moveTo(x+.5,32);ctx.lineTo(x+.5,TERM_Y)}for(let y=50;y<TERM_Y;y+=50){ctx.moveTo(0,y+.5);ctx.lineTo(W,y+.5)}ctx.stroke();
  ctx.fillStyle='#101316';ctx.fillRect(0,0,W,32);ctx.strokeStyle='rgba(255,199,44,.55)';ctx.lineWidth=1.5;ctx.setLineDash([12,10]);ctx.beginPath();ctx.moveTo(0,16);ctx.lineTo(W,16);ctx.stroke();ctx.setLineDash([]);
  for(const i of SIDX){if(STAND_X[i]+160<vx0||STAND_X[i]-160>vx1)continue;drawStandApron(i)}
  for(const i of SIDX)drawBridge(i);
  if(d>0){
    ctx.fillStyle=`rgba(4,8,22,${d})`;ctx.fillRect(0,0,W,TERM_Y);ctx.fillStyle=`rgba(4,8,22,${d*0.6})`;ctx.fillRect(0,H,W,Y1-H);
    ctx.globalCompositeOperation='lighter';
    for(const i of SIDX){if(!G.stands[i].built)continue;const gx=STAND_X[i]+130,gr=ctx.createRadialGradient(gx,60,0,gx,60,230);gr.addColorStop(0,`rgba(255,214,150,${0.2*d})`);gr.addColorStop(1,'rgba(255,214,150,0)');ctx.fillStyle=gr;ctx.fillRect(gx-230,0,460,TERM_Y)}
    ctx.globalCompositeOperation='source-over';
  }
  if(R.fx.snow>G.clock){ctx.fillStyle='rgba(230,236,244,.05)';ctx.fillRect(0,Y0,W,TERM_Y-Y0);ctx.fillStyle='rgba(240,244,250,.6)';const t=performance.now()/1000;for(let k=0;k<160;k++){const x=(k*157.3+t*20*(1+(k%3)))%W,y=Y0+((k*97.1+t*40*(1+(k%4)*0.3))%(TERM_Y-Y0));ctx.fillRect(x,y,1.6,1.6)}}
  drawTerminal(D);
  if(pol('ads')){ctx.fillStyle='#E5484D';for(let x=60;x<W-100;x+=560){ctx.fillRect(x,TERM_Y-3,220,10);ctx.font='800 9px "Saira Condensed",sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('FIZZCO · FIZZCO · FIZZCO',x+110,TERM_Y+2.5);ctx.fillStyle='#E5484D'}}
  drawLandside(D);
  drawPax(vx0,vx1);
  for(const i of SIDX){if(G.stands[i].built)gateBadge(i)}
  const ciWait=R.ciQ.length*D.checkin/(D.desks+D.kiosks*0.6),secWait=R.secQ.length*D.sec/D.lanes;
  sign(141,622,'ENTRANCE');
  let w=sign(16,622,'CHECK-IN');mono(`${R.ciQ.length} · ~${Math.round(ciWait)}m`,16+w+5,631,ciWait>12?'#FF7A8A':'#909AA4',9);
  w=sign(300,622,'SECURITY');mono(`${R.secQ.length+R.ftQ.length} · ~${Math.round(secWait)} min`,300+w+5,631,secWait>12?'#FF7A8A':'#909AA4',9);
  const arW=R.arrQ.length*D.passT/(D.officers+D.egates*1.6);w=sign(492,622,'ARRIVALS');mono(`${R.arrQ.length} at passports · ~${Math.round(arW)} min`,492+w+5,631,arW>12?'#FF7A8A':'#909AA4',9);
  sign(1180,622,'EXIT →');
  drawFog(0,Y0,W,TERM_Y-Y0+120,0.3);
  if(R.fx.rain>G.clock){const tt=performance.now()/1000,st=R.fx.storm>G.clock;ctx.fillStyle=`rgba(20,30,50,${st?0.22:0.1})`;ctx.fillRect(0,Y0,W,Y1-Y0);ctx.strokeStyle='rgba(170,195,225,.35)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<220;i++){const px=(i*97.3+tt*60)%W,py=Y0+((i*53.1+tt*260)%(Y1-Y0));ctx.moveTo(px,py);ctx.lineTo(px-4,py+12)}ctx.stroke();
    if(st&&Math.sin(tt*3.1)>0.992){ctx.fillStyle='rgba(255,250,230,.25)';ctx.fillRect(0,Y0,W,Y1-Y0)}if(st)sign(W/2-80,-12,'STORM · RUNWAY CLOSED','#FFC72C')}
  if(R.fx.strike>G.clock){const tt=performance.now()/300;for(let k=0;k<9;k++){const px=70+k*20,py=634+Math.sin(tt+k)*1.5;ctx.fillStyle='#ECE8DF';ctx.beginPath();ctx.arc(px,py,2.6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#E5484D';ctx.fillRect(px-5,py-14+Math.sin(tt*1.3+k),10,6);ctx.fillStyle='#8C97A1';ctx.fillRect(px-0.4,py-8,0.8,6)}sign(70,606,'ON STRIKE','#E5484D','#fff')}
  for(const f of R.floaters){
    if(f.x<vx0-60||f.x>vx1+60)continue;
    const life=f.big?2.2:1,a=1-f.t/life;
    ctx.globalAlpha=clamp(a*1.4,0,1);ctx.textAlign='center';ctx.textBaseline='alphabetic';
    ctx.font=f.big?'700 15px "Saira Condensed",sans-serif':'600 9px "IBM Plex Mono",monospace';
    const y=f.y-f.t*(f.big?10:14);
    if(f.big){const w=ctx.measureText(f.text).width+14;ctx.fillStyle='rgba(10,12,15,.85)';rrect(f.x-w/2,y-14,w,20,3);ctx.fill()}
    ctx.fillStyle=f.col;ctx.fillText(f.text,f.x,y);ctx.globalAlpha=1;
  }
}

/* ================= camera ================= */
function viewK(){return R.baseK*R.cam.z}
function camBounds(){return R.view==='region'?{x0:0,y0:0,x1:RW,y1:RH}:R.view==='world'?{x0:0,y0:0,x1:WW,y1:WH}:{x0:0,y0:Y0,x1:W,y1:Y1}}
function zMin(){const b=camBounds();return Math.min(1,Math.min(R.sw/(b.x1-b.x0),R.sh/(b.y1-b.y0))/R.baseK)}
function clampCam(){
  const c=R.cam,k=viewK(),vw=R.sw/k,vh=R.sh/k;
  c.z=clamp(c.z,zMin(),2.6);
  const b=camBounds(),bw=b.x1-b.x0,bh=b.y1-b.y0;c.x=vw>=bw?b.x0+(bw-vw)/2:clamp(c.x,b.x0,b.x1-vw);c.y=vh>=bh?b.y0+(bh-vh)/2:clamp(c.y,b.y0,b.y1-vh);
}
function zoomAt(px,py,f){const c=R.cam,k0=viewK(),wx=c.x+px/k0,wy=c.y+py/k0;c.z=clamp(c.z*f,zMin(),2.6);const k=viewK();c.x=wx-px/k;c.y=wy-py/k;c.tx=null;clampCam()}
function focus(i,z){
  if(R.view==='region'){regionFocus(i==='all'?'all':'air');return}
  if(R.view==='world'){worldFocus('all');return}
  const c=R.cam;if(z!=null)c.z=z;const k=viewK();
  if(i==='all'){c.z=zMin();c.tx=0;c.ty=Y0}else{c.tx=STAND_X[i]-R.sw/k/2+60;c.ty=H-R.sh/k}
  const k2=viewK(),vw=R.sw/k2,vh=R.sh/k2;c.tx=vw>=W?(W-vw)/2:clamp(c.tx,0,W-vw);c.ty=vh>=Y1-Y0?Y0+(Y1-Y0-vh)/2:clamp(c.ty,Y0,Y1-vh);
}
function camStep(dt){const c=R.cam;if(c.tx==null)return;const a=1-Math.pow(0.001,dt);c.x+=(c.tx-c.x)*a;c.y+=(c.ty-c.y)*a;clampCam();if(Math.abs(c.x-c.tx)<0.5&&Math.abs(c.y-c.ty)<0.5)c.tx=null}
const ptrs=new Map();let moved=0,pinchD=0;
cv.addEventListener('pointerdown',e=>{ensureAudio();cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.offsetX,y:e.offsetY});moved=0;R.cam.tx=null;cv.classList.add('drag');if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinchD=Math.hypot(a.x-b.x,a.y-b.y)}});
cv.addEventListener('pointermove',e=>{
  const p=ptrs.get(e.pointerId);if(!p)return;const dx=e.offsetX-p.x,dy=e.offsetY-p.y;p.x=e.offsetX;p.y=e.offsetY;
  if(ptrs.size===1){const k=viewK();R.cam.x-=dx/k;R.cam.y-=dy/k;moved+=Math.abs(dx)+Math.abs(dy);clampCam()}
  else if(ptrs.size===2){const [a,b]=[...ptrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinchD>0)zoomAt((a.x+b.x)/2,(a.y+b.y)/2,d/pinchD);pinchD=d;moved+=10}
});
function endPtr(e){if(!ptrs.has(e.pointerId))return;const single=ptrs.size===1;ptrs.delete(e.pointerId);if(!ptrs.size)cv.classList.remove('drag');if(single&&moved<8&&e.type==='pointerup')tapAt(e.offsetX,e.offsetY)}
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.offsetX,e.offsetY,Math.exp(-e.deltaY*0.0015))},{passive:false});
function tapAt(px,py){
  const now=performance.now();
  if(now-(R.lastTap||0)<320&&Math.hypot(px-R.ltx,py-R.lty)<30){R.lastTap=0;zoomAt(px,py,1.7);return}
  R.lastTap=now;R.ltx=px;R.lty=py;
  const k=viewK(),wx=R.cam.x+px/k,wy=R.cam.y+py/k;
  if(R.view==='region'){regionTap(wx,wy);return}
  if(R.view==='world'){worldTap(wx,wy);return}
  if(wy<0){setTab('ground');return}
  if(wy>764&&wx<340&&(airKind('tram')||R.tram.x!=null)){setTab('region');return}
  if(wy>LAND_B+2){R.sSub='landside';setTab('sales');return}
  if(wy<SEC_Y){
    const i=STAND_X.findIndex(sx=>Math.abs(wx-sx)<150);if(i<0)return;
    if(wy>TERM_Y&&wx>=shopX(i)&&wx<=shopX(i)+118&&standOpen(i)){goTo('sales','.shopcard');return}
    selectStand(i,true);if(i===0)R.tourTap=true;
  } else if(wx<LAND_R)setTab('terminal');else{R.sSub='landside';setTab('sales')}
}
function selectStand(i,openTab){R.sel=i;renderCam();$$('.brow').forEach(r=>r.classList.toggle('sel',+r.dataset.stand===i));if(openTab)setTab('stands');else if(G.tab==='stands')renderPanel();const el=document.getElementById('stand-'+i);if(el&&G.tab==='stands')el.scrollIntoView({block:'nearest',behavior:REDUCED?'auto':'smooth'})}
function renderCam(){
  if(R.view==='world'){$('#cam').innerHTML=`<button data-cam="all">World</button><button data-wcam="near">Near</button><button data-zoom="-1" aria-label="Zoom out">−</button><button data-zoom="1" aria-label="Zoom in">+</button>`;return}
  if(R.view==='region'){$('#cam').innerHTML=`<button data-cam="all">All</button><button data-rcam="air">Airport</button><button data-rcam="city">City</button><button data-rcam="east">East</button><button data-zoom="-1" aria-label="Zoom out">−</button><button data-zoom="1" aria-label="Zoom in">+</button>`;return}
  $('#cam').innerHTML=`<button data-cam="all">All</button>`+G.stands.map((s,i)=>s.built?`<button data-cam="${i}" class="${R.sel===i?'on':''}">${GATES[i]}</button>`:'').join('')+`<button data-zoom="-1" aria-label="Zoom out">−</button><button data-zoom="1" aria-label="Zoom in">+</button>`;
}
$('#cam').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.rcam){regionFocus(b.dataset.rcam);return}
  if(b.dataset.wcam){worldFocus(b.dataset.wcam);return}
  if(b.dataset.cam==='all')focus('all');else if(b.dataset.cam!=null){selectStand(+b.dataset.cam,false);focus(+b.dataset.cam)}
  else if(b.dataset.zoom)zoomAt(R.sw/2,R.sh/2,b.dataset.zoom==='1'?1.25:0.8)});

/* ================= board ================= */
const FL_CH='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';const FLAPS=new Set();
function mkFlaps(el,n){el.innerHTML='';el._cells=[];for(let i=0;i<n;i++){const s=document.createElement('span');s.className='fl';s.textContent=' ';el.appendChild(s);el._cells.push({el:s,target:' ',left:0})}el._val=null}
function setFlaps(el,text){text=String(text).toUpperCase().padEnd(el._cells.length).slice(0,el._cells.length);if(el._val===text)return;el._val=text;el._cells.forEach((c,i)=>{const ch=text[i];if(c.target!==ch){c.target=ch;c.left=REDUCED?0:3+(i%5);if(!c.left)c.el.textContent=ch===' '?' ':ch}});FLAPS.add(el)}
setInterval(()=>{for(const el of FLAPS){let busy=false;for(const c of el._cells){if(c.left>0){c.left--;c.el.textContent=c.left?FL_CH[Math.floor(Math.random()*FL_CH.length)]:(c.target===' '?' ':c.target);busy=true}}if(!busy)FLAPS.delete(el)}},55);
function statusText(F){
  const pl=F.plane;
  if(F.freighter){if(pl.state==='boarding')return F.fault>0?'TECH DELAY':F.crewWait&&!F.crew?'CREW DELAY':G.clock>F.std?'DELAYED':'LOADING';return pl.state==='closing'?'CLOSED':'CARGO'}
  if(pl.state==='wait'||pl.state==='approach'||pl.state==='inbound'||pl.state==='deplaning'||pl.state==='turnaround')return G.clock>=F.std-30?'GO TO GATE':'CHECK-IN';
  if(pl.state==='boarding'){if(F.fault>0)return 'TECH DELAY';if(F.crewWait&&!F.crew)return 'CREW DELAY';if(G.clock>F.std)return 'DELAYED';if(F.seated>=F.booked&&F.hold<F.checkedTotal)return 'BAGGAGE';if(G.clock>=F.std-10)return 'FINAL CALL';return 'BOARDING'}
  return 'CLOSED';
}
let boardSig='';
function renderBoard(){
  if(R.bm==='trn'){const ids=trnIds();const sig='trn'+ids.join(',');if(sig===boardSig)return;boardSig=sig;
    $('#brows').innerHTML=ids.length?ids.map(c=>`<div class="brow" data-line="${c}"><span class="flaps" data-f="std"></span><span class="flaps" data-f="flt"></span><span class="to"><span class="flaps" data-f="dest"></span><span class="city" data-f="city"></span></span><span class="flaps" data-f="gate"></span><span class="flaps st" data-f="st"></span></div>`).join(''):'<div class="bempty">No lines call at the airport yet. Draw one on the Region tab.</div>';
    $$('.brow').forEach(r=>{const q=f=>r.querySelector(`[data-f="${f}"]`);mkFlaps(q('std'),5);mkFlaps(q('flt'),6);mkFlaps(q('dest'),3);mkFlaps(q('gate'),2);mkFlaps(q('st'),10);r._q=q});return}
  const sig=G.stands.map(s=>s.built?1:0).join('');if(sig===boardSig)return;boardSig=sig;
  $('#brows').innerHTML=G.stands.map((s,i)=>s.built?`<div class="brow${R.sel===i?' sel':''}" data-stand="${i}"><span class="flaps" data-f="std"></span><span class="flaps" data-f="flt"></span><span class="to"><span class="flaps" data-f="dest"></span><span class="city" data-f="city"></span></span><span class="flaps" data-f="gate"></span><span class="flaps st" data-f="st"></span></div>`:'').join('');
  $$('.brow').forEach(r=>{const q=f=>r.querySelector(`[data-f="${f}"]`);mkFlaps(q('std'),5);mkFlaps(q('flt'),6);mkFlaps(q('dest'),3);mkFlaps(q('gate'),2);mkFlaps(q('st'),10);r._q=q});
}
function arrStatus(F){const A=F.arr;if(!A.started)return F.landed?'LANDED':'EXPECTED';if(A.onboard>0)return 'DEPLANING';if(!A.done)return A.sent<A.bags||A.reclaim>0||R.pax.some(p=>p.A===A&&p.state==='reclaim')?'BAGGAGE':'ARRIVED';return 'COMPLETE'}
const trnIds=()=>sortedLines().filter(L=>serves(L,'air')).map(L=>L.id);
function nextDep(L){const f=lineFreq(L);if(!f)return null;const h=60/f;let o=0;for(const ch of L.id)o=(o*7+ch.charCodeAt(0))%97;o=o%h;return Math.ceil((G.clock-o)/h)*h+o}
function updateBoard(){
  if(R.bm==='trn'){const kc={};$$('.brow[data-line]').forEach(r=>{const c=r.dataset.line,L=G.lines[c],q=r._q;if(!L||!q)return;const st=R.reg&&R.reg.lines[c],nd=nextDep(L),M=MODES[L.mode],far=L.stops[0]==='air'?L.stops[L.stops.length-1]:L.stops[L.stops.length-1]==='air'?L.stops[0]:L.stops[L.stops.length-1];
      setFlaps(q('std'),nd!=null?hhmm(nd):'--:--');setFlaps(q('flt'),replOn(c)?'BUS':lineCode(L));setFlaps(q('dest'),NODES[far].c);q('city').textContent=NODES[far].n;
      const pk=M.kind==='rail'?'P':M.kind==='track'?'T':M.kind==='water'?'W':'B';kc[pk]=(kc[pk]||0)+1;setFlaps(q('gate'),pk+kc[pk]);
      const s=replOn(c)?'BUS SERVICE':lineDown(L)?'SUSPENDED':!lineFreq(L)?'NO SERVICE':st&&st.load>1?'FULL':st&&st.load>0.85?'BUSY':L.sync?'MEETS FLTS':(R.fx.leaves>G.clock&&L.mode==='rail')||(M.kind==='road'&&(routeEdges(L.mode,L.stops)||[]).some(({e})=>rwOn(e.id)))?'DELAYED':'ON TIME';
      setFlaps(q('st'),s);q('st').classList.toggle('late',s==='SUSPENDED'||s==='FULL'||s==='DELAYED')});return}
  $$('.brow').forEach(r=>{
    const i=+r.dataset.stand,F=R.st[i].F,q=r._q;if(!q)return;
    if(!F){setFlaps(q('std'),'');setFlaps(q('flt'),'');setFlaps(q('dest'),'');q('city').textContent='';setFlaps(q('gate'),GATES[i]);setFlaps(q('st'),gateStatus(i)==='INBOUND'?'INBOUND':'NO SERVICE');return}
    if(R.bm==='arr'){const A=F.arr,s=arrStatus(F);setFlaps(q('std'),hhmm(A.sta));setFlaps(q('flt'),A.code+A.no);setFlaps(q('dest'),A.from[0]);q('city').textContent=A.from[1];setFlaps(q('gate'),GATES[i]);setFlaps(q('st'),s);q('st').classList.remove('late');return}
    setFlaps(q('std'),hhmm(F.std));setFlaps(q('flt'),F.code+F.no);setFlaps(q('dest'),F.dest[0]);q('city').textContent=F.dest[1];setFlaps(q('gate'),GATES[i]);
    const s=statusText(F);setFlaps(q('st'),s);q('st').classList.toggle('late',s==='DELAYED'||s==='TECH DELAY');
  });
}
$$('.bmode button').forEach(b=>b.addEventListener('click',()=>{const was=R.bm;R.bm=b.dataset.bm;$$('.bmode button').forEach(x=>x.classList.toggle('on',x===b));$('#bDestH').textContent=R.bm==='arr'?'From':R.bm==='trn'?'To':'Destination';$('#hist').style.display=R.bm==='dep'?'':'none';if((was==='trn')!==(R.bm==='trn')){boardSig='';renderBoard()}updateBoard()}));
$('#brows').addEventListener('click',e=>{const r=e.target.closest('.brow');if(!r)return;if(r.dataset.line){R.regSel=r.dataset.line;R.regSub='lines';setTab('region');const el=document.getElementById('line-'+r.dataset.line);if(el)el.scrollIntoView({block:'start'});return}const i=+r.dataset.stand;selectStand(i,false);focus(i)});
function renderHist(){
  $('#hist').innerHTML=G.history.slice(0,3).map(h=>`<div class="hrow"><span>${hhmm(h.std)}</span><span>${h.tag}</span><span class="city" style="color:#B9A15A">${h.dest[0]} ${h.dest[1]}</span><span>${h.gate}</span><span class="dep">DEP ${hhmm(h.dep)} ${h.late>0?`<span class="late">+${h.late}</span>`:'<span class="ok">✓</span>'} <span class="${h.profit<0?'late':''}">${money(h.profit)}</span></span></div>`).join('');
}

/* ================= panel ================= */
const svg=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
const pips=(l,m,cap)=>m>1&&m<=15?`<span class="pips" aria-label="Level ${l} of ${m}">${Array.from({length:m},(_,i)=>`<i class="${i<l?'on':i>=(cap??m)?'cap':''}"></i>`).join('')}</span>`:m>15?`<span class="live">${l}/${m}</span>`:'';
const lvlName=n=>LEVELS[n].name;
const aL=(n,b)=>{const t=LEVELS[n].name;return (/^[AEIOU]/.test(t)?'an ':'a ')+(b?`<b>${t}</b>`:t)};
function upRow(key){
  const u=UPG[key],l=G.lv[key],maxed=l>=u.max,ok=u.req?u.req():true,cost=upCost(key),locked=upLocked(key),cap=capOf(key),capped=!maxed&&l>=cap,bld=isBuilding('up:'+key);
  let label,dis=true,desc;
  if(maxed){label=u.max>1?'MAX':'Owned';desc=u.fx(l,true)}
  else if(locked){label='Plan';desc=planHint('up:'+key)}
  else if(bld){label='Building';desc=`Under construction, ${Math.ceil((buildOf('up:'+key).done-G.clock))} min left.`}
  else if(!ok){label='Locked';desc=u.reqText}
  else if(capped){label=`Level ${G.level+2}`;desc=`${u.fx(l,true)}. More levels when you become ${aL(Math.min(LEVELS.length-1,G.level+1))}.`}
  else {label=money(cost);dis=false;desc=u.fx(l,false)}
  return `<div class="row${locked?' lockd':''}">${svg(u.icon)}<div><div class="rt">${u.name}${pips(l,u.max,cap)}</div><div class="rd">${desc}</div></div><button class="buy${maxed?' chipd':''}" data-buy="${key}" ${dis?'disabled':`data-cost="${cost}"`}>${label}</button></div>`;
}
function segs(key,items){return `<div class="segs${items.length>5?' many':''}">${items.map(([id,n])=>`<button class="chip${(R[key]||items[0][0])===id?' on':''}" data-seg="${key}:${id}">${n}</button>`).join('')}</div>`}
function upSection(tab,only,skip){
  let h='',sec='';const done=[],later=[];
  for(const k in UPG){const u=UPG[k];if(u.tab!==tab)continue;if(only&&!only.includes(u.sec))continue;if(skip&&skip.includes(u.sec))continue;if(G.lv[k]>=u.max){done.push(k);continue}if(upLocked(k)){later.push(k);continue}if(u.sec!==sec){sec=u.sec;h+=`<div class="sec">${sec}<span data-live="sec-${sec}"></span></div>`}h+=upRow(k)}
  if(later.length)h+=`<p class="note soon">${later.length} more in the <button class="linkb" data-plan="1">Masterplan</button>.</p>`;
  if(done.length)h+=`<div class="sec">Fully upgraded<span>${done.length}</span></div>`+done.map(upRow).join('');
  return h;
}
const tabOpen=id=>id==='region'?G.level>=1||Object.keys(G.lines||{}).length>0:id==='routes'?G.level>=1||Object.keys(G.routes||{}).length>3:true;
function renderTabs(){
  $('#tabs').innerHTML=`<button class="drawclose" id="drawClose" aria-label="Close panel">×</button>`+TABS.filter(([id])=>tabOpen(id)).map(([id,n,ic])=>`<button data-tab="${id}" role="tab" aria-selected="${G.tab===id}" class="${G.tab===id?'on':''}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[ic]}</svg>${n}<span class="cnt" hidden></span>${SET().badges!==false&&(G.newTabs||[]).includes(id)&&G.tab!==id?'<span class="newb">NEW</span>':''}</button>`).join('');
}
function setTab(t){G.tab=t;if(G.newTabs)G.newTabs=G.newTabs.filter(x=>x!==t);setView(t==='region'?'region':t==='routes'?'world':'airport');if(document.body.classList.contains('fs'))drawer(true);if($('#side').classList.contains('collapsed'))setSheetSnap(1);renderTabs();renderPanel();$('#panel').scrollTop=0;const el=document.getElementById('stand-'+R.sel);if(t==='stands'&&el&&R.sel>0&&(R.gSub||'gates')==='gates')el.scrollIntoView({block:'nearest'})}
function gateWaitText(i){
  const nx=G.fleet.filter(f=>!f.sold&&f.st==='away'&&fitsGate(f.type,i)).sort((a,b)=>a.back-b.back)[0];
  return nx?`Empty. Next plane back: ${AIRCRAFT[nx.type].short} at ${hhmm(nx.back)}${nx.late?` (${nx.late} min late)`:''}${G.stands[i].partner!==false?', or a partner sooner':''}.`:G.stands[i].partner!==false?'Empty. A partner airline will use it shortly.':'Empty. Buy a plane or allow partner airlines.';
}
function gateStatus(i){const nx=G.fleet.some(f=>!f.sold&&f.st!=='gate'&&fitsGate(f.type,i));return nx||G.stands[i].partner!==false?'INBOUND':'NO AIRCRAFT'}
function standLive(i){
  const F=R.st[i].F;if(!F)return gateWaitText(i);
  const s=statusText(F),col=statusCol(s),m=Math.ceil(F.std-G.clock),A=F.arr;
  const arrLine=A.done?'':`<div class="sline" style="margin-bottom:4px"><span class="pill" style="--c:${statusCol(arrStatus(F))}">${arrStatus(F)}</span><b>${A.code}${A.no}</b>&nbsp;from ${A.from[1]} · <b>${A.n-A.onboard}/${A.n}</b>&nbsp;off · bags&nbsp;<b>${A.sent}/${A.bags}</b>&nbsp;unloaded</div>`;
  return arrLine+`<div class="sline"><span class="pill" style="--c:${col}">${s}</span><b>${F.code}${F.no}</b>&nbsp;to ${F.dest[1]}</div><div class="prog"><i style="width:${F.seated/F.booked*100}%;background:${col}"></i></div><div class="sline"><b>${F.seated}/${F.booked}</b>&nbsp;seated · hold&nbsp;<b>${Math.floor(F.hold)}/${F.checkedTotal}</b>&nbsp;· departs&nbsp;<b>${hhmm(F.std)}</b>&nbsp;${m>=0?`(in ${m} min)`:`<span class="late">(${-m} min late)</span>`}</div>`;
}
function buildLine(id){const b=buildOf(id);if(!b)return '';const p=bprog(id);return `<div class="rd">Under construction · <b>${Math.ceil(b.done-G.clock)} min</b> left</div><div class="prog"><i style="width:${p*100}%;background:var(--sign)"></i></div>`}
function standLockedCard(i){
  const s=STAND[i],prevBuilt=i===0||G.stands[i-1].built,lvlOk=G.level>=s.lvl,pierOk=!s.pier||G.pierB,bld=isBuilding('stand:'+i);
  let btn,why;
  if(bld){btn=`<button class="buy" disabled>Building</button>`;why=buildLine('stand:'+i)}
  else if(!lvlOk){btn=`<button class="buy" disabled>Level ${s.lvl+1}</button>`;why=`<div class="rd">Unlocks when you become ${aL(s.lvl)}.</div>`}
  else if(!pierOk){btn=`<button class="buy" disabled>Needs pier</button>`;why=`<div class="rd">Build Pier B first.</div>`}
  else if(!prevBuilt){btn=`<button class="buy" disabled>Locked</button>`;why=`<div class="rd">Open ${GATES[i-1]} first.</div>`}
  else{btn=`<button class="buy" data-standbuy="${i}" data-cost="${s.cost}">${money(s.cost)}</button>`;why=`<div class="rd">Its own jet bridge, lounge, shop unit and baggage carousel. Takes ${Math.round(buildMins(s.build))} min to build.</div>`}
  return `<div class="stand locked" id="stand-${i}"><div class="sh"><div><span class="gate">${GATES[i]}</span><span class="rt">${bld?'Under construction':'Stand for sale'}</span></div>${btn}</div>${why}</div>`;
}
function renderPanel(){
  if(R.sim)return;
  const P=$('#panel');let h='';
  if(G.tab==='stands'){
    const sub=R.gSub||'gates';
    h+=`<div class="segs">${[['gates','Gates'],['fleet','Fleet'],['methods','Boarding']].map(([id,n])=>`<button class="chip${sub===id?' on':''}" data-gsub="${id}">${n}</button>`).join('')}</div>`;
    if(sub==='gates'){
      if(G.builds.length)h+=`<div class="report">Building: ${G.builds.map(b=>`<b>${b.label}</b> ${Math.ceil(b.done-G.clock)}m`).join(' · ')} · crews ${buildSlots()-G.builds.length}/${buildSlots()} free</div>`;
      G.stands.forEach((st,i)=>{
        if(i===4&&G.level>=PIER.lvl){
          if(!G.pierB){const bld=isBuilding('pier:B'),ok=G.level>=PIER.lvl;
            h+=`<div class="stand locked" id="pierB"><div class="sh"><div><span class="gate">B</span><span class="rt">Pier B</span></div>${bld?'<button class="buy" disabled>Building</button>':ok?`<button class="buy" data-pierbuy="1" data-cost="${PIER.cost}">${money(PIER.cost)}</button>`:`<button class="buy" disabled>Level ${PIER.lvl+1}</button>`}</div>${bld?buildLine('pier:B'):`<div class="rd">${ok?`Room for four more gates, including widebodies. ${Math.round(buildMins(PIER.build)/60*10)/10} h to build, ${money(250)}/h to run.`:`Unlocks at ${lvlName(PIER.lvl)}.`}</div>`}</div>`}
          else h+=`<div class="sec">Pier B<span>widebody gates</span></div>`;
        }
        if(!st.built){const nextI=G.stands.findIndex(x=>!x.built);if(i===nextI&&(G.level>=STAND[i].lvl||isBuilding('stand:'+i))&&(!STAND[i].pier||G.pierB))h+=standLockedCard(i);else if(i===nextI&&G.level<STAND[i].lvl)h+=`<p class="note soon">Next gate unlocks at ${lvlName(STAND[i].lvl)}.</p>`;return}
        const F=R.st[i].F,mChips=METHODS.filter(m=>G.methods[m.id]).map(m=>`<button class="chip${st.method===m.id?' on':''}" data-method="${i}:${m.id}">${m.name}</button>`).join('');
        const who=F?(F.partner?`<span class="pdot" style="background:${F.partner.col}"></span>${F.partner.name} · ${F.ac.short}`:`${F.ac.name} #${F.fleetIdx+1}`):'Waiting for an aircraft';
        const gs=G.gstats[i]||[];
        h+=`<div class="stand${R.sel===i?' sel':''}" id="stand-${i}"><div class="sh"><div><span class="gate">${GATES[i]}</span><span class="rt">${who}</span></div><button class="buy ghost" data-look="${i}" style="min-width:0">View</button></div>
          <div class="live" data-live="stand-${i}">${standLive(i)}</div>
          ${gs.length?`<div class="rd">Last ${gs.length}: avg <b>${money(gs.reduce((a,b)=>a+b.p,0)/gs.length)}</b> · <b>${gs.filter(x=>x.o).length}/${gs.length}</b> on time</div>`:''}
          
          <div class="field"><span class="lbl">Boarding</span><div class="chips">${mChips}</div></div>
          <div class="chips" style="margin-top:8px"><button class="chip${st.partner!==false?' on':''}" data-partner="${i}" title="Other airlines use the gate when your aircraft are away. You earn ${Math.round(partnerCut()*100)}% of their fares plus a landing fee.">${st.partner!==false?'✓ ':''}Partner airlines</button>${st.rear?'<button class="chip on" disabled>✓ Rear stairs</button>':`<button class="chip" data-rear="${i}" data-cost="450">Rear stairs <small>${money(450)}</small></button>`}</div>
        </div>`;
      });
    } else if(sub==='fleet'){
      const own=G.fleet.filter(f=>!f.sold),n=own.length,at=own.filter(f=>f.st==='gate').length,away=own.filter(f=>f.st==='away').length,ready=own.filter(f=>f.st==='base').length;
      h+=`<div class="lstats fl4" style="grid-template-columns:repeat(4,1fr)"><div><b>${n}</b><span>aircraft</span></div><div><b>${at}</b><span>at gates</span></div><div><b>${away}</b><span>flying</span></div><div><b>${ready}</b><span>ready</span></div></div>`;
      h+=`<p class="note">The next ready plane takes the next free gate, then flies the most profitable open route within its range: short hops take ~${TRIP[0]} min, long-haul ${Math.round(TRIP[3]/60)}–${Math.round(TRIP[4]/60)} h. Widebodies need Pier B.</p>`;
      const back=own.filter(f=>f.st==='away').sort((a,b)=>a.back-b.back).slice(0,4);
      if(back.length)h+=`<div class="report">Next back: ${back.map(f=>`<b>${AIRCRAFT[f.type].short}</b> ${hhmm(f.back)}${f.late?` <span class="late">+${f.late}m</span>`:''}`).join(' · ')}</div>`;
      h+=crewPanel();
      h+=`<div class="sec">Aircraft</div>`;
      h+=AC_ORDER.slice().sort((x,y)=>{const o=t=>own.some(f=>f.type===t)?0:has('ac:'+t)?1:2;return o(x)-o(y)||AC_ORDER.indexOf(y)-AC_ORDER.indexOf(x)}).filter(t=>has('ac:'+t)||own.some(f=>f.type===t)).map(t=>{const a=AIRCRAFT[t],mine=own.filter(f=>f.type===t),lock=!has('ac:'+t),fireLack=a.fire&&G.lv.fire<a.fire,seats=a.rows*a.blocks.reduce((x,y)=>x+y,0);
        const due=mine.filter(f=>(f.wear||0)>=1&&f.st!=='gate'),svc=due.reduce((x,f)=>x+serviceCost(f),0),maxW=mine.reduce((x,f)=>Math.max(x,f.wear||0),0),sellable=mine.filter(f=>f.st==='base').sort((x,y)=>(y.wear||0)-(x.wear||0))[0];
        const btn=lock?`<button class="buy" disabled>Plan</button>`:fireLack?`<button class="buy" disabled>Fire cat ${a.fire}</button>`:`<button class="buy" data-acbuy="${t}" data-cost="${a.cost}">${money(a.cost)}</button>`;
        return `<div class="acrow${lock?' lockd':''}${mine.length?' own':''}"><div class="ach">${svg('plane')}<div><div class="rt">${a.name}${mine.length?` <span class="live">×${mine.length}</span>`:''}</div><div class="rd">${a.freighter?`${a.cargo} cargo units · ${money(CARGO_RATE())} each`:`${seats} seats · ${a.tier?'up to ':''}${RT_NAMES[a.tier].toLowerCase()}`} · ${money(a.op)} a flight · away ~${Math.round(TRIP[a.tier]/60*10)/10} h${a.tier>=4?' · Pier B':''}</div></div>${btn}</div>
          ${mine.length?`<div class="rd">${mine.filter(f=>f.st==='gate').length} at gates · ${mine.filter(f=>f.st==='away').length} flying · ${mine.filter(f=>f.st==='base').length} ready · worst wear ${Math.round(maxW)} flights <span style="color:${faultRisk(maxW)>0.1?'var(--bad)':'var(--muted)'}">(${Math.round(faultRisk(maxW)*100)}% fault risk)</span></div>
          <div class="chips" style="margin-top:6px">${due.length?`<button class="chip" data-servicet="${t}" data-cost="${svc}">Service ${due.length} <small>${money(svc)}</small></button>`:''}${sellable?`<button class="chip" data-sellt="${t}">Sell one <small>${money(sellValue(sellable))}</small></button>`:''}</div>`:`<div class="rd">${a.blurb}</div>`}</div>`}).join('');
    } else {
      h+=`<p class="note">Try methods on different gates and compare the reports in the Office.</p>`;
      h+=METHODS.filter(m=>has('meth:'+m.id)).map(m=>{const own=G.methods[m.id],lock=false;const best=AIRCRAFT.map(a=>G.best[a.short+'-'+m.id]?`${a.short} ${G.best[a.short+'-'+m.id].toFixed(1)}`:'').filter(Boolean).join(', ');
        return `<div class="row${lock?' lockd':''}">${svg('seat')}<div><div class="rt">${m.name}</div><div class="rd">${lock?`Unlocks at ${lvlName(m.lvl)}.`:m.desc}${best?` Best a minute: <b>${best}</b>.`:''}</div></div>${own?`<button class="buy chipd" disabled>Owned</button>`:lock?`<button class="buy" disabled>Level ${m.lvl+1}</button>`:`<button class="buy" data-mbuy="${m.id}" data-cost="${m.cost}">${money(m.cost)}</button>`}</div>`}).join('');
    }
  } else if(G.tab==='terminal'){
    const tsub=R.tSub||'dep';h+=segs('tSub',[['dep','Departures'],['arr','Arrivals'],['staff','Staff']]);
    const auto=G.lv.roster&&G.auto,sRow=(t,ic,label)=>{const own=OWN[t](),n=staffed(t);return `<div class="row">${svg(ic)}<div><div class="rt">${label}</div><div class="rd">${money(WAGE[t]*(G.wageMul||1))} an hour each${auto?' · set by rostering':''}</div></div><div class="lever"><button data-staff="${t}:-1" ${auto||n<=1?'disabled':''} aria-label="Staff one fewer">−</button><output data-live="staff-${t}">${n}</output><button data-staff="${t}:1" ${auto||n>=own?'disabled':''} aria-label="Staff one more">+</button><span class="live">/ ${own}</span></div></div>`};
    if(tsub==='staff')h+=`<div class="sec">Staffing<span>wages ${money(wageBill())} an hour</span></div>`+sRow('desks','desk','Check-in desks')+sRow('lanes','lane','Security lanes')+sRow('officers','passport','Passport desks')+(G.lv.roster?`<div class="row">${svg('crew')}<div><div class="rt">Auto rostering</div><div class="rd">${auto?'Opens counters as queues grow and closes them when it’s quiet.':'Off. You choose how many counters are staffed.'}</div></div><button class="buy${auto?'':' ghost'}" data-auto="1">${auto?'On':'Off'}</button></div>`:'')+`<p class="note">Close counters at quiet times to save wages. Kiosks and e-gates cost nothing to run.</p>`;
    h+=upSection('terminal',tsub==='dep'?['Check-in','Security']:tsub==='arr'?['Arrivals']:['Concourse','Staff']);
  } else if(G.tab==='sales'&&(R.sSub||'prices')==='shops'){
    h+=segs('sSub',[['prices','Prices'],['shops','Shops'],['landside','Landside']]);
    h+=`<p class="note">Passengers with 15+ minutes to spare may stop at a shop. Long-haul flyers spend more.</p>`;
    G.shops.forEach((s,j)=>{
      if(!standOpen(j))return;
      h+=`<div class="shopcard"><div class="sh"><div><span class="gate" style="background:var(--surface2);color:var(--muted)">${GATES[j]}</span><span class="rt">${s?SHOPS[s.type].name:'Empty unit'}</span></div>${s?`<span class="live">${money(s.earned||0)} earned</span>`:''}</div>`;
      if(s){const t=SHOPS[s.type],max=s.lvl>=4,c=shopUpCost(s);
        h+=`<div class="row" style="border:0;padding:0">${svg(t.ic)}<div><div class="rt">Level ${s.lvl+1}${pips(s.lvl+1,5)}</div><div class="rd"><b>${money(t.spend*Math.pow(1.25,s.lvl))}</b> a visit (short-haul). ${Math.round(t.pull*100)}% of passers-by stop.</div></div><button class="buy${max?' chipd':''}" ${max?'disabled':`data-shopup="${j}" data-cost="${c}"`}>${max?'MAX':money(c)}</button></div><div class="sh"><span class="rd" style="margin:0">Close it to build something else here. You get back ${money(shopValue(s))}.</span><button class="buy sell" data-shopsell="${j}">Close</button></div>`;
      } else {
        h+=`<div class="opts">${SHOPS.map((t,k)=>{const lock=!has('shop:'+t.id);if(lock)return '';return `<div class="opt${lock?' lockd':''}"><div><div class="rt">${t.name}</div><div class="rd">${lock?`Unlocks when you become ${aL(t.lvl)}.`:`${money(t.spend)} a visit · ${Math.round(t.pull*100)}% stop · ${t.dwell} min${t.vip?' · business and priority only':''}`}</div></div>${lock?`<button class="buy" disabled>Level ${t.lvl+1}</button>`:`<button class="buy" data-shopbuild="${j}:${k}" data-cost="${t.cost}">${money(t.cost)}</button>`}</div>`}).join('')}</div>`;
      }
      h+=`</div>`;
    });
  } else if(G.tab==='ground'){
    const showProj=Object.keys(UPG).some(k=>UPG[k].sec==='Landmark projects'&&has('up:'+k)),asub=showProj?(R.aSub||'ops'):'ops';if(showProj)h+=segs('aSub',[['ops','Operations'],['build','Projects']]);
    h+=asub==='ops'?`<p class="note">Planes wait for every bag and passenger. Buildings cost <b>${money(upkeepRate())}</b>/h to run.</p>`+upSection('ground',['Gates','Apron','Runway','Engineering']):upSection('ground',['Landmark projects']);
  } else if(G.tab==='sales'&&R.sSub==='landside'){
    h+=segs('sSub',[['prices','Prices'],['shops','Shops'],['landside','Landside']])+upSection('sales',['Landside']);
  } else if(G.tab==='sales'){
    h+=segs('sSub',[['prices','Prices'],['shops','Shops'],['landside','Landside']]);
    const lf=loadFactor();
    h+=`<div class="sec">Pricing</div><div class="row">${svg('ticket')}<div><div class="rt">Ticket prices</div><div class="rd">Fares at <b>${Math.round(G.fare*100)}%</b> of base. Expect flights <b>${Math.round(lf*100)}%</b> full right now (${demandName().toLowerCase()}, ${seasonOf(dayOf(G.clock)).name.toLowerCase()}). Dearer fares lose some passengers even on busy routes; a frequent flyer club softens that. Fewer passengers also board faster.</div></div>
      <div class="lever"><button data-fare="-1" aria-label="Lower prices">−</button><output>${Math.round(G.fare*100)}%</output><button data-fare="1" aria-label="Raise prices">+</button></div></div>`;
    h+=upSection('sales',null,['Landside']);
  } else if(G.tab==='routes'){
    h+=routesPanel();
  } else if(G.tab==='region'){
    h+=regionPanel();
  } else {
    const osub=R.oSub||'progress';h+=segs('oSub',[['progress','Plan'],['money','Money'],['reports','Reports'],['records','Records'],['policies','Policies'],['settings','Settings']]);
    if(osub==='records')h+=recordsPanel();
    if(osub==='policies'){h+=`<p class="note">Standing orders your staff follow automatically.</p>`+POLICIES.filter(P=>!P.show||P.show()).map(P=>`<div class="polrow"><div class="rt">${P.name}</div><div class="rd">${P.desc}</div><div class="chips">${P.opts.map(([v,n])=>`<button class="chip${pol(P.k)===v?' on':''}" data-pol='${P.k}:${JSON.stringify(v)}'>${n}</button>`).join('')}</div></div>`).join('')}
    if(osub==='progress'){
    const n=G.level+1;
    h+=`<div class="sec" id="levels">Airport level<span>${G.level+1} of ${LEVELS.length}</span></div><div class="lvlcard"><div class="lvname">${lvlName(G.level)}</div>`;
    if(LEVELS[n]){h+=`<div class="rd">Next: <b>${lvlName(n)}</b>, reward ${money(LEVELS[n].reward)}</div>`+levelChecks(n).map(([t,v,q,big])=>`<div class="lreq"><span>${t}</span><span class="live"><b>${big?num(v):v}</b> / ${big?num(q):q}</span><div class="prog"><i style="width:${clamp(v/q,0,1)*100}%;background:${v>=q?'var(--good)':'var(--sign)'}"></i></div></div>`).join('')+(()=>{const u=unlocksAt(n);return `<div class="rd">Unlocks: ${u.slice(0,5).join(', ')}${u.length>5?` and ${u.length-5} more`:''}.</div>`})()}
    else h+=`<div class="rd">You’ve reached the top. Keep your airport the best in the world.</div>`;
    h+=`</div>`+planSummary();
    {const rr=repRecent(),ks=Object.keys(rr).filter(k=>Math.abs(rr[k])>=0.5).sort((x,y)=>rr[x]-rr[y]);
      h+=`<div class="sec">Rating<span>last 3 hours</span></div>`+(ks.length?`<table class="fin">${ks.map(k=>`<tr><td>${REPLBL[k]||k}</td><td class="${rr[k]<0?'neg':'pos'}">${rr[k]>0?'+':'−'}${Math.abs(rr[k]).toFixed(1)}</td></tr>`).join('')}</table>`:`<div class="report">Nothing has moved your rating recently.</div>`)+`<p class="note">Short queues and on-time flights raise it. It sets how full flights are, and each level needs a minimum.</p>`}
    {const cg=curGoal(),dn=GOALS.filter(g=>G.gdone&&G.gdone[g.id]),up=GOALS.filter(g=>!(G.gdone&&G.gdone[g.id])&&g!==cg&&(!g.need||g.need())).slice(0,4),rw=g=>`${g.r?money(g.r):''}${g.pts?`${g.r?' + ':''}${g.pts} pt`:''}`;
      h+=`<div class="sec">Goals<span>${dn.length}/${GOALS.length}</span></div><ul class="goals">${dn.slice(-3).map(g=>`<li class="done"><span>✓</span><span>${g.t}</span><span class="r">${rw(g)}</span></li>`).join('')}${cg?`<li class="cur"><span>›</span><span>${cg.t}</span><span class="r">${rw(cg)}</span></li>`:''}${up.map(g=>`<li class="fut"><span></span><span>${g.t}</span><span class="r">${rw(g)}</span></li>`).join('')}</ul>`}
    }if(osub==='money'){
    if(G.lastDay){const L=G.lastDay;h+=`<div class="sec">Day ${L.day} report</div><div class="report"><b>${num(L.pax)}</b> passengers departed and <b>${num(L.arr)}</b> arrived on <b>${L.flights}</b> flights, <b>${L.ontime}</b> on time. Profit <b>${money(L.profit)}</b>.</div>`}
    const hrs=G.hours.slice(-12);
    if(hrs.length){
      const nets=hrs.map(b=>b.rev-b.cost),mx=Math.max(1,...nets.map(Math.abs)),bw=300/12;
      h+=`<div class="sec">Profit by hour<span>best ${money(Math.max(...nets))}</span></div><svg class="chart" viewBox="0 0 300 96" role="img" aria-label="Net profit in each of the last ${hrs.length} game hours">
        <line x1="0" y1="72" x2="300" y2="72" stroke="#323A43"/>${nets.map((v,k)=>{const hgt=Math.abs(v)/mx*62;return `<rect x="${k*bw+3}" y="${v>=0?72-hgt:72}" width="${bw-6}" height="${Math.max(1,hgt)}" rx="1.5" fill="${v>=0?'#6BE39A':'#FF7A8A'}" opacity="${k===nets.length-1?1:0.7}"/><text x="${k*bw+bw/2}" y="88" fill="#909AA4" font-size="8" font-family="IBM Plex Mono,monospace" text-anchor="middle">${pad(hrs[k].h%24)}</text>`}).join('')}</svg>`;
    }
    const rb=G.revBy,inc=['fares','inbound','landside','cargo','bags','shops','fast','priority','bonus','assets','transit','region'].reduce((a,k)=>a+(rb[k]||0),0),out=['costs','wages','upkeep','interest','transitOps'].reduce((a,k)=>a+(rb[k]||0),0);
    const row=(t,v)=>`<tr><td>${t}</td><td>${money(v)}</td></tr>`;
    h+=`<div class="sec">All-time money</div><table class="fin">${row('Departing fares',rb.fares)}${row('Arriving fares',rb.inbound||0)}${row('Car park, rail and hotel',rb.landside||0)}${row('Cargo',rb.cargo||0)}${row('Hold bag fees',rb.bags)}${row('Shops',rb.shops)}${row('Fast track',rb.fast)}${row('Priority boarding',rb.priority)}${row('Bonuses and rewards',rb.bonus)}${row('Aircraft and shops sold',rb.assets||0)}${row('Public transport fares',rb.transit||0)}${row('Region rents and events',rb.region||0)}${row('Public transport running costs',-(rb.transitOps||0))}${row('Fuel, fees and one-off costs',-rb.costs)}${row('Staff wages',-(rb.wages||0))}${row('Running costs',-(rb.upkeep||0))}${row('Loan interest',-(rb.interest||0))}<tr class="tot"><td>Net</td><td>${money(inc-out)}</td></tr></table>`;
    }if(osub==='reports'){
    h+=reportsHistory();
    if(G.news&&G.news.length)h+=`<div class="sec">Region news</div>`+G.news.slice(0,8).map(n=>`<div class="report"><b>Day ${n.d} ${n.t}</b> · ${n.m}</div>`).join('');
    h+=`<div class="sec">Last flight from each gate</div>`;
    (G.arrReports||[]).forEach((r,i)=>{if(!r)return;h+=`<div class="report"><b>${GATES[i]}</b> arrivals · <b>${r.tag}</b> from ${r.from[1]}: <b>${r.n}</b> passengers cleared in <b>${r.mins} min</b>, average wait at passports and reclaim <b>${r.avg.toFixed(1)} min</b>.</div>`});
    G.reports.forEach((r,i)=>{if(!r)return;h+=`<div class="report"><b>${GATES[i]}</b> · <b>${r.tag}</b> on the ${r.plane}, ${METHODS.find(m=>m.id===r.method).name.toLowerCase()}: <b>${r.pax}</b> seated in <b>${r.mins} min</b> (${r.rate.toFixed(1)} a minute), <b>${r.shuffles}</b> seat climbs, average queue <b>${r.wait.toFixed(1)} min</b>. ${r.onTime?'On time.':`<span class="late">${r.late} min late.</span>`} Profit <b>${money(r.profit)}</b>.</div>`});
    if(!G.reports.some(Boolean))h+=`<div class="report">Finish a flight to see how each gate performs.</div>`;
    }if(osub==='money'){
    {const cap=loanCap(),st=loanStep(),mn=Math.max(0,Math.ceil(((G.loan||0)-Math.max(0,G.cash))/st)*st);
    h+=`<div class="sec">Bank<span>limit ${money(cap)}, grows with your earnings</span></div>
      <div class="loan"><div class="lrow"><span class="rt">Loan</span><output id="loanOut" class="lval">${money(G.loan||0)}</output></div>
      <input type="range" id="loanRange" min="0" max="${cap}" step="${st}" value="${Math.round(G.loan||0)}" data-min="${mn}" aria-label="Loan amount">
      <div class="lscale"><span>$0 · 1% an hour</span><span>${money(cap)} · 5% an hour</span></div>
      <div class="rd" id="loanInfo"></div>
      <div class="lrow"><span class="rd" style="margin:0">${G.loan>0?`Now paying <b>${(loanRate(G.loan)*100).toFixed(1)}%</b>, ${money(G.loan*loanRate(G.loan))} an hour.`:'No loan right now.'}</span><button class="buy" id="loanSet" disabled>No change</button></div></div>`}
    }if(osub==='settings'||osub==='airline'){
    h+=settingsHTML()+`<div class="sec">Airline</div><div class="namefield"><input id="nameIn" maxlength="16" value="${G.name.replace(/"/g,'')}" aria-label="Airline name"></div>
      <div class="swatches">${LIVERIES.map(([n,c],k)=>`<button class="swatch${G.livery===k?' on':''}" style="background:${c}" data-liv="${k}" aria-label="${n} livery"></button>`).join('')}</div>
      <p class="note">Day ${G.day}. ${G.flights.toLocaleString('en-GB')} flights, ${G.flown.toLocaleString('en-GB')} passengers (${(G.xfers||0).toLocaleString('en-GB')} connecting), ${(G.moves||0).toLocaleString('en-GB')} runway movements, best on-time run ${G.bestStreak}.</p>
      <div class="sec">Your save</div><p class="note">${cloudNote()}</p><p class="note">To move your airport to another copy of the game, such as the downloaded file, copy a save code and paste it there.</p>
      <div class="namefield"><button class="chip" id="copySave">Copy save code</button></div>
      <div class="namefield"><input id="saveIn" placeholder="Paste a save code" aria-label="Save code" autocomplete="off" spellcheck="false" style="text-transform:none"><button class="chip" id="loadSave">Load</button></div>
      <button class="danger" id="reset">Reset progress</button>`;
    }
  }
  P.innerHTML=h;
  loanPreview();
  const nm=$('#nameIn');if(nm)nm.addEventListener('change',()=>{G.name=(nm.value.trim()||'Northwind').slice(0,16);$('#airline').textContent=G.name;save()});
  refreshUI();
}
function barSvg(vals,labels,aria,col,fmt){
  const n=vals.length,mx=Math.max(1,...vals.map(Math.abs)),neg=vals.some(v=>v<0),base=neg?50:78,sc=neg?42:70,bw=300/Math.max(n,8);
  return `<svg class="chart" viewBox="0 0 300 96" role="img" aria-label="${aria}"><line x1="0" y1="${base}" x2="300" y2="${base}" stroke="#323A43"/>${vals.map((v,k)=>{const hh=Math.abs(v)/mx*sc;return `<rect x="${k*bw+2}" y="${v>=0?base-hh:base}" width="${Math.max(1,bw-4)}" height="${Math.max(1,hh)}" rx="1.5" fill="${col(v)}" opacity="${k===n-1?1:0.72}"><title>${labels[k]}: ${fmt(v)}</title></rect>`}).join('')}${labels.map((l,k)=>n<=14||k%2===(n-1)%2?`<text x="${k*bw+bw/2}" y="92" fill="#909AA4" font-size="7.5" font-family="IBM Plex Mono,monospace" text-anchor="middle">${l}</text>`:'').join('')}</svg>`;
}
function reportsHistory(){
  let h='';const D=(G.days||[]).slice(-14);
  if(D.length>=2){
    h+=`<div class="sec">Passengers a day<span>best ${num(Math.max(...D.map(d=>d.pax)))}</span></div>`+barSvg(D.map(d=>d.pax),D.map(d=>d.d),'Departing passengers on each of the last days',()=>'#5CC8FF',num);
    h+=`<div class="sec">Profit a day<span>last ${money(D[D.length-1].p)}</span></div>`+barSvg(D.map(d=>d.p),D.map(d=>d.d),'Profit on each of the last days',v=>v>=0?'#6BE39A':'#FF7A8A',money);
    h+=`<div class="sec">Rating at day end</div>`+barSvg(D.map(d=>d.rep),D.map(d=>d.d),'Rating at the end of each day',v=>v>=70?'#6BE39A':v>=50?'#FFC72C':'#FF7A8A',v=>v);
  }else h+=`<div class="report">Charts appear after your second day.</div>`;
  const rows=Object.keys(G.routes||{}).filter(c=>CITY[c]).map(c=>{const r=rsOf(c);return [c,r.n,r.tn?r.lf:null,r.v-(r.c||0),r.p]}).sort((a,b)=>b[3]-a[3]);
  if(rows.length)h+=`<div class="sec">Routes, last 24 hours<span>${rows.length} open</span></div><table class="fin rtab"><tr><th>Route</th><th>Flights</th><th>Full</th><th>Profit</th></tr>${rows.map(([c,n,lf,p])=>`<tr><td><b>${c}</b> ${CITY[c].name}</td><td>${n.toFixed(n<10?1:0)}</td><td style="color:${lf!=null?lfCol(lf):''}">${lf!=null?Math.round(lf*100)+'%':'–'}</td><td class="${p<0?'neg':''}">${money(p)}</td></tr>`).join('')}</table>`;
  return h;
}
/* ---------- space for the camera: a per-device setting, kept out of the save so it doesn't follow the save code ---------- */
const GAPS={off:0,small:24,medium:40,large:56},GAPKEY='final-call-topgap';
function gapPref(){let v=null;try{v=localStorage.getItem(GAPKEY)}catch(e){}if(v&&v in GAPS)return v;return matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<=520?'medium':'off'}
function applyGap(){const px=GAPS[gapPref()];document.documentElement.style.setProperty('--gapsz',px+'px');$('#topgap').hidden=!px;if(typeof resize==='function')requestAnimationFrame(()=>resize())}
applyGap();
/* ---------- settings: what the game shows you ---------- */
const SETTINGS=[
  ['tips','Tips','The advice bar under the map that names your bottleneck.',[[true,'On'],[false,'Off']]],
  ['msgs','Messages','Pop-up messages over the map. Important keeps warnings, level-ups and choices. Replies to what you just tapped always show.',[['all','All'],['key','Important'],['off','Off']]],
  ['pops','Map pop-ups','Money, on-time and delay labels that float over the airport and region.',[['all','All'],['big','Big only'],['off','Off']]],
  ['goal','Goal bar','The next goal, under your cash and rating.',[[true,'On'],[false,'Off']]],
  ['recs','Recommendations','Suggested lines, routes, fares and planes at the top of the Region and Routes tabs.',[[true,'On'],[false,'Off']]],
  ['badges','Badges','NEW labels on tabs, counts of things you can afford, and points on the Masterplan button.',[[true,'On'],[false,'Off']]],
];
function settingsHTML(){
  const S=SET(),row=(k,n,d,opts)=>`<div class="polrow"><div class="rt">${n}</div><div class="rd">${d}</div><div class="chips">${opts.map(([v,l])=>`<button class="chip${S[k]===v?' on':''}" data-set='${k}:${JSON.stringify(v)}'>${l}</button>`).join('')}</div></div>`;
  let h=`<div class="sec">Notifications</div>`+SETTINGS.map(([k,n,d,o])=>row(k,n,d,o)).join('');
  h+=`<div class="chips" style="margin-top:10px"><button class="chip" data-setall="quiet">Quiet: hide all of these</button><button class="chip" data-setall="all">Show everything</button></div>`;
  h+=`<div class="sec">Game</div>`+row('chal','Weekly challenges','Three challenges each game week. Each pays cash; finish all three for a plan point.',[[true,'On'],[false,'Off']]);
  h+=`<div class="sec">Managers</div><p class="note">Staff who run the details for you. Change something yourself and they leave it to you.</p>`;
  h+=row('autoLines','Transport manager','Sets how often each line runs from how full it is, and adds night services.',[[true,'On'],[false,'Off']]);
  h+=row('autoCrews','Fleet manager','Hires crews to match your fleet, and lets spare ones go.',[[true,'On'],[false,'Off']]);
  h+=row('autoFares','Route manager','Sets each route’s fare to whatever earns most: dearer where people will pay, cheaper where seats go empty.',[[true,'On'],[false,'Off']]);
  {const g=gapPref();h+=`<div class="sec">Screen</div><div class="polrow"><div class="rt">Space for the camera</div><div class="rd">Leaves a band at the top of the screen so a phone’s camera or notch doesn’t cover the board. Saved on this device only.</div><div class="chips">${[['off','None'],['small','Small'],['medium','Medium'],['large','Large']].map(([v,l])=>`<button class="chip${g===v?' on':''}" data-gap="${v}">${l}</button>`).join('')}</div></div>`}
  h+=`<div class="sec">Sound</div><div class="polrow"><div class="rd">Chimes, cash tills and the runway.</div><div class="chips"><button class="chip${G.sound?' on':''}" data-sound="1">On</button><button class="chip${G.sound?'':' on'}" data-sound="0">Off</button></div></div>`;
  return h;
}
function applySettings(){R.tipSig=null;renderTip();if(SET().msgs!=='all'){R.toasts=R.toasts.filter(t=>t.choices&&SET().msgs==='key'||t.kind==='warn'&&SET().msgs==='key');renderToasts()}if(SET().pops==='off')R.floaters=[];R.goalSig=null;renderTabs();renderPlanBtn();refreshUI();save()}
function loanPreview(){
  const r=$('#loanRange');if(!r)return;const st=loanStep(),mn=+r.dataset.min;let v=+r.value;
  if(v<mn){v=mn;r.value=mn}
  const d=v-(G.loan||0),rate=loanRate(v),b=$('#loanSet');
  $('#loanOut').textContent=money(v);
  $('#loanInfo').innerHTML=v>0?`At <b>${money(v)}</b> the rate is <b>${(rate*100).toFixed(1)}%</b> an hour: <b>${money(v*rate)}</b> an hour in interest.`:'Slide right to borrow. The more you borrow, the higher the rate on the whole loan.';
  if(Math.abs(d)<st/2){b.disabled=true;b.textContent='No change'}else{b.disabled=false;b.textContent=d>0?`Borrow ${money(d)}`:`Repay ${money(-d)}`}
}
$('#panel').addEventListener('input',e=>{if(e.target.id==='loanRange')loanPreview()});
function upBuyable(k){const u=UPG[k];return G.lv[k]<capOf(k)&&!upLocked(k)&&(!u.req||u.req())&&!isBuilding('up:'+k)}
function standBuyable(i){const s=STAND[i];return !G.stands[i].built&&(i===0||G.stands[i-1].built)&&G.level>=s.lvl&&(!s.pier||G.pierB)&&!isBuilding('stand:'+i)}
function affordableIn(tab){
  let n=0;
  for(const k in UPG){if(UPG[k].tab===tab&&upBuyable(k)&&G.cash>=upCost(k))n++}
  if(tab==='stands'){for(const m of METHODS)if(!G.methods[m.id]&&has('meth:'+m.id)&&G.cash>=m.cost)n++;SIDX.forEach(i=>{if(standBuyable(i)&&G.cash>=STAND[i].cost)n++});if(!G.pierB&&!isBuilding('pier:B')&&G.level>=PIER.lvl&&G.cash>=PIER.cost)n++}
  if(tab==='region')n+=regionAffordable();
  if(tab==='office')n+=TECH.filter(T=>techState(T)==='ready').length;
  if(tab==='routes')n+=CITIES.filter(c=>!routeOpen(c[0])&&has('rt:'+c[2])&&G.cash>=ROUTE_FEE[c[2]]).length?1:0;
  if(tab==='sales')G.shops.forEach((s,j)=>{if(!standOpen(j))return;if(!s&&G.cash>=SHOPS[0].cost)n++;else if(s&&s.lvl<4&&G.cash>=shopUpCost(s))n++});
  return n;
}
function stars(r){const n=clamp(Math.round(r/20),0,5);return `<span class="stars">${'★'.repeat(n)}<span class="off">${'★'.repeat(5-n)}</span></span> <small style="font-size:11px;color:var(--muted)">${Math.round(r)}</small>`}
let lastRepShown=-1;
function refreshUI(){
  if(G.tab==='routes'||G.tab==='office'&&(R.oSub==='reports')){const now=performance.now();if(now-(R.panelT||0)>4000&&now-(R.panelPtr||0)>1500&&!(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#panel input'))){R.panelT=now;const pn=$('#panel'),sc=pn.scrollTop;renderPanel();pn.scrollTop=sc}}
  if(G.tab==='region'&&R.reg&&R.reg.at!==R.regShown&&!R.draft){const now=performance.now();if(now-(R.panelT||0)>4000&&now-(R.panelPtr||0)>1500){R.regShown=R.reg.at;R.panelT=now;const pn=$('#panel'),sc=pn.scrollTop;renderPanel();pn.scrollTop=sc}}
  if(document.body.classList.contains('fs')){$('#fsOn').textContent=(G.flights?Math.round(G.ontime/G.flights*100)+'% on time':'');$('#fsDot').hidden=SET().badges===false||!TABS.some(([id])=>affordableIn(id))}
  {const vb=$('#viewb'),o=tabOpen('region');if(vb.hidden===o)vb.hidden=!o;const wb=$('#worldb'),ow=tabOpen('routes');if(wb.hidden===ow)wb.hidden=!ow;const tb=$('.bmode [data-bm="trn"]'),hasTrn=trnIds().length>0;if(tb.hidden===hasTrn)tb.hidden=!hasTrn;if(R.bm==='trn'){const sig='trn'+trnIds().join(',');if(sig!==boardSig)renderBoard()}}
  if(Math.round(G.rep)!==lastRepShown){lastRepShown=Math.round(G.rep);$('#sRep').innerHTML=stars(G.rep)}
  $('#sOn').textContent=G.flights?Math.round(G.ontime/G.flights*100)+'%':'–';
  {const hb=G.hours.length>1?G.hours[G.hours.length-2]:G.hours[G.hours.length-1],nt=hb?hb.rev-hb.cost:0,el=$('#sFlown');el.textContent=hb?money(nt):'–';el.style.color=nt<0?'var(--bad)':''}
  $$('[data-live^="staff-"]').forEach(el=>{el.textContent=staffed(el.dataset.live.slice(6))});
  $$('#panel [data-cost]').forEach(b=>{b.disabled=G.cash<+b.dataset.cost});
  $$('#tabs [data-tab]').forEach(b=>{const n=b.dataset.tab===G.tab||SET().badges===false?0:affordableIn(b.dataset.tab),c=b.querySelector('.cnt');c.hidden=!n||!!b.querySelector('.newb');c.textContent=n;b.setAttribute('aria-label',b.textContent.replace(/\d+$/,'')+(n?`, ${n} affordable`:''))});
  $$('#panel [data-cost]').forEach(b=>{if(b.disabled&&G.rate>0.05){const m=(+b.dataset.cost-G.cash)/G.rate;if(m<=600)b.dataset.eta=m<1?'in < 1 min':`in ~${Math.ceil(m)} min`;else delete b.dataset.eta}else delete b.dataset.eta});
  $$('[data-live^="stand-"]').forEach(el=>{el.innerHTML=standLive(+el.dataset.live.slice(6))});
  const D=derived(),ls=(sel,t)=>{const el=$(`[data-live="${sel}"]`);if(el)el.textContent=t};
  ls('sec-Check-in',`${R.ciQ.length} queuing · ~${Math.round(R.ciQ.length*D.checkin/(D.desks+D.kiosks*0.6))} min`);
  ls('sec-Arrivals',`${R.arrQ.length} at passports · ~${Math.round(R.arrQ.length*D.passT/(D.officers+D.egates*1.6))} min`);
  ls('sec-Security',`${R.secQ.length+R.ftQ.length} queuing · ~${Math.round(R.secQ.length*D.sec/D.lanes)} min`);
  ls('sec-Runway',`${R.rwy.q.length} waiting · ${R.rwy.act.filter(Boolean).length} on the runway`);
  ls('sec-Landside',`${R.lot.filter(t=>t>G.clock).length}/${carCap()} parked`);
  ls('sec-Demand',demandName().toLowerCase()+` · ×${demandNow().toFixed(2)}`);
  ls('sec-Apron',`${R.st.filter(s=>s.F&&s.F.hold<s.F.bagsIn).length} gates loading`);
  {const gb=$('#goal'),hide=SET().goal===false;if(gb.hidden!==hide)gb.hidden=hide}
  const g=curGoal();
  if(g){const [v,t]=g.p(),sig=g.id+':'+Math.round(clamp(v/t,0,1)*100);if(sig!==R.goalSig){R.goalSig=sig;const el=$('#goal');el.classList.toggle('go',!!g.go);el.setAttribute('role',g.go?'button':'');el.tabIndex=g.go?0:-1;
    el.innerHTML=`<span class="lab">Goal</span><span class="gt">${g.t}</span><span class="gr">${g.r?money(g.r):''}${g.pts?`${g.r?' ':''}+${g.pts}★`:''}${g.go?'<span class="chev">›</span>':''}</span><div class="gbar"><i style="width:${clamp(v/t,0,1)*100}%"></i></div>`}}
  else $('#goal').innerHTML=`<span class="lab">Goals</span><span class="gt">Every goal complete. Keep growing.</span><span></span>`;
  const sea=seasonOf(dayOf(G.clock)).name.toUpperCase(),dt=`DAY ${dayOf(G.clock)} · ${sea}`;if($('#dayTag').textContent!==dt)$('#dayTag').textContent=dt;
}
function checkGoals(){
  const g=curGoal();if(!g)return;const [v,t]=g.p();
  if(v>=t){(G.gdone||(G.gdone={}))[g.id]=1;if(g.r)earn(g.r,'bonus');if(g.pts)G.pts=(G.pts||0)+g.pts;
    if(!R.sim){toast(`Goal complete: ${g.t}.${g.r?` +${money(g.r)}`:''}${g.pts?` <b>+${g.pts} plan point</b>`:''}`,null,null,'goal',5);kaching();if(G.tab==='office')renderPanel();renderPlanBtn();save()}}
}

document.addEventListener('pointerdown',()=>{ensureAudio();R.lastInput=performance.now()},{passive:true});
document.addEventListener('keydown',()=>{R.lastInput=performance.now()},{passive:true,capture:true});
$('#tabs').addEventListener('click',e=>{const t=e.target.closest('[data-tab]');if(t){setTab(t.dataset.tab);save();return}if(e.target.closest('#drawClose')){drawer(false);return}});
let resetArm=0;
function cashPop(v,plus){if(R.sim||SET().pops==='off')return;const host=$('.stat.cash'),e=document.createElement('span');e.className='pop'+(plus?' plus':'');e.textContent=(plus?'+':'')+money(plus?v:-v);host.appendChild(e);setTimeout(()=>e.remove(),1150)}
function buy(c){if(G.cash<c)return false;G.cash-=c;kaching();cashPop(c);return true}
function buyUpgrade(k){
  const u=UPG[k];if(!upBuyable(k))return false;
  if(u.build&&!canBuild())return false;
  if(!buy(upCost(k)))return false;
  if(u.build)startBuild('up:'+k,u.name,u.build);else G.lv[k]++;
  return true;
}
function buyStand(i){if(!standBuyable(i)||!canBuild()||!buy(STAND[i].cost))return false;startBuild('stand:'+i,'Gate '+GATES[i],STAND[i].build);return true}
function buyPier(){if(G.pierB||isBuilding('pier:B')||G.level<PIER.lvl||!canBuild()||!buy(PIER.cost))return false;startBuild('pier:B','Pier B',PIER.build);return true}
function buyAircraft(t){const a=AIRCRAFT[t];if(!has('ac:'+t)||(a.fire&&G.lv.fire<a.fire)||!buy(a.cost))return -1;G.fleet.push({type:t,st:'base',readyAt:G.clock,wear:0});return G.fleet.length-1;}
function highlight(sel,cls){const el=$('#panel '+sel);if(!el)return;const row=el.closest('.row,.stand,.shopcard,.opt,.lvlcard,.acrow,.lcard')||el;row.classList.remove(cls);void row.offsetWidth;row.classList.add(cls);if(cls==='pulse')row.scrollIntoView({block:'center',behavior:REDUCED?'auto':'smooth'});setTimeout(()=>row.classList.remove(cls),2300)}
$('#panel').addEventListener('pointerdown',()=>{R.panelPtr=performance.now()},{passive:true});
$('#panel').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled&&!b.dataset.look)return;const d=b.dataset;
  if(recsClick(d)){refreshUI();return}
  if(regionClick(d,b)){refreshUI();return}
  if(routesClick(d)){refreshUI();return}
  if(d.plan){openPlan();return}
  if(d.set){const i=d.set.indexOf(':'),k=d.set.slice(0,i);G.set[k]=JSON.parse(d.set.slice(i+1));applySettings();renderPanel();return}
  if(d.gap){try{localStorage.setItem(GAPKEY,d.gap)}catch(e){}applyGap();renderPanel();return}
  if(d.setall){const q=d.setall==='quiet';Object.assign(G.set,q?{tips:false,msgs:'off',pops:'off',goal:false,badges:false,recs:false}:{tips:true,msgs:'all',pops:'all',goal:true,badges:true,recs:true});applySettings();renderPanel();return}
  if(d.sound!=null){ensureAudio();G.sound=d.sound==='1';syncSound();renderPanel();save();return}
  if(d.research){if(research(d.research)){renderPanel();renderPlanBtn();save()}return}
  if(d.buypt){if(buyPoint()){renderPanel();renderPlanBtn();save()}return}
  if(d.buy){buyUpgrade(d.buy)}
  else if(d.standbuy){buyStand(+d.standbuy)}
  else if(d.pierbuy){buyPier()}
  else if(d.gsub){R.gSub=d.gsub;renderPanel();$('#panel').scrollTop=0;return}
  else if(d.pol){const i=d.pol.indexOf(':'),k=d.pol.slice(0,i),v=JSON.parse(d.pol.slice(i+1));(G.pol||(G.pol={}))[k]=v;renderPanel();save();return}
  else if(d.seg){const [k,v]=d.seg.split(':');R[k]=v;renderPanel();$('#panel').scrollTop=0;return}
  else if(d.partner){const st=G.stands[+d.partner];st.partner=st.partner===false;renderPanel();save();return}
  else if(d.servicet){const t=+d.servicet,due=G.fleet.filter(f=>!f.sold&&f.type===t&&(f.wear||0)>=1&&f.st!=='gate'),c=due.reduce((x,f)=>x+serviceCost(f),0);if(due.length&&buy(c)){due.forEach(f=>f.wear=0);toast(`${due.length} × ${AIRCRAFT[t].short} serviced.`,null,null,'goal',4)}}
  else if(d.crewhire){if(hireCrew(false)){renderPanel();save()}}
  else if(d.crewrel){if(releaseCrew()){renderPanel();save()}}
  else if(d.sellt){const t=+d.sellt,key='sellt'+t;if(!(R.armKey===key&&Date.now()-R.armT<3000)){R.armKey=key;R.armT=Date.now();b.textContent='Tap to confirm';b.classList.add('arm');setTimeout(()=>{if(b.isConnected&&R.armKey===key)renderPanel()},3000);return}R.armKey=null;
    const f=G.fleet.filter(x=>!x.sold&&x.type===t&&x.st==='base').sort((x,y)=>(y.wear||0)-(x.wear||0))[0];if(f){const v=sellValue(f);f.sold=true;G.cash+=v;G.revBy.assets=(G.revBy.assets||0)+v;cashPop(v,true);toast(`${AIRCRAFT[t].short} sold for ${money(v)}.`,null,null,'goal',5)}}
  else if(d.method){const [i,m]=d.method.split(':');G.stands[+i].method=m}
  else if(d.mbuy){const m=METHODS.find(x=>x.id===d.mbuy);if(!G.methods[m.id]&&buy(m.cost)){G.methods[m.id]=true;if(G.stands[R.sel])G.stands[R.sel].method=m.id}}
  else if(d.rear){const i=+d.rear;if(!G.stands[i].rear&&buy(450))G.stands[i].rear=true}
  else if(d.acbuy){buyAircraft(+d.acbuy)}
  else if(d.look){const i=+d.look;selectStand(i,false);focus(i)}
  else if(d.shopbuild){const [j,k]=d.shopbuild.split(':').map(Number);if(!G.shops[j]&&has('shop:'+SHOPS[k].id)&&buy(SHOPS[k].cost))G.shops[j]={type:k,lvl:0,earned:0,spent:SHOPS[k].cost}}
  else if(d.staff){const [t,dv]=d.staff.split(':');G.open[t]=clamp(staffed(t)+(+dv),1,OWN[t]())}
  else if(d.auto){G.auto=!G.auto}
  else if(d.sell||d.shopsell){
    const key=d.sell?'sell'+d.sell:'shop'+d.shopsell;
    if(!(R.armKey===key&&Date.now()-R.armT<3000)){R.armKey=key;R.armT=Date.now();b.textContent='Tap to confirm';b.classList.add('arm');setTimeout(()=>{if(b.isConnected&&R.armKey===key)renderPanel()},3000);return}
    R.armKey=null;
    if(d.sell){const j=+d.sell,f=G.fleet[j];if(!f||f.sold||G.stands.some(s=>s.built&&s.ac===j)||R.st.some(S=>S.F&&S.F.fleetIdx===j))return;const v=sellValue(f);f.sold=true;G.cash+=v;G.revBy.assets=(G.revBy.assets||0)+v;cashPop(v,true);toast(`${AIRCRAFT[f.type].short} #${j+1} sold for ${money(v)}.`,null,null,'goal',5)}
    else{const j=+d.shopsell,sh=G.shops[j];if(!sh)return;const v=shopValue(sh);G.shops[j]=null;G.cash+=v;G.revBy.assets=(G.revBy.assets||0)+v;cashPop(v,true);toast(`${SHOPS[sh.type].name} closed. The unit is free.`,null,null,'goal',5)}
  }
  else if(d.service){const f=G.fleet[+d.service];if(f&&buy(serviceCost(f))){f.wear=0;toast(`${AIRCRAFT[f.type].short} #${+d.service+1} serviced.`,null,null,'goal',4)}}
  else if(d.shopup){const s=G.shops[+d.shopup],c=s&&shopUpCost(s);if(s&&s.lvl<4&&buy(c)){s.spent=(s.spent??shopSpentEst(s))+c;s.lvl++}}
  else if(d.fare){G.fare=clamp(Math.round((G.fare+0.1*+d.fare)*10)/10,0.5,3)}
  else if(d.liv){G.livery=+d.liv}
  else if(b.id==='loanSet'){
    const v=+$('#loanRange').value,dd=v-(G.loan||0);
    if(dd<0&&G.cash<-dd){toast('Not enough cash to repay that much.',null,null,'warn',4);return}
    G.loan=Math.max(0,v);G.cash+=dd;if(dd>0){cashPop(dd,true);kaching()}else cashPop(-dd);
    renderPanel();save();return;
  }
  else if(b.id==='copySave'){
    let code='';try{code=btoa(unescape(encodeURIComponent(JSON.stringify({...G,savedAt:Date.now()}))))}catch(e){}
    const inp=$('#saveIn');const fallback=()=>{inp.value=code;inp.select();toast('Select and copy the code in the box below.',null,null,'',6)};
    try{navigator.clipboard.writeText(code).then(()=>toast('Save code copied. Paste it into the other copy of the game.',null,null,'goal',6),fallback)}catch(e){fallback()}
    return;
  }
  else if(b.id==='loadSave'){
    const raw=($('#saveIn').value||'').trim();let obj=null;try{obj=JSON.parse(decodeURIComponent(escape(atob(raw))))}catch(e){}
    if(!obj||typeof obj.cash!=='number'||!Array.isArray(obj.stands)){toast('That save code didn’t work. Copy it again and paste the whole thing.',null,null,'warn',6);return}
    if(!(R.armKey==='load'&&Date.now()-R.armT<3000)){R.armKey='load';R.armT=Date.now();b.textContent='Tap to replace this airport';return}
    R.armKey=null;resetAll(obj);toast('Airport loaded.',null,null,'goal',5);return;
  }
  else if(b.id==='reset'){
    if(Date.now()-resetArm<3000){try{localStorage.removeItem(KEY)}catch(e){}resetAll(null);return}
    resetArm=Date.now();b.classList.add('arm');b.textContent='Tap again to wipe everything';setTimeout(()=>{if(b.isConnected){b.classList.remove('arm');b.textContent='Reset progress'}},3000);return;
  } else return;
  const fk=Object.keys(d).find(k=>k!=='cost'&&k!=='eta'),fsel=fk?`[data-${fk}="${d[fk]}"]`:null;
  renderPanel();save();
  if(fsel&&(d.buy||d.route||d.staff||d.service||d.shopup||d.rear||d.mbuy||d.acbuy))highlight(fsel,'flash');
});
function subFor(tab,sel){sel=sel||'';if(tab==='terminal'){const k=(sel.match(/data-buy="(\w+)"/)||[])[1];const u=k&&UPG[k];R.tSub=u?(u.sec==='Arrivals'?'arr':u.sec==='Concourse'||u.sec==='Staff'?'staff':'dep'):/staff/.test(sel)?'staff':R.tSub}if(tab==='ground'){const k=(sel.match(/data-buy="(\w+)"/)||[])[1];R.aSub=k&&UPG[k]&&UPG[k].sec==='Landmark projects'?'build':'ops'}if(tab==='office')R.oSub=/loan/.test(sel)?'money':'progress';if(tab==='sales')R.sSub=/shop/.test(sel)?'shops':/carpark|hotel/.test(sel)?'landside':'prices';if(tab==='region')R.regSub=sel.includes('dbuild')?'sites':'lines';if(tab==='stands')R.gSub=/acbuy|servicet|sellt|crewhire/.test(sel)?'fleet':/mbuy/.test(sel)?'methods':'gates';if(tab==='routes')R.rSub=/ropen/.test(sel)?'new':'mine'}
function goTo(tab,sel){subFor(tab,sel);setTab(tab);if(sel)requestAnimationFrame(()=>highlight(sel,'pulse'))}
$('#goal').addEventListener('click',()=>{const g=curGoal();if(!g||!g.go)return;if(g.go[0]==='plan'){openPlan();return}goTo(g.go[0],g.go[1])});
$('#goal').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#goal').click()}});
$$('.hud [data-speed]').forEach(b=>b.addEventListener('click',()=>setSpeed(+b.dataset.speed)));
function syncSound(){$('#snd').classList.toggle('on',G.sound);$('#sndw').style.opacity=G.sound?1:0.15}
$('#viewb').addEventListener('click',()=>{setView(R.view==='region'?'airport':'region')});
$('#worldb').addEventListener('click',()=>{setView(R.view==='world'?'airport':'world')});
$('#snd').addEventListener('click',()=>{ensureAudio();G.sound=!G.sound;syncSound();save();if(G.tab==='office'&&(R.oSub==='settings'||R.oSub==='airline'))renderPanel()});

/* ================= advisor ================= */
function advise(){
  if((R.tipSnooze||0)>G.clock||tourOn())return null;
  const D=derived(),ciW=R.ciQ.length*D.checkin/(D.desks+D.kiosks*0.6),secW=R.secQ.length*D.sec/D.lanes;
  const cheapest=keys=>{let b=null;for(const k of keys){if(!upBuyable(k)||UPG[k].build)continue;const c=upCost(k);if(!b||c<b.c)b={k,c}}return b};
  const up=(text,keys)=>{const b=cheapest(keys);return b?{text:`${text} <b>${UPG[b.k].name}</b> would help.`,k:b.k,c:b.c}:null};
  let a=null;
  const auto=G.lv.roster&&G.auto,arW0=R.arrQ.length*D.passT/(D.officers+D.egates*1.6);
  if(!auto){for(const [t,w,name] of [['lanes',secW,'security lanes'],['desks',ciW,'check-in desks'],['officers',arW0,'passport desks']]){if(!a&&w>7&&staffed(t)<OWN[t]())a={text:`Queues are about ${Math.round(w)} min, but only ${staffed(t)} of ${OWN[t]()} ${name} are staffed.`,go:['terminal',`[data-staff="${t}:1"]`],label:'Staff up'}}}
  if(!a){const rr=repRecent(),worst=Object.entries(rr).filter(e=>e[1]<-5&&REPWHY[e[0]]).sort((x,y)=>x[1]-y[1])[0];
    if(worst){const [w,v]=worst,msg=`Your rating fell ${Math.round(-v)} points in the last 3 hours from ${REPWHY[w][0]}.`;
      a=REPWHY[w][2]?{text:msg+REPWHY[w][2],go:['region','.lcard'],label:'Region'}:up(msg,REPWHY[w][1])||(REPWHY[w][1].length?{text:msg+' Nothing left to upgrade for it, so raise ticket prices to thin the crowds.',go:['sales','[data-fare="1"]'],label:'Prices'}:null)}}
  if(!a&&R.reg&&R.reg.lines){const h=hour();if(h>=8&&h<20)for(const L of sortedLines()){const l=R.reg.lines[L.id];if(l&&l.f>0&&l.riders<3&&l.ops>15&&!buildOf('line:'+L.id)){a={text:`${lineCode(L)} (${lineName(L)}) carries almost nobody. Reroute it, or close it to save ${money(l.ops)} an hour.`,go:['region',`[data-lsel="${L.id}"]`],label:'Lines'};break}}}
  if(!a&&G.dstat&&(G.dstat.crewDl||0)>=2&&SET().autoCrews===false)a={text:`Flights waited for a crew ${G.dstat.crewDl} times today.`,go:['stands','[data-crewhire]'],label:'Crews'};
  if(!a&&R.rwy.q.length>=3)a=up(`${R.rwy.q.length} aircraft are waiting for the runway.`,['atc']);
  if(!a){const f=G.fleet.find(f=>!f.sold&&(f.wear||0)>8&&f.st!=='gate');if(f)a={text:`${AIRCRAFT[f.type].short}s are overdue a service.`,go:['stands',`[data-servicet="${f.type}"]`],label:'Service'}}
  if(!a&&secW>7)a=up(`Security queue is about ${Math.round(secW)} min.`,['lanes','sectech']);
  if(!a&&arW0>7)a=up(`Arrivals are queuing about ${Math.round(arW0)} min at passport control.`,['officers','egates','training']);
  if(!a&&ciW>7)a=up(`Check-in queue is about ${Math.round(ciW)} min.`,['desks','training','kiosks','online']);
  if(!a&&R.st.some(s=>s.F&&s.F.plane.state==='boarding'&&s.F.seated>=s.F.booked-2&&s.F.hold<s.F.checkedTotal-2))a=up('A full plane is waiting on hold bags.',['handlers','bagsys']);
  if(!a){const crowd=R.st.some((S,i)=>S.F&&S.F.plane.state==='boarding'&&R.pax.filter(p=>p.stand===i&&p.state==='gate').length>14);if(crowd)a=up('Passengers are piling up at a gate.',['scanners','walkway'])}
  if(!a){const jam=R.st.some(S=>S.aisle.flat().filter(p=>p.phase==='stow'||p.phase==='shuffle').length>=4);if(jam)a=up('Aisles are jammed with people stowing bags.',['bins'])}
  if(!a&&SET().recs!==false&&R.trRecs&&R.trRecs.sig===recSig()){const c=R.trRecs.list[0];if(c&&c.pay<12&&G.cash>=c.cost)a={text:c.kind==='line'?`A ${MODES[c.mode].name.toLowerCase()} ${c.stops.map(n=>NODES[n].n).join('–')} would earn about ${money(c.val.v)} an hour.`:`${c.kind==='stn'?STN_UP[c.k].name+' at '+NODES[c.n].n:UPG[c.k].name} would earn about ${money(c.val.v)} an hour.`,go:['region',c.kind==='line'?'[data-recline]':'[data-recother]'],label:'See it'}}
  if(!a&&tabOpen('routes')){let sup=0,mk=0;for(const c in (G.routes||{})){sup+=rsOf(c).s;mk+=cityMarket(c)}if(mk>0&&sup>mk*1.15&&CITIES.some(c=>!routeOpen(c[0])&&has('rt:'+c[2])))a={text:`Your planes offer ${Math.round(sup/mk*100)}% of the seats your cities want, so flights leave emptier. A new route opens a new market.`,go:['routes','[data-ropen]'],label:'Routes'}}
  if(!a){const i=G.stands.findIndex((s,k)=>s.built&&!R.st[k].F&&(R.st[k].idleT||0)>25);if(i>=0)a={text:`${GATES[i]} has sat empty for ${Math.round(R.st[i].idleT)} min. More planes, or partner airlines, would fill it.`,go:['stands','[data-acbuy]'],label:'Fleet'}}
  if(!a&&!G.shops.some(Boolean)&&G.cash>=SHOPS[0].cost)a={text:'Shops earn from passengers waiting for their flight.',go:['sales','.shopcard'],label:'Open a shop'};
  if(!a&&R.lotFull&&G.clock-R.lotFull<30)a=up('The car park is full, so drivers are going elsewhere.',['carpark']);
  if(!a&&G.rep<45)a=up('Your rating is low, so fewer people book.',['marketing','wifi']);
  if(!a&&G.rep>85&&G.lv.loyalty>=2&&demandNow()<=1&&loadFactor()>=0.99&&G.fare<2.5&&G.flights>20)a={text:'Flights are selling out even off-peak. You could raise ticket prices.',go:['sales','[data-fare="1"]'],label:'Prices'};
  if(!a&&(G.pts||0)>0&&TECH.some(T=>techState(T)==='ready'))a={text:`You have ${G.pts} plan point${G.pts>1?'s':''} to spend in the Masterplan.`,go:['plan'],label:'Masterplan'};
  if(!a&&G.cash<0)a={text:'You’re in the red. Close counters you don’t need, or borrow from the bank.',go:['office','#loanRange'],label:'Bank'};
  return a;
}
function renderTip(){
  if(SET().recs!==false&&tabOpen('region')&&!R.trRecQ&&(!R.trRecs||G.clock-R.trRecs.at>180||R.trRecs.sig!==recSig())&&performance.now()-(R.trRecT||0)>20000){R.trRecQ=1;R.trRecT=performance.now();setTimeout(()=>{try{computeTransitRecs()}catch(e){}R.trRecQ=0},50)}
  const a=SET().tips===false?null:advise(),el=$('#tip'),sig=a?a.text+(a.k||a.label)+(a.c||''):'';
  if(sig===R.tipSig){const b=el.querySelector('[data-cost]');if(b)b.disabled=G.cash<+b.dataset.cost;return}
  R.tipSig=sig;el.hidden=!a;if(!a)return;
  el.innerHTML=`<span class="lab">Tip</span><span class="tt">${a.text}</span>${a.k?`<button class="buy" data-tipbuy="${a.k}" data-cost="${a.c}" ${G.cash<a.c?'disabled':''}>${money(a.c)}</button>`:`<button class="buy ghost" data-tipgo="1">${a.label}</button>`}<button class="snooze" aria-label="Hide tips for a while">×</button>`;
  el._a=a;
}
$('#tip').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const a=$('#tip')._a;
  if(b.classList.contains('snooze')){R.tipSnooze=G.clock+90;R.tipSig=null;renderTip();return}
  if(b.dataset.tipbuy){if(buyUpgrade(b.dataset.tipbuy)){if(G.tab===UPG[b.dataset.tipbuy].tab)renderPanel();else refreshUI();save();R.tipSig=null;renderTip()}}
  else if(a&&a.go){if(a.go[0]==='plan')openPlan();else goTo(a.go[0],a.go[1])}
});

/* ================= help, keys, speed ================= */
function openHelp(on){$('#help').hidden=!on;if(on){R.helpPrev=R.speed;setSpeed(0);$('#help .close').focus()}else if(R.helpPrev){setSpeed(R.helpPrev)}}
$('#helpb').addEventListener('click',()=>openHelp(true));
$('#help').addEventListener('click',e=>{if(e.target.id==='help'||e.target.closest('[data-helpclose]'))openHelp(false)});
function setSpeed(v){if(v>0)R.lastSpeed=v;R.speed=v;$$('.hud [data-speed]').forEach(x=>x.classList.toggle('on',+x.dataset.speed===v));$('#ptag').hidden=v!==0}
document.addEventListener('keydown',e=>{
  if(e.target.closest&&e.target.closest('input,textarea'))return;
  if(!$('#help').hidden){if(e.key==='Escape'||e.key==='h'||e.key==='H'){e.preventDefault();e.stopImmediatePropagation();openHelp(false)}return}
  if(!$('#plan').hidden){if(e.key==='Escape'||e.key==='p'||e.key==='P'){e.preventDefault();e.stopImmediatePropagation();closePlan()}return}
  if((e.key==='p'||e.key==='P')&&!$('#planb').hidden){openPlan();return}
  if(e.key===' '){if(e.target.closest&&e.target.closest('button'))return;e.preventDefault();setSpeed(R.speed>0?0:(R.lastSpeed||1))}
  else if(/^[1-8]$/.test(e.key)){const i=+e.key-1;if(G.stands[i].built){selectStand(i,false);focus(i)}}
  else if(e.key==='0')focus('all');
  else if(e.key==='Escape'&&R.draft){R.draft=null;if(G.tab==='region')renderPanel()}
  else if((e.key==='r'||e.key==='R')&&tabOpen('region')){setView(R.view==='region'?'airport':'region')}
  else if((e.key==='w'||e.key==='W')&&tabOpen('routes')){setView(R.view==='world'?'airport':'world')}
  else if(e.key==='+'||e.key==='=')zoomAt(R.sw/2,R.sh/2,1.25);
  else if(e.key==='-'||e.key==='_')zoomAt(R.sw/2,R.sh/2,0.8);
  else if(e.key==='h'||e.key==='H'||e.key==='?')openHelp(true);
},true);

/* ================= Masterplan UI ================= */
const BNAME=Object.fromEntries(BRANCHES);
function nodeCard(T,tag,mini){
  const st=techState(T);if(mini&&st==='done')return `<div class="tnode s-done mini" data-node="${T.id}" title="${T.u.map(itemName).join(', ')}"><div class="tn">✓ ${T.n}</div></div>`;
  const req=(T.r||[]).filter(r=>!researched(r)).map(r=>TECH_BY[r].n),un=T.u.map(itemName).filter(x=>x!==T.n);
  const act=st==='done'?`<span class="tst ok">✓ Approved</span>`:st==='ready'?`<button class="buy" data-research="${T.id}">Approve · ${T.c}★</button>`:st==='pts'?`<button class="buy" disabled>${T.c}★</button>`:st==='req'?`<span class="tst">Needs ${req.join(' and ')}</span>`:`<span class="tst">${lvlName(T.t)}</span>`;
  return `<div class="tnode s-${st}" data-node="${T.id}"><div class="ttx">${tag?`<span class="tb">${BNAME[T.b]}</span>`:''}<div class="tn">${T.n}${T.c>1?` <span class="tc">${T.c}★</span>`:''}</div><div class="td">${T.d}</div>${un.length?`<div class="tu">${un.join(' · ')}</div>`:''}</div><div class="tact">${act}</div></div>`;
}
function consultRow(){const c=consultCost();return `<div class="row">${svg('crew')}<div><div class="rt">Hire consultants</div><div class="rd">Buy one plan point. Each costs more than the last.</div></div><button class="buy" data-buypt="1" data-cost="${c}">${money(c)}</button></div>`}
function planSummary(){
  const pts=G.pts||0,ready=TECH.filter(T=>techState(T)==='ready');
  let h=`<div class="sec">Masterplan<span>${Object.keys(G.tech||{}).length}/${TECH.length} approved</span></div><div class="plansum"><div class="pts"><b>${pts}</b><span>★ point${pts===1?'':'s'}</span></div><div class="rd">${pts?'Approve plans to unlock aircraft, routes, upgrades and transport.':`Reaching ${lvlName(Math.min(LEVELS.length-1,G.level+1))} gives ${LVL_PTS(G.level+1)||5} points, and some goals give one.`}</div><button class="buy" data-plan="1">Open</button></div>`;
  if(ready.length&&pts)h+=`<div class="tlist">${ready.slice(0,4).map(T=>nodeCard(T,1)).join('')}</div>`;
  if(G.level>=4)h+=consultRow();
  return h;
}
function renderPlanBtn(){const b=$('#planb');if(!b)return;const n=G.pts||0,show=G.level>=1||n>0||Object.keys(G.tech||{}).length>0;if(b.hidden===show)b.hidden=!show;const c=b.querySelector('.pb');c.textContent=n;c.hidden=!n||SET().badges===false}
function openPlan(){if(R.sim)return;const el=$('#plan');if(el.hidden){R.planPrev=R.speed;setSpeed(0)}el.hidden=false;renderPlan();$('#plan .close').focus();const r=$('#planBody .s-ready');if(r)r.scrollIntoView({block:'center'})}
function closePlan(){const el=$('#plan');if(el.hidden)return;el.hidden=true;if(R.planPrev)setSpeed(R.planPrev);renderPlanBtn();if(G.tab==='office'||G.newTabs&&G.newTabs.length)renderTabs();renderPanel()}
function renderPlan(){
  const el=$('#planBody');if(!el||$('#plan').hidden)return;const wide=el.clientWidth>=860;
  const maxT=Math.min(LEVELS.length-1,G.level+1),vis=TECH.filter(T=>T.t<=maxT||researched(T.id)),tiers=[...new Set(vis.map(T=>T.t))].sort((a,b)=>a-b),later=TECH.length-vis.length,pts=G.pts||0;
  let h=`<div class="phead"><div class="pts big"><b>${pts}</b><span>★ point${pts===1?'':'s'} to spend</span></div><div class="rd">Approve a plan to unlock what it lists. Plans unlock with your airport’s level; some need an earlier plan. Every new level brings 5 or 6 points, some goals give one${G.level>=4?', and consultants sell them':''}.</div>${G.level>=4?`<button class="buy" data-buypt="1" data-cost="${consultCost()}" ${G.cash<consultCost()?'disabled':''}>+1★ ${money(consultCost())}</button>`:''}</div>`;
  if(wide){
    h+=`<div class="tgrid" style="grid-template-columns:104px repeat(${BRANCHES.length},minmax(0,1fr))"><div></div>${BRANCHES.map(([b,n])=>`<div class="tbh">${n}</div>`).join('')}`;
    for(const t of tiers)h+=`<div class="tth${t>G.level?' fut':''}"><b>${lvlName(t)}</b>${t>G.level?'<span>next level</span>':''}</div>`+BRANCHES.map(([b])=>`<div class="tcell">${vis.filter(T=>T.b===b&&T.t===t).map(T=>nodeCard(T,0,1)).join('')}</div>`).join('');
    h+=`</div>`;
  }else{
    const bs=R.planB||'all';
    h+=`<div class="chips pchips"><button class="chip${bs==='all'?' on':''}" data-planb="all">All</button>${BRANCHES.map(([b,n])=>{const r=vis.filter(T=>T.b===b&&techState(T)==='ready').length;return `<button class="chip${bs===b?' on':''}" data-planb="${b}">${n}${r&&pts?` <small>${r}</small>`:''}</button>`}).join('')}</div>`;
    const ns=vis.filter(T=>bs==='all'||T.b===bs),grp=[['Ready to approve',ns.filter(T=>techState(T)==='ready')],['Needs points or an earlier plan',ns.filter(T=>['pts','req'].includes(techState(T)))],[`At ${lvlName(Math.min(LEVELS.length-1,G.level+1))}`,ns.filter(T=>techState(T)==='level')]];
    for(const [n,L] of grp)if(L.length)h+=`<div class="sec">${n}<span>${L.length}</span></div><div class="tlist">${L.map(T=>nodeCard(T,bs==='all')).join('')}</div>`;
    const dn=ns.filter(T=>techState(T)==='done');if(dn.length)h+=`<div class="sec">Approved<span>${dn.length}</span></div><div class="tdone">${dn.map(T=>`<span title="${T.u.map(itemName).join(', ')}">✓ ${T.n}</span>`).join('')}</div>`;
  }
  if(later)h+=`<p class="note soon">${later} more plans appear as your airport grows.</p>`;
  el.innerHTML=h;
}
$('#planb').addEventListener('click',()=>openPlan());
$('#plan').addEventListener('click',e=>{
  if(e.target.id==='plan'||e.target.closest('[data-planclose]')){closePlan();return}
  const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
  if(d.research){if(research(d.research)){renderPlan();save()}}
  else if(d.planb){R.planB=d.planb;renderPlan()}
  else if(d.buypt){if(buyPoint()){renderPlan();save()}}
});
addEventListener('resize',()=>{if(!$('#plan').hidden)renderPlan()});

/* ================= bottom sheet (phones) ================= */
const isPhone=()=>matchMedia('(max-width:899px)').matches;
// the tallest the sheet can be while still leaving some of the map in view
function sheetMax(){const app=$('.app'),cs=getComputedStyle(app),bd=$('.board');return Math.max(160,app.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom)-(bd?bd.offsetHeight:0)-16-120)}
function setSheetSnap(n){
  const sd=$('#side');G.sheet=n;
  if(document.body.classList.contains('fs')){sd.style.height='';if(n===0)drawer(false);return}
  sd.style.flexBasis='';
  if(n===0)sd.classList.add('collapsed');else{sd.classList.remove('collapsed');if(isPhone())sd.style.flexBasis=Math.round(Math.min(innerHeight*(n===1?0.42:0.72),sheetMax()))+'px'}
}
addEventListener('resize',()=>{if(isPhone()&&!document.body.classList.contains('fs')&&!sheetDrag)setSheetSnap(G.sheet??1)});
let sheetDrag=null;
// while dragging, the sheet slides over the map instead of resizing it at every step
$('#grip').addEventListener('pointerdown',e=>{const g=$('#grip');g.setPointerCapture(e.pointerId);const h=$('#side').getBoundingClientRect().height;sheetDrag={y:e.clientY,h,base:h,last:h,moved:0}});
$('#grip').addEventListener('pointermove',e=>{
  if(!sheetDrag)return;const dy=e.clientY-sheetDrag.y;sheetDrag.moved=Math.max(sheetDrag.moved,Math.abs(dy));if(sheetDrag.moved<4)return;
  const fs=document.body.classList.contains('fs'),top=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topgap'))||0,h=clamp(sheetDrag.h-dy,80,fs?innerHeight-top-12:sheetMax()),sd=$('#side');sheetDrag.last=h;
  if(fs){sd.classList.remove('collapsed');sd.style.height=h+'px';return}
  // the map takes the whole space under the sheet for the drag (one resize), and the sheet slides over it
  sd.classList.remove('collapsed');sd.classList.add('dragging');sd.style.flexBasis=h+'px';sd.style.marginTop=(110-h)+'px';
});
function endSheet(){
  if(!sheetDrag)return;const d=sheetDrag;sheetDrag=null;const sd=$('#side'),vh=window.innerHeight,fs=document.body.classList.contains('fs');
  sd.classList.remove('dragging');sd.style.marginTop='';
  if(d.moved<4){if(fs){drawer(false);return}setSheetSnap(sd.classList.contains('collapsed')?1:0);save();return}
  const h=d.last;
  if(fs){if(h<vh*0.3){drawer(false);sd.style.height=''}return}
  const mx=sheetMax(),opts=[[0,150],[1,Math.min(vh*0.42,mx)],[2,Math.min(vh*0.72,mx)]];let best=opts[0];for(const o of opts)if(Math.abs(o[1]-h)<Math.abs(best[1]-h))best=o;
  setSheetSnap(best[0]);save();
}
$('#grip').addEventListener('pointerup',endSheet);$('#grip').addEventListener('pointercancel',endSheet);
$('#grip').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSheetSnap($('#side').classList.contains('collapsed')?1:0)}});

/* ================= full screen ================= */
function drawer(open){document.body.classList.toggle('drawer',open);if(!open)$('#side').style.height=''}
function setFs(on){
  document.body.classList.toggle('fs',on);drawer(false);if(!on)setSheetSnap(G.sheet??1);
  $('#fsi').setAttribute('d',on?'M5 2v3H2M12 5H9V2M9 12V9h3M2 9h3v3':'M2 5V2h3M9 2h3v3M12 9v3H9M5 12H2V9');
  $('#fsb').classList.toggle('on',on);$('#fsb').setAttribute('aria-label',on?'Exit full screen':'Full screen');
  const d=document,el=d.documentElement;
  try{
    if(on&&!d.fullscreenElement&&el.requestFullscreen)el.requestFullscreen({navigationUI:'hide'}).catch(()=>{});
    else if(!on&&d.fullscreenElement&&d.exitFullscreen)d.exitFullscreen().catch(()=>{});
  }catch(e){}
  refreshUI();requestAnimationFrame(fitHud);
}
$('#fsb').addEventListener('click',()=>setFs(!document.body.classList.contains('fs')));
$('#fsManage').addEventListener('click',()=>drawer(!document.body.classList.contains('drawer')));
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&document.body.classList.contains('fs')&&R.fsNative)setFs(false);R.fsNative=!!document.fullscreenElement});
cv.addEventListener('pointerdown',()=>{if(document.body.classList.contains('drawer')&&matchMedia('(max-width:899px)').matches)drawer(false)});
document.addEventListener('keydown',e=>{
  if(e.target.closest&&e.target.closest('input,textarea'))return;
  if(e.key==='f'||e.key==='F'){setFs(!document.body.classList.contains('fs'))}
  else if(e.key==='Escape'&&document.body.classList.contains('fs')){if(document.body.classList.contains('drawer'))drawer(false);else setFs(false)}
});

/* ================= layout ================= */
function resize(){
  const r=$('#stage').getBoundingClientRect();if(!r.width||!r.height)return;
  const first=R.sw===1;R.sw=r.width;R.sh=r.height;R.dpr=Math.min(2.5,window.devicePixelRatio||1);if(!sheetDrag||!R.baseK)R.baseK=R.sh/H;
  cv.width=Math.round(R.sw*R.dpr);cv.height=Math.round(R.sh*R.dpr);
  if(first){if(R.view!=='airport'){R.cam.z=zMin();R.cam.init=1}else{R.cam.z=1;R.cam.x=0;R.cam.y=0}}
  clampCam();fitHud();
}
function fitHud(){
  const b=document.body,h=$('.hud'),f=$('.fsbar'),p=$('#ptag');if(!h)return;
  b.classList.remove('fsstack');p.classList.remove('low');
  const hr=h.getBoundingClientRect(),hb=Math.round(8+hr.height+8)+'px',st=$('#stage');if(st.style.getPropertyValue('--hb')!==hb)st.style.setProperty('--hb',hb);
  if(f){const fr=f.getBoundingClientRect();b.classList.toggle('fsstack',fr.width>0&&fr.right>hr.left-6)}
  const sr=$('#stage').getBoundingClientRect(),sw=sr.width;p.classList.toggle('low',sw/2+110>sw-8-hr.width-6);$('#stage').classList.toggle('short',sr.height<230);
}
new ResizeObserver(resize).observe($('#stage'));

/* ================= save ================= */
function save(){if(R.sim)return;G.savedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(G))}catch(e){}}
setInterval(save,5000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
try{window.claude?.hot?.snapshot?.(()=>({save:JSON.parse(JSON.stringify({...G,savedAt:Date.now()}))}))}catch(e){}
function migrate(o){
  const s=DEFAULT();
  ['cash','rep','flown','flights','ontime','earned','name','clock','flightNo','sound'].forEach(k=>{if(o[k]!=null)s[k]=o[k]});
  if(o.lv)for(const k in o.lv)if(k in s.lv)s.lv[k]=Math.min(o.lv[k],UPG[k].max);
  if(o.methods)s.methods={...o.methods};
  if(o.owned){s.fleet=[];o.owned.forEach((own,t)=>{if(own)s.fleet.push({type:t})});if(!s.fleet.length)s.fleet=[{type:0}];const j=s.fleet.findIndex(f=>f.type===o.plane);s.stands[0].ac=j>=0?j:0}
  if(o.strategy)s.stands[0].method=o.strategy;
  if(o.fare)s.fare=o.fare;
  s.revBy.fares=o.earned||0;s.paxSeated=o.flown||0;
  return s;
}
const padTo=(a,f)=>{a=Array.isArray(a)?a.slice(0,NG):[];while(a.length<NG)a.push(f(a.length));return a};
function resetAll(state){
  const d=DEFAULT();G=Object.assign(d,state||{});
  G.lv=Object.assign(DEFAULT().lv,(state&&state.lv)||{});for(const k in G.lv){if(!(k in UPG))delete G.lv[k];else G.lv[k]=clamp(+G.lv[k]||0,0,UPG[k].max)}
  G.revBy=Object.assign(DEFAULT().revBy,(state&&state.revBy)||{});
  G.stands=padTo(G.stands,i=>({built:false,ac:null,method:'random',rear:false,route:'mixed'}));G.stands.forEach(s=>{if(!s.route)s.route='mixed'});
  G.shops=padTo(G.shops,()=>null);G.reports=padTo(G.reports,()=>null);G.arrReports=padTo(G.arrReports,()=>null);G.gstats=padTo(G.gstats,()=>[]);
  G.open=Object.assign({desks:null,lanes:null,officers:null},G.open||{});
  if(!Array.isArray(G.builds))G.builds=[];
  G.fleet=(G.fleet||[]).map(f=>Object.assign({wear:0},f,{st:f.st==='away'&&f.back>G.clock?'away':'base',readyAt:G.clock,gate:null}));if(!G.fleet.some(f=>!f.sold))G.fleet.push({type:0,st:'base',readyAt:G.clock,wear:0});
  if(G.tab==='shops')G.tab='sales';
  G.lines=G.lines||{};G.infra=G.infra||{};G.tod=G.tod||{};G.stn=G.stn||{};G.lineSeq=G.lineSeq||0;G.dev=G.dev||{};G.pop=G.pop||{};G.evq=Array.isArray(G.evq)?G.evq:[];
  if(state&&!state.lines){if(G.lv.rail)G.lines.castle={mode:'rail',align:'old',freq:2,fare:1,exp:false,night:false,freight:false,cars:0};if(state.lv&&state.lv.hsr)G.lines.low={mode:'hsr',align:'main',freq:1,fare:1,exp:false,night:false,freight:false,cars:0}}
  migrateLines();R.draft=null;R.ng=null;
  if(state&&state.level==null){ // older save: grant the level its progress already earns, without the reward
    let lv=0;for(let n=1;n<LEVELS.length;n++){const q=LEVELS[n].req;if(G.flown>=q.pax&&builtCount()>=q.gates)lv=n;else break}G.level=Math.min(lv,4);
  }else if(state&&!state.pv)G.level=LV_MAP[clamp(state.level|0,0,LV_MAP.length-1)];
  if(state&&!state.pv){ // before the Masterplan: approve every plan up to the airport's level, and anything already in use
    G.tech={};G.pts=0;G.ptBought=0;G.gdone={};
    const own=k=>{const [a,v]=k.split(':');return a==='up'?G.lv[v]>0:a==='ac'?G.fleet.some(f=>f.type===+v):a==='meth'?!!G.methods[v]:a==='shop'?G.shops.some(x=>x&&SHOPS[x.type].id===v):a==='mode'?Object.values(G.lines).some(L=>L.mode===v):a==='dev'?Object.values(G.dev).includes(v):a==='stn'?Object.values(G.stn).some(x=>x&&x[v]):false};
    for(const T of TECH)if(T.t<=G.level||T.u.some(own))G.tech[T.id]=1;
    G.pv=2;
  }
  {const hadMgr=state&&state.set&&'autoLines' in state.set;G.set=Object.assign(DEFAULT().set,G.set||{});if(state&&!hadMgr){G.set.autoLines=false;G.set.autoFares=false}}
  G.tech=G.tech||{};G.gdone=G.gdone||{};
  if(state&&!state.tour||G.tour&&!G.tour.done&&(G.level>=1||G.flights>30))G.tour={done:1};
  if(state&&!state.stamps){G.stamps={};for(const S of STAMPS){try{if(S.t())G.stamps[S.id]=G.day||dayOf(G.clock)}catch(e){}}}
  if(!Array.isArray(G.crews)||(state&&!state.crews)){G.crews=[];for(let k=0;k<crewTarget();k++)G.crews.push(mkCrew(G.clock))}G.crews.forEach(c=>{c.res=0;if(c.back==null)c.back=c.free||0});if(state&&state.set&&!('autoCrews' in state.set))G.set.autoCrews=true;if(G.set.chal==null)G.set.chal=true;
  if(state&&!state.routes){G.routes={};for(let t=0;t<5;t++){if(!has('rt:'+t))continue;CITIES.filter(c=>c[2]===t).sort((x,y)=>y[4]-x[4]).slice(0,t===0?5:4).forEach(c=>G.routes[c[0]]={f:1})}}
  G.routes=G.routes||{};G.rs=G.rs||{};for(const c in G.routes)if(!CITY[c])delete G.routes[c];
  if(state&&!state.gdone){for(const g of GOALS){try{const [v,t]=g.p();if(v>=t)G.gdone[g.id]=1}catch(e){}}}
  G.day=dayOf(G.clock);if(!G.dstat)G.dstat={pax:0,arr:0,flights:0,ontime:0,rev:0,cost:0,rep0:G.rep};
  R.rwy={q:[],act:[null,null]};R.lot=new Array(540).fill(0);R.platform=[];R.train={state:'away',t:3,x:null};R.lotFull=0;
  R.arrQ=[];R.booths=[];R.egates=[];R.arrBelt=[];
  R.pax=[];R.ciQ=[];R.secQ=[];R.ftQ=[];R.desks=[];R.kiosks=[];R.lanes=[];R.ftL={p:null,t:0};R.belt=[];R.st=SIDX.map(mkStandRT);R.st.forEach((S,i)=>S.hold=i*6);R.floaters=[];R.toasts=[];R.fx={fog:0,rush:0,sick:0,strike:0,hedge:0,fuelUp:0,fuelDown:0,snow:0,storm:0,rain:0,line:{},leaves:0,roadworks:0};R.autoN={};R.tram={state:'away',t:2,x:null};R.bus={state:'away',t:1,x:null};R.tramQ=[];R.busQ=[];R.reg=null;for(const P of PLOTS)scheduleEvent(P.id);regionTick();
  R.nextEvent=G.clock+60;R.lastMin=Math.floor(G.clock);R.sel=G.stands.findIndex(s=>s.built);if(R.sel<0)R.sel=0;
  if(R.sim)return;
  setView(G.tab==='region'?'region':G.tab==='routes'?'world':'airport');$('#airline').textContent=G.name;$('#lvlName').textContent=lvlName(G.level);renderPlanBtn();boardSig='';renderBoard();renderHist();renderTabs();renderPanel();renderCam();renderToasts();syncSound();save();
}

/* ================= boot ================= */
let last=performance.now(),uiT=0;
function frame(now){
  const rdt=Math.min(0.1,(now-last)/1000);last=now;
  if(R.speed>0&&!R.sim){const t=rdt*R.speed,n=Math.ceil(t/0.034);for(let i=0;i<n;i++)update(t/n)}
  camStep(rdt);draw();
  const hm=hhmm(G.clock);$('#clock').textContent=hm;$('#fsClock').textContent=hm;
  if(R.cashShown==null)R.cashShown=G.cash;R.cashShown+=(G.cash-R.cashShown)*Math.min(1,rdt*9);if(Math.abs(G.cash-R.cashShown)<0.005)R.cashShown=G.cash;
  const cs=money(R.cashShown);if(cs!==R.cashTxt){R.cashTxt=cs;$('#sCash').textContent=cs;$('#fsCash').textContent=cs}
  uiT+=rdt;if(uiT>0.25){uiT=0;refreshUI();renderTip();updateBoard();checkGoals();if(G.tour&&!G.tour.done)tourStep();fitHud();tickToasts(0.25*(R.speed>0?1:0));
    const fc=wxForecast(),ev=pol('curfew')&&nightWin()?'CURFEW':R.fx.storm>G.clock?'STORM':R.fx.strike>G.clock?'STRIKE':fc&&fc.eta<60?`${fc.type.toUpperCase()} IN ${Math.max(1,Math.round(fc.eta))}M`:R.fx.rain>G.clock?'RAIN':R.fx.snow>G.clock?'SNOW':R.fx.fog>G.clock?'FOG':R.fx.fuelUp>G.clock?'FUEL SPIKE':R.fx.rush>G.clock?'RUSH':R.fx.sick>G.clock?'STAFF SHORT':'';const tag=ev||demandName();const el=$('#fxTag');if(el.textContent!==tag){el.textContent=tag;el.style.color=ev?'var(--bad)':tag.includes('PEAK')?'var(--sign)':''}}
  requestAnimationFrame(frame);
}
function start(data){
  let s=data&&data.save,fresh=false;
  if(!s){try{s=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){s=null}}
  if(!s){try{const o=JSON.parse(localStorage.getItem(OLDKEY)||'null');if(o){s=migrate(o);fresh=true}}catch(e){}}
  setSheetSnap(s&&s.sheet!=null?s.sheet:1);resize();
  const away=s&&s.savedAt?(Date.now()-s.savedAt)/1000:0,wasOld=s&&s.level==null,pre15=s&&!s.pv&&s.level!=null;
  resetAll(s);
  if(fresh)toast('Your airline has moved into a full airport. Your cash, aircraft and upgrades came with you.',null,null,'goal',10);
  else if(pre15)toast(`New: ten airport levels, a Masterplan of plans to approve (P), and a world map of routes (W). You're now ${aL(G.level,1)}, with the plans you already use approved.`,[{label:'See the routes',fn:()=>setTab('routes')},{label:'Got it',fn:()=>{}}],null,'goal',20);
  else if(wasOld)toast(`New: levels, Pier B, the region map and plenty more. You start as ${aL(G.level,1)} (Office tab).`,null,null,'goal',14);
  else if(!data?.save&&away>90&&G.rate>0){const gain=Math.round(G.rate*Math.min(away,10800)*0.35);if(gain>=1){earn(gain,'bonus');toast(`Welcome back. The airport earned about ${money(gain)} while you were away.`,null,null,'goal',10)}}
  else if(!s)startTour();
  setTimeout(()=>{cloudInit().catch(()=>{})},0);
  if(s&&!s.nv3&&!fresh)toast('New: Lowmere opens a rival airport once you are a City Airport. Your planes need crews (Gates › Fleet), and the Office has Records and weekly challenges.',null,'nv3','goal',16);G.nv3=1;
  requestAnimationFrame(frame);
}
/* ================= REGION: transport, development and the wider world ================= */
const RW=1600,RH=1000;
const PLACES={
  air:{name:'Airport',x:900,y:648,pop:0,kind:'air'},
  city:{name:'Harbourgate',x:400,y:560,pop:420,kind:'city'},
  mill:{name:'Millbrook',x:620,y:500,pop:60,kind:'suburb'},
  docks:{name:'Riverside Docks',x:250,y:770,pop:45,kind:'suburb'},
  castle:{name:'Castleton',x:190,y:170,pop:70,kind:'town'},
  ashby:{name:'Ashby',x:560,y:280,pop:12,kind:'village'},
  east:{name:'Eastmoor',x:1430,y:420,pop:90,kind:'town'},
  fell:{name:'Fellside',x:1170,y:330,pop:15,kind:'village'},
  brook:{name:'Brookvale',x:1210,y:650,pop:20,kind:'village'},
  low:{name:'Lowmere',x:1528,y:112,pop:1200,kind:'far'}
};
const MODES={
  bus:{name:'Bus',L:'B',lvl:0,fix:300,build:20,spd:16,cap:70,vh:15,fare:2,freqs:[1,2,3,4,6,8,12],kind:'road',len:9,cols:['#6BE39A','#C3F06B','#2FC9A5','#8FD16B','#4FB083'],desc:'Cheap. Uses roads, so traffic slows it.'},
  coach:{name:'Coach',L:'C',lvl:1,fix:1500,build:30,spd:26,cap:50,vh:30,fare:7,freqs:[1,2,3,4],kind:'road',len:11,cols:['#5CC8FF','#86A8FF','#3E9BD6','#8FDDF5'],desc:'Quick on motorways, few seats.'},
  water:{name:'Water bus',L:'W',lvl:3,fix:6000,tpx:6,tbuild:0.12,build:60,spd:13,cap:110,vh:40,fare:4,freqs:[1,2,3,4],kind:'water',len:12,cols:['#2BB3A3','#5FD8C9','#1E8F84'],desc:'No traffic, but fog and storms stop it.'},
  tram:{name:'Tram',L:'T',lvl:3,fix:5000,tpx:55,tbuild:0.6,build:60,spd:17,cap:190,vh:45,fare:2.5,freqs:[2,4,6,8,10,12],kind:'track',len:22,cols:['#FF9F43','#FFD84D','#F2603A','#FFB38A','#D9822B'],desc:'Own tracks, never stuck in traffic.'},
  rail:{name:'Train',L:'R',lvl:3,fix:12000,tpx:90,tbuild:0.45,build:90,spd:32,cap:300,vh:100,fare:5,freqs:[1,2,3,4,6,8],kind:'rail',len:26,cols:['#C39BFF','#9B7BFF','#E6B0FF','#8067E0','#D8C2FF'],desc:'Fast and roomy between towns.'},
  metro:{name:'Metro',L:'M',lvl:6,fix:80000,tpx:1100,tbuild:1.5,build:120,spd:30,cap:700,vh:120,fare:3,freqs:[6,8,10,12,15,20],kind:'rail',len:30,cols:['#E5484D','#FF6B8A','#D6336C','#FF9A9A'],desc:'Underground, frequent and huge.'},
  hsr:{name:'High-speed rail',L:'H',lvl:7,fix:250000,tpx:650,tbuild:0.28,build:180,spd:110,cap:450,vh:500,fare:30,freqs:[1,2,3],kind:'rail',len:34,cols:['#F5D08A','#E8B04A'],desc:'Lowmere in 40 min. Wins long-haul flyers, replaces some short hops.'}
};
const MODE_ORDER=['bus','coach','water','tram','rail','metro','hsr'];
const ELECTRIC={tram:1,rail:1,metro:1,hsr:1};
const TRACKCAP={tram:24,rail:12,metro:30,hsr:6};
/* stations: Harbourgate has three; the airport has its terminal and a north stop */
const NODES={
  air:{n:'Airport',c:'AIR',x:900,y:648,pl:'air',sh:0,pier:[905,806]},
  ano:{n:'Airport North',c:'ANO',x:1095,y:600,pl:'air',sh:0},
  mil:{n:'Millbrook',c:'MIL',x:620,y:500,pl:'mill',sh:1},
  hbc:{n:'Central',c:'HBC',x:410,y:565,pl:'city',sh:0.45},
  old:{n:'Old Town',c:'OLD',x:330,y:480,pl:'city',sh:0.25},
  hbs:{n:'Quayside',c:'QSD',x:395,y:690,pl:'city',sh:0.3,pier:[369,748]},
  doc:{n:'Riverside Docks',c:'RDK',x:250,y:770,pl:'docks',sh:1,pier:[252,826]},
  cas:{n:'Castleton',c:'CAS',x:190,y:170,pl:'castle',sh:1},
  ash:{n:'Ashby',c:'ASH',x:560,y:280,pl:'ashby',sh:1},
  fel:{n:'Fellside',c:'FEL',x:1170,y:330,pl:'fell',sh:1},
  eas:{n:'Eastmoor',c:'EAS',x:1430,y:420,pl:'east',sh:1},
  brk:{n:'Brookvale',c:'BRK',x:1210,y:650,pl:'brook',sh:1},
  low:{n:'Lowmere',c:'LOW',x:1528,y:112,pl:'low',sh:1,far:1}
};
const NODE_IDS=Object.keys(NODES);
/* corridors between neighbouring stations: roads everywhere, track only where it fits */
const EDGES=[
  {id:'air-mil',a:'air',b:'mil',pts:[[900,648],[820,600],[700,520],[620,500]],road:1,m:['tram','rail','metro']},
  {id:'mil-hbc',a:'mil',b:'hbc',pts:[[620,500],[520,515],[410,565]],road:1,m:['tram','rail','metro']},
  {id:'air-hbs',a:'air',b:'hbs',pts:[[900,648],[760,668],[600,648],[480,640],[395,690]],road:2,m:['tram','rail']},
  {id:'hbs-hbc',a:'hbs',b:'hbc',pts:[[395,690],[402,628],[410,565]],road:1,m:['tram','metro']},
  {id:'hbc-old',a:'hbc',b:'old',pts:[[410,565],[372,522],[330,480]],road:1,m:['tram','metro']},
  {id:'hbs-doc',a:'hbs',b:'doc',pts:[[395,690],[322,732],[250,770]],road:1,m:['tram','metro']},
  {id:'old-cas',a:'old',b:'cas',pts:[[330,480],[300,380],[250,262],[190,170]],road:1,m:['rail']},
  {id:'air-ash',a:'air',b:'ash',pts:[[900,648],[870,520],[770,400],[650,320],[560,280]],road:1,m:['rail'],old:1,spd:0.8},
  {id:'ash-cas',a:'ash',b:'cas',pts:[[560,280],[430,250],[300,195],[190,170]],road:1,m:['rail'],old:1,spd:0.8},
  {id:'air-cas',a:'air',b:'cas',pts:[[900,648],[790,520],[600,400],[400,290],[190,170]],road:2,m:['rail']},
  {id:'mil-ash',a:'mil',b:'ash',pts:[[620,500],[598,390],[560,280]],road:1,m:[]},
  {id:'air-ano',a:'air',b:'ano',pts:[[900,648],[1000,630],[1095,600]],road:1,m:['tram','rail']},
  {id:'ano-fel',a:'ano',b:'fel',pts:[[1095,600],[1128,470],[1170,330]],road:1,m:['tram','rail'],spd:0.85},
  {id:'fel-eas',a:'fel',b:'eas',pts:[[1170,330],[1300,360],[1430,420]],road:1,m:['tram','rail']},
  {id:'air-brk',a:'air',b:'brk',pts:[[900,648],[1050,662],[1210,650]],road:2,m:['tram','rail']},
  {id:'brk-eas',a:'brk',b:'eas',pts:[[1210,650],[1340,545],[1430,420]],road:2,m:['tram','rail'],cost:1.3},
  {id:'air-low',a:'air',b:'low',pts:[[900,648],[1050,480],[1250,300],[1450,160],[1528,112]],road:2,coach:1,m:['hsr'],extra:3300},
  {id:'w-air-hbs',a:'air',b:'hbs',water:1,pts:[[905,806],[760,852],[560,878],[420,866],[366,848],[368,800],[369,748]],m:['water']},
  {id:'w-hbs-doc',a:'hbs',b:'doc',water:1,pts:[[369,748],[366,848],[300,842],[252,826]],m:['water']}
];
const E_BY={};EDGES.forEach(e=>E_BY[e.id]=e);
const WALKS=[['hbc','old',14],['hbc','hbs',15],['air','ano',12]];
const SUGGEST={
  bus:[['air','mil','hbc'],['air','hbs','doc'],['air','brk','eas'],['hbc','old'],['air','ash','cas'],['air','ano','fel']],
  coach:[['air','cas'],['air','low'],['air','brk','eas']],
  water:[['air','hbs','doc']],
  tram:[['air','mil','hbc','old'],['doc','hbs','hbc','old'],['air','hbs'],['air','ano','fel','eas'],['air','brk','eas']],
  rail:[['air','ash','cas'],['air','cas'],['air','brk','eas'],['old','cas'],['air','ano','fel','eas']],
  metro:[['air','mil','hbc','old'],['doc','hbs','hbc','old']],
  hsr:[['air','low']]
};
const STN_UP={pr:{name:'Park and ride',cost:8000,lvl:3,desc:'Drivers park here and ride on: journeys from here feel 6 min shorter.'},hub:{name:'Interchange hall',cost:25000,lvl:4,desc:'Changing lines here takes 2 min, not 5.'}};
const stnUp=(n,k)=>!!(G.stn&&G.stn[n]&&G.stn[n][k]);
const EVSRC={match:0.15,cruise:1,concert:0.15,conference:0.5,premiere:0.3};
const LOCAL_K=0.01,LOCAL_FARE=0.4;
const PLOTS=[
  {id:'docks',name:'Dockside land',place:'docks',node:'doc',x:130,y:690,opts:['stadium','cruise','flats']},
  {id:'mill',name:'Millbrook Fields',place:'mill',node:'mil',x:672,y:448,opts:['bizpark','estate','conference']},
  {id:'north',name:'Airport North',place:'air',node:'ano',x:1162,y:590,opts:['logistics','hotels','retail']},
  {id:'castle',name:'Castleton Edge',place:'castle',node:'cas',x:280,y:118,opts:['uni','outlet','castlehomes']},
  {id:'fell',name:'Fellside Hills',place:'fell',node:'fel',x:1105,y:262,opts:['themepark','studios','reserve']},
  {id:'sea',name:'The Estuary',place:'docks',node:'hbs',x:700,y:945,opts:['wind','marina']},
  {id:'centre',name:'Harbourgate Centre',place:'city',node:'old',x:282,y:528,opts:['arena','techcampus','oldtown']},
  {id:'roads',name:'Roads policy',place:'city',node:null,x:520,y:708,opts:['ringroad','lowtraffic']}
];
const DEV={
  stadium:{name:'Football stadium',lvl:4,cost:250000,build:720,upk:150,tour:10,cong:6,ev:'match',desc:'42,000 seats. Match days fly in away fans and flood the docks: give it a line that moves crowds.'},
  cruise:{name:'Cruise terminal',lvl:4,cost:180000,build:600,upk:100,tour:6,ev:'cruise',desc:'Ships call every couple of days; their passengers fly in and out in a rush.'},
  flats:{name:'Waterfront flats',lvl:1,cost:20000,build:240,pop:30,cong:8,desc:'30,000 new residents: more flyers, more traffic.'},
  bizpark:{name:'Business park',lvl:3,cost:60000,build:360,upk:40,jobs:15,cong:5,desc:'15,000 jobs. Business flights fill up; towns grow.'},
  estate:{name:'Housing estate',lvl:1,cost:15000,build:240,pop:35,cong:10,desc:'35,000 new residents in Millbrook.'},
  conference:{name:'Conference centre',lvl:4,cost:150000,build:480,upk:80,jobs:3,ev:'conference',desc:'Trade shows fly in business-class delegates. Hotels and the tech campus boost the takings.'},
  logistics:{name:'Logistics park',lvl:3,cost:50000,build:360,upk:30,jobs:6,cong:10,cargo:0.4,desc:'Cargo +40%, but lorries clog the roads unless a rail line runs freight.'},
  hotels:{name:'Hotel quarter',lvl:3,cost:40000,build:300,upk:20,tour:2,desc:'Airport hotel earnings ×2; conferences pay 50% more.'},
  retail:{name:'Retail park',lvl:1,cost:25000,build:240,upk:10,tour:2,cong:8,income:40,desc:'Pays rent; shoppers fill the buses.'},
  uni:{name:'University',lvl:3,cost:80000,build:480,upk:40,pop:20,jobs:8,tour:4,locals:2,desc:'20,000 students and 8,000 jobs: busy trams and trains, holiday flyers.'},
  outlet:{name:'Outlet village',lvl:3,cost:45000,build:300,upk:20,tour:4,income:60,cong:6,locals:1.5,desc:'Designer outlets. Coaches fill up.'},
  castlehomes:{name:'Castleton homes',lvl:1,cost:15000,build:240,pop:25,cong:6,desc:'25,000 new residents in Castleton.'},
  themepark:{name:'Theme park',lvl:4,cost:200000,build:720,upk:120,tour:16,cong:8,summer:1,income:150,locals:2,desc:'Huge in summer, quiet in winter.'},
  studios:{name:'Film studios',lvl:4,cost:120000,build:480,upk:60,jobs:10,tour:5,ev:'premiere',desc:'Premieres bring bursts of business travel.'},
  reserve:{name:'Nature reserve',lvl:1,cost:8000,build:120,tour:2,green:1,desc:'Greener region: rating recovers 10% faster.'},
  wind:{name:'Offshore wind farm',lvl:4,cost:300000,build:900,green:1,energy:1,desc:'Building costs −15%; trams, trains and the metro run 25% cheaper.'},
  marina:{name:'Marina',lvl:3,cost:60000,build:360,upk:20,tour:4,income:50,desc:'Water buses win many more riders.'},
  arena:{name:'Concert arena',lvl:6,cost:400000,build:720,upk:160,tour:6,cong:5,ev:'concert',desc:'15,000 seats in town. Tours fly fans in; the city line must cope afterwards.'},
  techcampus:{name:'Tech campus',lvl:6,cost:350000,build:720,upk:100,jobs:40,cong:6,desc:'40,000 jobs. Business travel soars; conferences pay more.'},
  oldtown:{name:'Old town restoration',lvl:3,cost:50000,build:480,upk:20,tour:9,desc:'Weekend-breakers love it.'},
  ringroad:{name:'Ring road',lvl:3,cost:90000,build:600,upk:40,cong:-35,drive:1,desc:'Faster roads, so more people drive: car park +25%, public transport −5% riders.'},
  lowtraffic:{name:'Low-traffic city centre',lvl:3,cost:30000,build:180,cong:-18,nodrive:1,desc:'Less traffic, +15% public transport riders, car park −25%.'}
};
const EVT={
  match:{label:'Match day',every:[2.5,4],times:[900,1185],att:[30000,42000],levy:3,surge:0.1,ride:0.45},
  cruise:{label:'Cruise call',every:[1.6,2.4],times:[480],att:[2500,4200],levy:10,surge:0.08,ride:0.6},
  concert:{label:'Concert',every:[2.5,3.5],times:[1200],att:[12000,15000],levy:6,surge:0.06,ride:0.4},
  conference:{label:'Conference',every:[2.5,3.5],times:[540],att:[2000,4000],levy:25,surge:0.1,biz:1,ride:0.5},
  premiere:{label:'Premiere',every:[3.5,4.5],times:[1140],att:[1500,2500],levy:20,surge:0.04,biz:1,ride:0.4}
};
const TEAMS=['Lowmere Rovers','Castleton Town','Eastmoor Athletic','Fellside United','Northport City','Kingsbridge Wanderers','Ashby Albion'];
const SHIPS=['MS Aurora Sky','Coral Meridian','Nordic Tern','Silver Horizon','Island Serenade','Pacific Lark'];
const ARTISTS=['The Velvet Tides','Nova Kane','Paper Lanterns','Echo Parade','Marisol Reyes','Kid Halcyon','Glasshouse'];
const CONFS=['FinTech North','Global Freight Expo','MedTech Summit','Green Energy Forum','GameDev Live','Aviation Futures'];
const FILMS=['Midnight Harbour','The Glass Coast','Paper Kingdoms','Signal Lost','Northern Light'];
const pickOf=a=>a[Math.floor(Math.random()*a.length)];
const RLBL={road:'bus',track:'tram',rail:'train',water:'bus'};

/* ---------- geometry ---------- */
EDGES.forEach(e=>{e.P=rPath(e.pts);e.len=e.P.len});
function edgeOK(e,mode){const M=MODES[mode];if(!M)return false;if(M.kind==='road')return !e.water&&!!e.road&&!(mode==='bus'&&e.coach);if(mode==='water')return !!e.water;return !e.water&&e.m.includes(mode)}
const EF_CACHE={};
function edgeFor(a,b,mode){const k=a+'|'+b+'|'+mode;if(k in EF_CACHE)return EF_CACHE[k];let r=null;for(const e of EDGES)if(((e.a===a&&e.b===b)||(e.a===b&&e.b===a))&&edgeOK(e,mode)){r=e;break}return EF_CACHE[k]=r}
function routeEdges(mode,stops){if(!stops||stops.length<2)return null;const out=[];for(let i=0;i<stops.length-1;i++){const e=edgeFor(stops[i],stops[i+1],mode);if(!e)return null;out.push({e,rev:e.a!==stops[i]})}return out}
function neighbours(n,mode){const out=[];for(const e of EDGES)if(edgeOK(e,mode)){if(e.a===n)out.push([e.b,e]);else if(e.b===n)out.push([e.a,e])}return out}
const trackOf=m=>MODES[m].kind==='road'?null:m;
const hasTrack=(e,m)=>!trackOf(m)||!!(G.infra&&G.infra[e.id]&&G.infra[e.id][m]);
function modePath(a,b,mode,avoid){ // shortest usable path for the route editor, favouring track already laid
  const dist={[a]:0},prev={},done=new Set();
  for(;;){let u=null;for(const k in dist)if(!done.has(k)&&(u==null||dist[k]<dist[u]))u=k;if(u==null||u===b)break;done.add(u);
    for(const [v,e] of neighbours(u,mode)){if(avoid&&avoid.has(v))continue;const w=(e.len+(e.extra||0))*(hasTrack(e,mode)?0.6:1);if(dist[v]==null||dist[u]+w<dist[v]){dist[v]=dist[u]+w;prev[v]=u}}}
  if(dist[b]==null)return null;const p=[b];while(p[0]!==a)p.unshift(prev[p[0]]);return p;
}
function pathLen(p,mode){let s=0;for(let i=0;i<p.length-1;i++){const e=edgeFor(p[i],p[i+1],mode);s+=e?e.len+(e.extra||0):1e6}return s}
function ptOn(P,s){
  s=clamp(s,0,P.len);let i=1;while(i<P.cum.length-1&&P.cum[i]<s)i++;
  const a=P.pts[i-1],b=P.pts[i],seg=(P.cum[i]-P.cum[i-1])||1,t=(s-P.cum[i-1])/seg;
  return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,Math.atan2(b[1]-a[1],b[0]-a[0])];
}
function distToPath(P,x,y){let bd=1e9;for(let i=1;i<P.pts.length;i++){const [ax,ay]=P.pts[i-1],[bx,by]=P.pts[i],dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1,t=clamp(((x-ax)*dx+(y-ay)*dy)/l2,0,1);bd=Math.min(bd,Math.hypot(ax+dx*t-x,ay+dy*t-y))}return bd}
function offsetPts(pts,d){
  if(!d)return pts;const nrm=(dx,dy)=>{const l=Math.hypot(dx,dy)||1;return [-dy/l,dx/l]};const out=[];
  for(let i=0;i<pts.length;i++){let nx,ny,s=1;
    if(i===0||i===pts.length-1){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];[nx,ny]=nrm(b[0]-a[0],b[1]-a[1])}
    else{const n1=nrm(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]),n2=nrm(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]),mx=n1[0]+n2[0],my=n1[1]+n2[1],ml=Math.hypot(mx,my)||1;nx=mx/ml;ny=my/ml;s=1/Math.max(0.5,nx*n1[0]+ny*n1[1])}
    out.push([pts[i][0]+nx*d*s,pts[i][1]+ny*d*s])}
  return out;
}

/* ---------- state helpers ---------- */
const hour=()=>(G.clock/60)%24;
const isNight=()=>{const h=hour();return h<5||h>=23.5};
const placePop=pid=>(G.pop&&G.pop[pid]!=null)?G.pop[pid]:PLACES[pid].pop;
const devAt=plot=>G.dev&&G.dev[plot]?DEV[G.dev[plot]]:null;
const devOn=opt=>!!G.dev&&Object.values(G.dev).includes(opt);
function devSum(key){let s=0;for(const p in (G.dev||{})){const d=DEV[G.dev[p]];if(d&&d[key])s+=d[key]}return s}
function devLocalMul(pid){let m=1;PLOTS.forEach(pl=>{if(pl.place===pid){const d=devAt(pl.id);if(d&&d.locals)m+=d.locals-1}});return m}
const anyMode=m=>Object.values(G.lines||{}).some(L=>L.mode===m);
const replOn=id=>((R.fx.repl||{})[id]||0)>G.clock;
const serves=(L,n)=>L.stops.includes(n)&&(n===L.stops[0]||n===L.stops[L.stops.length-1]||!(L.skip||[]).includes(n));
const linesAt=n=>Object.values(G.lines||{}).filter(L=>serves(L,n));
const lineCode=L=>MODES[L.mode].L+L.num;
const lineName=L=>`${NODES[L.stops[0]].n} – ${NODES[L.stops[L.stops.length-1]].n}`;
const plotNode=id=>{const P=PLOTS.find(p=>p.id===id);return P?P.node:null};
const effKind=L=>replOn(L.id)?'bus':RLBL[MODES[L.mode].kind];
const sortedLines=()=>Object.values(G.lines||{}).sort((a,b)=>MODE_ORDER.indexOf(a.mode)-MODE_ORDER.indexOf(b.mode)||a.num-b.num);
const rwOn=eid=>(R.fx.roadworks||0)>G.clock&&R.fx.rwE===eid;
function regCong(){return R.reg&&isFinite(R.reg.cong)?R.reg.cong:0.3}
function lineDown(L){
  if(!L)return true;if(((R.fx.line||{})[L.id]||0)>G.clock&&!replOn(L.id))return true;
  if(L.mode==='water'){if(R.fx.fog>G.clock)return true;for(const {e} of (routeEdges(L.mode,L.stops)||[])){const m=ptOn(e.P,e.len/2),w=wxAt(m[0],m[1]);if(w&&(w.c.type==='fog'||w.c.type==='storm'))return true}}
  return false;
}
function lineFreq(L,nominal){if(!L)return 0;let f=L.freq;if(L.freight)f=Math.max(1,f-1);if(nominal)return f;if(lineDown(L))return 0;if(isNight())f=L.night?Math.max(1,Math.floor(f/2)):0;return f}
const fareMul=L=>[0.7,1,1.5][L.fare??1];
function edgeMins(L,e,M,rb){ // minutes for one vehicle to cover a corridor right now
  const road=M.kind==='road',w=R.reg&&R.reg.ewx?R.reg.ewx[e.id]:null;let v=M.spd;
  if(road){v*=e.road===2?(M===MODES.coach?1.15:1.25):(M===MODES.coach?0.75:1);const ce=R.reg&&R.reg.ce&&R.reg.ce[e.id]!=null?R.reg.ce[e.id]:regCong();v*=(1-0.4*ce)*(rwOn(e.id)?0.6:1)}else if(e.spd)v*=e.spd;
  if(w){if((w==='snow'||w==='storm')&&(road||M.kind==='track'))v*=0.7;else if(w==='rain'&&road)v*=0.85}
  if(!rb&&L.mode==='rail'&&(R.fx.leaves||0)>G.clock)v*=0.75;
  if(G.lv.control)v*=1.08;
  const tm=rb?null:trackOf(L.mode),ov=tm&&R.reg&&R.reg.over?R.reg.over[e.id+':'+tm]||0:0;if(ov>1)v/=Math.sqrt(ov);
  return (e.len+(e.extra||0))/v;
}
function lineTiming(L){ // arrival and departure minutes at each station along the route, one way
  const RE=routeEdges(L.mode,L.stops);if(!RE)return null;const rb=replOn(L.id),M=rb?MODES.bus:MODES[L.mode],sk=L.skip||[];
  const arr=[0],dep=[0],eT=[];let t=0;
  RE.forEach(({e},i)=>{const m=edgeMins(L,e,M,rb);eT.push(m);t+=m;arr.push(t);if(i<RE.length-1)t+=sk.includes(L.stops[i+1])?0.3:1;dep.push(t)});
  return {arr,dep,eT,one:t,RT:2*t+6,RE};
}

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
  const r=R.reg;if(!r)return null;let x=Math.random();
  for(const [id,s] of r.airSh){if(x<s){const L=G.lines[id];if(!L||lineFreq(L)<=0)return null;const k=effKind(L);if(k==='train'&&!G.lv.rail)return null;return k}x-=s}
  return null;
}
function exitTarget(p){
  const tk=pickTransit();p.state='exitW';
  if(tk==='train'&&G.lv.rail){p.tx=40+Math.random()*260;p.ty=704}
  else if(tk==='tram'){p.tx=40+Math.random()*260;p.ty=789}
  else if(tk==='bus'){p.tx=236+Math.random()*40;p.ty=641}
  else{p.tx=EXIT.x;p.ty=EXIT.y+(Math.random()-0.5)*18}
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

/* ---------- events ---------- */
function scheduleEvent(plot){
  const d=devAt(plot);if(!d||!d.ev)return;if((G.evq||[]).some(e=>e.plot===plot))return;
  const E=EVT[d.ev],off=E.every[0]+Math.random()*(E.every[1]-E.every[0]),day=Math.floor(G.clock/1440)+Math.max(1,Math.round(off));
  let at=day*1440+pickOf(E.times);if(at<G.clock+300)at+=1440;
  const att=Math.round((E.att[0]+Math.random()*(E.att[1]-E.att[0]))*(1+(R.reg?R.reg.tour:0)*0.004)/100)*100;
  let name='';
  if(d.ev==='match')name=`Harbourgate FC v ${pickOf(TEAMS)}`;else if(d.ev==='cruise')name=pickOf(SHIPS);else if(d.ev==='concert')name=pickOf(ARTISTS);else if(d.ev==='conference')name=pickOf(CONFS);else name=pickOf(FILMS);
  (G.evq||(G.evq=[])).push({type:d.ev,plot,at,att,name,dem:0,car:0,warned:false});
}
function evPlace(e){return PLOTS.find(p=>p.id===e.plot).place}
function updateEvents(dt){
  if(!G.evq)G.evq=[];
  for(const e of G.evq.slice()){
    const E=EVT[e.type],pid=evPlace(e);
    if(!e.warned&&G.clock>=e.at-200&&G.clock<e.at){e.warned=true}
    if(e.live&&pid!=='air'){const fans=e.live.fans;e.dem+=fans*dt/60;e.car+=Math.min(fans,e.live.carried||0)*dt/60}
    if(G.clock>=e.at+210){
      const C=R.reg?R.reg.cong:0.3;let f=pid==='air'?1:e.dem>0?(e.car+(e.dem-e.car)*0.6*(1-C))/e.dem:0.6*(1-C);f=clamp(f,0,1);
      let levy=e.att*E.levy*(0.5+0.5*f);
      if(e.type==='conference'){levy*=(devOn('hotels')?1.5:1)*(1+0.1*G.lv.hotel)*(devOn('techcampus')?1.3:1)}
      earn(levy,'region');
      let head='';
      if(e.type==='match'){const a=Math.floor(Math.random()*4),b=Math.floor(Math.random()*3);head=`Full time: ${e.name.replace(' v ',` ${a}–${b} `)}.`}
      else if(e.type==='cruise')head=`${e.name} has sailed.`;else if(e.type==='concert')head=`${e.name} played to ${num(e.att)}.`;else if(e.type==='conference')head=`${e.name} has wrapped up.`;else head=`The premiere of ${e.name} is over.`;
      const pct=Math.round(f*100);
      let tail=pid==='air'?'Everyone walked straight from the terminal.':f>=0.75?`${pct}% got there and back easily.`:f>=0.5?`Only ${pct}% got there and back easily; the rest sat in traffic.`:`Chaos: just ${pct}% got there and back easily.`;
      if(f>=0.75)repAdj(2,'events');else if(f<0.5)repAdj(-(0.5-f)*10,'events');
      news(`${head} ${tail} Takings ${money(levy)}.`);e.res={f,levy,t:G.clock};(R.evDoneFx||(R.evDoneFx=[])).push({plot:e.plot,text:`${EVT[e.type].label.toUpperCase()} · ${Math.round(f*100)}% GOT HOME · +${money(levy)}`,t:G.clock,good:f>=0.5});toast(`${EVT[e.type].label}: +${money(levy)}, ${Math.round(f*100)}% got there and back easily.`,null,null,f>=0.5?'goal':'warn',6);
      G.evDone=(G.evDone||0)+1;G.evq.splice(G.evq.indexOf(e),1);scheduleEvent(e.plot);
    }
  }
}

/* ---------- building and editing lines ---------- */
function modeLocked(mode,stops){const M=MODES[mode];if(!has('mode:'+mode))return `Approve ${TECH_BY[NODE_OF['mode:'+mode]].n} in the Masterplan first.`;if(M.kind==='rail'&&stops&&stops.includes('air')&&!G.lv.rail)return 'Trains need the airport station first (below)';return ''}
const pendingTrack=(eid,m)=>(G.builds||[]).some(b=>b.track&&b.mode===m&&b.track.includes(eid));
function trackCost(e,m){return Math.round((e.len+(e.extra||0))*MODES[m].tpx*(e.old?0.4:1)*(e.cost||1)*(devOn('wind')?0.85:1))}
function nextNum(mode){const used=new Set();for(const L of Object.values(G.lines||{}))if(L.mode===mode)used.add(L.num);for(const b of (G.builds||[]))if(b.lid&&!b.edit&&b.mode===mode)used.add(b.num);let n=1;while(used.has(n))n++;return n}
function lineQuote(mode,stops,editId){
  const M=MODES[mode],q={ok:false,cost:0,track:[],tcost:0,mins:0,ride:0,why:''};
  if(!stops||stops.length<2){q.why='Pick at least two stations.';return q}
  const RE=routeEdges(mode,stops);if(!RE){q.why='Stations must be next to each other.';return q}
  if(new Set(stops).size!==stops.length){q.why='A line can’t visit a station twice.';return q}
  const tm=trackOf(mode);let tmins=0,ride=0;
  for(const {e} of RE){ride+=edgeMins({mode,id:''},e,M,false);if(tm&&!hasTrack(e,mode)){if(pendingTrack(e.id,mode)){q.why='Track here is still being laid.';return q}q.track.push(e.id);q.tcost+=trackCost(e,mode);tmins+=(e.len+(e.extra||0))*M.tbuild*(e.old?0.6:1)}}
  const edit=editId&&G.lines[editId];
  q.cost=q.tcost+(edit?(q.track.length?Math.round(M.fix*0.1):0):M.fix);
  q.mins=edit&&!q.track.length?0:buildMins(Math.max(M.build,tmins));
  q.ride=Math.round(ride+Math.max(0,stops.length-2));
  q.why=modeLocked(mode,stops);if(!q.why&&edit&&isBuilding('line:'+editId))q.why='This line is already being extended.';q.ok=!q.why;
  return q;
}
function orderLine(mode,stops,skip,editId){
  const q=lineQuote(mode,stops,editId);if(!q.ok){toast(q.why||'That line can’t be built.',null,null,'warn',5);return false}
  const edit=editId&&G.lines[editId],sk=(skip||[]).filter(n=>stops.slice(1,-1).includes(n));
  if(edit&&!q.mins){if(q.cost&&!buy(q.cost))return false;edit.stops=stops.slice();edit.skip=sk;R.ng=null;regionTick();toast(`${lineCode(edit)} now runs ${lineName(edit)}.`,null,null,'',5);return true}
  if(!canBuild()||!buy(q.cost))return false;
  const M=MODES[mode],lid=edit?edit.id:'L'+(G.lineSeq=(G.lineSeq||0)+1),num=edit?edit.num:nextNum(mode),col=edit?edit.col:M.cols[(num-1)%M.cols.length];
  const label=edit?`the ${M.L}${num} extension`:`${M.name.toLowerCase()} line ${M.L}${num}`;
  G.builds.push({id:'line:'+lid,label:label[0].toUpperCase()+label.slice(1),start:G.clock,done:G.clock+q.mins,mode,stops:stops.slice(),skip:sk,track:q.track,edit:edit?lid:null,lid,num,col});
  toast(`Work has started on ${label}. Ready in about ${Math.round(q.mins/60*10)/10} h.`,null,null,'',6);return true;
}
function finishLine(b){
  if(!b.stops)return;if(!G.infra)G.infra={};
  for(const eid of (b.track||[]))(G.infra[eid]||(G.infra[eid]={}))[b.mode]=1;
  const L=G.lines[b.lid];
  if(b.edit){if(L){L.stops=b.stops;L.skip=b.skip||[]}}
  else{const M=MODES[b.mode];G.lines[b.lid]={id:b.lid,mode:b.mode,stops:b.stops,skip:b.skip||[],freq:M.freqs[Math.min(1,M.freqs.length-1)],fare:1,night:false,sync:false,cars:0,freight:false,num:b.num,col:b.col}}
  R.ng=null;regionTick();
}
function closeLine(id){delete G.lines[id];G.builds=(G.builds||[]).filter(b=>b.id!=='line:'+id);if(R.regSel===id)R.regSel=null;R.ng=null;regionTick()}
/* saves from before the network: one line per corridor becomes a numbered line on real track */
const OLD_ROUTES={city:{mill:['air','mil','hbc'],exp:['air','hbs','hbc']},castle:{old:['air','ash','cas'],new:['air','cas']},docks:{road:['air','hbs','doc'],water:['air','hbs','doc']},east:{hill:['air','ano','fel','eas'],valley:['air','brk','eas']},low:{main:['air','low']}};
function oldRoute(cid,align,mode){const o=OLD_ROUTES[cid];if(!o)return null;let st=o[align]||Object.values(o)[0];if(mode==='metro'&&cid==='city')st=o.mill;if(mode==='water')st=o.water;if(cid==='docks'&&mode!=='water')st=o.road;return routeEdges(mode,st)?st:null}
function migrateLines(){
  for(const cid of Object.keys(G.lines||{})){const L=G.lines[cid];if(L&&L.stops)continue;delete G.lines[cid];if(!L||!MODES[L.mode])continue;const st=oldRoute(cid,L.align,L.mode);if(!st)continue;
    for(const {e} of routeEdges(L.mode,st))if(trackOf(L.mode))(G.infra[e.id]||(G.infra[e.id]={}))[L.mode]=1;
    const M=MODES[L.mode],id='L'+(G.lineSeq=(G.lineSeq||0)+1),num=nextNum(L.mode),fr=M.freqs.reduce((a,x)=>Math.abs(x-L.freq)<Math.abs(a-L.freq)?x:a,M.freqs[0]);
    G.lines[id]={id,mode:L.mode,stops:st,skip:L.exp||(cid==='city'&&L.align==='exp')?st.slice(1,-1):[],freq:fr,fare:L.fare??1,night:!!L.night,sync:!!L.sync,cars:L.cars||0,freight:!!L.freight,num,col:M.cols[(num-1)%M.cols.length]}}
  G.builds=(G.builds||[]).filter(b=>{if(!b.id.startsWith('line:')||b.stops)return true;const cid=b.id.slice(5),st=MODES[b.mode]&&oldRoute(cid,b.align,b.mode);if(!st)return false;
    const M=MODES[b.mode],lid='L'+(G.lineSeq=(G.lineSeq||0)+1),num=nextNum(b.mode);Object.assign(b,{id:'line:'+lid,lid,stops:st,skip:[],edit:null,num,col:M.cols[(num-1)%M.cols.length],track:(routeEdges(b.mode,st)||[]).filter(({e})=>trackOf(b.mode)&&!hasTrack(e,b.mode)).map(({e})=>e.id),label:`${M.name} line ${M.L}${num}`});return true});
}
const carsCost=L=>Math.round(MODES[L.mode].fix*1.5*((L.cars||0)+1));

function buildDev(plot,opt){
  const d=DEV[opt];if(!d||!has('dev:'+opt)||G.dev[plot]||isBuilding('dev:'+plot))return false;if(!canBuild())return false;if(!buy(d.cost))return false;
  G.builds.push({id:'dev:'+plot,label:d.name,start:G.clock,done:G.clock+buildMins(d.build),opt});
  toast(`Work has started on the ${d.name.toLowerCase()}. Ready in about ${Math.round(buildMins(d.build)/60*10)/10} hours.`,null,null,'',7);return true;
}
function finishDev(b){const plot=b.id.split(':')[1];G.dev[plot]=b.opt;scheduleEvent(plot);regionTick()}

/* ---------- disruptions ---------- */
/* ---------- weather: moving cells with real effects ---------- */
const WX={fog:{col:'205,212,220',a:0.28,r:[170,240],spd:[3,5]},rain:{col:'120,150,185',a:0.22,r:[200,300],spd:[5,8]},snow:{col:'235,240,248',a:0.3,r:[200,280],spd:[3.5,6]},storm:{col:'70,80,105',a:0.42,r:[140,210],spd:[5,8]}};
const WXW={Spring:{rain:4,fog:3,storm:2},Summer:{storm:4,rain:3,fog:1},Autumn:{fog:4,rain:4,storm:2},Winter:{snow:5,fog:3,storm:1,rain:1}};
function spawnWeather(){
  const sea=seasonOf(dayOf(G.clock)).name,w=WXW[sea];let tot=0;for(const k in w)tot+=w[k];let r=Math.random()*tot,type='rain';for(const k in w){r-=w[k];if(r<=0){type=k;break}}
  const T=WX[type],rad=T.r[0]+Math.random()*(T.r[1]-T.r[0]),y=150+Math.random()*700,spd=T.spd[0]+Math.random()*(T.spd[1]-T.spd[0]),ang=Math.atan2(640-y,900+rad)+(Math.random()-0.5)*0.5;
  (G.wx||(G.wx=[])).push({type,x:-rad,y,r:rad,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,seed:Math.random()*100});
}
function wxAt(x,y){let best=null,bd=1;for(const c of (G.wx||[])){const d=Math.hypot(x-c.x,y-c.y)/c.r;if(d<bd){bd=d;best=c}}return best?{c:best,d:bd}:null}
function updateWeather(dt){
  if(!G.wx)G.wx=[];if(G.clock>=(G.wxNext||0)){G.wxNext=G.clock+180+Math.random()*240;if(G.flights>=3)spawnWeather()}
  for(const c of G.wx){c.x+=c.vx*dt;c.y+=c.vy*dt}
  G.wx=G.wx.filter(c=>c.x-c.r<RW+40&&c.y+c.r>-60&&c.y-c.r<RH+60);
  const at=wxAt(900,640);
  if(at){const t=at.c.type;if(t==='fog'&&at.d<0.85)R.fx.fog=Math.max(R.fx.fog,G.clock+1);if(t==='snow'&&at.d<0.85)R.fx.snow=Math.max(R.fx.snow,G.clock+1);
    if(t==='storm'&&at.d<(G.lv.radar?0.3:0.6))R.fx.storm=G.clock+1;if(t==='rain'||t==='storm')R.fx.rain=G.clock+1}
}
function wxForecast(){let best=null;for(const c of (G.wx||[])){const dx=900-c.x,dy=640-c.y,v=Math.hypot(c.vx,c.vy)||1,along=(dx*c.vx+dy*c.vy)/v,perp=Math.abs(dx*c.vy-dy*c.vx)/v;if(along<=0||perp>c.r*0.85)continue;const eta=(along-c.r*0.85)/v;if(eta>0&&(!best||eta<best.eta))best={type:c.type,eta}}return best}
function drawWeatherCells(k){
  const t=performance.now()/1000;
  for(const c of (G.wx||[])){const T=WX[c.type];
    for(let i=0;i<6;i++){const a=c.seed+i*1.1,ox=Math.cos(a)*c.r*0.35,oy=Math.sin(a*1.3)*c.r*0.25,rr=c.r*(0.55+0.1*Math.sin(a*2+t*0.2));const g=ctx.createRadialGradient(c.x+ox,c.y+oy,0,c.x+ox,c.y+oy,rr);g.addColorStop(0,`rgba(${T.col},${T.a})`);g.addColorStop(1,`rgba(${T.col},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(c.x+ox,c.y+oy,rr,0,Math.PI*2);ctx.fill()}
    if(c.type==='rain'||c.type==='storm'){ctx.strokeStyle='rgba(170,195,225,.35)';ctx.lineWidth=Math.max(1,0.8/k);ctx.beginPath();for(let i=0;i<40;i++){const px=c.x+((i*53.7+t*30)%(c.r*1.4))-c.r*0.7,py=c.y+((i*91.3+t*80)%(c.r*1.2))-c.r*0.6;ctx.moveTo(px,py);ctx.lineTo(px-3,py+9)}ctx.stroke()}
    if(c.type==='snow'){ctx.fillStyle='rgba(245,248,252,.7)';for(let i=0;i<50;i++){const px=c.x+((i*53.7+t*12)%(c.r*1.4))-c.r*0.7,py=c.y+((i*91.3+t*20)%(c.r*1.2))-c.r*0.6;ctx.fillRect(px,py,1.8,1.8)}}
    if(c.type==='storm'&&Math.sin(t*3.7+c.seed)>0.985){ctx.strokeStyle='rgba(255,245,200,.9)';ctx.lineWidth=Math.max(1.5,1.5/k);ctx.beginPath();let px=c.x,py=c.y-c.r*0.4;ctx.moveTo(px,py);for(let j=0;j<5;j++){px+=(Math.random()-0.5)*30;py+=c.r*0.16;ctx.lineTo(px,py)}ctx.stroke()}
    if(k>0.3)lblBg(c.type.toUpperCase(),c.x,c.y-c.r*0.6,c.type==='storm'?'#FFC72C':'#CDD4DA',9);
  }
}
function news(t){(G.news||(G.news=[])).unshift({d:dayOf(G.clock),t:hhmm(G.clock),m:t});G.news.length=Math.min(G.news.length,14)}
function regionEvent(){
  const Ls=Object.values(G.lines||{}).filter(L=>!lineDown(L));if(!Ls.length)return false;
  const sea=seasonOf(dayOf(G.clock)).name,dur=m=>G.lv.control?m/2:m,R2=R.fx.line||(R.fx.line={});
  const rails=Ls.filter(L=>['rail','metro','hsr'].includes(L.mode)),trams=Ls.filter(L=>L.mode==='tram'),roads=Ls.filter(L=>MODES[L.mode].kind==='road');
  const opts=[];if(rails.length)opts.push('signal');if(trams.length)opts.push('wire');if(roads.length)opts.push('roadworks');if(sea==='Autumn'&&Ls.some(L=>L.mode==='rail'))opts.push('leaves','leaves');
  if(!opts.length)return false;const ev=pickOf(opts);
  if(ev==='signal'||ev==='wire'){const L=pickOf(ev==='signal'?rails:trams),m=dur(ev==='signal'?60:45),cost=Math.round(40+L.freq*MODES.bus.vh*6*(1+G.level));
    R2[L.id]=G.clock+m;(R.fx.why||(R.fx.why={}))[L.id]=ev==='signal'?'SIGNAL FAILURE':'WIRE FAULT';
    if(pol('repl')&&G.cash>=cost){spend(cost,'transitOps');(R.fx.repl||(R.fx.repl={}))[L.id]=G.clock+m;news(`A ${R.fx.why[L.id].toLowerCase()} hit ${lineCode(L)}: replacement buses ran (${money(cost)}).`)}
    else{repAdj(-2,'stranded');news(`A ${R.fx.why[L.id].toLowerCase()} stopped ${lineCode(L)} for ${m} min.`)}}
  else if(ev==='roadworks'){const L=pickOf(roads),RE=routeEdges(L.mode,L.stops)||[];if(!RE.length)return false;R.fx.roadworks=G.clock+dur(150);R.fx.rwE=pickOf(RE).e.id}
  else if(ev==='leaves'){R.fx.leaves=G.clock+dur(240)}
  regionTick();return true;
}

/* ---------- airport-side vehicles: trams and buses at the terminal ---------- */
function airLines(kind){return Object.values(G.lines||{}).filter(L=>serves(L,'air')&&effKind(L)===kind&&lineFreq(L)>0)}
function vehFreq(kind){let f=0;for(const L of airLines(kind))f+=lineFreq(L);return f}
function vehLine(kind){const c=airLines(kind);return c.length?pickOf(c):null}
function airKind(kind){return Object.values(G.lines||{}).some(L=>serves(L,'air')&&RLBL[MODES[L.mode].kind]===kind)||(G.builds||[]).some(b=>b.stops&&b.stops.includes('air')&&RLBL[MODES[b.mode].kind]===kind)}
function shade(hex,f){const n=parseInt(String(hex).slice(1),16);return `rgb(${Math.round(((n>>16)&255)*f)},${Math.round(((n>>8)&255)*f)},${Math.round((n&255)*f)})`}
const walkersTo=y0=>R.pax.some(p=>p.inbound&&p.state==='exitW'&&Math.abs(p.ty-y0)<8);
const syncKind=k=>Object.values(G.lines||{}).some(L=>L.sync&&serves(L,'air')&&effKind(L)===k);
function updateStopVehicles(dt){
  // trams
  const T=R.tram;const ft=vehFreq('tram');
  if(!ft&&R.tramQ.length){R.tramQ.forEach(p=>walkIn(p,40+Math.random()*260,648+Math.random()*12));R.tramQ=[]}
  if(T.state==='away'){if(ft){T.t-=dt;if(T.t<=0){T.state='in';T.t=0;const L=vehLine('tram');T.secs=3+((L&&L.cars)||0);T.col=L?L.col:'#FF9F43'}}}
  else if(T.state==='in'){T.t+=dt;const k=Math.min(1,T.t/1);T.x=-280+310*(1-Math.pow(1-k,2));if(k>=1){T.state='dwell';T.t=1;R.tramQ.forEach(p=>walkIn(p,T.x+10+Math.random()*200,792));R.tramQ=[]}}
  else if(T.state==='dwell'){T.t-=dt;if(T.t<=0&&syncKind('tram')&&walkersTo(789)&&(T.extra=(T.extra||0)+dt)<3)T.t=0.05;if(T.t<=0){T.state='out';T.t=0;T.extra=0}}
  else if(T.state==='out'){T.t+=dt;const k=Math.min(1,T.t/1);T.x=30-310*k*k;if(k>=1){T.state='away';T.t=Math.max(1.5,60/Math.max(ft,1)-3);T.x=null}}
  // buses, coaches and the water-bus shuttle
  const B=R.bus,fb=vehFreq('bus');
  if(!fb&&R.busQ.length){R.busQ.forEach(p=>walkIn(p,40+Math.random()*260,648+Math.random()*12));R.busQ=[]}
  if(B.state==='away'){if(fb){B.t-=dt;if(B.t<=0){B.state='in';B.t=0;const L=vehLine('bus'),m=L?L.mode:'bus',r=Math.random();B.kind=m==='coach'?'coach':m==='water'?'shuttle':r<0.3?'double':r<0.55+0.2*((L&&L.cars)||0)?'bendy':'single';B.col=L&&!replOn(L.id)?L.col:'#6BE39A';B.len={coach:40,shuttle:30,double:32,bendy:50,single:34}[B.kind]}}}
  else if(B.state==='in'){B.t+=dt;const k=Math.min(1,B.t/1.4);B.x=LAND_R+60-(LAND_R+60-236)*(1-Math.pow(1-k,2));if(k>=1){B.state='dwell';B.t=0.9;R.busQ.forEach(p=>walkIn(p,B.x+Math.random()*B.len,640));R.busQ=[]}}
  else if(B.state==='dwell'){B.t-=dt;if(B.t<=0&&syncKind('bus')&&walkersTo(641)&&(B.extra=(B.extra||0)+dt)<3)B.t=0.05;if(B.t<=0){B.state='out';B.t=0;B.extra=0}}
  else if(B.state==='out'){B.t+=dt;const k=Math.min(1,B.t/0.8);B.x=236-300*k*k;if(k>=1){B.state='away';B.t=Math.max(1.2,60/Math.max(fb,1)-3);B.x=null}}
}
function drawStopVehicles(){
  if(airKind('tram')||R.tram.x!=null){
    ctx.fillStyle='#1B2025';ctx.fillRect(0,776,340,32);ctx.fillStyle='#2A3037';ctx.fillRect(30,778,290,8);ctx.fillStyle='#FF9F43';ctx.fillRect(30,785.5,290,1.2);
    ctx.strokeStyle='#4A545E';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(0,794);ctx.lineTo(336,794);ctx.moveTo(0,802);ctx.lineTo(336,802);ctx.stroke();
    ctx.strokeStyle='rgba(236,232,223,.18)';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(0,788.5);ctx.lineTo(336,788.5);ctx.stroke();
    const T=R.tram;if(T.x!=null){const secs=T.secs||3;for(let c=0;c<secs;c++){const x=T.x+c*(210/secs);ctx.fillStyle=T.col||'#FF9F43';rrect(x,791,210/secs-4,14,4);ctx.fill();ctx.fillStyle='#FFE1BF';for(let w=0;w<Math.floor((210/secs-8)/12);w++)ctx.fillRect(x+6+w*12,794,7,4)}}
    sign(30,764,'TRAM STOP',  '#FF9F43');mono(`${R.tramQ.length} waiting · every ${(60/Math.max(1,vehFreq('tram'))).toFixed(0)} min`,90,774,'#909AA4',9);
  }
  const B=R.bus;
  if(airKind('bus')){
    ctx.strokeStyle='rgba(107,227,154,.5)';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.strokeRect(232,643,48,11);ctx.setLineDash([]);mono('BUS',256,641,'#6BE39A',8,'center');
    if(R.busQ.length)mono(`${R.busQ.length} waiting`,290,652,'#909AA4',8);
  }
  if(B.x!=null){const L2=B.len||34;ctx.fillStyle=B.col||'#6BE39A';if(B.kind==='bendy'){rrect(B.x,644,L2*0.55,10,2.5);ctx.fill();rrect(B.x+L2*0.57,644,L2*0.43,10,2.5);ctx.fill();ctx.fillStyle='#262C33';ctx.fillRect(B.x+L2*0.55,645,L2*0.02+1,8)}else{rrect(B.x,644,L2,10,2.5);ctx.fill()}
    ctx.fillStyle='rgba(20,23,27,.55)';for(let w=0;w<L2/7-1;w++)ctx.fillRect(B.x+4+w*7,646,5,3.5);if(B.kind==='double'){ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(B.x+2,644.5,L2-4,1.2)}if(B.kind==='coach'){ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(B.x+2,652,L2-4,1)}}
}

/* ---------- region map drawing ---------- */
const SEA=[[0,690],[80,725],[180,800],[300,830],[420,852],[560,852],[700,822],[820,802],[905,792],[1000,802],[1150,782],[1300,764],[1450,772],[1600,744],[1600,1000],[0,1000]];
const RIVER=[[470,0],[450,120],[500,240],[470,360],[420,470],[395,560],[372,680],[360,860]];
const MOTORWAYS=[[[0,640],[250,620],[480,605],[600,648],[760,668],[900,660],[1050,662],[1250,620],[1450,520],[1600,470]],[[900,660],[790,520],[600,400],[400,290],[190,170],[0,110]],[[1050,662],[1250,420],[1450,160],[1600,60]]];
let RBLK=null;
function seeded(n){let s=n;return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646}}
function regionBlocks(){
  if(RBLK)return RBLK;RBLK={};const rnd=seeded(7);
  for(const pid in PLACES){const pl=PLACES[pid];if(pl.kind==='air'||pl.kind==='far')continue;
    const max=Math.round(pl.pop*2.2/(pl.kind==='city'?2:1)),arr=[];
    for(let i=0;i<max;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*(18+Math.sqrt(pl.pop*2.2)*(pl.kind==='city'?5.4:4.6));
      let x=pl.x+Math.cos(a)*r,y=pl.y+Math.sin(a)*r*0.8;if(inSea(x,y))continue;
      arr.push({x,y,w:pl.kind==='city'&&r<50?7+rnd()*6:3+rnd()*4,h:pl.kind==='city'&&r<50?6+rnd()*6:3+rnd()*3,r,s:rnd(),lit:rnd()})}
    arr.sort((a,b)=>a.r-b.r);RBLK[pid]=arr}
  return RBLK;
}
function seaY(x){for(let i=1;i<14;i++){const a=SEA[i-1],b=SEA[i];if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/((b[0]-a[0])||1)}return 760}
function inSea(x,y){return y>seaY(x)-4}
function lbl(t,x,y,col,px,align,bold){const k=viewK();ctx.font=`${bold?600:500} ${px/k}px "IBM Plex Mono",monospace`;ctx.fillStyle=col;ctx.textAlign=align||'center';ctx.textBaseline='middle';ctx.fillText(t,x,y)}
function lblBg(t,x,y,col,px,bg){const k=viewK();ctx.font=`600 ${px/k}px "Saira Condensed","Arial Narrow",sans-serif`;const w=ctx.measureText(t).width+8/k,h=(px+6)/k;ctx.fillStyle=bg||'rgba(10,12,15,.8)';ctx.fillRect(x-w/2,y-h/2,w,h);ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,x,y+0.5/k)}
function strokePath(pts,col,w,dash){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([])}
function drawRegion(){
  clampCam();
  const k=viewK(),s=k*R.dpr,cam=R.cam,t=performance.now()/1000,dk=darkness(),minW=1/k;
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0B1117';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(s,0,0,s,-cam.x*s,-cam.y*s);
  ctx.fillStyle='#15191C';ctx.fillRect(0,0,RW,RH);
  {const sn=seasonOf(dayOf(G.clock)).name;ctx.fillStyle=sn==='Winter'?'rgba(215,228,245,.06)':sn==='Autumn'?'rgba(190,120,50,.05)':sn==='Summer'?'rgba(120,170,70,.04)':'rgba(100,170,110,.03)';ctx.fillRect(0,0,RW,RH)}
  // fields and hills
  ctx.strokeStyle='#191E22';ctx.lineWidth=Math.max(1,minW);for(let x=0;x<RW;x+=64){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,RH);ctx.stroke()}for(let y=0;y<RH;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(RW,y);ctx.stroke()}
  ctx.strokeStyle='#20262B';for(let r=0;r<5;r++){ctx.beginPath();ctx.ellipse(1150,300,70+r*38,40+r*24,-0.3,0,Math.PI*2);ctx.stroke()}
  // sea and river
  ctx.fillStyle='#0E1A24';ctx.beginPath();SEA.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();
  strokePath(SEA.slice(0,14),'#1D3444',Math.max(1.5,minW*1.5));
  ctx.lineCap='round';strokePath(RIVER,'#0E1A24',16);strokePath(RIVER,'#16293A',2);ctx.lineCap='butt';
  // motorways and the disused railway
  for(const m of MOTORWAYS){strokePath(m,'#262C33',Math.max(5,3*minW));strokePath(m,'#323A43',Math.max(1,minW),[6,8])}
  drawRoads(k);drawTraffic(k);
  // towns: streets first, then buildings
  for(const pid in PLACES){const pl=PLACES[pid];if(pl.kind==='air'||pl.kind==='far')continue;const rr=(pl.kind==='city'?110:pl.kind==='town'?45:26)*Math.sqrt(clamp(placePop(pid)/pl.pop,1,2.2));
    ctx.strokeStyle='#22282E';ctx.lineWidth=Math.max(1.2,minW);for(let a=0;a<(pl.kind==='city'?10:5);a++){const an=a*Math.PI*2/(pl.kind==='city'?10:5)+pl.x*0.01;ctx.beginPath();ctx.moveTo(pl.x,pl.y);ctx.lineTo(pl.x+Math.cos(an)*rr,pl.y+Math.sin(an)*rr*0.8);ctx.stroke()}
    if(pl.kind==='city'){for(const r2 of [40,80]){ctx.beginPath();ctx.ellipse(pl.x,pl.y,r2,r2*0.8,0,0,Math.PI*2);ctx.stroke()}}}
  const B=regionBlocks();
  for(const pid in B){const pl=PLACES[pid],n=Math.round(B[pid].length*clamp(placePop(pid)/(pl.pop*2.2),0,1)*(pl.kind==='city'?2:1));
    for(let i=0;i<Math.min(n,B[pid].length);i++){const b=B[pid][i];ctx.fillStyle=b.r<40&&pl.kind==='city'?'#48515A':b.s<0.3?'#3A424B':'#323940';ctx.fillRect(b.x,b.y,b.w,b.h);
      if(dk>0.1&&b.lit<0.55){ctx.fillStyle=`rgba(255,214,140,${0.55*dk*2})`;ctx.fillRect(b.x+b.w*0.3,b.y+b.h*0.3,Math.max(1,b.w*0.25),Math.max(1,b.h*0.25))}}}
  {const SB=stationBlocks();for(const n in SB){const c=Math.round(SB[n].length*clamp((G.tod&&G.tod[n])||0,0,1));for(let i=0;i<c;i++){const b=SB[n][i];ctx.fillStyle=b.s<0.4?'#525C66':'#444D56';ctx.fillRect(b.x,b.y,b.w,b.h);if(dk>0.1&&b.lit<0.7){ctx.fillStyle=`rgba(255,220,160,${0.6*dk*2})`;ctx.fillRect(b.x+b.w*0.25,b.y+b.h*0.25,Math.max(1,b.w*0.3),Math.max(1,b.h*0.3))}}}}
  // development sites
  for(const P of PLOTS)if(plotOpen(P))drawPlot(P,t,k);
  // the network: airport, track, lines
  drawRegionAirport(t,k);drawInfra(k);drawBuilds(t,k);drawNetLines(t,k);
  // stops, places and labels
  for(const pid in PLACES){const pl=PLACES[pid];if(pid==='air')continue;
    const big=pl.kind==='city'||pl.kind==='town'||pl.kind==='far';if(!big&&k<0.34)continue;
    const pop=placePop(pid),far=pl.kind==='far',lx=far?pl.x+34:pl.x,ly=pl.y-(pl.kind==='city'?134:pl.kind==='town'?46:28),al=far?'right':'center';lbl(pl.name.toUpperCase(),lx,ly,far?'#909AA4':'#ECE8DF',big?12:10.5,al,true);
    lbl(far?'1.2M people · 140 km ↗':`${num(pop*1000)} people`,lx,ly+14/k,'#6E7883',9.5,al);
  }
  // events on the map
  for(const e of (G.evq||[])){const P=PLOTS.find(p=>p.id===e.plot),dtm=e.at-G.clock;
    if(dtm<240&&dtm>-210){const pulse=(Math.sin(t*3)+1)/2;ctx.strokeStyle=`rgba(255,199,44,${0.4+0.4*pulse})`;ctx.lineWidth=Math.max(2,2*minW);ctx.beginPath();ctx.arc(P.x,P.y,26+pulse*6,0,Math.PI*2);ctx.stroke();
      lblBg(`${EVT[e.type].label.toUpperCase()} · ${hhmm(e.at)} · ${num(e.att)}`,P.x,P.y+40,'#FFC72C',10);
      const n=Math.min(40,Math.round(e.att/1000));for(let i=0;i<n;i++){const a=i*2.4+t*0.3,r=16+(i%5)*3;ctx.fillStyle=i%3?'#ECE8DF':'#FFC72C';ctx.fillRect(P.x+Math.cos(a)*r,P.y+Math.sin(a)*r,1.8,1.8)}}}
  if(dk>0){ctx.fillStyle=`rgba(4,8,22,${dk*0.55})`;ctx.fillRect(0,0,RW,RH)}
  // vehicles on top of the night tint so they stay visible
  drawNetVehicles(k);drawStations(t,k);drawDraft(t,k);
  drawRegionLive(t,k);drawSky(k);drawLowmere(t,k);drawWeatherCells(k);
  if(pol('ads'))lblBg('FIZZCO',910,562,'#FF7A8A',11);
  // compass and scale
  lbl('N ↑',RW-24,RH-20,'#56606A',10);
}
function rPath(pts){const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));return {pts,cum,len:cum[cum.length-1]}}
let ROADP=null;
function destAngle(code){let h=7;for(const c of (code||'XX'))h=(h*31+c.charCodeAt(0))%997;return h/997*Math.PI*2}
function rayBox(x,y,dx,dy){let t=1e9;if(dx>0)t=Math.min(t,(RW-x)/dx);if(dx<0)t=Math.min(t,-x/dx);if(dy>0)t=Math.min(t,(RH-y)/dy);if(dy<0)t=Math.min(t,-y/dy);return t}
function drawSky(k){
  const ax=910,ay=597,sc=Math.max(0.45,0.5/k);
  for(const f of G.fleet){if(f.sold||f.st!=='away'||f.dep==null)continue;
    const tot=Math.max(1,f.back-f.dep),p=(G.clock-f.dep)/tot;if(p<0||p>1)continue;
    const DC=CITY[f.dest],a=DC?(DC.brg-90)*Math.PI/180:destAngle(f.dest),dx=Math.cos(a),dy=Math.sin(a),D=rayBox(ax,ay,dx,dy)+60,leg=Math.min(0.45,30/tot);
    let d,head;if(p<leg){d=p/leg*D;head=a}else if(p>1-leg){d=(1-p)/leg*D;head=a+Math.PI}else continue;
    const x=ax+dx*d,y=ay+dy*d,alt=Math.min(1,d/200);
    ctx.strokeStyle=`rgba(236,232,223,${0.18*alt})`;ctx.lineWidth=Math.max(1,1.2/k);ctx.beginPath();ctx.moveTo(x-Math.cos(head)*60*alt,y-Math.sin(head)*60*alt);ctx.lineTo(x,y);ctx.stroke();
    ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.arc(x+10*alt,y+14*alt,3*sc,0,Math.PI*2);ctx.fill();
    miniPlane(x,y,head,sc*(0.7+0.4*alt));
  }
}
function drawRoads(k){for(const e of EDGES){if(e.water||!e.road||e.road===2)continue;strokePath(e.pts,'#20262C',Math.max(3,2.4/k));strokePath(e.pts,'#2A3138',Math.max(1,0.8/k))}}
function drawTraffic(k){
  if(!ROADP)ROADP=MOTORWAYS.map(rPath);
  const r=R.reg||{cong:0.3,road:40},load=clamp(r.road||40,8,160),spd=38*(1-0.8*r.cong),jam=r.cong>0.6;
  const lorries=devOn('logistics')&&!Object.values(G.lines||{}).some(L=>L.freight),coaches=(r.tour||0)>6,sc=Math.max(1,0.7/k);
  const car=(x,y,ang,col,big,brake)=>{ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(sc,sc);ctx.fillStyle=col;ctx.fillRect(big?-4:-2.2,-1.1,big?8:4.4,2.2);if(brake){ctx.fillStyle='#FF5A5A';ctx.fillRect(big?-4.2:-2.4,-1.1,0.8,2.2)}ctx.restore()};
  const COLS=['#8C97A1','#CDD4DA','#6E7883','#A7A296','#4F6478'];
  // through traffic on the motorways
  ROADP.forEach((P,ri)=>{const n=Math.round(load*(ri===0?0.3:0.18)*P.len/1000);
    for(let i=0;i<n;i++){const dir=i%2?1:-1,jit=0.85+((i*37)%10)/40;let s=(i*P.len/n*1.618+dir*G.clock*spd*jit)%P.len;if(s<0)s+=P.len;
      const [x0,y0,ang]=ptOn(P,s),off=dir*1.7;const big=lorries&&i%6===0?'lorry':coaches&&i%9===0?'coach':null;
      car(x0-Math.sin(ang)*off,y0+Math.cos(ang)*off,ang,big==='lorry'?'#FF9F43':big==='coach'?'#5CC8FF':COLS[i%5],big,jam&&dir>0)}});
  // local drivers: the people your lines don't carry
  if(r.roadF)for(const e of EDGES){if(e.water||!e.road)continue;const f=r.roadF[e.id]||0,ce=(r.ce&&r.ce[e.id])||0,n=Math.min(70,Math.round(f*e.len/5000));if(!n)continue;const v=40*(1-0.85*ce),P=e.P;
    for(let i=0;i<n;i++){const dir=i%2?1:-1,jit=0.85+((i*37)%10)/40;let s=(i*P.len/n*1.618+dir*G.clock*v*jit)%P.len;if(s<0)s+=P.len;const [x0,y0,ang]=ptOn(P,s),off=dir*1.6;
      car(x0-Math.sin(ang)*off,y0+Math.cos(ang)*off,dir>0?ang:ang+Math.PI,lorries&&e.a==='air'&&i%5===0?'#FF9F43':COLS[(i+3)%5],lorries&&e.a==='air'&&i%5===0,ce>0.6)}}
}
function drawFog(x,y,w,h,a){if(!(R.fx.fog>G.clock))return;const t=performance.now()/9000;for(let i=0;i<7;i++){const cx=x+((i*0.23+t*(0.5+i*0.07))%1.2-0.1)*w,cy=y+(0.15+0.12*i)*h,rx=w*0.35,ry=h*0.12;const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rx);g.addColorStop(0,`rgba(205,212,220,${a})`);g.addColorStop(1,'rgba(205,212,220,0)');ctx.fillStyle=g;ctx.save();ctx.translate(cx,cy);ctx.scale(1,ry/rx);ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);ctx.restore();ctx.fill()}}
const SHIPPATH=[[1680,975],[1200,940],[800,925],[450,890],[260,800],[150,748]];let SHIPP=null;
function drawRegionLive(t,k){
  const sc=Math.max(1,0.8/k);
  // noise rings at night
  if(!pol('curfew')&&nightWin()&&G.clock-(R.noiseT||-99)<25){const a=1-(G.clock-R.noiseT)/25,nz=1-0.3*G.lv.insul;for(let r=0;r<3;r++){ctx.strokeStyle=`rgba(255,159,67,${0.35*a*nz*(1-r*0.25)})`;ctx.lineWidth=Math.max(1.5,1.5/k);ctx.beginPath();ctx.ellipse(910,610,90+r*70+((t*40)%70),50+r*38,0,0,Math.PI*2);ctx.stroke()}if(k>0.3)lblBg('NIGHT NOISE',910,520,'#FF9F43',9)}
  // events: ship, crowds
  for(const e of (G.evq||[])){const P=PLOTS.find(p=>p.id===e.plot),dtm=G.clock-e.at;
    if(e.type==='cruise'&&Math.abs(dtm)<320){if(!SHIPP)SHIPP=rPath(SHIPPATH);let u=dtm<-150?(dtm+320)/170:dtm>150?1-(dtm-150)/170:1;u=clamp(u,0,1);const [x,y,ang]=ptOn(SHIPP,SHIPP.len*u);
      ctx.save();ctx.translate(x,y);ctx.rotate(dtm>150?ang:ang+Math.PI);ctx.scale(sc,sc);ctx.fillStyle='#ECE8DF';ctx.beginPath();ctx.moveTo(-34,-7);ctx.lineTo(26,-7);ctx.lineTo(36,0);ctx.lineTo(26,7);ctx.lineTo(-34,7);ctx.closePath();ctx.fill();
      ctx.fillStyle='#5CC8FF';for(let i=0;i<8;i++)ctx.fillRect(-28+i*7,-4,4,2),ctx.fillRect(-28+i*7,2,4,2);ctx.fillStyle='#E5484D';ctx.fillRect(-6,-3,6,6);ctx.restore();
      if(Math.abs(dtm)<150&&k>0.3)lblBg(e.name.toUpperCase(),x,y-18/k,'#ECE8DF',9)}
    const inArr=dtm>-150&&dtm<0,inLeave=dtm>90&&dtm<210;if(!(inArr||inLeave))continue;
    const pid=P.place,v=P.node;if(pid==='air'||!v)continue;
    const N=NODES[v],served=linesAt(v).some(L=>lineFreq(L)>0),live=e.live,n=Math.min(70,Math.round(e.att/600));
    if(served){for(let i=0;i<n;i++){const u=((G.clock*0.03+i/n*3.7)%1),f=inArr?u:1-u,x=N.x+(P.x-N.x)*f+Math.sin(i*7.3)*6,y=N.y+(P.y-N.y)*f+Math.cos(i*5.1)*6;ctx.fillStyle=i%4?'#ECE8DF':'#FFC72C';ctx.fillRect(x,y,2*sc,2*sc)}}
    if(!served||(live&&live.fans&&live.car/live.fans>0.5)){const T=PLACES[pid];ctx.strokeStyle='rgba(255,122,138,.5)';ctx.lineWidth=Math.max(3,3/k);ctx.beginPath();ctx.moveTo(T.x,T.y);ctx.lineTo(P.x,P.y);ctx.stroke();if(k>0.3)lblBg('GRIDLOCK',(T.x+P.x)/2,(T.y+P.y)/2,'#FF7A8A',9)}
  }
  // results banners
  if(R.evDoneFx)R.evDoneFx=R.evDoneFx.filter(f=>G.clock-f.t<150&&SET().pops!=='off');
  for(const f of (R.evDoneFx||[])){const P=PLOTS.find(p=>p.id===f.plot),a=G.clock-f.t;ctx.globalAlpha=clamp(1.5-a/100,0,1);lblBg(f.text,P.x,P.y-40-a*0.15,f.good?'#6BE39A':'#FF7A8A',10);ctx.globalAlpha=1}
  // roadworks cones
  if((R.fx.roadworks||0)>G.clock){const Pp=E_BY[R.fx.rwE]?E_BY[R.fx.rwE].P:(ROADP||(ROADP=MOTORWAYS.map(rPath)))[0],s0=Math.max(0,Pp.len/2-45);for(let i=0;i<10;i++){const [x,y]=ptOn(Pp,s0+i*9);ctx.fillStyle=i%2?'#FF9F43':'#ECE8DF';ctx.beginPath();ctx.moveTo(x,y-4*sc);ctx.lineTo(x+2.5*sc,y+2*sc);ctx.lineTo(x-2.5*sc,y+2*sc);ctx.fill()}const [x,y]=ptOn(Pp,s0+40);if(k>0.3)lblBg('ROADWORKS',x,y-14/k,'#FF9F43',9)}
  // leaves on the line
  if((R.fx.leaves||0)>G.clock){const g=R.ng;if(g)for(const L of Object.values(G.lines||{})){if(L.mode!=='rail'||!g.lines[L.id])continue;const Pp=g.lines[L.id].P;for(let i=0;i<40;i++){const [x,y]=ptOn(Pp,(i*37.7)%Pp.len);ctx.fillStyle=['#C9772E','#A8552A','#D9A066'][i%3];ctx.fillRect(x+Math.sin(i)*5,y+Math.cos(i*1.7)*5,2.4*sc,1.6*sc)}}}
}
/* ---------- the transit map: track, coloured lines side by side, stations and vehicles ---------- */
function netGeom(k){
  const sp=clamp(Math.round(4.8/k),3.4,10),Ls=sortedLines();
  const sig=Ls.map(L=>L.id+L.mode+L.stops.join('')).join('|')+'@'+sp;
  if(R.ng&&R.ng.sig===sig)return R.ng;
  const bund={},REs={};
  for(const L of Ls){const RE=routeEdges(L.mode,L.stops);if(!RE)continue;REs[L.id]=RE;for(const {e} of RE)(bund[e.id]||(bund[e.id]=[])).push(L.id)}
  const g={sig,sp,bund,lines:{},nodeM:{}};
  for(const eid in bund){const e=E_BY[eid];for(const n of [e.a,e.b])g.nodeM[n]=Math.max(g.nodeM[n]||0,bund[eid].length)}
  for(const L of Ls){const RE=REs[L.id];if(!RE)continue;const pts=[],rng=[];
    RE.forEach(({e,rev})=>{const b=bund[e.id],off=(b.indexOf(L.id)-(b.length-1)/2)*sp;let op=offsetPts(e.pts,off);if(rev)op=op.slice().reverse();const i0=pts.length;for(const p of op)pts.push(p);rng.push([i0,pts.length-1])});
    const P=rPath(pts);g.lines[L.id]={P,RE,seg:rng.map(([a,b])=>[P.cum[a],P.cum[b]])}}
  return R.ng=g;
}
let SBLK=null;
function stationBlocks(){
  if(SBLK)return SBLK;SBLK={};const rnd=seeded(11);
  for(const n of NODE_IDS){const N=NODES[n];if(!N.sh||N.far)continue;const arr=[];
    for(let i=0;i<60&&arr.length<34;i++){const a=rnd()*Math.PI*2,r=12+Math.sqrt(rnd())*34,x=N.x+Math.cos(a)*r,y=N.y+Math.sin(a)*r*0.8;if(inSea(x,y))continue;arr.push({x,y,w:4+rnd()*5,h:4+rnd()*5,r,s:rnd(),lit:rnd()})}
    arr.sort((a,b)=>a.r-b.r);SBLK[n]=arr}
  return SBLK;
}
function drawInfra(k){
  const minW=1/k,I=G.infra||{};
  if(!(I['air-ash']&&I['air-ash'].rail))strokePath(E_BY['air-ash'].pts,'#262B30',Math.max(2,minW),[3,5]);
  if(!(I['ash-cas']&&I['ash-cas'].rail))strokePath(E_BY['ash-cas'].pts,'#262B30',Math.max(2,minW),[3,5]);
  for(const eid in I){const e=E_BY[eid],t=I[eid];if(!e)continue;
    if(t.hsr)strokePath(e.pts,'#3C4148',Math.max(4,7*minW));
    if(t.rail){strokePath(e.pts,'#353C44',Math.max(3,6*minW));strokePath(e.pts,'#1C2126',Math.max(1,1.4*minW),[1.4/k,3.2/k])}
    if(t.metro)strokePath(e.pts,'rgba(229,72,77,.16)',Math.max(4,8*minW),[3/k,3/k]);
    if(t.tram){strokePath(e.pts,'#3E454D',Math.max(2,4*minW));strokePath(e.pts,'#20252A',Math.max(0.8,1.2*minW))}
  }
}
function drawBuilds(t,k){
  const minW=1/k;
  for(const b of (G.builds||[])){if(!b.lid)continue;const pr=bprog(b.id);
    const RE=routeEdges(b.mode,b.stops)||[];for(const {e} of RE)if(!(b.track||[]).includes(e.id))strokePath(e.pts,b.col,Math.max(2,2.4*minW),[3/k,5/k]);
    const Es=(b.track||[]).map(id=>E_BY[id]).filter(Boolean),tot=Es.reduce((a,e)=>a+e.len,0);let rem=pr*tot,head=null;
    for(const e of Es){strokePath(e.pts,'rgba(255,199,44,.22)',Math.max(3,4*minW),[5/k,4/k]);if(rem>0){const s=Math.min(e.len,rem);rem-=s;const pts=[];for(let q=0;q<s;q+=6)pts.push(ptOn(e.P,q));pts.push(ptOn(e.P,s));strokePath(pts,'#FFC72C',Math.max(3,4*minW));if(s<e.len)head=ptOn(e.P,s)}}
    if(head){const p=(Math.sin(t*6)+1)/2;ctx.fillStyle='#FFC72C';ctx.beginPath();ctx.arc(head[0],head[1],(3+2*p)/k,0,7);ctx.fill()}
    const mid=Es[Math.floor(Es.length/2)]||(RE[0]&&RE[0].e);if(mid&&k>0.3){const q=ptOn(mid.P,mid.len/2);lblBg(`BUILDING ${MODES[b.mode].L}${b.num} · ${Math.round(pr*100)}%`,q[0],q[1]-12/k,'#FFC72C',9)}}
}
function lineW(L,k,sp){const M=MODES[L.mode];return Math.min(sp*0.82,({road:2.6,water:2.6,track:3.4,rail:3.8}[M.kind]*(L.mode==='metro'||L.mode==='hsr'?1.15:1))/k)}
function drawNetLines(t,k){
  const g=netGeom(k),Ls=sortedLines(),r=R.reg;ctx.lineJoin='round';ctx.lineCap='round';
  for(const L of Ls){const gl=g.lines[L.id];if(gl&&R.regSel===L.id)strokePath(gl.P.pts,'rgba(255,199,44,.32)',g.sp*2.4)}
  // water buses reach the station from its pier
  for(const L of Ls){if(L.mode!=='water')continue;for(const n of [L.stops[0],L.stops[L.stops.length-1],...L.stops]){const N=NODES[n];if(N.pier)strokePath([[N.x,N.y],N.pier],'rgba(236,232,223,.28)',Math.max(1,1.2/k),[2/k,3/k])}}
  for(const L of Ls){const gl=g.lines[L.id];if(!gl)continue;const M=MODES[L.mode],down=lineDown(L),rb=replOn(L.id),col=down?'#56606A':L.col,w=lineW(L,k,g.sp),pts=gl.P.pts;
    if(M.kind==='water')strokePath(pts,col,w,[7/k,5/k]);else if(L.mode==='coach')strokePath(pts,col,w,[10/k,4/k]);else strokePath(pts,col,w);
    if(L.mode==='rail'||L.mode==='hsr')strokePath(pts,'rgba(15,18,22,.55)',Math.max(0.6/k,w*0.24),[2/k,5/k]);
    if(L.mode==='metro')strokePath(pts,'rgba(15,18,22,.55)',w*0.34);
    if(rb)strokePath(pts,'#6BE39A',w*0.5,[4/k,4/k]);
  }
  ctx.lineJoin='miter';ctx.lineCap='butt';
  if(r&&r.over&&k>0.3)for(const key in r.over){if(r.over[key]<=1)continue;const e=E_BY[key.split(':')[0]],m=ptOn(e.P,e.len/2);lblBg('TRACK FULL',m[0],m[1]+14/k,'#FF7A8A',9)}
  for(const L of Ls){const gl=g.lines[L.id];if(!gl)continue;const sel=R.regSel===L.id,down=lineDown(L),rb=replOn(L.id);if(!(k>0.62||sel||down||rb))continue;
    const q=ptOn(gl.P,gl.P.len*(0.22+0.56*((L.num*0.618+MODE_ORDER.indexOf(L.mode)*0.29)%1)));const txt=rb?`${lineCode(L)} · BUSES`:down?`${lineCode(L)} · ${(R.fx.why||{})[L.id]||'STOPPED'}`:lineCode(L);
    lblBg(txt,q[0],q[1]-11/k,down?'#FF7A8A':'#0B0D10',9,down?'rgba(10,12,15,.85)':L.col)}
}
function drawStations(t,k){
  const g=netGeom(k),minW=1/k,r=R.reg,D=R.draft,dk=darkness();
  const served={};for(const L of Object.values(G.lines||{}))for(const n of L.stops)if(serves(L,n))(served[n]||(served[n]=[])).push(L);
  for(const n of NODE_IDS){const N=NODES[n],Ls=served[n]||[],inD=D&&D.stops.includes(n),sel=R.regSel==='node:'+n;
    const m=g.nodeM[n]||1,rad=Math.max(Math.min(5/k,4+4/k),m*g.sp/2+1.4/k);
    if(N.pier&&Ls.some(L=>L.mode==='water')){ctx.fillStyle='#14171B';ctx.strokeStyle='#2BB3A3';ctx.lineWidth=Math.max(1,1.6*minW);ctx.beginPath();ctx.arc(N.pier[0],N.pier[1],4/k,0,7);ctx.fill();ctx.stroke()}
    if(stnUp(n,'pr')){const x0=N.x+rad+4,y0=N.y+rad*0.4;ctx.fillStyle='#1E2429';ctx.fillRect(x0,y0,26,15);for(let q=0;q<12;q++){if((q*7+n.length)%5===0)continue;ctx.fillStyle=['#8C97A1','#CDD4DA','#6E7883','#A7A296'][q%4];ctx.fillRect(x0+2+(q%6)*4,y0+2+Math.floor(q/6)*7,2.6,4.4)}if(k>0.55)lbl('P+R',x0+13,y0+21,'#909AA4',8)}
    if(stnUp(n,'hub')){ctx.fillStyle='#3A424B';rrect(N.x-rad-6,N.y-rad-5,rad*2+12,rad*2+10,4);ctx.fill();ctx.strokeStyle='#5CC8FF';ctx.lineWidth=Math.max(1,1.2*minW);ctx.stroke()}
    if(sel){ctx.strokeStyle='rgba(255,199,44,.8)';ctx.lineWidth=Math.max(2,2.5*minW);ctx.beginPath();ctx.arc(N.x,N.y,rad+5/k,0,7);ctx.stroke()}
    if(Ls.length||inD){ctx.fillStyle='#F4F1EA';ctx.strokeStyle=Ls.length>1?'#0B0D10':Ls.length?Ls[0].col:D.col;ctx.lineWidth=Math.max(1.5,(Ls.length>1?2.6:2.2)*minW);ctx.beginPath();ctx.arc(N.x,N.y,rad,0,7);ctx.fill();ctx.stroke();
      if(Ls.length>1&&k>0.5){ctx.fillStyle='#0B0D10';ctx.beginPath();ctx.arc(N.x,N.y,rad*0.35,0,7);ctx.fill()}}
    else if(n!=='air'){ctx.fillStyle='rgba(20,23,27,.9)';ctx.strokeStyle='rgba(236,232,223,.35)';ctx.lineWidth=Math.max(1,1.2*minW);ctx.beginPath();ctx.arc(N.x,N.y,3.5/k,0,7);ctx.fill();ctx.stroke()}
    // people waiting on the platform
    if(r&&r.lines&&Ls.length){let w=0;for(const L of Ls){const l=r.lines[L.id];if(l&&l.f>0&&l.at[n])w+=l.at[n]*(30/l.f)/60}const dots=Math.min(26,Math.round(w/6));ctx.fillStyle='#ECE8DF';for(let i=0;i<dots;i++){const a=i*2.39,rr=rad+3/k+(i%3)*2.2/k;ctx.fillRect(N.x+Math.cos(a)*rr,N.y+Math.sin(a)*rr,1.8/k,1.8/k)}}
    // station name where a town has several, or the stop is its own place
    const own=N.n!==PLACES[N.pl].name&&n!=='air';if(own&&(Ls.length||inD||k>0.55||(D&&k>0.3)))lbl(N.n,N.x,N.y+rad+9/k,Ls.length?'#ECE8DF':'#909AA4',9.5,'center',Ls.length>0);
  }
}
function drawDraft(t,k){
  const D=R.draft;if(!D)return;const minW=1/k,pulse=(Math.sin(t*4)+1)/2;
  for(const e of EDGES){if(!edgeOK(e,D.mode))continue;const built=hasTrack(e,D.mode);strokePath(e.pts,built?'rgba(236,232,223,.32)':'rgba(236,232,223,.14)',Math.max(2,2.6*minW),built?[]:[5/k,5/k])}
  const RE=routeEdges(D.mode,D.stops)||[];ctx.lineCap='round';
  for(const {e} of RE){const nw=trackOf(D.mode)&&!hasTrack(e,D.mode);strokePath(e.pts,D.col,Math.max(3,4.5*minW),nw?[9/k,6/k]:[])}ctx.lineCap='butt';
  const ends=D.stops.length?[D.stops[0],D.stops[D.stops.length-1]]:null;
  for(const n of NODE_IDS){if(D.stops.includes(n))continue;const ok=ends?ends.some(a=>neighbours(a,D.mode).some(([b])=>b===n)):neighbours(n,D.mode).length>0;if(!ok)continue;
    const N=NODES[n];ctx.strokeStyle=`rgba(255,199,44,${0.45+0.45*pulse})`;ctx.lineWidth=Math.max(2,2.2*minW);ctx.beginPath();ctx.arc(N.x,N.y,(10+4*pulse)/k,0,7);ctx.stroke()}
  D.stops.forEach((n,i)=>{const N=NODES[n],sk=(D.skip||[]).includes(n);ctx.fillStyle=sk?'#262C33':D.col;ctx.beginPath();ctx.arc(N.x,N.y,7.5/k,0,7);ctx.fill();lbl(String(i+1),N.x,N.y+0.5/k,sk?'#909AA4':'#0B0D10',9,'center',true)});
}
function vehS(gl,T,tau){ // where a vehicle is along its line, tau minutes into a forward trip
  const n=T.eT.length;
  for(let i=0;i<n;i++){
    if(tau<T.dep[i]){const a=gl.seg[i-1][1],b=gl.seg[i][0],u=T.dep[i]>T.arr[i]?(tau-T.arr[i])/(T.dep[i]-T.arr[i]):1;return a+(b-a)*clamp(u,0,1)}
    if(tau<T.arr[i+1]){const {e,rev}=gl.RE[i],x=e.extra||0,u=(tau-T.dep[i])/(T.eT[i]||1),d=u*(e.len+x);let f;
      if(!x)f=u;else if(!rev){if(d>e.len)return null;f=d/e.len}else{if(d<x)return null;f=(d-x)/e.len}
      return gl.seg[i][0]+(gl.seg[i][1]-gl.seg[i][0])*f}
  }
  return gl.seg[n-1][1];
}
function drawNetVehicles(k){
  const g=netGeom(k),r=R.reg,sc=Math.max(1,0.75/k);
  for(const L of sortedLines()){const gl=g.lines[L.id],f=lineFreq(L);if(!gl||!f)continue;const T=lineTiming(L);if(!T)continue;
    const rb=replOn(L.id),M=rb?MODES.bus:MODES[L.mode],st=r&&r.lines[L.id],h=60/f,RT=T.RT,n=Math.max(1,Math.ceil(RT/h)),load=st?clamp(st.load,0,1.3):0;
    let off=0;for(const ch of L.id)off=(off*13+ch.charCodeAt(0))%101;
    for(let i=0;i<n;i++){const ph=((G.clock+off+i*h)%(n*h));if(ph>RT)continue;let s,fwd=true;
      if(ph<3)s=gl.seg[0][0];else if(ph<3+T.one)s=vehS(gl,T,ph-3);else if(ph<6+T.one){s=gl.seg[gl.seg.length-1][1];fwd=false}else{s=vehS(gl,T,T.one-(ph-6-T.one));fwd=false}
      if(s==null)continue;const [x,y,a0]=ptOn(gl.P,s),ang=fwd?a0:a0+Math.PI;
      ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(sc,sc);const len=M.len*(1+0.25*(L.cars||0))*(M===MODES.bus&&i%3===0?1.35:1),w=M.kind==='water'?6:4.4,col=rb?'#6BE39A':L.col;
      if(M.kind==='water'){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(-len/2,-w/2);ctx.lineTo(len/2-3,-w/2);ctx.lineTo(len/2+2,0);ctx.lineTo(len/2-3,w/2);ctx.lineTo(-len/2,w/2);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(-len/2-8,-0.6,7,1.2)}
      else{const cars=M===MODES.bus||M===MODES.coach?1:L.mode==='tram'?3:L.mode==='hsr'?5:4,cl=len/cars,sh=i%3===1?'rgba(255,255,255,.18)':i%3===2?'rgba(0,0,0,.18)':null;
        for(let c=0;c<cars;c++){ctx.fillStyle=col;rrect(-len/2+c*cl+0.4,-w/2,cl-0.8,w,1.2);ctx.fill();if(sh){ctx.fillStyle=sh;ctx.fillRect(-len/2+c*cl+0.4,-w/2,cl-0.8,w*0.45)}}
        if(M===MODES.bus&&i%3===1){ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(-len/2+1,-w/2+0.5,len-2,1)}
        if(M===MODES.bus&&i%3===0){ctx.fillStyle='#262C33';ctx.fillRect(-0.6,-w/2,1.2,w)}
        if(!rb&&L.mode==='hsr'){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(len/2,-w/2);ctx.lineTo(len/2+5,0);ctx.lineTo(len/2,w/2);ctx.closePath();ctx.fill();ctx.fillStyle='#E5484D';ctx.fillRect(-len/2,-0.4,len,0.8)}
        else if(!rb&&L.mode==='rail'){ctx.fillStyle='#FFC72C';ctx.fillRect(len/2-1.6,-w/2,1.6,w)}
        else if(!rb&&L.mode==='metro'){ctx.fillStyle='#ECE8DF';ctx.fillRect(len/2-1,-w/2+0.6,1,w-1.2)}}
      ctx.fillStyle=load>1?'#FF7A8A':'rgba(20,23,27,.75)';ctx.fillRect(-len/2+1.5,-0.9,(len-3)*Math.min(1,load),1.8);
      ctx.restore()}}
}
function drawRegionAirport(t,k){
  const x0=780,minW=1/k;
  ctx.fillStyle='#1B2025';rrect(760,576,300,100,8);ctx.fill();
  ctx.fillStyle='#262C33';ctx.fillRect(x0,592,270,11);if(G.lv.runway2)ctx.fillRect(x0+18,612,240,9);
  ctx.strokeStyle='rgba(236,232,223,.4)';ctx.lineWidth=Math.max(0.7,minW*0.7);ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(x0+6,597.5);ctx.lineTo(x0+264,597.5);if(G.lv.runway2){ctx.moveTo(x0+24,616.5);ctx.lineTo(x0+252,616.5)}ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#39414A';ctx.fillRect(840,634,130,14);const nb=builtCount();
  for(let i=0;i<Math.min(4,nb);i++){ctx.fillStyle='#2F363E';ctx.fillRect(850+i*28,626,5,10);ctx.fillStyle='#CDD4DA';ctx.fillRect(846+i*28,622,12,3)}
  if(G.pierB){ctx.fillStyle='#39414A';ctx.fillRect(972,626,70,10);for(let i=0;i<Math.max(0,nb-4);i++){ctx.fillStyle='#CDD4DA';ctx.fillRect(978+i*16,620,10,3)}}
  if(G.lv.rail){ctx.fillStyle='#C39BFF';ctx.fillRect(880,650,40,4)}
  if(Object.values(G.lines||{}).some(L=>L.mode==='water'&&serves(L,'air'))||(G.builds||[]).some(b=>b.mode==='water'&&b.stops&&b.stops.includes('air'))){strokePath([[905,660],[905,806]],'#39414A',Math.max(3,2*minW));ctx.fillStyle='#39414A';ctx.fillRect(895,800,20,8)}
  for(let r=0;r<2;r++){const a=R.rwy.act[r];if(!a)continue;const kk=a.t/a.dur,y=r?616:597;let x,alt;
    if(a.type==='arr'){x=x0+320-kk*300;alt=Math.max(0,1-kk/0.4)*30}else{x=x0+260-kk*kk*420;alt=Math.max(0,(kk-0.5)/0.5)*40}
    miniPlane(x,y-alt,Math.PI,0.45+alt/120)}
  lblBg(`${(G.name||'Northwind').toUpperCase()} AIRPORT`,910,690,'#FFC72C',11);
}
function drawPlot(P,t,k){
  const id=G.dev&&G.dev[P.id],b=buildOf('dev:'+P.id),x=P.x,y=P.y,minW=1/k,sel=R.regSel==='plot:'+P.id;
  if(sel){ctx.strokeStyle='rgba(255,199,44,.6)';ctx.lineWidth=Math.max(2,2*minW);ctx.beginPath();ctx.arc(x,y,34,0,Math.PI*2);ctx.stroke()}
  if(!id&&!b){ctx.strokeStyle='rgba(236,232,223,.22)';ctx.lineWidth=Math.max(1,minW);ctx.setLineDash([3,3]);ctx.strokeRect(x-18,y-14,36,28);ctx.setLineDash([]);if(k>0.75||sel)lbl('+ '+P.name.toUpperCase(),x,y+24,'#6E7883',9);return}
  if(b){ctx.fillStyle='rgba(255,199,44,.12)';ctx.fillRect(x-20,y-16,40,32);ctx.strokeStyle='#FFC72C';ctx.lineWidth=Math.max(1,minW);ctx.setLineDash([4,3]);ctx.strokeRect(x-20,y-16,40,32);ctx.setLineDash([]);ctx.fillStyle='#FFC72C';ctx.fillRect(x-20,y+18,40*bprog(b.id),3);
    ctx.save();ctx.translate(x+14,y-16);ctx.rotate(0.2*Math.sin(t));ctx.fillStyle='#FFC72C';ctx.fillRect(-1,0,2,-24);ctx.fillRect(-12,-24,20,2);ctx.restore();if(k>0.3)lbl(DEV[b.opt].name.toUpperCase(),x,y+30,'#FFC72C',9);return}
  const dk=darkness(),glow=a=>`rgba(255,214,140,${a*(0.3+dk)})`;
  switch(id){
    case 'stadium':ctx.fillStyle='#3A424B';ctx.beginPath();ctx.ellipse(x,y,26,18,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2E6B45';ctx.fillRect(x-14,y-8,28,16);ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=0.6;ctx.strokeRect(x-14,y-8,28,16);ctx.beginPath();ctx.moveTo(x,y-8);ctx.lineTo(x,y+8);ctx.stroke();for(const s of [-1,1])for(const u of [-1,1]){ctx.fillStyle='#ECE8DF';ctx.fillRect(x+s*24-1,y+u*16-6,2,6)}break;
    case 'cruise':ctx.fillStyle='#39414A';ctx.fillRect(x-20,y-6,30,12);ctx.fillRect(x+6,y+4,6,40);ctx.fillRect(x-4,y+6,6,44);break;
    case 'flats':case 'estate':case 'castlehomes':{const n=id==='flats'?6:12;for(let i=0;i<n;i++){ctx.fillStyle=id==='flats'?'#4A545E':'#3A424B';const bx=x-18+(i%(id==='flats'?3:4))*(id==='flats'?13:10),by=y-12+Math.floor(i/(id==='flats'?3:4))*(id==='flats'?14:9);ctx.fillRect(bx,by,id==='flats'?9:7,id==='flats'?12:6);ctx.fillStyle=glow(0.7);ctx.fillRect(bx+2,by+2,2,2)}}break;
    case 'bizpark':case 'techcampus':for(let i=0;i<(id==='techcampus'?5:4);i++){ctx.fillStyle='#2F4A63';ctx.fillRect(x-20+i*10,y-14+(i%2)*8,8,18);ctx.fillStyle='#5CC8FF';ctx.globalAlpha=0.4;ctx.fillRect(x-19+i*10,y-12+(i%2)*8,6,2);ctx.globalAlpha=1}if(id==='techcampus'){ctx.strokeStyle='#5CC8FF';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y+14,12,0,Math.PI*2);ctx.stroke()}break;
    case 'conference':ctx.fillStyle='#4A545E';ctx.beginPath();ctx.moveTo(x-22,y+10);ctx.quadraticCurveTo(x,y-24,x+22,y+10);ctx.closePath();ctx.fill();ctx.fillStyle=glow(0.6);ctx.fillRect(x-10,y+4,20,3);break;
    case 'logistics':for(let i=0;i<3;i++){ctx.fillStyle='#3F474F';ctx.fillRect(x-22,y-14+i*10,40,7)}{const lx=x-22+((t*12)%50);ctx.fillStyle='#FF9F43';ctx.fillRect(lx,y+18,6,3)}break;
    case 'hotels':for(let i=0;i<3;i++){ctx.fillStyle='#39414A';ctx.fillRect(x-16+i*12,y-20+i*3,9,30-i*3);for(let j=0;j<5;j++){ctx.fillStyle=glow(0.8);ctx.fillRect(x-14+i*12,y-17+i*3+j*5,5,1.5)}}break;
    case 'retail':case 'outlet':ctx.fillStyle='#4F5963';ctx.fillRect(x-20,y-12,40,12);ctx.fillStyle='#262C33';for(let i=0;i<12;i++)ctx.fillRect(x-20+(i%6)*7,y+4+Math.floor(i/6)*6,5,4);ctx.fillStyle=id==='outlet'?'#B8A1FF':'#FFC72C';ctx.fillRect(x-20,y-12,40,2);break;
    case 'uni':ctx.fillStyle='#4A545E';ctx.fillRect(x-20,y-16,40,6);ctx.fillRect(x-20,y+10,40,6);ctx.fillRect(x-20,y-16,6,32);ctx.fillRect(x+14,y-16,6,32);ctx.fillStyle='#2E6B45';ctx.fillRect(x-12,y-8,24,16);ctx.fillStyle='#ECE8DF';ctx.fillRect(x-1,y-24,2,8);break;
    case 'themepark':{ctx.strokeStyle='#E5484D';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x-6,y-2,14,0,Math.PI*2);ctx.stroke();for(let i=0;i<8;i++){const a=t*0.4+i*Math.PI/4;ctx.beginPath();ctx.moveTo(x-6,y-2);ctx.lineTo(x-6+Math.cos(a)*14,y-2+Math.sin(a)*14);ctx.stroke();ctx.fillStyle=['#FFC72C','#5CC8FF','#6BE39A'][i%3];ctx.fillRect(x-7+Math.cos(a)*14,y-3+Math.sin(a)*14,3,3)}
      ctx.strokeStyle='#FF9F43';ctx.beginPath();ctx.moveTo(x+6,y+14);ctx.bezierCurveTo(x+14,y-20,x+22,y+20,x+30,y-6);ctx.stroke();}break;
    case 'studios':for(let i=0;i<3;i++){ctx.fillStyle='#39414A';ctx.fillRect(x-22+i*15,y-12,13,24);ctx.fillStyle='#262C33';ctx.fillRect(x-22+i*15,y-12,13,3)}break;
    case 'reserve':for(let i=0;i<14;i++){ctx.fillStyle=i%2?'#2E6B45':'#3C7F52';ctx.beginPath();ctx.arc(x-18+(i*11)%36,y-12+Math.floor(i/4)*8,4.5,0,Math.PI*2);ctx.fill()}break;
    case 'wind':for(let i=0;i<8;i++){const wx=x-50+(i%4)*32,wy=y-20+Math.floor(i/4)*26;ctx.fillStyle='#CDD4DA';ctx.fillRect(wx-0.6,wy,1.2,12);ctx.strokeStyle='#ECE8DF';ctx.lineWidth=1;for(let bl=0;bl<3;bl++){const a=t*2+i+bl*2.094;ctx.beginPath();ctx.moveTo(wx,wy);ctx.lineTo(wx+Math.cos(a)*7,wy+Math.sin(a)*7);ctx.stroke()}}break;
    case 'marina':ctx.strokeStyle='#4A545E';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,22,Math.PI,0);ctx.stroke();for(let i=0;i<9;i++){ctx.fillStyle='#ECE8DF';ctx.fillRect(x-16+(i%5)*8,y-6+Math.floor(i/5)*8,5,2)}break;
    case 'arena':ctx.fillStyle='#4A545E';ctx.beginPath();ctx.arc(x,y,17,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#B8A1FF';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle=glow(0.5);ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();break;
    case 'oldtown':ctx.fillStyle='#5A5145';ctx.fillRect(x-8,y-6,16,16);ctx.beginPath();ctx.moveTo(x-4,y-6);ctx.lineTo(x,y-30);ctx.lineTo(x+4,y-6);ctx.fill();for(let i=0;i<6;i++){ctx.fillStyle='#4A4237';ctx.fillRect(x-22+i*8,y+12,6,5)}break;
    case 'ringroad':ctx.strokeStyle='#4A545E';ctx.lineWidth=Math.max(4,3*minW);ctx.beginPath();ctx.ellipse(400,560,150,120,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='rgba(236,232,223,.3)';ctx.lineWidth=Math.max(0.8,0.7*minW);ctx.setLineDash([6,6]);ctx.stroke();ctx.setLineDash([]);break;
    case 'lowtraffic':ctx.fillStyle='rgba(107,227,154,.07)';ctx.beginPath();ctx.ellipse(400,560,90,70,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(107,227,154,.45)';ctx.lineWidth=Math.max(1.2,minW);ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);break;
  }
  if(k>0.75||sel)lbl(DEV[id].name.toUpperCase(),id==='ringroad'||id==='lowtraffic'?x:x,y+(id==='wind'?30:28),'#909AA4',9);
}

/* ---------- view switching, camera and taps ---------- */
function setView(v){
  if(R.view===v)return;const cams=R.cams||(R.cams={});cams[R.view]=R.cam;R.view=v;
  const c=cams[v]||(cams[v]={x:0,y:0,z:v==='airport'?1:0.01,tx:null,ty:null});R.cam=c;if(v!=='airport'&&!c.init&&R.sw>1){c.init=1;c.z=zMin();c.x=0;c.y=0}
  clampCam();renderCam();$('#viewb').classList.toggle('on',v==='region');{const wb=$('#worldb');if(wb)wb.classList.toggle('on',v==='world')}$('#viewb').setAttribute('aria-label',v==='region'?'Show the airport':'Show the region');$('#viewb').title=v==='region'?'Back to the airport (R)':'Region map (R)';
}
function regionFocus(pid){const c=R.cam;if(pid==='all'){c.z=zMin();c.tx=0;c.ty=0;return}const pl=PLACES[pid]||PLOTS.find(p=>p.id===pid);c.z=Math.max(c.z,zMin()*2.2);const k=viewK();c.tx=pl.x-R.sw/k/2;c.ty=pl.y-R.sh/k/2;const b=camBounds(),vw=R.sw/k,vh=R.sh/k;c.tx=clamp(c.tx,b.x0,Math.max(b.x0,b.x1-vw));c.ty=clamp(c.ty,b.y0,Math.max(b.y0,b.y1-vh))}
function nearestNode(wx,wy,r){let best=null,bd=r;for(const n of NODE_IDS){const N=NODES[n];let d=Math.hypot(wx-N.x,wy-N.y);if(N.pier)d=Math.min(d,Math.hypot(wx-N.pier[0],wy-N.pier[1]));if(d<bd){bd=d;best=n}}return best}
function showCard(id){requestAnimationFrame(()=>{const el=document.getElementById(id);if(el)el.scrollIntoView({block:'start',behavior:REDUCED?'auto':'smooth'})})}
function regionTap(wx,wy){
  const k=viewK(),rr=Math.max(14,20/k);
  if(R.draft){const n=nearestNode(wx,wy,rr*1.5);if(n)draftTap(n);return}
  const open=()=>{R.regSub='lines';if(G.tab!=='region')setTab('region');else renderPanel()};
  const n=nearestNode(wx,wy,rr);
  if(n){R.regSel='node:'+n;open();showCard('node-'+n);return}
  const g=R.ng;let best=null,bd=Math.max(10,12/k);if(g)for(const id in g.lines){const d=distToPath(g.lines[id].P,wx,wy);if(d<bd){bd=d;best=id}}
  if(best){R.regSel=best;open();showCard('line-'+best);return}
  let bp=null,bpd=34;for(const P of PLOTS){if(!plotOpen(P))continue;const d=Math.hypot(wx-P.x,wy-P.y);if(d<bpd){bpd=d;bp=P}}
  if(bp){R.regSel='plot:'+bp.id;R.regSub='sites';if(G.tab!=='region')setTab('region');else renderPanel();showCard('plot-'+bp.id);return}
  if(Math.hypot(wx-900,wy-630)<80){setView('airport');setTab(G.tab==='region'?'stands':G.tab);return}
  if(R.regSel){R.regSel=null;if(G.tab==='region')renderPanel()}
}
/* ---------- drafting a line: pick a mode, tap stations ---------- */
function draftCol(mode){const M=MODES[mode];return M.cols[(nextNum(mode)-1)%M.cols.length]}
function startDraft(from){
  let m=R.lastMode&&MODES[R.lastMode]&&has('mode:'+R.lastMode)?R.lastMode:'bus';
  if(from&&!neighbours(from,m).length)m=MODE_ORDER.find(x=>has('mode:'+x)&&neighbours(from,x).length)||m;
  R.draft={mode:m,stops:from&&neighbours(from,m).length?[from]:[],skip:[],edit:null,col:draftCol(m)};R.regSel=null;R.regSub='lines';
  if(R.view!=='region')setView('region');if(isPhone()&&!document.body.classList.contains('fs'))setSheetSnap(1);
  renderPanel();$('#panel').scrollTop=0;
}
function setDraftMode(m){const D=R.draft;if(!D||!has('mode:'+m))return;R.lastMode=m;D.mode=m;D.col=draftCol(m);D.skip=[];
  if(!routeEdges(m,D.stops))D.stops=D.stops.length&&neighbours(D.stops[0],m).length?[D.stops[0]]:[]}
function draftTap(n){
  const D=R.draft,st=D.stops,M=MODES[D.mode],name=NODES[n].n;
  if(!st.length){if(!neighbours(n,D.mode).length){toast(`${M.name} lines can’t reach ${name}.`,null,null,'warn',4);return}st.push(n)}
  else if(n===st[st.length-1])st.pop();
  else if(n===st[0])st.shift();
  else if(st.includes(n)){const i=D.skip.indexOf(n);if(i>=0)D.skip.splice(i,1);else D.skip.push(n)}
  else{const av=new Set(st),pe=modePath(st[st.length-1],n,D.mode,av),ps=modePath(st[0],n,D.mode,av);
    if(!pe&&!ps){toast(`No ${M.name.toLowerCase()} route to ${name} from here.`,null,null,'warn',4);return}
    if(pe&&(!ps||pathLen(pe,D.mode)<=pathLen(ps,D.mode)))st.push(...pe.slice(1));else st.unshift(...ps.slice(1).reverse())}
  D.skip=D.skip.filter(x=>st.slice(1,-1).includes(x));tick();
  if(G.tab!=='region')setTab('region');else renderPanel();
}

/* ---------- the Region tab ---------- */
function regionPanel(){
  const r=R.reg||{lines:{},T:0,share:0,cong:0.3,jobs:0,tour:0,rev:0,ops:0,riders:0};const sub=R.regSub||'lines';
  let h=`<div class="segs" role="tablist">${[['lines','Transport'],['sites','Development'],['overview','Overview']].map(([id,n])=>`<button class="chip${sub===id?' on':''}" data-rsub="${id}">${n}</button>`).join('')}</div>`;
  if(sub==='lines'){
    const Ls=sortedLines();
    if(Ls.length){const p=r.rev-r.ops;h+=`<div class="report"><b>${num(r.riders)}</b> riders/h · <b>${Math.round(r.share*100)}%</b> of flyers · demand <b>+${Math.round(r.T*100)}%</b> · profit <b style="color:${p<0?'var(--bad)':'var(--good)'}">${money(p)}</b>/h</div>`}
    else h+=`<p class="note">Draw lines between stations. Links to the airport bring flyers; links between towns carry commuters and ease traffic.</p>`;
    if(!R.draft)h+=transportRecs();
    h+=R.draft?draftCard():`<button class="buy newline" data-newline="">+ New line</button>`;
    const sn=R.regSel&&R.regSel.startsWith('node:')?R.regSel.slice(5):null;if(sn&&NODES[sn]&&!R.draft)h+=stationCard(sn,r);
    for(const b of (G.builds||[]))if(b.lid&&!b.edit)h+=buildCard(b);
    for(const L of Ls)h+=lineCard(L,r);
    const lm=MODE_ORDER.filter(m=>!has('mode:'+m)).length;if(lm)h+=`<p class="note soon">${lm} more kind${lm>1?'s':''} of transport in the <button class="linkb" data-plan="1">Masterplan</button>.</p>`;
    h+=upSection('region');
  } else if(sub==='sites'){
    h+=`<p class="note">One build per site. They feed each other: homes need transport, jobs grow towns, crowds need trams.</p>`;
    for(const P of PLOTS)if(plotOpen(P))h+=plotCard(P,r);
    const hp=PLOTS.filter(P=>!plotOpen(P)).length;if(hp)h+=`<p class="note soon">${hp} more site${hp>1?'s':''} in the <button class="linkb" data-plan="1">Masterplan</button>.</p>`;
  } else {
    const popSum=Object.keys(PLACES).filter(p=>PLACES[p].kind!=='far'&&p!=='air').reduce((a,p)=>a+placePop(p),0);
    const bar=(v,col)=>`<div class="prog"><i style="width:${clamp(v,0,1)*100}%;background:${col}"></i></div>`;
    const nSt=NODE_IDS.filter(n=>linesAt(n).length).length;
    h+=`<div class="sec">The region</div><table class="fin">
      <tr><td>People living nearby</td><td>${num(popSum*1000)}</td></tr>
      <tr><td>Jobs created</td><td>${num(r.jobs*1000)}</td></tr>
      <tr><td>Stations with a service</td><td>${nSt} of ${NODE_IDS.length}</td></tr>
      <tr><td>Local trips by public transport</td><td>${Math.round((r.mshare||0)*100)}%</td></tr>
      <tr><td>Demand from public transport</td><td>+${Math.round(r.T*100)}%</td></tr>
      <tr><td>Business-city demand, from jobs</td><td>+${Math.round((r.biz||0)*100)}%</td></tr>
      <tr><td>Holiday-city demand, from tourism</td><td>+${Math.round((r.leis||0)*100)}%</td></tr>
      <tr><td>Staff wages, as staff ride to work</td><td>${Math.round(((r.wageMul||1)-1)*100)}%</td></tr>
      <tr><td>Development rents</td><td>${money(r.income||0)}/h</td></tr></table>`;
    {const fc=wxForecast(),on=wxAt(900,640);h+=`<div class="sec">Weather</div><div class="report">${on?`<b>${on.c.type}</b> over the airport now.`:'Clear at the airport.'} ${fc?`Next: <b>${fc.type}</b> in about <b>${Math.round(fc.eta)} min</b>.`:'Nothing heading this way.'} ${(G.wx||[]).length} weather system${(G.wx||[]).length===1?'':'s'} on the map.</div>`}
    h+=`<div class="sec">Traffic<span>${r.cong<0.35?'flowing':r.cong<0.6?'busy':r.cong<0.8?'congested':'gridlocked'}</span></div>${bar(r.cong,r.cong>0.75?'var(--bad)':r.cong>0.5?'var(--sign)':'var(--good)')}<p class="note">Everyone who doesn’t ride, drives. Jams slow buses, cut demand up to 12% and, when gridlocked, your rating.</p>`;
    const up=(G.evq||[]).slice().sort((a,b)=>a.at-b.at);
    h+=`<div class="sec">Coming up</div>`+(up.length?up.map(e=>`<div class="report"><b>${EVT[e.type].label}</b> · ${e.name} · day ${dayOf(e.at)} at <b>${hhmm(e.at)}</b> · about ${num(e.att)}</div>`).join(''):`<div class="report">Nothing booked. A stadium, cruise terminal, conference centre, arena or film studio adds events.</div>`);
    const towns=Object.keys(PLACES).filter(p=>p!=='air'&&PLACES[p].kind!=='far');
    h+=`<div class="sec">Towns</div><table class="fin">${towns.map(p=>{const pp=placePop(p),g=pp-PLACES[p].pop;return `<tr><td>${PLACES[p].name}</td><td>${num(pp*1000)}${g>=0.5?` <span style="color:var(--good)">+${num(g*1000)}</span>`:''}</td></tr>`}).join('')}</table>`;
  }
  return h;
}
function stopChips(stops,skip,attr){
  return `<div class="stops">${stops.map((n,i)=>{const mid=i>0&&i<stops.length-1,sk=(skip||[]).includes(n);return (i?'<span class="arr">›</span>':'')+(attr?attr(n,i,mid,sk):`<span class="chip static">${NODES[n].n}</span>`)}).join('')}</div>`;
}
function draftCard(){
  const D=R.draft,M=MODES[D.mode],edit=D.edit&&G.lines[D.edit],q=lineQuote(D.mode,D.stops,D.edit),code=edit?lineCode(edit):M.L+nextNum(D.mode);
  let h=`<div class="lcard draft" id="draft"><div class="lh"><span class="lbadge" style="--c:${D.col}">${code}</span><div><div class="rt">${edit?'Edit '+code:'New '+M.name.toLowerCase()+' line'}</div><div class="rd">${D.stops.length?'Tap stations to extend it. Tap an end to drop it.':'Tap a station on the map to start.'}</div></div><button class="chip" data-dcancel="">Cancel</button></div>`;
  if(!edit)h+=`<div class="chips">${MODE_ORDER.filter(m=>has('mode:'+m)).map(m=>`<button class="chip${m===D.mode?' on':''}" data-dmode="${m}">${MODES[m].name}</button>`).join('')}</div><div class="rd" style="margin:7px 0 2px">${M.desc} ${M.cap} seats · ${money(M.fare)} a ride${trackOf(D.mode)&&D.mode!=='water'?' · lays its own track':''}.</div>`;
  if(D.stops.length)h+=stopChips(D.stops,D.skip,(n,i,mid,sk)=>`<button class="chip${sk?' skip':''}" ${mid?`data-dskip="${n}" title="${sk?'Stop here':'Skip this stop'}"`:`data-dend="${i?'end':'start'}" title="Remove"`}>${NODES[n].n}${mid?'':' ×'}</button>`);
  const sug=edit?[]:(SUGGEST[D.mode]||[]).filter(s=>!Object.values(G.lines||{}).some(L=>L.mode===D.mode&&L.stops.join()===s.join())&&!modeLocked(D.mode,s)).slice(0,4);
  if(sug.length&&D.stops.length<2)h+=`<div class="rd" style="margin-top:8px">Ideas</div><div class="chips" style="margin-top:4px">${sug.map(s=>`<button class="chip" data-dsug="${s.join(',')}">${s.map(n=>NODES[n].n).join(' › ')}</button>`).join('')}</div>`;
  if(D.stops.length>=2){
    const parts=[];if(!edit)parts.push(`${M.name==='Bus'?'Buses':M.name==='Coach'?'Coaches':M.name+'s'} ${money(M.fix)}`);if(q.track.length)parts.push(`${q.track.length} new track section${q.track.length>1?'s':''} ${money(q.tcost)}`);else if(trackOf(D.mode))parts.push('track already laid');
    h+=`<div class="report">${parts.join(' · ')} · about <b>${q.ride} min</b> end to end · ${q.mins?`<b>${Math.round(q.mins/60*10)/10} h</b> to build`:'ready at once'}</div>`;
    if(q.why)h+=`<div class="rd" style="color:var(--bad);margin-top:6px">${q.why}</div>`;
    h+=`<div style="margin-top:8px;display:flex;justify-content:flex-end"><button class="buy" data-dgo="" ${q.ok?`data-cost="${q.cost}"`:'disabled'}>${edit&&!q.cost?'Save route':'Build '+money(q.cost)}</button></div>`;
  }
  return h+`</div>`;
}
function stationCard(n,r){
  const N=NODES[n],Ls=linesAt(n),pl=PLACES[N.pl],b=Math.round((r.boardAt&&r.boardAt[n])||0),g=r.GT&&r.GT[n]?r.GT[n].air:null;
  const who=N.far?'1.2M people, 140 km away':n==='air'?'Your terminal':n==='ano'?'Airport jobs and the north site':`${num(nodePop(n)*1000)} people nearby`;
  let h=`<div class="lcard sel" id="node-${n}"><div class="lh"><span class="lsw" style="background:#F4F1EA"></span><div><div class="rt">${N.n}${N.n!==pl.name&&n!=='air'&&n!=='ano'?` <small style="color:var(--muted);font-weight:500">${pl.name}</small>`:''}</div><div class="rd">${who} · ${num(b)} boarding/h</div></div><button class="chip" data-nclose="" aria-label="Close">✕</button></div>`;
  h+=Ls.length?`<div class="chips">${Ls.map(L=>`<button class="lbadge sm" style="--c:${L.col}" data-lsel="${L.id}" title="${lineName(L)}">${lineCode(L)}</button>`).join('')}</div>`:`<div class="rd">No lines call here yet.</div>`;
  if(n!=='air')h+=`<div class="rd" style="margin-top:6px">${g!=null?`To the airport: about <b>${Math.round(g)} min</b> door to door, waits and changes included.`:'No public transport to the airport yet.'}</div>`;
  const ups=Object.entries(STN_UP).filter(([k,u])=>has('stn:'+k)&&!N.far&&!(k==='pr'&&(n==='air'||n==='ano')));
  if(ups.length&&Ls.length)h+=`<div class="opts" style="margin-top:6px">${ups.map(([k,u])=>`<div class="opt"><div><div class="rt">${u.name}${stnUp(n,k)?' <span class="live">✓</span>':''}</div><div class="rd">${u.desc}</div></div>${stnUp(n,k)?'<button class="buy chipd" disabled>Built</button>':`<button class="buy" data-supg="${n}:${k}" data-cost="${u.cost}">${money(u.cost)}</button>`}</div>`).join('')}</div>`;
  h+=`<div style="margin-top:8px"><button class="buy ghost" data-newline="${n}">New line from here</button></div>`;
  return h+`</div>`;
}
function buildCard(b){const M=MODES[b.mode];return `<div class="lcard" id="line-${b.lid}"><div class="lh"><span class="lbadge" style="--c:${b.col}">${M.L}${b.num}</span><div><div class="rt">${NODES[b.stops[0]].n} – ${NODES[b.stops[b.stops.length-1]].n}</div><div class="rd">${M.name} · ${Math.ceil(b.done-G.clock)} min to go</div></div><span class="pill" style="--c:var(--sign)">BUILDING</span></div><div class="prog"><i style="width:${bprog(b.id)*100}%;background:var(--sign)"></i></div></div>`}
function lineCard(L,r){
  const M=MODES[L.mode],st=r.lines[L.id],sel=R.regSel===L.id,down=lineDown(L),eb=buildOf('line:'+L.id);
  let pill=null;if(replOn(L.id))pill=['BUSES','var(--good)'];else if(down)pill=['STOPPED','var(--bad)'];else if(eb)pill=['EXTENDING','var(--sign)'];else if(st&&st.f===0)pill=['NO SERVICE','var(--muted)'];else if(st&&st.load>1)pill=['FULL','var(--bad)'];else if(st&&st.load>0.85)pill=['BUSY','var(--sign)'];
  let h=`<div class="lcard${sel?' sel':''}" id="line-${L.id}"><button class="lhb" data-lsel="${L.id}" aria-expanded="${sel}"><span class="lbadge" style="--c:${L.col}">${lineCode(L)}</span><div><div class="rt">${lineName(L)}</div><div class="rd">${M.name} · every ${Math.round(60/L.freq)} min${st?` · ${num(st.riders)} riders/h`:''}</div></div>${pill?`<span class="pill" style="--c:${pill[1]}">${pill[0]}</span>`:`<span class="chev">${sel?'⌃':'⌄'}</span>`}</button>`;
  if(!sel)return h+`</div>`;
  if(eb)h+=`<div class="rd">Extending to ${lineName({stops:eb.stops})} · ${Math.ceil(eb.done-G.clock)} min to go.</div><div class="prog"><i style="width:${bprog(eb.id)*100}%;background:var(--sign)"></i></div>`;
  if(st){const profit=st.rev-st.ops;
    h+=`<div class="lstats"><div><b>${num(st.riders)}</b><span>riders/h</span></div><div><b>${num(st.fly)}</b><span>flyers/h</span></div><div><b style="color:${st.load>1?'var(--bad)':st.load>0.85?'var(--sign)':''}">${Math.round(st.load*100)}%</b><span>full</span></div><div><b>${Math.round(st.one)}</b><span>min trip</span></div><div><b style="color:${profit<0?'var(--bad)':'var(--good)'}">${money(profit)}</b><span>profit/h</span></div></div>`;
    h+=`<div class="prog"><i style="width:${clamp(st.load,0,1)*100}%;background:${st.load>1?'var(--bad)':L.col}"></i></div>`}
  h+=stopChips(L.stops,L.skip,(n,i,mid,sk)=>mid?`<button class="chip${sk?' skip':''}" data-lskip="${L.id}:${n}" title="${sk?'Stop here':'Skip this stop'}">${NODES[n].n}</button>`:`<span class="chip static">${NODES[n].n}</span>`);
  if(L.stops.length>2)h+=`<div class="rd">Tap a middle stop to skip it: quicker trips, but no riders there.</div>`;
  const fi=M.freqs.indexOf(L.freq),full=(routeEdges(L.mode,L.stops)||[]).some(({e})=>trackOf(L.mode)&&r.over&&(r.over[e.id+':'+L.mode]||0)>1);
  h+=`<div class="lrowc"><span class="rt">Every ${Math.round(60/L.freq)} min</span><div class="lever"><button data-lfreq="${L.id}:-1" aria-label="Fewer services" ${fi<=0?'disabled':''}>−</button><output>${L.freq}/h</output><button data-lfreq="${L.id}:1" aria-label="More services" ${fi>=M.freqs.length-1?'disabled':''}>+</button></div></div>`;
  if(SET().autoLines)h+=L.man?`<div class="rd">You set this line’s timetable. <button class="linkb" data-lauto="${L.id}">Hand it back to the manager</button></div>`:`<div class="rd">The transport manager sets how often it runs. Change it to take over.</div>`;
  if(full)h+=`<div class="rd" style="color:var(--bad)">Shared track is full, so every line on it runs slower.</div>`;
  h+=`<div class="lrowc"><span class="rt">Fares</span><div class="chips">${['Cheap','Standard','Premium'].map((n,i)=>`<button class="chip${(L.fare??1)===i?' on':''}" data-lfare="${L.id}:${i}">${n} <small>${money(M.fare*[0.7,1,1.5][i])}</small></button>`).join('')}</div></div>`;
  const tg=[];if(serves(L,'air'))tg.push(['sync','Meet flights','Waits for arriving flights: flyers wait half as long. Running +10%.']);tg.push(['night','Night service','Runs all night at half frequency']);if(L.mode==='rail'&&G.lv.cargo&&serves(L,'air'))tg.push(['freight','Freight paths','One path an hour carries cargo: +15% cargo']);
  h+=`<div class="chips" style="margin:6px 0">${tg.map(([k,n,t])=>`<button class="chip${L[k]?' on':''}" data-ltog="${L.id}:${k}" title="${t}">${L[k]?'✓ ':''}${n}</button>`).join('')}</div>`;
  const cc=carsCost(L);
  h+=`<div class="opt"><div><div class="rt">${L.mode==='bus'||L.mode==='coach'?'Bigger vehicles':'Longer '+(L.mode==='water'?'boats':L.mode==='tram'?'trams':'trains')} ${pips(L.cars||0,2)}</div><div class="rd">+50% seats each step, +35% running cost.</div></div>${(L.cars||0)<2?`<button class="buy" data-lcars="${L.id}" data-cost="${cc}">${money(cc)}</button>`:'<button class="buy chipd" disabled>Max</button>'}</div>`;
  h+=`<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="buy ghost" data-ledit="${L.id}" ${eb?'disabled':''}>Edit route</button><button class="buy sell" data-lclose="${L.id}">Close line</button></div>`;
  return h+`</div>`;
}
function plotCard(P,r){
  const id=G.dev[P.id],b=buildOf('dev:'+P.id);
  let h=`<div class="lcard${R.regSel==='plot:'+P.id?' sel':''}" id="plot-${P.id}"><div class="lh"><span class="lsw" style="background:${id?'var(--good)':b?'var(--sign)':'#3A424B'}"></span><div><div class="rt">${P.name}</div><div class="rd">${PLACES[P.place].name}</div></div>${id?`<span class="pill" style="--c:var(--good)">BUILT</span>`:b?`<span class="pill" style="--c:var(--sign)">BUILDING</span>`:''}</div>`;
  const fx=d=>{const o=[];if(d.pop)o.push(`+${d.pop}k people`);if(d.jobs)o.push(`+${d.jobs}k jobs`);if(d.tour)o.push(`tourism +${d.tour}`);if(d.cong>0)o.push(`traffic +${d.cong}`);if(d.cong<0)o.push(`traffic ${d.cong}`);if(d.income)o.push(`rent ${money(d.income)}/h`);if(d.upk)o.push(`costs ${money(d.upk)}/h`);if(d.ev)o.push(`${EVT[d.ev].label.toLowerCase()}s`);return o.join(' · ')};
  if(id){const d=DEV[id];h+=`<div class="rt" style="margin-top:6px">${d.name}</div><div class="rd">${d.desc}</div><div class="rd" style="margin-top:4px;color:var(--muted)">${fx(d)}</div>`;
    const nx=(G.evq||[]).find(e=>e.plot===P.id);if(nx)h+=`<div class="report">Next: <b>${nx.name}</b>, day ${dayOf(nx.at)} at <b>${hhmm(nx.at)}</b>, about ${num(nx.att)}.</div>`;
    h+=`<div style="margin-top:8px"><button class="buy sell" data-ddemo="${P.id}">Knock it down</button></div>`}
  else if(b){h+=`<div class="rd">Building the ${DEV[b.opt].name.toLowerCase()} · ${Math.ceil(b.done-G.clock)} min left.</div><div class="prog"><i style="width:${bprog(b.id)*100}%;background:var(--sign)"></i></div>`}
  else h+=`<div class="opts">`+P.opts.filter(o=>has('dev:'+o)).map(o=>{const d=DEV[o],lk=false;return `<div class="opt${lk?' lockd':''}"><div><div class="rt">${d.name}</div><div class="rd">${d.desc}</div><div class="rd" style="color:var(--muted);font-size:12px;margin-top:2px">${fx(d)} · ${Math.round(buildMins(d.build)/60*10)/10} h to build</div></div>${lk?`<button class="buy" disabled>Level ${d.lvl+1}</button>`:`<button class="buy" data-dbuild="${P.id}:${o}" data-cost="${d.cost}">${money(d.cost)}</button>`}</div>`}).join('')+`</div>`;
  return h+`</div>`;
}
function regionClick(d,b){
  const re=()=>{renderPanel();save()};
  if(d.rsub){R.regSub=d.rsub;renderPanel();$('#panel').scrollTop=0;return true}
  if(d.newline!=null){startDraft(d.newline||null);return true}
  if(d.dcancel!=null){R.draft=null;renderPanel();return true}
  if(d.dmode){setDraftMode(d.dmode);renderPanel();return true}
  if(d.dskip){const s=R.draft.skip,i=s.indexOf(d.dskip);if(i>=0)s.splice(i,1);else s.push(d.dskip);renderPanel();return true}
  if(d.dend){const D=R.draft;if(d.dend==='end')D.stops.pop();else D.stops.shift();D.skip=D.skip.filter(x=>D.stops.slice(1,-1).includes(x));renderPanel();return true}
  if(d.dsug){R.draft.stops=d.dsug.split(',');R.draft.skip=[];renderPanel();return true}
  if(d.dgo!=null){const D=R.draft;if(orderLine(D.mode,D.stops,D.skip,D.edit)){R.regSel=D.edit||null;R.draft=null;re();if(R.regSel)showCard('line-'+R.regSel)}return true}
  if(d.lsel){R.regSel=R.regSel===d.lsel&&b.classList.contains('lhb')?null:d.lsel;renderPanel();if(R.regSel)showCard('line-'+R.regSel);return true}
  if(d.nclose!=null){R.regSel=null;renderPanel();return true}
  if(d.supg){const [n,k]=d.supg.split(':'),u=STN_UP[k];if(u&&!stnUp(n,k)&&buy(u.cost)){(G.stn||(G.stn={}))[n]=Object.assign(G.stn[n]||{},{[k]:1});regionTick();re();toast(`${u.name} open at ${NODES[n].n}.`,null,null,'goal',4)}return true}
  if(d.lfreq){const [c,dv]=d.lfreq.split(':'),L=G.lines[c],fq=MODES[L.mode].freqs;L.man=true;L.freq=fq[clamp(fq.indexOf(L.freq)+(+dv),0,fq.length-1)];regionTick();re();return true}
  if(d.lfare){const [c,i]=d.lfare.split(':');G.lines[c].fare=+i;regionTick();re();return true}
  if(d.ltog){const [c,k]=d.ltog.split(':');G.lines[c][k]=!G.lines[c][k];if(k==='night')G.lines[c].man=true;regionTick();re();return true}
  if(d.lskip){const [c,n]=d.lskip.split(':'),L=G.lines[c],s=L.skip||(L.skip=[]),i=s.indexOf(n);if(i>=0)s.splice(i,1);else s.push(n);R.ng=null;regionTick();re();return true}
  if(d.lcars){const L=G.lines[d.lcars],cc=carsCost(L);if((L.cars||0)<2&&buy(cc)){L.cars=(L.cars||0)+1;regionTick();re()}return true}
  if(d.ledit){const L=G.lines[d.ledit];R.draft={mode:L.mode,stops:L.stops.slice(),skip:(L.skip||[]).slice(),edit:L.id,col:L.col};R.regSel=null;if(R.view!=='region')setView('region');renderPanel();$('#panel').scrollTop=0;return true}
  if(d.lclose){const key='close'+d.lclose;if(!(R.armKey===key&&Date.now()-R.armT<3000)){R.armKey=key;R.armT=Date.now();b.textContent='Tap to confirm';b.classList.add('arm');return true}R.armKey=null;closeLine(d.lclose);re();return true}
  if(d.dbuild){const [p,o]=d.dbuild.split(':');if(buildDev(p,o)){R.regSel='plot:'+p;re()}return true}
  if(d.ddemo){const key='demo'+d.ddemo;if(!(R.armKey===key&&Date.now()-R.armT<3000)){R.armKey=key;R.armT=Date.now();b.textContent='Tap to confirm';b.classList.add('arm');return true}R.armKey=null;delete G.dev[d.ddemo];G.evq=(G.evq||[]).filter(e=>e.plot!==d.ddemo);regionTick();re();return true}
  return false;
}
const plotOpen=P=>!!(G.dev&&G.dev[P.id])||isBuilding('dev:'+P.id)||P.opts.some(o=>has('dev:'+o));
function regionAffordable(){
  let n=0;
  outer:for(const m of MODE_ORDER){if(!has('mode:'+m))continue;for(const s of (SUGGEST[m]||[])){
    if(Object.values(G.lines||{}).some(L=>L.mode===m&&s.every(x=>L.stops.includes(x)))||(G.builds||[]).some(b=>b.lid&&b.mode===m&&s.every(x=>b.stops.includes(x))))continue;
    const q=lineQuote(m,s,null);if(q.ok&&G.cash>=q.cost){n=1;break outer}}}
  for(const P of PLOTS){if(!G.dev[P.id]&&!isBuilding('dev:'+P.id)&&P.opts.some(o=>has('dev:'+o)&&G.cash>=DEV[o].cost))n++}
  return n;
}

/* ================= ROUTES: the world map and your network of cities ================= */
const WW=1500,WH=1060,WCX=750,WCY=530,RING=[120,230,320,410,485],WSX=1.45;
const cityXY=C=>{const a=C.brg*Math.PI/180,r=RING[C.tier];return [WCX+Math.sin(a)*r*WSX,WCY-Math.cos(a)*r]};
function arcCtl(C){const [x,y]=cityXY(C),dx=x-WCX,dy=y-WCY;return [WCX+dx/2-dy*0.16,WCY+dy/2+dx*0.16,x,y]}
function arcPt(C,u){const [cx,cy,x,y]=arcCtl(C),v=1-u;return [v*v*WCX+2*v*u*cx+u*u*x,v*v*WCY+2*v*u*cy+u*u*y,Math.atan2(2*v*(cy-WCY)+2*u*(y-cy),2*v*(cx-WCX)+2*u*(x-cx))]}
const lfCol=lf=>lf>=0.8?'#6BE39A':lf>=0.55?'#FFC72C':'#FF7A8A';
const cityVisible=C=>has('rt:'+C.tier)||routeOpen(C.code);
function profileOf(C){return (C.biz>=0.5?'Business':C.biz<=0.2?'Leisure':'Mixed')+(C.sea==='summer'?' · busy in summer':C.sea==='wsun'?' · winter sun':C.sea==='ski'?' · busy in winter':'')+(GROUP_CITIES.has(C.code)?' · groups':'')}
function drawWorld(){
  clampCam();
  const k=viewK(),s=k*R.dpr,cam=R.cam,t=performance.now()/1000,ls=clamp(Math.min(R.sw,R.sh*1.7)/1150,0.9,1.4),px=v=>v*ls/k,lb=(a,b,c,d,e,f,g)=>lbl(a,b,c,d,e*ls,f,g);
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0A0E13';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(s,0,0,s,-cam.x*s,-cam.y*s);
  const gl=ctx.createRadialGradient(WCX,WCY,0,WCX,WCY,560);gl.addColorStop(0,'rgba(255,199,44,.07)');gl.addColorStop(1,'rgba(255,199,44,0)');ctx.fillStyle=gl;ctx.fillRect(0,0,WW,WH);
  // compass spokes and haul rings
  ctx.strokeStyle='rgba(144,154,164,.06)';ctx.lineWidth=px(1);ctx.beginPath();for(let a=0;a<360;a+=30){const r=a*Math.PI/180;ctx.moveTo(WCX,WCY);ctx.lineTo(WCX+Math.sin(r)*RING[4]*WSX*1.03,WCY-Math.cos(r)*RING[4]*1.03)}ctx.stroke();
  for(let tr=0;tr<5;tr++){const op=has('rt:'+tr);ctx.strokeStyle=op?'rgba(144,154,164,.26)':'rgba(144,154,164,.08)';ctx.lineWidth=px(1);ctx.setLineDash([px(3),px(5)]);ctx.beginPath();ctx.ellipse(WCX,WCY,RING[tr]*WSX,RING[tr],0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    if(op&&(tr===0?RING[0]:RING[tr]-RING[tr-1])*k>=38){const a=246*Math.PI/180;lb(`${RT_NAMES[tr].toUpperCase()} · ${Math.round(TRIP[tr]/6)/10} H`,WCX+Math.sin(a)*RING[tr]*WSX+px(4),WCY-Math.cos(a)*RING[tr],'#4A535C',8.5,'left')}}
  lb('N',WCX,WCY-RING[4]-px(14),'#56606A',10,'center',true);
  // routes, coloured by how full recent flights were
  for(const c in (G.routes||{})){const C=CITY[c];if(!C)continue;const rs=rsOf(c),[cx,cy,x,y]=arcCtl(C),lf=rs.tn?rs.lf:paxLF(c),sel=R.wSel===c;
    ctx.strokeStyle=lfCol(lf);ctx.globalAlpha=sel?0.95:0.5;ctx.lineWidth=px(Math.min(5,1.3+rs.n/6)+(sel?1:0));ctx.beginPath();ctx.moveTo(WCX,WCY);ctx.quadraticCurveTo(cx,cy,x,y);ctx.stroke();
    // passengers waiting to fly: dots drifting along the route
    const n=Math.min(6,Math.round(cityMarket(c)/400));ctx.fillStyle=lfCol(lf);for(let j=0;j<n;j++){const u=((t*0.05+j/n+C.brg/360)%1),q=arcPt(C,u);ctx.globalAlpha=0.5*Math.sin(u*Math.PI);ctx.beginPath();ctx.arc(q[0],q[1],px(1.4),0,Math.PI*2);ctx.fill()}
    ctx.globalAlpha=1}
  // cities
  for(const C of Object.values(CITY)){if(!cityVisible(C))continue;const [x,y]=cityXY(C),op=routeOpen(C.code),sel=R.wSel===C.code,r=px(2.2+C.size*0.75);
    if(sel){ctx.strokeStyle='#FFC72C';ctx.lineWidth=px(1.6);ctx.beginPath();ctx.arc(x,y,r+px(5),0,Math.PI*2);ctx.stroke()}
    ctx.fillStyle=op?'#ECE8DF':'#14191F';ctx.strokeStyle=op?'#ECE8DF':'#6E7883';ctx.lineWidth=px(1.2);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
    const a=C.brg*Math.PI/180,sx=Math.sin(a),out=px(9)+r,lx=x+sx*out,ly=y-Math.cos(a)*out,al=sx>0.35?'left':sx<-0.35?'right':'center',nm=k>0.42||sel;
    lb(C.code,lx,ly-(nm?px(5):0),op?'#ECE8DF':'#6E7883',nm?10:9.5,al,true);if(nm)lb(C.name,lx,ly+px(6),op?'#909AA4':'#56606A',9,al)}
  // your planes in the air
  const sc=Math.max(0.3,px(15)/28);
  for(const f of G.fleet){if(f.sold||f.st!=='away'||f.dep==null)continue;const C=CITY[f.dest];if(!C)continue;const tot=Math.max(1,f.back-f.dep),p=clamp((G.clock-f.dep)/tot,0,1),out=p<0.5,u=out?p*2:2-p*2,q=arcPt(C,clamp(u,0.001,0.999));
    const lt=f.late&&!out;miniPlane(q[0],q[1],out?q[2]:q[2]+Math.PI,sc,1,lt?'#FF7A8A':null);if(lt)lb(`+${f.late}m`,q[0],q[1]-px(11),'#FF7A8A',8.5,'center',true)}
  drawRivalWorld(t,px,lb);
  // home
  ctx.fillStyle='#FFC72C';ctx.beginPath();ctx.arc(WCX,WCY,px(6),0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,199,44,.35)';ctx.lineWidth=px(1.5);ctx.beginPath();ctx.arc(WCX,WCY,px(10+3*Math.sin(t*2)),0,Math.PI*2);ctx.stroke();
  lblBg((G.name||'Northwind').toUpperCase(),WCX,WCY+px(20),'#FFC72C',11*ls);
}
function worldTap(wx,wy){
  const k=viewK();let best=null,bd=Math.max(26/k,18);
  for(const C of Object.values(CITY)){if(!cityVisible(C))continue;const [x,y]=cityXY(C),d=Math.hypot(wx-x,wy-y);if(d<bd){bd=d;best=C.code}}
  if(!best){if(R.wSel){R.wSel=null;if(G.tab==='routes')renderPanel()}return}
  R.wSel=best;R.rSub=routeOpen(best)?'mine':'new';if(G.tab!=='routes')setTab('routes');else renderPanel();showCard('route-'+best);
}
function worldFocus(which){const c=R.cam;if(which==='near'){c.z=Math.max(zMin()*1.9,zMin());const k=viewK();c.tx=WCX-R.sw/k/2;c.ty=WCY-R.sh/k/2}else{c.z=zMin();c.tx=0;c.ty=0}}
function routeCard(c){
  const C=CITY[c],rs=rsOf(c),mk=cityMarket(c),f=routeFareIx(c),lf=rs.tn?rs.lf:null,prof=rs.v-(rs.c||0),sel=R.wSel===c;
  return `<div class="lcard rcard${sel?' sel':''}" id="route-${c}"><div class="sh"><div><span class="gate">${c}</span><span class="rt">${C.name}</span></div><button class="buy ghost" data-rlook="${c}" style="min-width:0">Map</button></div>
    <div class="rd" style="margin-top:2px">${RT_NAMES[C.tier]} · ${profileOf(C)}</div>
    <div class="lstats fl4" style="grid-template-columns:repeat(4,minmax(0,1fr))"><div><b>${rs.n.toFixed(rs.n<10?1:0)}</b><span>flights/day</span></div><div><b>${num(rs.p)}</b><span>flyers/day</span></div><div><b style="color:${lf!=null?lfCol(lf):''}">${lf!=null?Math.round(lf*100)+'%':'–'}</b><span>full</span></div><div><b style="color:${prof<0?'var(--bad)':''}">${money(prof)}</b><span>profit/day</span></div></div>
    <div class="rd">Market <b>${num(mk)}</b> seats a day. You flew <b>${num(rs.s)}</b>.${rs.s>mk*1.05?' More flights will fly emptier.':rs.s<mk*0.6?' Room for more flights.':''}</div><div class="prog"><i style="width:${clamp(rs.s/Math.max(1,mk),0,1)*100}%;background:${rs.s>mk*1.05?'var(--bad)':'var(--good)'}"></i></div>
    ${rivalRouteLine(c)}
    <div class="field"><span class="lbl">Fares</span><div class="chips">${['−20%','Standard','+25%'].map((n,k)=>`<button class="chip${f===k?' on':''}" data-rfare="${c}:${k}">${n}</button>`).join('')}</div></div>
    ${SET().autoFares?(G.routes[c].man?`<div class="rd">You set these fares. <button class="linkb" data-rauto="${c}">Hand them back to the manager</button></div>`:`<div class="rd">The route manager sets the fare that earns most.</div>`):''}
    ${has('feat:promo')?(promoOn(c)?`<div class="rd">Promotion running until ${hhmm(G.routes[c].promo)}: more people want to fly.</div>`:`<div class="chips" style="margin-top:8px"><button class="chip" data-rpromo="${c}" data-cost="${promoCost(c)}">Promote for a day <small>${money(promoCost(c))}</small></button></div>`):''}
  </div>`;
}
function routesPanel(){
  const sub=R.rSub||'mine',open=Object.keys(G.routes||{}).filter(c=>CITY[c]),unl=[0,1,2,3,4].filter(t=>has('rt:'+t));
  const fresh=CITIES.filter(c=>unl.includes(c[2])&&!routeOpen(c[0])).length;
  let h=segs('rSub',[['mine',`Your routes · ${open.length}`],['new',`New routes${fresh?' · '+fresh:''}`]]);
  if(sub==='mine'){
    let n=0,p=0,v=0,c=0,sw=0,lw=0;for(const k of open){const rs=rsOf(k);n+=rs.n;p+=rs.p;v+=rs.v;c+=rs.c||0;if(rs.tn){sw+=rs.lf*rs.n;lw+=rs.n}}
    h+=`<div class="lstats fl4" style="grid-template-columns:repeat(4,minmax(0,1fr))"><div><b>${Math.round(n)}</b><span>flights/day</span></div><div><b>${num(p)}</b><span>flyers/day</span></div><div><b>${lw?Math.round(sw/lw*100)+'%':'–'}</b><span>full</span></div><div><b>${money(v-c)}</b><span>profit/day</span></div></div>`;
    h+=routeRecs();h+=rivalPanel();
    h+=`<p class="note">Your planes fly wherever they earn most, within their range. Each city has a market: fly more seats than it wants and flights go out emptier.</p>`;
    const ord=open.slice().sort((a,b)=>CITY[a].tier-CITY[b].tier||cityMarket(b)-cityMarket(a));let tr=-1;
    for(const k of ord){if(CITY[k].tier!==tr){tr=CITY[k].tier;h+=`<div class="sec">${RT_NAMES[tr]}<span>${Math.round(TRIP[tr]/6)/10} h return</span></div>`}h+=routeCard(k)}
  }else{
    h+=`<p class="note">A new route adds a new market for your planes to fill. Bigger cities want more seats; business cities pay more but fill less off-peak.</p>`;
    for(const t of unl){const cs=CITIES.filter(c=>c[2]===t&&!routeOpen(c[0]));if(!cs.length)continue;
      h+=`<div class="sec">${RT_NAMES[t]}<span>${money(ROUTE_FEE[t])} to open · ${Math.round(TRIP[t]/6)/10} h</span></div>`;
      h+=cs.sort((a,b)=>cityMarket(b[0])-cityMarket(a[0])).map(([cc])=>{const C=CITY[cc];return `<div class="row${R.wSel===cc?' sel':''}" id="route-${cc}">${svg('globe')}<div><div class="rt">${C.name} <span class="live">${cc}</span></div><div class="rd">${profileOf(C)} · market ${num(cityMarket(cc))} seats a day</div></div><button class="buy" data-ropen="${cc}" data-cost="${ROUTE_FEE[t]}">${money(ROUTE_FEE[t])}</button></div>`}).join('')}
    const locked=[0,1,2,3,4].filter(t=>!has('rt:'+t));
    if(locked.length)h+=`<p class="note soon">${locked.map(t=>RT_NAMES[t].toLowerCase()).join(', ').replace(/^./,x=>x.toUpperCase())} routes are in the <button class="linkb" data-plan="1">Masterplan</button>.</p>`;
  }
  return h;
}
function routesClick(d){
  if(d.ropen){if(openRoute(d.ropen)){R.wSel=d.ropen;R.rSub='mine';renderPanel();showCard('route-'+d.ropen);save()}return true}
  if(d.rfare){const [c,k]=d.rfare.split(':');if(G.routes[c]){G.routes[c].f=+k;G.routes[c].man=true;renderPanel();save()}return true}
  if(d.rpromo){if(promoteRoute(d.rpromo)){renderPanel();save()}return true}
  if(d.rlook){R.wSel=d.rlook;if(R.view!=='world')setView('world');const C=CITY[d.rlook],[x,y]=cityXY(C),c=R.cam;c.z=Math.max(c.z,zMin()*1.6);const k=viewK();c.tx=x-R.sw/k/2;c.ty=y-R.sh/k/2;renderPanel();return true}
  return false;
}
/* ================= managers and recommendations: help for players who'd rather not tune everything ================= */
// the transport manager: samples each line through the day, then retimes it every six hours
function mgrSample(reg){if(isNight())return;const A=R.mgr||(R.mgr={});for(const id in reg.lines){const l=reg.lines[id];if(!l.f)continue;const a=A[id]||(A[id]={n:0,load:0,rev:0,ops:0});a.n++;a.load+=l.baseLoad;a.rev+=l.rev;a.ops+=l.ops}}
function managersTick(){
  const A=R.mgr||{};R.mgr={};
  if(SET().autoLines)for(const L of Object.values(G.lines||{})){if(L.man||lineDown(L))continue;const a=A[L.id];if(!a||a.n<3)continue;const load=a.load/a.n,fq=MODES[L.mode].freqs,fi=fq.indexOf(L.freq);
    if(load>0.85&&fi>=0&&fi<fq.length-1)L.freq=fq[fi+1];else if(load<0.3&&a.rev<a.ops&&fi>0)L.freq=fq[fi-1];
    if(!L.night&&(['tram','rail','metro'].includes(L.mode)||(serves(L,'air')&&R.reg&&R.reg.share>0.08)))L.night=true}
  if(SET().autoFares)for(const c in (G.routes||{})){const r=G.routes[c];if(r.man||!CITY[c])continue;if(rsOf(c).n<1)continue;const b=bestFare(c),f=r.f??1;if(b!==f)r.f=f+Math.sign(b-f)}
  if(!R.sim&&(G.tab==='region'||G.tab==='routes'))renderPanel();
}
// what a change would do to the network, measured by running the region model with it and without it
function evalRegion(mutate){
  const keep={reg:R.reg,bs:R.boardSum,bn:R.boardN,ng:R.ng,lines:G.lines,stn:G.stn,lv:G.lv,clock:G.clock,live:(G.evq||[]).map(e=>e.live)};
  const out={tp:0,T:0,cong:0,rid:0,fly:0,wage:0},hrs=[9,17.5];R.evalMode=true;
  try{G.lines=JSON.parse(JSON.stringify(keep.lines));G.stn=JSON.parse(JSON.stringify(keep.stn||{}));G.lv=Object.assign({},keep.lv);mutate&&mutate();
    for(const h of hrs){G.clock=Math.floor(keep.clock/1440)*1440+h*60;R.reg=keep.reg;R.ng=null;regionTick();const r=R.reg;out.tp+=(r.rev-r.ops)/hrs.length;out.T+=r.T/hrs.length;out.cong+=r.cong/hrs.length;out.rid+=r.riders/hrs.length;out.fly+=r.flyers/hrs.length;out.wage+=r.wageMul/hrs.length}}
  finally{Object.assign(G,{lines:keep.lines,stn:keep.stn,lv:keep.lv,clock:keep.clock});R.reg=keep.reg;R.boardSum=keep.bs;R.boardN=keep.bn;R.ng=keep.ng;(G.evq||[]).forEach((e,i)=>e.live=keep.live[i]);R.evalMode=false}
  return out;
}
const tempLine=(mode,stops)=>{const M=MODES[mode];return {id:'Lrec',mode,stops,skip:[],freq:M.freqs[Math.min(1,M.freqs.length-1)],fare:1,night:false,sync:false,cars:0,freight:false,num:nextNum(mode),col:M.cols[(nextNum(mode)-1)%M.cols.length]}};
function recValue(b,a){ // money an hour the change is worth: transit profit, busier flights, cheaper staff
  const air=Math.max(20,(G.rate||0)*60*0.7),dem=((1+a.T)*(1-0.12*a.cong))/((1+b.T)*(1-0.12*b.cong))-1,wage=wageBill()*((b.wage-a.wage)/(b.wage||1));
  return {v:(a.tp-b.tp)+air*dem+wage,dem,dt:a.tp-b.tp,cong:a.cong-b.cong,rid:a.rid-b.rid}}
function computeTransitRecs(){
  const base=evalRegion(null),cands=[];
  const same=(m,st)=>Object.values(G.lines||{}).some(L=>L.mode===m&&st.every(x=>L.stops.includes(x))&&L.stops.length<=st.length+1)||(G.builds||[]).some(b=>b.lid&&b.mode===m&&st.every(x=>b.stops.includes(x)));
  for(const m of MODE_ORDER){if(!has('mode:'+m))continue;for(const st of (SUGGEST[m]||[])){if(same(m,st))continue;const q=lineQuote(m,st,null);if(!q.ok)continue;cands.push({kind:'line',mode:m,stops:st,cost:q.cost,mins:q.mins})}}
  for(const n of NODE_IDS){const N=NODES[n],Ls=linesAt(n);if(!Ls.length||N.far)continue;
    if(has('stn:pr')&&n!=='air'&&n!=='ano'&&!stnUp(n,'pr'))cands.push({kind:'stn',n,k:'pr',cost:STN_UP.pr.cost});
    if(has('stn:hub')&&Ls.length>=2&&!stnUp(n,'hub'))cands.push({kind:'stn',n,k:'hub',cost:STN_UP.hub.cost})}
  for(const k of ['rtinfo','tickets'])if(has('up:'+k)&&!G.lv[k]&&Object.keys(G.lines||{}).length)cands.push({kind:'up',k,cost:upCost(k)});
  const out=[];
  for(const c of cands.slice(0,16)){const a=evalRegion(()=>{if(c.kind==='line')G.lines.Lrec=tempLine(c.mode,c.stops);else if(c.kind==='stn')(G.stn[c.n]||(G.stn[c.n]={}))[c.k]=1;else G.lv[c.k]=1});
    const val=recValue(base,a);if(val.v<=0.5)continue;c.val=val;c.pay=c.cost/val.v;if(c.pay<=96)out.push(c)}
  out.sort((x,y)=>x.pay-y.pay);
  R.trRecs={at:G.clock,sig:recSig(),list:out.slice(0,3)};
}
const recSig=()=>Object.values(G.lines||{}).map(L=>L.id+L.mode+L.stops.join('')).join('|')+'#'+JSON.stringify(G.stn||{})+'#'+(G.builds||[]).length+'#'+Object.keys(G.tech||{}).length+'#'+G.lv.rtinfo+G.lv.tickets;
function lineTweaks(){ // quick fixes for lines already running
  const out=[],r=R.reg;if(!r)return out;
  for(const L of sortedLines()){const st=r.lines[L.id];if(!st||lineDown(L)||buildOf('line:'+L.id))continue;const M=MODES[L.mode],fq=M.freqs,fi=fq.indexOf(L.freq),mgr=SET().autoLines&&!L.man;
    if(st.riders<3&&st.ops>15&&hour()>=8&&hour()<20)out.push({kind:'close',L,text:`${lineCode(L)} carries almost nobody`,sub:`Closing it saves ${money(st.ops)} an hour.`});
    else if(st.baseLoad>0.95&&fi===fq.length-1&&(L.cars||0)<2)out.push({kind:'cars',L,text:`${lineCode(L)} is full at every service`,sub:`Longer ${L.mode==='bus'||L.mode==='coach'?'vehicles':'trains'} carry 50% more.`,cost:carsCost(L)});
    else if(!mgr&&st.baseLoad>0.9&&fi<fq.length-1)out.push({kind:'more',L,text:`${lineCode(L)} is packed`,sub:`Run it every ${Math.round(60/fq[fi+1])} min instead of ${Math.round(60/L.freq)}.`});
    else if(!mgr&&st.baseLoad<0.25&&st.rev<st.ops&&fi>0)out.push({kind:'less',L,text:`${lineCode(L)} runs mostly empty`,sub:`Every ${Math.round(60/fq[fi-1])} min would save money.`})}
  return out.slice(0,3);
}
function recRowLine(c){const M=MODES[c.mode],v=c.val,pay=c.pay;
  return `<div class="recrow"><span class="lbadge sm" style="--c:${M.cols[(nextNum(c.mode)-1)%M.cols.length]}">${M.L}${nextNum(c.mode)}</span><div><div class="rt">${M.name}: ${c.stops.map(n=>NODES[n].n).join(' › ')}</div><div class="rd">${v.v>=1?`+${money(v.v)}/h`:'Small gain'}${v.dem>0.005?` · demand +${(v.dem*100).toFixed(1)}%`:''}${v.cong<-0.01?` · traffic −${Math.round(-v.cong*100)}%`:''} · pays back in ${pay<1?'under an hour':`~${Math.round(pay)} h`}</div></div><div class="btns"><button class="buy" data-recline="${c.mode}|${c.stops.join(',')}" data-cost="${c.cost}">${money(c.cost)}</button><button class="chip" data-recprev="${c.mode}|${c.stops.join(',')}">Preview</button></div></div>`}
function recRowOther(c){const v=c.val,pay=c.pay,name=c.kind==='stn'?`${STN_UP[c.k].name} at ${NODES[c.n].n}`:UPG[c.k].name;
  return `<div class="recrow"><span class="lbadge sm" style="--c:#8C97A1">${c.kind==='stn'?(c.k==='pr'?'P+R':'HUB'):'NET'}</span><div><div class="rt">${name}</div><div class="rd">+${money(v.v)}/h${v.dem>0.005?` · demand +${(v.dem*100).toFixed(1)}%`:''} · pays back in ~${Math.max(1,Math.round(pay))} h</div></div><div class="btns"><button class="buy" data-recother="${c.kind}|${c.n||''}|${c.k}" data-cost="${c.cost}">${money(c.cost)}</button></div></div>`}
function transportRecs(){
  if(SET().recs===false)return '';
  const busy=R.trRecs&&R.trRecs.sig===recSig()&&G.clock-R.trRecs.at<120;
  if(!busy&&!R.trRecQ){R.trRecQ=1;setTimeout(()=>{try{computeTransitRecs()}finally{R.trRecQ=0}if(G.tab==='region'&&!R.draft&&(R.regSub||'lines')==='lines'){const pn=$('#panel'),sc=pn.scrollTop;renderPanel();pn.scrollTop=sc}},30)}
  const list=R.trRecs?R.trRecs.list:[],tw=lineTweaks();
  let h=`<div class="lcard rec"><div class="rechead"><span class="lbl">Recommended</span><button class="chip${SET().autoLines?' on':''}" data-setq="autoLines" title="Adjusts how often lines run, from how full they are">${SET().autoLines?'✓ ':''}Auto timetables</button></div>`;
  if(!R.trRecs)h+=`<div class="rd">Working out what would help most…</div>`;
  else if(!list.length&&!tw.length)h+=`<div class="rd">Nothing obvious to add right now. Your network covers what it can.</div>`;
  h+=list.map(c=>c.kind==='line'?recRowLine(c):recRowOther(c)).join('');
  h+=tw.map(t=>`<div class="recrow"><span class="lbadge sm" style="--c:${t.L.col}">${lineCode(t.L)}</span><div><div class="rt">${t.text}</div><div class="rd">${t.sub}</div></div><div class="btns">${t.kind==='cars'?`<button class="buy" data-lcars="${t.L.id}" data-cost="${t.cost}">${money(t.cost)}</button>`:t.kind==='close'?`<button class="buy sell" data-lclose="${t.L.id}">Close</button>`:`<button class="buy ghost" data-rectweak="${t.L.id}:${t.kind==='more'?1:-1}">Apply</button>`}</div></div>`).join('');
  return h+`</div>`;
}
// routes and fleet: which city next, which fares, which plane
function routeRecs(){
  if(SET().recs===false)return '';
  const own=G.fleet.filter(f=>!f.sold&&!AIRCRAFT[f.type].freighter),mt=Math.max(0,...own.map(f=>AIRCRAFT[f.type].tier)),open=Object.keys(G.routes||{}).filter(c=>CITY[c]),out=[];
  let sup=0,mk=0;for(const c of open){sup+=rsOf(c).s;mk+=cityMarket(c)}
  // a new route when flights are filling their markets, or a new jet has nowhere to go
  const tierOpen=t=>open.some(c=>CITY[c].tier===t),cand=CITIES.filter(c=>!routeOpen(c[0])&&has('rt:'+c[2])&&c[2]<=mt).map(c=>CITY[c[0]]);
  const needTier=own.length&&!tierOpen(mt)&&cand.some(C=>C.tier===mt);
  if(cand.length&&(sup>mk*0.8||needTier)){const pool=needTier?cand.filter(C=>C.tier===mt):cand,best=pool.sort((a,b)=>cityMarket(b.code)*TIER_FARE[b.tier]/(TRIP[b.tier]+45)-cityMarket(a.code)*TIER_FARE[a.tier]/(TRIP[a.tier]+45))[0];
    out.push({text:`Open ${best.name}`,sub:needTier?`Your ${RT_NAMES[mt].toLowerCase()} jets have no ${RT_NAMES[mt].toLowerCase()} route yet.`:`Your flights offer ${Math.round(sup/mk*100)}% of what your cities want. ${best.name}: ${num(cityMarket(best.code))} seats a day, ${profileOf(best).toLowerCase()}.`,btn:`<button class="buy" data-ropen="${best.code}" data-cost="${ROUTE_FEE[best.tier]}">${money(ROUTE_FEE[best.tier])}</button>`,tag:best.code})}
  // fares, unless the route manager handles them
  if(!SET().autoFares){const up=open.filter(c=>rsOf(c).n>=1&&bestFare(c)>routeFareIx(c)),dn=open.filter(c=>rsOf(c).n>=1&&bestFare(c)<routeFareIx(c));
    if(up.length)out.push({text:`Raise fares on ${up.length} route${up.length>1?'s':''}`,sub:`${up.slice(0,4).join(', ')}${up.length>4?'…':''} would earn more at a higher fare${G.lv.loyalty?'':'. A frequent flyer club makes dearer fares stick'}.`,btn:`<button class="buy ghost" data-recfare="${up.join(',')}">Apply</button>`,tag:'FARE'});
    if(dn.length)out.push({text:`Cut fares on ${dn.length} route${dn.length>1?'s':''}`,sub:`${dn.slice(0,4).join(', ')}${dn.length>4?'…':''} would fill enough extra seats to earn more.`,btn:`<button class="buy ghost" data-recfare="${dn.join(',')}">Apply</button>`,tag:'FARE'})}
  // Lowmere: the shared route where you are losing most
  if(rivLive()){const weak=open.filter(c=>rivRoute(c)&&rsOf(c).n>=1).map(c=>[c,rivShare(c)]).filter(x=>x[1]<0.55).sort((a,b)=>a[1]-b[1])[0];
    if(weak){const [c,sh]=weak,fi=routeFareIx(c),cut=fi>0&&rivShare(c,fi-1)>sh+0.04;
      out.push({text:`Defend ${CITY[c].name}`,sub:`Lowmere takes ${Math.round((1-sh)*100)}% of its travellers. ${cut?'A lower fare wins some back, as do more flights and punctuality.':'More flights a day and better punctuality win travellers back.'}`,btn:cut?`<button class="buy ghost" data-rfare="${c}:${fi-1}">Cut fare</button>`:`<button class="buy ghost" data-rlook="${c}">Show</button>`,tag:'LOW'})}}
  // fleet: a jet for routes nobody can fly, or more planes when every flight is full and gates wait
  {const reach=Math.max(...open.map(c=>CITY[c].tier),0);if(reach>mt){const t=AC_ORDER.filter(t=>!AIRCRAFT[t].freighter&&has('ac:'+t)&&AIRCRAFT[t].tier>=reach&&(AIRCRAFT[t].tier<4||G.pierB)).sort((a,b)=>AIRCRAFT[a].cost-AIRCRAFT[b].cost)[0];
      if(t!=null)out.push({text:`Buy an ${AIRCRAFT[t].name}`,sub:`None of your planes can reach your ${RT_NAMES[reach].toLowerCase()} routes.`,btn:`<button class="buy" data-acbuy="${t}" data-cost="${AIRCRAFT[t].cost}">${money(AIRCRAFT[t].cost)}</button>`,tag:'PLANE'})}
    const idle=G.stands.some((s,k)=>s.built&&!R.st[k].F&&(R.st[k].idleT||0)>15),ready=own.some(f=>f.st==='base');
    if(idle&&!ready&&sup<mk*0.9){let bt=null;for(const t of AC_ORDER){const a=AIRCRAFT[t];if(!a.freighter&&has('ac:'+t)&&(!a.fire||G.lv.fire>=a.fire)&&(a.tier<4||G.pierB))bt=t}
      if(bt!=null)out.push({text:`Buy another ${AIRCRAFT[bt].short}`,sub:'Gates sit empty while every plane is away, and your cities want more seats.',btn:`<button class="buy" data-acbuy="${bt}" data-cost="${AIRCRAFT[bt].cost}">${money(AIRCRAFT[bt].cost)}</button>`,tag:'PLANE'})}}
  let h=`<div class="lcard rec"><div class="rechead"><span class="lbl">Recommended</span><button class="chip${SET().autoFares?' on':''}" data-setq="autoFares" title="Sets each route’s fare to whatever earns most">${SET().autoFares?'✓ ':''}Auto fares</button></div>`;
  h+=out.length?out.slice(0,4).map(o=>`<div class="recrow"><span class="lbadge sm" style="--c:#8C97A1">${o.tag}</span><div><div class="rt">${o.text}</div><div class="rd">${o.sub}</div></div><div class="btns">${o.btn}</div></div>`).join(''):`<div class="rd">Your routes, fares and fleet look balanced.</div>`;
  return h+`</div>`;
}
function recsClick(d){
  if(d.setq){G.set[d.setq]=!SET()[d.setq];save();renderPanel();return true}
  if(d.recline){const [m,st]=d.recline.split('|'),stops=st.split(',');if(orderLine(m,stops,[],null)){R.trRecs=null;renderPanel();save()}return true}
  if(d.recprev){const [m,st]=d.recprev.split('|'),stops=st.split(',');R.draft={mode:m,stops,skip:[],edit:null,col:draftCol(m)};R.regSel=null;if(R.view!=='region')setView('region');renderPanel();$('#panel').scrollTop=0;return true}
  if(d.recother){const [kind,n,k]=d.recother.split('|');if(kind==='stn'){const u=STN_UP[k];if(!stnUp(n,k)&&buy(u.cost)){(G.stn||(G.stn={}))[n]=Object.assign(G.stn[n]||{},{[k]:1});regionTick();toast(`${u.name} open at ${NODES[n].n}.`,null,null,'goal',4)}}else buyUpgrade(k);R.trRecs=null;renderPanel();save();return true}
  if(d.rectweak){const [id,dv]=d.rectweak.split(':'),L=G.lines[id];if(L){const fq=MODES[L.mode].freqs;L.freq=fq[clamp(fq.indexOf(L.freq)+(+dv),0,fq.length-1)];L.man=true;regionTick();renderPanel();save()}return true}
  if(d.recfare){for(const c of d.recfare.split(','))if(G.routes[c]){G.routes[c].f=bestFare(c);G.routes[c].man=true}renderPanel();save();return true}
  if(d.lauto){const L=G.lines[d.lauto];if(L){delete L.man;renderPanel();save()}return true}
  if(d.rauto){const r=G.routes[d.rauto];if(r){delete r.man;renderPanel();save()}return true}
  if(d.rivbuy){if(buyRival()){renderPanel();save()}return true}
  return false;
}
/* ================= LOWMERE: a rival airport that competes for travellers on the routes you both fly ================= */
const RIV='#B58CFF',RIV_LV=3,RIV_BUY_LV=8;
const rivLive=()=>{const V=G.rival;return !!(V&&V.open&&G.clock>=V.open&&!V.owned)};
const rivHsr=()=>Object.values(G.lines||{}).some(L=>L.mode==='hsr'&&serves(L,'low'));
const rivRoute=c=>rivLive()?G.rival.routes[c]||null:null;
const rivSale=c=>{const r=rivRoute(c);return !!(r&&r.sale>G.clock)};
const baseMarket=c=>{const C=CITY[c];return TIERBASE[C.tier]*C.size*SEA_MUL[C.sea][seaIdx()]};
// your share of the travellers on a route Lowmere also flies: frequency, fare, rating and punctuality decide it
function rivShare(c,fi){
  const r=rivRoute(c);if(!r)return 1;
  const s=rsOf(c),m=G.fare*RFARE[fi??routeFareIx(c)];
  const you=Math.sqrt(Math.max(0.5,s.n))*Math.pow(m,-1.6)*Math.pow(clamp(G.rep,20,100)/60,1.5)*(0.55+0.45*(G.otp??0.85))*(promoOn(c)?1.2:1)*(has('feat:slots')?1.12:1);
  const riv=Math.sqrt(r.f)*(r.sale>G.clock?1.43:1)*Math.pow(G.rival.rep/60,1.5)*0.93*(rivHsr()?0.7:1);
  return you/(you+riv);
}
// the part of a route's market you keep
const rivKeep=(c,fi)=>{const sh=rivShare(c,fi);return sh>=1?1:Math.min(1,1.1*(0.3+0.7*sh))};
const rivTierMax=()=>Math.min(4,Math.floor((G.rival.lv+1)/2));
const rivFlights=()=>G.rival?Object.values(G.rival.routes).reduce((x,r)=>x+r.f,0):0;
function rivMix(){ // your share across the routes you both fly, weighted by market
  let a=0,b=0;for(const c in (G.rival&&G.rival.routes||{})){if(!routeOpen(c))continue;const m=baseMarket(c);a+=m*rivShare(c);b+=m}return b?a/b:null}
const rivBuyCost=()=>Math.round((1200000+150000*(G.rival?G.rival.lv:1))/10000)*10000;
function rivalDay(){
  let V=G.rival;
  if(!V){if(G.level<RIV_LV)return;
    V=G.rival={open:G.clock+3*1440,routes:{},lv:1,rep:54,age:0,hist:[],pax:0,cut:0};
    toast(`Lowmere is building an airport. It opens on day ${dayOf(V.open)} and will compete for travellers on the routes you both fly.`,[{label:'Show me',fn:()=>{setView('region');regionFocus('low')}},{label:'OK',fn:()=>{}}],'rival','warn',25);
    return}
  if(V.owned){const d=Math.round(V.pax*rivFare()*0.22);if(d>0){earn(d,'region');V.paid=(V.paid||0)+d}return}
  if(G.clock<V.open)return;
  if(!V.opened){V.opened=1;
    const mine=Object.keys(G.routes||{}).filter(c=>CITY[c]&&CITY[c].tier<=1).sort((a,b)=>baseMarket(b)-baseMarket(a)).slice(0,3);
    for(const c of mine)V.routes[c]={f:2,w:0};
    const other=CITIES.filter(x=>x[2]<=1&&!V.routes[x[0]]&&!routeOpen(x[0])).sort((a,b)=>b[4]-a[4])[0];if(other)V.routes[other[0]]={f:1,w:0};
    const nm=Object.keys(V.routes).filter(routeOpen).map(c=>CITY[c].name);
    toast(`Lowmere Airport is open${nm.length?` and flies to ${nm.join(', ').replace(/, ([^,]*)$/,' and $1')}`:''}. Fly more often, price sharper and stay on time to keep your travellers.`,[{label:'Routes',fn:()=>{setView('world');setTab('routes')}},{label:'OK',fn:()=>{}}],'rival2','warn',25);
  }
  V.age++;V.lv=Math.min(Math.max(1,G.level-1),1+Math.floor(V.age/3));V.rep=clamp(54+V.lv*2.2,54,72);
  const rts=Object.keys(V.routes),maxR=3+V.lv*3,maxF=6+V.lv*5,fl=rivFlights(),tm=rivTierMax();
  const want=c=>{const rs=G.rs&&G.rs[c];return baseMarket(c)*(routeOpen(c)?1+(rs&&rs.tn?Math.max(0,rs.lf-0.7)*2:0):0.6)};
  // Lowmere backs off where you win clearly, and grows where your flights are full or your service is weak
  for(const c of rts){const r=V.routes[c];if(!routeOpen(c)){r.w=0;continue}const sh=rivShare(c);r.w=sh>0.8?(r.w||0)+1:0;
    if(r.w>=4){r.w=0;if(r.f>1)r.f--;else{delete V.routes[c];V.cut=(V.cut||0)+1;if(!R.sim)toast(`Lowmere has stopped flying to ${CITY[c].name}. You won the route.`,null,null,'goal',8)}}}
  if(!has('feat:slots')||Math.random()<0.5){
    if(rts.length<maxR&&(rts.length<4||Math.random()<0.55)){
      const cand=CITIES.filter(x=>x[2]<=tm&&!V.routes[x[0]]).map(x=>x[0]).sort((a,b)=>want(b)-want(a));
      if(cand.length){const c=cand[Math.floor(Math.random()*Math.min(3,cand.length))];V.routes[c]={f:1,w:0};if(routeOpen(c)&&!R.sim)toast(`Lowmere now flies to ${CITY[c].name} as well.`,null,null,'',6)}
    }else if(fl<maxF&&rts.length){
      const c=Object.keys(V.routes).sort((a,b)=>want(b)/(V.routes[b].f+1)-want(a)/(V.routes[a].f+1))[0];if(V.routes[c].f<8)V.routes[c].f++}
  }
  // now and then a three-day fare sale on one of your best routes
  if(!Object.values(V.routes).some(r=>r.sale>G.clock)&&Math.random()<0.18){
    const tgt=Object.keys(V.routes).filter(routeOpen).sort((a,b)=>(rsOf(b).v-(rsOf(b).c||0))-(rsOf(a).v-(rsOf(a).c||0)))[0];
    if(tgt){V.routes[tgt].sale=G.clock+3*1440;toast(`Lowmere has cut fares to ${CITY[tgt].name} for three days.`,[{label:'Show route',fn:()=>{setView('world');R.wSel=tgt;R.rSub='mine';setTab('routes');showCard('route-'+tgt)}},{label:'OK',fn:()=>{}}],'rsale','warn',20)}}
  // how many travellers Lowmere carried, and your share of the routes you share
  let px=0;for(const c in V.routes)px+=baseMarket(c)*(routeOpen(c)?1-rivShare(c):0.7);V.pax=Math.round(px);
  const mx=rivMix();if(mx!=null){V.hist.push(Math.round(mx*100));if(V.hist.length>14)V.hist.shift()}
}
function rivFare(){const n=G.flown||0;return n>500?(G.revBy.fares||0)/n:4}
function buyRival(){const V=G.rival;if(!V||V.owned||G.level<RIV_BUY_LV||!buy(rivBuyCost()))return false;V.owned=1;V.ownedAt=G.clock;
  toast('Lowmere Airport is yours. It stops competing and pays you a share of its traffic every day.',null,null,'goal',10);return true}
function rivalPanel(){
  const V=G.rival;if(!V)return '';
  if(G.clock<V.open)return `<div class="lcard riv"><div class="sh"><div><span class="gate" style="--c:${RIV}">LOW</span><span class="rt">Lowmere Airport</span></div></div><div class="rd">Opens on day ${dayOf(V.open)}. It will compete for travellers on the routes you both fly.</div></div>`;
  if(V.owned)return `<div class="lcard riv"><div class="sh"><div><span class="gate" style="--c:${RIV}">LOW</span><span class="rt">Lowmere Airport</span></div><span class="live">Yours</span></div><div class="rd">Paid you <b>${money(V.paid||0)}</b> so far · about <b>${num(V.pax)}</b> travellers a day.</div></div>`;
  const mx=rivMix(),n=Object.keys(V.routes).length,sh=Object.keys(V.routes).filter(routeOpen).length,hs=V.hist.slice(-10);
  const spark=hs.length>1?`<svg class="spark" viewBox="0 0 100 24" preserveAspectRatio="none"><polyline fill="none" stroke="${RIV}" stroke-width="1.6" points="${hs.map((v,i)=>`${i/(hs.length-1)*100},${24-clamp((v-30)/70,0,1)*22-1}`).join(' ')}"/></svg>`:'';
  let h=`<div class="lcard riv"><div class="sh"><div><span class="gate" style="--c:${RIV}">LOW</span><span class="rt">Lowmere Airport</span></div><span class="live">Rival</span></div>
    <div class="lstats fl4" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div><b>${n}</b><span>routes</span></div><div><b>${rivFlights()}</b><span>flights/day</span></div><div><b style="color:${mx==null?'':mx>=0.65?'var(--good)':mx<0.5?'var(--bad)':''}">${mx==null?'–':Math.round(mx*100)+'%'}</b><span>your share</span></div></div>
    ${sh?`<div class="rd">You both fly <b>${sh}</b> route${sh>1?'s':''}. Travellers pick by flights a day, fare, rating and punctuality.</div>`:'<div class="rd">No shared routes yet.</div>'}${spark}`;
  if(!rivHsr()&&has('mode:hsr'))h+=`<div class="rd">High-speed trains to Lowmere would bring its travellers to you.</div>`;
  if(G.level>=RIV_BUY_LV)h+=`<div class="chips" style="margin-top:8px"><button class="chip" data-rivbuy="1" data-cost="${rivBuyCost()}">Buy Lowmere Airport <small>${money(rivBuyCost())}</small></button></div>`;
  return h+`</div>`;
}
function rivalRouteLine(c){
  const r=rivRoute(c);if(!r)return '';const sh=rivShare(c);
  return `<div class="rd rivl"><span class="dotr"></span>Lowmere flies here <b>${r.f}</b>× a day${r.sale>G.clock?` · <b style="color:${RIV}">fare sale</b> until ${hhmm(r.sale)} day ${dayOf(r.sale)}`:''}. You get <b>${Math.round(sh*100)}%</b> of travellers.</div><div class="prog two"><i style="width:${sh*100}%"></i><i style="width:${(1-sh)*100}%;background:${RIV}"></i></div>`;
}
// Lowmere on the region map: a building site, then an airport whose planes cross your sky
function drawLowmere(t,k){
  const V=G.rival;if(!V)return;const x=1532,y=150,minW=1/k;
  if(G.clock<V.open){const p=clamp(1-(V.open-G.clock)/(3*1440),0,1);
    ctx.strokeStyle='#FFC72C';ctx.lineWidth=Math.max(1.5,minW*1.5);ctx.beginPath();ctx.moveTo(x-6,y+14);ctx.lineTo(x-6,y-16);ctx.lineTo(x+18,y-16);ctx.moveTo(x-6,y-10);ctx.lineTo(x+2,y-16);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+14,y-16);ctx.lineTo(x+14,y-8+3*Math.sin(t*1.5));ctx.stroke();
    ctx.fillStyle='rgba(255,199,44,.18)';ctx.fillRect(x-30,y+18,60,4);ctx.fillStyle='#FFC72C';ctx.fillRect(x-30,y+18,60*p,4);
    lbl(`AIRPORT · OPENS DAY ${dayOf(V.open)}`,x+34,y+34,'#FFC72C',9.5,'right',true);return}
  ctx.save();ctx.translate(x,y);ctx.rotate(-0.5);ctx.fillStyle='#2A2440';ctx.fillRect(-32,-5,64,10);ctx.strokeStyle=V.owned?'#FFC72C':RIV;ctx.lineWidth=Math.max(1,minW);ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(-28,0);ctx.lineTo(28,0);ctx.stroke();ctx.setLineDash([]);ctx.restore();
  lbl(V.owned?'LOWMERE AIRPORT · YOURS':'LOWMERE AIRPORT',x+34,y+26,V.owned?'#FFC72C':RIV,9.5,'right',true);
  if(V.owned)return;
  const rs=Object.keys(V.routes),n=Math.min(10,Math.ceil(rivFlights()/2)),sc=Math.max(0.35,Math.min(0.9,10/(28*k)));
  for(let i=0;i<n;i++){const C=CITY[rs[i%rs.length]];if(!C)continue;const a=C.brg*Math.PI/180+(i%3-1)*0.05,u=(t*0.018+i*0.37)%1,d=u*1500;
    const px=x+Math.sin(a)*d,py=y-Math.cos(a)*d;if(px<-40||px>RW+40||py<-40||py>RH+40)continue;
    miniPlane(px,py,Math.atan2(-Math.cos(a),Math.sin(a)),sc,Math.min(1,u*8)*0.85,RIV)}
}
// Lowmere on the world map: dashed arcs to the cities it serves
const RIV_W=[WCX+34,WCY-24];
function drawRivalWorld(t,px,lb){
  const V=G.rival;if(!V||G.clock<V.open)return;const [lx,ly]=RIV_W;
  if(!V.owned)for(const c in V.routes){const C=CITY[c];if(!C||!cityVisible(C))continue;const [x,y]=cityXY(C),dx=x-lx,dy=y-ly,cx=lx+dx/2+dy*0.18,cy=ly+dy/2-dx*0.18,sale=V.routes[c].sale>G.clock;
    ctx.strokeStyle=RIV;ctx.globalAlpha=sale?0.6+0.3*Math.sin(t*4):0.45;ctx.lineWidth=px(sale?2.4:1.3);ctx.setLineDash([px(4),px(4)]);ctx.beginPath();ctx.moveTo(lx,ly);ctx.quadraticCurveTo(cx,cy,x,y);ctx.stroke();ctx.setLineDash([]);
    if(sale){ctx.globalAlpha=1;lb('SALE',(lx+2*cx+x)/4,(ly+2*cy+y)/4,RIV,8.5,'center',true)}ctx.globalAlpha=1}
  ctx.fillStyle=V.owned?'#FFC72C':RIV;ctx.beginPath();ctx.arc(lx,ly,px(4),0,Math.PI*2);ctx.fill();lb('LOWMERE',lx+px(7),ly-px(6),V.owned?'#FFC72C':RIV,9,'left',true);
}
/* ================= AIRLINE OPERATIONS: crews on duty limits, overnight checks, delays at the far end ================= */
const CREW_DUTY=600,CREW_REST=720;
const crewFee=()=>Math.round(10+18*G.level*G.level),crewWage=()=>0.6*G.level*G.level;
const crewTarget=()=>{const n=G.fleet.filter(f=>!f.sold).length;return Math.ceil(n*1.3)+(n>=3?1:0)};
const mkCrew=at=>({free:at,back:at,duty:0,res:0});
function crewState(){let fly=0,rest=0,ready=0;for(const c of G.crews){if(c.res||c.back>G.clock)fly++;else if(c.free>G.clock)rest++;else ready++}return {fly,rest,ready,n:G.crews.length}}
// a rested crew for the next departure, reserved until push-back
// the crew already on duty that still has time for this trip, so rest periods stay staggered; otherwise the freshest
function pickCrew(trip){let fit=null,fresh=null;for(const c of G.crews){if(c.res&&G.clock-c.res>180)c.res=0;if(c.res||c.free>G.clock)continue;if(G.clock-c.free>=CREW_REST)c.duty=0;
  if(c.duty+trip<=CREW_DUTY&&(!fit||c.duty>fit.duty))fit=c;if(!fresh||c.duty<fresh.duty)fresh=c}
  const b=fit||fresh;if(b)b.res=G.clock||1;return b}
function crewReady(i,F){
  if(F.partner||F.crew)return true;
  const c=pickCrew(TRIP[(CITY[F.city]||F.ac).tier]);if(c){F.crew=c;return true}
  if(!F.crewWait){F.crewWait=G.clock;floater('CREW DELAY',STAND_X[i],CABIN_TOP-24,'#FF7A8A',true);if(G.dstat)G.dstat.crewDl=(G.dstat.crewDl||0)+1;if(SET().autoCrews!==false)hireCrew(true)}
  return false;
}
function crewAway(F,back){const c=F.crew;if(!c)return;c.res=0;c.back=back;c.duty+=back-G.clock;if(c.duty>=CREW_DUTY-50){c.free=back+CREW_REST;c.duty=0}else c.free=back+10}
function hireCrew(quiet){const fee=crewFee();if(G.cash<fee)return false;spend(fee,'costs');G.crews.push(mkCrew(G.clock+(quiet?30:20)));if(!quiet&&!R.sim)toast(`Crew hired. They report for duty in 20 min.`,null,null,'goal',4);return true}
function releaseCrew(){const k=G.crews.findIndex(c=>!c.res&&c.back<=G.clock);if(k<0||G.crews.length<=1)return false;G.crews.splice(k,1);return true}
function crewTick(){ // the fleet manager keeps enough crews for the fleet
  if(SET().autoCrews===false)return;const t=crewTarget();
  while(G.crews.length<t&&G.cash>=crewFee()*2)hireCrew(true);
  if(G.crews.length>t+2)releaseCrew();
}
// knock-on: weather and slots at the far end can bring a plane back late
function farDelay(C){const w=seasonOf(dayOf(G.clock)).name==='Winter',p=(0.05+0.02*C.tier+(w?0.05:0))*(has('feat:occ')?0.5:1);if(Math.random()>=p)return 0;return Math.round((10+Math.random()*35*(1+0.25*C.tier))*(has('feat:occ')?0.6:1))}
// overnight checks: at 03:00 planes parked at base are serviced
function nightChecks(){
  if(!pol('checks'))return;const due=G.fleet.filter(f=>!f.sold&&f.st==='base'&&(f.wear||0)>=4);if(!due.length)return;
  const k=0.8*(1-0.1*G.lv.hangar);let cost=0,n=0;for(const f of due){const c=Math.round(serviceCost(f)*k);if(G.cash<c)break;spend(c,'costs');cost+=c;f.wear=0;n++}
  if(n&&!R.sim)floater(`OVERNIGHT CHECKS · ${n} PLANE${n>1?'S':''} · ${money(cost)}`,STAND_X[0]+200,CABIN_TOP-70,'#5CC8FF',true);
  if(G.dstat)G.dstat.checks=(G.dstat.checks||0)+n;
}
function crewPanel(){
  const s=crewState(),t=crewTarget(),auto=SET().autoCrews!==false;
  return `<div class="sec">Crews<span>wages ${money(s.n*crewWage())} an hour</span></div>
    <div class="lstats fl4" style="grid-template-columns:repeat(4,1fr)"><div><b>${s.n}</b><span>crews</span></div><div><b>${s.fly}</b><span>flying</span></div><div><b>${s.rest}</b><span>resting</span></div><div><b style="color:${s.ready?'':'var(--bad)'}">${s.ready}</b><span>ready</span></div></div>
    <p class="note">Each departure of your own plane needs a rested crew. After about 10 hours on duty a crew rests for 12. No crew free means a crew delay.${auto?` The fleet manager keeps about ${t} crews for your fleet.`:''}</p>
    <div class="chips"><button class="chip" data-crewhire="1" data-cost="${crewFee()}">Hire a crew <small>${money(crewFee())}</small></button>${s.n>1?`<button class="chip" data-crewrel="1">Release one</button>`:''}<button class="chip${auto?' on':''}" data-setq="autoCrews">${auto?'✓ ':''}Auto crews</button></div>`;
}
/* ================= RECORDS, STAMPS AND WEEKLY CHALLENGES ================= */
const RECS=[
  ['dayPax','Busiest day',v=>`${num(v)} passengers`],['dayProfit','Best day',v=>money(v)],['dayOT','Most punctual day',v=>`${v}% on time`],
  ['streak','Longest on-time run',v=>`${v} departures`],['routes','Most destinations',v=>`${v} cities`],['rep','Highest rating',v=>`${v}`],
  ['riders','Busiest hour on public transport',v=>`${num(v)} riders`],['share','Best share against Lowmere',v=>`${v}%`]];
function setRec(k,v,show){const r=G.rec||(G.rec={});v=Math.round(v);if(!(v>(r[k]||0)))return false;const had=r[k]>0;r[k]=v;
  if(show&&had&&!R.sim&&SET().pops!=='off'){const d=RECS.find(x=>x[0]===k);floater(`RECORD · ${d[1].toUpperCase()} · ${d[2](v)}`,760,120,'#FFC72C',true)}return had}
const railAir=()=>Object.values(G.lines||{}).some(L=>MODES[L.mode].kind==='rail'&&serves(L,'air'));
const STAMPS=[
  {id:'first',n:'First away',d:'Your first departure',c:'#FFC72C',t:()=>G.flights>=1},
  {id:'clock10',n:'Like clockwork',d:'10 on-time departures in a row',c:'#6BE39A',t:()=>G.bestStreak>=10},
  {id:'clock40',n:'Swiss watch',d:'40 on-time departures in a row',c:'#6BE39A',t:()=>G.bestStreak>=40},
  {id:'full',n:'Full house',d:'10 flights with every seat sold in one day',c:'#FF9F43',t:()=>(G.rec&&G.rec.fullDay||0)>=10},
  {id:'night',n:'Night owl',d:'15 departures between 23:00 and 05:00 in one day',c:'#5CC8FF',t:()=>(G.rec&&G.rec.nightDay||0)>=15},
  {id:'snow',n:'Snow day',d:'10 on-time departures in snow in one day',c:'#DCE6F2',t:()=>(G.rec&&G.rec.snowDay||0)>=10},
  {id:'stars',n:'Five stars',d:'A rating of 90',c:'#FFC72C',t:()=>G.rep>=90},
  {id:'k100',n:'Six figures',d:'100,000 passengers',c:'#ECE8DF',t:()=>G.flown>=1e5},
  {id:'m1',n:'A million flyers',d:'1,000,000 passengers',c:'#ECE8DF',t:()=>G.flown>=1e6},
  {id:'cash1m',n:'Millionaire',d:'$1 million in the bank',c:'#6BE39A',t:()=>G.cash>=1e6},
  {id:'rail',n:'Rail link',d:'Trains to the terminal',c:'#E8B04A',t:railAir},
  {id:'metro',n:'Underground',d:'A metro line',c:'#FF7AB6',t:()=>anyMode('metro')},
  {id:'hsr',n:'Two cities',d:'High-speed trains to Lowmere',c:'#F5D08A',t:()=>anyMode('hsr')},
  {id:'rings',n:'Around the world',d:'A route on every range, short-haul to ultra long-haul',c:'#5CC8FF',t:()=>[0,1,2,3,4].every(t=>Object.keys(G.routes||{}).some(c=>CITY[c]&&CITY[c].tier===t))},
  {id:'heavy',n:'Heavy metal',d:'Fly a widebody',c:'#909AA4',t:()=>G.fleet.some(f=>!f.sold&&AIRCRAFT[f.type].tier>=4)},
  {id:'cargo',n:'Forwarder',d:'$100,000 from cargo',c:'#D9A066',t:()=>(G.revBy.cargo||0)>=1e5},
  {id:'events',n:'Showtime',d:'Host five events',c:'#FF7AB6',t:()=>(G.evDone||0)>=5},
  {id:'crews',n:'Well rested',d:'A week of busy days without a crew delay',c:'#5CC8FF',t:()=>(G.rec&&G.rec.crewRun||0)>=7},
  {id:'won',n:'Route won',d:'Lowmere pulled out of a route',c:RIV,t:()=>!!(G.rival&&G.rival.cut)},
  {id:'home',n:'Home advantage',d:'75% of travellers on routes shared with Lowmere',c:RIV,t:()=>(G.rec&&G.rec.share||0)>=75},
  {id:'takeover',n:'Takeover',d:'Buy Lowmere Airport',c:RIV,t:()=>!!(G.rival&&G.rival.owned)},
  {id:'chal',n:'Challenger',d:'Finish a week’s three challenges',c:'#FFC72C',t:()=>(G.chal&&G.chal.sets||0)>=1},
  {id:'chal5',n:'Regular',d:'Finish five weeks of challenges',c:'#FFC72C',t:()=>(G.chal&&G.chal.sets||0)>=5},
  {id:'top',n:'Airport of the Year',d:'Reach the top level',c:'#FFC72C',t:()=>G.level>=LEVELS.length-1},
];
function checkStamps(){
  const st=G.stamps||(G.stamps={});for(const S of STAMPS){if(st[S.id])continue;let ok=false;try{ok=S.t()}catch(e){}if(!ok)continue;st[S.id]=dayOf(G.clock);
    if(!R.sim){toast(`Stamp: <b>${S.n}</b>. ${S.d}.`,null,null,'goal',6);if(SET().pops!=='off')floater(`STAMP · ${S.n.toUpperCase()}`,760,150,S.c,true)}}
}
// weekly challenges: sized from how your airport did last week
const CH_POOL=[
  {id:'pax',n:v=>`Fly ${num(v)} passengers`,m:()=>G.flown,min:200},
  {id:'ontime',n:v=>`${num(v)} on-time departures`,m:()=>G.ontime,min:10},
  {id:'shops',n:v=>`Take ${money(v)} in the shops`,m:()=>G.revBy.shops||0,min:100,need:()=>G.shops.some(Boolean)},
  {id:'biz',n:v=>`Fly ${num(v)} business travellers`,m:()=>G.bizFlown||0,min:50},
  {id:'transit',n:v=>`Earn ${money(v)} from public transport fares`,m:()=>G.revBy.transit||0,min:100,need:()=>Object.keys(G.lines||{}).length>0},
  {id:'cargo',n:v=>`Earn ${money(v)} from cargo`,m:()=>G.revBy.cargo||0,min:200,need:()=>(G.revBy.cargo||0)>0},
  {id:'dest',n:(v,c)=>`Fly ${num(v)} passengers to ${CITY[c].name}`,m:c=>rsOf(c).tp,min:60,city:1},
];
function chalDay(){
  if(SET().chal===false||G.level<1)return;
  const C=G.chal||(G.chal={wk:-1,list:[],snap:null,sets:0});const wk=Math.floor((G.day-1)/7);if(wk===C.wk)return;
  const prev=C.snap,days=Math.max(1,G.day-(C.start||1)),n=C.wk<0?Math.max(1,G.day-1):days,snap={};
  const pool=CH_POOL.filter(p=>!p.need||p.need()),pick=[];
  while(pick.length<3&&pool.length){pick.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0])}
  C.list=pick.map(p=>{let c=null;if(p.city){const cs=Object.keys(G.routes||{}).filter(k=>CITY[k]&&rsOf(k).tn>5).sort(()=>Math.random()-0.5);c=cs[0];if(!c)return null}
    const now=p.city?p.m(c):p.m(),before=prev&&prev[p.id+(c||'')]!=null?prev[p.id+(c||'')]:null,per=before!=null?(now-before)/n:now/Math.max(1,G.day-1);
    const goal=Math.max(p.min,Math.round(per*7*(p.city?1.15:1.12)/10)*10);return {id:p.id,c,goal,base:now,done:0}}).filter(Boolean);
  for(const p of CH_POOL){if(p.city)for(const k of Object.keys(G.routes||{}))snap[p.id+k]=p.m(k);else snap[p.id]=p.m()}
  C.wk=wk;C.start=G.day;C.snap=snap;C.all=0;
  const ds=(G.days||[]).slice(-7),pr=ds.length?ds.reduce((a,x)=>a+Math.max(0,x.p),0)/ds.length:G.rate*60*12;C.pay=Math.max(100,Math.round(pr*0.12/50)*50);
  if(!R.sim)toast('New weekly challenges are in the Office.',[{label:'Show',fn:()=>{R.oSub='records';setTab('office')}},{label:'Later',fn:()=>{}}],'chal','',12);
}
function chalProg(x){const p=CH_POOL.find(q=>q.id===x.id);return Math.max(0,(x.c?p.m(x.c):p.m())-x.base)}
function checkChal(){
  const C=G.chal;if(!C||!C.list||SET().chal===false)return;
  for(const x of C.list){if(x.done||chalProg(x)<x.goal)continue;x.done=1;earn(C.pay,'bonus');
    if(!R.sim)toast(`Challenge done: ${CH_POOL.find(q=>q.id===x.id).n(x.goal,x.c)}. +${money(C.pay)}`,null,null,'goal',6)}
  if(!C.all&&C.list.length===3&&C.list.every(x=>x.done)){C.all=1;C.sets=(C.sets||0)+1;
    if(TECH.some(T=>!G.tech[T.id])){G.pts=(G.pts||0)+1;renderPlanBtn()}else earn(C.pay*2,'bonus');
    if(!R.sim)toast(`All three challenges done this week. <b>${TECH.some(T=>!G.tech[T.id])?'+1 plan point':'+'+money(C.pay*2)}</b>`,null,null,'goal',8)}
}
// daily records, from yesterday's figures
function recordsDay(s){
  if(!s||!s.flights)return;
  setRec('dayPax',s.pax,true);setRec('dayProfit',s.rev-s.cost,true);if(s.flights>=10)setRec('dayOT',s.ontime/s.flights*100,true);
  const r=G.rec;r.fullDay=Math.max(r.fullDay||0,s.full||0);r.nightDay=Math.max(r.nightDay||0,s.night||0);r.snowDay=Math.max(r.snowDay||0,s.snowOT||0);
  r.crewRunCur=(s.crewDl||0)===0&&s.flights>=20?(r.crewRunCur||0)+1:0;r.crewRun=Math.max(r.crewRun||0,r.crewRunCur);
  {const mx=rivMix();if(mx!=null)setRec('share',mx*100,true)}
}
function recordsHour(){setRec('streak',G.bestStreak);setRec('routes',nRoutes());setRec('rep',G.rep);if(R.reg)setRec('riders',R.reg.riders||0);checkStamps();checkChal()}
function recordsPanel(){
  let h='';const C=G.chal;
  if(SET().chal!==false){h+=`<div class="sec">This week’s challenges<span>${C&&C.list&&C.list.length?`${7-((G.day-1)%7)} day${7-((G.day-1)%7)===1?'':'s'} left`:''}</span></div>`;
    if(!C||!C.list||!C.list.length)h+=`<p class="note">${G.level<1?'Challenges start when you become a Local Airport.':'New challenges arrive at the start of the next game day.'}</p>`;
    else{h+=C.list.map(x=>{const p=CH_POOL.find(q=>q.id===x.id),v=chalProg(x);return `<div class="lreq chal${x.done?' done':''}"><span>${x.done?'✓ ':''}${p.n(x.goal,x.c)}</span><span class="live"><b>${num(Math.min(v,x.goal))}</b> / ${num(x.goal)}</span><div class="prog"><i style="width:${clamp(v/x.goal,0,1)*100}%;background:${x.done?'var(--good)':'var(--sign)'}"></i></div></div>`}).join('');
      h+=`<p class="note">Each pays ${money(C.pay)}. Finish all three for ${TECH.some(T=>!G.tech[T.id])?'a plan point':'a bonus'}.</p>`}}
  const r=G.rec||{};h+=`<div class="sec">Records</div><table class="fin rec">${RECS.filter(([k])=>r[k]>0).map(([k,n,f])=>`<tr><td>${n}</td><td>${f(r[k])}</td></tr>`).join('')||'<tr><td>Finish a day to set your first records.</td><td></td></tr>'}</table>`;
  const st=G.stamps||{},got=STAMPS.filter(S=>st[S.id]),left=STAMPS.length-got.length;
  h+=`<div class="sec">Stamps<span>${got.length} of ${STAMPS.length}</span></div><div class="stamps">${got.map((S,i)=>`<div class="stamp" style="--c:${S.c};--r:${((i*37)%13)-6}deg" title="${S.d}"><b>${S.n}</b><span>${S.d}</span><i>Day ${st[S.id]}</i></div>`).join('')}</div>${left?`<p class="note">${left} more to find.</p>`:''}`;
  return h;
}
/* ================= GUIDED FIRST HOUR: a ring on the real control, one line, and it waits for you ================= */
const TOUR=[
  {t:'Passengers arrive here, check in, clear security and walk to the gates.',w:()=>[20,SEC_Y-6,LAND_R-40,LAND_B-SEC_Y+34],next:1},
  {t:'Tap gate A1 to see its flight.',w:()=>[STAND_X[0]-150,20,300,TERM_Y-20],ok:()=>R.tourTap},
  {t:'Speed time up whenever you like.',q:'.hud [data-speed="4"]',ok:()=>R.speed>=4},
  {t:'Queues growing? Open a second check-in desk.',q:()=>G.tab==='terminal'&&$('[data-buy="desks"]')?'[data-buy="desks"]':'[data-tab="terminal"]',ok:()=>G.lv.desks>=1},
  {t:'Get a flight away on time. The board shows every departure, and punctual ones pay a bonus.',q:'.board',ok:()=>G.ontime>=1},
  {t:'Goals lead the way from here, and tips appear under the map when something needs you.',q:'#goal',next:1,last:1},
];
function tourOn(){return !R.sim&&G.tour&&!G.tour.done&&TOUR[G.tour.s]}
function tourRect(S){
  if(S.w){if(R.view!=='airport')return null;const [x,y,w,h]=S.w(),k=viewK(),sr=$('#stage').getBoundingClientRect();
    let l=sr.left+(x-R.cam.x)*k,t=sr.top+(y-R.cam.y)*k,r=l+w*k,b=t+h*k;l=Math.max(l,sr.left+4);t=Math.max(t,sr.top+4);r=Math.min(r,sr.right-4);b=Math.min(b,sr.bottom-4);return r-l>12&&b-t>12?{left:l,top:t,width:r-l,height:b-t}:null}
  const sel=typeof S.q==='function'?S.q():S.q,el=sel&&document.querySelector(sel);if(!el)return null;const r=el.getBoundingClientRect();return r.width?r:null;
}
function tourStep(){
  const S=tourOn(),c=$('#coach'),sp=$('#spot');if(!S){c.hidden=true;sp.hidden=true;return}
  if(S.ok&&S.ok()){tourNext();return}
  if(c.dataset.s!==String(G.tour.s)){c.dataset.s=G.tour.s;c.innerHTML=`<div class="ct"><span class="cn">${G.tour.s+1}/${TOUR.length}</span>${S.t}</div><div class="cb">${S.next?`<button class="buy" data-tnext="1">${S.last?'Done':'Next'}</button>`:''}${S.last?'':`<button class="buy ghost" data-tskip="1">Skip tour</button>`}</div>`}
  c.hidden=false;const r=tourRect(S),vw=innerWidth,vh=innerHeight,cw=Math.min(340,vw-24);c.style.width=cw+'px';
  if(!r){sp.hidden=true;c.style.left=(vw-cw)/2+'px';c.style.top=Math.max(12,vh-c.offsetHeight-90)+'px';return}
  sp.hidden=false;const pd=6;sp.style.left=(r.left-pd)+'px';sp.style.top=(r.top-pd)+'px';sp.style.width=(r.width+pd*2)+'px';sp.style.height=(r.height+pd*2)+'px';
  const ch=c.offsetHeight,below=r.top+r.height+pd+10,above=r.top-pd-10-ch;let top=below+ch<vh-8?below:above>8?above:Math.min(vh-ch-8,Math.max(8,r.top+r.height/2-ch/2));
  if(top<r.top+r.height&&top+ch>r.top&&r.height>vh*0.4)top=Math.max(8,vh-ch-12);
  c.style.top=top+'px';c.style.left=clamp(r.left+r.width/2-cw/2,12,vw-cw-12)+'px';
}
function tourNext(){G.tour.s++;R.tourTap=false;if(G.tour.s>=TOUR.length){G.tour.done=1;save()}tourStep()}
function startTour(){G.tour={s:0};R.tourTap=false;setView('airport');tourStep()}
$('#tourAgain').addEventListener('click',()=>{openHelp(false);startTour()});
$('#coach').addEventListener('click',e=>{if(e.target.closest('[data-tnext]'))tourNext();else if(e.target.closest('[data-tskip]')){G.tour.done=1;save();tourStep()}});
/* ================= SAVES ACROSS DEVICES: on claude.ai the game also saves to the player's own private space ================= */
const CL={on:false,ref:null,dev:null,last:0,lastClock:null,asking:false,hold:false,busy:false};
function cloudBase(v){const k='final-call-cloud';try{if(v){localStorage.setItem(k,JSON.stringify(v));return v}return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function cloudDev(){let d=null;try{d=localStorage.getItem('final-call-device');if(!d){d=Math.random().toString(36).slice(2,10);localStorage.setItem('final-call-device',d)}}catch(e){d=d||'x'}return d}
async function cloudInit(){
  if(R.sim||!window.claude||typeof window.claude.use!=='function')return;
  let db=null,user=null;try{[db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')])}catch(e){}
  if(!db||!user)return;let uid=null;try{uid=await user.id()}catch(e){}if(!uid)return;
  CL.ref=db.doc('data/users/'+uid+'/save');CL.dev=cloudDev();
  let r=null;try{const sn=await CL.ref.get();r=sn.exists?sn.data():null}catch(e){return}
  CL.on=true;const base=cloudBase();
  if(!r||!r.s||r.dev===CL.dev||(base&&r.at<=base.at))await cloudPut(true);
  else if(!base&&!G.flights||base&&Math.abs(G.clock-base.clock)<1)cloudLoad(r);
  else cloudAsk(r);
  try{CL.ref.onSnapshot(sn=>{const d=sn.exists?sn.data():null;if(!d||!d.s||d.dev===CL.dev||CL.asking)return;const b=cloudBase();if(b&&d.at<=b.at)return;cloudAsk(d)},()=>{})}catch(e){}
  setInterval(()=>{if(Math.abs(G.clock-(CL.lastClock??-1e9))>0.5)cloudPut()},60000);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cloudPut()});
  if(G.tab==='office')renderPanel();
}
async function cloudPut(force){
  if(!CL.on||CL.busy||CL.asking||CL.hold)return;CL.busy=true;
  try{
    if(!force){const sn=await CL.ref.get(),d=sn.exists?sn.data():null,b=cloudBase();if(d&&d.dev!==CL.dev&&(!b||d.at>b.at)){CL.busy=false;cloudAsk(d);return}}
    const at=Date.now();await CL.ref.set({s:JSON.stringify({...G,savedAt:at}),at,clock:G.clock,dev:CL.dev,level:G.level,day:G.day});
    cloudBase({at,clock:G.clock});CL.lastClock=G.clock;CL.last=at;CL.err=null;
  }catch(e){CL.err=(e&&e.code)||'error'}
  CL.busy=false;
}
function cloudLoad(r){
  let o=null;try{o=JSON.parse(r.s)}catch(e){}if(!o||typeof o.cash!=='number'||!Array.isArray(o.stands))return false;
  resetAll(o);cloudBase({at:r.at,clock:G.clock});CL.lastClock=G.clock;CL.last=r.at;save();tourStep();
  R.lastInput=performance.now();toast(`Carried on from your other device: ${lvlName(G.level)}, day ${G.day}.`,null,null,'goal',8);return true;
}
function cloudAsk(r){
  if(CL.asking)return;CL.asking=true;const when=new Date(r.at),t=`${pad(when.getHours())}:${pad(when.getMinutes())}`;
  R.lastInput=performance.now();
  toast(`This airport was also played on another device (${lvlName(r.level|0)}, day ${r.day}, saved at ${t}). Which one do you want to keep?`,[
    {label:'The other device',fn:()=>{CL.asking=false;cloudLoad(r)}},
    {label:'This one',fn:()=>{CL.asking=false;cloudBase({at:r.at,clock:G.clock});cloudPut(true)}},
    {label:'Decide later',fn:()=>{CL.asking=false;CL.hold=true}}],'cloud','warn',900);
}
function cloudNote(){
  if(!CL.on)return 'This copy saves on this device only. When the game runs on claude.ai it also saves to your account.';
  if(CL.hold)return 'Saving to your account is paused until you choose which device’s airport to keep. Reload the game to choose.';
  const m=CL.last?Math.round((Date.now()-CL.last)/60000):null;
  return `Saved to your claude.ai account${m==null?'':m<1?' just now':` ${m} min ago`}. Open the game on another device to carry on there.${CL.err?' The last save didn’t go through; it will try again.':''}`;
}
/*SIM_HOOK*/
const hot=window.claude?.hot;
if(hot&&typeof hot.ready==='function')hot.ready(start);else start(hot?.data??{});
})();
