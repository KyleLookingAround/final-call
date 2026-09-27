/* ================= famous faces ================= */
// Now and then someone famous flies from the airport (docs/systems/famous-faces.md). From level 3 a visit is booked a day
// ahead (G.famous.v: day, hour, who, kind), shown on the board and in the region news. On the day the earliest passenger
// flight leaving 40–300 minutes after their hour carries them: photographers wait outside the check-in doors until 10 minutes
// after they're through security, and fans line the barrier until 30 minutes after, the café they stop at (or the best one) takes 60% more
// for an hour, and the flight's departure moves the rating: +1 on time, −1 late. R.famous is the day's runtime.
const FAMOUS_KINDS=['footballer','pop star','film actor','royal'];
const FAMOUS_FIRST=['Lena','Marco','Siobhan','Tobias','Ines','Rafe','Anouk','Dario','Maisie','Kwame','Elif','Jonah'];
const FAMOUS_LAST=['Wrenfield','Castellane','Moorcroft','Ashdown','Brightwater','Kestrell','Delacourt','Farrowby','Quillon','Thornbury','Averill','Pennick'];
const FAMOUS_ROYAL=[['Princess','Aurelia'],['Prince','Casimir'],['Princess','Ottilie'],['Prince','Anselm']],FAMOUS_REALM=['Valdoria','Ostmark','Lindenholm','the Caravel Isles'];
const FAMOUS_CAFE=['cafe','coffee','dining','bar'];
REPWHY.famous=['famous passengers’ flights',['atc','crew','tugs','handlers']];REPLBL.famous='Famous passengers';
// days until the next visit: rarer at low levels
const famousGap=()=>(G.level>=6?3:G.level>=4?4:6)+Math.floor(rnd()*(G.level>=6?3:4));
// who's coming: "pop star Lena Wrenfield", or a royal's title
const famousName=v=>v.kind==='royal'?v.who:`${v.kind} ${v.who}`;
function famousBook(d){
  const kind=FAMOUS_KINDS[Math.floor(rnd()*FAMOUS_KINDS.length)];
  let who;if(kind==='royal'){const [t,n]=FAMOUS_ROYAL[Math.floor(rnd()*FAMOUS_ROYAL.length)];who=`${t} ${n} of ${FAMOUS_REALM[Math.floor(rnd()*FAMOUS_REALM.length)]}`}
  else who=FAMOUS_FIRST[Math.floor(rnd()*FAMOUS_FIRST.length)]+' '+FAMOUS_LAST[Math.floor(rnd()*FAMOUS_LAST.length)];
  const t=(d-1)*1440+(8+Math.floor(rnd()*11))*60+15*Math.floor(rnd()*4),v={d,t,who,kind,st:0};
  G.famous.v=v;R.famous=null;
  const s=famousName(v);news(`Tomorrow: ${s} flies from here at about ${hhmm(t)}.`);
  return v;
}
// each day: yesterday's visit is over; once the day comes round, book the next for tomorrow
TERM_DAY.push(()=>{
  const S=G.famous;if(!S||G.level<2)return;
  if(S.v&&S.v.d<G.day&&!(S.v.st===1&&R.famous)){S.v=null;R.famous=null} // a flight after midnight still counts
  if(!S.next)S.next=G.day+1+Math.floor(rnd()*3);
  if(!S.v&&G.day>=S.next){famousBook(G.day+1);S.next=G.day+1+famousGap()}
});
// the flight that carries them: the earliest passenger flight at a stand leaving 40–300 minutes from now, one with
// passengers still to come to the airport first
function famousFlight(){
  let best=null,bk=0;
  for(const S of R.st){const F=S.F;if(!F||F.freighter||!F.booked||F.plane.state==='closing')continue;const m=F.std-G.clock,k=F.manifest.length?2:1;
    if(m>=40&&m<=300&&(k>bk||k===bk&&F.std<best.std)){best=F;bk=k}}
  return best;
}
// one of its passengers, not yet at the airport if possible: business class first
function famousPax(F){
  const L=F.manifest,land=p=>p.F===F&&!p.inbound&&!p.kid&&LAND_ST.has(p.state);
  return L.find(p=>p.biz)||L.find(p=>!p.kid&&p.type!=='prm')||R.pax.find(p=>land(p)&&p.biz)||R.pax.find(land)||L[0]||R.pax.find(p=>p.F===F&&!p.inbound)||null;
}
// where the crowd stands: photographers outside the check-in doors, fans along the security barrier, a few at the café
function famousCrowd(){
  const ph=[],fan=[];
  for(let k=0;k<8;k++){const side=k<4?-1:1,j=k%4;ph.push([DOOR.x+side*(24+j*10),LAND_B+21+(j%2)*7])} // on the pavement either side of the doors
  for(let k=0;k<14;k++)fan.push([318+k*16+(k%3)*2,692+(k%2)*8]);
  return {ph,fan};
}
const famousShop=j=>j>=0&&G.shops[j]&&shopOpen(j);
function famousCafe(){
  let best=-1,rank=99;G.shops.forEach((s,j)=>{if(!famousShop(j))return;const r=FAMOUS_CAFE.indexOf(SHOPS[s.type].id),k=r<0?FAMOUS_CAFE.length:r;if(k<rank){rank=k;best=j}});
  return best;
}
function famousMinute(){
  const S=G.famous,v=S&&S.v;let f=R.famous;
  if(v&&v.st===1&&!f)v.st=0; // after a load: their flight is looked for again
  if(v&&v.st===0&&G.clock>=v.t){
    if(dayOf(G.clock)>v.d)v.st=2; // no flight turned up: they went by car
    else{const F=famousFlight();if(F){const p=famousPax(F);f=R.famous={F,i:F.i,p,shop:-1,e0:0,end:0,...famousCrowd(),out:null};v.st=1;v.flt=F.code+F.no;v.at=F.i}}
  }
  if(f&&v&&v.st===1){
    const F=f.F,p=f.p,air=p&&p.state!=='new'&&!LAND_ST.has(p.state)&&!['train','tram','bus'].includes(p.state);
    if(air&&f.out==null)f.out=G.clock;
    if(f.out!=null){if(f.ph.length&&G.clock>=f.out+10)f.ph=[];if(f.fan.length&&G.clock>=f.out+30)f.fan=[]}
    // the busy hour: the shop they stop at, else the best café once they head for the gate
    if(f.shop<0){const j=p&&(p.state==='toShop'||p.state==='shop')?p.shop:(F.plane.state==='boarding'&&isCalled(F)||p&&(p.state==='toGate'||p.state==='gate'))?famousCafe():-1;
      if(famousShop(j)){f.shop=j;f.e0=G.shops[j].earned||0;f.end=G.clock+60}}
    if(f.shop>=0&&G.clock<f.end&&famousShop(f.shop)){const s=G.shops[f.shop],d=(s.earned||0)-f.e0;
      if(d>0){const b=0.6*d;s.earned+=b;v.paid=(v.paid||0)+b;shopPt(f.shop,50,40);earn(b,'shops',WP.x,WP.y,'#FFC72C',null,f.i)}f.e0=s.earned||0}
    // their flight leaves: the rating moves with its punctuality
    if(R.st[f.i].F!==F){
      const h=G.history.find(x=>x.tag===F.code+F.no&&x.std===F.std),s=famousName(v),S0=s[0].toUpperCase()+s.slice(1);
      if(h){const late=h.late>0;repAdj(late?-1:1,'famous',f.i);news(late?`${S0} left ${h.late} min late on ${h.tag}, and the papers noticed.`:`${S0} left on time on ${h.tag}.`)}
      v.st=2;f.ph=[];f.fan=[];f.shop=-1;R.famous=null;f=null;
    }
  }
  if(!R.sim)famousLine();
}
TERM_MINUTE.push(famousMinute);
// the line under the departures board, from the day before until they've flown
let famousSig=null;
function famousLine(){
  const el=$('#ffLine');if(!el)return;const v=G.famous&&G.famous.v,d=dayOf(G.clock);
  const t=!v||v.st===2||v.d<d&&v.st!==1||v.d>d+1?'':`★ ${v.st===1&&v.flt?v.flt:v.d>d?'Tomorrow ~'+hhmm(v.t):'Today ~'+hhmm(v.t)} · ${famousName(v)}`;
  if(t===famousSig)return;famousSig=t;el.hidden=!t;el.textContent=t;
}
// the board's row for their flight wears a star (14-board.js)
const famousStar=F=>!!(R.famous&&R.famous.F===F);
// the crowd, the flashes, and a gold ring round the famous passenger
TERM_DRAW.push(()=>{
  const f=R.famous;if(!f)return;const now=performance.now(); // cosmetic
  const dot=(x,y,c,r=3.2)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#14171B';ctx.lineWidth=0.9;ctx.stroke()};
  // photographers: grey coats and black cameras, a flash now and then
  f.ph.forEach(([x,y],k)=>{dot(x,y,'#8C98A5');ctx.fillStyle='#0E1114';ctx.fillRect(x-2.2,y-6.6,4.4,3);
    if(!REDUCED&&((now/70+k*11)|0)%9===0){ctx.fillStyle='rgba(255,255,235,.9)';ctx.beginPath();ctx.arc(x,y-5,7,0,Math.PI*2);ctx.fill()}});
  const wave=REDUCED?0:Math.sin(now/260); // cosmetic
  f.fan.forEach(([x,y],k)=>{const u=y+(k%2?wave:-wave)*1.2;dot(x,u,k%3?'#FF7AB6':'#C39BFF');if(k%4===1){ctx.fillStyle='#FFC72C';ctx.fillRect(x-3,u-9,6,4)}}); // fans, a few holding up signs
  if(f.shop>=0&&G.clock<f.end)for(let k=0;k<5;k++){shopPt(f.shop,14+k*17,56+(k%2)*6);dot(WP.x,WP.y,k%2?'#FF7AB6':'#C39BFF')}
  const p=f.p;if(p&&R.pax.includes(p)&&!paxHidden(p)&&p.state!=='sitting'&&p.state!=='aisle'){const x=p.ex??p.x,y=p.ey??p.y;
    ctx.strokeStyle='#FFC72C';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#FFC72C';ctx.font='700 8px "Saira Condensed","Arial Narrow",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',x,y-10)}
});
