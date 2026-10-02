"""Turns the approved Lifestyle member page (lifestyle2/build/app.jsx, the assembled prototype)
into components/prototype/LifestyleMember.jsx for the GutGuard-Life-Style repo.

Production (default): the page shows the signed-in member's own data (name, card, E-Points,
stage, plan, doses, dose history, approved Stories of Hope) and saves doses, the adjusted
dose, Gut Guardian and Story of Hope to Supabase. No demo people or demo history.
NEXT_PUBLIC_PROTOTYPE_DEMO=1 brings back the prototype's demo bar and seeded data.

Usage: python3 port/port_lifestyle.py <app.jsx> <out.jsx>
"""
import sys
from fontfix import fix_fonts
from assets import extract_images
import os

src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, f"expected {n} match(es), found {c}: {a[:120]!r}"
    s = s.replace(a, b)


# ── 1. Module header ────────────────────────────────────────────────────────────────
rep('import React, { useEffect, useMemo, useRef, useState } from "react";\nimport { createRoot } from "react-dom/client";',
    '"use client";\n'
    'import React, { useEffect, useMemo, useRef, useState } from "react";\n'
    'import { persistDose, persistStory } from "@/lib/actions/member";\n'
    'import { markGutGuardian, saveMyDose } from "@/lib/actions/lifestyle";\n'
    '/* Production port (Addendum 05). DEMO=1 brings back the prototype demo bar and seeded data. */\n'
    'const DEMO = process.env.NEXT_PUBLIC_PROTOTYPE_DEMO === "1";\n'
    '/* The signed-in member, set by the page before the first render (see LifestyleMemberPage below). */\n'
    'let LIVE = null;\n'
    'const WEBSITE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL || "https://gutguard.ph").replace(/\\/$/, "");\n'
    'const HUB_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\\/$/, "");\n'
    'const isoDay = (d) => `${Y}-${String(M + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;')

# ── 2. Demo data becomes replaceable; production fills it from the member's own rows ──
rep('const STORIES_TOTAL = 1247;', 'let STORIES_TOTAL = 1247;')
rep('const NEW_STORIES = 5;', 'let NEW_STORIES = 5;')
rep('const STORIES = [', 'let STORIES = [')
rep('const TEAM = [', 'let TEAM = [')
rep('const ME = { name: "Rey Aquino"', 'let ME = { name: "Rey Aquino"')
rep('const INVITE_URL = "https://claude.ai/artifact/9tPTTKyCSRCkaeFwuMku3J";',
    'const INVITE_URL = HUB_URL ? HUB_URL + "/" : DEMO ? "https://claude.ai/artifact/9tPTTKyCSRCkaeFwuMku3J" : typeof location !== "undefined" ? location.origin + "/" : "/";')
rep('const SITE = "https://claude.ai/artifact/EU7uvgH4zxnXT3E4DSpiRo";', 'const SITE = DEMO ? "https://claude.ai/artifact/EU7uvgH4zxnXT3E4DSpiRo" : WEBSITE_URL + "/";')

# ?do=guardian from the website (production); #member~guardian (demo)
rep('const hashParts = () => { let h = (typeof location !== "undefined" ? location.hash : "").replace("#", "");',
    'const hashParts = () => { const doQ = typeof location !== "undefined" ? new URLSearchParams(location.search).get("do") : null; if (doQ && !DEMO) return { stage: "", action: doQ }; let h = (typeof location !== "undefined" ? location.hash : "").replace("#", "");')

rep('const CARD_NO = "0240 5578 9012 3456";', 'let CARD_NO = "0240 5578 9012 3456";')
rep('const [gifts, setGifts] = useState(() => [{ id: "g1", name: "Lorna Aquino"', 'const [gifts, setGifts] = useState(() => LIVE ? [] /* plans paid for others: back-end task (Addendum 05) */ : [{ id: "g1", name: "Lorna Aquino"')

# ── 2b. Days across month ends; counts from the trial start or the current refill ───────
rep('const key = (d) => `${Y}-${M + 1}-${d}`;',
    'const key = (d) => { const x = new Date(Y, M, d); return `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`; }; /* d may be 0 or less: last month */\n'
    'const keyDate = (k) => { const [a, b, c] = String(k).split("-").map(Number); return new Date(a, b - 1, c); };\n'
    '/* production: capsules and trial nights count from LIVE.countSince (trial start or current refill) */\n'
    'const counted = (log) => Object.entries(log).filter(([k]) => !LIVE || !LIVE.countSince || keyDate(k) >= keyDate(LIVE.countSince)).map(([, v]) => v);')
rep('const nightNow = isWaiting || isCard ? 0 : Math.min(5, Object.keys(log).length + 1);', 'const nightNow = isWaiting || isCard ? 0 : Math.min(5, counted(log).length + 1);')
rep('Object.values(log).forEach((day) => ["morning", "lunch", "dreams"].forEach((s) => { if (day[s]) takenCaps += perSlot(day)[s] || 0; }));',
    'counted(log).forEach((day) => ["morning", "lunch", "dreams"].forEach((s) => { if (day[s]) takenCaps += perSlot(day)[s] || 0; }));')
rep('for (let d = TODAY; d >= 1 && SLOTS.length; d--) {', 'for (let d = TODAY; d >= TODAY - 119 && SLOTS.length; d--) {')
rep('const daysUsed = Object.keys(log).length;', 'const daysUsed = counted(log).length;')
rep('const trialStart = TODAY - Object.keys(log).length;', 'const trialStart = TODAY - counted(log).length;')

# ── 3. First render from the member's data ─────────────────────────────────────────────
rep('const [stage, setStageRaw] = useState(hashStage());', 'const [stage, setStageRaw] = useState(LIVE ? LIVE.stage : hashStage());')
rep('const [plan, setPlan] = useState(stage === "trial" || stage === "ordered" || stage === "card" ? null : stage === "builder" ? { ...defaultPlan(), goal: "full" } : defaultPlan());',
    'const [plan, setPlan] = useState(LIVE ? LIVE.plan : stage === "trial" || stage === "ordered" || stage === "card" ? null : stage === "builder" ? { ...defaultPlan(), goal: "full" } : defaultPlan());')
rep('const [points, setPoints] = useState(stage === "card" ? 0 : stage === "trial" || stage === "ordered" ? 1 : 15);',
    'const [points, setPoints] = useState(LIVE ? LIVE.points : stage === "card" ? 0 : stage === "trial" || stage === "ordered" ? 1 : 15);')
rep('const [log, setLog] = useState(stage === "ordered" || stage === "card" ? {} : stage === "trial" ? seedTrial() : seedOwn());',
    'const [log, setLog] = useState(LIVE ? LIVE.log : stage === "ordered" || stage === "card" ? {} : stage === "trial" ? seedTrial() : seedOwn());')
rep('const [myDose, setMyDoseRaw] = useState(() => { try { return JSON.parse(localStorage.getItem("gg-dose") || "null"); } catch (e) { return null; } });\n'
    '  const setMyDose = (v) => { setMyDoseRaw(v); try { if (v) localStorage.setItem("gg-dose", JSON.stringify(v)); else localStorage.removeItem("gg-dose"); } catch (e) {} };',
    'const [myDose, setMyDoseRaw] = useState(() => { if (LIVE) return LIVE.dose; try { return JSON.parse(localStorage.getItem("gg-dose") || "null"); } catch (e) { return null; } });\n'
    '  const setMyDose = (v) => { setMyDoseRaw(v); if (LIVE) { saveMyDose(v || null).catch(() => {}); return; } try { if (v) localStorage.setItem("gg-dose", JSON.stringify(v)); else localStorage.removeItem("gg-dose"); } catch (e) {} };')
rep('const [guardianEarned, setEarnedRaw] = useState(() => { try { return localStorage.getItem("gg-guardian") === "1"; } catch (e) { return false; } });\n'
    '  const setEarned = () => { setEarnedRaw(true); try { localStorage.setItem("gg-guardian", "1"); } catch (e) {} };',
    'const [guardianEarned, setEarnedRaw] = useState(() => { if (LIVE) return LIVE.guardian; try { return localStorage.getItem("gg-guardian") === "1"; } catch (e) { return false; } });\n'
    '  const setEarned = () => { setEarnedRaw(true); if (LIVE) { (LIVE.lastSave || Promise.resolve()).then(() => markGutGuardian()).catch(() => {}); return; } try { localStorage.setItem("gg-guardian", "1"); } catch (e) {} };')

# ── 4. Saves ─────────────────────────────────────────────────────────────────────────
rep('''    setLog((L) => { const t = { ...(L[key(TODAY)] || {}) }; t[slot] = true; t.slots = SLOTS; t.dose = dose; if (withProof) t.proof = true; return { ...L, [key(TODAY)]: t }; });''',
    '''    setLog((L) => { const t = { ...(L[key(TODAY)] || {}) }; t[slot] = true; t.slots = SLOTS; t.dose = dose; if (withProof) t.proof = true; return { ...L, [key(TODAY)]: t }; });
    if (LIVE) LIVE.lastSave = persistDose(isoDay(TODAY), slot === "lunch" ? "midday" : slot, true).then((r) => { if (r && r.ok === false) flash("Not saved. Check your connection."); }).catch(() => flash("Not saved. Check your connection."));''')
rep('''  const submitConsent = () => {''',
    '''  const submitConsent = () => {
    if (LIVE) persistStory({ about: story.trim() || Object.keys(changed).filter((k) => changed[k]).concat(customList).join(", "), relationship: who === "other" ? `${subjName.trim()} (${relation.trim()})` : undefined, days: String(daysField), capsules: String(capsField), outcomes: Object.keys(changed).filter((k) => changed[k]).concat(customList) }).catch(() => {});''')

# ── 4b. Final pass: no fake saves, no promises not yet built (lifestyle_final.py) ──
import lifestyle_final
lifestyle_final.apply(rep)
lifestyle_final.no_artifact_links_member(rep)
lifestyle_final.no_ship_text_promise(rep)

# ── 5. The demo bar is hidden in production ────────────────────────────────────────────
rep('''      {/* demo controls — not part of the product */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${B.edge}`, padding: "7px 12px" }}>''',
    '''      {/* demo controls — not part of the product */}
      <div style={{ display: DEMO ? "block" : "none", background: "#fff", borderBottom: `1px solid ${B.edge}`, padding: "7px 12px" }}>''')

# ── 6. Stories of Hope from the database: no city or time yet ──────────────────────────
rep('''{st.name} <span style={{ color: C.mute, fontWeight: 400, fontSize: 12 }}>· {st.city}</span></div>
                  <div className="inr" style={{ fontSize: 11.5, color: C.mute }}>Day {st.days} · {st.ago} ago</div>''',
    '''{st.name} {st.city ? <span style={{ color: C.mute, fontWeight: 400, fontSize: 12 }}>· {st.city}</span> : null}</div>
                  <div className="inr" style={{ fontSize: 11.5, color: C.mute }}>Day {st.days}{st.ago ? ` · ${st.ago} ago` : ""}</div>''')
rep('''{STORIES.slice(0, 6).map((st, i) => (''',
    '''{!STORIES.length ? <div className="inr" style={{ fontSize: 13, color: C.mute, padding: "6px 2px 10px" }}>No approved stories yet. Yours could be the first.</div> : null}
          {STORIES.slice(0, 6).map((st, i) => (''')
rep('[2, "Pay-ins this week"]', '[LIVE ? 0 : 2, "Pay-ins this week"]')

# ── 7. Entry: the page passes the member's data ────────────────────────────────────────
rep('createRoot(document.getElementById("root")).render(<LifestyleMember />);',
    '''/* Production entry. `live` comes from lib/lifestyle/load-prototype-member.ts (server, member's own session);
   `feed` from listFeedStories(). Without them (no Supabase env) the page runs on the prototype demo data. */
function applyLive(live, feed) {
  const plan = live.plan ? { ...live.plan, pay: "maya" /* the website shop pays through Maya */, start: new Date(live.plan.start), pausedUntil: live.plan.pausedUntil ? new Date(live.plan.pausedUntil) : null } : null;
  LIVE = { ...live, plan };
  if (live.cardNo) CARD_NO = live.cardNo;
  ME = { name: live.name || "Member", phone: live.mobile || "", city: "", sponsor: live.sponsor || "your sponsor", team: live.team || "", address: "", province: "" };
  STORIES = (feed || []).map((x) => ({ name: x.name || "Member", city: "", days: x.days, tags: x.outcomes || [], text: x.about, ago: "" }));
  STORIES_TOTAL = STORIES.length;
  NEW_STORIES = 0;
  TEAM = []; /* My Team comes from GEMA (Addendum 05, back-end task) */
}
let LIVE_SIG = "";
/** @param {{ live?: object | null, feed?: Array<{ name: string, about: string, outcomes: string[], days: string }> | null }} props */
export default function LifestyleMemberPage({ live = null, feed = null }) {
  /* one member's data never stays for the next one on the same phone: a new member remounts the page */
  const sig = live ? [live.cardNo, live.mobile, live.name].join("|") : "";
  if (live && !DEMO && LIVE_SIG !== sig) { applyLive(live, feed); LIVE_SIG = sig; }
  /* the page keys days by the date it loaded; after midnight, load again */
  useEffect(() => { const t = setInterval(() => { if (new Date().getDate() !== TODAY) window.location.reload(); }, 60000); return () => clearInterval(t); }, []);
  return <LifestyleMember key={sig || "demo"} />;
}''')

s = fix_fonts(s)
# speed: big embedded images become cached files in public/prototype/
s = extract_images(s, os.path.join(os.path.dirname(os.path.abspath(out)), "..", "..", "public", "prototype"))
open(out, "w", encoding="utf-8").write(s)
print("ported", len(s.splitlines()), "lines ->", out)
