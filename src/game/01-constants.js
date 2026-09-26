/* ================= constants ================= */
const NG=12,NU=20,H=640,SEATW=15,AISLE=16,CABIN_TOP=110,CABIN_MAX=250,TERM_Y=446,SEC_Y=522,LAND_B=614,LAND_R=1232,GAP=0.95,SPACING=8.5;
const SIDX=[0,1,2,3,4,5,6,7],STAND_ORDER=[0,1,2,3,4,5,6,7]; // the current layout's stands, and the order they're bought in
// the airport's layout: these arrays hold the current layout's stands and shop units (39-layouts.js fills them in place)
let W=2480; // world width
const STAND_X=[170,470,770,1070,1370,1670,1970,2270];
const STAND_DY=[0,0,0,0,0,0,0,0]; // how far each stand's plane sits back from the concourse
const GATES=['A1','A2','A3','A4','B1','B2','B3','B4'];
const SHOP_X=STAND_X.map(x=>x+22),SHOP_PH=[1,1,1,1,2,2,2,2],SHOP_NAME=GATES.slice(); // shop units: left edge, phase (2 needs Pier B), label
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
const tripMins=a=>Math.round(TRIP[a.tier]*(0.85+rnd()*0.3));
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
