import "../../chunks/index-server.js";
import { C as writable, n as bind_props, o as unsubscribe_stores, t as attr_class, x as derived, y as escape_html } from "../../chunks/server.js";
import "../../chunks/index-server2.js";
//#region src/lib/stores/db.ts
var DEFAULT_ROUTINE = {
	lunes: {
		label: "",
		rest: true,
		exercises: []
	},
	martes: {
		label: "",
		rest: true,
		exercises: []
	},
	miercoles: {
		label: "",
		rest: true,
		exercises: []
	},
	jueves: {
		label: "",
		rest: true,
		exercises: []
	},
	viernes: {
		label: "",
		rest: true,
		exercises: []
	},
	sabado: {
		label: "",
		rest: true,
		exercises: []
	},
	domingo: {
		label: "",
		rest: true,
		exercises: []
	}
};
var DEFAULT_PROFILE = {
	name: "",
	age: "",
	sex: "H",
	height: "",
	weight: "",
	restTimerSeconds: 90,
	activityLevel: 2
};
function loadDB() {
	if (typeof localStorage === "undefined") return {
		routine: DEFAULT_ROUTINE,
		sessions: [],
		profile: DEFAULT_PROFILE,
		objective: "hipertrofia",
		bw: []
	};
	try {
		return {
			routine: JSON.parse(localStorage.getItem("gym_routine") || "null") || DEFAULT_ROUTINE,
			sessions: JSON.parse(localStorage.getItem("gym_sessions") || "[]") || [],
			profile: JSON.parse(localStorage.getItem("gym_profile") || "null") || DEFAULT_PROFILE,
			objective: localStorage.getItem("gym_objective") || "hipertrofia",
			bw: JSON.parse(localStorage.getItem("gym_bw") || "[]") || []
		};
	} catch {
		return {
			routine: DEFAULT_ROUTINE,
			sessions: [],
			profile: DEFAULT_PROFILE,
			objective: "hipertrofia",
			bw: []
		};
	}
}
function persist(key, value) {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
}
function createDB() {
	const { subscribe, set, update } = writable(loadDB());
	return {
		subscribe,
		set,
		update,
		saveRoutine(routine) {
			update((db) => {
				db.routine = routine;
				persist("gym_routine", routine);
				return db;
			});
		},
		saveSessions(sessions) {
			update((db) => {
				db.sessions = sessions;
				persist("gym_sessions", sessions);
				return db;
			});
		},
		saveProfile(profile) {
			update((db) => {
				db.profile = profile;
				persist("gym_profile", profile);
				return db;
			});
		},
		saveObjective(objective) {
			update((db) => {
				db.objective = objective;
				persist("gym_objective", objective);
				return db;
			});
		},
		saveBW(bw) {
			update((db) => {
				db.bw = bw;
				persist("gym_bw", bw);
				return db;
			});
		},
		addSession(session) {
			update((db) => {
				const existing = db.sessions.findIndex((s) => s.date === session.date);
				if (existing >= 0) db.sessions[existing] = session;
				else db.sessions.push(session);
				persist("gym_sessions", db.sessions);
				return db;
			});
		},
		setOnboarded() {
			if (typeof localStorage !== "undefined") localStorage.setItem("gym_onboarded", "true");
		},
		isOnboarded() {
			if (typeof localStorage === "undefined") return false;
			return !!localStorage.getItem("gym_onboarded");
		},
		reload() {
			set(loadDB());
		},
		exportData() {
			const db = loadDB();
			return JSON.stringify({
				routine: db.routine,
				sessions: db.sessions,
				profile: db.profile,
				objective: db.objective,
				bw: db.bw,
				exported: (/* @__PURE__ */ new Date()).toISOString()
			}, null, 2);
		},
		importData(json) {
			try {
				const d = JSON.parse(json);
				if (d.sessions) persist("gym_sessions", d.sessions);
				if (d.routine) persist("gym_routine", d.routine);
				if (d.profile) persist("gym_profile", d.profile);
				if (d.objective) persist("gym_objective", d.objective);
				if (d.bw) persist("gym_bw", d.bw);
				set(loadDB());
				return true;
			} catch {
				return false;
			}
		}
	};
}
var db = createDB();
var todayDate = derived(db, () => {
	return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
});
derived([db, derived(db, () => {
	return [
		"domingo",
		"lunes",
		"martes",
		"miercoles",
		"jueves",
		"viernes",
		"sabado"
	][(/* @__PURE__ */ new Date()).getDay()];
})], ([$db, $dk]) => {
	return $db.routine[$dk] || {
		label: "",
		rest: true,
		exercises: []
	};
});
derived([db, todayDate], ([$db, $date]) => {
	return $db.sessions.find((s) => s.date === $date) || null;
});
//#endregion
//#region src/lib/components/Toast.svelte
function Toast($$renderer, $$props) {
	let visible = false;
	let message = "";
	let timer;
	function show(msg, duration = 2500) {
		message = msg;
		visible = true;
		clearTimeout(timer);
		timer = setTimeout(() => {
			visible = false;
		}, duration);
	}
	$$renderer.push(`<div${attr_class("toast", void 0, { "show": visible })}>${escape_html(message)}</div>`);
	bind_props($$props, { show });
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		Toast($$renderer, {});
		$$renderer.push(`<!---->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
