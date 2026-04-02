/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const CACHE = `gym-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => (self as any).skipWaiting())
	);
});

self.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.keys().then(keys =>
			Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
		).then(() => (self as any).clients.claim())
	);
});

self.addEventListener('fetch', (event: FetchEvent) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);

	// Skip external requests (Supabase, Google, etc.)
	if (url.origin !== location.origin) return;

	// Hashed assets (_app/immutable/*): cache-first (they never change)
	const isImmutable = url.pathname.startsWith('/_app/immutable/');

	if (isImmutable) {
		event.respondWith(
			caches.match(event.request).then(cached => {
				if (cached) return cached;
				return fetch(event.request).then(response => {
					if (response.ok) {
						const clone = response.clone();
						caches.open(CACHE).then(cache => cache.put(event.request, clone));
					}
					return response;
				});
			})
		);
	} else {
		// HTML and other files: network-first (always get latest)
		event.respondWith(
			fetch(event.request).then(response => {
				if (response.ok) {
					const clone = response.clone();
					caches.open(CACHE).then(cache => cache.put(event.request, clone));
				}
				return response;
			}).catch(() => caches.match(event.request).then(c => c || caches.match('/') as Promise<Response>))
		);
	}
});
