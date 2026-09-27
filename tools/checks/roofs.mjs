// Roofs over the terminal and its piers (src/game/53-roofs.js, docs/specs/real-airport.md): drawn when zoomed out and gone
// when zoomed in, never over a room not built yet, and taps still reach the shops under them and the stands.
export default async function({open,ok,saveText,newest}){
  const {ctx,page,errs}=await open({width:1440,height:900},saveText(newest),false,{still:true});
  const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R,c=document.querySelector('#cv').getContext('2d');
    G.clock=Math.floor(G.clock/1440)*1440+12*60;S.setView('airport');
    const zoom=z=>{R.cam.z=z;S.clampCam();S.clampCam()},px=(x,y)=>{const k=S.viewK()*R.dpr,d=c.getImageData(Math.round((x-R.cam.x)*k),Math.round((y-R.cam.y)*k),1,1).data;return d[0]+','+d[1]+','+d[2]};
    // does the roofs layer change the pixel at (x,y)? drawn with it and without it
    const roofed=(x,y)=>{S.draw();const a=px(x,y),L=S.LAYER.roofs,keep=L.splice(0);S.draw();const b=px(x,y);L.push(...keep);return a!==b};
    const main=S.ROOMS[S.hallId('main')].poly,mx=(main[0][0]+main[1][0])/2,my=(main[0][1]+main[2][1])/2;
    zoom(0.01);const out={z:+R.cam.z.toFixed(2),main:roofed(mx,my)};
    zoom(1);R.cam.x=mx-300;R.cam.y=my-200;S.clampCam();const inn={z:R.cam.z,main:roofed(mx,my),fade:S.roofFade(1)}; // 1x: the airport view's starting zoom
    // not built yet: Pier B's rooms before Pier B, the hotel before it's bought (and roofed once they are)
    zoom(0.01);const pierB=G.pierB,hotel=G.lv.hotel;G.pierB=false;G.lv.hotel=0;
    const later=S.ROOMS.filter(r=>r.ph===2||r.need),at=r=>{const P=r.poly,x=P.reduce((a,p)=>a+p[0],0)/P.length,y=P.reduce((a,p)=>a+p[1],0)/P.length;return roofed(x,y)},
      hid=later.map(at),planned=S.roofNow().rooms.length;G.pierB=true;G.lv.hotel=Math.max(1,hotel||0);const all=S.roofNow().rooms.length,shown=later.map(at);G.pierB=pierB;G.lv.hotel=hotel;
    // taps through the roof: a shop under it opens Sales, a stand selects it
    zoom(0.01);S.draw();const k=S.viewK(),tap=(x,y)=>{R.lastTap=0;S.tapAt((x-R.cam.x)*k,(y-R.cam.y)*k)};
    const j=S.SHOP_X.findIndex((x,j)=>S.shopOpen(j));let shop=null;
    if(j>=0){const a=S.LAY.shops[j];for(let dx=10;dx<110&&shop==null;dx+=10)for(let dy=5;dy<40;dy+=5){const x=S.SHOP_X[j]+dx,y=452+dy;if(S.shopHit(j,x,y)){S.setTab('stands');tap(x,y);shop=G.tab;break}}}
    const i=S.SIDX.find(i=>G.stands[i].built&&i>0),b=S.standBox(i);R.sel=0;tap(b[0]+b[2]/2,b[1]+b[3]/2);
    return {out,inn,later:later.map(r=>r.id),hid,shown,planned,all,shop,stand:R.sel===i,i}});
  ok('roofs: drawn over the terminal zoomed out, gone zoomed in',r.out.main&&!r.inn.main&&r.inn.fade===0,JSON.stringify({out:r.out,in:r.inn})+(errs.length?' '+errs[0]:''));
  ok('roofs: never over a room not built yet',r.later.length>0&&r.hid.every(h=>!h)&&r.shown.every(Boolean)&&r.planned<r.all,JSON.stringify({later:r.later,hid:r.hid,shown:r.shown,rooms:[r.planned,r.all]}));
  ok('roofs: taps still reach the shops under them and the stands',r.shop==='sales'&&r.stand&&!errs.length,JSON.stringify({shop:r.shop,stand:r.stand,i:r.i})+(errs.length?' '+errs[0]:''));
  await ctx.close();
}
