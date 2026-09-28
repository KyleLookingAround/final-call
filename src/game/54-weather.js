/* ================= WEATHER: rain, settled snow, puddles, fog banks, cloud shadows and a windsock ================= */
// Drawing only, reading weather.on, weather.until (through drawnWx, for photo mode) and wxForecast() and never changing them
// (docs/specs/real-airport.md): everything here is worked out fresh each frame from V.t and G.clock, so a game plays the
// same with or without frames drawn. How wet or snowy the ground still looks: full while the weather is on (rain's and
// snow's until is a rolling game minute, nudged forward every tick it's active), fading out over the minutes after it
// stops - never a new saved field
const wetness=()=>clamp(1-Math.max(0,G.clock-drawnWx.until('rain'))/20,0,1);
const snowCover=()=>clamp(1-Math.max(0,G.clock-drawnWx.until('snow'))/40,0,1);
const windStrength=()=>drawnWx.on('storm')?1:drawnWx.on('rain')?0.55:0.2;
// nine ground spots for puddles, spread across the apron band and moving with the layout's runway (AF_Y)
const WX_N=9;
function wxSpot(k){const y0=AF_Y+40,y1=TERM_Y-24;return [40+((k*217+53)%(W-80)),y0+((k*131+29)%Math.max(1,y1-y0))]}
// settled snow across the open apron: one wash, clipped out over every built stand so ground crews keep them clear
function wxSnow(V){
  const cov=snowCover();if(cov<=0)return;
  const y0=AF_Y+16,y1=TERM_Y-16;if(y1<=V.y0||y0>=V.y1)return;
  ctx.save();ctx.beginPath();ctx.rect(0,y0,W,y1-y0);
  for(const i of SIDX){if(!G.stands[i].built)continue;const [bx,by,bw,bh]=standBox(i);ctx.rect(bx+bw,by,-bw,bh)}
  ctx.clip('evenodd');ctx.fillStyle=`rgba(226,232,240,${0.24*cov})`;ctx.fillRect(0,y0,W,y1-y0);ctx.restore();
}
// puddles on the apron after rain
function wxPuddles(){
  const wet=wetness();if(wet<=0)return;
  for(let k=0;k<WX_N;k++){const [x,y]=wxSpot(k);lamp(x,y,20,'110,130,150',0.22*wet)}
}
// the windsock: always up, its droop and flutter reading the current wind
function windsockPos(){return [W-140,AF_Y+60]}
function wxWindsock(V){
  const [x,y]=windsockPos();if(!inView(x,y,50))return;
  const s=windStrength(),droop=0.2+s*1.15+Math.sin(V.t*(1.6+s*2))*0.05*s;
  ctx.save();ctx.translate(x,y);ctx.strokeStyle='#8C97A1';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,32);ctx.lineTo(0,-32);ctx.stroke();
  ctx.translate(0,-32);ctx.rotate(Math.PI/2-droop);
  ctx.fillStyle='#E5484D';ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(34,-2.5);ctx.lineTo(34,2.5);ctx.lineTo(0,5);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ECE8DF';ctx.fillRect(0,-5,8,10);
  ctx.restore();
}
// puddles shine when a light catches them at night
function wxShine(V){
  const wet=wetness();if(wet<=0||V.d<=0)return;
  for(let k=0;k<WX_N;k++){const [x,y]=wxSpot(k);lamp(x,y,10,'255,244,214',0.4*wet*V.d*2)}
}
// rain streaks, moved from draw() (12-drawing.js)
function wxRain(V){
  if(!drawnWx.on('rain'))return;const tt=V.t,st=drawnWx.on('storm');
  ctx.fillStyle=`rgba(20,30,50,${st?0.22:0.1})`;ctx.fillRect(0,Y0,W,Y1-Y0);
  ctx.strokeStyle='rgba(170,195,225,.35)';ctx.lineWidth=1;ctx.beginPath();
  for(let i=0;i<220;i++){const px=(i*97.3+tt*60)%W,py=Y0+((i*53.1+tt*260)%(Y1-Y0));ctx.moveTo(px,py);ctx.lineTo(px-4,py+12)}
  ctx.stroke();
  if(st&&Math.sin(tt*3.1)>0.992){ctx.fillStyle='rgba(255,250,230,.25)';ctx.fillRect(0,Y0,W,Y1-Y0)}
  if(st)sign(W/2-80,AF_Y-12,'STORM · RUNWAY CLOSED','#FFC72C');
}
// falling snow, moved from draw() (12-drawing.js)
function wxFalling(V){
  if(!drawnWx.on('snow'))return;const tt=V.t;
  ctx.fillStyle='rgba(230,236,244,.05)';ctx.fillRect(0,Y0,W,TERM_Y-Y0);
  ctx.fillStyle='rgba(240,244,250,.6)';
  for(let k=0;k<160;k++){const x=(k*157.3+tt*20*(1+(k%3)))%W,y=Y0+((k*97.1+tt*40*(1+(k%4)*0.3))%(TERM_Y-Y0));ctx.fillRect(x,y,1.6,1.6)}
}
// fog banks, moved from draw() (12-drawing.js): drawnFog (62-photo-mode.js) gates drawFog on the drawn fog
function wxFog(){drawnFog(0,Y0,W,TERM_Y-Y0+120,0.3)}
// cloud shadows drifting over the airfield, a little darker and faster as wxForecast() sees a storm closing in
function wxClouds(V){
  const fc=wxForecast(),soon=fc&&fc.type==='storm'?clamp(1-fc.eta/60,0,1):0;
  for(let j=0;j<3;j++){const x=((V.t*(14+j*5)+j*900)%(W+600))-300,y=AF_Y+60+j*90;if(!inView(x,y,220))continue;lamp(x,y,220,'6,10,16',0.05+0.05*soon)}
}
LAYER.apron.push(wxSnow,wxPuddles,wxWindsock);
LAYER.lit.push(wxShine);
LAYER.weather.push(wxRain,wxFalling,wxFog,wxClouds);
Object.assign(SIMX,{TERM_Y,wxSpot,wetness,snowCover,windsockPos,wxSnow,wxPuddles,wxWindsock,wxShine,wxRain,wxFalling,wxFog,wxClouds});
