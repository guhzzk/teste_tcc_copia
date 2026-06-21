// service worker do PWA "Libro"
// cacheia apenas os arquivos estaticos do front-end (html, css, js, imagens).
// chamadas de API (login, livros, emprestimos, etc.) sempre vao direto para a rede,
// para garantir que os dados mostrados sejam sempre atuais.

const CACHE_NAME = "libro-cache-v1";

const ARQUIVOS_PARA_CACHEAR = [
  "/login/index.html",
  "/login/style.css",
  "/login/login.js",
  "/login/cadastro.html",
  "/login/cadastro.css",
  "/login/cadastro.js",
  "/home/home.html",
  "/home/home.css",
  "/home/home.js",
  "/img/g10.png",
  "/img/icon-192.png",
  "/img/icon-512.png",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS_PARA_CACHEAR))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes
          .filter((nome) => nome !== CACHE_NAME)
          .map((nome) => caches.delete(nome))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // nunca intercepta chamadas de API: deixa sempre ir para a rede
  const ehArquivoEstatico = /\.(html|css|js|png|jpg|jpeg|svg|ico|json)$/.test(url.pathname);
  if (!ehArquivoEstatico) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((respostaCache) => {
      if (respostaCache) {
        return respostaCache;
      }
      return fetch(event.request).then((respostaRede) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, respostaRede.clone());
          return respostaRede;
        });
      });
    }).catch(() => fetch(event.request))
  );
});
