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
		client: {start:"_app/immutable/entry/start.B14ii4OK.js",app:"_app/immutable/entry/app.Clo5m7HX.js",imports:["_app/immutable/entry/start.B14ii4OK.js","_app/immutable/chunks/BE8k6FGo.js","_app/immutable/chunks/DI7qhpnn.js","_app/immutable/chunks/CFAJzhJo.js","_app/immutable/entry/app.Clo5m7HX.js","_app/immutable/chunks/aKYwQ3F9.js","_app/immutable/chunks/DI7qhpnn.js","_app/immutable/chunks/B_IZsjwj.js","_app/immutable/chunks/BZ8IyQPU.js","_app/immutable/chunks/DJYzaS5I.js","_app/immutable/chunks/CFAJzhJo.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js'))
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
