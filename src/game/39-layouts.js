/* ================= LAYOUTS: the airport's stands, piers and shop units, and rebuilding into another layout ================= */
// Each layout lists its stands (x, how far back the plane sits, gate name, cost, level, and whether it needs Pier B)
// and its shop units. applyLayout copies the current one into the shared arrays (STAND_X, STAND, GATES, SHOP_X...)
// in place, so everything that reads them follows the layout.
// price, build minutes and level of the n-th stand bought, following Classic's ladder and carrying on past eight
const LADDER=[[0,0,0],[400,30,0],[3000,60,1],[12000,90,3],[80000,120,4],[150000,150,4],[300000,180,6],[500000,210,6],[700000,240,7],[900000,270,7],[1200000,300,8],[1500000,330,8],
  [1800000,360,9],[2100000,390,9],[2400000,420,9],[2800000,450,9]];
const lad=(x,g,n,o={})=>{const s={x,g,cost:LADDER[n][0],build:LADDER[n][1],lvl:LADDER[n][2],...o};if(!s.pier)delete s.pier;return s};
// the refreshed Classic's parts, shared by the layouts built on it: the main concourse, a second stretch that opens with
// Pier B (ending at x), and the pier itself
const CLP={
  rooms:x=>[{id:'main',poly:[[8,TERM_Y],[1240,TERM_Y],[1240,SEC_Y],[8,SEC_Y]]},{id:'pier',ph:2,poly:[[1760,-190],[1870,-190],[1870,TERM_Y],[1760,TERM_Y]]},
    {id:'east',ph:2,poly:[[1240,TERM_Y],[x,TERM_Y],[x,SEC_Y],[1240,SEC_Y]]}],
  doors:[['main','east',1240,484,38],['east','pier',1815,TERM_Y,55]],
  stands:()=>[
    {x:170,y:TERM_Y,h:180,g:'A1',cost:0,build:0,lvl:0},{x:470,y:TERM_Y,h:180,g:'A2',cost:400,build:30,lvl:0},{x:770,y:TERM_Y,h:180,g:'A3',cost:3000,build:60,lvl:1},{x:1070,y:TERM_Y,h:180,g:'A4',cost:12000,build:90,lvl:3},
    {x:1760,y:290,h:90,g:'B1',cost:80000,build:120,lvl:4,pier:1,room:'pier'},{x:1760,y:-10,h:90,g:'B2',cost:150000,build:150,lvl:4,pier:1,room:'pier'},
    {x:1870,y:290,h:270,g:'B3',cost:300000,build:180,lvl:6,pier:1,room:'pier'},{x:1870,y:-10,h:270,g:'B4',cost:500000,build:210,lvl:6,pier:1,room:'pier'}],
  shops:()=>[[30,'A1',1,1,452],[330,'A2',1,1,452],[630,'A3',1,1,452],[930,'A4',1,1,452],[1250,'B1',2,1,452,0,'east'],[1385,'B2',2,1,452,0,'east'],[1520,'B3',2,1,452,0,'east'],[1895,'B4',2,1,452,0,'east']],
  track:[[360,515],[1815,515],[1815,-160]], // the people mover, once bought
  decor:x=>[{t:'taxi',pts:[[0,-110],[x,-110]]},{t:'tower',x:620,y:-200},{t:'label',x:1815,y:-210,text:'PIER B'}],
};
// A pier (finger) from (x,y) on a room's wall, heading h, L long and w wide, with stands at [distance along it, side]
// (side 1 is on the right looking out along the pier, side 0 is at its tip); its room, the doorway into it, and the stands
function pierParts(id,from,x,y,h,L,w,at){
  const a=h*Math.PI/180,dx=Math.sin(a),dy=-Math.cos(a),rx=-dy,ry=dx,R2=v=>Math.round(v*10)/10,tip=at.some(([,side])=>!side),L0=tip?L-70:L;
  const box=(d0,d1,hw)=>[[R2(x-rx*hw+dx*d0),R2(y-ry*hw+dy*d0)],[R2(x-rx*hw+dx*d1),R2(y-ry*hw+dy*d1)],[R2(x+rx*hw+dx*d1),R2(y+ry*hw+dy*d1)],[R2(x+rx*hw+dx*d0),R2(y+ry*hw+dy*d0)]];
  const rooms=[{id,poly:box(0,L0,w/2)}],doors=[[from,id,x,y,w/2]];
  if(tip){rooms.push({id:id+'h',poly:box(L0,L,165)});doors.push([id,id+'h',R2(x+dx*L0),R2(y+dy*L0),w/2])} // a wider head for the stand at the tip
  const stands=at.map(([d,side])=>side?{x:R2(x+dx*d+rx*side*w/2),y:R2(y+dy*d+ry*side*w/2),h:(h+(side>0?270:90))%360,room:id}
    :{x:R2(x+dx*L),y:R2(y+dy*L),h:(h+180)%360,room:id+'h'}); // side 0: at the tip, nose to the pier's end
  return {rooms,doors,stands};
}
// A curved concourse (Kansai, Tempelhof): stands fanned round the outside of an arc with centre (cx,cy) and face radius R,
// one corridor segment thick deep and w degrees wide per stand, its outer wall square to its stand, with a shop unit on its
// inner wall (pull[k] draws shoppers); the first four segments open at once, the rest with the second phase. A join
// leads from the end of the main concourse at x=1240.
function arcParts(cx,cy,R,thick,w,bears,pull){
  const P=(b,r)=>{const a=b*Math.PI/180;return [Math.round((cx+r*Math.sin(a))*10)/10,Math.round((cy-r*Math.cos(a))*10)/10]};
  const rooms=[],doors=[],stands=[],shops=[];
  bears.forEach((b,k)=>{const id='arc'+k,b0=b-w/2,b1=b+w/2;
    rooms.push({id,ph:k<4?1:2,walk:1.25,poly:[P(b0,R-thick),P(b0,R),P(b1,R),P(b1,R-thick)]});
    if(k){const [x1,y1]=P(b0,R),[x2,y2]=P(b0,R-thick);doors.push(['arc'+(k-1),id,(x1+x2)/2,(y1+y2)/2,thick/2+2])}
    const [ax,ay]=P(b,R*Math.cos(w/2*Math.PI/180));stands.push({x:ax,y:ay,h:b+180,room:id}); // on the segment's straight outer wall
    const [mx,my]=P(b,R-thick+2),ar=(b+180)*Math.PI/180;shops.push([Math.round(mx-59*Math.cos(ar)),k<4?'A'+(k+1):'B'+(k-3),k<4?1:2,pull[k],Math.round(my-59*Math.sin(ar)),b+180,id]);
  });
  const [ox,oy]=P(bears[0]-w/2,R),[ix,iy]=P(bears[0]-w/2,R-thick);
  rooms.push({id:'join',poly:[[1240,TERM_Y],[ox,oy],[ix,iy],[1240,SEC_Y]]});
  doors.push(['main','join',1240,484,38],['join','arc0',(ox+ix)/2,(oy+iy)/2,thick/2+2]);
  return {rooms,doors,stands,shops,ring:(r,b0,b1)=>[...Array(13)].map((_,k)=>P(b0+(b1-b0)*k/12,r))};
}
// the Round terminal: [centre x, y, ring radius, how far out the pods are, pod half-size], the pods' bearings, width, top
const RT={geo:[2000,-1000,330,1050,160],bears:[-100,-60,-20,20,60,100],W:3900,top:-2800};
// the Starfish: hall [centre x, y, radius], the north pier [length, stand distance], the diagonal ones, the southern ones, width, top
const SF={hall:[2300,-700,420],n:[700,480],d:[800,560],s:[650,420],W:4000,top:-1900};
// the hall's piers: centre [length, first and second stand distances], sides likewise, the map's width and top
const HP={hall:[1500,2320],c:[1000,450,760],s:[1250,900,900],W:3900,top:-1000};
// the herringbone: first stand's height, the gap between stands, how far planes lean, and how far they sit back
const HB={y0:280,step:260,lean:30,back:70};
const LAYOUTS={
  // today's airport, a little more real: planes park nose-in, and Pier B is a pier out onto the apron
  classic:{name:'Classic',W:2460,top:-280,rooms:CLP.rooms(2030),doors:CLP.doors,stands:CLP.stands(),shops:CLP.shops(),track:CLP.track,decor:CLP.decor(1700)},
  // Classic plus a row of remote stands out on the apron, reached by bus from gates at the end of the concourse
  remote:{name:'Remote apron',plan:'l_remote',lvl:5,pts:1,cost:15000,build:180,W:3700,top:-280,upk:200,
    from:'the remote stands at London Stansted and Luton',
    up:'Four remote stands for short-haul planes from level 6, at 60% of the price of pier stands. Mobile lounges can replace the buses.',down:'Buses cost money to run, make boarding slower, more so in rain and snow, and cost a little rating. Remote stands don\'t count as gates for your airport\'s level.',
    rooms:CLP.rooms(2600),doors:CLP.doors,
    stands:[...CLP.stands(),...[[2560,2090,'R1',48000,60,6],[2860,2230,'R2',90000,80,6],[3160,2370,'R3',180000,100,8],[3460,2510,'R4',300000,120,8]].map(([x,gx,g,cost,build,lvl],k)=>
      ({x,y:400,h:180,g,cost,build,lvl,kind:'remote',pier:1,room:'east',gate:[gx,TERM_Y,1],road:[[gx,432],[x+100,432]],...(k?{}:{after:3})}))],
    shops:CLP.shops(),track:CLP.track,
    decor:[...CLP.decor(3600),{t:'road',pts:[[2050,432],[3600,432]],w:22},{t:'label',x:3010,y:-70,text:'REMOTE APRON'}]},
  // a herringbone pier: planes park at an angle down both sides, their bridges square to the pier
  stagger:{name:'Staggered apron',plan:'l_stagger',lvl:3,pts:1,cost:40000,build:360,W:2560,top:-620,
    from:'the angled stands along the piers of many regional airports',
    up:'Ten stands: planes park at an angle down both sides of Pier B, so more of them fit along it.',down:'The far end of the pier is a long walk.',
    rooms:[...CLP.rooms(2160).filter(r=>r.id!=='pier'),{id:'pier',ph:2,poly:[[1760,-410],[1870,-410],[1870,TERM_Y],[1760,TERM_Y]]}],doors:CLP.doors,
    stands:[...CLP.stands().slice(0,4),...[0,1,2].flatMap(k=>[{x:1760,y:HB.y0-k*HB.step,h:90,lean:HB.lean,back:HB.back},{x:1870,y:HB.y0-k*HB.step,h:270,lean:-HB.lean,back:HB.back}])
      .map((s,k)=>({...lad(0,'',k+4),...s,g:'B'+(k+1),pier:1,room:'pier'}))],
    shops:[...CLP.shops(),[1640,'B5',2,1,452,0,'east'],[2020,'B6',2,1,452,0,'east']],track:[[360,515],[1815,515],[1815,-380]],
    decor:[{t:'taxi',pts:[[0,-110],[1560,-110]]},{t:'tower',x:620,y:-200},{t:'label',x:1815,y:-430,text:'PIER B'}]},
  // one long curved building with planes fanned round its outside, and moving walkways along it
  curve:(()=>{const A=arcParts(2389,1434,1500,110,12,[-42,-30,-18,-6,6,18,30,42],[1,1,1.2,1.2,1.2,1.2,1,1]);return {name:'Curved front',plan:'l_curve',lvl:4,pts:2,cost:120000,build:480,W:3800,top:-640,rep:0.3,
    from:'the curved terminals of Osaka Kansai and Berlin Tempelhof, with a control tower at the centre',
    up:'Moving walkways along the curve: boarding starts sooner, fewer late passengers, and a rating bonus.',down:'No extra stands.',
    rooms:[CLP.rooms(0)[0],...A.rooms],doors:A.doors,
    stands:A.stands.map((s,k)=>({...lad(0,'',k),...s,g:(k<4?'A':'B')+(k<4?k+1:k-3),...(k>=4?{pier:1}:{})})),
    shops:[[30,'A1',1,1,452],[330,'A2',1,1,452],[630,'A3',1,1,452],[930,'A4',1,1,452],...A.shops],
    decor:[{t:'taxi',pts:A.ring(2080,-64,64)},{t:'tower',x:2389,y:120}]}})(),
  // piers fanning out from a central hall of shops, joined to the main concourse by a short link; each pier leaves a wall
  // square to it
  hall:(()=>{const [x0,x1]=HP.hall,cx=(x0+x1)/2,C=pierParts('pc','hall',cx,275.5,0,HP.c[0],110,[[HP.c[1],-1],[HP.c[1],1],[HP.c[2],-1],[HP.c[2],1]]),
      Lp=pierParts('pl','hall',x0+47.5,357.75,300,HP.s[0],110,[[HP.s[1],1],[HP.s[2],-1],[0,0]]),Rp=pierParts('pr','hall',x1-47.5,357.75,60,HP.s[0],110,[[HP.s[1],-1],[HP.s[2],1],[0,0]]);
    return {name:'Hall and finger pier',plan:'l_hall',lvl:5,pts:2,cost:300000,build:600,W:HP.W,top:HP.top,
    from:'the central hall and piers of Amsterdam Schiphol',
    up:'Ten stands, and shops gathered in a central hall where passengers spend most.',down:'Long walks to the far end of the piers.',
    rooms:[CLP.rooms(0)[0],{id:'link',poly:[[1240,TERM_Y],[x0,TERM_Y],[x0,SEC_Y],[1240,SEC_Y]]},{id:'hall',poly:[[x0,SEC_Y],[x0,440],[x0+95,275.5],[x1-95,275.5],[x1,440],[x1,SEC_Y]],col:'#20272E'},
      ...C.rooms,...Lp.rooms.map(r=>({...r,ph:2})),...Rp.rooms.map(r=>({...r,ph:2}))],
    doors:[['main','link',1240,484,38],['link','hall',x0,484,38],...C.doors,...Lp.doors,...Rp.doors],
    stands:[...C.stands,...Lp.stands,...Rp.stands].map((s,k)=>({...lad(0,'',k),...s,g:(k<4?'A':'B')+(k<4?k+1:k-3),...(k>=4?{pier:1}:{})})),
    shops:[[30,'A1',1,1,452],[330,'A2',1,1,452],[630,'A3',1,1,452],[930,'A4',1,1,452],
      ...[0,1,2,3].map(k=>[x0+150+k*123,'Hall',1,1.3,300,0,'hall']),...[0,1,2,3,4,5].map(k=>[x0+20+k*123,'B'+(k+1),2,1,420,0,'hall'])],
    decor:[{t:'tower',x:cx,y:HP.top+100}]}})(),
  // the main building and two satellites out on the apron, joined by an underground train (London Heathrow Terminal 5)
  sat:(()=>{const sats=[[-540,'5B',0],[-1700,'5C',4]].map(([yS,id,k0])=>{const yN=yS-180;
      return {room:{id,ph:2,poly:[[280,yN],[1040,yN],[1040,yS],[280,yS]]},
        stands:[[500,yS,0],[820,yS,0],[500,yN,180],[820,yN,180]].map(([x,y,h],k)=>({x,y,h,g:'S'+(k0+k+1),room:id})),
        shops:[0,1,2,3,4].map(k=>[290+k*123,'S'+(k0/4*5+k+1),2,1,yS-130,0,id]),station:[980,yS-90]}});
    return {name:'Satellite',plan:'l_sat',lvl:7,pts:3,cost:1200000,build:960,W:1560,top:-2390,upk:2500,
    from:'Terminal 5 at London Heathrow, with its two satellites and the Transit',p2:'Satellite',
    up:'Twelve stands, big duty-free and lounge space, and quicker transfers.',down:'A train ride out to the satellites, and it costs the most to run after Starfish.',
    rooms:[CLP.rooms(0)[0],...sats.map(S=>S.room)],doors:[],
    links:[['main','5B',[980,505],sats[0].station,'train'],['5B','5C',sats[0].station,sats[1].station,'train']],
    stands:[...CLP.stands().slice(0,4),...sats.flatMap(S=>S.stands)].map((s,k)=>k<4?s:{...lad(0,'',k),...s,pier:1}),
    shops:[...CLP.shops().slice(0,4),...sats.flatMap(S=>S.shops)],
    shopBonus:{duty:1.3,lounge:1.3},xfer:1.5,
    decor:[{t:'taxi',pts:[[0,-47],[1560,-47]]},{t:'taxi',pts:[[0,-1210],[1560,-1210]]},{t:'tower',x:1350,y:-900},{t:'label',x:170,y:-600,text:'5B'},{t:'label',x:170,y:-1760,text:'5C'}]}})(),
  // long concourses out on the airfield, one behind the other, strung along an underground train (Atlanta, Denver)
  mid:(()=>{const cons=[[-540,'A'],[-1700,'B']].map(([yS,id])=>{const yN=yS-180,xs=[320,640,960];
      return {room:{id,ph:2,poly:[[140,yN],[1140,yN],[1140,yS],[140,yS]]},
        stands:[...xs.map(x=>[x,yS,0]),...xs.map(x=>[x,yN,180])].map(([x,y,h],k)=>({x,y,h,g:id+(k+1),room:id})),
        shops:[150,273,396,700,823,946].map((x,k)=>[x,id+(k+1),2,1,yS-130,0,id]),station:[640,yS-90]}});
    return {name:'Midfield concourses',plan:'l_mid',lvl:9,pts:3,cost:2500000,build:1320,W:1560,top:-2480,upk:4500,p2:'Concourses',
    from:'the midfield concourses and Plane Train of Atlanta, and Denver\'s tent roof',
    up:'Sixteen stands, the most of any layout, along a fast underground train.',down:'The longest rides out to the gates, and costly to run.',
    rooms:[CLP.rooms(0)[0],...cons.map(C=>C.room)],doors:[],
    links:[['main','A',[640,505],cons[0].station,'train'],['A','B',cons[0].station,cons[1].station,'train']],
    stands:[...CLP.stands().slice(0,4).map((s,k)=>({...s,g:'T'+(k+1)})),...cons.flatMap(C=>C.stands)].map((s,k)=>k<4?s:{...lad(0,'',k),...s,pier:1}),
    shops:[...CLP.shops().slice(0,4),...cons.flatMap(C=>C.shops)],
    decor:[{t:'taxi',pts:[[0,-47],[1560,-47]]},{t:'taxi',pts:[[0,-1210],[1560,-1210]]},{t:'tower',x:1350,y:-900},{t:'tent',x0:20,x1:1220,y:TERM_Y+42}]}})(),
  // a round terminal with glass tubes across its open middle, and satellite pods reached through tunnels with moving
  // walkways (Paris Charles de Gaulle Terminal 1)
  round:(()=>{const [cx,cy,Rr,Rs,a]=RT.geo,D=b=>{const r=b*Math.PI/180;return [Math.sin(r),-Math.cos(r)]},pt=(x,y,b,d)=>{const [u,v]=D(b);return [Math.round(x+u*d),Math.round(y+v*d)]};
    const ring={id:'ring',col:'#20272E',poly:[...Array(12)].map((_,k)=>pt(cx,cy,15+k*30,Rr))},[sx,sy]=pt(cx,cy,180,Rr*Math.cos(Math.PI/12));
    const pods=RT.bears.map((sb,k)=>{const [px,py]=pt(cx,cy,sb,Rs),id='pod'+k,ns=[sb-45,sb+45,sb+135,sb+225];
      const poly=ns.map((n,j)=>{const [u,v]=D(n),[u2,v2]=D(ns[(j+1)%4]);return [Math.round(px+a*u+a*u2),Math.round(py+a*v+a*v2)]});
      const stands=[sb-45,sb+45].map(n=>{const [x,y]=pt(px,py,n,a);return {x,y,h:(n+180+360)%360,room:id}});
      const ar=sb*Math.PI/180,shop=[Math.round(px-59*Math.cos(ar)+20*Math.sin(ar)),'Kiosk',k<2?1:2,0.8,Math.round(py-59*Math.sin(ar)-20*Math.cos(ar)),sb,id];
      return {room:{id,ph:k<2?1:2,poly},stands,shop,link:['ring',id,pt(cx,cy,sb,Rr-60),[px,py],'walkway']}});
    return {name:'Round terminal',plan:'l_round',lvl:6,pts:2,cost:600000,build:900,W:RT.W,top:RT.top,rep:0.3,upk:1500,p2:'Outer satellites',
    from:'Terminal 1 at Paris Charles de Gaulle, with its tubes and tunnels',
    up:'Twelve stands in little space, round a terminal whose glass tubes lift your rating.',down:'Each satellite has only a kiosk, and the tunnels are a long way to walk.',
    rooms:[CLP.rooms(0)[0],{id:'link',poly:[[1240,TERM_Y],[sx+60,TERM_Y],[sx+60,SEC_Y],[1240,SEC_Y]]},{id:'spoke',poly:[[sx-55,sy],[sx+55,sy],[sx+55,TERM_Y],[sx-55,TERM_Y]]},ring,...pods.map(P=>P.room)],
    doors:[['main','link',1240,484,38],['link','spoke',sx,TERM_Y,55],['spoke','ring',sx,sy,55]],links:pods.map(P=>P.link),
    stands:pods.flatMap(P=>P.stands).map((s,k)=>({...lad(0,'',k),...s,g:(k<4?'A':'B')+(k<4?k+1:k-3),...(k>=4?{pier:1}:{})})),
    shops:[...CLP.shops().slice(0,4),...[0,1,2,3,4,5].map(k=>{const b=30+k*60,r=b*Math.PI/180,d=Rr*0.6;return [Math.round(cx+d*Math.sin(r)-59*Math.cos(r)),'Ring',1,1,Math.round(cy-d*Math.cos(r)-59*Math.sin(r)),b,'ring']}),...pods.map(P=>P.shop)],
    decor:[{t:'tubes',x:cx,y:cy,r:Rr*0.36},{t:'tower',x:sx+420,y:TERM_Y-260}]}})(),
  // five piers radiating from a star-shaped hall; the sixth spoke is the way in from the main concourse (Beijing Daxing)
  star:(()=>{const [cx,cy,R]=SF.hall,e=R*Math.cos(Math.PI/12),at=b=>{const a=b*Math.PI/180;return [Math.round(cx+e*Math.sin(a)),Math.round(cy-e*Math.cos(a))]};
    const hall={id:'hall',col:'#20272E',poly:[...Array(12)].map((_,k)=>{const a=(15+k*30)*Math.PI/180;return [Math.round(cx+R*Math.sin(a)),Math.round(cy-R*Math.cos(a))]})};
    const P=(id,b,L,st,ph)=>{const [x,y]=at(b),p=pierParts(id,'hall',x,y,b,L,110,st);p.rooms.forEach(r=>{if(ph)r.ph=2});return p};
    const N=P('pn',0,SF.n[0],[[SF.n[1],-1],[SF.n[1],1]]),SW=P('psw',240,SF.s[0],[[SF.s[1],1],[0,0]]),
      NW=P('pnw',300,SF.d[0],[[SF.d[1],-1],[SF.d[1],1],[0,0]],1),NE=P('pne',60,SF.d[0],[[SF.d[1],-1],[SF.d[1],1],[0,0]],1),SE=P('pse',120,SF.s[0],[[SF.s[1],-1],[0,0]],1);
    const [sx,sy]=at(180),spoke={id:'spoke',poly:[[sx-55,sy],[sx+55,sy],[sx+55,TERM_Y],[sx-55,TERM_Y]]};
    const ps=[N,SW,NW,NE,SE];
    return {name:'Starfish',plan:'l_star',lvl:9,pts:3,cost:3000000,build:1440,W:SF.W,top:SF.top,rep:0.5,upk:5000,p2:'Outer piers',
    from:'the star-shaped terminal at Beijing Daxing, built for short walks',
    up:'Twelve stands round a star-shaped hall: the shortest walks for its size, the most shops and a rating bonus.',down:'The costliest to rebuild and to run.',
    rooms:[CLP.rooms(0)[0],{id:'link',poly:[[1240,TERM_Y],[sx+60,TERM_Y],[sx+60,SEC_Y],[1240,SEC_Y]]},spoke,hall,...ps.flatMap(p=>p.rooms)],
    doors:[['main','link',1240,484,38],['link','spoke',sx,TERM_Y,55],['spoke','hall',sx,sy,55],...ps.flatMap(p=>p.doors)],
    stands:ps.flatMap(p=>p.stands).map((s,k)=>({...lad(0,'',k),...s,g:(k<4?'A':'B')+(k<4?k+1:k-3),...(k>=4?{pier:1}:{})})),
    shops:[...CLP.shops().slice(0,4),...[0,1,2,3,4,5,6,7].map(k=>{const b=-157.5+k*45,a=b*Math.PI/180,r=R*0.52;return [Math.round(cx+r*Math.sin(a)-59*Math.cos(a)),'Hall',k<4?1:2,1.3,Math.round(cy-r*Math.cos(a)-59*Math.sin(a)),b,'hall']}),
      ...[0,1,2,3].map(k=>[1300+k*123,'B'+(k+1),2,1,452,0,'link'])],
    decor:[{t:'tower',x:sx+420,y:TERM_Y-260}]}})(),
};
LAYOUTS.classic.cost=20000;LAYOUTS.classic.build=240;LAYOUTS.classic.up='The airport you started with: four gates along the terminal and Pier B out on the apron.';LAYOUTS.classic.down='A walk out along Pier B.';
let LAY=LAYOUTS.classic; // the current layout
const STAND_KIND=['bridge','bridge','bridge','bridge','bridge','bridge','bridge','bridge'],SHOP_PULL=[1,1,1,1,1,1,1,1]; // remote stands board by bus; hall units draw more shoppers
const SHOP_Y=[],SHOP_A=[]; // shop units: top edge and angle (degrees; 0 faces the concourse below it)
const p2name=()=>LAY.p2||'Pier B';
const fill=(a,v)=>{a.length=0;a.push(...v);return a};
function applyLayout(id){
  const L=LAYOUTS[id]||LAYOUTS.classic;
  LAY=L;W=L.W;fill(STAND_KIND,L.stands.map(s=>s.kind||'bridge'));fill(SHOP_PULL,L.shops.map(s=>s[3]||1));
  fill(STAND_X,L.stands.map(s=>s.x));fill(GATES,L.stands.map(s=>s.g));
  fill(STAND,L.stands.map(s=>{const o={cost:s.cost,build:s.build,lvl:s.lvl};if(s.pier)o.pier=1;return o}));
  fill(SIDX,L.stands.map((s,i)=>i));fill(STAND_ORDER,L.order||SIDX);
  fill(STAND_AFTER,L.stands.map((s,i)=>s.after!=null?s.after:(o=>o>0?STAND_ORDER[o-1]:-1)(STAND_ORDER.indexOf(i))));
  fill(SHOP_X,L.shops.map(s=>s[0]));fill(SHOP_NAME,L.shops.map(s=>s[1]));fill(SHOP_PH,L.shops.map(s=>s[2]||1));
  fill(SHOP_Y,L.shops.map(s=>s[4]??452));fill(SHOP_A,L.shops.map(s=>s[5]||0));
  fill(XF,L.stands.map(standXf));ROOM_DOORS=[...(L.doors||[]),...L.term.doors];buildRooms({...L,rooms:[...L.rooms,...L.term.halls],doors:ROOM_DOORS});AF_Y=L.top||0;Y0=AF_Y-180;placeBadges();
}

const busMul=i=>STAND_KIND[i]!=='remote'?1:!G.lounges&&(R.fx.rain>G.clock||R.fx.snow>G.clock)?1.4:2.2; // buses outpace walkers, less so in bad weather; mobile lounges don't mind it
// mobile lounges (Washington Dulles): lounges on stilts that drive out to remote stands and rise to the door
const LOUNGES={cost:200000,build:120};
const layoutOk=id=>id==='classic'||has('lay:'+id);
const layoutBuilding=()=>(G.builds||[]).find(b=>b.id.startsWith('layout:'));
// rebuilding: a construction project; the new layout opens at the first 03:00 after it's finished
function rebuildLayout(id){
  const L=LAYOUTS[id];if(!L||id===G.layout||G.layoutNext||layoutBuilding()||!layoutOk(id)||!canBuild()||!buy(L.cost))return false;
  startBuild('layout:'+id,'the '+L.name+' layout',L.build);return true;
}
function layoutReady(id){G.layoutNext=id;G.layoutAt=Math.floor((G.clock-180)/1440+1)*1440+180;
  toast(`The ${LAYOUTS[id].name} layout is ready. It opens at 03:00.`,null,null,'goal',8)}
// every game minute: switch once it's time and any stand the new layout drops has seen off its last flight
function layoutTick(){
  if(LAY.rep&&R.lastMin%1440===720)repAdj(LAY.rep,'layout');
  if(!G.layoutNext||G.clock<G.layoutAt)return;
  const n=LAYOUTS[G.layoutNext].stands.length;if(R.st.some((S,i)=>i>=n&&(S.F||S.out)))return;
  switchLayout(G.layoutNext);
}
const layoutDrains=i=>G.layoutNext&&i>=LAYOUTS[G.layoutNext].stands.length;
const AT_STAND=new Set(['gate','toGate','bridge','aisle','sitting','dAisle','dBridge']),IN_PLANE=new Set(['bridge','aisle','sitting','dAisle','dBridge']);
function switchLayout(id){
  const oXF=XF.map(t=>({...t})),old=STAND.slice(),from=LAY.name,fromId=G.layout,was=R.pax.map(p=>p.stand);
  const rid=R.pax.map(p=>p.room!=null&&ROOMS[p.room]?ROOMS[p.room].id:null); // rooms are numbered afresh for each layout
  applyLayout(id);
  // a flight at a stand the new layout drops moves to a free built stand it keeps, with everyone aboard, on its bridge,
  // at its gate or still to come; with no stand free, the switch waits for those stands to empty, as a rebuild does
  const to=new Map();
  for(let i=SIDX.length;i<R.st.length;i++){const F=R.st[i].F;if(!F)continue;
    const t=AIRCRAFT.indexOf(F.ac),free=SIDX.filter(j=>G.stands[j].built&&!R.st[j].F&&![...to.values()].includes(j));
    const j=[free.find(j=>fitsGate(t,j)&&!R.st[j].out),free.find(j=>fitsGate(t,j)),free[0]].find(j=>j!=null);
    if(j==null){applyLayout(fromId);G.layoutNext=id;G.layoutAt=G.clock;
      toast(`The ${LAYOUTS[id].name} layout opens once the stands it drops have seen off their flights.`,null,null,'goal',8);return false}
    to.set(i,j)}
  G.layout=id;G.layoutNext=null;G.layoutAt=null;
  R.pax.forEach((p,k)=>{p.room=rid[k]!=null?ROOM_ID[rid[k]]??ROOM_MAIN():p.room});
  for(const [i,j] of to){const S=R.st[i],F=S.F,fl=G.fleet[F.fleetIdx],re=p=>{if(p&&p.F===F)p.stand=j};
    R.st[i]=R.st[j];R.st[j]=S;F.i=j;F.arr.stand=j;if(fl&&fl.gate===i)fl.gate=j;
    R.pax.forEach(re);F.manifest.forEach(re);re(F.straggler);F.arr.pax.forEach(re);
    for(const p of R.pax)re(p.xfer); // someone connecting into it who hasn't landed yet
    for(const T of R.st)if(T.F)T.F.arr.pax.forEach(p=>re(p.xfer));
    for(const m of R.rwy.q)if(m.F===F)m.stand=j}
  for(let i=SIDX.length;i<R.st.length;i++)R.st[i].out=null;
  for(const m of R.rwy.q)if(m.stand>=SIDX.length)m.stand=SIDX.length-1; // a plane already off a dropped stand: it only marks where a floater shows
  // stands and shop units the new layout doesn't have are sold at their resale value
  let refund=0;
  G.stands.forEach((st,i)=>{if(i>=STAND_X.length&&st.built){refund+=Math.round((old[i]?old[i].cost:0)*0.4);G.stands[i]={built:false,ac:null,method:'random',rear:false,route:'mixed'}}});
  G.shops.forEach((s,j)=>{if(s&&j>=SHOP_X.length){refund+=shopValue(s);G.shops[j]=null}});
  if(refund){G.cash+=refund;G.revBy.assets+=refund}
  // flights carry on: each plane and everyone aboard or on its bridge move with the stand; people at gates and shops,
  // and arrivals on their way out, step into the matching place in the new layout
  const n=SIDX.length,move=(o,i,p,k)=>{const T=oXF[o],dx=p[k+'x']-T.ox,dy=p[k+'y']-T.oy;toW(i,dx*T.c+dy*T.s,dy*T.c-dx*T.s);p[k+'x']=WP.x;p[k+'y']=WP.y};
  R.pax.forEach((p,k)=>{const i=p.stand,o=was[k];p.way=null;
    if(i<n&&o<oXF.length&&IN_PLANE.has(p.state)){move(o,i,p,'');move(o,i,p,'t')}
    else if(i<n&&(p.state==='gate'||p.state==='toGate')){if(p.spot>=0){const s=spotPos(i,p.spot);p.tx=s.x;p.ty=s.y}else if(XF[i].nose){toW(i,-80,FACE_Y-24);p.tx=WP.x;p.ty=WP.y}else{p.tx=STAND_X[i]-70;p.ty=506}p.x=p.tx;p.y=p.ty;p.room=STAND_ROOM[i]}
    else if(p.state==='toShop'||p.state==='shop'){if(p.shop<SHOP_X.length&&G.shops[p.shop]){if(ROOMS){shopPt(p.shop,58,47);p.tx=WP.x;p.ty=WP.y;p.su=58}else{p.tx=SHOP_X[p.shop]+58;p.ty=499}p.x=p.tx;p.y=p.ty;p.room=SHOP_ROOM[p.shop]}else if(p.stand<n){p.state='gate';toGate(p);p.x=p.tx;p.y=p.ty;p.way=null}}
    else if(p.state==='toArr'){p.x=p.tx;p.y=p.ty;p.room=ROOM_MAIN()}});
  for(const i of SIDX){const S=R.st[i];
    if(S.F){const F=S.F;F.geo=geom(F.ac);F.P=paths(i,F.geo);S.geo=F.geo;S.P=F.P;
      for(const br of S.bridge)for(const p of br)p.s=Math.min(p.s,(p.lane?F.P.rear:F.P.bridge).len)}
  }
  R.sel=Math.max(0,Math.min(R.sel,SIDX.length-1));
  toast(`The airport now has the ${LAY.name} layout${refund?`. ${money(refund)} back for what didn't fit`:''}.`,null,null,'goal',10);
  if(!R.sim){renderBoard();renderCam();renderPanel()}
  return true;
}

// Airfield › Layout: every layout the player can rebuild into, as a small plan with what it gives and takes
// Airfield › Layout: every layout the player can rebuild into, as a small plan with what it gives and takes. The plan shows
// its rooms, each plane where it parks, and the shop fronts, from the same data the game uses.
function layoutPlan(L){
  const y0=(L.top||0)+40,w=300,k=w/L.W,h=Math.round((SEC_Y-y0)*k),X=x=>(x*k).toFixed(1),Y=y=>((y-y0)*k).toFixed(1),pts=P=>P.map(([x,y])=>X(x)+','+Y(y)).join(' ');
  let g=`<svg class="lplan" viewBox="0 0 ${w} ${h}" role="img" aria-label="Plan of the ${L.name} layout">`;
  for(const r of L.rooms)g+=`<polygon points="${pts(r.poly)}" fill="#2A3037"/>`;
  L.shops.forEach(s=>{const a=(s[5]||0)*Math.PI/180,c=Math.cos(a),sn=Math.sin(a),x=s[0],y=s[4]??452;g+=`<line x1="${X(x+44*c-44*sn)}" y1="${Y(y+44*sn+44*c)}" x2="${X(x+74*c-44*sn)}" y2="${Y(y+74*sn+44*c)}" stroke="#F5D08A" stroke-width="2" opacity=".8"/>`});
  L.stands.forEach(s=>{const T=standXf(s),q=(a,b)=>[T.ox+a*T.c-b*T.s,T.oy+a*T.s+b*T.c];
    g+=`<polygon points="${pts([q(-120,190),q(120,190),q(120,236),q(-120,236)])}" fill="#7F8A94"/><polygon points="${pts([q(-50,50),q(50,50),q(50,430),q(-50,430)])}" fill="${s.kind==='remote'?'#A9B3BC':'#CDD4DA'}"/>`});
  return g+'</svg>';
}
function layoutPanel(){
  const ids=Object.keys(LAYOUTS).filter(id=>id===G.layout||id==='classic'||has('lay:'+id));
  const cur=LAY,building=layoutBuilding();
  let h=`<p class="note">A new layout is built while the airport keeps running, and opens at 03:00. Gates, shops, planes and upgrades move across; anything the new layout has no room for is sold.</p>`;
  if(G.layoutNext)h+=`<div class="report">The <b>${LAYOUTS[G.layoutNext].name}</b> layout opens at 03:00${R.st.some((S,i)=>layoutDrains(i)&&S.F)?', once its last flights have left the stands it drops':''}.</div>`;
  for(const id of [G.layout,...ids.filter(x=>x!==G.layout)]){
    const L=LAYOUTS[id],me=id===G.layout,bld=building&&building.id==='layout:'+id;
    const lost=me?0:G.stands.filter((s,i)=>s.built&&i>=L.stands.length).length,lostS=me?0:G.shops.filter((s,j)=>s&&j>=L.shops.length).length;
    const btn=me?'<button class="buy" disabled>Current</button>':G.layoutNext===id?'<button class="buy" disabled>Opens 03:00</button>':bld?'<button class="buy" disabled>Building</button>':
      (building||G.layoutNext)?'<button class="buy" disabled>Wait</button>':`<button class="buy" data-layout="${id}" data-cost="${L.cost}">${money(L.cost)}</button>`;
    const walk=L.walk?`walks ${Math.round((L.walk-1)*100)}% quicker`:(L.rooms||[]).some(r=>r.walk)?'moving walkways':L.mover?'people mover':'';
    h+=`<div class="stand laycard" id="layout-${id}"><div class="sh"><div><span class="gate">${me?'●':'○'}</span><span class="rt">${L.name}</span></div>${btn}</div>${layoutPlan(L)}
      <div class="rd">${L.stands.length} stands${L.stands.some(s=>s.kind==='remote')?` (${L.stands.filter(s=>s.kind==='remote').length} remote)`:''} · ${L.shops.length} shop units${walk?' · '+walk:''}${L.upk?` · ${money(L.upk)}/h to run`:''}${me?'':` · ${Math.round(buildMins(L.build)/60*10)/10} h to build`}</div>
      <div class="rd"><b>+</b> ${L.up}</div><div class="rd"><b>−</b> ${L.down}</div>${L.from?`<div class="rd">Inspired by ${L.from}.</div>`:''}
      ${me&&L.stands.some(s=>s.kind==='remote')?loungeRow():''}${bld?buildLine('layout:'+id):''}${lost||lostS?`<div class="rd warn">Sells ${[lost?`${lost} stand${lost>1?'s':''}`:'',lostS?`${lostS} shop${lostS>1?'s':''}`:''].filter(Boolean).join(' and ')} it has no room for.</div>`:''}</div>`;
  }
  return h;
}
// the Remote apron's upgrade: lounges on stilts instead of buses
function loungeRow(){
  if(G.lounges)return '<div class="rd"><b>Mobile lounges</b> drive out to the remote stands and rise to the door, in any weather.</div>';
  if(isBuilding('lounges'))return buildLine('lounges');
  return `<div class="rd lounge"><span><b>Mobile lounges</b>, as at Washington Dulles: remote boarding as quick as a bridge in any weather, and no rating cost.</span><button class="buy" data-lounges="1" data-cost="${LOUNGES.cost}">${money(LOUNGES.cost)}</button></div>`;
}
function buyLounges(){if(G.lounges||isBuilding('lounges')||!canBuild()||!buy(LOUNGES.cost))return false;startBuild('lounges','mobile lounges',LOUNGES.build);return true}
function layoutClick(d,b){
  if(d.lounges){if(buyLounges()){renderPanel();save()}return true}
  if(!d.layout)return false;
  const key='layout'+d.layout;
  if(!R.sim&&!(R.armKey===key&&Date.now()-R.armT<3000)){R.armKey=key;R.armT=Date.now();b.textContent='Tap to confirm';b.classList.add('arm');return true}
  R.armKey=null;if(rebuildLayout(d.layout)){renderPanel();save()}return true;
}
