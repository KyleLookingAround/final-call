// Concept plans for the real airport shapes spec (docs/specs/airport-shapes.md): node docs/specs/airport-shapes/plans.mjs
// writes <id>.svg next to this file and a contact sheet in build/concepts.html, and fails if any plane hits another
// plane or a building. Planes park nose-in; heading is where the nose points, degrees clockwise from north (0 = up).
import {mkdirSync,writeFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const out=dirname(fileURLToPath(import.meta.url)),root=join(out,'../../..');

const PL=320,FW=100,SPAN=280,NOSE_GAP=30;
const rad=d=>d*Math.PI/180;
const dirOf=h=>[Math.sin(rad(h)),-Math.cos(rad(h))]; // unit vector the nose points along
const rot=(x,y,h)=>{const c=Math.cos(rad(h)),s=Math.sin(rad(h));return [x*c-y*s,x*s+y*c]};
// a plane's outline pieces in its own frame: nose at (0,0), body along +y
const PIECES=[[[-FW/2,20],[FW/2,20],[FW/2,PL],[-FW/2,PL]],[[-SPAN/2,150],[SPAN/2,150],[SPAN/2,205],[-SPAN/2,205]],[[-60,285],[60,285],[60,PL],[-60,PL]]];
const planePolys=s=>PIECES.map(p=>p.map(([x,y])=>{const [a,b]=rot(x,y,s.h);return [s.x+a,s.y+b]}));
// separating-axis test for convex polygons
function overlap(A,B){for(const P of [A,B])for(let i=0;i<P.length;i++){const [x1,y1]=P[i],[x2,y2]=P[(i+1)%P.length],nx=y2-y1,ny=x1-x2;
  let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;for(const [x,y] of A){const d=x*nx+y*ny;a0=Math.min(a0,d);a1=Math.max(a1,d)}for(const [x,y] of B){const d=x*nx+y*ny;b0=Math.min(b0,d);b1=Math.max(b1,d)}
  if(a1<=b0||b1<=a0)return false}return true}
const rectPoly=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
const circlePoly=(cx,cy,r,n=20)=>[...Array(n)].map((_,k)=>[cx+r*Math.cos(k*2*Math.PI/n),cy+r*Math.sin(k*2*Math.PI/n)]);
// a pier: a thick line from (x,y) heading h for length L; returns its polygon and a helper placing stands along it
function pier(x,y,h,L,w=80){const [dx,dy]=dirOf(h),nx=-dy,ny=dx;
  const poly=[[x+nx*w/2,y+ny*w/2],[x+dx*L+nx*w/2,y+dy*L+ny*w/2],[x+dx*L-nx*w/2,y+dy*L-ny*w/2],[x-nx*w/2,y-ny*w/2]];
  // side +1 is to the right of the pier's direction; lean tilts the plane (herringbone)
  const at=(d,side,g,o={})=>{const nX=side*nx,nY=side*ny,px=x+dx*d+nX*(w/2+NOSE_GAP),py=y+dy*d+nY*(w/2+NOSE_GAP);
    return {x:px,y:py,h:(Math.atan2(nX,-nY)*180/Math.PI+180+(o.lean||0)*side+360)%360,g,...o}};
  const tip=(g,o={})=>({x:x+dx*(L+NOSE_GAP),y:y+dy*(L+NOSE_GAP),h:(h+180)%360,g,...o});
  return {poly,at,tip,end:[x+dx*L,y+dy*L]}}
// a stand whose nose points at (cx,cy) from distance r at bearing b (degrees clockwise from north)
const radial=(cx,cy,r,b,g,o={})=>{const [dx,dy]=dirOf(b);return {x:cx+dx*r,y:cy+dy*r,h:(b+180)%360,g,...o}};

const C={bg:'#0F1215',field:'#12171A',apron:'#161B20',rwy:'#0B0E11',bld:'#2A3037',bldEdge:'#46505A',roof:'#39414A',land:'#101316',
  yellow:'#FFC72C',blue:'#5CC8FF',plane:'#CDD4DA',cabin:'#A9B3BC',wing:'#7F8A94',bridge:'#5A646E',text:'#A9B3BC',dim:'#5A646E',shop:'#D9A066',green:'#6BE39A'};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const P=pts=>pts.map(p=>p.map(v=>Math.round(v)).join(',')).join(' ');

function planeSVG(s){const k=s.wide?1.15:1;
  const pax=[...Array(8)].map((_,r)=>[...Array(6)].map((_,c)=>((r*7+c*3+s.x)%5<2)?`<rect x="${-36+c*12+(c>2?8:0)}" y="${70+r*24}" width="7" height="9" fill="${['#5CC8FF','#FF9F43','#C39BFF','#6BE39A'][(r+c)%4]}"/>`:'').join('')).join('');
  return `<g transform="translate(${Math.round(s.x)},${Math.round(s.y)}) rotate(${Math.round(s.h)}) scale(${k})">
<polygon points="${P([[-SPAN/2,190],[-FW/2,130],[FW/2,130],[SPAN/2,190],[SPAN/2,205],[FW/2,190],[-FW/2,190],[-SPAN/2,205]])}" fill="${C.wing}"/>
<polygon points="${P([[-60,300],[-FW/2+10,275],[FW/2-10,275],[60,300],[60,312],[-60,312]])}" fill="${C.wing}"/>
<path d="M${-FW/2},70 Q${-FW/2},0 0,0 Q${FW/2},0 ${FW/2},70 L${FW/2-8},${PL-10} Q0,${PL+8} ${-FW/2+8},${PL-10} Z" fill="${C.plane}"/>
<rect x="-42" y="62" width="84" height="200" rx="6" fill="${C.cabin}"/>${pax}</g>`}
// a jet bridge from the building to the front left door (a short way behind the nose, on the left of the nose direction)
function bridgeSVG(s){if(s.kind==='remote')return '';const [dx,dy]=dirOf(s.h),lx=dy,ly=-dx; // left of the nose direction
  const door=[s.x-dx*55+lx*FW/2,s.y-dy*55+ly*FW/2],base=[s.x+dx*(NOSE_GAP+6)+lx*70,s.y+dy*(NOSE_GAP+6)+ly*70];
  return `<line x1="${base[0]|0}" y1="${base[1]|0}" x2="${door[0]|0}" y2="${door[1]|0}" stroke="${C.bridge}" stroke-width="22" stroke-linecap="round"/>`}
function labelSVG(s){const [dx,dy]=dirOf(s.h),t=[s.x-dx*(PL+46),s.y-dy*(PL+46)];
  return `<g transform="translate(${t[0]|0},${t[1]|0})"><rect x="-30" y="-17" width="60" height="30" rx="4" fill="${s.kind==='remote'?C.blue:C.yellow}"/><text x="0" y="6" font-size="20" text-anchor="middle" fill="#14171B" font-weight="700">${esc(s.g)}</text></g>`}

function render(L){
  const b=L.box,[x0,y0,x1,y1]=b,w=x1-x0,h=y1-y0,parts=[];
  parts.push(`<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${C.field}"/>`);
  if(L.runway!=null)parts.push(`<rect x="${x0+60}" y="${L.runway}" width="${w-120}" height="70" fill="${C.rwy}"/><line x1="${x0+140}" y1="${L.runway+35}" x2="${x1-140}" y2="${L.runway+35}" stroke="rgba(236,232,223,.45)" stroke-width="4" stroke-dasharray="40 34"/>`,
    `<line x1="${x0+60}" y1="${L.runway+170}" x2="${x1-60}" y2="${L.runway+170}" stroke="rgba(255,199,44,.5)" stroke-width="4" stroke-dasharray="20 20"/>`);
  for(const a of L.aprons||[])parts.push(`<polygon points="${P(a)}" fill="${C.apron}"/>`);
  for(const t of L.taxi||[])parts.push(`<polyline points="${P(t)}" fill="none" stroke="rgba(255,199,44,.45)" stroke-width="4" stroke-dasharray="20 20"/>`);
  if(L.landside){const [lx0,lx1]=L.landsideX||[x0,x1],lw=lx1-lx0;parts.push(`<rect x="${lx0}" y="${L.landside}" width="${lw}" height="${y1-L.landside}" fill="${C.land}"/>`,
    `<line x1="${lx0}" y1="${L.landside+70}" x2="${lx1}" y2="${L.landside+70}" stroke="#2A3037" stroke-width="40"/>`,
    ...[...Array(Math.floor(lw/60))].map((_,k)=>`<rect x="${lx0+20+k*60}" y="${L.landside+120}" width="40" height="60" fill="none" stroke="#232930" stroke-width="3"/>`),
    `<text x="${lx0+30}" y="${y1-30}" font-size="30" fill="${C.dim}">CAR PARK · FORECOURT · RAIL</text>`)}
  for(const r of L.roads||[])parts.push(`<polyline points="${P(r)}" fill="none" stroke="#2F363E" stroke-width="34" stroke-linejoin="round"/>`);
  for(const t of L.trains||[])parts.push(`<polyline points="${P(t)}" fill="none" stroke="${C.blue}" stroke-width="6" stroke-dasharray="26 16" opacity=".8"/>`);
  for(const s of L.stands)parts.push(bridgeSVG(s));
  for(const p of L.buildings)parts.push(p.circle?`<circle cx="${p.circle[0]}" cy="${p.circle[1]}" r="${p.circle[2]}" fill="${p.fill||C.bld}" stroke="${C.bldEdge}" stroke-width="5"/>`
    :`<polygon points="${P(p.poly)}" fill="${p.fill||C.bld}" stroke="${C.bldEdge}" stroke-width="5" stroke-linejoin="round"/>`);
  for(const d of L.decor||[])parts.push(d);
  for(const s of L.shops||[])parts.push(`<rect x="${s[0]-22}" y="${s[1]-14}" width="44" height="28" rx="4" fill="${C.shop}" opacity=".85"/>`);
  for(const s of L.stands)parts.push(planeSVG(s));
  for(const s of L.stands)parts.push(labelSVG(s));
  for(const v of L.vehicles||[])parts.push(v);
  for(const t of L.labels||[])parts.push(`<text x="${t[0]}" y="${t[1]}" font-size="${t[3]||30}" fill="${t[4]||C.text}" text-anchor="middle" font-weight="600" letter-spacing="2">${esc(t[2])}</text>`);
  // title card
  const tw=Math.min(w-80,1500);
  parts.push(`<rect x="${x0+40}" y="${y0+30}" width="${tw}" height="${L.notes.length*44+96}" rx="10" fill="rgba(15,18,21,.88)" stroke="${C.bldEdge}" stroke-width="3"/>`,
    `<text x="${x0+70}" y="${y0+92}" font-size="46" fill="${C.yellow}" font-weight="700">${esc(L.name)}</text>`,
    ...L.notes.map((n,k)=>`<text x="${x0+70}" y="${y0+148+k*44}" font-size="30" fill="${C.text}">${esc(n)}</text>`));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${w} ${h}" width="${Math.round(w/3)}" height="${Math.round(h/3)}" font-family="ui-monospace,Menlo,Consolas,monospace">${parts.join('\n')}</svg>\n`}

// checks: no two planes overlap, and no plane overlaps a building
function check(L){const bad=[],polys=L.stands.map(planePolys),bp=L.buildings.map(b=>b.circle?circlePoly(...b.circle):b.poly);
  for(let i=0;i<polys.length;i++){for(let j=i+1;j<polys.length;j++)if(polys[i].some(a=>polys[j].some(b=>overlap(a,b))))bad.push(`${L.stands[i].g} hits ${L.stands[j].g}`);
    bp.forEach((b,k)=>{if(polys[i].some(a=>overlap(a,b)))bad.push(`${L.stands[i].g} hits building ${k}`)})}
  const [x0,y0,x1,y1]=L.box;for(const [i,p] of polys.entries())for(const [x,y] of p.flat())if(x<x0||x>x1||y<y0||y>y1){bad.push(`${L.stands[i].g} off the map`);break}
  return bad}

const LAY=[];
// shared: a main terminal whose airside face is at y=Yt, from x=a to x=b, with the landside below
const terminal=(a,b,Yt,depth=240)=>({poly:rectPoly(a,Yt,b-a,depth)});
const row=(xs,Yt,pre,o={})=>xs.map((x,k)=>({x,y:Yt-NOSE_GAP,h:180,g:pre+(k+1),...o}));
const tower=(x,y)=>`<circle cx="${x}" cy="${y}" r="46" fill="#20272E" stroke="${C.green}" stroke-width="6"/><circle cx="${x}" cy="${y}" r="20" fill="${C.green}" opacity=".7"/>`;
const bus=(x,y,a=0)=>`<g transform="translate(${x},${y}) rotate(${a})"><rect x="-44" y="-16" width="88" height="32" rx="6" fill="${C.yellow}"/><rect x="-36" y="-9" width="72" height="10" fill="#14171B" opacity=".6"/></g>`;
const train=(x,y,a=0)=>`<g transform="translate(${x},${y}) rotate(${a})"><rect x="-70" y="-17" width="140" height="34" rx="16" fill="${C.blue}"/><rect x="-58" y="-7" width="116" height="10" fill="#14171B" opacity=".5"/></g>`;

// 1. Classic, refreshed: the same straight terminal and A gates; Pier B becomes a real pier out onto the apron
{const Yt=1500,st=[...row([230,560,890,1220],Yt,'A')],pb=pier(1560,Yt,0,960);
  st.push(pb.at(540,-1,'B1'),pb.at(870,-1,'B2'),pb.at(540,1,'B3'),pb.at(870,1,'B4'));
  LAY.push({id:'classic',name:'Classic, refreshed',box:[0,0,2200,2000],runway:120,landside:Yt+240,
    notes:['Today\'s airport, a little more real: planes park nose-in,','Pier B becomes a pier out onto the apron, and a control tower.','8 stands, as now.'],
    aprons:[rectPoly(0,330,2200,Yt-330)],taxi:[[[80,290],[80,Yt-420],[2120,Yt-420]]],buildings:[terminal(0,1640,Yt),{poly:pb.poly}],stands:st,
    shops:[[300,Yt+60],[630,Yt+60],[960,Yt+60],[1290,Yt+60],[1560,Yt-300],[1560,Yt-620]],decor:[tower(1900,Yt+120)],
    labels:[[820,Yt+170,'TERMINAL · CHECK-IN · SECURITY'],[1560,Yt-980,'PIER B',26]]})}

// 2. Remote apron: Classic plus a remote apron reached by bus, with a mobile lounge (Washington Dulles)
{const Yt=1500,st=[...row([230,560,890,1220],Yt,'A')],pb=pier(1560,Yt,0,960);
  st.push(pb.at(540,-1,'B1'),pb.at(870,-1,'B2'),pb.at(540,1,'B3'),pb.at(870,1,'B4'));
  st.push(...[2180,2510,2840,3170].map((x,k)=>({x,y:Yt-120,h:180,g:'R'+(k+1),kind:'remote'})));
  LAY.push({id:'remote',name:'Remote apron · London Stansted and Luton',box:[0,0,3400,2000],runway:120,landside:Yt+240,
    notes:['Classic plus four remote stands on the open apron.','Buses drive out; mobile lounges on stilts (Washington Dulles)','rise to the door as an upgrade.'],
    aprons:[rectPoly(0,330,3400,Yt-330)],taxi:[[[80,290],[80,Yt-420],[3320,Yt-420]]],roads:[[[1640,Yt+20],[3300,Yt+20]]],
    buildings:[terminal(0,1640,Yt),{poly:pb.poly}],stands:st,decor:[tower(1900,Yt+150),...[2180,2510,2840,3170].map(x=>`<line x1="${x-60}" y1="${Yt-90}" x2="${x+60}" y2="${Yt-90}" stroke="${C.yellow}" stroke-width="6"/>`)],
    vehicles:[bus(1900,Yt+20),bus(2330,Yt-60,90),`<g transform="translate(2940,${Yt-185})"><rect x="-40" y="-60" width="80" height="120" rx="8" fill="${C.green}"/><rect x="-30" y="-50" width="60" height="100" fill="#14171B" opacity=".4"/></g>`],
    labels:[[820,Yt+170,'TERMINAL · CHECK-IN · SECURITY'],[2680,Yt+100,'BUS ROAD TO THE REMOTE STANDS',26],[2940,Yt-30,'MOBILE LOUNGE',22,C.green]]})}

// 3. Staggered apron: a herringbone pier, planes angled along both sides
{const Yt=1800,st=[...row([230,560],Yt,'A'),...row([1360,1690],Yt,'A').map((s,k)=>({...s,g:'A'+(k+3)}))],pb=pier(960,Yt,0,1420);
  st.push(pb.at(560,-1,'B1',{lean:-30}),pb.at(890,-1,'B2',{lean:-30}),pb.at(1220,-1,'B3',{lean:-30}),pb.at(560,1,'B4',{lean:-30}),pb.at(890,1,'B5',{lean:-30}),pb.at(1220,1,'B6',{lean:-30}));
  LAY.push({id:'stagger',name:'Staggered apron',box:[0,0,1920,2300],runway:60,landside:Yt+240,
    notes:['A herringbone pier: planes park at an angle down both sides,','so more of them fit along a short pier.','10 stands.'],
    aprons:[rectPoly(0,260,1920,Yt-260)],taxi:[[[60,230],[60,Yt-400]],[[1860,230],[1860,Yt-400]]],buildings:[terminal(0,1920,Yt),{poly:pb.poly}],stands:st,
    shops:[[960,Yt+60],[860,Yt+60],[1060,Yt+60],[960,Yt-400],[960,Yt-800]],decor:[tower(1780,Yt+140)],labels:[[600,Yt+170,'TERMINAL · CHECK-IN · SECURITY']]})}

// 4. Curved front: an arc with planes fanned round it (Osaka Kansai, Berlin Tempelhof)
{const cx=1700,cy=2750,Ra=1700,st=[],bs=[-44,-32,-20,-8,8,20,32,44];
  bs.forEach((b,k)=>st.push(radial(cx,cy,Ra+NOSE_GAP,b,(k<4?'A':'B')+(k<4?k+1:k-3))));
  const arc=(r,a0,a1,n=40)=>[...Array(n+1)].map((_,k)=>{const b=a0+(a1-a0)*k/n,[dx,dy]=dirOf(b);return [cx+dx*r,cy+dy*r]});
  const bld=[...arc(Ra,-52,52),...arc(Ra-190,52,-52)];
  LAY.push({id:'curve',name:'Curved front · Osaka Kansai, Berlin Tempelhof',box:[0,0,3400,2400],runway:60,landside:1980,
    notes:['One long curved building with planes fanned round the outside.','Moving walkways run along the curve; the tower sits at its centre.','8 stands.'],
    aprons:[rectPoly(0,260,3400,1720)],taxi:[arc(Ra+PL+170,-58,58)],buildings:[{poly:bld}],stands:st,
    decor:[`<polyline points="${P(arc(Ra-95,-50,50))}" fill="none" stroke="${C.blue}" stroke-width="10" opacity=".5"/>`,tower(cx,2200)],
    shops:[-36,-14,14,36].map(b=>{const [dx,dy]=dirOf(b);return [cx+dx*(Ra-140),cy+dy*(Ra-140)]}),
    labels:[[cx,2320,'TERMINAL · CHECK-IN · SECURITY'],[cx,1240,'MOVING WALKWAYS',24,C.blue]]})}

// 5. Hall and finger piers: piers fanning out from a central hall of shops (Amsterdam Schiphol)
{const hx=1650,Yt=2150,st=[],hall=[[hx-420,Yt],[hx-300,Yt-260],[hx+300,Yt-260],[hx+420,Yt],[hx+420,Yt+240],[hx-420,Yt+240]];
  const pa=pier(hx-300,Yt-240,-55,900),pbb=pier(hx,Yt-260,0,1100),pc=pier(hx+300,Yt-240,55,900);
  st.push(pa.at(560,-1,'A1'),pa.at(560,1,'A2'),pa.tip('A3'),pbb.at(560,-1,'B1'),pbb.at(880,-1,'B2'),pbb.at(560,1,'B3'),pbb.at(880,1,'B4'),pc.at(560,-1,'C1'),pc.at(560,1,'C2'),pc.tip('C3'));
  LAY.push({id:'hall',name:'Hall and finger piers · Amsterdam Schiphol',box:[0,0,3300,2600],runway:60,landside:Yt+240,
    notes:['A central hall where most shops cluster, with piers fanning out.','Short walks to the pier roots, long ones to the tips.','10 stands.'],
    aprons:[rectPoly(0,260,3300,Yt-260)],taxi:[[[60,230],[60,Yt-300]],[[3240,230],[3240,Yt-300]]],buildings:[{poly:hall},{poly:pa.poly},{poly:pbb.poly},{poly:pc.poly}],stands:st,
    shops:[[hx-240,Yt-100],[hx-120,Yt-100],[hx,Yt-100],[hx+120,Yt-100],[hx+240,Yt-100],[hx-180,Yt+10],[hx-60,Yt+10],[hx+60,Yt+10],[hx+180,Yt+10]],decor:[tower(hx+700,Yt+140)],
    labels:[[hx,Yt+170,'CENTRAL HALL · CHECK-IN · SECURITY']]})}

// 6. Satellite: the main building and two satellites out on the apron, joined by an underground train (London Heathrow T5)
{const Yt=3000,cx=900,st=[...row([420,740,1060,1380],Yt,'A')],sats=[];
  for(const [n,yb] of [[0,Yt-940],[1,Yt-1900]]){const top=yb-90;sats.push({poly:rectPoly(cx-420,top,840,90)});
    [cx-160,cx+160].forEach((x,k)=>{st.push({x,y:yb+NOSE_GAP,h:0,g:(n?'C':'B')+(k+1)},{x,y:top-NOSE_GAP,h:180,g:(n?'C':'B')+(k+3)})})}
  LAY.push({id:'sat',name:'Satellite · London Heathrow Terminal 5',box:[0,0,1800,3500],runway:60,landside:Yt+240,
    notes:['The main building and two satellites out on the apron,','joined by an underground train.','12 stands.'],
    aprons:[rectPoly(0,260,1800,Yt-260)],taxi:[[[60,230],[60,Yt-380],[1740,Yt-380],[1740,230]],[[60,Yt-1340],[1740,Yt-1340]]],trains:[[[cx,Yt+120],[cx,Yt-1945]]],
    buildings:[terminal(60,1740,Yt),...sats],stands:st,shops:[[cx-300,Yt-985],[cx+300,Yt-985],[cx-300,Yt-1945],[cx+300,Yt-1945],[cx-120,Yt+70],[cx+120,Yt+70]],
    vehicles:[train(cx,Yt-600,90)],decor:[tower(1600,Yt+140)],
    labels:[[cx,Yt+190,'TERMINAL 5A · CHECK-IN · SECURITY'],[cx-560,Yt-970,'5B',34],[cx-560,Yt-1930,'5C',34],[cx+130,Yt-600,'TRANSIT',24,C.blue]]})}

// 7. Starfish: five piers from a central hall, the sixth spoke is the way in from the road and rail (Beijing Daxing)
{const hx=2000,hy=1900,R=420,st=[],hall=[...Array(12)].map((_,k)=>{const b=k*30,[dx,dy]=dirOf(b),r=k%2?R:R*0.82;return [hx+dx*r,hy+dy*r]});
  const mk=b=>{const [dx,dy]=dirOf(b);return pier(hx+dx*(R-60),hy+dy*(R-60),b,760,110)};
  const nw=mk(300),n=mk(0),ne=mk(60),sw=mk(240),se=mk(120);
  st.push(sw.tip(''),sw.at(560,1,''),nw.at(600,-1,''),nw.tip(''),nw.at(600,1,''),n.at(560,-1,''),n.at(560,1,''),ne.at(600,-1,''),ne.tip(''),ne.at(600,1,''),se.at(560,-1,''),se.tip(''));
  st.forEach((s,k)=>s.g=(k<4?'A':'B')+(k<4?k+1:k-3));
  LAY.push({id:'star',name:'Starfish · Beijing Daxing',box:[0,0,4000,3000],runway:60,landside:hy+R+120,landsideX:[hx-420,hx+420],
    notes:['Five piers radiate from one central hall, so no gate is far','from the middle; road and rail come in on the sixth spoke.','The most shops, and the shortest walks for its size. 12 stands.'],
    aprons:[rectPoly(0,260,4000,2740)],taxi:[[[60,230],[60,2900]],[[3940,230],[3940,2900]]],buildings:[...[nw,n,ne,sw,se].map(p=>({poly:p.poly})),{poly:hall}],stands:st,
    shops:[...Array(10)].map((_,k)=>{const b=k*36,[dx,dy]=dirOf(b);return [hx+dx*230,hy+dy*230]}),decor:[`<circle cx="${hx}" cy="${hy}" r="110" fill="#20272E" stroke="${C.blue}" stroke-width="4" opacity=".8"/>`,tower(hx+500,hy+720)],
    labels:[[hx,hy+R+80,'CENTRAL HALL · CHECK-IN · SECURITY',26]]})}

// 8. Midfield concourses: parallel concourses strung along a train (Atlanta, Denver)
{const Yt=3950,cx=1000,st=[...row([520,840,1160,1480],Yt,'T')],bars=[],gap=960;
  ['A','B','C'].forEach((n,k)=>{const yb=Yt-940-k*gap,top=yb-90;bars.push({poly:rectPoly(cx-520,top,1040,90)});
    [cx-170,cx+170].forEach((x,j)=>st.push({x,y:yb+NOSE_GAP,h:0,g:n+(j+1)},{x,y:top-NOSE_GAP,h:180,g:n+(j+3)}))});
  const tent=[...Array(9)].map((_,k)=>`<polyline points="${P([[140+k*190,Yt+40],[235+k*190,Yt-10],[330+k*190,Yt+40]])}" fill="none" stroke="#E6E1D6" stroke-width="6" opacity=".7"/>`);
  LAY.push({id:'midfield',name:'Midfield concourses · Atlanta, Denver',box:[0,0,2000,4450],runway:60,landside:Yt+240,
    notes:['Long concourses stand across the airfield, one behind another,','strung along an underground train. The most stands of all.','16 stands.'],
    aprons:[rectPoly(0,260,2000,Yt-260)],taxi:[[[60,230],[60,Yt-380],[1940,Yt-380],[1940,230]],[[60,Yt-1340],[1940,Yt-1340]],[[60,Yt-2300],[1940,Yt-2300]]],trains:[[[cx,Yt+120],[cx,Yt-2905]]],
    buildings:[terminal(60,1940,Yt),...bars],stands:st,shops:[...['A','B','C'].flatMap((_,k)=>[[cx-380,Yt-985-k*gap],[cx+380,Yt-985-k*gap]])],
    vehicles:[train(cx,Yt-1500,90)],decor:[...tent,tower(1820,Yt+150)],
    labels:[[cx,Yt+190,'TERMINAL · CHECK-IN · SECURITY'],...['A','B','C'].map((n,k)=>[cx-640,Yt-970-k*gap,n,40]),[cx+150,Yt-600,'PLANE TRAIN',24,C.blue]]})}

// 9. Round terminal: a round building with satellites reached through tunnels (Paris Charles de Gaulle Terminal 1)
{const hx=2000,hy=2350,st=[],pods=[];
  [-80,-48,-16,16,48,80].forEach((b,k)=>{const [dx,dy]=dirOf(b),px=hx+dx*1150,py=hy+dy*1150;pods.push([px,py,b]);
    st.push(radial(px,py,95+NOSE_GAP,b-42,''),radial(px,py,95+NOSE_GAP,b+42,''))});
  st.forEach((s,k)=>s.g=(k<4?'A':'B')+(k<4?k+1:k-3));
  const tubes=[[-50,130],[-20,160],[20,-160],[50,-130],[0,180]].map(([a,b])=>{const [ax,ay]=dirOf(a),[bx,by]=dirOf(b);return `<line x1="${hx+ax*280}" y1="${hy+ay*280}" x2="${hx+bx*280}" y2="${hy+by*280}" stroke="${C.blue}" stroke-width="10" opacity=".65"/>`});
  LAY.push({id:'round',name:'Round terminal · Paris Charles de Gaulle Terminal 1',box:[0,0,4000,2900],runway:60,landside:hy+320,
    notes:['A round concrete terminal with glass escalator tubes across','its open middle; small satellites reached through tunnels.','12 stands.'],
    aprons:[rectPoly(0,260,4000,hy)],taxi:[[[60,230],[60,hy]],[[3940,230],[3940,hy]]],trains:pods.map(([px,py])=>[[hx,hy],[px,py]]),
    buildings:[{circle:[hx,hy,330]},...pods.map(([px,py])=>({circle:[px,py,95]}))],stands:st,decor:[`<circle cx="${hx}" cy="${hy}" r="150" fill="#101316"/>`,...tubes],
    shops:pods.map(([px,py])=>[px,py]),labels:[[hx,hy+440,'CHECK-IN · SECURITY IN THE RING'],[hx,hy-700,'TUNNELS WITH MOVING WALKWAYS',24,C.blue]]})}

let fail=0;
for(const L of LAY){const bad=check(L);if(bad.length){fail++;console.log(L.id,'✗',bad.join('; '))}else console.log(L.id,'✓',L.stands.length,'stands');
  writeFileSync(join(out,L.id+'.svg'),render(L))}
// contact sheet for a quick look
mkdirSync(join(root,'build'),{recursive:true});writeFileSync(join(root,'build/concepts.html'),`<!doctype html><meta charset="utf-8"><body style="margin:0;background:#0F1215;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:16px">`+
  LAY.map(L=>`<img src="../docs/specs/airport-shapes/${L.id}.svg" style="width:100%;border:1px solid #2A3037">`).join('')+'</body>');
process.exit(fail?1:0);
