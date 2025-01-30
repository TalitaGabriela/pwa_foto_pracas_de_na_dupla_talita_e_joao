import { offlineFallback, warmStrategyCache } from "workbox-recipes";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { registerRoute, Route } from "workbox-routing";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

// configurando o cache
const pageCache = new CacheFirst({
  cacheName: "pwa-fotos-praca-na",
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

//indicando o cache de página
warmStrategyCache({
  urls: ["/index.html", "/"],
  strategy: pageCache,
});
//registrando a rota
registerRoute(({ request }) => request.mode === "navigate", pageCache);

// Configurando o cache para assets (style, script, worker)
registerRoute(
  ({request}) => ["style", "script", "worker"].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: "asset-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200], // Apenas respostas com status 0 e 200 serão cacheadas
      }),
    ],
  })
);

// Configurando fallback offline
offlineFallback({
  pageFallback: "/offline.html", // Página a ser exibida quando offline
});

//Cache para imagens
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

// Evita cache na API para sempre carregar fotos novas
registerRoute(
  ({ request }) => request.url.includes('/api/photos'), // Filtra as requisições para /api/photos
  new StaleWhileRevalidate({
    cacheName: "photo-api-cache", // Pode ser nomeado como preferir
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200], // Cache apenas respostas bem-sucedidas
      }),
    ],
  })
);
