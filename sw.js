import { offlineFallback, warmStrategyCache } from "workbox-recipes";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { registerRoute, Route } from "workbox-routing";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

// Configuração do Cache para Páginas
const pageCache = new CacheFirst({
  cacheName: "pwa-fotos-praca-na",
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
    }),
  ],
});

// Indicando o Cache para Página Principal
warmStrategyCache({
  urls: ["/index.html", "/"],
  strategy: pageCache,
});

// Registrando a rota do cache
registerRoute(({ request }) => request.mode === "navigate", pageCache);

// Cache para assets (style, script, worker)
registerRoute(
  ({ request }) => ["style", "script", "worker"].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: "asset-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Configuração de fallback offline
offlineFallback({
  pageFallback: "/offline.html", // Página exibida quando offline
});

// Cache para imagens (agora considerando imagens locais e cacheadas)
const imageRoute = new Route(
  ({ request }) => request.destination === "image", // Filtra somente requisições de imagens
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 30, // Cache por 30 dias
      }),
    ],
  })
);

registerRoute(imageRoute);


// Adicionando Cache para as imagens do IndexedDB armazenadas localmente
self.addEventListener("fetch", (event) => {
  if (event.request.url.endsWith(".webp")) { // Verificando se é uma imagem
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // Se imagem estiver no cache, retorna
        }
        return fetch(event.request).then((response) => {
          const clonedResponse = response.clone();
          caches.open("images").then((cache) => {
            cache.put(event.request, clonedResponse); // Coloca no cache
          });
          return response;
        });
      })
    );
  }
});
