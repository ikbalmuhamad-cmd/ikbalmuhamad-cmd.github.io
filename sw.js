// Service worker Log Kerja Teknisi Purbaleunyi
// Ganti nomor versi di bawah setiap kali Anda mengunggah versi baru aplikasi.
const VERSI = "v1";
const CACHE = "log-kerja-" + VERSI;
const FILE_INTI = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(FILE_INTI)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((nama) => Promise.all(nama.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Jaringan dulu supaya selalu dapat versi terbaru; kalau offline, pakai simpanan.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // jangan ganggu permintaan ke server lain

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const salinan = res.clone();
          caches.open(CACHE).then((c) => c.put(req, salinan));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match("/index.html") : undefined))
      )
  );
});

// Ketuk notifikasi -> buka / fokuskan aplikasi
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((daftar) => {
      for (const c of daftar) {
        if ("focus" in c) return c.focus();
      }
      return self.clients.openWindow("/");
    })
  );
});
