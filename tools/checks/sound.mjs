// Sound (docs/specs/sound.md), with a stub audio context and speech synthesis that count what plays: your flights'
// boarding, gate calls and final calls each announce once, never a partner's or a freighter's; spoken calls are rare,
// only final calls and gate changes, and none at 4x; each setting silences its own part and the master switch all of
// them; nothing happens in the headless sim; nights are quiet; and the board's line fits a 320 px phone.
// Also (release audit #151, row 22-24): several kaching triggers within a moment (goals completing together) ring
// once, not a volley; a stamp and a weekly challenge each play their own chime; Effects off silences the choice
// toast's alert tone and the build-finished fanfare too; and records and stamps show as an on-screen toast, not a
// floater fixed to a map spot, so they're seen on a phone and in landscape.
const STUB=()=>{
  window.__snd={osc:[],speak:[]};
  class P{constructor(v=0){this.value=v}setValueAtTime(v){this.value=v}linearRampToValueAtTime(v){this.value=v}exponentialRampToValueAtTime(v){this.value=v}setTargetAtTime(v){this.value=v}}
  class N{constructor(){this.gain=new P(1);this.frequency=new P();this.Q=new P();this.pan=new P()}connect(n){return n}start(){}stop(){}}
  window.AudioContext=class{constructor(){this.currentTime=0;this.sampleRate=8000;this.destination=new N()}
    createOscillator(){const o=new N();o.start=()=>__snd.osc.push({f:o.frequency.value,type:o.type});return o}
    createGain(){return new N()}createBiquadFilter(){return new N()}createStereoPanner(){return new N()}createBufferSource(){return new N()}
    createBuffer(c,n){const d=new Float32Array(n);return {getChannelData:()=>d}}suspend(){return Promise.resolve()}resume(){return Promise.resolve()}};
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speak:u=>__snd.speak.push(u.text),cancel(){},getVoices:()=>[{lang:'en-US'},{lang:'en_GB'}]}});
  window.SpeechSynthesisUtterance=class{constructor(t){this.text=t}};
};
// runs the game for some game minutes at a speed, with the sound watching as the frame loop would (real time follows the speed)
const DRIVE=()=>{const S=__sim,R=S.R;window.__t=window.__t||1e6;
  window.drive=(mins,speed)=>{R.speed=speed;for(let k=0;k<mins*10;k++){R.sim=true;S.update(0.1);R.sim=false;__t+=100/speed;if(k%2===0)S.soundTick(__t)}R.speed=0};
  window.toHour=h=>{R.sim=true;let n=0;while(Math.floor((S.G.clock/60)%24)!==h&&n++<30000)S.update(0.1);R.sim=false};
  window.kinds=a=>a.reduce((o,x)=>(o[x.k]=(o[x.k]||0)+1,o),{});
  window.snap=()=>({played:S.SND.played.length,log:S.SND.log.length,osc:__snd.osc.length,speak:__snd.speak.length});
};
export default async function({open,ok,saveText}){
  const {ctx,page,errs}=await open(undefined,saveText('v28-L9.json'),false,{still:true});
  await page.evaluate(STUB);await page.evaluate(DRIVE);
  // nothing in the headless sim, even with the watcher called
  const sim=await page.evaluate(()=>{const S=__sim,R=S.R;S.ensureAudio();R.sim=true;for(let k=0;k<600;k++){S.update(0.1);S.soundTick(1e6+k*100)}R.sim=false;
    return {log:S.SND.log.length,q:S.SND.q.length,osc:__snd.osc.length,amb:!!S.SND.amb}});
  ok('sound: nothing is watched, queued or played in the headless sim',!sim.log&&!sim.q&&!sim.osc&&!sim.amb,JSON.stringify(sim));
  // a morning at 1x: your own flights' boarding, gate calls and final calls, each once
  const day=await page.evaluate(()=>{const S=__sim,R=S.R,G=S.G;(G.pol||(G.pol={})).late='wait';toHour(8);let partners=0,freighters=0;
    // one of your flights boarding with many still to sit is brought forward, so a final call is certain whatever else the morning holds
    let late=false;const lateOne=()=>{const F=S.SIDX.map(i=>R.st[i].F).find(F=>F&&!F.partner&&!F.freighter&&F.plane.state==='boarding'&&S.isCalled(F)&&F.seated<F.booked-40&&F.std-G.clock>20);
      if(F){F.std=Math.ceil((G.clock+20)/5)*5;late=true}};
    for(let m=0;m<300;m++){if(!late&&m<180)lateOne();drive(1,1);for(const i of S.SIDX){const F=R.st[i].F;if(F&&F.partner)partners++;if(F&&F.freighter)freighters++}}
    const L=S.SND.log,dup=new Set(),twice=L.filter(x=>{const k=x.k+x.f;if(dup.has(k))return true;dup.add(k);return false}).map(x=>x.k+' '+x.f);
    return {kinds:kinds(L),notOwn:L.filter(x=>!x.own).length,twice,partners,freighters,played:S.SND.played.length,words:S.SND.played.filter(p=>p.words).length,line:document.querySelector('#bann').hidden?null:document.querySelector('#bann').textContent}});
  ok('sound: your flights’ boarding, gate calls and final calls each announce once, never a partner’s or freighter’s',
    day.kinds.board>0&&day.kinds.call>0&&day.kinds.final>0&&!day.notOwn&&!day.twice.length&&day.partners>0&&day.played>0&&day.words===day.played,JSON.stringify(day));
  // spoken calls: at most one every 5 minutes, only final calls and gate changes, and none at 4x or at night
  const voice=await page.evaluate(()=>{const S=__sim,R=S.R,SND=S.SND;toHour(10);const F=S.SIDX.map(i=>R.st[i].F).find(F=>F&&!F.partner&&!F.freighter);
    const say=(k,dt,speed)=>{__t+=dt;SND.q.length=0;S.annAdd(k,F,'A1',__t);R.speed=speed;S.soundTick(__t);R.speed=0;const p=SND.played.at(-1);return p&&p.t===__t?(p.voice?'V':'-'):'x'};
    SND.lastVoice=-1e9;const seq=[say('final',9e3,1),say('final',60e3,1),say('gate',60e3,2),say('board',190e3,1),say('call',9e3,1),say('gate',9e3,2),say('final',9e3,1)].join('');
    SND.lastVoice=-1e9;const fast=[say('final',30e3,4),say('gate',30e3,8)].join('');
    // and over a real day at 1x, the gaps between spoken calls
    const v0=SND.played.length;drive(600,1);const V=SND.played.slice(v0).filter(p=>p.voice),gaps=V.slice(1).map((p,k)=>p.t-V[k].t);
    return {seq,fast,voiced:V.length,kinds:kinds(V),minGap:Math.min(...gaps,1e9)}});
  voice.speak=await page.evaluate(async()=>{await new Promise(r=>setTimeout(r,1300));return __snd.speak.length});
  ok('sound: spoken calls at most one every 5 minutes, only final calls and gate changes, none at 4x',
    voice.seq==='V----V-'&&voice.fast==='--'&&voice.minGap>=300000&&Object.keys(voice.kinds).every(k=>k==='final'||k==='gate')&&voice.speak>0,JSON.stringify(voice));
  // each setting silences its own part and nothing else; the master switch silences everything
  const sets=await page.evaluate(()=>{const S=__sim,G=S.G,SND=S.SND,out={};toHour(10);
    const one=(name,change)=>{Object.assign(G.set,{sndAnn:'on',sndVoice:true,sndAmb:true,sndFx:true});G.sound=true;change();SND.lastVoice=-1e9;
      const a=snap(),p0=SND.played.length;let hum=0;for(let m=0;m<90;m++){drive(1,1);hum=Math.max(hum,SND.lvl.hum)}S.lastKaching=-1e9;S.tick();S.kaching();S.R.speed=0;SND.lastVoice=-1e9;SND.q.length=0;{const F=S.SIDX.map(i=>S.R.st[i].F).find(F=>F&&!F.partner&&!F.freighter);__t+=9e3;S.annAdd('final',F,'A1',__t);S.R.speed=1;S.soundTick(__t);S.R.speed=0}
      const P=SND.played.slice(p0),b=snap(),osc=__snd.osc.slice(a.osc),fx=osc.filter(o=>o.type==='square'||(o.type==='triangle'&&o.f>1200)).length;
      out[name]={calls:P.length,words:P.filter(p=>p.words).length,voiced:P.filter(p=>p.voice).length,chimes:osc.filter(o=>o.type==='sine').length,hum:+hum.toFixed(4),fx}};
    one('all',()=>{});one('chime',()=>{G.set.sndAnn='chime'});one('annOff',()=>{G.set.sndAnn='off'});one('voiceOff',()=>{G.set.sndVoice=false});
    one('ambOff',()=>{G.set.sndAmb=false});one('fxOff',()=>{G.set.sndFx=false});one('master',()=>{G.sound=false});
    Object.assign(G.set,{sndAnn:'on',sndVoice:true,sndAmb:true,sndFx:true});G.sound=true;return out});
  {const s=sets,on=x=>x.calls>0&&x.chimes>0&&x.hum>0&&x.fx>0;
    const pass=on(s.all)&&s.all.words>0&&s.all.voiced>0&&
      on(s.chime)&&!s.chime.words&&!s.chime.voiced&&
      !s.annOff.calls&&!s.annOff.chimes&&s.annOff.hum>0&&s.annOff.fx>0&&
      on(s.voiceOff)&&s.voiceOff.words>0&&!s.voiceOff.voiced&&
      s.ambOff.calls>0&&!s.ambOff.hum&&s.ambOff.fx>0&&
      s.fxOff.calls>0&&s.fxOff.chimes>0&&s.fxOff.hum>0&&!s.fxOff.fx&&
      !s.master.chimes&&!s.master.voiced&&!s.master.hum&&!s.master.fx;
    ok('sound: each setting silences its own part and nothing else, and the master switch silences everything',pass,JSON.stringify(s))}
  // several kaching triggers within a moment (three goals completing together at the tour's end) ring once, not a volley;
  // a later, unrelated one still rings
  const batch=await page.evaluate(()=>{const S=__sim,G=S.G;S.ensureAudio();Object.assign(G.set,{sndFx:true});G.sound=true;S.lastKaching=-1e9;
    const before=__snd.osc.length;S.kaching();S.kaching();S.kaching();const burst=__snd.osc.length-before;
    S.lastKaching=performance.now()-700;S.kaching();const later=__snd.osc.length-before;
    return {burst,later}});
  ok('sound: several kaching triggers within a moment ring once, and a later one still rings',batch.burst===2&&batch.later===4,JSON.stringify(batch));
  // a stamp and a weekly challenge each play their own chime and show as a toast, once, with Effects off silencing both
  const award=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;S.ensureAudio();Object.assign(G.set,{sndFx:true});G.sound=true;
    R.toasts.length=0;G.stamps={};G.flights=Math.max(G.flights,1);S.lastKaching=-1e9;
    const o0=__snd.osc.length;S.checkStamps();
    const stamp={osc:__snd.osc.length-o0,toast:R.toasts.length>0&&R.toasts.at(-1).kind==='goal'};
    R.toasts.length=0;G.chal={wk:0,list:[{id:'pax',goal:1,base:0,done:0}],snap:{},sets:0,pay:100,all:0};G.flown=Math.max(G.flown,1);
    const o1=__snd.osc.length;S.checkChal();
    const chal={osc:__snd.osc.length-o1,toast:R.toasts.length>0&&R.toasts.at(-1).kind==='goal'};
    G.set.sndFx=false;G.stamps={};const o2=__snd.osc.length;S.checkStamps();const stampOff=__snd.osc.length-o2;
    G.chal={wk:0,list:[{id:'pax',goal:1,base:0,done:0}],snap:{},sets:0,pay:100,all:0};const o3=__snd.osc.length;S.checkChal();const chalOff=__snd.osc.length-o3;
    G.set.sndFx=true;return {stamp,chal,stampOff,chalOff}});
  ok('sound: a stamp and a challenge each play once, and Effects off silences both',
    award.stamp.osc>0&&award.stamp.toast&&award.chal.osc>0&&award.chal.toast&&!award.stampOff&&!award.chalOff,JSON.stringify(award));
  // Effects off also silences the choice toast's alert tone and the build-finished fanfare
  // (the late-departure tone stays as it is: its call is in 08-stands.js, batch B1's file, #147)
  const fxGate=await page.evaluate(()=>{const S=__sim,G=S.G;S.ensureAudio();G.sound=true;
    const run=on=>{G.set.sndFx=on;const o0=__snd.osc.length;S.alertTone();S.fanfare();return __snd.osc.length-o0};
    return {off:run(false),on:run(true)}});
  ok('sound: Effects off silences the choice toast’s alert tone and the build-finished fanfare',fxGate.off===0&&fxGate.on>0,JSON.stringify(fxGate));
  // a gate change: switching layout moves your called flights to new gate names, and the announcer calls them
  const gate=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,SND=S.SND;drive(20,1);const l0=SND.log.length;
    R.sim=true;S.switchLayout('mid');R.sim=false;__t+=1000;S.soundTick(__t);const L=SND.log.slice(l0).filter(x=>x.k==='gate');R.sim=true;S.switchLayout('classic');R.sim=false;__t+=1000;S.soundTick(__t);
    return {gates:L.length,text:SND.q.concat(SND.cur||[]).filter(x=>x.k==='gate').map(x=>x.text)[0]||''}});
  ok('sound: a gate change is announced',gate.gates>0&&/^Gate change: flight \w+ to .+ now leaves from gate \w+, not \w+$/.test(gate.text),JSON.stringify(gate));
  // a quiet night: from 23:00 to 05:00 only final calls, and never spoken
  const night=await page.evaluate(()=>{const S=__sim,G=S.G,SND=S.SND;(G.pol||(G.pol={})).curfew=false;G.pol.late='wait';toHour(23);SND.q.length=0;
    // the night's first new flight of your own has a late passenger, so it's still boarding at its final call whatever else the night holds
    let late=false;const lateOne=()=>{const R=S.R,F=S.SIDX.map(i=>R.st[i].F).find(F=>F&&!F.partner&&!F.freighter&&!F.straggler&&F.std-G.clock>30&&F.manifest.some(q=>!q.leader&&q.type!=='fam'&&q.type!=='grp'&&q.type!=='prm'));
      if(F){const k=F.manifest.findIndex(q=>!q.leader&&q.type!=='fam'&&q.type!=='grp'&&q.type!=='prm');F.straggler=F.manifest.splice(k,1)[0];F.stragglerAt=F.std+3;late=true}};
    const p0=SND.played.length,l0=SND.log.length;let hum=0,day=0;
    for(let m=0;m<355;m++){if(!late&&m<240)lateOne();drive(1,1);hum=Math.max(hum,SND.lvl.hum)}const P=SND.played.slice(p0),Lg=SND.log.slice(l0);
    toHour(12);for(let m=0;m<30;m++){drive(1,1);day=Math.max(day,SND.lvl.hum)}
    return {kinds:kinds(P),logged:kinds(Lg),voiced:P.filter(p=>p.voice).length,hum:+hum.toFixed(4),day:+day.toFixed(4)}});
  ok('sound: from 23:00 to 05:00 only final calls chime, unspoken, and the hum drops',Object.keys(night.kinds).join()==='final'&&Object.keys(night.logged).join()==='final'&&!night.voiced&&night.hum>0&&night.hum<night.day*0.5,JSON.stringify(night));
  if(errs.length)ok('sound: no page errors',false,errs[0]);
  await ctx.close();
  // the board's line: the words fit a 320 px phone, scrolling when too long, and look right on a phone, tablet and desktop
  for(const [w,h,touch,name] of [[320,640,true,'320'],[390,844,true,'phone'],[768,1024,false,'tablet'],[1440,900,false,'desktop']]){
    const {ctx,page,errs}=await open({width:w,height:h},saveText('v28-L9.json'),touch,{still:true});
    const r=await page.evaluate(()=>{__sim.annLine('Gate change: flight SH7574 to Rio de Janeiro now leaves from gate B12, not A3');const el=document.querySelector('#bann'),b=el.getBoundingClientRect(),bd=document.querySelector('.board').getBoundingClientRect();
      return {shown:!el.hidden,left:b.left,right:b.right,bl:bd.left,br:bd.right,run:el.classList.contains('run'),fits:el.scrollWidth<=el.clientWidth+1,page:document.documentElement.scrollWidth}});
    await page.waitForTimeout(1500);await page.screenshot({path:`build/shots/sound-${name}.png`,clip:{x:0,y:0,width:w,height:Math.min(h,320)}});
    ok(`sound: the board's line fits a ${name} screen`,r.shown&&r.left>=r.bl-2&&r.right<=r.br+2&&r.page<=w&&(r.run||r.fits)&&!errs.length,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
  // a record shows as an on-screen toast, not a floater fixed to a map spot, so it's seen on a phone and a wide desktop alike
  for(const [w,h,name] of [[390,844,'p390'],[1440,900,'d1440']]){
    const {ctx,page,errs}=await open({width:w,height:h},saveText('v28-L9.json'),w<700,{still:true});
    const r=await page.evaluate(()=>{const S=__sim,G=S.G;G.rec={};S.setRec('dayPax',100,false);S.setRec('dayPax',9999,true);
      const t=S.R.toasts.at(-1),el=document.querySelector('#toasts .toast:last-child'),stage=document.querySelector('.stage').getBoundingClientRect();
      const b=el?el.getBoundingClientRect():null;
      return {kind:t&&t.kind,text:t&&t.text,within:!!b&&b.top>=stage.top-1&&b.bottom<=stage.bottom+1&&b.left>=0&&b.right<=innerWidth}});
    await page.waitForTimeout(300);await page.screenshot({path:`build/shots/record-${name}.png`,clip:{x:0,y:0,width:w,height:Math.min(h,420)}});
    ok(`sound: a record shows as an on-screen toast at ${name}`,r.kind==='goal'&&/Record/.test(r.text||'')&&r.within&&!errs.length,JSON.stringify(r)+(errs.length?' '+errs[0]:''));
    await ctx.close();
  }
}
