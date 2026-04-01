export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["icon-192.png","icon-512.png","manifest.json","service-worker.js"]),
	mimeTypes: {".png":"image/png",".json":"application/json"},
	_: {
		client: {start:"_app/immutable/entry/start.DFzfa3Py.js",app:"_app/immutable/entry/app.DjcNLES4.js",imports:["_app/immutable/entry/start.DFzfa3Py.js","_app/immutable/chunks/0Weyu5-e.js","_app/immutable/chunks/Vqgel5pW.js","_app/immutable/chunks/Cbua2gtn.js","_app/immutable/entry/app.DjcNLES4.js","_app/immutable/chunks/Vqgel5pW.js","_app/immutable/chunks/BcgnSMxp.js","_app/immutable/chunks/DXLwiZ0H.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
