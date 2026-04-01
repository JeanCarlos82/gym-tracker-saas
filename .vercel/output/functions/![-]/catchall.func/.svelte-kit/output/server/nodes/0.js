

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.DIWItvTJ.js","_app/immutable/chunks/DJ80OQkb.js","_app/immutable/chunks/DXLwiZ0H.js"];
export const stylesheets = ["_app/immutable/assets/0.BE3KJFJP.css"];
export const fonts = [];
