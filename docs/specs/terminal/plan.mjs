// Concept floor plan for the terminal spec (docs/specs/terminal.md): node docs/specs/terminal/plan.mjs
// writes classic.svg next to this file. A plan, not to scale: halls, what's in them, and how people and bags flow.
import {writeFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const out=dirname(fileURLToPath(import.meta.url));
const C={bg:'#0F1215',apron:'#161B20',bld:'#2A3037',edge:'#46505A',air:'#232A31',land:'#1E2429',text:'#DCE3E8',dim:'#8C97A1',
  dep:'#FFC72C',arr:'#5CC8FF',bag:'#FF9F43',shop:'#D9A066',seat:'#3A444E',green:'#6BE39A',red:'#FF7A8A',plane:'#CDD4DA'};
const s=[];const add=x=>s.push(x);
const rect=(x,y,w,h,f,st=C.edge,r=6)=>add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" stroke="${st}" stroke-width="1.5"/>`);
const text=(x,y,t,o={})=>add(`<text x="${x}" y="${y}" fill="${o.c||C.text}" font-size="${o.s||13}" font-weight="${o.w||600}" text-anchor="${o.a||'middle'}" font-family="system-ui,sans-serif">${t}</text>`);
const hall=(x,y,w,h,name,sub,f=C.bld)=>{rect(x,y,w,h,f);text(x+10,y+18,name,{a:'start',s:13});if(sub)text(x+10,y+33,sub,{a:'start',s:10.5,w:400,c:C.dim})};
const path=(pts,c,dash)=>add(`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${c}" stroke-width="3" ${dash?'stroke-dasharray="7 6"':''} stroke-linejoin="round" marker-end="url(#a${c.slice(1)})"/>`);
const W=1240,H=780;
add(`<defs>${[C.dep,C.arr,C.bag].map(c=>`<marker id="a${c.slice(1)}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="${c}"/></marker>`).join('')}</defs>`);
add(`<rect width="${W}" height="${H}" fill="${C.bg}"/>`);
// apron and planes (nose-in at the concourse), Pier B, the service road
rect(0,0,W,150,C.apron,'none',0);text(20,22,'APRON',{a:'start',c:C.dim,s:11});
const plane=(x,g)=>{add(`<g transform="translate(${x},148)"><rect x="-16" y="-120" width="32" height="112" rx="14" fill="${C.plane}"/><rect x="-62" y="-80" width="124" height="18" rx="6" fill="${C.plane}" opacity=".8"/><rect x="-22" y="-124" width="44" height="12" rx="5" fill="${C.plane}" opacity=".8"/></g>`);text(x,20,g,{c:C.dep,s:12})};
[140,320,500,680].forEach((x,k)=>plane(x,'A'+(k+1)));
rect(860,10,70,140,C.bld);text(895,80,'PIER B',{s:10.5,c:C.dim});
add(`<path d="M20 132 H1220" stroke="#3A444E" stroke-width="10" fill="none"/>`);text(1080,126,'service road: tug trains with bag carts',{s:10,c:C.bag,w:500});
// airside: arrivals corridor, gate lounges, market place
rect(40,150,900,14,'#1B3140',C.arr,2);text(250,161,'ARRIVALS CORRIDOR: arriving passengers never meet departing ones',{s:9.5,c:C.arr,w:500});
hall(40,168,900,82,'Gate lounges','seats by each gate, window seats, charging points, toilets',C.air);
for(const x of [120,300,480,660])for(let r=0;r<3;r++)for(let c=0;c<6;c++)rect(x-45+c*15,207+r*13,11,8,C.seat,'none',2);
hall(40,254,380,150,'Market place (airside)','duty free, food court, bar, play area, lounge',C.air);
rect(60,300,150,90,'#2E2A22',C.shop);text(135,316,'DUTY FREE',{s:10,c:C.shop});add(`<path d="M72 385 C95 330 115 380 135 330 S175 380 198 325" stroke="${C.shop}" stroke-dasharray="3 4" fill="none"/>`);
rect(222,300,90,52,'#2E2A22',C.shop);text(267,316,'CAFÉ',{s:10,c:C.shop});for(let c=0;c<3;c++)for(let r=0;r<2;r++)add(`<circle cx="${240+c*26}" cy="${330+r*14}" r="5" fill="${C.seat}"/>`);
rect(322,300,86,52,'#2E2A22',C.shop);text(365,316,'BAR',{s:10,c:C.shop});
rect(222,358,86,36,'#22302A',C.green);text(265,380,'PLAY AREA',{s:9.5,c:C.green});
rect(322,358,86,36,'#26303C','#8FB8E0');text(365,375,'LOUNGE',{s:9.5,c:'#8FB8E0'});text(365,387,'(upstairs)',{s:8.5,c:C.dim,w:400});
// departures landside: security, check-in
hall(40,408,380,112,'Security hall','trays, scanners, bag search, fast track');
for(let k=0;k<6;k++){const x=70+k*44;rect(x,450,30,56,C.land,C.dim,3);rect(x+6,470,18,14,'#3E4A56','none',2)}
rect(342,450,58,56,'#2F2A1C',C.dep,3);text(371,482,'FAST',{s:9.5,c:C.dep});
hall(40,524,380,126,'Check-in hall','desk islands with their own queues, bag drop');
for(let i=0;i<3;i++){const x=70+i*100;rect(x,560,70,20,C.land,C.dim,3);rect(x,582,70,20,C.land,C.dim,3);add(`<path d="M${x+35} 604 v14 h-24 v10 h48" stroke="${C.dep}" stroke-dasharray="3 3" fill="none"/>`)}
rect(350,560,50,40,'#2F2A1C',C.dep,3);text(375,584,'BAG DROP',{s:8,c:C.dep});
// baggage hall in the middle
hall(436,254,160,396,'Baggage hall','behind the scenes',C.land);
rect(452,300,128,40,'#2E2418',C.bag,4);text(516,324,'SCREENING',{s:10,c:C.bag});
add(`<ellipse cx="516" cy="420" rx="56" ry="36" fill="none" stroke="${C.bag}" stroke-width="6" stroke-dasharray="4 3"/>`);text(516,424,'SORTER',{s:10,c:C.bag});
rect(452,480,128,56,'#2E2418',C.bag,4);text(516,500,'MAKE-UP',{s:10,c:C.bag});text(516,514,'carts per flight',{s:9,c:C.dim,w:400});
rect(452,552,128,40,'#2E2418',C.bag,4);text(516,576,'EARLY BAG STORE',{s:9,c:C.bag});
add(`<path d="M516 254 V132" stroke="${C.bag}" stroke-width="4" stroke-dasharray="6 5"/>`);text(566,236,'tunnel',{s:9.5,c:C.bag,w:500});
// arrivals landside
hall(612,254,328,110,'Immigration hall','passport desks and e-gates');
for(let k=0;k<5;k++)rect(640+k*34,300,24,22,C.land,C.dim,3);for(let k=0;k<6;k++)rect(830+k*16,300,10,22,'#1B3140',C.arr,2);
hall(612,368,328,140,'Reclaim hall','carousels, first and last bag times');
for(let k=0;k<3;k++)add(`<rect x="${636+k*100}" y="${420}" width="80" height="40" rx="20" fill="none" stroke="${C.bag}" stroke-width="5"/>`);
hall(612,512,328,40,'Customs','green and red channels',C.bld);rect(760,522,60,22,'#1F2B22',C.green,3);rect(830,522,60,22,'#2E1F22',C.red,3);
hall(612,556,328,94,'Arrivals hall','meeters, car hire, taxis, hotel desk');
// hotel
hall(980,420,230,230,'Airport hotel','crews, late arrivals, stranded');
for(let r=0;r<5;r++)for(let c=0;c<9;c++)rect(1000+c*22,470+r*30,14,16,(r*9+c)%3?'#E9C98B':'#1A1F24','none',2);
add(`<path d="M940 610 H980" stroke="${C.text}" stroke-width="8" opacity=".35"/>`);text(960,600,'walkway',{s:9,c:C.dim,w:400});
// forecourt, station and car park
rect(0,662,W,40,'#14191D','none',0);text(20,687,'FORECOURT',{a:'start',s:11,c:C.dim});text(230,687,'drop-off',{s:11,c:C.dep,w:500});text(780,687,'pick-up, taxis, hotel shuttle',{s:11,c:C.arr,w:500});
rect(40,712,380,54,C.land,C.edge);text(230,744,'RAILWAY STATION AND TRAM STOP',{s:11,c:C.dim});
rect(612,712,598,54,C.land,C.edge);text(911,744,'CAR PARK',{s:11,c:C.dim});
// flows
path([[230,700],[230,640],[230,560],[230,520],[230,430],[230,404],[230,300],[300,250],[300,206]],C.dep);
path([[500,150],[500,157],[948,157],[948,300],[900,310]],C.arr);
path([[776,330],[776,380]],C.arr);path([[776,470],[776,512]],C.arr);path([[776,545],[776,600]],C.arr);path([[776,640],[776,700]],C.arr);path([[900,610],[975,610]],C.arr);
path([[400,590],[430,590],[430,320],[448,320]],C.bag,1);path([[596,440],[630,440]],C.bag,1);
// legend
const lg=(x,c,t)=>{add(`<path d="M${x} 36 h28" stroke="${c}" stroke-width="3"/>`);text(x+36,40,t,{a:'start',s:11,c})};
lg(990,C.dep,'departing');add(`<path d="M990 58 h28" stroke="${C.arr}" stroke-width="3"/>`);text(1026,62,'arriving',{a:'start',s:11,c:C.arr});add(`<path d="M990 80 h28" stroke="${C.bag}" stroke-width="3" stroke-dasharray="7 6"/>`);text(1026,84,'bags',{a:'start',s:11,c:C.bag});
writeFileSync(join(out,'classic.svg'),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${s.join('')}</svg>`);
console.log('wrote classic.svg');
