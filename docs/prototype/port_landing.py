"""Turns the approved Lifestyle landing (lifestyle2/build/landing.jsx) into
components/prototype/LifestyleLanding.jsx for the GutGuard-Life-Style repo.

Production (default): sign-up and log-in use the One Account actions already in the repo
(signUp, confirmEmailCode, signIn). One Account needs an email and a password, so the sign-up
screen gains those two fields, and the 6-digit code arrives by email instead of SMS.
NEXT_PUBLIC_PROTOTYPE_DEMO=1 brings back the demo bar and the any-6-digit code.

Usage: python3 port/port_landing.py <landing.jsx> <out.jsx>
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


rep('import React, { useEffect, useMemo, useRef, useState } from "react";\nimport { createRoot } from "react-dom/client";',
    '"use client";\n'
    'import React, { useEffect, useMemo, useRef, useState } from "react";\n'
    'import { confirmEmailCode, resendEmailCode, signIn, signUp } from "@/lib/actions/auth";\n'
    'import { PASSWORD_HINT } from "@/lib/schemas/auth";\n'
    '/* Production port (Addendum 05). DEMO=1 brings back the prototype demo bar and any-6-digit code. */\n'
    'const DEMO = process.env.NEXT_PUBLIC_PROTOTYPE_DEMO === "1";\n'
    'const WEBSITE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL || "https://gutguard.ph").replace(/\\/$/, "");\n'
    'const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n'
    'const PASS_OK = (p) => p.length >= 8 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\\d/.test(p);')

# website links: same tab, real site
rep('const SITE = "https://claude.ai/artifact/EU7uvgH4zxnXT3E4DSpiRo";', 'const SITE = DEMO ? "https://claude.ai/artifact/EU7uvgH4zxnXT3E4DSpiRo" : WEBSITE_URL + "/";')
rep('const shopLink = (q) => ({ href: "https://claude.ai/artifact/EU7uvgH4zxnXT3E4DSpiRo#shop~who-card" + (q ? "~" + q : ""), target: "_blank", rel: "noopener" });',
    'const shopLink = (q) => (DEMO ? { href: "https://claude.ai/artifact/EU7uvgH4zxnXT3E4DSpiRo#shop~who-card" + (q ? "~" + q : ""), target: "_blank", rel: "noopener" } : { href: WEBSITE_URL + "/shop" + (q ? "?" + q.split("~").map((x) => x.replace("-", "=")).join("&") : "") });')

# referral: production reads ?ref=; the sponsor name lookup is a back-end task, so show the code only
rep('''  const h = typeof location !== "undefined" ? location.hash : "";
  return { from: "shop", ref: !h.includes("noref") };''',
    '''  const h = typeof location !== "undefined" ? location.hash : "";
  if (!DEMO) return { from: "shop", ref: false }; /* sponsor links: back-end task (Addendum 05) */
  return { from: "shop", ref: !h.includes("noref") };''')

# start on Log in when sent here from a protected page
rep('const [step, setStep] = useState(() => (typeof location !== "undefined" && location.hash.includes("login") ? "login" : "landing"));',
    'const [step, setStep] = useState(() => (typeof location !== "undefined" && (location.hash.includes("login") || /[?&]login\\b/.test(location.search)) ? "login" : "landing"));')
rep('const [form, setForm] = useState({ name: "", mobile: "", email: "", code: "" });',
    'const [form, setForm] = useState({ name: "", mobile: "", email: "", code: "", password: "", ident: "" });\n'
    '  const [busy, setBusy] = useState(false);\n'
    '  const [err, setErr] = useState("");')
rep('const canRegister = form.name.trim().length > 1 && digits.length >= 10 && agree;',
    'const canRegister = form.name.trim().length > 1 && digits.length >= 10 && agree && (DEMO || (EMAIL_RE.test(form.email.trim()) && PASS_OK(form.password)));\n'
    '  /* One Account actions. A successful sign-in or confirmed code redirects on the server. */\n'
    '  const run = async (fn, onOk) => { setBusy(true); setErr(""); try { const r = await fn(); if (r && r.ok === false) { setErr(r.fieldErrors ? Object.values(r.fieldErrors)[0] || r.error : r.error); if (r.needsConfirm) { setForm((f) => ({ ...f, email: f.email || (EMAIL_RE.test(f.ident.trim()) ? f.ident.trim() : "") })); setOtp(""); setStep("otp"); } } else if (onOk) onOk(r); } catch (e) { if (e && e.digest && String(e.digest).startsWith("NEXT_REDIRECT")) throw e; setErr("Could not complete that just now. Try again."); } finally { setBusy(false); } };\n'
    '  const doSignUp = () => run(() => signUp({ name: form.name.trim(), mobile: form.mobile, email: form.email.trim(), password: form.password }), (r) => { if (r && r.mode === "mock") { setWelcome(true); setFire((f) => f + 1); } else { setOtp(""); setStep("otp"); } });\n'
    '  const doConfirm = () => run(() => confirmEmailCode({ email: form.email.trim(), code: otp }));\n'
    '  const doSignIn = () => run(() => signIn({ identifier: form.ident.trim(), password: form.password }));')

# sign-up: email and password fields (One Account), code by email
rep('''note="We send a code to this number. Abroad? Start with + and your country code." />''',
    '''note={DEMO ? "We send a code to this number. Abroad? Start with + and your country code." : "Your card uses this number."} />
            {!DEMO ? <>
              <Field id="gg-em" label="Email" type="email" autoComplete="email" placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} note="We send your 6-digit code here." />
              <Field id="gg-pw" label="Password" type="password" autoComplete="new-password" placeholder="Choose a password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} note={PASSWORD_HINT + " The same password opens GEMA and the Academy."} />
            </> : null}''')
rep('''            {hasRef || showCode
              ? <Field id="gg-cd"''', '''            {!DEMO ? null : hasRef || showCode
              ? <Field id="gg-cd"''')
rep('''<button className="tap" disabled={!canRegister} onClick={() => { setOtp(""); setStep("otp"); }} style={{ ...cta, background: canRegister ? C.blue : "#c3ccd8" }}>Get my card</button>
          <p className="inr" style={{ fontSize: 12, color: C.mute, textAlign: "center", marginTop: 9 }}><b style={{ color: C.good }}>Free.</b> No payment · No password · 10 seconds</p>''',
    '''{err && step === "register" ? <div role="alert" className="inr" style={{ fontSize: 13, color: C.clay, margin: "10px 2px 0" }}>{err}</div> : null}
          <button className="tap" disabled={!canRegister || busy} onClick={() => { if (DEMO) { setOtp(""); setStep("otp"); } else doSignUp(); }} style={{ ...cta, background: canRegister && !busy ? C.blue : "#c3ccd8" }}>{busy ? "One moment…" : "Get my card"}</button>
          <p className="inr" style={{ fontSize: 12, color: C.mute, textAlign: "center", marginTop: 9 }}><b style={{ color: C.good }}>Free.</b> {DEMO ? "No payment · No password · 10 seconds" : "No payment · 1 minute"}</p>''')
rep('''<p className="inr" style={{ fontSize: 12, color: C.mute, textAlign: "center", marginTop: 9 }}><b style={{ color: C.good }}>Free.</b> No payment to join · No password</p>''',
    '''<p className="inr" style={{ fontSize: 12, color: C.mute, textAlign: "center", marginTop: 9 }}><b style={{ color: C.good }}>Free.</b> No payment to join{DEMO ? " · No password" : ""}</p>''')

# code / log in
rep('''{step === "login" ? "Log in with your mobile number" : "Enter your 6-digit code"}</div>
            {step === "login" && <div style={{ marginTop: 12 }}><Field id="gg-lg" label="Mobile number" type="tel" placeholder="0917 123 4567" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: fmtMobile(e.target.value) })} /></div>}
            <div className="inr" style={{ fontSize: 13.5, color: C.mute, marginTop: step === "login" ? 0 : 6, lineHeight: 1.5 }}>We sent a code by SMS to <b style={{ color: C.navy }}>{form.mobile || "your number"}</b>.</div>
            <input inputMode="numeric"''',
    '''{step === "login" ? (DEMO ? "Log in with your mobile number" : "Log in") : "Enter your 6-digit code"}</div>
            {step === "login" && DEMO && <div style={{ marginTop: 12 }}><Field id="gg-lg" label="Mobile number" type="tel" placeholder="0917 123 4567" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: fmtMobile(e.target.value) })} /></div>}
            {step === "login" && !DEMO && <div style={{ marginTop: 12 }}>
              <Field id="gg-lg" label="Email or OneGrinders username" type="text" autoComplete="username" placeholder="you@email.com" value={form.ident} onChange={(e) => setForm({ ...form, ident: e.target.value })} />
              <Field id="gg-lp" label="Password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} note="The same password opens GEMA and the Academy." />
            </div>}
            {DEMO || step === "otp" ? <div className="inr" style={{ fontSize: 13.5, color: C.mute, marginTop: step === "login" ? 0 : 6, lineHeight: 1.5 }}>{DEMO ? <>We sent a code by SMS to <b style={{ color: C.navy }}>{form.mobile || "your number"}</b>.</> : <>We sent a code to <b style={{ color: C.navy }}>{form.email}</b>.</>}</div> : null}
            {DEMO || step === "otp" ? <input inputMode="numeric"''')
rep('''letterSpacing: ".5em", fontSize: 24, fontWeight: 700, color: C.navy }} />
            <div className="inr" style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginTop: 10 }}>
              <button style={{ color: C.blue, fontWeight: 600 }}>Send again (in 30s)</button>
              {form.email && <button style={{ color: C.blue, fontWeight: 600 }}>Send to my email</button>}
            </div>
          </div>
          <div className="inr" style={{ fontSize: 11, color: C.mute, marginTop: 8, textAlign: "center" }}>Demo: type any 6 digits.</div>
          <button className="tap" disabled={otp.length !== 6} onClick={() => {''',
    '''letterSpacing: ".5em", fontSize: 24, fontWeight: 700, color: C.navy }} /> : null}
            {DEMO ? <div className="inr" style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginTop: 10 }}>
              <button style={{ color: C.blue, fontWeight: 600 }}>Send again (in 30s)</button>
              {form.email && <button style={{ color: C.blue, fontWeight: 600 }}>Send to my email</button>}
            </div> : step === "otp" ? <div className="inr" style={{ fontSize: 12.5, marginTop: 10 }}><button onClick={() => run(() => resendEmailCode({ email: form.email.trim() }), () => flash("Code sent again"))} style={{ color: C.blue, fontWeight: 600 }}>Send the code again</button></div> : null}
            {err && step !== "register" ? <div role="alert" className="inr" style={{ fontSize: 13, color: C.clay, marginTop: 10 }}>{err}</div> : null}
          </div>
          {DEMO ? <div className="inr" style={{ fontSize: 11, color: C.mute, marginTop: 8, textAlign: "center" }}>Demo: type any 6 digits.</div> : null}
          <button className="tap" disabled={busy || (DEMO || step === "otp" ? otp.length !== 6 : !(form.ident.trim() && form.password))} onClick={() => {
            if (!DEMO) { if (step === "login") doSignIn(); else doConfirm(); return; }''')
rep('''}} style={{ ...cta, background: otp.length === 6 ? C.blue : "#c3ccd8" }}>{step === "login" ? "Log in" : "Confirm"}</button>''',
    '''}} style={{ ...cta, background: (DEMO || step === "otp" ? otp.length === 6 : form.ident.trim() && form.password) && !busy ? C.blue : "#c3ccd8" }}>{busy ? "One moment…" : step === "login" ? "Log in" : "Confirm"}</button>''')

# demo bar hidden in production
rep('''      {/* demo controls — not part of the product (same bar as the member page) */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${B.edge}`, padding: "7px 12px" }}>''',
    '''      {/* demo controls — not part of the product (same bar as the member page) */}
      <div style={{ display: DEMO ? "block" : "none", background: "#fff", borderBottom: `1px solid ${B.edge}`, padding: "7px 12px" }}>''')

# speed: the landing is drawn on the server, so its first render must match the browser's
rep('''  const [w, setW] = useState(() => typeof matchMedia !== "undefined" && matchMedia(WIDE_Q).matches);
  useEffect(() => { const m = matchMedia(WIDE_Q); const f = () => setW(m.matches); f(); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, []);
  return w;''', '''  /* server and first browser render: phone layout; then the real width, without a hydration mismatch */
  return React.useSyncExternalStore(
    (cb) => { const m = matchMedia(WIDE_Q); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => matchMedia(WIDE_Q).matches,
    () => false,
  );''')
rep('function LifestyleLanding() {', '/** @param {{ initialLogin?: boolean }} props */\nfunction LifestyleLanding({ initialLogin = false } = {}) {')
rep('''const [step, setStep] = useState(() => (typeof location !== "undefined" && (location.hash.includes("login") || /[?&]login\\b/.test(location.search)) ? "login" : "landing"));''',
    '''const [step, setStep] = useState(() => (initialLogin || (DEMO && typeof location !== "undefined" && location.hash.includes("login")) ? "login" : "landing"));''')
import lifestyle_final
lifestyle_final.apply_landing(rep)
lifestyle_final.no_artifact_links_landing(rep)
rep('createRoot(document.getElementById("root")).render(<LifestyleLanding />);', 'export default LifestyleLanding;')

s = fix_fonts(s)
# speed: big embedded images become cached files in public/prototype/
s = extract_images(s, os.path.join(os.path.dirname(os.path.abspath(out)), "..", "..", "public", "prototype"))
open(out, "w", encoding="utf-8").write(s)
print("ported", len(s.splitlines()), "lines ->", out)
