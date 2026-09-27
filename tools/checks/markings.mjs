// Apron markings and lighting (src/game/51-markings.js, docs/specs/real-airport.md): markings on built stands only, on
// every layout; lights only at night, and runway lights only on open runways; the dawn and dusk colour grade; and the
// markings leave the canvas as they found it.
export default async function({open,ok,saveText,newest}){
  const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});
  // markings on built stands only: the list, and the paint at the start of a stand's lead-in coming and going with it
  const m=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,c=document.querySelector('#cv').getContext('2d'),out={};
    const i=S.SIDX.find(j=>G.stands[j].built),X=S.XF[i],lx=0,ly=480,wx=X.ox+(lx*X.c-ly*X.s),wy=X.oy+(lx*X.s+ly*X.c);
    G.clock=Math.floor(G.clock/1440)*1440+12*60;R.cam.z=1.6;const k0=S.viewK();R.cam.x=wx-R.sw/k0/2;R.cam.y=wy-R.sh/k0/2;S.clampCam();
    const px=()=>{const k=S.viewK()*R.dpr,d=c.getImageData(Math.round((wx-R.cam.x)*k),Math.round((wy-R.cam.y)*k),1,1).data;return [d[0],d[1],d[2]]};
    S.draw();out.built=S.MK.stands.join()===S.SIDX.filter(j=>G.stands[j].built).join();out.on=px();
    G.stands[i].built=false;S.draw();out.gone=!S.MK.stands.includes(i);out.off=px();G.stands[i].built=true;S.draw();out.back=S.MK.stands.includes(i);
    // every layout, fully built: one set of markings per stand, and none before a stand is built
    out.layouts={};const was=S.LAY===S.LAYOUTS.classic?'classic':null;
    for(const id of Object.keys(S.LAYOUTS)){S.switchLayout(id);G.pierB=true;S.SIDX.forEach(j=>{G.stands[j].built=true});S.draw();const all=S.MK.stands.length===S.SIDX.length;
      S.SIDX.forEach(j=>{G.stands[j].built=false});S.draw();out.layouts[id]=all&&!S.MK.stands.length&&S.MK.num.length===0}
    if(was)S.switchLayout(was);return out});
  const yellow=p=>p[0]-p[2]>40,lay=Object.entries(m.layouts).filter(([,v])=>!v).map(([k])=>k);
  ok('markings: painted on built stands only, on every layout',m.built&&m.gone&&m.back&&yellow(m.on)&&!yellow(m.off)&&!lay.length&&!errs.length,
    JSON.stringify({on:m.on,off:m.off,layouts:Object.keys(m.layouts).length,wrong:lay})+(errs.length?' '+errs[0]:''));
  // lights only at night, and runway edge lights only along the runways that are open
  const l=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;S.SIDX.forEach(j=>{G.stands[j].built=true});R.cam.z=0.01;S.clampCam();S.clampCam();
    const at=h=>{G.clock=Math.floor(G.clock/1440)*1440+h*60;S.draw();return S.MK.lit};
    const ys=()=>[...new Set(S.MK.rlit.filter((v,j)=>j%2))].length,lv=G.lv.runway2;
    G.lv.runway2=0;const one=[at(12),at(19.5),at(23),ys()];G.lv.runway2=1;const two=[at(23),ys()];G.lv.runway2=lv;S.draw();return {one,two}});
  ok('markings: lights come on at dusk, off by day, and only on open runways',l.one[0]===0&&l.one[1]>0&&l.one[2]>0&&l.one[3]===2&&l.two[1]===4&&l.two[0]>l.one[2],JSON.stringify(l));
  // the colour grade: nothing by day, warm at sunset, blue after it and a little blue all night; the apron warmer at 19:00
  const g=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,c=document.querySelector('#cv').getContext('2d');R.cam.z=0.01;S.clampCam();S.clampCam();
    const k=S.viewK()*R.dpr,x=40,y=S.XF[S.SIDX[0]].oy-600,at=h=>{G.clock=Math.floor(G.clock/1440)*1440+h*60;S.draw();const d=c.getImageData(Math.round((x-R.cam.x)*k),Math.round((y-R.cam.y)*k),1,1).data;return d[0]-d[2]};
    return {noon:S.grade(12),sunset:S.grade(19),blue:S.grade(20.2),night:S.grade(23),dawn:S.grade(6.8),warm:at(19)-at(12)}});
  ok('markings: dawn and dusk colour the airport, and the day is left as it was',g.noon[3]===0&&g.sunset[0]>g.sunset[2]&&g.dawn[0]>g.dawn[2]&&g.blue[2]>g.blue[0]&&g.night[3]>0&&g.warm>0,JSON.stringify(g));
  // the canvas is left as found: the same transform, full opacity, normal drawing and no dashes after the apron and lit layers
  const s=await page.evaluate(()=>{const S=__sim,G=S.G,c=document.querySelector('#cv').getContext('2d'),seen=[];
    const st=()=>{const t=c.getTransform();return [t.a,t.b,t.c,t.d,t.e,t.f].map(v=>v.toFixed(4)).join()+'|'+c.globalAlpha+'|'+c.globalCompositeOperation+'|'+c.getLineDash().length};
    const pre=()=>seen.push(st()),post=()=>seen.push(st());S.LAYER.apron.unshift(pre);S.LAYER.apron.push(post);S.LAYER.lit.unshift(pre);S.LAYER.lit.push(post);
    G.clock=Math.floor(G.clock/1440)*1440+23*60;S.draw();for(const n of ['apron','lit']){S.LAYER[n].shift();S.LAYER[n].pop()}
    return {same:seen[0]===seen[1]&&seen[2]===seen[3],seen}});
  ok('markings: the canvas is left as the markings found it',s.same,JSON.stringify(s.seen));
  await ctx.close();
}
