/* ================= LAYOUTS: the airport's stands, piers and shop units, and rebuilding into another layout ================= */
// Each layout lists its stands (x, how far back the plane sits, gate name, cost, level, and whether it needs Pier B)
// and its shop units. applyLayout copies the current one into the shared arrays (STAND_X, STAND, GATES, SHOP_X...)
// in place, so everything that reads them follows the layout.
const LAYOUTS={
  classic:{name:'Classic',W:2480,
    stands:[
      {x:170,g:'A1',cost:0,build:0,lvl:0},{x:470,g:'A2',cost:400,build:30,lvl:0},{x:770,g:'A3',cost:3000,build:60,lvl:1},{x:1070,g:'A4',cost:12000,build:90,lvl:3},
      {x:1370,g:'B1',cost:80000,build:120,lvl:4,pier:1},{x:1670,g:'B2',cost:150000,build:150,lvl:4,pier:1},{x:1970,g:'B3',cost:300000,build:180,lvl:6,pier:1},{x:2270,g:'B4',cost:500000,build:210,lvl:6,pier:1}],
    shops:[[192,'A1'],[492,'A2'],[792,'A3'],[1092,'A4'],[1392,'B1',2],[1692,'B2',2],[1992,'B3',2],[2292,'B4',2]]},
};
const fill=(a,v)=>{a.length=0;a.push(...v);return a};
function applyLayout(id){
  const L=LAYOUTS[id]||LAYOUTS.classic;
  W=L.W;
  fill(STAND_X,L.stands.map(s=>s.x));fill(STAND_DY,L.stands.map(s=>s.dy||0));fill(GATES,L.stands.map(s=>s.g));
  fill(STAND,L.stands.map(s=>{const o={cost:s.cost,build:s.build,lvl:s.lvl};if(s.pier)o.pier=1;return o}));
  fill(SIDX,L.stands.map((s,i)=>i));
  fill(SHOP_X,L.shops.map(s=>s[0]));fill(SHOP_NAME,L.shops.map(s=>s[1]));fill(SHOP_PH,L.shops.map(s=>s[2]||1));
}
