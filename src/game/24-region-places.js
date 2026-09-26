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
const pickOf=a=>a[Math.floor(rnd()*a.length)];
const RLBL={road:'bus',track:'tram',rail:'train',water:'bus'};

