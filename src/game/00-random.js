/* ================= random ================= */
// The simulation draws its randomness from rnd(), so a run repeats exactly from the same seed.
// The checks and the bot set window.__seed before the page loads; players get a new seed each time.
// Only things that never touch the game state keep Math.random: sound, the board's flaps
// and weather drawing.
let rndState=(window.__seed??Math.random()*4294967296)>>>0;
function rnd(){ // mulberry32
  rndState=(rndState+0x6D2B79F5)>>>0;let t=rndState;
  t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;
}
function seedRandom(s){rndState=s>>>0}
