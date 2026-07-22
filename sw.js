/* Zuzugue — cache do app para funcionar offline.
   NÃO guarda dado nenhum da usuária: os gastos vivem no localStorage do aparelho. */
const CACHE = "zuzugue-v1.0";
const ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icone-192.png", "./icone-512.png", "./icone-180.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Rede primeiro (para pegar versão nova do app), cache como rede de segurança. */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
