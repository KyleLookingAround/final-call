// Decor and local character (docs/specs/terminal-place.md): decor comes with the building, more with each level, is never
// placed or saved, never stands in anyone's way, and local signs take the region's place names and fit their halls. Written
// before the code (tools/checks/pending.txt). Reads the names in lib/place.mjs, plus decor() → [{hall, kind, x0, y0, x1,
// y1}…], the items for the layout as built and the level, and localNames() → [{text, place, hall, w}…], the local signs
// (place: a key of PLACES; w: the text's width in world units). "Never in the way" also reads where the counters are:
// deskX, kioskX, laneX, qSlot, secSlot, ftSlot, egSlot, and boothPos, egatePos, carX, carY and arrSlot, which the decor
// part adds to SIMX.
import {readFileSync} from 'node:fs';
import {tp} from './lib/place.mjs';
const LAYOUT_IDS=['classic','remote','stagger','curve','hall','sat','star','round','mid'];
const KEYS=JSON.parse(readFileSync(new URL('./lib/default-keys.json',import.meta.url),'utf8'));
export default async function({open,ok,saveText}){
  {const {ctx,page,errs}=await open({width:1440,height:900},saveText('v29-L9.json'),false,{still:true});await tp(page);
  const texts=Object.fromEntries(['v29-L1.json','v29-L5.json','v29-L9.json'].map(f=>[f,saveText(f)]));
  const r=await page.evaluate(([ids,texts,KEYS])=>{const S=__sim,R=S.R,TP=window.TP,has=!!S.decor,items=()=>S.decor?S.decor():[];
    // nothing to place: no control in any panel places, moves or buys decor; no saved field is decor's
    const words=/decor|planter|bench|mural|artwork|sculpture/i,controls=[];
    for(const [tab,sub] of [['stands','gates'],['stands','fleet'],['terminal','dep'],['terminal','arr'],['terminal','staff'],['ground'],['sales','shops'],['sales','landside'],['routes'],['region'],['office','progress'],['office','settings']]){
      if(tab==='terminal')R.tSub=sub;else if(tab==='sales')R.sSub=sub;else if(tab==='stands')R.gSub=sub;else if(tab==='office')R.oSub=sub;S.setTab(tab);
      for(const b of document.querySelectorAll('#panel button,#panel input,#panel select'))if(words.test(b.textContent+' '+Object.values(b.dataset).join(' ')))controls.push(tab+': '+b.textContent.trim().slice(0,30))}
    const raw=JSON.parse(texts['v29-L9.json']),newG=Object.keys(S.G).filter(k=>!KEYS.G.includes(k)&&!(k in raw)),newLv=Object.keys(S.G.lv).filter(k=>!KEYS.lv.includes(k)&&k!=='terrace'); // not main's DEFAULT(), nor from the save
    const upg=Object.keys(S.UPG).filter(k=>words.test(k+' '+S.UPG[k].name));
    const place={n:items().length,controls,saved:[...newG,...newLv.map(k=>'lv.'+k)],upg};
    // it comes with the building: per hall at levels 1, 5 and 9, and none in a room not built
    const byLevel={};for(const [f,t] of Object.entries(texts)){S.resetAll(JSON.parse(t));S.applyLayout(S.G.layout);const on=TP.built(),c={};let unbuilt=0;
      for(const d of items()){c[d.hall]=(c[d.hall]||0)+1;const k=S.hallId(d.hall);if(k!=null&&!on[k]&&!S.ROOMS[k].open)unbuilt++}byLevel[f]={c,unbuilt,n:items().length}}
    // never in the way, and signs that fit, in every layout fully built at level 9
    const need=['deskX','kioskX','laneX','qSlot','secSlot','ftSlot','egSlot','boothPos','egatePos','carX','carY','arrSlot'],missing=need.filter(n=>!S[n]);
    const inWay={},wide={};
    for(const id of ids){S.resetAll(JSON.parse(texts['v29-L9.json']));S.switchLayout(id);TP.build();S.applyLayout(id);const ds=items(),pts=[];
      const P=(x,y,r)=>pts.push([x,y,r]);
      const deskY=i=>S.deskY?S.deskY(i):707,laneY=i=>S.laneY?S.laneY(i):600,kioskY=i=>S.kioskY?S.kioskY(i):707; // Classic's today; deskY, laneY and kioskY once a layout moves them
      if(!missing.length){for(let i=0;i<8;i++){P(S.deskX(i),deskY(i),10);P(S.laneX(i),laneY(i),10);const b=S.boothPos(i),e=S.egatePos(i);P(b.x,b.y,8);P(e.x,e.y,8);P(S.carX(i)-40,S.carY(i),14);P(S.carX(i),S.carY(i),14);P(S.carX(i)+40,S.carY(i),14)}
        for(let i=0;i<4;i++)P(S.kioskX(i),kioskY(i),8);
        for(let q=0;q<6;q++)for(let j=0;j<40;j++){const s=S.qSlot(q,j);if(s)P(s.x,s.y,4)}
        for(const [f,n] of [[S.secSlot,90],[S.ftSlot,8],[S.egSlot,78],[S.arrSlot,172]])for(let i=0;i<n;i++){const s=f(i);P(s.x,s.y,4)}}
      for(const d of TP.doors())P(d[2],d[3],(d[4]||8)+4);
      // the walks: 8 units either side of the straight line between any two doorways of one hall (not the concourse or
      // the forecourt, which people cross every way)
      const hallSet=new Set(TP.hallIds()),segs=[];for(const r of S.ROOMS.filter(r=>hallSet.has(r.id)&&!r.open)){const ds2=TP.doors().filter(d=>d[0]===r.id||d[1]===r.id);for(let a=0;a<ds2.length;a++)for(let b=a+1;b<ds2.length;b++)segs.push([ds2[a][2],ds2[a][3],ds2[b][2],ds2[b][3]])}
      const hitPt=d=>pts.some(([x,y,rr])=>x+rr>d.x0&&x-rr<d.x1&&y+rr>d.y0&&y-rr<d.y1);
      const hitSeg=d=>segs.some(([a,b,c,e])=>{const n=Math.max(1,Math.ceil(Math.hypot(c-a,e-b)/4));for(let k=0;k<=n;k++){const x=a+(c-a)*k/n,y=b+(e-b)*k/n;if(x>d.x0-8&&x<d.x1+8&&y>d.y0-8&&y<d.y1+8)return true}return false});
      inWay[id]=ds.filter(d=>hitPt(d)||hitSeg(d)).map(d=>d.kind+' in '+d.hall).slice(0,3);
      wide[id]=(S.localNames?S.localNames():[]).filter(s=>{const h=TP.room(s.hall);if(!h)return true;const [x0,,x1]=TP.box(h.poly);return !(s.w<=x1-x0-16)}).map(s=>s.text).slice(0,3)}
    return {has,place,byLevel,missing,inWay,wide,signs:!!S.localNames}},[LAYOUT_IDS,texts,KEYS]);
  const p=r.place;
  ok('decor: nothing to place',r.has&&p.n>0&&!p.controls.length&&!p.saved.length&&!p.upg.length&&!errs.length,
    `${r.has?p.n+' items':'no decor() yet'}; ${p.controls.length} controls that place decor${p.controls.length?' ('+p.controls.slice(0,2).join(', ')+')':''}, ${p.saved.length} new saved fields${p.saved.length?' ('+p.saved.join(' ')+')':''}, ${p.upg.length} decor upgrades`+(errs.length?' '+errs[0]:''));
  const [a,b,c]=['v29-L1.json','v29-L5.json','v29-L9.json'].map(f=>r.byLevel[f]),halls=[...new Set([a,b,c].flatMap(x=>Object.keys(x.c)))];
  const falls=halls.filter(h=>!((a.c[h]||0)<=(b.c[h]||0)&&(b.c[h]||0)<=(c.c[h]||0)));
  ok('decor: it comes with the building',r.has&&a.n<b.n&&b.n<c.n&&!falls.length&&!a.unbuilt&&!b.unbuilt&&!c.unbuilt,
    `${r.has?'':'no decor() yet; '}items at levels 1, 5, 9: ${a.n}, ${b.n}, ${c.n}${falls.length?'; fewer at a higher level in '+falls.join(' '):''}; in rooms not built: ${a.unbuilt}, ${b.unbuilt}, ${c.unbuilt}`);
  const way=Object.entries(r.inWay).filter(([,x])=>x.length);
  ok('decor: never in the way',r.has&&!r.missing.length&&!way.length,`${r.has?'':'no decor() yet; '}${r.missing.length?'not reachable through __sim yet: '+r.missing.join(' ')+'; ':''}${way.length?way.map(([id,x])=>id+': '+x.join(', ')).join('; '):'nothing in the way in 9 layouts'}`);
  const wide=Object.entries(r.wide).filter(([,x])=>x.length);
  ok('decor: signs fit their halls',r.signs&&!wide.length,r.signs?(wide.length?wide.map(([id,x])=>id+': '+x.join(', ')).join('; '):'every sign fits, 9 layouts'):'no localNames() yet');
  // local names: from the region's places, at least three of them, and the same after a reload
  const names=()=>page.evaluate(t=>{const S=__sim;S.resetAll(JSON.parse(t));S.applyLayout(S.G.layout);if(!S.localNames)return null;return S.localNames().map(s=>({text:s.text,place:s.place,ok:!!(S.PLACES[s.place]&&s.text.includes(S.PLACES[s.place].name))}))},texts['v29-L5.json']);
  const n1=await names();let n2=n1;if(n1){await page.reload();await page.waitForTimeout(800);n2=await names()}
  const places=n1?new Set(n1.map(s=>s.place)).size:0,bad=n1?n1.filter(s=>!s.ok).map(s=>s.text):[];
  ok('decor: local names from the region',!!n1&&n1.length>0&&!bad.length&&places>=3&&JSON.stringify(n1)===JSON.stringify(n2)&&!errs.length,
    n1?`${n1.length} local names from ${places} places (3 or more)${bad.length?'; without their place\'s name: '+bad.slice(0,3).join(', '):''}; ${JSON.stringify(n1)===JSON.stringify(n2)?'the same':'different'} after a reload`:'no localNames() yet');
  await ctx.close()}
}
