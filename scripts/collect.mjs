import fs from 'node:fs/promises';
import {conditions} from '../src/conditions.js';
import {artStyle} from '../src/art-style.js';
const source='https://api.cardkingdom.com/api/v2/pricelist',origin=process.env.MTGTREND_ORIGIN||'https://mtgtrend.robiichi.workers.dev';
if(!process.env.MTGTREND_IMPORT_TOKEN)throw new Error('Missing import token');
const feed=process.argv[2]?JSON.parse(await fs.readFile(process.argv[2],'utf8')):await (async()=>{const r=await fetch(source,{signal:AbortSignal.timeout(120000)});if(!r.ok)throw new Error('Source HTTP '+r.status);return r.json();})();
const sourceAt=feed.meta?.created_at?.replace(' ','T')+'Z';if(!Array.isArray(feed.data)||feed.data.length<10000)throw new Error('Invalid feed');
const day=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Tokyo'}),rows=[],seen=new Set();
for(const r of feed.data){if(!r.scryfall_id||!/^\d+(\.\d{1,2})?$/.test(String(r.price_retail))||seen.has(String(r.id)))continue;seen.add(String(r.id));rows.push({id:String(r.id),scryfall_id:r.scryfall_id,price_cents:Math.round(Number(r.price_retail)*100),conditions:conditions(r),art_style:artStyle(r.variation),finish:r.is_foil==='true'||r.is_foil===true?'foil':'normal',url:r.url,ck_set:new URL(r.url,'https://www.cardkingdom.com/').pathname.split('/')[2],ck_edition:r.edition,stock:Number(r.qty_retail)||0});}
async function post(payload){for(let attempt=0;attempt<4;attempt++){try{const r=await fetch(origin+'/api/import',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+process.env.MTGTREND_IMPORT_TOKEN},body:JSON.stringify({day,...payload}),signal:AbortSignal.timeout(120000)});const d=await r.json();if(!r.ok)throw new Error(`Import HTTP ${r.status}`);return d;}catch(e){if(attempt===3)throw e;await new Promise(r=>setTimeout(r,3000*(attempt+1)));}}}
const chunks=Math.ceil(rows.length/1000),begin=await post({action:'begin',source_at:sourceAt,chunks});if(begin.completed){console.log(day+' already complete');process.exit(0);}
let matched=0;for(let chunk=0;chunk<chunks;chunk+=4){const results=await Promise.all(Array.from({length:Math.min(4,chunks-chunk)},(_,offset)=>{const i=chunk+offset;return post({action:'chunk',chunk:i,rows:rows.slice(i*1000,(i+1)*1000)});}));matched+=results.reduce((n,r)=>n+r.matched,0);console.log(`Chunks ${Math.min(chunk+4,chunks)}/${chunks}; matched ${matched}`);}
const completed=await post({action:'complete'});console.log('Completed '+day+'; imported '+completed.count+' products');

