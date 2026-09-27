// Reports and the region at night (docs/briefs/polish-reports.md, #76): Office › Reports folds routes with no flights
// behind a link and shows near-zero profit in whole dollars; Region › Transport names the busiest lines and says when a
// quicker line takes a line's riders; and the region map darkens at night while its towns' windows shine.
export default async function({open,ok,saveText,newest}){
  const {ctx,page,errs}=await open(undefined,saveText(newest),false,{still:true});

  const rep=await page.evaluate(()=>{const S=__sim,R=S.R;R.idleRoutes=false;R.oSub='reports';S.setTab('office');
    const rows=()=>[...document.querySelectorAll('#panel .rtab tr')].slice(1).map(tr=>[...tr.children].map(td=>td.textContent));
    const idle=Object.keys(S.G.routes||{}).filter(c=>S.CITY[c]&&S.rsOf(c).n<0.05).length,folded=rows(),link=document.querySelector('#panel [data-idlert]');
    link&&link.click();const all=rows(),link2=document.querySelector('#panel [data-idlert]');
    link2&&link2.click();const again=rows();S.setTab('stands');
    return {idle,folded:folded.length,shownIdle:folded.filter(r=>r[1]==='0.0').length,all:all.length,again:again.length,
      link:link&&link.textContent,link2:link2&&link2.textContent,cents:all.filter(r=>/\$\d+\.\d\d$/.test(r[3])).map(r=>r[0]+' '+r[3])}});
  ok('reports: routes with no flights fold behind a link, and it shows and hides them',
    rep.idle>0&&rep.shownIdle===0&&rep.all===rep.folded+rep.idle&&rep.again===rep.folded&&/^Show \d+ routes? with no flights$/.test(rep.link)&&/^Hide/.test(rep.link2),JSON.stringify(rep));
  ok('reports: route profit below $100 reads in whole dollars',!rep.cents.length,JSON.stringify(rep.cents));

  const reg=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;S.regionTick();R.regSub='lines';S.setTab('region');
    const r=R.reg,sum=Object.values(r.lines).reduce((a,l)=>a+l.riders,0),Ls=Object.values(G.lines||{});
    const top=Ls.filter(L=>r.lines[L.id]).sort((a,b)=>r.lines[b.id].riders-r.lines[a.id].riders)[0];
    const sumTxt=document.querySelector('#panel .report').textContent;
    const cards=Ls.map(L=>{const st=r.lines[L.id],el=document.querySelector(`#line-${L.id} .rd`);return {id:L.id,f:st&&st.f,riders:st&&st.riders,note:!!el&&/a quicker line takes them/.test(el.textContent)}});
    S.setTab('stands');return {total:r.riders,sum,top:top&&S.lineCode(top),sumTxt,cards}});
  ok('reports: the region summary counts exactly the riders its lines carry',Math.abs(reg.total-reg.sum)<1e-6,`${reg.total} vs ${reg.sum}`);
  ok('reports: the region summary names the busiest line',!!reg.top&&reg.sumTxt.includes('Busiest: '+reg.top),reg.sumTxt);
  ok('reports: only a running line with no riders says a quicker line takes them',
    reg.cards.some(c=>c.note)&&reg.cards.every(c=>!c.note||(c.f>0&&c.riders<0.5)),JSON.stringify(reg.cards));

  // day against night on the region map: darker overall, and only the windows brighter than by day
  const night=await page.evaluate(()=>{const S=__sim,G=S.G,cv=document.querySelector('#cv'),c=cv.getContext('2d');S.setView('region');
    const shot=h=>{G.clock=Math.floor(G.clock/1440)*1440+h*60;S.draw();return c.getImageData(0,0,cv.width,cv.height).data};
    const mean=d=>{let t=0;for(let i=0;i<d.length;i+=4)t+=d[i]+d[i+1]+d[i+2];return +(t/(d.length/4)/3).toFixed(1)};
    const D=shot(13),N=shot(1);let lit=0;for(let i=0;i<D.length;i+=4)if(N[i]-D[i]>40)lit++;
    S.setView('airport');return {day:mean(D),night:mean(N),lit}});
  ok('reports: the region map is clearly darker at night, with its windows lit',night.night<night.day*0.8&&night.lit>200,JSON.stringify(night));

  if(errs.length)ok('reports: no page errors',false,errs[0]);
  await ctx.close();
}
