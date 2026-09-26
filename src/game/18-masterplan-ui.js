/* ================= Masterplan UI ================= */
const BNAME=Object.fromEntries(BRANCHES);
function nodeCard(T,tag,mini){
  const st=techState(T);if(mini&&st==='done')return `<div class="tnode s-done mini" data-node="${T.id}" title="${T.u.map(itemName).join(', ')}"><div class="tn">✓ ${T.n}</div></div>`;
  const req=(T.r||[]).filter(r=>!researched(r)).map(r=>TECH_BY[r].n),un=T.u.map(itemName).filter(x=>x!==T.n);
  const act=st==='done'?`<span class="tst ok">✓ Approved</span>`:st==='ready'?`<button class="buy" data-research="${T.id}">Approve · ${T.c}★</button>`:st==='pts'?`<button class="buy" disabled>${T.c}★</button>`:st==='req'?`<span class="tst">Needs ${req.join(' and ')}</span>`:`<span class="tst">${lvlName(T.t)}</span>`;
  return `<div class="tnode s-${st}" data-node="${T.id}"><div class="ttx">${tag?`<span class="tb">${BNAME[T.b]}</span>`:''}<div class="tn">${T.n}${T.c>1?` <span class="tc">${T.c}★</span>`:''}</div><div class="td">${T.d}</div>${un.length?`<div class="tu">${un.join(' · ')}</div>`:''}</div><div class="tact">${act}</div></div>`;
}
function consultRow(){const c=consultCost();return `<div class="row">${svg('crew')}<div><div class="rt">Hire consultants</div><div class="rd">Buy one plan point. Each costs more than the last.</div></div><button class="buy" data-buypt="1" data-cost="${c}">${money(c)}</button></div>`}
function planSummary(){
  const pts=G.pts||0,ready=TECH.filter(T=>techState(T)==='ready');
  let h=`<div class="sec">Masterplan<span>${Object.keys(G.tech||{}).length}/${TECH.length} approved</span></div><div class="plansum"><div class="pts"><b>${pts}</b><span>★ point${pts===1?'':'s'}</span></div><div class="rd">${pts?'Approve plans to unlock aircraft, routes, upgrades and transport.':`Reaching ${lvlName(Math.min(LEVELS.length-1,G.level+1))} gives ${LVL_PTS(G.level+1)||5} points, and some goals give one.`}</div><button class="buy" data-plan="1">Open</button></div>`;
  if(ready.length&&pts)h+=`<div class="tlist">${ready.slice(0,4).map(T=>nodeCard(T,1)).join('')}</div>`;
  if(G.level>=4)h+=consultRow();
  return h;
}
function renderPlanBtn(){const b=$('#planb');if(!b)return;const n=G.pts||0,show=G.level>=1||n>0||Object.keys(G.tech||{}).length>0;if(b.hidden===show)b.hidden=!show;const c=b.querySelector('.pb');c.textContent=n;c.hidden=!n||SET().badges===false}
function openPlan(){if(R.sim)return;const el=$('#plan');if(el.hidden){R.planPrev=R.speed;setSpeed(0)}el.hidden=false;renderPlan();$('#plan .close').focus();const r=$('#planBody .s-ready');if(r)r.scrollIntoView({block:'center'})}
function closePlan(){const el=$('#plan');if(el.hidden)return;el.hidden=true;if(R.planPrev)setSpeed(R.planPrev);renderPlanBtn();if(G.tab==='office'||G.newTabs&&G.newTabs.length)renderTabs();renderPanel()}
function renderPlan(){
  const el=$('#planBody');if(!el||$('#plan').hidden)return;const wide=el.clientWidth>=860;
  const maxT=Math.min(LEVELS.length-1,G.level+1),vis=TECH.filter(T=>T.t<=maxT||researched(T.id)),tiers=[...new Set(vis.map(T=>T.t))].sort((a,b)=>a-b),later=TECH.length-vis.length,pts=G.pts||0;
  let h=`<div class="phead"><div class="pts big"><b>${pts}</b><span>★ point${pts===1?'':'s'} to spend</span></div><div class="rd">Approve a plan to unlock what it lists. Plans unlock with your airport’s level; some need an earlier plan. Every new level brings 5 or 6 points, some goals give one${G.level>=4?', and consultants sell them':''}.</div>${G.level>=4?`<button class="buy" data-buypt="1" data-cost="${consultCost()}" ${G.cash<consultCost()?'disabled':''}>+1★ ${money(consultCost())}</button>`:''}</div>`;
  if(wide){
    h+=`<div class="tgrid" style="grid-template-columns:104px repeat(${BRANCHES.length},minmax(0,1fr))"><div></div>${BRANCHES.map(([b,n])=>`<div class="tbh">${n}</div>`).join('')}`;
    for(const t of tiers)h+=`<div class="tth${t>G.level?' fut':''}"><b>${lvlName(t)}</b>${t>G.level?'<span>next level</span>':''}</div>`+BRANCHES.map(([b])=>`<div class="tcell">${vis.filter(T=>T.b===b&&T.t===t).map(T=>nodeCard(T,0,1)).join('')}</div>`).join('');
    h+=`</div>`;
  }else{
    const bs=R.planB||'all';
    h+=`<div class="chips pchips"><button class="chip${bs==='all'?' on':''}" data-planb="all">All</button>${BRANCHES.map(([b,n])=>{const r=vis.filter(T=>T.b===b&&techState(T)==='ready').length;return `<button class="chip${bs===b?' on':''}" data-planb="${b}">${n}${r&&pts?` <small>${r}</small>`:''}</button>`}).join('')}</div>`;
    const ns=vis.filter(T=>bs==='all'||T.b===bs),grp=[['Ready to approve',ns.filter(T=>techState(T)==='ready')],['Needs points or an earlier plan',ns.filter(T=>['pts','req'].includes(techState(T)))],[`At ${lvlName(Math.min(LEVELS.length-1,G.level+1))}`,ns.filter(T=>techState(T)==='level')]];
    for(const [n,L] of grp)if(L.length)h+=`<div class="sec">${n}<span>${L.length}</span></div><div class="tlist">${L.map(T=>nodeCard(T,bs==='all')).join('')}</div>`;
    const dn=ns.filter(T=>techState(T)==='done');if(dn.length)h+=`<div class="sec">Approved<span>${dn.length}</span></div><div class="tdone">${dn.map(T=>`<span title="${T.u.map(itemName).join(', ')}">✓ ${T.n}</span>`).join('')}</div>`;
  }
  if(later)h+=`<p class="note soon">${later} more plans appear as your airport grows.</p>`;
  el.innerHTML=h;
}
$('#planb').addEventListener('click',()=>openPlan());
$('#plan').addEventListener('click',e=>{
  if(e.target.id==='plan'||e.target.closest('[data-planclose]')){closePlan();return}
  const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
  if(d.research){if(research(d.research)){renderPlan();save()}}
  else if(d.planb){R.planB=d.planb;renderPlan()}
  else if(d.buypt){if(buyPoint()){renderPlan();save()}}
});
addEventListener('resize',()=>{if(!$('#plan').hidden)renderPlan()});

