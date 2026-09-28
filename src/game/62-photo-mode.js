/* ================= PHOTO MODE: hide the panels, pick a drawn time and sky, and save a picture ================= */
// docs/specs/photo-mode.md. Runtime only: R.photo is null while it's off. The drawn hour and sky are overrides that drawing
// reads through drawnHour() (darkness() and sceneView) and drawnWx (54-weather.js); G.clock, R.fx and the random stream
// never change, and leaving clears them.
const PH_TIME=[['Now',null],['Dawn',6.6],['Noon',12],['Dusk',19.6],['Night',23]];
const PH_SKY=['Now','Clear','Rain','Fog','Snow'];
// the hour the lighting is drawn at: the game's own, or the one picked in photo mode
function drawnHour(){const p=R.photo;return p&&p.hour!=null?p.hour:(G.clock/60)%24}
// the weather clocks as drawing sees them: R.fx, or with a sky picked, just that weather and on for good
function drawnFx(){const p=R.photo;return p&&p.fx||R.fx}
// weather.on and weather.until (28-region-weather.js) as drawing sees them
const drawnWx={on:k=>{const f=R.photo&&R.photo.fx;return f?f[k]>G.clock:weather.on(k)},until:k=>{const f=R.photo&&R.photo.fx;return f?f[k]:weather.until(k)}};
function photoFx(sky){if(sky==='Now')return null;const on=k=>sky.toLowerCase()===k?Infinity:-Infinity;return {rain:on('rain'),snow:on('snow'),fog:on('fog'),storm:-Infinity}}
// fog banks for the drawn sky: drawFog (29-region-map.js) gates itself on weather.on('fog'), so a picked fog stands in for that one call
function drawnFog(x,y,w,h,a){if(!(R.photo&&R.photo.fx)){drawFog(x,y,w,h,a);return}if(!drawnWx.on('fog'))return;
  const was=weather.until('fog');weather.set('fog',Infinity);try{drawFog(x,y,w,h,a)}finally{weather.set('fog',was)}}
function photoOn(){
  if(R.photo)return;
  const p=R.photo={ti:0,si:0,hour:null,fx:null,speed:R.speed,view:null,paused:null};
  document.body.classList.add('photo');$('#photobar').hidden=false;resize();renderPhotoBar();requestAnimationFrame(()=>photoTick(p));
}
function photoOff(){
  const p=R.photo;if(!p)return;R.photo=null;
  document.body.classList.remove('photo');$('#photobar').hidden=true;resize();if(R.speed!==p.speed)setSpeed(p.speed);
}
function photoStep(k){const p=R.photo;if(!p)return;
  if(k==='time'){p.ti=(p.ti+1)%PH_TIME.length;p.hour=PH_TIME[p.ti][1]}
  else{p.si=(p.si+1)%PH_SKY.length;p.fx=photoFx(PH_SKY[p.si])}
  renderPhotoBar();
}
function renderPhotoBar(){const p=R.photo;if(!p)return;const b=$('#photobar'),map=R.view!=='world';
  p.view=R.view;p.paused=R.speed===0;
  const t=b.querySelector('[data-ph="time"]'),s=b.querySelector('[data-ph="sky"]'),z=b.querySelector('[data-ph="pause"]');
  t.hidden=s.hidden=!map;t.querySelector('b').textContent=PH_TIME[p.ti][0];s.querySelector('b').textContent=PH_SKY[p.si];
  t.setAttribute('aria-label','Time of day: '+PH_TIME[p.ti][0]);s.setAttribute('aria-label','Weather: '+PH_SKY[p.si]);
  z.classList.toggle('on',p.paused);z.setAttribute('aria-pressed',p.paused);
}
// each frame while it's on, after draw(): the Region's drawn sky over the map, and the bar kept in step with the view and speed
function photoTick(p){if(R.photo!==p)return; // this entry's loop only, so leaving and coming back in one frame can't run two
  if(p.view!==R.view||p.paused!==(R.speed===0))renderPhotoBar();
  if(R.view==='region'&&p.fx)photoRegionSky();
  requestAnimationFrame(()=>photoTick(p));
}
// the Region has no weather layer of its own: rain, snow or fog laid over the whole screen
function photoRegionSky(){
  const f=R.photo&&R.photo.fx;if(!f)return;const w=R.sw,h=R.sh,t=performance.now()/1000;ctx.save();ctx.setTransform(R.dpr,0,0,R.dpr,0,0);
  if(f.rain>G.clock){ctx.fillStyle='rgba(20,30,50,.12)';ctx.fillRect(0,0,w,h);ctx.strokeStyle='rgba(170,195,225,.35)';ctx.lineWidth=1;ctx.beginPath();
    for(let i=0;i<240;i++){const x=(i*97.3+t*60)%w,y=(i*53.1+t*260)%h;ctx.moveTo(x,y);ctx.lineTo(x-4,y+12)}ctx.stroke()}
  if(f.snow>G.clock){ctx.fillStyle='rgba(230,236,244,.06)';ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba(240,244,250,.7)';
    for(let k=0;k<200;k++){const x=(k*157.3+t*20*(1+(k%3)))%w,y=(k*97.1+t*40*(1+(k%4)*0.3))%h;ctx.fillRect(x,y,1.8,1.8)}}
  drawnFog(0,0,w,h,0.22);ctx.restore();
}
// the picture: the canvas as drawn, at full resolution, with a small FINAL CALL mark in the bottom-right corner (a PNG Blob)
function photoShot(){
  const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;const x=c.getContext('2d');x.drawImage(cv,0,0);
  const s=R.dpr,fs=11*s,pad=10*s;x.font=`700 ${fs}px "Saira Condensed","Arial Narrow",sans-serif`;if('letterSpacing' in x)x.letterSpacing=(0.12*fs)+'px';
  const w=x.measureText('FINAL CALL').width+fs*0.8,h=fs*1.55,bx=c.width-pad-w,by=c.height-pad-h;
  x.globalAlpha=0.9;x.fillStyle='#FFC72C';x.beginPath();x.roundRect?x.roundRect(bx,by,w,h,2*s):x.rect(bx,by,w,h);x.fill();x.globalAlpha=1;
  x.fillStyle='#17181A';x.textAlign='left';x.textBaseline='middle';x.fillText('FINAL CALL',bx+fs*0.4,by+h/2+0.5*s);
  const d=atob(c.toDataURL('image/png').split(',')[1]),a=new Uint8Array(d.length);for(let i=0;i<d.length;i++)a[i]=d.charCodeAt(i);
  return new Blob([a],{type:'image/png'});
}
// the shutter: a flash, then the share sheet on a phone that can share files, else a download
function photoSave(){
  const st=$('#stage');if(!REDUCED){st.classList.remove('phflash');void st.offsetWidth;st.classList.add('phflash')}
  const b=photoShot(),name=`final-call-${(G.name||'airport').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}-day-${dayOf(G.clock)}.png`;
  const f=typeof File==='function'?new File([b],name,{type:'image/png'}):null,down=()=>{const a=document.createElement('a'),u=URL.createObjectURL(b);
    a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000)};
  if(f&&matchMedia('(pointer:coarse)').matches&&navigator.canShare&&navigator.canShare({files:[f]})){
    navigator.share({files:[f],title:'Final Call'}).catch(e=>{if(!e||e.name!=='AbortError')down()});return}
  down();
}
$('#photob').addEventListener('click',photoOn);
$('#photoHelp').addEventListener('click',()=>{openHelp(false);photoOn()}); // on a phone, where the top bar has no room for the camera button
$('#photobar').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.ph;
  if(k==='time'||k==='sky')photoStep(k);else if(k==='pause'){setSpeed(R.speed===0?(R.lastSpeed||1):0);renderPhotoBar()}else if(k==='shoot')photoSave();else if(k==='done')photoOff()});
// a tap on the map leaves (a drag or pinch still frames it); caught before the map's own tap, which would pick a stand or a tab
// The panels come back at once, so the click that follows a touch would land on whatever is now under the finger: eat it.
$('#stage').addEventListener('pointerup',e=>{if(!R.photo||e.target!==cv||e.button!==0||ptrs.size!==1||!ptrs.has(e.pointerId)||moved>=8)return;
  e.stopPropagation();ptrs.delete(e.pointerId);cv.classList.remove('drag');photoOff();
  const eat=c=>{c.preventDefault();c.stopPropagation();off()},off=()=>{document.removeEventListener('click',eat,true);clearTimeout(t)},t=setTimeout(off,600);
  document.addEventListener('click',eat,true)},true);
// Esc leaves, once any open card has had it
document.addEventListener('keydown',e=>{if(R.photo&&e.key==='Escape'&&!document.querySelector('.help:not([hidden])')){e.preventDefault();e.stopImmediatePropagation();photoOff()}},true);
Object.assign(SIMX,{drawnHour,drawnFx,drawnWx,photoRegionSky,photoOn,photoOff,photoStep,photoShot,PH_TIME,PH_SKY});
