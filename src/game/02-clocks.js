/* ================= clocks ================= */
// What runs as game time passes. Each table is an ordered list of hooks {id, every, at, fn}: runClock(T, n) runs fn for each
// hook whose n%every===at, in the table's order. update() runs MINUTE each game minute (n is the minute); MINUTE runs
// HOUR on the hour and half hour, HOUR runs NIGHT at 03:00; dayTick runs DAY when the day changes (n is the new day).
// A hook with a table runs that table. Each system registers its hooks from its own file with clock(); the order is
// listed once, here, and the clocks check pins it and each hook's cadence to what ran before the tables.
const MINUTE=[],HOUR=[],DAY=[],NIGHT=[],CLOCKS={MINUTE,HOUR,DAY,NIGHT};
const CLOCK_ORDER={
  MINUTE:['autoStaff','updateBuilds','layoutTick','dayTick','checkLevel','fleetTick','managersTick','mgrStep','TERM_MINUTE','HOUR','dayRec'],
  HOUR:['mgrHour','crewTick','recordsHour','NIGHT','ads'],
  NIGHT:['nightChecks'],
  // dayReport and recordsDay see the day just ended; newDay starts the next one (G.day, G.dstat) for the rest
  DAY:['dayReport','recordsDay','newDay','regionDay','rivalDay','chalDay','TERM_DAY','season'],
};
function clock(T,id,every,at,fn,table){
  const name=Object.keys(CLOCKS).find(k=>CLOCKS[k]===T),order=CLOCK_ORDER[name],k=order.indexOf(id);
  if(k<0||T.some(h=>h.id===id))throw new Error(`clock: ${id} is not in CLOCK_ORDER.${name}, or is there twice`);
  const h={id,every,at,fn};if(table)h.table=table;
  const j=T.findIndex(x=>order.indexOf(x.id)>k);if(j<0)T.push(h);else T.splice(j,0,h);
}
function runClock(T,n,a){for(const h of T)if(n%h.every===h.at)h.fn(a)}
clock(MINUTE,'HOUR',30,0,()=>runClock(HOUR,R.lastMin),HOUR);
clock(HOUR,'NIGHT',1440,180,()=>runClock(NIGHT,R.lastMin),NIGHT);

// A day's stats (G.dstat, saved): what the day report, the records and the advisor read about the day so far. DAY_STATS
// lists each {key, label}; those with a reset start every day at it (newDay, dayStats()), the rest appear when first
// counted. A system lists its own with dayStat() from its file and counts with dayAdd(key, n); readers use dayVal().
const DAY_STATS=[{key:'pax',label:'passengers departed',reset:0},{key:'arr',label:'passengers arrived',reset:0},{key:'flights',label:'departures',reset:0},
  {key:'ontime',label:'departures on time',reset:0},{key:'rev',label:'money in',reset:0},{key:'cost',label:'money out',reset:0},{key:'rep0',label:'rating at the start of the day',reset:()=>G.rep}];
function dayStat(key,label){if(DAY_STATS.some(s=>s.key===key))throw new Error(`dayStat: ${key} is there twice`);DAY_STATS.push({key,label})}
function dayStats(){const o={};for(const s of DAY_STATS)if('reset' in s)o[s.key]=typeof s.reset==='function'?s.reset():s.reset;return o}
function dayAdd(key,n=1){const s=G.dstat;if(s)s[key]=(s[key]||0)+n}
const dayVal=(s,key)=>s&&s[key]||0;
