/* ================= effects ================= */
// The effects ledger: every change to the rating and to cash goes through effect(kind, cause, amount, at).
// kind is 'rep', 'earn' or 'spend'; cause is why the rating moved (a REPWHY key) or the money's kind (G.revBy);
// at is the map place where it happened, when the caller knows it: a stand index, or a region line or place id.
// R.repWhy sums each cause's real change to the rating; R.repEv keeps the last three hours of it, with the place;
// R.cashAt keeps the last place each kind of money came in or went out. Nothing here allocates per call but the
// rating event, as before.
function effect(kind,cause,amount,at){
  if(kind==='rep'){let d=amount;if(d>0&&G.lv.saf)d*=1.25;if(d>0&&G.dev&&devSum('green'))d*=1.1;const v=clamp(G.rep+d,5,100),real=v-G.rep;G.rep=v;const w=R.repWhy||(R.repWhy={});w[cause]=(w[cause]||0)+real;
    if(real){const E=R.repEv||(R.repEv=[]);E.push([G.clock,cause,real,d,at]);while(E.length&&E[0][0]<G.clock-180)E.shift()}return}
  if(kind==='earn'){G.cash+=amount;G.earned+=amount;G.revBy[cause]=(G.revBy[cause]||0)+amount;hourBucket().rev+=amount;R.minEarn+=amount;dayAdd('rev',amount)}
  else{G.cash-=amount;G.revBy[cause]=(G.revBy[cause]||0)+amount;hourBucket().cost+=amount;R.minEarn-=amount;dayAdd('cost',amount)}
  if(at!=null)(R.cashAt||(R.cashAt={}))[cause]=at;
}
function repAdj(d,why,at){effect('rep',why,d,at)}
// terminal advertising costs a little rating every hour it runs
clock(HOUR,'ads',60,0,()=>{if(pol('ads'))repAdj(-0.8,'ads')});
const REPWHY={care:['passengers who needed help getting around',['assist']],ads:['terminal advertising',[],' Switch it off in Office › Policies.'],noise:['night-flight noise',[],' A curfew (Office › Policies) or noise insulation would help.'],events:['event crowds that couldn’t get home',[],' Give event sites a line that can carry the crowds.'],crowding:['packed buses, trams and trains',[],' Run more services or longer vehicles.'],stranded:['passengers stranded at night',[],' Add night services to your lines.'],traffic:['traffic jams',[],' Trams, trains, the metro or a ring road would ease them.'],queues:['long waits at check-in and security',['lanes','sectech','desks','training','kiosks','online','fasttrack','wifi']],late:['late departures',['atc','crew','tugs','handlers','scanners','bins','walkway']],arrivals:['slow arrivals at passports and reclaim',['officers','egates','training','handlers','wifi']],missed:['missed connections',['walkway','mover']],sponsor:['the sponsorship deal',[]],punctual:['on-time departures',[]],lounge:['crowded gate lounges',[],' Call gates later (Office › Policies › Gate calls).'],bus:['buses out to remote stands',[],' Mobile lounges (Airfield › Layout) replace the buses.'],layout:['your terminal’s layout',[]]};
const REPLBL={care:'Help for passengers who need it',ads:'Advertising',noise:'Night noise',events:'Match days and events',crowding:'Crowded public transport',stranded:'Stranded without transport',traffic:'Traffic jams',queues:'Check-in and security waits',late:'Late departures',punctual:'On-time departures',arrivals:'Arrivals clearing',missed:'Missed connections',sponsor:'Sponsorship deal',lounge:'Crowded gate lounges',bus:'Buses to remote stands',layout:'Terminal layout'};
function repRecent(){const o={};for(const [t,w,r,d] of (R.repEv||[]))if(t>=G.clock-180)o[w]=(o[w]||0)+d;return o}
// money in, with a floater at (x, y) when there's somewhere to show it; F is the flight it counts towards
function earn(v,kind,x,y,col,F,at){effect('earn',kind,v,at);if(F)F.rev+=v;if(x!=null&&!R.sim)floater('+'+money(v),x,y,col||'#6BE39A')}
function spend(v,kind,at){effect('spend',kind||'costs',v,at)}
function floater(text,x,y,col,big){if(R.sim)return;{const p=SET().pops;if(p==='off'||(p==='big'&&!big))return}if(R.floaters.length>90)R.floaters.shift();R.floaters.push({text,x,y,t:0,col,big})}
// the checks read the cause tables through R (window.__sim.R): this file loads before SIMX (42-terminal.js) exists
R.effects={REPWHY,REPLBL};
