/* ================= board ================= */
const FL_CH='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';const FLAPS=new Set();
function mkFlaps(el,n){el.innerHTML='';el._cells=[];for(let i=0;i<n;i++){const s=document.createElement('span');s.className='fl';s.textContent=' ';el.appendChild(s);el._cells.push({el:s,target:' ',left:0})}el._val=null}
function setFlaps(el,text){text=String(text).toUpperCase().padEnd(el._cells.length).slice(0,el._cells.length);if(el._val===text)return;el._val=text;el._cells.forEach((c,i)=>{const ch=text[i];if(c.target!==ch){c.target=ch;c.left=REDUCED?0:3+(i%5);if(!c.left)c.el.textContent=ch===' '?' ':ch}});FLAPS.add(el)}
setInterval(()=>{for(const el of FLAPS){let busy=false;for(const c of el._cells){if(c.left>0){c.left--;c.el.textContent=c.left?FL_CH[Math.floor(Math.random()*FL_CH.length)]:(c.target===' '?' ':c.target);busy=true}}if(!busy)FLAPS.delete(el)}},55);
function statusText(F){
  const pl=F.plane;
  if(F.freighter){if(pl.state==='boarding')return F.fault>0?'TECH DELAY':F.crewWait&&!F.crew?'CREW DELAY':G.clock>F.std?'DELAYED':'LOADING';return pl.state==='closing'?'CLOSED':'CARGO'}
  if(pl.state==='wait'||pl.state==='approach'||pl.state==='inbound'||pl.state==='deplaning'||pl.state==='turnaround')return G.clock>=F.std-30?'GO TO GATE':'CHECK-IN';
  if(pl.state==='boarding'){if(F.fault>0)return 'TECH DELAY';if(F.crewWait&&!F.crew)return 'CREW DELAY';if(G.clock>F.std)return 'DELAYED';if(F.seated>=F.booked&&F.hold<F.checkedTotal)return 'BAGGAGE';if(G.clock>=F.std-10)return 'FINAL CALL';return 'BOARDING'}
  return 'CLOSED';
}
let boardSig='';
function renderBoard(){
  if(R.bm==='trn'){const ids=trnIds();const sig='trn'+ids.join(',');if(sig===boardSig)return;boardSig=sig;
    $('#brows').innerHTML=ids.length?ids.map(c=>`<div class="brow" data-line="${c}"><span class="flaps" data-f="std"></span><span class="flaps" data-f="flt"></span><span class="to"><span class="flaps" data-f="dest"></span><span class="city" data-f="city"></span></span><span class="flaps" data-f="gate"></span><span class="flaps st" data-f="st"></span></div>`).join(''):'<div class="bempty">No lines call at the airport yet. Draw one on the Region tab.</div>';
    $$('.brow').forEach(r=>{const q=f=>r.querySelector(`[data-f="${f}"]`);mkFlaps(q('std'),5);mkFlaps(q('flt'),6);mkFlaps(q('dest'),3);mkFlaps(q('gate'),2);mkFlaps(q('st'),10);r._q=q});return}
  const sig=G.stands.map(s=>s.built?1:0).join('');if(sig===boardSig)return;boardSig=sig;
  $('#brows').innerHTML=G.stands.map((s,i)=>s.built?`<div class="brow${R.sel===i?' sel':''}" data-stand="${i}"><span class="flaps" data-f="std"></span><span class="flaps" data-f="flt"></span><span class="to"><span class="flaps" data-f="dest"></span><span class="city" data-f="city"></span></span><span class="flaps" data-f="gate"></span><span class="flaps st" data-f="st"></span></div>`:'').join('');
  $$('.brow').forEach(r=>{const q=f=>r.querySelector(`[data-f="${f}"]`);mkFlaps(q('std'),5);mkFlaps(q('flt'),6);mkFlaps(q('dest'),3);mkFlaps(q('gate'),2);mkFlaps(q('st'),10);r._q=q});
}
function arrStatus(F){const A=F.arr;if(!A.started)return F.landed?'LANDED':'EXPECTED';if(A.onboard>0)return 'DEPLANING';if(!A.done)return A.sent<A.bags||A.reclaim>0||R.pax.some(p=>p.A===A&&p.state==='reclaim')?'BAGGAGE':'ARRIVED';return 'COMPLETE'}
const trnIds=()=>sortedLines().filter(L=>serves(L,'air')).map(L=>L.id);
function nextDep(L){const f=lineFreq(L);if(!f)return null;const h=60/f;let o=0;for(const ch of L.id)o=(o*7+ch.charCodeAt(0))%97;o=o%h;return Math.ceil((G.clock-o)/h)*h+o}
function updateBoard(){
  if(R.bm==='trn'){const kc={};$$('.brow[data-line]').forEach(r=>{const c=r.dataset.line,L=G.lines[c],q=r._q;if(!L||!q)return;const st=R.reg&&R.reg.lines[c],nd=nextDep(L),M=MODES[L.mode],far=L.stops[0]==='air'?L.stops[L.stops.length-1]:L.stops[L.stops.length-1]==='air'?L.stops[0]:L.stops[L.stops.length-1];
      setFlaps(q('std'),nd!=null?hhmm(nd):'--:--');setFlaps(q('flt'),replOn(c)?'BUS':lineCode(L));setFlaps(q('dest'),NODES[far].c);q('city').textContent=NODES[far].n;
      const pk=M.kind==='rail'?'P':M.kind==='track'?'T':M.kind==='water'?'W':'B';kc[pk]=(kc[pk]||0)+1;setFlaps(q('gate'),pk+kc[pk]);
      const s=replOn(c)?'BUS SERVICE':lineDown(L)?'SUSPENDED':!lineFreq(L)?'NO SERVICE':st&&st.load>1?'FULL':st&&st.load>0.85?'BUSY':L.sync?'MEETS FLTS':(R.fx.leaves>G.clock&&L.mode==='rail')||(M.kind==='road'&&(routeEdges(L.mode,L.stops)||[]).some(({e})=>rwOn(e.id)))?'DELAYED':'ON TIME';
      setFlaps(q('st'),s);q('st').classList.toggle('late',s==='SUSPENDED'||s==='FULL'||s==='DELAYED')});return}
  $$('.brow').forEach(r=>{
    const i=+r.dataset.stand,F=R.st[i].F,q=r._q;if(!q)return;
    if(!F){setFlaps(q('std'),'');setFlaps(q('flt'),'');setFlaps(q('dest'),'');q('city').textContent='';setFlaps(q('gate'),GATES[i]);setFlaps(q('st'),gateStatus(i)==='INBOUND'?'INBOUND':'NO SERVICE');return}
    if(R.bm==='arr'){const A=F.arr,s=arrStatus(F);setFlaps(q('std'),hhmm(A.sta));setFlaps(q('flt'),A.code+A.no);setFlaps(q('dest'),A.from[0]);q('city').textContent=A.from[1];setFlaps(q('gate'),GATES[i]);setFlaps(q('st'),s);q('st').classList.remove('late');return}
    setFlaps(q('std'),hhmm(F.std));setFlaps(q('flt'),F.code+F.no);setFlaps(q('dest'),F.dest[0]);q('city').textContent=F.dest[1];setFlaps(q('gate'),GATES[i]);
    const s=statusText(F);setFlaps(q('st'),s);q('st').classList.toggle('late',s==='DELAYED'||s==='TECH DELAY');
  });
}
$$('.bmode button').forEach(b=>b.addEventListener('click',()=>{const was=R.bm;R.bm=b.dataset.bm;$$('.bmode button').forEach(x=>x.classList.toggle('on',x===b));$('#bDestH').textContent=R.bm==='arr'?'From':R.bm==='trn'?'To':'Destination';$('#hist').style.display=R.bm==='dep'?'':'none';if((was==='trn')!==(R.bm==='trn')){boardSig='';renderBoard()}updateBoard()}));
$('#brows').addEventListener('click',e=>{const r=e.target.closest('.brow');if(!r)return;if(r.dataset.line){R.regSel=r.dataset.line;R.regSub='lines';setTab('region');const el=document.getElementById('line-'+r.dataset.line);if(el)el.scrollIntoView({block:'start'});return}const i=+r.dataset.stand;selectStand(i,false);focus(i)});
function renderHist(){
  $('#hist').innerHTML=G.history.slice(0,3).map(h=>`<div class="hrow"><span>${hhmm(h.std)}</span><span>${h.tag}</span><span class="city" style="color:#B9A15A">${h.dest[0]} ${h.dest[1]}</span><span>${h.gate}</span><span class="dep">DEP ${hhmm(h.dep)} ${h.late>0?`<span class="late">+${h.late}</span>`:'<span class="ok">✓</span>'} <span class="${h.profit<0?'late':''}">${money(h.profit)}</span></span></div>`).join('');
}

