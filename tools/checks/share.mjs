// The link preview: the tags are filled in, and the preview image (1200x630, under 300 KB) and the home-screen icon
// are published.
import {readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';

export default async function({ok,browser,root}){
  // what chat apps and social sites read when the link is shared (dist/index.html, as published)
  const html=readFileSync(join(root,'dist/index.html'),'utf8');
  const tag=(attr,key)=>(html.match(new RegExp(`<(?:meta|link) ${attr}="${key}" (?:content|href)="([^"]*)"`))||[])[1];
  const t={title:tag('property','og:title'),desc:tag('property','og:description'),url:tag('property','og:url'),image:tag('property','og:image'),
    card:tag('name','twitter:card'),meta:tag('name','description'),icon:tag('rel','icon'),touch:tag('rel','apple-touch-icon')};
  const local=u=>u&&u.startsWith(t.url)?join(root,'dist',u.slice(t.url.length).split('?')[0]):null;
  const bad=[];
  if(!/^https:\/\/.+\/$/.test(t.url||''))bad.push('og:url is not an https address ending in /');
  for(const k of ['title','desc','meta'])if(!t[k]||/%[A-Z]+%/.test(t[k]))bad.push(k+' missing');
  if((t.title||'').length>70||(t.desc||'').length>200)bad.push('title or description too long to show in full');
  if(t.card!=='summary_large_image')bad.push('twitter:card is not summary_large_image');
  if(!(t.icon||'').startsWith('data:image/svg+xml,'))bad.push('the icon is not inlined');
  const img=local(t.image),touch=local(t.touch);
  if(!img||!touch)bad.push('og:image or apple-touch-icon is not under og:url');
  const page=await browser.newPage();
  const size=async f=>page.evaluate(async src=>{const i=new Image();i.src=src;await i.decode().catch(()=>{});return [i.naturalWidth,i.naturalHeight]},'data:image/'+(f.endsWith('.png')?'png':'jpeg')+';base64,'+readFileSync(f).toString('base64')).catch(()=>[0,0]);
  let kb=0,w=[0,0],ti=[0,0];
  try{kb=Math.round(statSync(img).size/1024);w=await size(img);ti=await size(touch)}catch(e){bad.push('image missing from dist/: '+e.message)}
  if(w.join()!=='1200,630')bad.push(`preview is ${w.join('x')}, not 1200x630`);
  if(kb>300)bad.push(`preview is ${kb} KB; some chat apps skip images over 300 KB`);
  if(ti.join()!=='180,180')bad.push(`home-screen icon is ${ti.join('x')}, not 180x180`);
  await page.close();
  ok('share: link preview',!bad.length,bad[0]||`${t.image} (${kb} KB)`);
}
