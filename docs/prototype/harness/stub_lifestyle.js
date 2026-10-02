export const saveMyDose = async (...a) => { window.__calls.push(["saveMyDose", ...a]); return { ok: true }; };
export const markGutGuardian = async (...a) => { window.__calls.push(["markGutGuardian", ...a]); return { ok: true }; };
export const requestChange = async (...a) => { window.__calls.push(["requestChange", ...a]); return { ok: true }; };
