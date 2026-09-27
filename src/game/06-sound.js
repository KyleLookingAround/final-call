/* ================= sound ================= */
let AC=null,lastTick=0;
function ensureAudio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null}}
function tone(f,d,v,type,when){if(!G.sound||!AC||R.sim)return;try{const t=AC.currentTime+(when||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d+0.02)}catch(e){}}
function tick(){if(SET().sndFx===false)return;const n=performance.now();if(n-lastTick<60)return;lastTick=n;tone(1250+Math.random()*300,0.05,0.03,'triangle')} // cosmetic
function chime(){tone(659,0.5,0.05);tone(523,0.7,0.05,'sine',0.28)}
function kaching(){if(SET().sndFx===false)return;tone(988,0.08,0.045,'square');tone(1319,0.18,0.045,'square',0.07)}
function alertTone(){tone(440,0.18,0.05,'triangle');tone(440,0.18,0.05,'triangle',0.22)}
function fanfare(){[523,659,784,1047].forEach((f,k)=>tone(f,0.35,0.05,'triangle',k*0.12))}

