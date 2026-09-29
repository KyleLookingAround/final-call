// On a phone the camera bar covers the foot of the terminal, so the airport view scrolls past its bottom edge by the bar's
// height and "All" fits the whole airport above the bar; on a tablet or desktop the view stops at the edge as before.
export default async function({open,ok,saveText,newest}){
  for(const [w,h,touch] of [[320,568,true],[390,844,true],[1440,900,false]]){
    const {ctx,page,errs}=await open({width:w,height:h},saveText(newest),touch,{still:true});
    const r=await page.evaluate(()=>{
      const S=__sim,R=S.R,bar=document.querySelector('#cam').getBoundingClientRect(),st=document.querySelector('#stage').getBoundingClientRect();
      R.cam.z=1;R.cam.y=1e6;S.clampCam();
      const panned=R.cam.y+R.sh/S.viewK();
      const barTop=(bar.top-st.top)/S.viewK()+R.cam.y; // the bar's top edge in world units
      S.focus('all');R.cam.x=R.cam.tx??R.cam.x;R.cam.y=R.cam.ty??R.cam.y;S.clampCam();
      const all=R.cam.y+(R.sh-(R.camH||0))/S.viewK();
      return {camH:R.camH||0,panned,barTop,all,Y1:S.Y1,Y0:S.Y0};
    });
    if(w<600){
      ok(`camera: at ${w}×${h} the view scrolls until the foot of the airport clears the bar`,r.camH>0&&r.panned>r.Y1+1&&r.barTop>=r.Y1-1,`view ends at ${Math.round(r.panned)}, bar top at ${Math.round(r.barTop)}, edge ${r.Y1}`);
      ok(`camera: at ${w}×${h} "All" fits the airport above the bar`,r.all>=r.Y1-1,`fits to ${Math.round(r.all)}, edge ${r.Y1}`);
    }else ok(`camera: at ${w}×${h} the view stops at the edge`,r.camH===0&&Math.abs(r.panned-r.Y1)<1,`view ends at ${Math.round(r.panned)}, edge ${r.Y1}`);
    if(errs.length)ok(`camera: no page errors at ${w}×${h}`,false,errs[0]);
    await ctx.close();
  }
}
