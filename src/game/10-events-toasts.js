/* ================= events & toasts ================= */
function toast(text,choices,id,kind,ttl){
  if(R.sim){if(choices)choices[choices.length-1].fn();return}
  {const m=SET().msgs,reply=performance.now()-(R.lastInput||-1e9)<900;if(!reply&&(m==='off'||(m==='key'&&!choices&&kind!=='warn')))return}
  id=id||('t'+(++R.toastId));
  if(R.toasts.some(t=>t.id===id))return;
  const tl=ttl??(choices?30:8);R.toasts.push({id,text,choices:choices||null,kind:kind||'',ttl:tl,max:tl});
  if(R.toasts.length>3){const k=R.toasts.findIndex(t=>!t.choices);R.toasts.splice(k>=0?k:0,1)}
  renderToasts();
  if(choices)alertTone();
}
function dropToast(id){const n=R.toasts.length;R.toasts=R.toasts.filter(t=>t.id!==id);if(R.toasts.length!==n)renderToasts()}
function renderToasts(){
  const ic={goal:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',warn:'<path d="M12 4l9 16H3zM12 10v4M12 17h.01"/>','':'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>'};
  $('#toasts').innerHTML=R.toasts.map(t=>`<div class="toast ${t.kind}" data-id="${t.id}"><svg viewBox="0 0 24 24" aria-hidden="true">${ic[t.kind]||ic['']}</svg><div class="tx">${t.text}</div>${t.choices?'':`<button class="x" data-close="${t.id}" aria-label="Dismiss">×</button>`}${t.choices?`<div class="acts">${t.choices.map((c,k)=>`<button data-tid="${t.id}" data-k="${k}">${c.label}</button>`).join('')}</div>${t.choices.length>1&&t.kind==='warn'?`<div class="auto">If you don’t choose: ${t.choices[t.choices.length-1].label.toLowerCase()}</div>`:''}`:''}<i class="life" style="width:${t.ttl/t.max*100}%"></i></div>`).join('');
}
$('#toasts').addEventListener('click',e=>{
  const c=e.target.closest('[data-close]');if(c){dropToast(c.dataset.close);return}
  const b=e.target.closest('[data-tid]');if(!b)return;
  const t=R.toasts.find(x=>x.id===b.dataset.tid);if(!t)return;
  const ok=t.choices[+b.dataset.k].fn();
  if(ok!==false)dropToast(t.id);
});
function tickToasts(realDt){
  let ch=false;
  for(const t of R.toasts){t.ttl-=realDt;if(t.ttl<=0){if(t.choices)t.choices[t.choices.length-1].fn();t.gone=true;ch=true}}
  if(ch){R.toasts=R.toasts.filter(t=>!t.gone);renderToasts()}
  else for(const t of R.toasts){const el=document.querySelector(`.toast[data-id="${t.id}"] .life`);if(el)el.style.width=clamp(t.ttl/t.max,0,1)*100+'%'}
}
function techFault(i,F){
  const cost=Math.round(F.ac.op*2),fl=G.fleet[F.fleetIdx],w=fl?fl.wear||0:0,mins=Math.round(20*(1-0.15*G.lv.fire));F.fault=mins;
  if(pol('repair')==='rush'&&G.cash>=cost){spend(cost,'costs');F.fault=Math.min(F.fault,4);toW(i,0,CABIN_TOP-24);floater(`FAULT · RUSH REPAIR ${money(cost)}`,WP.x,WP.y,'#FF9F43',true)}
  else{toW(i,0,CABIN_TOP-24);floater(`FAULT · ${mins} MIN REPAIR`,WP.x,WP.y,'#FF7A8A',true)}
}
function wageBill(){const D=derived();return (D.desks*WAGE.desks+D.lanes*WAGE.lanes+D.officers*WAGE.officers+dropsOpen()*WAGE.drops+tablesOpen(D)*WAGE.srch)*(G.wageMul||1)*payMul()*(R.reg?R.reg.wageMul:1)}
function fireEvent(){
  if(G.lines&&Object.keys(G.lines).length&&rnd()<0.3&&regionEvent())return;
  const winter=seasonOf(dayOf(G.clock)).name==='Winter',p=pol('pay');
  const opts=['rush','rush'];if(G.lv.lanes>0){opts.push('sick');if(p===0)opts.push('sick','sick');if(p===1)opts.push('sick')}if(G.flights>=8){if(p===0)opts.push('strike','strike');if(p===1&&rnd()<0.4)opts.push('strike')}
  const e=opts[Math.floor(rnd()*opts.length)];
  if(e==='fog')R.fx.fog=G.clock+45;
  else if(e==='snow')R.fx.snow=G.clock+90;
  else if(e==='rush')R.fx.rush=G.clock+90;
  else if(e==='strike'){R.fx.strike=G.clock+45;floater('STAFF WALKOUT',150,700,'#FF7A8A',true)}
  else if(e==='sick'){const cost=Math.round(30+G.lv.lanes*30);if(pol('agency')&&G.cash>=cost){spend(cost,'costs');floater(`AGENCY COVER ${money(cost)}`,400,608,'#FFC72C',true)}else{R.fx.sick=G.clock+40;floater('LANE CLOSED · STAFF SICK',400,608,'#FF7A8A',true)}}
}

