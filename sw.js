var CACHE_NAME = "word-drawer-v2";
var SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(SHELL).catch(function(){});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(key){
        if(key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(event){
  if(event.request.method !== "GET") return;
  // Network-first: always prefer a fresh copy so app updates show up
  // immediately; only fall back to the cache when there is no network.
  event.respondWith(
    fetch(event.request).then(function(res){
      if(res && res.status === 200){
        var resClone = res.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, resClone); });
      }
      return res;
    }).catch(function(){
      return caches.match(event.request);
    })
  );
});
