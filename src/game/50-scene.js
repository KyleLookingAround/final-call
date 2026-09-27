/* ================= SCENE: the airport view's drawing layers and its lighting pass ================= */
// The airport view draws bottom to top in named layers (docs/specs/real-airport.md). A part of the real airport adds its
// drawing to a layer, LAYER.apron.push(V=>…), and its lights to LIGHTS, instead of editing draw(). Each gets the frame's
// view V and draws in world coordinates, leaving the canvas as it found it (save/restore). Drawing is never part of play:
// it must not change G or the game's side of R, nor call rnd(); anything it animates runs off V.t.
const LAYERS=['airfield','apron','stands','bridges','lit','terminal','landside','pax','roofs','signs','weather','top'];
const LAYER=Object.fromEntries(LAYERS.map(n=>[n,[]]));
const LIGHTS=[]; // (V) → lamp(…) for each light, drawn additively over the night by the lighting pass
// this frame's view: what's on screen (x0..x1, y0..y1 in world units), the scale (k css px per world unit) and camera zoom
// (z), seconds (t), darkness (d, 0 by day to 0.5 at night), the hour, and derived() (D)
const V={x0:0,x1:0,y0:0,y1:0,k:1,z:1,t:0,d:0,hour:0,D:null};
function sceneView(D){const k=R.baseK*R.cam.z;V.x0=R.cam.x;V.x1=R.cam.x+R.sw/k;V.y0=R.cam.y;V.y1=R.cam.y+R.sh/k;V.k=k;V.z=R.cam.z;
  V.t=performance.now()/1000;V.hour=(G.clock/60)%24;V.d=darkness();V.D=D;return V}
function layer(n){const L=LAYER[n];for(let j=0;j<L.length;j++)L[j](V)}
function inView(x,y,r){return x+r>=V.x0&&x-r<=V.x1&&y+r>=V.y0&&y-r<=V.y1}
// a pool of light: a radial glow of colour rgb ('255,214,150') and strength a at its middle, skipped off screen
function lamp(x,y,r,rgb,a){if(a<=0||!inView(x,y,r))return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}
// the lighting pass: by night, darken the apron and the forecourt (the terminal stays lit inside), then add every light
function lightPass(){
  const d=V.d;if(d<=0)return;
  ctx.fillStyle=`rgba(4,8,22,${d})`;ctx.fillRect(0,AF_Y,W,TERM_Y-AF_Y);ctx.fillStyle=`rgba(4,8,22,${d*0.6})`;ctx.fillRect(0,H,W,Y1-H);
  ctx.globalCompositeOperation='lighter';for(let j=0;j<LIGHTS.length;j++)LIGHTS[j](V);ctx.globalCompositeOperation='source-over';
}
// the apron's floodlight at each built stand
LIGHTS.push(V=>{for(const i of SIDX){if(!G.stands[i].built)continue;toW(i,130,220);lamp(WP.x,WP.y,230,'255,214,150',0.2*V.d)}});
Object.assign(SIMX,{draw,clampCam,viewK,LAYERS,LAYER,LIGHTS,lamp,V,darkness,get AF_Y(){return AF_Y}});
