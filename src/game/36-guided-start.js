/* ================= GUIDED FIRST HOUR: a ring on the real control, one line, and it waits for you ================= */
const TOUR=[
  {t:'Passengers arrive here, check in, clear security and walk to the gates.',w:()=>[20,SEC_Y-6,LAND_R-40,LAND_B-SEC_Y+34],next:1},
  {t:'Tap gate A1 to see its flight.',w:()=>standBox(0),ok:()=>R.tourTap},
  {t:'Speed time up whenever you like.',q:()=>$('#spdb').offsetParent?'#spdb':'.hud [data-speed="4"]',ok:()=>R.speed>=4},
  {t:'Queues growing? Open a second check-in desk.',q:()=>G.tab==='terminal'&&$('[data-buy="desks"]')?'[data-buy="desks"]':'[data-tab="terminal"]',ok:()=>G.lv.desks>=1},
  {t:'Get a flight away on time. The board shows every departure, and punctual ones pay a bonus.',q:'.board',ok:()=>G.ontime>=1},
  {t:'Goals lead the way from here, and tips appear under the map when something needs you.',q:'#goal',av:['.stats','#tabs'],next:1,last:1},
];
const TOUR_PAD=6; // the breathing room tourStep draws around a world-based spotlight, beyond the rect tourRect returns
function tourOn(){return !R.sim&&G.tour&&!G.tour.done&&TOUR[G.tour.s]}
function tourRect(S){
  if(S.w){if(R.view!=='airport')return null;const [x,y,w,h]=S.w(),k=viewK(),sr=$('#stage').getBoundingClientRect();
    let l=sr.left+(x-R.cam.x)*k,t=sr.top+(y-R.cam.y)*k,r=l+w*k,b=t+h*k;
    // never point at ground the map toolbar sits over (with its drawn padding): a step lower down still lands on the real gate
    const hr=$('.hud').getBoundingClientRect();
    if(r+TOUR_PAD>hr.left&&l-TOUR_PAD<hr.right&&t-TOUR_PAD<hr.bottom)t=Math.max(t,hr.bottom+TOUR_PAD+4);
    l=Math.max(l,sr.left+4);t=Math.max(t,sr.top+4);r=Math.min(r,sr.right-4);b=Math.min(b,sr.bottom-4);
    // right and bottom too: tourStep reads r.bottom to place the coach box, same as the DOMRect the other branch returns
    return r-l>12&&b-t>12?{left:l,top:t,width:r-l,height:b-t,right:r,bottom:b}:null}
  const sel=typeof S.q==='function'?S.q():S.q,el=sel&&document.querySelector(sel);if(!el)return null;const r=el.getBoundingClientRect();return r.width?r:null;
}
function tourStep(){
  const S=tourOn(),c=$('#coach'),sp=$('#spot');if(!S){c.hidden=true;sp.hidden=true;return}
  if($$('.help:not([hidden])').length){c.hidden=true;sp.hidden=true;return} // Help, the level card and the rest take priority
  if(S.ok&&S.ok()){tourNext();return}
  if(c.dataset.s!==String(G.tour.s)){c.dataset.s=G.tour.s;c.innerHTML=`<div class="ct"><span class="cn">${G.tour.s+1}/${TOUR.length}</span>${S.t}</div><div class="cb">${S.next?`<button class="buy" data-tnext="1">${S.last?'Done':'Next'}</button>`:''}${S.last?'':`<button class="buy ghost" data-tskip="1">Skip tour</button>`}</div>`}
  c.hidden=false;const r=tourRect(S),vw=innerWidth,vh=innerHeight,cw=Math.min(340,vw-24);c.style.width=cw+'px';
  if(!r){sp.hidden=true;c.style.left=(vw-cw)/2+'px';c.style.top=Math.max(12,vh-c.offsetHeight-90)+'px';return}
  sp.hidden=false;const pd=TOUR_PAD;sp.style.left=(r.left-pd)+'px';sp.style.top=(r.top-pd)+'px';sp.style.width=(r.width+pd*2)+'px';sp.style.height=(r.height+pd*2)+'px';
  // some steps sit beside other chrome (the stats row, the tab bar): keep clear of that too, not just the spotlighted rect
  const avr=(S.av||[]).map(sel=>document.querySelector(sel)).filter(Boolean).map(el=>el.getBoundingClientRect());
  const pt=Math.min(r.top,...avr.map(a=>a.top)),pb=Math.max(r.bottom,...avr.map(a=>a.bottom));
  // a step spotlighting the map shouldn't push its coach box down past the map into the side panel
  const floor=S.w?Math.min(vh,$('#stage').getBoundingClientRect().bottom):vh;
  const ch=c.offsetHeight,below=pb+pd+10,above=pt-pd-10-ch;let top=below+ch<floor-8?below:above>8?above:Math.min(floor-ch-8,Math.max(8,pt+(pb-pt)/2-ch/2));
  if(top<pb&&top+ch>pt&&pb-pt>floor*0.4)top=Math.max(8,floor-ch-12);
  if(S.w){const hr=$('.hud').getBoundingClientRect();if(top<hr.bottom+8&&top+ch>hr.top-8)top=Math.min(floor-ch-8,Math.max(top,hr.bottom+8))} // never sit over the toolbar either
  c.style.top=top+'px';c.style.left=clamp(r.left+r.width/2-cw/2,12,vw-cw-12)+'px';
}
function tourNext(){G.tour.s++;R.tourTap=false;if(G.tour.s>=TOUR.length){G.tour.done=1;save()}tourStep()}
function startTour(){G.tour={s:0};R.tourTap=false;setView('airport');tourStep()}
$('#tourAgain').addEventListener('click',()=>{openHelp(false);startTour()});
$('#coach').addEventListener('click',e=>{if(e.target.closest('[data-tnext]'))tourNext();else if(e.target.closest('[data-tskip]')){G.tour.done=1;save();tourStep()}});
