

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.BPM0qTFC.js","_app/immutable/chunks/Vqgel5pW.js","_app/immutable/chunks/DXLwiZ0H.js"];
export const stylesheets = ["_app/immutable/assets/0.BE3KJFJP.css"];
export const fonts = [];
