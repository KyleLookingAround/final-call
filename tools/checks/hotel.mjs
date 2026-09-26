// The airport hotel (docs/specs/terminal.md): it's never overbooked, crews resting there are ready sooner, stranded
// passengers get rooms, late arrivals walk through to the lobby, early guests come down from it, and with no hotel
// nothing changes.
export default async function({open,ok,saveText}){
  {const {ctx,page,errs}=await open(undefined,saveText('v27-L9.json'),false,{still:true});
    const r=await page.evaluate(()=>{const S=__sim,G=S.G,R=S.R;R.sim=true;const H=S.hallId('hot'),W=S.hallId('wlk'),C=S.hallId('ci'),O=S.hallId('out');
      // a one-block hotel for a day and a half, so it fills: never more guests than rooms
      G.lv.hotel=1;G.hotelStays=[];let over=0,peak=0;const seen=new Map();
      for(let k=0;k<36*600;k++){S.update(0.1);if(k%10===0){const o=S.hotelOcc();peak=Math.max(peak,o);if(o>S.hotelRooms())over++}
        for(const p of R.pax)if(p.hotel){let s=seen.get(p);if(!s)seen.set(p,s={k:p.hotel,rooms:[]});if(s.rooms.at(-1)!==p.room)s.rooms.push(p.room)}}
      const late=[...seen.values()].filter(s=>s.k!=='early'),early=[...seen.values()].filter(s=>s.k==='early');
      const lateOk=late.filter(s=>s.rooms.includes(W)&&s.rooms.at(-1)===H&&!s.rooms.includes(O)).length,earlyOk=early.filter(s=>s.rooms[0]===H&&s.rooms.includes(C)).length;
      const away=G.hotelBook.away+((G.hotelBook.last||{}).away||0);
      // crews: one about to finish its duty rests 9 hours with a room, 12 without
      const back=G.clock+60,c1={free:0,back:0,duty:590,res:1},c2={free:0,back:0,duty:590,res:1};
      G.hotelStays=[];S.crewAway({crew:c1},back);G.lv.hotel=0;S.crewAway({crew:c2},back);G.lv.hotel=1;
      const crew={hotel:c1.free-back,none:c2.free-back};
      // stranded: a departure held past midnight by a storm; 40 rooms here, the rest to city hotels
      G.hotelStays=[];const city0=G.hotelBook.city,cash0=G.cash;
      let i=-1;for(let k=0;k<3000&&i<0;k++){S.update(0.1);i=S.SIDX.findIndex(j=>R.st[j].F&&R.st[j].F.plane.state==='boarding'&&!R.st[j].F.freighter)}
      let strand={i};if(i>=0){const F=R.st[i].F;G.clock=Math.floor(G.clock/1440)*1440+1440+60+0.5;R.lastMin=Math.floor(G.clock);F.std=G.clock-61;R.fx.storm=G.clock+30;
        for(const j of S.SIDX)if(j!==i&&R.st[j].F)R.st[j].F.stranded=true;for(const m of R.rwy.q)m.F.stranded=true;
        S.hotelStranded();const n=G.hotelStays.filter(s=>s[0]==='strand').length;strand={i,booked:F.booked,n,city:G.hotelBook.city-city0,paid:Math.round(cash0-G.cash),flag:!!F.stranded};S.hotelStranded();strand.again=G.hotelStays.filter(s=>s[0]==='strand').length}
      R.sim=false;return {over,peak,rooms:S.hotelRooms(),hold:Math.min(S.hotelRooms()>>2,Math.ceil(G.crews.length/3)),away,late:late.length,lateOk,early:early.length,earlyOk,crew,strand}});
    // rooms kept back for crews (crewHold) count as full for paying guests
    ok('hotel: never more guests than rooms, and a full hotel turns guests away',r.over===0&&r.peak>=r.rooms-r.hold&&r.away>0,`peak ${r.peak}/${r.rooms} with up to ${r.hold} kept for crews, ${r.away} turned away`+(errs.length?' '+errs[0]:''));
    ok('hotel: crews resting at the hotel are ready sooner',r.crew.hotel<r.crew.none&&r.crew.none===720,JSON.stringify(r.crew));
    const s=r.strand;ok('hotel: stranded passengers get rooms, and the rest go to city hotels',s.flag&&s.n===Math.min(40,s.booked)&&s.city===s.booked-s.n&&s.paid>0&&s.again===s.n,JSON.stringify(s));
    ok('hotel: late arrivals walk through the walkway to the lobby',r.late>=5&&r.lateOk===r.late,`${r.lateOk}/${r.late}`);
    ok('hotel: early guests come down to the lobby and walk out to check-in',r.early>=3&&r.earlyOk===r.early,`${r.earlyOk}/${r.early}`);
    await ctx.close();}
  // with no hotel, the game plays exactly as it would without the hotel's code
  {const run=async strip=>{const {ctx,page,errs}=await open(undefined,saveText('v26-L5.json'),false,{still:true});
      const r=await page.evaluate(strip=>{const S=__sim,G=S.G;S.R.sim=true;if(strip)S.hotelUnhook();
        let guests=0;for(let k=0;k<30*600;k++){S.update(0.1);if(k%50===0)guests+=S.R.pax.filter(p=>p.hotel).length}
        S.R.sim=false;const g={...G};delete g.savedAt;return {state:JSON.stringify(g),guests,stays:G.hotelStays.length,hotel:G.lv.hotel}},strip);
      await ctx.close();return {...r,errs}};
    const a=await run(false),b=await run(true);
    ok('hotel: with no hotel, nothing changes',a.hotel===0&&a.guests===0&&a.stays===0&&a.state===b.state&&!a.errs.length,a.state===b.state?a.errs.join('; '):'the game differs with the hotel’s code');
  }
}
