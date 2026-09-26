/* ================= baggage: from the check-in belt to the hold, and from the plane to the carousel ================= */
// A checked bag rides the belt behind the check-in desks into the baggage hall (BAG_HALL), and counts as ready for its
// flight's hold (F.bagsIn); the stand loads the hold from there. An arriving flight's bags reach its carousel after a delay.
function updateBelt(dt){
  const beltV=80*(1+0.3*G.lv.bagsys);
  for(const b of R.belt){b.x+=beltV*dt;if(b.x>=BAG_HALL[0]){b.F.bagsIn++;b.done=true}}
  if(R.belt.some(b=>b.done)) R.belt=R.belt.filter(b=>!b.done);
}
function updateReclaimBelt(dt){
  for(const b of R.arrBelt){b.t-=dt;if(b.t<=0){b.A.reclaim++;b.done=true}}
  if(R.arrBelt.some(b=>b.done))R.arrBelt=R.arrBelt.filter(b=>!b.done);
}
