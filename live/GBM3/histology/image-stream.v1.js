// GBM3 microscopy only. Serve an immutable TIFF assembled from byte-range shards.
const CHUNK=640000, TOTAL=5974892;
const scope=new URL(self.registration.scope);
const imageURL=new URL('gbm3-he.v1.ome.tif',scope).href;
const partURL=i=>new URL(`parts/he-v1-${String(i).padStart(2,'0')}.bin`,scope);
const chunks=new Map();
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
function chunk(i){
  if(!chunks.has(i)){
    const request=fetch(partURL(i),{credentials:'omit'}).then(async response=>{
      if(!response.ok) throw Error(`Missing histology shard ${i}: ${response.status}`);
      const d=await response.arrayBuffer();
      if(d.byteLength!==Math.min(CHUNK,TOTAL-i*CHUNK)) throw Error(`Incomplete histology shard ${i}`);
      return d;
    }).catch(err=>{chunks.delete(i);throw err});
    chunks.set(i,request);
  }
  return chunks.get(i);
}
const headers=()=>new Headers({'Content-Type':'image/tiff','Accept-Ranges':'bytes','Cache-Control':'no-store'});
async function serve(request){
  const h=headers(); const range=request.headers.get('range');
  const match=range?.match(/^bytes=(\d+)-(\d*)$/i); let from=0,to=TOTAL-1;
  if(range && !match){h.set('Content-Range',`bytes */${TOTAL}`);return new Response(null,{status:416,headers:h})}
  if(match){
    from=Number(match[1]);to=Math.min(TOTAL-1,match[2]?Number(match[2]):TOTAL-1);
    if(!Number.isSafeInteger(from)||!Number.isSafeInteger(to)||to<from){h.set('Content-Range',`bytes */${TOTAL}`);return new Response(null,{status:416,headers:h})}
    h.set('Content-Range',`bytes ${from}-${to}/${TOTAL}`);
  }
  h.set('Content-Length',String(to-from+1));
  if(request.method==='HEAD')return new Response(null,{status:match?206:200,headers:h});
  if(!match){
    let i=0;
    return new Response(new ReadableStream({async pull(c){try{if(i*CHUNK>=TOTAL)c.close();else c.enqueue(new Uint8Array(await chunk(i++)));}catch(error){c.error(error);}}}),{status:200,headers:h});
  }
  const first=Math.floor(from/CHUNK),last=Math.floor(to/CHUNK);
  try{
    const blocks=await Promise.all(Array.from({length:last-first+1},(_,index)=>chunk(index+first)));
    const body=new Uint8Array(to-from+1);let used=0;
    for(let i=first;i<=last;i++){
      const block=blocks[i-first],start=Math.max(0,from-i*CHUNK),end=Math.min(block.byteLength,to-i*CHUNK+1);
      const piece=new Uint8Array(block,start,end-start);body.set(piece,used);used+=piece.byteLength;
    }
    return new Response(body,{status:206,headers:h});
  }catch(error){console.error(error);return new Response('Could not load GBM3 image bytes.',{status:503});}
}
self.addEventListener('fetch',event=>{
  if(event.request.url===imageURL && ['GET','HEAD'].includes(event.request.method)) event.respondWith(serve(event.request));
});
