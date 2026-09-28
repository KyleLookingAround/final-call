/* ================= usage counts: anonymous page counts for launch week =================
   docs/systems/usage-counts.md. GoatCounter (no cookies, no personal data, no consent banner needed): one script tag,
   loaded only on the published site (feedbackRepo(), the same test the Help feedback link and the update check use),
   never in R.sim, never in build/test.html or from a local file, and only once USAGE_SITE names a real site code and
   the player hasn't turned it off (G.set.usage, on by default). With USAGE_SITE empty (the default until the owner
   has a code) nothing loads and nothing is sent, ever. A handful of named events mark the funnel; each fires once per
   save and does nothing when the script never loaded, so the check costs nothing when counting is off or absent. */
let USAGE_SITE='final-call'; // the GoatCounter site code. A let, not a const, so the checks can override it
// (window.__sim.USAGE_SITE) without a fake code ever shipping; empty would mean nothing loads and nothing is sent.
let usageLoaded=false;
function usageWanted(){return !!USAGE_SITE&&!R.sim&&!!feedbackRepo()&&SET().usage!==false}
// deferred past this script's own top-level code, so G is loaded from the save (resetAll, run by start() in 99-start.js)
// before the decision is made; never runs in the sim or on a host that isn't the published site
function usageInit(){
  if(!usageWanted())return;
  const s=document.createElement('script');
  s.async=true;s.src='//gc.zgo.at/count.js';s.dataset.goatcounter=`https://${USAGE_SITE}.goatcounter.com/count`;
  s.onload=()=>{usageLoaded=true};
  document.head.appendChild(s);
}
setTimeout(usageInit,0);
// first-flight, level-1, level-3, day-2, photo, share: 08-stands.js, 09-construction-levels-days.js, 62-photo-mode.js,
// 15-panel.js. A no-op when the script never loaded (counting off, not the published site, or R.sim), so it costs
// nothing on the paths reachable from update() beyond this one flag check.
function usageEvent(name){
  if(R.sim||!usageLoaded||G.usageSent[name])return;
  G.usageSent[name]=true;
  try{window.goatcounter.count({path:'event/'+name,event:true})}catch(e){}
}
