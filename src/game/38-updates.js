/* ================= WHAT'S NEW: every version's new features, shown after an update and from Settings or Help ================= */
// Newest first. Only a release adds an entry, folding in the fragments in src/updates.d/ (the release playbook); the checks make sure the newest one matches docs/HISTORY.md.
// A point is {b, t, go, lv}: a bold lead of a few words, one short sentence, and optionally a place "Show me" goes to
// (newsOk lists them) and the level it needs (the card hides it below that). A plain string still shows as it is.
const UPDATES=[
  {v:34,title:'Famous faces and a real-looking region',points:[
    {b:'Famous faces',t:'Stars fly through now and then; the board says who the day before.',lv:3},
    {b:'A real-looking region',t:'Hills, woods, a softer coast and towns that grow, lit up at night.',go:'tab:region',lv:1},
    {b:'A Fleet tab',t:'Your planes, crews and servicing, beside Gates.',go:'tab:fleet',lv:1}]},
  {v:33,title:'A rating that keeps you on your toes',points:[
    {b:'A live rating',t:'It follows the last day of flights, with an arrow showing which way it’s heading.'},
    {b:'Yesterday in a minute',t:'Office › Money plays back the day over your airport.',go:'office:money'},
    {b:'Photo mode',t:'Hide the panels and frame a picture, at any time of day or weather.',go:'photo'},
    {b:'Tidier menus',t:'Settings, challenges, pay and boarding upgrades sit where you’d look.',go:'office:settings'}]},
  {v:32,title:'Ready for what’s next',points:[
    {b:'Update toasts',t:'A new version offers Update now, or Later for an hour.'},
    {b:'Ko-fi',t:'A quiet “Buy me a Ko-fi” link, if you’d like to.'},
    {b:'Send feedback',t:'How to play opens a GitHub issue with your details filled in.',go:'help'},
    {b:'Saves stay here',t:'The game saves on this device; save codes still move an airport.',go:'office:settings'}]},
  {v:31,title:'Looks like a real airport',points:[
    {b:'Liveried planes',t:'Engines in airline colours, shadows, and wingtip lights at night.'},
    {b:'Turnaround trucks',t:'Fuel, catering, baggage tractors and tugs work each turnaround.'},
    {b:'Markings and lights',t:'Painted stands and taxi lines; floodlights and lit windows after dark.'},
    {b:'The Roof button',t:'Step up to the terminal’s roof and back down to the halls.'},
    {b:'Weather you can see',t:'Puddles, settling snow, fog, cloud shadows and a windsock.'}]},
  {v:30,title:'A card for each new level',points:[
    {b:'Level-up card',t:'Reaching a level shows what it has just unlocked.'},
    {b:'Links straight there',t:'Each line goes to its plan, map, upgrade or gate.'},
    {b:'Your choice',t:'The game waits while it’s open; turn it off in Settings.',go:'office:settings'}]},
  {v:29,title:'The airport sounds like one',points:[
    {b:'Flight calls',t:'Boarding, gate and final calls, each with a chime and words on the board.'},
    {b:'A real voice',t:'Now and then someone reads a final call or a gate change.'},
    {b:'Airport sounds',t:'Terminal hum, jets and rain follow the camera; nights go quiet.'},
    {b:'Your choice',t:'Turn each part on or off in Office › Settings › Sound.',go:'office:settings'}]},
  {v:28,title:'A real terminal',points:[
    {b:'Real halls',t:'Check-in, security, passports, customs and an arrivals hall.'},
    {b:'Bags that travel',t:'A sorter and tug trains to the plane, carousels for arrivals.'},
    {b:'The market place',t:'People shop until their gate is called; later calls sell more.'},
    {b:'An airport hotel',t:'Rooms for late arrivals, early flyers, crews and the stranded.',go:'sales:landside'},
    {b:'Twice as fast',t:'The simulation runs about twice as fast.'}]},
  {v:27,title:'A smarter transport manager',points:[
    {b:'A smarter manager',t:'It runs your lines by what each change is worth.',go:'tab:region',lv:1},
    {b:'Busy days',t:'It adds services to full lines and extras on event days.',lv:1},
    {b:'Upgrade advice',t:'It suggests trams, trains, metros, extensions and closures.',lv:1},
    {b:'Upgrade it yourself',t:'Any line, from its card; it runs until the new one’s ready.',lv:1}]},
  {v:26,title:'Mobile lounges',points:[
    {b:'Mobile lounges',t:'Lounges on stilts drive out to remote stands, as at Dulles.',go:'ground:layout',lv:5},
    {b:'Quick and dry',t:'As fast as a bridge in any weather, with no rating cost.',lv:5}]},
  {v:25,title:'More real airports',points:[
    {b:'Heathrow T5',t:'The Satellite has an underground train out to two satellites.',lv:7},
    {b:'Beijing Daxing',t:'The Starfish has five piers round a star-shaped hall.',lv:9},
    {b:'Midfield concourses',t:'Sixteen stands along a train, like Atlanta and Denver.',lv:9},
    {b:'The Round terminal',t:'Glass tubes out to satellites, like Paris Charles de Gaulle.',lv:6}]},
  {v:24,title:'Real airport shapes',points:[
    {b:'Real shapes',t:'Remote, Staggered, Curved and Hall and finger now look real.',lv:3},
    {b:'Buses and angles',t:'Buses to remote stands, herringbone parking, piers from a hall of shops.',lv:3},
    {b:'More to come',t:'The Satellite and Starfish follow.',lv:3}]},
  {v:23,title:'Classic, made real',points:[
    {b:'Jet bridges',t:'Planes park nose-in and push back when they leave.'},
    {b:'Pier B',t:'A real pier out onto the apron, with gates on both sides.',go:'pier',lv:4},
    {b:'A start',t:'The other layouts follow.',lv:3}]},
  {v:22,title:'Airport layouts',points:[
    {b:'New layouts',t:'Unlock them in the Masterplan and rebuild in Airfield › Layout.',go:'plan',lv:3},
    {b:'Each a trade',t:'More stands, more shops, quicker walks, or buses to remote stands.',lv:3},
    {b:'Smoother',t:'Fast speeds run better on phones; this card keeps the history.'}]},
  {v:21,title:'Smoother on phones',points:[
    {b:'A sliding panel',t:'It slides over the map and always leaves some in view.'},
    {b:'Landscape',t:'Landscape phones show the map and panel side by side.'},
    {b:'Full screen',t:'The drawer opens from Manage, and the page no longer bounces.'}]},
  {v:20,title:'Five new features',points:[
    {b:'Lowmere',t:'A rival airport opens once you’re a City Airport.',go:'tab:routes',lv:3},
    {b:'Crews and checks',t:'Planes need rested crews and overnight checks.',go:'tab:fleet',lv:1},
    {b:'Records and challenges',t:'Records, stamps and weekly challenges in the Office.',go:'chal',lv:1},
    {b:'A guided start',t:'A first hour for new airports, and saves across devices.'}]},
  {v:19,title:'Room for the phone camera',points:[
    {b:'Camera room',t:'Settings › Screen keeps the top clear of the camera.',go:'office:settings'},
    {b:'Tidier buttons',t:'Top buttons, stand labels and the pause tag.'}]},
  {v:18,title:'Recommendations and managers',points:[
    {b:'Recommendations',t:'Region and Routes suggest lines, routes, fares and planes.',go:'tab:routes',lv:1},
    {b:'Managers',t:'They run transport, routes and crews, and step back when you take over.',lv:1}]},
  {v:17,title:'Settings',points:[
    {b:'Settings',t:'Turn off tips, messages, pop-ups, the goal bar and more.',go:'office:settings'}]},
  {v:16,title:'Levels and the Masterplan',points:[
    {b:'Ten levels',t:'From Airfield to Airport of the Year.'},
    {b:'The Masterplan',t:'Plans to approve, and a world map of routes and fares.',go:'plan',lv:1},
    {b:'Travellers',t:'Business, holidaymakers, families, groups and those needing help.'}]},
  {v:15,title:'The early days',points:[
    {b:'The airport',t:'Queues, boarding methods and turnarounds.'},
    {b:'The region',t:'Its transport, sites, weather and events.'}]},
];
// "Show me" targets: the level-up card's (lvlGo) plus <tab>:<sub-tab>, help and photo mode
const NEWS_SUB={terminal:['tSub',['dep','arr','staff']],ground:['aSub',['ops','layout','build']],stands:['gSub',['gates','methods']],sales:['sSub',['prices','shops','landside']],
  region:['regSub',['lines','sites']],routes:['rSub',['mine','new']],office:['oSub',['progress','money','reports','records','policies','settings']]};
const NEWS_TABS=['terminal','ground','stands','fleet','sales','region','routes','office'];
function newsOk(g){
  const i=g.indexOf(':'),a=i<0?g:g.slice(0,i),b=g.slice(i+1);
  if(i<0)return ['plan','pier','chal','help','photo'].includes(g);
  if(a==='tab')return NEWS_TABS.includes(b);if(a==='up')return !!UPG[b];if(a==='gate')return !!STAND[+b];
  return !!NEWS_SUB[a]&&NEWS_SUB[a][1].includes(b);
}
// the tab a target lands on, so a button only shows once the save has that tab
const newsTab=g=>{const i=g.indexOf(':'),a=i<0?g:g.slice(0,i),b=g.slice(i+1);return a==='tab'?b:a==='up'?UPG[b].tab:a==='gate'||a==='pier'?'stands':a==='chal'?'office':NEWS_SUB[a]?a:null};
const newsCan=g=>newsOk(g)&&(!newsTab(g)||tabOpen(newsTab(g)))&&(g!=='plan'||G.level>=1);
function newsGo(g){
  openNews(false);const i=g.indexOf(':'),a=i<0?g:g.slice(0,i),b=g.slice(i+1);
  if(g==='help')openHelp(true);else if(g==='photo')photoOn();else if(NEWS_SUB[a]){R[NEWS_SUB[a][0]]=b;setTab(a)}else lvlGo(g);
}
const newsPts=u=>u.points.filter(p=>typeof p==='string'||!(p.lv>G.level));
function renderNews(auto){
  const seen=G.seen??0,fresh=UPDATES.filter(u=>u.v>seen);
  const pt=p=>typeof p==='string'?`<li>${p}</li>`:`<li><b>${p.b}.</b> ${p.t}${p.go&&newsCan(p.go)?` <button class="ushow" data-newsgo="${p.go}">Show me ›</button>`:''}</li>`;
  const row=(u,open)=>{const ps=newsPts(u),h=`<span class="uv">${u.v<=15?'Up to 15':'Version '+u.v}</span> ${u.title}`;
    return ps.length?`<details class="upd"${open?' open':''}><summary>${h}${u.v>seen&&auto?' <span class="live">New</span>':''}</summary><ul>${ps.map(pt).join('')}</ul></details>`:`<div class="upd uhid">${h}</div>`};
  // versions whose points the save hasn't reached fold away, and so does most of the older history for a young save
  // (Airfield or Local Airport), which describes systems it hasn't reached
  const shown=UPDATES.filter(u=>newsPts(u).length),n=G.level<=1?Math.max(shown.filter(u=>u.v>seen).length,3):shown.length,head=shown.slice(0,n),rest=UPDATES.filter(u=>!head.includes(u));
  $('#newsList').innerHTML=head.map((u,k)=>row(u,auto?u.v>seen:k===0)).join('')+(rest.length?`<details class="upd"><summary>${rest.length} earlier version${rest.length>1?'s':''}</summary>${rest.map(u=>row(u,false)).join('')}</details>`:'');
  $('#newsT').textContent=auto&&fresh.length?`What's new`:`What's new · all versions`;$('#newsBody').scrollTop=0;
}
function openNews(on,auto){
  const el=$('#news');if(!on){if(el.hidden)return;el.hidden=true;G.seen=UPDATES[0].v;save();if(R.newsPrev)setSpeed(R.newsPrev);return}
  renderNews(auto);el.hidden=false;R.newsPrev=R.speed;setSpeed(0);$('#news .close').focus();
}
$('#news').addEventListener('click',e=>{const g=e.target.closest('[data-newsgo]');if(g){newsGo(g.dataset.newsgo);return}if(e.target.id==='news'||e.target.closest('[data-newsclose]'))openNews(false)});
$('#newsAgain').addEventListener('click',()=>{openHelp(false);openNews(true,false)});
document.addEventListener('keydown',e=>{if(!$('#news').hidden&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();openNews(false)}},true);
// after loading: only when there's something the player hasn't seen, and never over the guided start
const newsDue=()=>(G.seen??0)<UPDATES[0].v&&(!G.tour||G.tour.done);
