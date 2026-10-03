"""Final pass (Addendum 05): no fake saves and no promises the back end cannot keep yet.

Plan changes and reward redemptions become requests for Gutguard to confirm (member_requests).
The weekly check-in and the reminder times stay on this phone. The ₱499 trial credit is not
promised until task 7 is built. Used by port_lifestyle.py.
"""


def apply(rep):
    rep('import { markGutGuardian, saveMyDose } from "@/lib/actions/lifestyle";',
        'import { markGutGuardian, requestChange, saveMyDose } from "@/lib/actions/lifestyle";\n'
        '/* production: a request for Gutguard to confirm, never a change that only shows on screen */\n'
        'const sendRequest = (kind, detail, flash) => requestChange({ kind, detail })'
        '.then((r) => flash(r && r.ok === false ? "Not sent. Check your connection." : "Request sent · Gutguard confirms it before your next refill"))'
        '.catch(() => flash("Not sent. Check your connection."));')

    rep('  const saveChange = () => {\n    if (builder.mode === "goal" && bGoal !== plan.goal) setGoalChanged(true);',
        '  const saveChange = () => {\n'
        '    if (LIVE) { sendRequest(builder.mode === "goal" ? "goal" : "payment", { goal: bGoal, freq: bFreq }, flash); setBuilder(null); return; }\n'
        '    if (builder.mode === "goal" && bGoal !== plan.goal) setGoalChanged(true);')

    for old, kind, detail in [
        ('onClick={() => { setPlan((p) => ({ ...p, skips: p.skips + 1 })); setSheetOpen(null); flash("Next refill skipped"); }}', "skip", "{}"),
        ('onClick={() => { setPlan((p) => ({ ...p, status: "paused", pausedUntil: addDays(now, pauseDays) })); setSheetOpen(null); flash(`Plan paused for ${pauseDays} days`); }}', "pause", "{ days: pauseDays }"),
        ('onClick={() => { setPlan((p) => ({ ...p, pay: payPick })); setSheetOpen(null); flash(payPick === "gcash" ? "Saved · pay links will come by SMS" : `Saved · ${PAY[payPick].label} confirmed`); }}', "payment", "{ method: payPick }"),
        ('onClick={() => { setPlan((p) => ({ ...p, status: "cancelled" })); setSheetOpen(null); flash("Plan cancelled"); }}', "cancel", "{ reason: leaveWhy }"),
    ]:
        rep(old, old.replace("onClick={() => { ", 'onClick={() => { if (LIVE) { sendRequest("' + kind + '", ' + detail + ', flash); setSheetOpen(null); return; } ', 1))

    rep('onClick={() => { setPoints((p) => p - r.pts); flash(`Reward saved · ${r.note.toLowerCase()}`); }}',
        'onClick={() => { if (LIVE) { sendRequest("redeem", { reward: r.id, points: r.pts }, flash); return; } setPoints((p) => p - r.pts); flash(`Reward saved · ${r.note.toLowerCase()}`); }}')

    rep('onClick={() => { setFeelSaved(true); flash("Saved · next check in 7 days"); }}',
        'onClick={() => { setFeelSaved(true); if (LIVE) { try { localStorage.setItem("gg-feel-" + isoDay(TODAY), JSON.stringify(feel)); } catch (e) {} flash("Saved on this phone · next check in 7 days"); return; } flash("Saved · next check in 7 days"); }}')

    rep('const [times, setTimes] = useState({ morning: "07:00", lunch: "12:30", dreams: "21:00" });',
        'const [times, setTimes] = useState(() => { try { const t = JSON.parse(localStorage.getItem("gg-times") || "null"); if (t && t.morning) return t; } catch (e) {} return { morning: "07:00", lunch: "12:30", dreams: "21:00" }; }); /* reminder times: kept on this phone */')
    rep('onClick={() => { setSheetOpen(null); flash("Settings saved"); }}',
        'onClick={() => { try { localStorage.setItem("gg-times", JSON.stringify(times)); } catch (e) {} setSheetOpen(null); flash("Settings saved"); }}')

    # the ₱499 trial credit is not given yet (task 7)
    rep('Choose your goal. We show how many blisters you need. Your <b style={{ color: C.ink }}>{peso(TRIAL_CREDIT)} credit</b> comes off your first monthly order.',
        'Choose your goal. We show how many blisters you need.{DEMO ? <> Your <b style={{ color: C.ink }}>{peso(TRIAL_CREDIT)} credit</b> comes off your first monthly order.</> : null}')
    rep('{isTrial && builder.mode === "new" && <div', '{DEMO && isTrial && builder.mode === "new" && <div')
    rep('<div className="inr" style={{ fontSize: 12.5, color: C.mute, marginTop: 8 }}>Your {peso(TRIAL_CREDIT)} comes off your first month.</div>',
        '{DEMO ? <div className="inr" style={{ fontSize: 12.5, color: C.mute, marginTop: 8 }}>Your {peso(TRIAL_CREDIT)} comes off your first month.</div> : null}')
    rep('const creditOk = isTrial && bFreq === "monthly";', 'const creditOk = DEMO && isTrial && bFreq === "monthly";')


def apply_landing(rep):
    rep('If you continue with a monthly plan, the {peso(TRIAL_PRICE)} comes off your first month.',
        '{DEMO ? <>If you continue with a monthly plan, the {peso(TRIAL_PRICE)} comes off your first month.</> : "Then choose a monthly plan when you are ready."}')
    # from the website Done screen (?join=shop): open the sign-up step
    rep('/** @param {{ initialLogin?: boolean }} props */\nfunction LifestyleLanding({ initialLogin = false } = {}) {',
        '/** @param {{ initialLogin?: boolean, initialJoin?: boolean }} props */\nfunction LifestyleLanding({ initialLogin = false, initialJoin = false } = {}) {')
    rep('useState(() => (initialLogin || (DEMO && typeof location !== "undefined" && location.hash.includes("login")) ? "login" : "landing"))',
        'useState(() => (initialLogin || (DEMO && typeof location !== "undefined" && location.hash.includes("login")) ? "login" : initialJoin ? "register" : "landing"))')


def no_artifact_links_member(rep):
    """No claude.ai prototype links in production, even unused ones."""
    rep('const SITE_SHOP = "https://claude.ai/artifact/EU7uvgH4zxnXT3E4DSpiRo#/shop";',
        'const SITE_SHOP = DEMO ? "https://claude.ai/artifact/EU7uvgH4zxnXT3E4DSpiRo#/shop" : WEBSITE_URL + "/shop";')


def no_artifact_links_landing(rep):
    rep('const INVITE_URL = "https://claude.ai/artifact/9tPTTKyCSRCkaeFwuMku3J";',
        'const INVITE_URL = DEMO ? "https://claude.ai/artifact/9tPTTKyCSRCkaeFwuMku3J" : "/";')
    rep('<a href={"https://claude.ai/artifact/GGYfp5cEpWgJDezFRfKrWK#" + handoff}',
        '<a href={DEMO ? "https://claude.ai/artifact/GGYfp5cEpWgJDezFRfKrWK#" + handoff : "/app"}')


def no_ship_text_promise(rep):
    """The shipping text message is not built yet (Addendum 05, task 3)."""
    rep('{courier === "paid" ? "10 capsules. We text you when it ships." :',
        '{courier === "paid" ? (DEMO ? "10 capsules. We text you when it ships." : "10 capsules. Night 1 starts the day it is delivered.") :')


def last_fake_saves(rep):
    """Second review: Resume and dose Undo saved nothing; app buttons opened nothing;
    phone-kept settings were shared between members on one phone."""
    rep('onClick={() => { setPlan((p) => ({ ...p, status: "active", pausedUntil: null, start: new Date(now) })); flash("Welcome back · plan resumed"); }}',
        'onClick={() => { if (LIVE) { sendRequest("resume", {}, flash); return; } setPlan((p) => ({ ...p, status: "active", pausedUntil: null, start: new Date(now) })); flash("Welcome back · plan resumed"); }}')
    rep('onClick={() => { setLog((L) => { const t = { ...(L[key(TODAY)] || {}) }; delete t[s]; return { ...L, [key(TODAY)]: t }; }); flash(`${META[s].label} undone`); }}',
        'onClick={() => { setLog((L) => { const t = { ...(L[key(TODAY)] || {}) }; delete t[s]; return { ...L, [key(TODAY)]: t }; }); if (LIVE) persistDose(isoDay(TODAY), s === "lunch" ? "midday" : s, false).catch(() => {}); flash(`${META[s].label} undone`); }}')
    rep('onClick={() => flash(`Opening ${a.name}...`)}',
        'onClick={() => { const u = LIVE ? ({ gema: process.env.NEXT_PUBLIC_GEMA_URL, academy: process.env.NEXT_PUBLIC_ACADEMY_URL })[a.id] : null; if (u) { window.location.href = u; return; } flash(LIVE ? `${a.name} opens here soon` : `Opening ${a.name}...`); }}')
    rep('sendRequest(builder.mode === "goal" ? "goal" : "payment", { goal: bGoal, freq: bFreq }, flash)',
        'sendRequest(builder.mode === "goal" ? "goal" : "plan", { goal: bGoal, freq: bFreq }, flash)')
    # phone-kept settings belong to the member, not to the phone
    rep('localStorage.getItem("gg-times")', 'localStorage.getItem("gg-times" + (LIVE ? "-" + LIVE.cardNo : ""))')
    rep('localStorage.setItem("gg-times", JSON.stringify(times))', 'localStorage.setItem("gg-times" + (LIVE ? "-" + LIVE.cardNo : ""), JSON.stringify(times))')
    rep('localStorage.setItem("gg-feel-" + isoDay(TODAY), JSON.stringify(feel))', 'localStorage.setItem("gg-feel-" + LIVE.cardNo + "-" + isoDay(TODAY), JSON.stringify(feel))')


def toast_timer(rep):
    """A new message is not cleared early by the previous message's timer."""
    rep('const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2300); };',
        'const toastTimer = useRef(0);\n  const flash = (m) => { setToast(m); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(""), 2300); };')
