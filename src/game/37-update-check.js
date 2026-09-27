/* ================= update check: tell players when a new version is ready =================
   tools/build.mjs stamps BUILD_ID (a short hash of the built page) here and writes the same id to
   dist/version.json, next to index.html, so the existing Pages workflow deploys it with no change.
   Runs only on the published site, found the same way as the feedback link in Help (feedbackRepo(),
   17-help-keys-speed.js): never in R.sim, in build/test.html, from a local file, or in the headless
   bot, since none of those serve from a *.github.io host. Nothing here runs from update() or draw(). */
const BUILD_ID='%BUILD_ID%';
const UPD_INTERVAL=600000,UPD_QUIET=60000,UPD_SNOOZE=3600000,UPD_POLL=5000;
R.updLoadedAt=performance.now(); // runtime only; the checks rewind it rather than waiting out the first minute for real
function updChecking(){return !R.sim&&!!feedbackRepo()}
function updBlocked(){return (G.tour&&!G.tour.done)||!$('#lvlup').hidden}
async function updCheckNow(){
  if(!updChecking()||R.updPending)return;
  if(performance.now()-R.updLoadedAt<UPD_QUIET)return;
  try{
    const res=await fetch('version.json',{cache:'no-store'});
    if(!res.ok)return;
    const v=await res.json();
    if(v&&v.id&&v.id!==BUILD_ID){R.updPending=v.id;updTryShow()}
  }catch(e){}
}
function updTryShow(){
  if(!R.updPending||updBlocked())return;
  if(R.updSnoozeUntil&&performance.now()<R.updSnoozeUntil)return;
  toast('A new version of Final Call is ready',[
    {label:'Update now',fn:()=>updApply()},
    {label:'Later',fn:()=>{R.updSnoozeUntil=performance.now()+UPD_SNOOZE}}
  ],'update','',UPD_SNOOZE/1000);
}
function updApply(){
  save();
  try{const raw=localStorage.getItem(KEY);if(!raw||JSON.parse(raw).savedAt!==G.savedAt)return}catch(e){return} // save failed: never lose progress, don't reload
  location.href=location.pathname+location.search+(location.search?'&':'?')+'u='+Date.now()+location.hash; // a fresh address, past the browser's cache
}
if(feedbackRepo()){
  setInterval(()=>{if(!R.sim)updCheckNow()},UPD_INTERVAL);
  setInterval(()=>{if(!R.sim&&R.updPending)updTryShow()},UPD_POLL);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!R.sim)updCheckNow()});
}
