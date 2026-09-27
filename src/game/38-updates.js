/* ================= WHAT'S NEW: every version's new features, shown after an update and from Settings or Help ================= */
// Newest first. Add an entry with each release; the checks make sure the newest one matches docs/HISTORY.md.
const UPDATES=[
  {v:30,title:'A card for each new level',points:[
    'Reaching a level opens a card with what it has just unlocked: gates, more upgrade levels, new plans and what each brings, and new places to go.',
    'Every line links straight there: the Masterplan, the Region, the World map, each upgrade and each gate.',
    'The game waits while it’s open. Turn it off in Office › Settings › Notifications.']},
  {v:29,title:'The airport sounds like one',points:[
    'The terminal calls your flights: boarding, gate calls, final calls and gate changes, each with a chime and its words along the foot of the board.',
    'Now and then a voice reads a final call or a gate change.',
    'The hum of the terminal, jets on the runway and rain follow the camera as you zoom and scroll. Nights go quiet.',
    'Turn each part on or off in Office › Settings › Sound.']},
  {v:28,title:'A real terminal',points:[
    'Passengers go through real halls: check-in islands, bag drop and a security hall with search tables; then passports, e-gates, customs and an arrivals hall where people meet them.',
    'Bags ride a sorter and tug trains to the plane, and arriving ones share the carousels. Tight transfers can miss their flight.',
    'The market place fills with people waiting for their gate to be called. Shops have room for so many, and later gate calls mean more shopping.',
    'An airport hotel: rooms for late arrivals, early flyers, crews and stranded passengers (Sales › Landside).',
    'The advisor points at a full café or hotel, and the simulation runs about twice as fast.']},
  {v:27,title:'A smarter transport manager',points:[
    'The transport manager runs your lines by what each change is worth: how often they run, fares and meeting flights.',
    'It adds services at once to an overfull line, and runs extra ones to the stadium and other venues on event days.',
    'It suggests upgrading a line to a tram, train or metro, extending one to the next town, or closing one you no longer need (Region › Transport).',
    'Upgrade any line yourself from its card; it keeps running until the new one is ready.']},
  {v:26,title:'Mobile lounges',points:[
    'With the Remote apron, buy mobile lounges on stilts, as at Washington Dulles (Airfield › Layout).',
    'They drive out to the remote stands and rise to the door: as quick as a bridge in any weather, and no rating cost.']},
  {v:25,title:'More real airports',points:[
    'The Satellite is now Heathrow Terminal 5, with an underground train out to two satellites.',
    'The Starfish is now Beijing Daxing: five piers round a star-shaped hall.',
    'New: Midfield concourses (level 9), sixteen stands along a train like Atlanta and Denver.',
    'New: the Round terminal (level 6), with glass tubes and satellites through tunnels, like Paris Charles de Gaulle.']},
  {v:24,title:'Real airport shapes',points:[
    'Remote apron, Staggered apron, Curved front, and Hall and finger pier now look like real airports.',
    'Buses drive out to remote stands, planes park at an angle down the herringbone pier, and piers fan out from a hall of shops like Schiphol.',
    'The Satellite and Starfish follow.']},
  {v:23,title:'Classic, made real',points:[
    'Planes park nose-in with short jet bridges, as at real airports, and push back when they leave.',
    'Pier B is a real pier out onto the apron, with gates on both sides.',
    'The start of real airport shapes: the other layouts follow.']},
  {v:22,title:'Airport layouts',points:[
    'Unlock new layouts in the Masterplan and rebuild your airport into them from Airfield › Layout.',
    'Remote apron, Staggered apron, Curved front, Hall and finger pier, Satellite and Starfish, the last few inspired by real airports.',
    'Each trades something: more stands, more shops, quicker walks, or buses out to remote stands.',
    'Fast speeds run more smoothly on phones, and this page keeps the full history.']},
  {v:21,title:'Smoother on phones',points:[
    'The bottom panel slides over the map as you drag it, and always leaves some map in view.',
    'Landscape phones show the map and panel side by side.',
    'The full-screen drawer opens from Manage, and the page no longer scrolls or bounces.']},
  {v:20,title:'Five new features',points:[
    'Lowmere opens a rival airport once you are a City Airport, and competes for your travellers.',
    'Your planes need rested crews, get overnight checks, and can come back late.',
    'Records, stamps and weekly challenges in the Office.',
    'A guided first hour for new airports, and saves across devices.']},
  {v:19,title:'Room for the phone camera',points:['Settings › Screen keeps the top of the game clear of the camera.','Tidier top buttons, stand labels and pause tag.']},
  {v:18,title:'Recommendations and managers',points:['The Region and Routes tabs suggest lines, routes, fares and planes.','Managers can run transport, routes and crews for you, and step back when you take over.']},
  {v:17,title:'Settings',points:['Turn off tips, messages, map pop-ups, the goal bar, recommendations or badges. Replies to your own taps always show.']},
  {v:16,title:'Levels and the Masterplan',points:['Ten levels, from Airfield to Airport of the Year.','A Masterplan of plans to approve, and a world map of routes with markets and fares.','Business travellers, holidaymakers, families, groups and passengers needing assistance.']},
  {v:15,title:'The early days',points:['The airport itself: queues, boarding methods and turnarounds.','The region, with its transport, development sites, weather and events.']},
];
function renderNews(auto){
  const seen=G.seen??0,fresh=UPDATES.filter(u=>u.v>seen);
  $('#newsList').innerHTML=UPDATES.map((u,k)=>`<details class="upd"${(auto?u.v>seen:k===0)?' open':''}><summary><span class="uv">${u.v<=15?'Up to 15':'Version '+u.v}</span> ${u.title}${u.v>seen&&auto?' <span class="live">New</span>':''}</summary><ul>${u.points.map(p=>`<li>${p}</li>`).join('')}</ul></details>`).join('');
  $('#newsT').textContent=auto&&fresh.length?`What's new`:`What's new · all versions`;
}
function openNews(on,auto){
  const el=$('#news');if(!on){if(el.hidden)return;el.hidden=true;G.seen=UPDATES[0].v;save();if(R.newsPrev)setSpeed(R.newsPrev);return}
  renderNews(auto);el.hidden=false;R.newsPrev=R.speed;setSpeed(0);$('#news .close').focus();
}
$('#news').addEventListener('click',e=>{if(e.target.id==='news'||e.target.closest('[data-newsclose]'))openNews(false)});
$('#newsAgain').addEventListener('click',()=>{openHelp(false);openNews(true,false)});
document.addEventListener('keydown',e=>{if(!$('#news').hidden&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();openNews(false)}},true);
// after loading: only when there's something the player hasn't seen, and never over the guided start
const newsDue=()=>(G.seen??0)<UPDATES[0].v&&(!G.tour||G.tour.done);
