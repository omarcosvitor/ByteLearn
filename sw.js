"use strict";

// CACHE_VERSION e reescrito pelo build.sh a cada execucao (hash do conteudo de index.html),
// entao qualquer mudanca real no app troca o nome do cache e invalida o anterior sozinha.
const CACHE_VERSION = "890f0c281e";
const CACHE_NAME = "bits-clp-" + CACHE_VERSION;

const INDEX_FILE = "index.html";
const STATIC_FILES = [
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "fonts/ibm-plex-sans-400.woff2",
  "fonts/ibm-plex-sans-500.woff2",
  "fonts/ibm-plex-sans-600.woff2",
  "fonts/ibm-plex-mono-400.woff2",
  "fonts/ibm-plex-mono-500.woff2",
  "fonts/ibm-plex-mono-600.woff2",
  "fonts/saira-condensed-600.woff2",
  "fonts/saira-condensed-700.woff2"
];

function toURL(name) {
  return new URL(name, self.registration.scope).href;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([toURL(INDEX_FILE), ...STATIC_FILES.map(toURL)])
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// permite que a pagina force a ativacao imediata do SW novo (ver botao "Atualizar" no app)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isIndex = req.mode === "navigate" || url.href === toURL(INDEX_FILE);
  if (isIndex) {
    event.respondWith(networkFirstIndex(req));
    return;
  }

  if (STATIC_FILES.some((f) => url.href === toURL(f))) {
    event.respondWith(cacheFirst(req));
  }
});

function cacheFirst(req) {
  return caches.match(req).then((cached) => cached || fetch(req));
}

// network-first para o index.html: sempre tenta a versao mais nova online,
// e so cai para o cache quando a rede falha (offline em campo)
function networkFirstIndex(req) {
  return fetch(req)
    .then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(toURL(INDEX_FILE), copy));
      return res;
    })
    .catch(() => caches.match(toURL(INDEX_FILE)));
}
