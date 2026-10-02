window.__calls = [];
export const persistDose = async (...a) => { window.__calls.push(["persistDose", ...a]); return { ok: true }; };
export const persistStory = async (...a) => { window.__calls.push(["persistStory", ...a]); return { ok: true }; };
