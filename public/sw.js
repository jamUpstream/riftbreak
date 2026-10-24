const CACHE_NAME='riftbreak-protocol-v1.0.2';
const APP_SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];

self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting()});

async function cacheAppShell(){
 const cache=await caches.open(CACHE_NAME);
 await cache.addAll(APP_SHELL);
 const indexResponse=await fetch('./index.html',{cache:'no-store'});
 const html=await indexResponse.text();
 const assets=[...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map(match=>new URL(match[1],self.registration.scope).href)
  .filter(url=>url.startsWith(self.location.origin));
 await cache.addAll([...new Set(assets)]);
}

self.addEventListener('install',event=>{
 event.waitUntil(cacheAppShell().then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;

 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>{
   const copy=response.clone();
   caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy));
   return response;
  }).catch(()=>caches.match('./index.html').then(response=>response||caches.match('./'))));
  return;
 }

 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
  if(!response||response.status!==200||response.type==='opaque')return response;
  const copy=response.clone();
  caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
  return response;
 })));
});
