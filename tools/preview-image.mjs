// Makes what people see when the game's link is shared, in src/public/ (commit the results):
//   npm run preview
//   preview.jpg   1200x630, shown by chats and social sites under the link
//   icon-180.png  the home-screen icon on phones, from icon.svg
// The picture is the airport an hour into the newest save in tools/saves. Run it again after
// changing how the game looks. Fonts come from the @fontsource dev packages, so it works offline.
import {chromium} from 'playwright';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {root} from './sources.mjs';

const pub=join(root,'src/public');
const font=(pkg,family,w)=>`@font-face{font-family:'${family}';font-weight:${w};src:url(data:font/woff2;base64,${readFileSync(join(root,'node_modules/@fontsource',pkg,'files',`${pkg}-latin-${w}-normal.woff2`)).toString('base64')}) format('woff2')}`;
const fonts=[font('saira-condensed','Saira Condensed',700),font('saira-condensed','Saira Condensed',800),
  font('ibm-plex-mono','IBM Plex Mono',500),font('ibm-plex-mono','IBM Plex Mono',600),font('hind','Hind',400),font('hind','Hind',500)].join('');
const exe=process.env.CHROMIUM_PATH;
const browser=await chromium.launch(exe?{executablePath:exe}:{});

// 1. the airport, an hour into the newest save
const saves=readdirSync(join(root,'tools/saves')).filter(f=>f.endsWith('.json')).sort();
const ctx=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
await ctx.addInitScript(([save,css])=>{window.__seed=1;localStorage.setItem('final-call-save-v2',save);
  addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=css+'#tip,#toasts,#coach,#spot,#news{display:none!important}';document.head.append(s)})},
  [readFileSync(join(root,'tools/saves',saves.at(-1)),'utf8'),fonts]);
const page=await ctx.newPage();
await page.goto(pathToFileURL(join(root,'build/test.html')).href);await page.waitForTimeout(800);
await page.evaluate(()=>{const S=__sim;S.R.sim=true;for(let i=0;i<60*4;i++)S.update(0.25);S.R.sim=false;S.setView('airport');S.setTab('stands')});
await page.waitForTimeout(600);
const shot=(await page.screenshot({clip:{x:18,y:284,width:640,height:420}})).toString('base64');
await ctx.close();

// 2. the card
const icon=readFileSync(join(pub,'icon.svg'),'utf8');
const flaps=t=>[...t].map(c=>`<i>${c===' '?'&nbsp;':c}</i>`).join('');
const card=`<!doctype html><meta charset="utf-8"><style>${fonts}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0A0C0F;overflow:hidden;font-family:'Hind',sans-serif;color:#ECE8DF}
#shot{position:absolute;right:0;top:0;height:560px;width:800px;object-fit:cover;object-position:left center}
#fade{position:absolute;inset:0 0 70px 0;background:linear-gradient(90deg,#0A0C0F 0,#0A0C0F 500px,rgba(10,12,15,.75) 600px,rgba(10,12,15,0) 740px)}
#text{position:absolute;left:64px;top:62px;width:640px}
.badge{display:inline-block;background:#FFC72C;color:#17181A;font:800 44px/1 'Saira Condensed';letter-spacing:.08em;padding:10px 18px 8px}
h1{font:700 58px/1.04 'Saira Condensed';margin-top:30px;letter-spacing:.01em}
h1 em{font-style:normal;color:#FFC72C}
p{font:400 24px/1.35 'Hind';color:#B9C0C7;margin-top:22px;width:490px}
#board{position:absolute;left:0;right:0;bottom:0;height:70px;background:#0A0C0F;border-top:2px solid #232930;display:flex;align-items:center;gap:26px;padding:0 64px;font:600 26px 'IBM Plex Mono';color:#FFC72C}
#board span{display:flex;gap:3px}
#board i{font-style:normal;width:24px;height:38px;display:grid;place-items:center;background:#1A1D22;border-radius:3px;position:relative}
#board i:after{content:'';position:absolute;left:0;right:0;top:50%;height:1px;background:#0A0C0F}
#board .ok{color:#6BE39A}
</style>
<img id="shot" src="data:image/png;base64,${shot}"><div id="fade"></div>
<div id="text"><div class="badge">FINAL CALL</div>
<h1>One gate. One small plane.<br>Build the <em>Airport<br>of the Year.</em></h1>
<p>Run the queues, boarding, routes and trains, and see off a rival airport. Plays in your browser on phone, tablet and desktop.</p></div>
<div id="board"><span>${flaps('FC001')}</span><span>${flaps('AIRPORT OF THE YEAR')}</span><span class="ok">${flaps('BOARDING')}</span></div>`;
const cp=await browser.newPage({viewport:{width:1200,height:630}});
await cp.setContent(card);await cp.waitForTimeout(300);
writeFileSync(join(pub,'preview.jpg'),await cp.screenshot({type:'jpeg',quality:86}));

// 3. the home-screen icon: square corners, as phones round them themselves
await cp.setViewportSize({width:180,height:180});
await cp.setContent(`<style>*{margin:0}svg{display:block;width:180px;height:180px}</style>${icon.replace('rx="14"','rx="0"')}`);
writeFileSync(join(pub,'icon-180.png'),await cp.screenshot({omitBackground:true}));
await browser.close();
console.log('wrote src/public/preview.jpg and src/public/icon-180.png');
