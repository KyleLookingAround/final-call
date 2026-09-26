/* ================= LAYOUTS: the airport's stands, piers and shop units, and rebuilding into another layout ================= */
// Each layout lists its stands (x, how far back the plane sits, gate name, cost, level, and whether it needs Pier B)
// and its shop units. applyLayout copies the current one into the shared arrays (STAND_X, STAND, GATES, SHOP_X...)
// in place, so everything that reads them follows the layout.
// price, build minutes and level of the n-th stand bought, following Classic's ladder and carrying on past eight
const LADDER=[[0,0,0],[400,30,0],[3000,60,1],[12000,90,3],[80000,120,4],[150000,150,4],[300000,180,6],[500000,210,6],[700000,240,7],[900000,270,7],[1200000,300,8],[1500000,330,8]];
const lad=(x,g,n,o={})=>{const s={x,g,cost:LADDER[n][0],build:LADDER[n][1],lvl:LADDER[n][2],...o};if(!s.pier)delete s.pier;return s};
const LAYOUTS={
  classic:{name:'Classic',W:2480,
    stands:[
      {x:170,g:'A1',cost:0,build:0,lvl:0},{x:470,g:'A2',cost:400,build:30,lvl:0},{x:770,g:'A3',cost:3000,build:60,lvl:1},{x:1070,g:'A4',cost:12000,build:90,lvl:3},
      {x:1370,g:'B1',cost:80000,build:120,lvl:4,pier:1},{x:1670,g:'B2',cost:150000,build:150,lvl:4,pier:1},{x:1970,g:'B3',cost:300000,build:180,lvl:6,pier:1},{x:2270,g:'B4',cost:500000,build:210,lvl:6,pier:1}],
    shops:[[192,'A1'],[492,'A2'],[792,'A3'],[1092,'A4'],[1392,'B1',2],[1692,'B2',2],[1992,'B3',2],[2292,'B4',2]]},
  remote:{name:'Remote apron',plan:'l_remote',lvl:2,pts:1,cost:8000,build:180,W:3800,conc1:2440,
    from:'the remote stands at London Stansted and Luton',
    up:'Four cheap remote stands, before Pier B.',down:'Buses make boarding slower, more so in rain and snow, and cost a little rating.',
    stands:[lad(170,'A1',0),lad(470,'A2',1),lad(770,'A3',2),lad(1070,'A4',3),
      lad(2700,'B1',4,{pier:1}),lad(3000,'B2',5,{pier:1}),lad(3300,'B3',6,{pier:1}),lad(3600,'B4',7,{pier:1}),
      {x:1400,dy:-110,g:'R1',cost:1500,build:30,lvl:2,kind:'remote'},{x:1700,dy:-110,g:'R2',cost:4000,build:40,lvl:2,kind:'remote'},
      {x:2000,dy:-110,g:'R3',cost:9000,build:60,lvl:3,kind:'remote'},{x:2300,dy:-110,g:'R4',cost:20000,build:80,lvl:3,kind:'remote'}],
    order:[0,1,2,3,8,9,10,11,4,5,6,7],
    shops:[[192,'A1'],[492,'A2'],[792,'A3'],[1092,'A4'],[2722,'B1',2],[3022,'B2',2],[3322,'B3',2],[3622,'B4',2]]},
  stagger:{name:'Staggered apron',plan:'l_stagger',lvl:3,pts:1,cost:40000,build:360,W:2870,
    from:'nose-in stands set at two depths, as at many regional airports',
    up:'Ten stands on bridges, with arrivals taxiing in between them.',down:'Back-row bridges are longer, so boarding starts later there.',
    stands:[160,440,720,1000,1280,1560,1840,2120,2400,2680].map((x,k)=>lad(x,(k<4?'A':'B')+(k<4?k+1:k-3),k,{dy:k%2?-110:0,pier:k>=4?1:0})),
    shops:[160,440,720,1000,1280,1560,1840,2120,2400,2680].map((x,k)=>[x+22,(k<4?'A':'B')+(k<4?k+1:k-3),k>=4?2:1])},
  curve:{name:'Curved front',plan:'l_curve',lvl:4,pts:2,cost:120000,build:480,W:2810,conc1:1650,walk:1.25,rep:0.3,hall:[1140,1640],
    from:'curved terminals such as Osaka Kansai, with a control tower in the middle',
    up:'Moving walkways along the curve: boarding starts sooner, fewer late passengers, and a rating bonus.',down:'No extra stands.',
    stands:[[160,-80,'A1'],[440,-40,'A2'],[720,-12,'A3'],[1000,0,'A4'],[1780,0,'B1'],[2060,-12,'B2'],[2340,-40,'B3'],[2620,-80,'B4']].map(([x,dy,g],k)=>lad(x,g,k,{dy,pier:k>=4?1:0})),
    shops:[[182,'A1'],[462,'A2'],[742,'A3'],[1022,'A4'],[1150,'Hall',1,1.2],[1275,'Hall',1,1.2],[1400,'Hall',1,1.2],[1525,'Hall',1,1.2],[1802,'B1',2],[2082,'B2',2],[2362,'B3',2],[2642,'B4',2]]},
  hall:{name:'Hall and finger pier',plan:'l_hall',lvl:5,pts:2,cost:300000,build:600,W:3370,conc1:1650,hall:[1140,1640],
    from:'the central hall and piers of Amsterdam Schiphol',
    up:'Ten stands, and shops gathered in a central hall where passengers spend most.',down:'Long walks to the far end of the pier.',
    stands:[160,440,720,1000,1780,2060,2340,2620,2900,3180].map((x,k)=>lad(x,(k<4?'A':'B')+(k<4?k+1:k-3),k,{pier:k>=4?1:0})),
    shops:[[182,'A1'],[462,'A2'],[742,'A3'],[1022,'A4'],[1150,'Hall',1,1.3],[1275,'Hall',1,1.3],[1400,'Hall',1,1.3],[1525,'Hall',1,1.3],
      ...[1780,2060,2340,2620,2900,3180].map((x,k)=>[x+22,'B'+(k+1),2])]},
  sat:{name:'Satellite',plan:'l_sat',lvl:7,pts:3,cost:1200000,build:960,W:4410,gap:[1232,1620],hall:[2740,3240],mover:1.8,upk:2500,
    from:'the satellites at London Stansted and Munich Terminal 2',p2:'Satellite',
    up:'Twelve stands, a built-in people mover, big duty-free and lounge space, and quicker transfers.',down:'Every walk to the satellite is long, and it costs the most to run after Starfish.',
    stands:[160,440,720,1000,1760,2040,2320,2600,3380,3660,3940,4220].map((x,k)=>lad(x,k<4?'A'+(k+1):'S'+(k-3),k,{pier:k>=4?1:0})),
    shops:[[182,'A1'],[462,'A2'],[742,'A3'],[1022,'A4'],...[1760,2040,2320,2600].map((x,k)=>[x+22,'S'+(k+1),2]),
      [2750,'Hall',2,1.2],[2875,'Hall',2,1.2],[3000,'Hall',2,1.2],[3125,'Hall',2,1.2],...[3380,3660,3940,4220].map((x,k)=>[x+22,'S'+(k+5),2])],
    shopBonus:{duty:1.3,lounge:1.3},xfer:1.5},
  star:{name:'Starfish',plan:'l_star',lvl:9,pts:3,cost:3000000,build:1440,W:4430,conc1:2150,hall:[1140,2140],walk:1.35,rep:0.5,upk:5000,
    from:'the star-shaped terminal at Beijing Daxing, built for short walks',p2:'East wing',
    up:'Twelve stands close to a star-shaped hall, the shortest walks for its size, the most shops and a rating bonus.',down:'The costliest to rebuild and to run.',
    stands:[[160,-100,'A1'],[440,-60,'A2'],[720,-25,'A3'],[1000,0,'A4'],[2280,0,'B1'],[2560,-20,'B2'],[2840,-40,'B3'],[3120,-60,'B4'],[3400,-75,'B5'],[3680,-90,'B6'],[3960,-100,'B7'],[4240,-110,'B8']].map(([x,dy,g],k)=>lad(x,g,k,{dy,pier:k>=4?1:0})),
    shops:[[182,'A1'],[462,'A2'],[742,'A3'],[1022,'A4'],...[1150,1275,1400,1525,1650,1775,1900,2025].map(x=>[x,'Hall',1,1.3]),
      ...[2280,2560,2840,3120,3400,3680,3960,4240].map((x,k)=>[x+22,'B'+(k+1),2])]},
};
const fill=(a,v)=>{a.length=0;a.push(...v);return a};
function applyLayout(id){
  const L=LAYOUTS[id]||LAYOUTS.classic;
  W=L.W;
  fill(STAND_X,L.stands.map(s=>s.x));fill(STAND_DY,L.stands.map(s=>s.dy||0));fill(GATES,L.stands.map(s=>s.g));
  fill(STAND,L.stands.map(s=>{const o={cost:s.cost,build:s.build,lvl:s.lvl};if(s.pier)o.pier=1;return o}));
  fill(SIDX,L.stands.map((s,i)=>i));fill(STAND_ORDER,L.order||SIDX);
  fill(SHOP_X,L.shops.map(s=>s[0]));fill(SHOP_NAME,L.shops.map(s=>s[1]));fill(SHOP_PH,L.shops.map(s=>s[2]||1));
}
