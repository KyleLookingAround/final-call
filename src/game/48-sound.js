/* ================= sound: announcements for your flights, and ambience that follows the camera ================= */
// It watches what the game already does (plane states, F.called, the board's status) from the frame loop, four times a
// second, never from update(), and never changes game state. Nothing runs in the headless sim, and nothing sounds before
// the player's first tap (AC starts then, 06-sound.js). The settings are G.set.sndAnn ('on', 'chime', 'off'), sndVoice,
// sndAmb and sndFx; G.sound is the master switch.
const SND={q:[],log:[],played:[],cur:null,until:0,lastAnn:-1e9,lastVoice:-1e9,seen:new WeakMap(),amb:null,buf:null,
  lvl:{hum:0,rain:0,jet:[0,0]}}; // log: every call detected; played: every one that played, and how
const SND_GAP=20000,SND_SHOW=8000,SND_KEEP=30000,SND_VOICE_GAP=300000; // real milliseconds
const sndNight=()=>{const h=(G.clock/60)%24;return h>=23||h<5};
function annText(k,F,g,was,say){
  const f=say?`${String(F.code).split('').join(' ')} ${String(F.no).split('').join(' ')}`:F.code+F.no,to=F.dest[1];
  return k==='board'?`Flight ${f} to ${to} is now boarding at gate ${g}`:k==='call'?`Passengers for ${f} to ${to}, please go to gate ${g}`:
    k==='final'?`Final call for ${f} to ${to} at gate ${g}`:`Gate change: flight ${f} to ${to} now leaves from gate ${g}, not ${was}`;
}
// your own flights only: partners' and freighters' are never called
function annWatch(now){
  for(const i of SIDX){const F=R.st[i]&&R.st[i].F;if(!F||F.partner||F.freighter)continue;
    const pl=F.plane,called=isCalled(F),st=called?statusText(F):'',g=GATES[i];let s=SND.seen.get(F);
    if(!s){// first sight (a load, or a flight that's just arrived): only what happens from now on is called
      const on=called&&(pl.state==='boarding'||pl.state==='closing');SND.seen.set(F,{call:F.called!=null,board:on,final:on&&G.clock>=F.std-10,g:called?g:null});continue}
    if(!s.call&&F.called!=null&&pl.state!=='closing'){s.call=true;if(st!=='BOARDING')annAdd('call',F,g,now)}
    if(!s.board&&st==='BOARDING'){s.board=true;annAdd('board',F,g,now)}
    if(!s.final&&st==='FINAL CALL'){s.final=s.board=true;annAdd('final',F,g,now)}
    if(called){if(s.g&&s.g!==g&&pl.state!=='closing')annAdd('gate',F,g,now,s.g);s.g=g}
  }
}
function annAdd(k,F,g,now,was){
  const a=SET().sndAnn||'on';if(a==='off')return;
  if(sndNight()&&k!=='final')return; // a quiet night: only final calls
  SND.log.push({k,f:F.code+F.no,own:!F.partner&&!F.freighter,clock:G.clock,t:now});
  SND.q=SND.q.filter(x=>!(x.k===k&&x.F===F)); // the newest of each kind per flight
  SND.q.push({k,F,t:now,text:annText(k,F,g,was),say:annText(k,F,g,was,true)});
}
function annPlay(now){
  const a=SET().sndAnn||'on';
  if(SND.cur&&(now>=SND.until||a!=='on')){SND.cur=null;annLine(null)}
  if(a==='off'){SND.q.length=0;return}
  SND.q=SND.q.filter(x=>now-x.t<=SND_KEEP);
  if(SND.cur||!SND.q.length||now<SND.until)return;
  if(R.speed>=4&&now-SND.lastAnn<SND_GAP)return; // at 4x and 8x, one every 20 seconds
  const it=SND.q.shift(),big=it.k==='final'||it.k==='gate';SND.lastAnn=now;SND.until=now+SND_SHOW;
  if(big){tone(784,0.45,0.05);tone(659,0.45,0.05,'sine',0.25);tone(523,0.8,0.05,'sine',0.5)}else chime();
  const words=a==='on',voice=words&&annVoice(it,now);
  if(words){SND.cur=it;annLine(it.text)}
  SND.played.push({k:it.k,f:it.F.code+it.F.no,words,voice,sound:!!(G.sound&&AC),speed:R.speed,clock:G.clock,t:now});
}
// spoken calls: at most one every 5 minutes, only final calls and gate changes, at 1x or 2x, while the page is visible
function annVoice(it,now){
  const ss=window.speechSynthesis;
  if(!ss||!AC||!G.sound||SET().sndVoice===false||(it.k!=='final'&&it.k!=='gate')||!(R.speed===1||R.speed===2)||document.visibilityState!=='visible'||sndNight()||now-SND.lastVoice<SND_VOICE_GAP)return false;
  try{const u=new SpeechSynthesisUtterance(it.say),vs=ss.getVoices?ss.getVoices():[],norm=v=>(v.lang||'').replace('_','-').toLowerCase();
    const v=vs.find(v=>norm(v)==='en-gb')||vs.find(v=>norm(v).startsWith('en'));if(v)u.voice=v;u.lang='en-GB';u.rate=0.92;u.volume=0.8;
    setTimeout(()=>{try{ss.cancel();ss.speak(u)}catch(e){}},1100)}catch(e){return false}
  SND.lastVoice=now;return true;
}
// the words along the foot of the departures board; a line too long for the board scrolls
function annLine(text){
  const el=$('#bann');if(!el)return;
  if(!text){el.hidden=true;el.classList.remove('run');return}
  const sp=el.firstElementChild;sp.textContent=text;el.classList.remove('run');el.hidden=false;
  const over=sp.scrollWidth-el.clientWidth+24;if(over>24&&!REDUCED){el.style.setProperty('--dx',-over+'px');void el.offsetWidth;el.classList.add('run')}
}
/* ---------- ambience: filtered noise for the terminal's hum, the jets and the rain ---------- */
function ambChain(type,f,q,pan){
  const s=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain();s.buffer=SND.buf;s.loop=true;fl.type=type;fl.frequency.value=f;fl.Q.value=q;g.gain.value=0;
  let p=null;if(pan&&AC.createStereoPanner){p=AC.createStereoPanner();s.connect(fl).connect(g).connect(p).connect(AC.destination)}else s.connect(fl).connect(g).connect(AC.destination);
  s.start();return {g,f:fl,p};
}
function ambMake(){
  const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);
  for(let k=0;k<n;k++)d[k]=Math.random()*2-1; // cosmetic
  SND.buf=b;SND.amb={hum:ambChain('lowpass',170,0.7),rain:ambChain('highpass',2400,0.5),jet:[ambChain('lowpass',420,1,true),ambChain('lowpass',420,1,true)]};
}
// how much of the view a world rectangle fills (0 to 1)
function viewShare(x0,y0,x1,y1){const k=viewK(),vx=R.cam.x,vy=R.cam.y,vw=R.sw/k,vh=R.sh/k;
  const w=Math.max(0,Math.min(x1,vx+vw)-Math.max(x0,vx)),h=Math.max(0,Math.min(y1,vy+vh)-Math.max(y0,vy));return w*h/Math.max(1,vw*vh)}
function ambLevels(){
  const L=SND.lvl,air=R.view==='airport',zoom=clamp(R.cam.z/1.6,0.25,1);
  const hall=air?viewShare(0,TERM_Y,1480,LAND_B):0,inside=hall*zoom; // over the halls and zoomed in, you're indoors
  L.hum=air?0.035*(0.2+0.8*hall)*zoom*(sndNight()?1/3:1):0;
  const wet=R.fx.storm>G.clock?1:R.fx.rain>G.clock?0.5:0;L.rain=0.05*wet*(1-0.7*inside);
  L.pan=[0,0];L.cut=[420,420];
  for(let r=0;r<2;r++){const a=R.rwy.act[r];L.jet[r]=0;if(!a||!air)continue;
    const k=a.t/a.dur,HX=W-60,x=a.type==='arr'?W+120-(1-Math.pow(1-k,2))*(W+120-90):HX-10-k*k*(HX+150);
    const env=a.type==='arr'?clamp(1-Math.abs(k-0.3)*1.3,0.15,1):clamp(0.35+k,0.35,1)*(k>0.9?(1-k)*10:1);
    const kv=viewK(),sx=(x-R.cam.x)*kv/R.sw,sy=(RWY_Y[r]-R.cam.y)*kv/R.sh,off=Math.max(0,-sx,sx-1,-sy,sy-1);
    L.jet[r]=0.07*env*zoom*(1-0.6*inside)/(1+3*off);L.pan[r]=clamp(sx*2-1,-1,1);L.cut[r]=a.type==='dep'?300+700*k:700-300*k}
}
function ambStep(){
  const L=SND.lvl,on=AC&&G.sound&&SET().sndAmb!==false&&document.visibilityState==='visible';
  if(on)ambLevels();else{L.hum=L.rain=0;L.jet=[0,0]}
  if(!AC||(!on&&!SND.amb))return;
  try{if(!SND.amb)ambMake();const A=SND.amb,t=AC.currentTime;
    A.hum.g.gain.setTargetAtTime(L.hum,t,0.5);A.rain.g.gain.setTargetAtTime(L.rain,t,0.8);
    A.jet.forEach((j,r)=>{j.g.gain.setTargetAtTime(L.jet[r],t,0.25);if(on){if(j.p)j.p.pan.setTargetAtTime(L.pan[r],t,0.2);j.f.frequency.setTargetAtTime(L.cut[r],t,0.3)}})}catch(e){}
}
// from the frame loop, four times a second
function soundTick(now=performance.now()){
  if(R.sim)return;
  annWatch(now);annPlay(now);ambStep();
}
document.addEventListener('visibilitychange',()=>{if(!AC||R.sim)return;try{Promise.resolve(document.hidden?AC.suspend():AC.resume()).catch(()=>{})}catch(e){}});
SIMX.SND=SND;SIMX.soundTick=soundTick;SIMX.annLine=annLine;SIMX.annAdd=annAdd;SIMX.annText=annText;SIMX.sndNight=sndNight;SIMX.ensureAudio=ensureAudio;SIMX.tick=tick;SIMX.kaching=kaching;
