"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { confirmEmailCode, resendEmailCode, signIn, signUp } from "@/lib/actions/auth";
import { PASSWORD_HINT } from "@/lib/schemas/auth";
/* Production port (Addendum 05). DEMO=1 brings back the prototype demo bar and any-6-digit code. */
const DEMO = process.env.NEXT_PUBLIC_PROTOTYPE_DEMO === "1";
const WEBSITE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL || "https://gutguard.ph").replace(/\/$/, "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASS_OK = (p) => p.length >= 8 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p);
import { flushSync } from "react-dom";
const WORDMARK_SRC = "/prototype/wordmark-src.webp";
const G_WATERMARK = "/prototype/g-watermark.webp";
const B = {
    royal: "#00249C",      // the jewel — card & welcome only, never chrome
    blueLift: "#0A31B4",
    blue: "#0608A9",       // app blue — links, focus, accents
    navy: "#141019",
    brand: "#0608A9",
    brandD: "#03044F",
    silver: "#DFD7D5",
    white: "#FFFFFF",
    field: "#F4F1EA",      // canvas — now LIGHT (was #050B33)
    paper: "#FCFAF5",      // cards & sheets — white (was cream #F4F2EC)
    ink: "#141019",        // primary text on light
    ledger: "#6B6B7A",     // secondary text on light
    edge: "#E2DCCD",       // hairlines / card borders
    amber: "#f5b716",      // gold — rewards + primary CTA
    amberDeep: "#c9890a",
    red: "#B5431F",        // clay — SAYANG
    green: "#1E6FB8",      // good — attended / started
};
const CARD_NO = "0240 5578 9012 3456";
const Style = () => (<style>{`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; }
    html, body { overflow-x: hidden; max-width: 100%; }
    body { background: ${B.field}; -webkit-font-smoothing: antialiased; overscroll-behavior-y: none; }
    img, svg { max-width: 100%; }
    .g-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
    .g { font-family: var(--font-inter-tight),'Inter Tight', system-ui, sans-serif; color: ${B.ink}; }
    .g-w { font-family: var(--font-inter-tight),'Inter Tight', system-ui, sans-serif; }
    .g-m { font-family: var(--font-inter-tight),'Inter Tight', system-ui, sans-serif; }
    .g-ant { font-family: var(--font-fraunces),'Fraunces', system-ui, sans-serif; letter-spacing: .2px; }
    .g-round { font-family: var(--font-inter-tight),'Inter Tight', system-ui, sans-serif; }
    .g i { font-style: normal; font-weight: 600; }
    button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; text-align: inherit; }
    button:focus-visible { outline: 2px solid ${B.amber}; outline-offset: 3px; border-radius: 4px; }
    input:focus-visible { outline: 2px solid ${B.blue}; outline-offset: 1px; }

    @media (prefers-reduced-motion: no-preference) {
      .g-rise  { animation: gRise .5s cubic-bezier(.2,.8,.2,1) both; }
      .g-sheet { animation: gSheet .34s cubic-bezier(.2,.9,.2,1) both; }
      .g-press { transition: transform .14s ease, box-shadow .14s ease; }
      .g-spin  { transition: transform .8s cubic-bezier(.36,.05,.26,1); }
      .g-press:active { transform: translateY(1px) scale(.99); }
      .g-bigin { width: 100%; height: 60px; border: 2px solid #dbe1ea; border-radius: 14px; padding: 0 18px;
                 font-family: var(--font-inter-tight),'Inter Tight',system-ui,sans-serif; font-size: 19px; font-weight: 600; background: #fff; outline: none;
                 transition: border-color .15s ease; }
      .g-bigin:focus { border-color: #00249C; }
      .g-bigin::placeholder { color: #aab3c2; font-weight: 500; }
      .g-cta   { animation: gPulse 2.6s ease-in-out infinite; }
      .g-shine::after {
        content: ""; position: absolute; top: 0; bottom: 0; width: 42%;
        background: linear-gradient(100deg, transparent, rgba(255,255,255,.75), transparent);
        animation: gShine 3.6s ease-in-out infinite;
      }
      .g-breathe { animation: gBreathe 3.2s ease-in-out infinite; }
      .g-pts  { animation: gPts 4.6s cubic-bezier(.34,1.4,.5,1) infinite; transform-origin: center bottom; will-change: transform; }
      .g-hero { animation: gHero .82s cubic-bezier(.2,.9,.25,1) both; }
      .fx-fall    { animation: fxFall 1.5s cubic-bezier(.3,.5,.6,1) forwards; }
      .fx-burst   { animation: fxBurst 1.05s cubic-bezier(.15,.7,.3,1) forwards; }
      .fx-twinkle { animation: fxTwinkle 1.15s ease-out forwards; }
    }
    @keyframes gRise  { from { opacity: 0; transform: translateY(14px) } }
    @media (prefers-reduced-motion: no-preference) {
      .w-pop { animation: wPop .62s cubic-bezier(.2,1.35,.35,1) both; }
    }
    @keyframes wPop {
      from { opacity: 0; transform: translateY(20px) scale(.86) }
      to   { opacity: 1; transform: translateY(0) scale(1) }
    }
    @media (prefers-reduced-motion: no-preference) {
      .t-drop { animation: tDrop .42s cubic-bezier(.2,1.2,.35,1) both; }
    }
    @keyframes tDrop {
      from { opacity: 0; transform: translate(-50%, -22px) }
      to   { opacity: 1; transform: translate(-50%, 0) }
    }
    .t-drop { transform: translateX(-50%); }
    @keyframes gSheet { from { opacity: 0; transform: translateY(26px) } }
    @keyframes gBreathe { 0%,100% { opacity: .55 } 50% { opacity: .95 } }
    @keyframes gHero { 0%   { opacity: 0; transform: scale(.82) translateY(8px); filter: blur(3px); }
                       48%  { opacity: 1; transform: scale(1.07) translateY(0);  filter: blur(0); }
                       68%  { transform: scale(.985); }
                       84%  { transform: scale(1.02); }
                       100% { opacity: 1; transform: scale(1); } }
    @keyframes gPts { 0%,72%,100% { transform: translateY(0) scale(1); }
                      80% { transform: translateY(-4px) scale(1.045); }
                      88% { transform: translateY(0) scale(.995); }
                      94% { transform: translateY(-1px) scale(1.01); } }
    /* the card turns a full circle on its own axis each press */
    .g-stage { perspective: 1400px; }
    .g-3d    { transform-style: preserve-3d; position: relative; }
    .g-face  { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
    @keyframes gShine { 0% { left: -50% } 55%,100% { left: 120% } }
      to   { transform: rotateY(360deg) }
    }
    @keyframes gPulse {
      0%,100% { box-shadow: 0 12px 30px -10px rgba(255,196,46,.55) }
      50%     { box-shadow: 0 12px 42px -6px rgba(255,196,46,.95) }
    }
    @keyframes fxFall {
      0%   { transform: translate(0,0) rotate(0); opacity: 1 }
      100% { transform: translate(var(--dx), 108vh) rotate(var(--rot)); opacity: .85 }
    }
    @keyframes fxBurst {
      0%   { transform: translate(-50%,-50%) scale(.4); opacity: 1 }
      100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dx) * .55)) scale(0); opacity: 0 }
    }
    @keyframes fxTwinkle {
      0%   { transform: scale(0) rotate(0); opacity: 0 }
      35%  { transform: scale(1.25) rotate(var(--rot)); opacity: 1 }
      100% { transform: scale(0) rotate(var(--rot)); opacity: 0 }
    }
  `}</style>);
/* ------------------------------------------------------------------ */
/* The QR — this is the door check-in (spec §5)                        */
/* ------------------------------------------------------------------ */
const QR = ({ seed, size = 64 }) => {
    const cells = useMemo(() => {
        const N = 21;
        let x = 7;
        for (let i = 0; i < seed.length; i++)
            x = (x * 31 + seed.charCodeAt(i)) % 99991;
        const g = Array.from({ length: N }, () => Array(N).fill(false));
        for (let r = 0; r < N; r++)
            for (let c = 0; c < N; c++) {
                x = (x * 1103515245 + 12345) % 2147483648;
                g[r][c] = ((x >> 16) & 1) === 1;
            }
        const finder = (r0, c0) => {
            for (let i = -1; i <= 7; i++)
                for (let j = -1; j <= 7; j++) {
                    const r = r0 + i, c = c0 + j;
                    if (r < 0 || c < 0 || r >= N || c >= N)
                        continue;
                    const edge = i === 0 || i === 6 || j === 0 || j === 6;
                    const core = i >= 2 && i <= 4 && j >= 2 && j <= 4;
                    g[r][c] = edge || core;
                }
        };
        finder(0, 0);
        finder(0, N - 7);
        finder(N - 7, 0);
        return g;
    }, [seed]);
    const N = cells.length, s = size / N;
    return (<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ display: "block", borderRadius: 3 }}>
      <rect width={size} height={size} fill={B.royal}/>
      {cells.map((row, r) => row.map((on, c) => on ? <rect key={`${r}-${c}`} x={c * s} y={r * s} width={s} height={s} fill={B.white}/> : null))}
    </svg>);
};
/* ------------------------------------------------------------------ */
/* The card                                                            */
/* ------------------------------------------------------------------ */
const C = {
  // GEMA design tokens, copied exactly
  navy: "#141019", blue: "#0608A9", sky: "#C3CEDC", paper: "#F4F1EA", card: "#FCFAF5",
  ink: "#141019", mute: "#6B6B7A", gold: "#C9AC7E", line: "#E2DCCD",
  good: "#1E6FB8", goodBg: "#E6EFF8", goodLt: "#C9DDF0", miss: "#EBD3C9", clay: "#B5431F",
  sms: "#0608A9", call: "#1E6FB8", messenger: "#0A7CFF", viber: "#7360F2",
  brand: "#0608A9", brandD: "#03044F", goldD: "#7E6035", cta: "#0608A9", onCta: "#FCFAF5", choice: "#EEEEFA",
};
const HERO = "linear-gradient(160deg, #15263B, #0E1A2B)";
const inkOn = (bg) => (bg === C.gold ? C.navy : "#fff");
const WD = ["S", "M", "T", "W", "T", "F", "S"];
const now = new Date();
const Y = now.getFullYear(), M = now.getMonth(), TODAY = now.getDate();
const key = (d) => `${Y}-${M + 1}-${d}`;

function seedOwn() {
  const log = {};
  const pat = { 1: [1,1], 2: [1,1], 3: [1,0], 5: [1,1], 6: [1,0], 8: [1,1], 9: [1,1] };
  Object.entries(pat).forEach(([b, a]) => { const d = TODAY - Number(b); if (d >= 1) log[key(d)] = { morning: !!a[0], dreams: !!a[1], proof: Number(b) % 2 === 0 }; });
  return log;
}
function genTeamLog(rule) {
  const log = {};
  for (let b = 0; b <= 27; b++) { const d = TODAY - b; if (d < 1) break; if (rule(b)) log[key(d)] = { taken: true, proof: b % 2 === 0 }; }
  return log;
}
const STORIES_TOTAL = 1247;
const NEW_STORIES = 5; // new Stories of Hope since the member last opened the tab // total Stories of Hope posted community-wide
const STORIES = [
  { name: "Lola Remy", city: "Davao City", days: 88, tags: ["Better sleep", "More energy"], text: "Mas magaan ang pakiramdam ko tuwing umaga, at nakakatulog na ako nang maayos.", ago: "2h" },
  { name: "Mark A.", city: "General Santos", days: 61, tags: ["Better digestion"], text: "Hindi na ako madalas mabusog agad. Mas okay na ang tiyan ko.", ago: "5h" },
  { name: "Aling Cora", city: "Tagum", days: 90, tags: ["Less discomfort", "More active"], text: "Nakakalakad na ulit ako sa palengke nang hindi napapagod agad.", ago: "8h" },
  { name: "JP Reyes", city: "Digos", days: 45, tags: ["Better mood", "Better sleep"], text: "Mas maganda ang mood ko these days, and I sleep deeper.", ago: "12h" },
  { name: "Nanay Fe", city: "Panabo", days: 74, tags: ["More energy"], text: "May energy na ako para sa mga apo ko buong araw.", ago: "1d" },
  { name: "Ronnie M.", city: "Davao City", days: 30, tags: ["Better digestion", "Better appetite"], text: "Bumalik ang gana ko sa pagkain, at mas okay ang digestion.", ago: "1d" },
  { name: "Tita Beth", city: "Mati", days: 120, tags: ["Clearer skin", "More energy"], text: "Napansin ng mga kaibigan ko na mas fresh daw ang itsura ko.", ago: "2d" },
  { name: "Kuya Dan", city: "Kidapawan", days: 52, tags: ["Calmer / focused"], text: "Mas focused ako sa trabaho, hindi na masyadong pagod.", ago: "2d" },
  { name: "Ate Glory", city: "Davao City", days: 67, tags: ["Better sleep"], text: "Solid na ang tulog ko gabi-gabi, salamat Gutguard.", ago: "3d" },
  { name: "Sir Ed", city: "Tacurong", days: 39, tags: ["More active", "Better mood"], text: "Mas active at masaya ako ngayon kaysa dati.", ago: "3d" },
];
const TEAM = [
  { name: "Grace", via: null, phone: "+639170001111", messenger: "grace.lim", defaultCh: "messenger", capsLeft: 40, log: genTeamLog(() => true) },
  { name: "Nita", via: "Jun", phone: "+639170003333", messenger: "jun.v", defaultCh: "call", capsLeft: 20, log: genTeamLog((b) => b !== 0 && b !== 3) },
  { name: "Boy", via: null, phone: "+639170004444", messenger: "boy.mendoza", defaultCh: "sms", capsLeft: 4, log: genTeamLog((b) => b >= 2) },
  { name: "Cora", via: "Malou", phone: "+639170005555", messenger: "malou.reyes", defaultCh: "messenger", capsLeft: 80, log: genTeamLog((b) => b >= 4) },
];
function analyze(log) {
  let last = null;
  for (let b = 0; b <= 27; b++) { if (log[key(TODAY - b)]?.taken) { last = b; break; } }
  const m3 = [0,1,2].filter((b) => TODAY - b >= 1 && !log[key(TODAY - b)]?.taken).length;
  let streak = 0;
  for (let b = 0; b <= 27; b++) { if (log[key(TODAY - b)]?.taken) streak++; else break; }
  let status = "drinking";
  if (last === null || last >= 3) status = "stopped"; else if (m3 >= 1) status = "slipping";
  return { last, streak, status };
}
const ST = { drinking: { label: "Drinking", tone: C.good }, slipping: { label: "Slipping", tone: C.gold }, stopped: { label: "Stopped", tone: C.clay } };
const ORDER = { stopped: 0, slipping: 1, drinking: 2 };
const refillOf = (dl) => dl <= 1 ? { tone: C.clay, label: `Refill now - ${dl} day left` } : dl <= 5 ? { tone: C.gold, label: `Refill soon - ${dl} days left` } : dl <= 10 ? { tone: C.blue, label: `Refill in ${dl} days` } : null;
const template = (name, via, status, rf) => {
  const who = via || name;
  if (status === "stopped") return `Kumusta ${who}? Namiss ka namin - balik tayo, sayang ang progress!`;
  if (rf && rf.tone !== C.blue) return `${who}, paubos na ang Gutguard mo. Mag-reorder na para walang gap sa streak.`;
  if (status === "slipping") return `Uy ${who}, may na-miss kang araw. Wag bibitaw - malapit na ang results!`;
  return `${who}, heads up - paubos na ang supply mo. Baka gusto mo nang mag-reorder.`;
};

/* ================================================================== */
/* Gutguard Lifestyle — Member page (Addendum 02)                      */
/* Built on MemberDashboard + MemberCard (GutguardLifestyleRewards)    */
/* and the Gutguard Daily app (dose cards, calendar, team, stories).   */
/* ================================================================== */

const ME = { name: "Rey Aquino", phone: "0917 111 2233", city: "Davao City", sponsor: "Ana Cruz", address: "12 Rizal St., Lagao, General Santos City", province: "South Cotabato" };
/* One-time items (Addendum 01 prices). 1 blister = 10 capsules = 1 E-Point; bottle = 3 E-Points */
const peso = (n) => "₱" + n.toLocaleString("en-PH");

/* Dose by goal — Addendum 01, Section 3. Reveille = morning, Taps = night. */
const META = {
  morning: { label: "Reveille", note: "before meals · empty stomach" },
  lunch: { label: "Midday", note: "after lunch" },
  dreams: { label: "Taps", note: "before bedtime" },
};
const DOSE_KEYS = ["morning", "lunch", "dreams"];
const INVITE_URL = DEMO ? "https://claude.ai/artifact/9tPTTKyCSRCkaeFwuMku3J" : "/"; /* production: gutguard.ph/lifestyle/join?ref=[member code] */
const GOALS = {
  keep:   { label: "Keep healthy",  level: "Maintenance", glis: "GLIS Moderate",      caps: 2, per: { morning: 1, dreams: 1 }, mo: 6,  q: 18 },
  better: { label: "Feel better",   level: "Support",     glis: "GLIS Slightly High", caps: 4, per: { morning: 2, dreams: 2 }, mo: 12, q: 36 },
  full:   { label: "Full recovery", level: "Intensive",   glis: "GLIS High",          caps: 6, per: { morning: 3, dreams: 3 }, mo: 18, q: 54 },
};
const PRICE = { monthly: 989, quarterly: 890 };
const TRIAL_CREDIT = 499;
const SHIP_FEE = 0; // CSA decision (26 Sep 2026): the ₱499 trial ships free, flat, anywhere in the Philippines
const shipShort = () => (SHIP_FEE ? `+ ${peso(SHIP_FEE)} shipping` : "Free shipping");
const PAY = {
  card: { label: "Card", note: "Charged automatically each refill", short: "Card •••• 4242" },
  maya: { label: "Maya", note: "Charged automatically each refill", short: "Maya" },
  gcash: { label: "GCash", note: "We send a pay link by SMS each refill", short: "GCash pay link" },
};
const REWARDS = [
  { id: "blister", icon: "\u{1F48A}", label: "1 free blister (10 capsules)", note: "Added to your next refill", pts: 12 },
  { id: "bioscan", icon: "\u{1F52C}", label: "BioScan re-test", note: "When BioScan is live", pts: 24 },
  { id: "merch", icon: "\u{1F455}", label: "Gutguard merch item", note: "Ships with your next refill", pts: 36 },
];
const BASE_STEPS = ["Welcome Orientation", "Product Belief", "Business Exposure", "First Sale", "Duplication Initiation"];
const BASE_DONE = 2;
const PHASES = [["Repair", "Weeks 1–4"], ["Calm", "Weeks 5–8"], ["Regenerate", "Weeks 9–12"]];
const STAGES = [["card", "CARD ONLY"], ["ordered", "ORDERED"], ["trial", "TRIAL"], ["member", "MEMBER"], ["base", "BASE"], ["builder", "BUILDER · 2LT"]];
const APPS = [
  { id: "gema", name: "GEMA", icon: "\u{1F4CB}", tone: "#1f5d99" },
  { id: "academy", name: "Gentrep Academy", icon: "\u{1F393}", tone: "#1e9e57" },
  { id: "verse", name: "GG Verse", icon: "\u{1F310}", tone: "#0e2249" },
];
const LEAVE = ["The price is too high", "I have enough capsules for now", "I am not feeling a change yet", "Another reason"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const addMonths = (d, n) => { const x = new Date(d); const day = x.getDate(); x.setDate(1); x.setMonth(x.getMonth() + n); const dim = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate(); x.setDate(Math.min(day, dim)); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

function seedTrial() {
  const log = {};
  if (TODAY - 2 >= 1) log[key(TODAY - 2)] = { dreams: true };                       // Night 1: Taps only
  if (TODAY - 1 >= 1) log[key(TODAY - 1)] = { morning: true, dreams: true, proof: true }; // Day 2
  return log;
}
const planStart = addDays(now, -9);
const defaultPlan = () => ({ goal: "better", freq: "monthly", pay: "card", status: "active", start: planStart, skips: 0, pausedUntil: null });
/* hash = "<stage>|<action>" from the website (demo), or just "<stage>" / "continue" / "plan" */
const hashParts = () => { let h = (typeof location !== "undefined" ? location.hash : "").replace("#", ""); try { h = decodeURIComponent(h); } catch (e) {} const [a, b] = h.split(/[|~]/); /* "~" from the artifact viewer, which drops "|" */ return b !== undefined ? { stage: a, action: b } : { stage: a, action: a }; };
const hashStage = () => { const { stage: h } = hashParts(); return ["card", "ordered", "trial", "member", "base", "builder"].includes(h) ? h : h === "continue" ? "trial" : h === "plan" ? "card" : "member"; };

/* ---------------- The card (MemberCard, with live name / status / points) ---------------- */
const MemberCard = ({ flipped, onFlip = () => {}, name, tier, points, onPoints = () => {}, issued = true, mobile = "", ready = false, onField }) => (
  <div onClick={issued ? onFlip : onField ? () => onField("gg-nm") : undefined} style={{ perspective: 1300, cursor: issued || onField ? "pointer" : "default", width: "100%" }}>
    <div style={{ position: "relative", width: "100%", aspectRatio: "1.586 / 1", transformStyle: "preserve-3d", transition: "transform .6s cubic-bezier(.2,.8,.2,1)", transform: flipped ? "rotateY(180deg)" : "none" }}>
      {/* FRONT */}
      <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: 18, overflow: "hidden", background: `linear-gradient(150deg, ${B.royal}, #001B75)`, transition: "box-shadow .3s ease", boxShadow: ready ? `0 0 0 3px ${B.amber}, 0 20px 40px -22px rgba(0,27,117,.7)` : "0 20px 40px -22px rgba(0,27,117,.7)" }}>
        <img src={G_WATERMARK} alt="" aria-hidden style={{ position: "absolute", right: -30, bottom: -30, width: 220, opacity: .1, pointerEvents: "none" }} />
        <div style={{ position: "relative", padding: 18, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <img src={WORDMARK_SRC} alt="Gutguard Lifestyle" style={{ height: 19 }} />
            <span className="g-m" style={{ fontSize: 8, letterSpacing: ".16em", color: B.amber, fontWeight: 700 }}>{tier}</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <div role={onField ? "button" : undefined} tabIndex={onField ? 0 : undefined} aria-label={onField ? "Enter your name" : undefined} onClick={onField ? (e) => { e.stopPropagation(); onField("gg-nm"); } : undefined} onKeyDown={onField ? (e) => { if (e.key === "Enter") onField("gg-nm"); } : undefined} className="g-w" style={{ fontSize: 21, fontWeight: 800, color: name.trim() ? "#fff" : "rgba(223,215,213,.42)", letterSpacing: "-.01em", lineHeight: 1, cursor: onField ? "text" : undefined, display: "inline-block", paddingBottom: 2, borderBottom: onField && !name.trim() ? "1px dashed rgba(223,215,213,.4)" : "none" }}>{(name.trim() || "Your name here").toUpperCase()}</div>
            <div role={onField ? "button" : undefined} aria-label={onField ? "Enter your mobile number" : undefined} onClick={onField ? (e) => { e.stopPropagation(); onField("gg-no"); } : undefined} className="g-m" style={{ fontSize: 11, letterSpacing: ".22em", color: issued ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.3)", marginTop: 5, cursor: onField ? "text" : undefined }}>{issued ? CARD_NO : (mobile.trim() || "0917 000 0000")}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <button onClick={(e) => { e.stopPropagation(); onPoints(); }} aria-label="Open E-Points rewards" style={{ textAlign: "left" }}>
              <div className="g-ant g-pts" style={{ fontSize: 30, color: B.amber, lineHeight: .9 }}>{points}</div>
              <div className="g-m" style={{ fontSize: 8, letterSpacing: ".16em", color: "rgba(255,255,255,.6)", marginTop: 2 }}>E-POINTS &rsaquo;</div>
            </button>
            {issued ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ background: "#fff", borderRadius: 8, padding: 5, lineHeight: 0 }}><QR seed={CARD_NO} size={40} /></div>
              <span className="g-m" style={{ fontSize: 7.5, letterSpacing: ".12em", color: "rgba(255,255,255,.55)" }}>TAP TO SHOW</span>
            </div>
            ) : (
            <span className="g-m" style={{ textAlign: "right", fontSize: 8, fontWeight: 700, letterSpacing: ".12em", color: "rgba(223,215,213,.7)", lineHeight: 1.7 }}>FREE MEMBERSHIP<br />NO FEES, EVER</span>
            )}
          </div>
        </div>
      </div>
      {/* BACK */}
      <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 18, background: `linear-gradient(150deg, ${B.royal}, #001B75)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 10, lineHeight: 0 }}><QR seed={CARD_NO} size={118} /></div>
        <div className="g-m" style={{ fontSize: 10.5, letterSpacing: ".2em", color: B.amber, fontWeight: 700 }}>SHOW THIS AT THE DOOR</div>
      </div>
    </div>
  </div>
);

/* E-Points banner — the RewardsBanner pattern from the Rewards screen */
const PointsBanner = ({ points, perRefill, onOpen }) => (
  <button onClick={onOpen} className="g-press g-shine" style={{ width: "100%", marginTop: 14, display: "flex", alignItems: "center", gap: 13, background: `linear-gradient(100deg, ${B.amber} 0%, #FFD86B 52%, ${B.amber} 100%)`, color: B.ink, borderRadius: 12, padding: "14px 16px", boxShadow: "0 14px 34px -12px rgba(255,196,46,.6)", position: "relative", overflow: "hidden" }}>
    <span aria-hidden style={{ fontSize: 22, lineHeight: 1 }}>&#9733;</span>
    <span style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
      <span className="g-m" style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".22em", display: "block" }}>E-POINTS</span>
      <span className="g-w" style={{ fontSize: 13.5, fontWeight: 600, display: "block", marginTop: 3, lineHeight: 1.35 }}>
        You have {points} E-Point{points === 1 ? "" : "s"}{perRefill ? ` · +${perRefill} each refill` : ""}. See your rewards.
      </span>
    </span>
    <span className="g-w" style={{ fontSize: 19, fontWeight: 700 }}>&rsaquo;</span>
  </button>
);

const sectionLbl = { fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "#6B6B7A", margin: "30px 2px 12px" };
const box = { background: C.card, border: "1px solid #D8D2C2", borderRadius: 16, padding: "18px 20px" };
const rowLine = { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "9px 0", borderBottom: `1px solid ${C.line}` };
const pill = (tone) => ({ fontFamily: "var(--font-plex-mono),'IBM Plex Mono',monospace", fontSize: 10.5, fontWeight: 600, letterSpacing: ".08em", color: tone, background: "transparent", border: "1px solid #D8D2C2", borderRadius: 20, padding: "3px 10px", whiteSpace: "nowrap" });
const manageBtn = { textAlign: "center", padding: "12px 8px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: C.navy, background: C.card, border: `1px solid ${C.line}` };
const choice = (on) => ({ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 12, marginBottom: 8, background: on ? C.choice : C.card, border: `1.5px solid ${on ? C.blue : "#D8D2C2"}` });
const radio = (on) => ({ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, border: on ? `6px solid ${C.blue}` : "1.5px solid #C8C1B2", background: C.card });


/* ---------------- Responsive (phone first; desktop from 900 px) ---------------- */
const WIDE_Q = "(min-width: 900px)";
const useWide = () => {
  /* server and first browser render: phone layout; then the real width, without a hydration mismatch */
  return React.useSyncExternalStore(
    (cb) => { const m = matchMedia(WIDE_Q); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => matchMedia(WIDE_Q).matches,
    () => false,
  );
};
/* Overlay — bottom sheet on phones, centred dialog on desktop */
function Overlay({ children, onClose, center }) {
  const wide = useWide();
  const c = center || wide;
  return (
    <div onClick={onClose} className={c ? "ov-c" : ""} style={{ position: "fixed", inset: 0, background: "rgba(15,36,68,.55)", display: "flex", alignItems: c ? "center" : "flex-end", justifyContent: "center", zIndex: 50, padding: c ? 24 : 0 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: wide ? 480 : 430, display: "flex", justifyContent: "center" }}>{children}</div>
    </div>
  );
}
const SITE_LOGO = "/prototype/site-logo.svg";
const SITE = DEMO ? "https://claude.ai/artifact/EU7uvgH4zxnXT3E4DSpiRo" : WEBSITE_URL + "/"; /* production: https://gutguard.ph */
const SITE_LINKS = [["Home", "#/"], ["The Science", "#/science"], ["The System", "#/system"], ["Shop", "#/shop"], ["About", "#/about"]];
/* Website header, used by the Lifestyle Page and the landing (same look as gutguard.ph) */
function WebNav({ here = "Lifestyle", right = null, links = true }) {
  return (
    <header className="lw-nav">
      <div className="lw-nav-in">
        <a className="lw-brand" href={SITE + "#/"} target="_blank" rel="noopener" aria-label="Gutguard home"><img src={SITE_LOGO} alt="Gutguard" style={{ height: 26, width: "auto", display: "block" }} /></a>
        <span className="lw-here">/ {here}</span>
        {links && <nav className="lw-links">{SITE_LINKS.map(([l, h]) => <a key={l} href={SITE + h} target="_blank" rel="noopener">{l}</a>)}</nav>}
        <div className="lw-right">{right}</div>
      </div>
    </header>
  );
}
/* Line icons in the website's style (1.7 stroke, round ends). Replaces the emojis. */
const LI = (() => {
  const I = (d, size = 20) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
  return {
    sun: (z) => I(<><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" /></>, z),
    moon: (z) => I(<path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z" />, z),
    camera: (z) => I(<><path d="M4 8h3l1.6-2.4h6.8L17 8h3a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13.2" r="3.4" /></>, z),
    check: (z) => I(<path d="M5 12.5l4.3 4.3L19 7.2" />, z),
    capsule: (z) => I(<><rect x="3.2" y="8.6" width="17.6" height="6.8" rx="3.4" transform="rotate(-35 12 12)" /><path d="M9.2 7.9l5.6 8.2" /></>, z),
    shirt: (z) => I(<path d="M8.5 3.5L4 6l1.8 4 2.2-1v11.5h8V9l2.2 1L20 6l-4.5-2.5a3.5 3.5 0 0 1-7 0z" />, z),
    scan: (z) => I(<><path d="M2.5 12.5h4l2.4-6.2 3.6 11.4 2.4-5.2h6.6" /></>, z),
    clipboard: (z) => I(<><rect x="5" y="4.5" width="14" height="16.5" rx="2" /><path d="M9 4.5h6v3H9zM8.5 12h7M8.5 15.5h5" /></>, z),
    cap: (z) => I(<><path d="M2.5 9.5L12 5l9.5 4.5L12 14z" /><path d="M6.5 11.5v4.2c1.6 1.3 3.5 2 5.5 2s3.9-.7 5.5-2v-4.2M21.5 9.5v5" /></>, z),
    globe: (z) => I(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z" /></>, z),
    truck: (z) => I(<><path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3.2v3.3h-7" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>, z),
    undo: (z) => I(<path d="M9 7L4.5 11.5 9 16M5 11.5h9a5 5 0 0 1 0 10h-2" />, z),
    shield: (z) => I(<><path d="M12 2.8l7.5 2.9v5.6c0 4.8-3.2 8.5-7.5 9.9-4.3-1.4-7.5-5.1-7.5-9.9V5.7z" /><path d="M8.6 12.2l2.4 2.4 4.4-4.6" /></>, z),
    meal: (z) => I(<><circle cx="12" cy="13" r="6.5" /><path d="M3 4.5v5.5M5 4.5v5.5M3 10h2M4 10v10M21 4.5c-1.6 1-2 3-2 5.5h2v10" /></>, z),
  };
})();
const SLOT_ICON = { morning: (z) => LI.sun(z), lunch: (z) => LI.meal(z), dreams: (z) => LI.moon(z) };
/* The website's capsule: inflammation (heat) → recovery (blue) */
const Capsule = ({ w = 120 }) => (
  <svg width={w} height={w * 124 / 376} viewBox="52 78 376 124" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="lwHeat" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FF8A6B" /><stop offset="1" stopColor="#E24A22" /></linearGradient>
      <linearGradient id="lwRec" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4FA3DE" /><stop offset="1" stopColor="#1E6FB8" /></linearGradient>
      <clipPath id="lwPill"><rect x="70" y="95" width="340" height="90" rx="45" /></clipPath>
    </defs>
    <g clipPath="url(#lwPill)">
      <rect x="70" y="95" width="172" height="90" fill="url(#lwHeat)" /><rect x="238" y="95" width="172" height="90" fill="url(#lwRec)" />
      <ellipse cx="150" cy="120" rx="90" ry="16" fill="#fff" opacity="0.22" /><ellipse cx="320" cy="120" rx="90" ry="16" fill="#fff" opacity="0.22" />
      <g stroke="#FCFAF5" strokeWidth="3" fill="#FCFAF5"><line x1="205" y1="140" x2="240" y2="128" /><line x1="240" y1="128" x2="275" y2="150" /><line x1="240" y1="128" x2="248" y2="108" /><circle cx="205" cy="140" r="8" /><circle cx="240" cy="128" r="10" /><circle cx="275" cy="150" r="8" /><circle cx="248" cy="108" r="6" /></g>
      <rect x="238" y="95" width="4" height="90" fill="#FCFAF5" />
    </g>
    <rect x="70" y="95" width="340" height="90" rx="45" fill="none" stroke="#141019" strokeOpacity="0.14" strokeWidth="2" />
  </svg>
);
/* Progress on the website's seam: heat → gold → recovery. The member moves from inflammation toward recovery. */
const SeamBar = ({ pct, h = 6, marks = 0 }) => (
  <div style={{ position: "relative", height: h, borderRadius: h, overflow: "hidden", background: "linear-gradient(90deg,#FF5E3A,#B08D5B,#2F86C9)" }}>
    <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: `${Math.max(0, 100 - pct)}%`, background: "#E2DCCD" }} />
    {Array.from({ length: Math.max(0, marks - 1) }).map((_, i) => <span key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${((i + 1) / marks) * 100}%`, width: 2, marginLeft: -1, background: "#FCFAF5" }} />)}
  </div>
);
const LIGHT = { background: "#FCFAF5", border: "1px solid #D8D2C2", borderRadius: 16, padding: "20px 20px", color: "#141019" };
/* Forms: when a field is tapped, wait for the phone keyboard, then bring the field into view (shared by the Lifestyle Page and the landing) */
const useFieldInView = () => useEffect(() => {
  const on = (e) => { const el = e.target; if (!el || !/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) || el.type === "checkbox" || el.type === "radio") return;
    setTimeout(() => { const vv = window.visualViewport; const vh = vv ? vv.height : window.innerHeight; const r = el.getBoundingClientRect(); if (r.top < 90 || r.bottom > vh - 110) el.scrollIntoView({ block: "center", behavior: "smooth" }); }, 320); };
  document.addEventListener("focusin", on); return () => document.removeEventListener("focusin", on);
}, []);
const REWARD_ICON = { blister: "capsule", bioscan: "scan", merch: "shirt" };
const APP_ICON = { gema: "clipboard", academy: "cap", verse: "globe" };
/* Joined number row, as on the website (per cap · days · capsules) */
const StatRow = ({ items }) => (
  <div className="lw-stats">{items.map(([big, label, alert]) => <div key={label} className={"lw-stat" + (alert ? " al" : "")}><b className="ant">{big}</b><span>{label}</span></div>)}</div>
);
const RESP_CSS = `
  /* gutguard.ph design system — the Lifestyle pages use the website look */
  body,.g{background:#F4F1EA;color:#141019;font-family:var(--font-inter-tight),'Inter Tight',system-ui,sans-serif}
  .g .osw,.g button,.g .inr,.g input,.g select,.g textarea,.g .g-w{font-family:var(--font-inter-tight),'Inter Tight',system-ui,sans-serif}
  .g .ant{font-family:var(--font-fraunces),'Fraunces',Georgia,serif;font-weight:600;letter-spacing:-.015em}
  .g .g-m{font-family:var(--font-plex-mono),'IBM Plex Mono',ui-monospace,monospace}
  .g .gx-h{font-family:var(--font-fraunces),'Fraunces',Georgia,serif;font-weight:500!important;letter-spacing:-.015em}
  .g button[style*="background: rgb(6, 8, 169)"]{box-shadow:0 8px 24px rgba(6,8,169,.16)}
  .lw-nav{position:sticky;top:0;z-index:30;background:rgba(244,241,234,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid #D8D2C2}
  .lw-nav::before{content:"";display:block;height:2px;background:linear-gradient(90deg,#FF5E3A,#B08D5B,#2F86C9)}
  .lw-nav-in{max-width:1240px;margin:0 auto;padding:12px 18px;display:flex;align-items:center;gap:10px}
  .lw-here{font-family:var(--font-plex-mono),'IBM Plex Mono',monospace;font-size:12px;font-weight:600;letter-spacing:.03em;color:#0608A9;white-space:nowrap}
  .lw-links{display:none}
  .lw-right{margin-left:auto;display:flex;align-items:center;gap:6px}
  @media (max-width:389px){.lw-here{display:none}}
  .lw-pts{display:flex;align-items:baseline;gap:5px;padding:5px 11px;white-space:nowrap;border:1px solid #D8D2C2;border-radius:100px;background:#FCFAF5;color:#141019}
  .lw-pts b{font-family:var(--font-fraunces),'Fraunces',Georgia,serif;font-size:17px;font-weight:600;color:#7E6035}
  .lw-pts span{font-family:var(--font-plex-mono),'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.06em;color:#6B6B7A;white-space:nowrap}
  .lw-icon{width:36px;height:36px;border-radius:50%;border:1px solid #D8D2C2;background:#FCFAF5;display:flex;align-items:center;justify-content:center;color:#3A3A48}
  .lw-tabs{position:sticky;top:53px;z-index:29;background:rgba(252,250,245,.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid #D8D2C2}
  .lw-tabs-in{max-width:1240px;margin:0 auto;padding:0 18px;display:flex;gap:24px;overflow-x:auto}
  .lw-tab{position:relative;font-family:var(--font-plex-mono),'IBM Plex Mono',monospace;font-size:11.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;padding:13px 0 12px;color:#6B6B7A;border-bottom:2px solid transparent;white-space:nowrap;background:none}
  .lw-tab.on{color:#141019;border-bottom-color:#0608A9}
  .lw-tab .bd{display:inline-flex;min-width:18px;height:18px;padding:0 5px;margin-left:6px;border-radius:9px;background:#B5431F;color:#fff;font-size:10.5px;align-items:center;justify-content:center;letter-spacing:0}
  .lw-stats{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;margin-top:12px;border:1px solid #D8D2C2;border-radius:16px;background:#FCFAF5;overflow:hidden}
  .lw-stat{padding:14px 6px 12px;text-align:center;border-left:1px solid #D8D2C2}
  .lw-stat:first-child{border-left:none}
  .lw-stat b{display:block;font-size:26px;line-height:1;color:#141019}
  .lw-stat.al b{color:#B5431F}
  .lw-stat span{display:block;font-family:var(--font-plex-mono),'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#6B6B7A;margin-top:6px}
  .lw-dose{display:flex;align-items:center;gap:12px;background:#FCFAF5;border:1px solid #D8D2C2;border-radius:16px;padding:14px 14px 14px 16px;margin-bottom:10px;transition:border-color .2s,background .2s}
  .lw-dose.next{border-color:#0608A9}
  .lw-done.soft{background:transparent!important;color:#0608A9!important;border:1.5px solid #0608A9;box-shadow:none!important}
  .lw-dose.done{background:#EEF3F9;border-color:#C9DDF0}
  .lw-dose .ic{width:40px;height:40px;border-radius:50%;border:1px solid #D8D2C2;display:flex;align-items:center;justify-content:center;color:#7E6035;flex-shrink:0;background:#F4F1EA}
  .lw-dose.done .ic{background:#1E6FB8;border-color:#1E6FB8;color:#fff}
  .lw-dose .meta{font-size:13px;color:#6B6B7A;margin-top:3px}
  .lw-dose .nt{font-size:12px;color:#6B6B7A;line-height:1.35}
  .lw-dose .ic{width:36px!important;height:36px!important}
  .lw-cam{width:38px!important;height:38px!important}
  .lw-done{padding:10px 18px!important}
  .lw-seg{display:grid;grid-template-columns:1fr 1fr;gap:4px;background:#F4F1EA;border:1px solid #D8D2C2;border-radius:13px;padding:4px}
  .lw-seg.x3{grid-template-columns:1fr 1fr 1fr}
  .lw-seg button{padding:10px 6px;border-radius:9px;text-align:center;color:#6B6B7A;background:transparent}
  .lw-seg button b{display:block;font-size:14px;font-weight:600}
  .lw-seg button small{display:block;font-family:var(--font-plex-mono),'IBM Plex Mono',monospace;font-size:11px;margin-top:2px}
  .lw-seg button.on{background:#FCFAF5;color:#141019;box-shadow:0 2px 7px rgba(20,16,25,.09)}
  .lw-id{display:inline-flex;align-items:center;gap:5px;color:#6B6B7A}
  .lw-id.gg{color:#7E6035;font-weight:600}
  .lw-adj{font-family:var(--font-plex-mono),'IBM Plex Mono',monospace;font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#7E6035;border:1px solid #C9AC7E;border-radius:100px;padding:2px 8px;background:#FCFAF5}
  .lw-set{align-items:flex-start}
  .lw-set.off{opacity:.72}
  .lw-set .lw-time{margin-top:2px}
  .lw-step{display:inline-flex;align-items:center;gap:8px;margin-top:8px;border:1px solid #D8D2C2;border-radius:100px;padding:3px;background:#FCFAF5}
  .lw-step button{width:30px;height:30px;border-radius:50%;font-size:17px;font-weight:600;color:#0608A9;background:#F4F1EA;display:flex;align-items:center;justify-content:center}
  .lw-step button:disabled{color:#B8B4AA;background:transparent}
  .lw-step b{font-family:var(--font-fraunces),'Fraunces',Georgia,serif;font-size:17px;min-width:14px;text-align:center}
  .lw-step span{font-size:12.5px;color:#6B6B7A;padding-right:6px}
  .lw-time{font-family:var(--font-plex-mono),'IBM Plex Mono',monospace;font-size:14px;font-weight:600;padding:8px 10px;border:1px solid #D8D2C2;border-radius:100px;background:#FCFAF5;color:#141019;flex-shrink:0}
  .lw-dose .tag{font-family:var(--font-plex-mono),'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.1em;color:#0608A9;font-weight:600;margin-left:8px}
  .lw-cam{width:40px;height:40px;border-radius:50%;border:1px solid #D8D2C2;background:#FCFAF5;display:flex;align-items:center;justify-content:center;color:#3A3A48;flex-shrink:0}
  .lw-done{padding:10px 20px;border-radius:100px;background:#0608A9;color:#FCFAF5;font-size:14px;font-weight:600;flex-shrink:0;box-shadow:0 8px 20px -10px rgba(6,8,169,.6)}
  .lw-undo{display:inline-flex;align-items:center;gap:4px;font-size:12px;color:#6B6B7A;text-decoration:underline;text-underline-offset:3px;flex-shrink:0}
  .lw-wide{display:none}
  @media(min-width:900px){.lw-wide{display:block}.lw-narrow{display:none}}
  .lw-note{display:flex;align-items:center;gap:8px;font-size:13px;color:#3A3A48;margin-top:10px}
  .lw-note a,.lw-note button{color:#0608A9;font-weight:600;text-decoration:underline;text-underline-offset:3px}
  .lw-cal{display:grid;grid-template-columns:repeat(7,1fr);border-top:1px solid #D8D2C2;border-left:1px solid #D8D2C2;border-radius:12px;overflow:hidden;background:#FCFAF5}
  .lw-cal>*{border-right:1px solid #D8D2C2;border-bottom:1px solid #D8D2C2}
  .lw-cal .wd{font-family:var(--font-plex-mono),'IBM Plex Mono',monospace;font-size:10.5px;color:#6B6B7A;text-align:center;padding:7px 0;background:#F4F1EA}
  .lw-cal .c{position:relative;aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:13px;color:#141019;background:#FCFAF5}
  .lw-cal .c.fu{color:#C8C1B2}
  .lw-cal .c.td{box-shadow:inset 0 0 0 2px #0608A9;font-weight:600}
  .lw-cal .dt{width:7px;height:7px;border-radius:50%}
  .lw-cal .dt.full{background:#1E6FB8}.lw-cal .dt.half{background:linear-gradient(90deg,#1E6FB8 50%,#D8D2C2 50%)}.lw-cal .dt.miss{background:#E7B8A6}
  .lw-cal .ph{position:absolute;top:4px;right:5px;color:#1E6FB8}
  .lw-legend{display:flex;gap:14px;flex-wrap:wrap;font-family:var(--font-plex-mono),'IBM Plex Mono',monospace;font-size:10.5px;color:#6B6B7A;margin-top:8px;letter-spacing:.04em}
  .lw-legend i{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px;vertical-align:1px}
  .lw-st{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600}
  .lw-st i{width:8px;height:8px;border-radius:50%}
  .lw-greet{font-family:var(--font-fraunces),'Fraunces',Georgia,serif;font-size:28px;font-weight:500;letter-spacing:-.02em;color:#141019;line-height:1.1}
  .lw-greet-sub{font-family:var(--font-plex-mono),'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6B6B7A;margin:6px 0 16px}
  @media (min-width:900px){
    .lw-nav-in,.lw-tabs-in{padding-left:32px;padding-right:32px}
    .lw-links{display:flex;gap:26px;margin-left:28px}
    .lw-links a{font-size:14px;font-weight:500;color:#3A3A48;text-decoration:none}
    .lw-links a:hover{color:#0608A9}
    .lw-tabs{top:55px}
  }
  .gg-side{display:none}
  .cols>.col-l,.cols>.col-r{min-width:0}
  @media (max-width:380px){
    .lw-dose{gap:9px;padding:12px}
    .lw-dose .ic{width:32px!important;height:32px!important}
    .lw-cam{width:34px!important;height:34px!important}
    .lw-done{padding:9px 14px!important;font-size:13.5px}
    .lw-tabs-in{gap:16px}
    .lw-tab{letter-spacing:.08em;font-size:11px}
    .lw-sc,.lw-scta{display:none!important}
    .lw-sp{padding:8px 12px!important}
  }
  @media (min-width:1400px){
    .gg-main{max-width:1160px!important}
    .cols{grid-template-columns:minmax(0,440px) minmax(0,1fr)!important;gap:44px!important}
  }
  .gg-main,.gg-nav{max-width:460px}
  @media (min-width:600px){ .gg-main,.gg-nav{max-width:560px} }
  @media (min-width:900px){
    .gg-shell{display:block;width:100%}
    .gg-side{display:flex;flex-direction:column;width:264px;flex-shrink:0;padding:26px 18px;background:#fff;border-right:1px solid #e9edf3;position:sticky;top:0;height:100vh;max-height:calc(100vh - var(--demo,0px));box-sizing:border-box}
    .gg-body{flex:1;min-width:0}
    .gg-hide-wide{display:none!important}
    .gg-main{max-width:1040px;padding:28px 36px 56px!important}
    .cols{display:grid;grid-template-columns:minmax(0,400px) minmax(0,1fr);gap:32px;align-items:start}
    .cols.even{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
    .cols.sticky-l>.col-l,.cols.sticky-r>.col-r{position:sticky;top:var(--stick,24px)}
    .gg-toast{bottom:28px!important}
    .ov-c .up{border-radius:20px!important;max-height:88vh!important;overflow-y:auto}
    .wide-only{display:block}
  }
  .ov-c .up{border-radius:20px}
  .gg-off{display:none!important}
`;


/* ================================================================== */
/* Gutguard Lifestyle — Landing, sign-up and ₱499 trial checkout       */
/* Addendum 03. Same UI as the Lifestyle Member page: sticky white     */
/* header, member card, Daily cards, radios, buttons and confetti.     */
/* ================================================================== */

const TRIAL_PRICE = 499;
// SHIP_FEE is shared (see member page constants)
const SPONSOR = { name: "Ana Cruz", first: "Ana", code: "ANACRUZ" };
const MEMBER_PAGE = "gutguard.ph/lifestyle";
/* Option C: all buying happens on the website Shop. This page is only for the free card (referral links, "Just get my free card") and log-in. */
/* Real <a> links: the artifact viewer refuses window.open for most people and passes only a plain #word,
   so the website reads tokens (#shop~who-card~start-watch). Production: gutguard.ph/shop, same tab, logged in. */
const shopLink = (q) => (DEMO ? { href: "https://claude.ai/artifact/EU7uvgH4zxnXT3E4DSpiRo#shop~who-card" + (q ? "~" + q : ""), target: "_blank", rel: "noopener" } : { href: WEBSITE_URL + "/shop" + (q ? "?" + q.split("~").map((x) => x.replace("-", "=")).join("&") : "") });

const BEN_ICON = {
  card: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="5.5" width="19" height="13" rx="2" /><path d="M2.5 9.5h19M6 15h4" /></svg>,
  star: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" /></svg>,
  cal: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 9.5h17M8 3v4M16 3v4M8 14l2.2 2.2L16 12" /></svg>,
};
const BENEFITS = [
  ["card", "Your Lifestyle card", "Your account and your QR check-in for Gutguard events."],
  ["star", "E-Points on every blister", "1 E-Point for each blister you pay for. Redeem them for rewards."],
  ["cal", "Your daily tracker", "Reveille and Taps reminders, streaks and your 90-Day Protocol."],
];
const readSource = () => {
  const h = typeof location !== "undefined" ? location.hash : "";
  if (!DEMO) return { from: "shop", ref: false }; /* sponsor links: back-end task (Addendum 05) */
  return { from: "shop", ref: !h.includes("noref") };
};
const fmtMobile = (v) => {
  if (v.trim().startsWith("+")) return "+" + v.replace(/[^\d ]/g, "").slice(0, 18);
  const dg = v.replace(/\D/g, "").slice(0, 11);
  return [dg.slice(0, 4), dg.slice(4, 7), dg.slice(7, 11)].filter(Boolean).join(" ");
};

const Field = ({ id, label, optional, note, ...rest }) => (
  <div style={{ marginBottom: 13 }}>
    <label htmlFor={id} className="osw" style={lbl}>{label}{optional && <span className="inr" style={{ fontWeight: 400, color: C.mute }}> · optional</span>}</label>
    <input id={id} style={inp} {...rest} />
    {note && <div className="inr" style={{ fontSize: 11.5, color: C.mute, marginTop: 5, lineHeight: 1.45 }}>{note}</div>}
  </div>
);
const Tick = ({ checked, onChange, children }) => (
  <label className="inr" style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12.5, color: C.ink, lineHeight: 1.5, cursor: "pointer" }}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, accentColor: C.blue, flexShrink: 0 }} />
    <span>{children}</span>
  </label>
);

/** @param {{ initialLogin?: boolean, initialJoin?: boolean }} props */
function LifestyleLanding({ initialLogin = false, initialJoin = false } = {}) {
  useFieldInView();
  const src0 = readSource();
  const [from, setFrom] = useState(src0.from);
  const [hasRef, setHasRef] = useState(src0.ref);
  const [handoff, setHandoff] = useState("member"); // which member-page state the hand-off opens
  const [showCode, setShowCode] = useState(false);
  const [step, setStep] = useState(() => (initialLogin || (DEMO && typeof location !== "undefined" && location.hash.includes("login")) ? "login" : initialJoin ? "register" : "landing")); // landing | register | otp | first | checkout | done | plan | login
  const [form, setForm] = useState({ name: "", mobile: "", email: "", code: "", password: "", ident: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [agree, setAgree] = useState(false);
  const [otp, setOtp] = useState("");
  useEffect(() => {
    if ((step !== "otp" && step !== "login") || typeof window === "undefined" || !("OTPCredential" in window)) return;
    const ac = new AbortController();
    navigator.credentials.get({ otp: { transport: ["sms"] }, signal: ac.signal }).then((o) => { if (o && o.code) setOtp(o.code.slice(0, 6)); }).catch(() => {});
    return () => ac.abort();
  }, [step]);
  const [welcome, setWelcome] = useState(false);
  const [fire, setFire] = useState(0);
  const [toast, setToast] = useState("");
  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2300); };
  const [points, setPoints] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const skipTop = useRef(false);

  useEffect(() => { setForm((f) => ({ ...f, code: hasRef ? SPONSOR.code : "" })); }, [hasRef]);
  useEffect(() => { if (skipTop.current) { skipTop.current = false; } else { try { window.scrollTo(0, 0); } catch (e) {} } setFlipped(false); }, [step]);

  const digits = form.mobile.replace(/\D/g, "");
  const canRegister = form.name.trim().length > 1 && digits.length >= 10 && agree && (DEMO || (EMAIL_RE.test(form.email.trim()) && PASS_OK(form.password)));
  /* One Account actions. A successful sign-in or confirmed code redirects on the server. */
  const run = async (fn, onOk) => { setBusy(true); setErr(""); try { const r = await fn(); if (r && r.ok === false) { setErr(r.fieldErrors ? Object.values(r.fieldErrors)[0] || r.error : r.error); if (r.needsConfirm) { setForm((f) => ({ ...f, email: f.email || (EMAIL_RE.test(f.ident.trim()) ? f.ident.trim() : "") })); setOtp(""); setStep("otp"); } } else if (onOk) onOk(r); } catch (e) { if (e && e.digest && String(e.digest).startsWith("NEXT_REDIRECT")) throw e; setErr("Could not complete that just now. Try again."); } finally { setBusy(false); } };
  const doSignUp = () => run(() => signUp({ name: form.name.trim(), mobile: form.mobile, email: form.email.trim(), password: form.password }), (r) => { if (r && r.mode === "mock") { setWelcome(true); setFire((f) => f + 1); } else { setOtp(""); setStep("otp"); } });
  const doConfirm = () => run(() => confirmEmailCode({ email: form.email.trim(), code: otp }));
  const doSignIn = () => run(() => signIn({ identifier: form.ident.trim(), password: form.password }));
  const first = form.name.trim().split(" ")[0] || "";
  const issued = ["first", "plan"].includes(step) || welcome;

  const Steps = ({ n }) => {
    const labels = ["Card", "Code", "Start"];
    return (
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {labels.map((l, i) => (
          <div key={l} style={{ flex: 1 }}>
            <div style={{ height: 4, borderRadius: 3, background: i < n ? C.blue : C.line }} />
            <div className="osw" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: i < n ? C.blue : C.mute, marginTop: 5, fontWeight: 600 }}>{i + 1} · {l}</div>
          </div>
        ))}
      </div>
    );
  };
  // Tap on the card → jump to the field. Focus must happen inside the tap itself,
  // or phones will not open the keyboard. flushSync renders the sign-up screen first.
  const goField = (id) => {
    if (step !== "register") { skipTop.current = true; flushSync(() => setStep("register")); }
    const el = document.getElementById(id);
    if (el) { el.focus({ preventScroll: true }); el.scrollIntoView({ block: "center" }); }
  };
  const greet = (t) => <div className="g-m" style={{ fontSize: 12.5, color: B.ledger, marginBottom: 12 }}>{t}</div>;
  const sponsorNote = hasRef && (
    <div style={{ ...box, marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
      <span className="osw" style={{ width: 38, height: 38, borderRadius: "50%", background: C.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>AC</span>
      <div style={{ flex: 1 }}>
        <div className="inr" style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{SPONSOR.first} invited you</div>
        <div className="inr" style={{ fontSize: 12, color: C.mute }}>{SPONSOR.name} · your sponsor</div>
      </div>
    </div>
  );

  return (
    <div className="g gg-web" style={{ minHeight: "100vh", background: B.field, display: "flex", flexDirection: "column" }}>
      <Style />
      <style>{`
        .osw{font-family:var(--font-inter-tight),'Inter Tight',system-ui,sans-serif;} .ant{font-family:var(--font-fraunces),'Fraunces',system-ui,sans-serif;letter-spacing:.2px;} .inr{font-family:var(--font-inter-tight),'Inter Tight',system-ui,sans-serif;}
        button{font-family:var(--font-inter-tight),'Inter Tight',system-ui,sans-serif;}
        input,textarea{font-family:var(--font-inter-tight),'Inter Tight',system-ui,sans-serif;}
        input:focus{outline:none;border-color:${C.blue}!important;}
        .tap{transition:transform .08s ease;} .tap:active{transform:scale(.97);}
        @keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} .fade{animation:fade .22s ease;}
        @keyframes up{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}} .up{animation:up .25s ease;}
        @keyframes cf-burst{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--tx),var(--ty)) rotate(var(--rot));opacity:0}}
        @keyframes cf-fall{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--tx),115vh) rotate(var(--rot));opacity:0}}
        .cf-p{position:absolute;border-radius:2px;}
        @media (prefers-reduced-motion: reduce){.fade,.up{animation:none}.cf-p{display:none}}
        @media (hover:hover){.tap:hover{filter:brightness(.96);}}
        .grab{width:40px;height:4px;border-radius:2px;background:#e9edf3;margin:-2px auto 14px;}
        .g-shine{position:relative}
      `}</style>
      <style>{RESP_CSS}</style>
      <Confetti5 fire={fire} />

      {/* demo controls — not part of the product (same bar as the member page) */}
      <div style={{ display: DEMO ? "block" : "none", background: "#fff", borderBottom: `1px solid ${B.edge}`, padding: "7px 12px" }}>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>
          <div className="g-m" style={{ fontSize: 8.5, letterSpacing: ".12em", color: B.amberDeep, textAlign: "center", marginBottom: 5, fontWeight: 700 }}>DEMO · LANDING (NOT PART OF THE PRODUCT)</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 6, flexWrap: "wrap" }}>
            {[].map(([k, l]) => (
              <button key={k} onClick={() => { setFrom(k); setStep("landing"); }} className="g-m" style={{ fontSize: 9, letterSpacing: ".05em", padding: "5px 10px", borderRadius: 99, border: `1px solid ${from === k ? B.amberDeep : B.edge}`, color: from === k ? B.amberDeep : B.ledger, fontWeight: from === k ? 700 : 500 }}>{l}</button>
            ))}
            <button onClick={() => setHasRef((v) => !v)} className="g-m" style={{ fontSize: 9, letterSpacing: ".05em", padding: "5px 10px", borderRadius: 99, border: `1px solid ${hasRef ? B.amberDeep : B.edge}`, color: hasRef ? B.amberDeep : B.ledger, fontWeight: hasRef ? 700 : 500 }}>SPONSOR LINK {hasRef ? "ON" : "OFF"}</button>
          </div>
          <div style={{ display: "flex", gap: 2, background: B.edge, borderRadius: 8, padding: 3 }}>
            {[["landing", "LANDING"], ["register", "SIGN UP"], ["otp", "CODE"], ["first", "FIRST STEP"], ["login", "LOG IN"]].map(([k, l]) => (
              <button key={k} onClick={() => { if (!form.name) setForm((f) => ({ ...f, name: "Rey Aquino", mobile: "0917 111 2233" })); setWelcome(false); setStep(k); }} className="g-m" style={{ flex: 1, fontSize: 8.5, letterSpacing: ".04em", padding: "8px 2px", borderRadius: 6, textAlign: "center", color: step === k ? B.blue : B.ledger, background: step === k ? "#fff" : "transparent", fontWeight: step === k ? 700 : 500 }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* header — the website header (gutguard.ph look) */}
      <WebNav here={step === "login" ? "Log in" : "Free card"} right={
        step === "landing"
          ? <button onClick={() => setStep("login")} className="lw-pts tap" style={{ fontSize: 13, fontWeight: 600 }}>Log in</button>
          : <button onClick={() => setStep(step === "register" || step === "login" ? "landing" : step === "otp" ? "register" : step)} className="lw-pts tap" style={{ fontSize: 13, fontWeight: 600 }}>&lsaquo; Back</button>
      } />

      <main className="gg-main" style={{ flex: 1, padding: "18px 16px 40px", margin: "0 auto", width: "100%", "--stick": "88px" }}>

        {/* ================= LANDING ================= */}
        {step === "landing" && (<section className="fade">
          <div className="cols sticky-r"><div className="col-l">
          {greet(hasRef ? <>Invited by <b style={{ color: B.ink }}>{SPONSOR.name}</b> &mdash; welcome.</> : <>Welcome to <b style={{ color: B.ink }}>Gutguard Lifestyle</b>.</>)}
          <div style={{ ...LIGHT, marginBottom: 14 }}>
            <div className="g-m" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#7E6035", fontWeight: 600 }}>Free membership</div>
            <div className="gx-h" style={{ fontSize: 26, marginTop: 6, lineHeight: 1.15, color: C.ink }}>Join the movement and become a Gut Guardian.</div>
            <div className="inr" style={{ fontSize: 13.5, color: C.mute, marginTop: 8, lineHeight: 1.5 }}>Chronic inflammation ages the body silently. Gut Guardians refuse to wait. Gutguard Lifestyle is how we live: Reveille and Taps every day, a free card that rewards you, and a page that tracks you. Live it for 5 nights and you are one of us.</div>
            <div className="g-m" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>{["Guard yourself", "Guard your family", "Guard your community"].map((t) => <span key={t} style={{ fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600, color: "#7E6035", border: "1px solid #C9AC7E", borderRadius: 100, padding: "4px 10px" }}>{t}</span>)}</div>
            <div className="gx-h" style={{ fontSize: 18, fontStyle: "italic", color: "#7E6035", marginTop: 12 }}>We Gut You.</div>
          </div>
          <MemberCard name="" tier="LIFESTYLE MEMBER" points={0} issued={false} onField={goField} />

          <div className="g-m" style={sectionLbl}>What you get</div>
          <div style={{ ...box, padding: "4px 16px" }}>
            {BENEFITS.map(([ic, t, s], i) => (
              <div key={t} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: i < 2 ? `1px solid ${C.line}` : "none" }}>
                <span style={{ width: 38, height: 38, borderRadius: "50%", background: "#FCFAF5", border: "1px solid #D8D2C2", color: "#7E6035", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{BEN_ICON[ic]}</span>
                <div>
                  <div className="osw" style={{ fontSize: 14.5, fontWeight: 700, color: C.navy }}>{t}</div>
                  <div className="inr" style={{ fontSize: 12.5, color: C.mute, marginTop: 2, lineHeight: 1.45 }}>{s}</div>
                </div>
              </div>
            ))}
          </div>

          </div><div className="col-r">

          <div className="g-m" style={sectionLbl}>First purchase</div>
          <div style={box}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="gx-h" style={{ fontSize: 19, color: C.navy }}>5-Night Watch</div>
              <span style={pill(C.goldD)}>NEW BUYERS</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
              <span className="ant" style={{ fontSize: 34, color: C.navy, lineHeight: 1 }}>{peso(TRIAL_PRICE)}</span>
              <span className="inr" style={{ fontSize: 13, color: C.mute }}>{shipShort()} · 10 capsules · 5 nights</span>
            </div>
            <div className="inr" style={{ fontSize: 13, color: C.mute, marginTop: 8, lineHeight: 1.5 }}>{DEMO ? <>If you continue with a monthly plan, the {peso(TRIAL_PRICE)} comes off your first month.</> : "Then choose a monthly plan when you are ready."}</div>
          </div>
          {sponsorNote}

          <button className="tap" onClick={() => setStep("register")} style={{ ...cta, background: C.cta, color: C.onCta, fontWeight: 700, fontSize: 17, padding: 17, marginTop: 18 }}>Get my free card</button>
          <p className="inr" style={{ fontSize: 12, color: C.mute, textAlign: "center", marginTop: 9 }}><b style={{ color: C.good }}>Free.</b> No payment to join{DEMO ? " · No password" : ""}</p>
          </div></div>
        </section>)}

        {/* ================= SIGN-UP ================= */}
        {step === "register" && (<section className="fade">
          <Steps n={1} />
          <div className="cols sticky-l"><div className="col-l">
          {greet(<>Fill this in and your card is ready.</>)}
          <MemberCard name={form.name} mobile={form.mobile} tier="LIFESTYLE MEMBER" points={0} issued={false} ready={canRegister} onField={goField} />
          </div><div className="col-r">
          <div className="g-m" style={sectionLbl}>Your details</div>
          <div style={box}>
            <Field id="gg-nm" label="Full name" type="text" autoComplete="name" placeholder="e.g. Rey Aquino" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Field id="gg-no" label="Mobile number" type="tel" autoComplete="tel" placeholder="0917 123 4567" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: fmtMobile(e.target.value) })} note={DEMO ? "We send a code to this number. Abroad? Start with + and your country code." : "Your card uses this number."} />
            {!DEMO ? <>
              <Field id="gg-em" label="Email" type="email" autoComplete="email" placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} note="We send your 6-digit code here." />
              <Field id="gg-pw" label="Password" type="password" autoComplete="new-password" placeholder="Choose a password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} note={PASSWORD_HINT + " The same password opens GEMA and the Academy."} />
            </> : null}
            {!DEMO ? null : hasRef || showCode
              ? <Field id="gg-cd" label="Referral code" optional placeholder="From your sponsor" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} note={hasRef ? `Filled in from ${SPONSOR.first}'s link.` : "No code? Leave it blank."} />
              : <button type="button" onClick={() => { flushSync(() => setShowCode(true)); const el = document.getElementById("gg-cd"); if (el) el.focus(); }} style={{ display: "block", margin: "-2px 0 14px", fontSize: 13, fontWeight: 600, color: C.blue }}>Have a referral code?</button>}
            <Tick checked={agree} onChange={setAgree}>I agree to the <u>Privacy Notice</u> and join the free Gutguard Lifestyle Membership.</Tick>
          </div>
          {err && step === "register" ? <div role="alert" className="inr" style={{ fontSize: 13, color: C.clay, margin: "10px 2px 0" }}>{err}</div> : null}
          <button className="tap" disabled={!canRegister || busy} onClick={() => { if (DEMO) { setOtp(""); setStep("otp"); } else doSignUp(); }} style={{ ...cta, background: canRegister && !busy ? C.blue : "#c3ccd8" }}>{busy ? "One moment…" : "Get my card"}</button>
          <p className="inr" style={{ fontSize: 12, color: C.mute, textAlign: "center", marginTop: 9 }}><b style={{ color: C.good }}>Free.</b> {DEMO ? "No payment · No password · 10 seconds" : "No payment · 1 minute"}</p>
          </div></div>
        </section>)}

        {/* ================= CODE / LOG IN ================= */}
        {(step === "otp" || step === "login") && (<section className="fade" style={{ maxWidth: 460, margin: "0 auto" }}>
          {step === "otp" && <Steps n={2} />}
          <div style={box}>
            <div className="osw gx-h" style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>{step === "login" ? (DEMO ? "Log in with your mobile number" : "Log in") : "Enter your 6-digit code"}</div>
            {step === "login" && DEMO && <div style={{ marginTop: 12 }}><Field id="gg-lg" label="Mobile number" type="tel" placeholder="0917 123 4567" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: fmtMobile(e.target.value) })} /></div>}
            {step === "login" && !DEMO && <div style={{ marginTop: 12 }}>
              <Field id="gg-lg" label="Email or OneGrinders username" type="text" autoComplete="username" placeholder="you@email.com" value={form.ident} onChange={(e) => setForm({ ...form, ident: e.target.value })} />
              <Field id="gg-lp" label="Password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} note="The same password opens GEMA and the Academy." />
            </div>}
            {DEMO || step === "otp" ? <div className="inr" style={{ fontSize: 13.5, color: C.mute, marginTop: step === "login" ? 0 : 6, lineHeight: 1.5 }}>{DEMO ? <>We sent a code by SMS to <b style={{ color: C.navy }}>{form.mobile || "your number"}</b>.</> : <>We sent a code to <b style={{ color: C.navy }}>{form.email}</b>.</>}</div> : null}
            {DEMO || step === "otp" ? <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="• • • • • •" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} style={{ ...inp, marginTop: 14, textAlign: "center", letterSpacing: ".5em", fontSize: 24, fontWeight: 700, color: C.navy }} /> : null}
            {DEMO ? <div className="inr" style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginTop: 10 }}>
              <button style={{ color: C.blue, fontWeight: 600 }}>Send again (in 30s)</button>
              {form.email && <button style={{ color: C.blue, fontWeight: 600 }}>Send to my email</button>}
            </div> : step === "otp" ? <div className="inr" style={{ fontSize: 12.5, marginTop: 10 }}><button onClick={() => run(() => resendEmailCode({ email: form.email.trim() }), () => flash("Code sent again"))} style={{ color: C.blue, fontWeight: 600 }}>Send the code again</button></div> : null}
            {err && step !== "register" ? <div role="alert" className="inr" style={{ fontSize: 13, color: C.clay, marginTop: 10 }}>{err}</div> : null}
          </div>
          {DEMO ? <div className="inr" style={{ fontSize: 11, color: C.mute, marginTop: 8, textAlign: "center" }}>Demo: type any 6 digits.</div> : null}
          <button className="tap" disabled={busy || (DEMO || step === "otp" ? otp.length !== 6 : !(form.ident.trim() && form.password))} onClick={() => {
            if (!DEMO) { if (step === "login") doSignIn(); else doConfirm(); return; }
            if (step === "login") { setHandoff("member"); setStep("plan"); return; }
            setWelcome(true); setFire((f) => f + 1);
          }} style={{ ...cta, background: (DEMO || step === "otp" ? otp.length === 6 : form.ident.trim() && form.password) && !busy ? C.blue : "#c3ccd8" }}>{busy ? "One moment…" : step === "login" ? "Log in" : "Confirm"}</button>
        </section>)}

        {/* ---- WELCOME (sheet, member-page style) ---- */}
        {welcome && (
          <Overlay onClose={() => {}} center>
            <div className="up" style={{ background: C.paper, borderRadius: 20, padding: "22px 18px 20px", width: "100%", maxWidth: 400, textAlign: "center" }}>
              <div className="osw" style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.goldD, fontWeight: 700 }}>Welcome</div>
              <div className="osw gx-h" style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: "6px 0 14px" }}>Your card is ready, {first}</div>
              <MemberCard name={form.name} tier="LIFESTYLE MEMBER" points={0} />
              <div className="inr" style={{ fontSize: 13.5, color: C.mute, marginTop: 12, lineHeight: 1.5 }}>You are now a Gutguard Lifestyle Member. Earn 1 E-Point for every blister.</div>
              <button className="tap" onClick={() => { setWelcome(false); setStep("first"); }} style={{ ...cta, background: C.cta, color: C.onCta, fontWeight: 700 }}>{from === "footer" ? "Continue to my 5-Night Watch" : "Continue"}</button>
            </div>
          </Overlay>
        )}

        {/* ================= FIRST STEP ================= */}
        {step === "first" && (<section className="fade">
          <Steps n={3} />
          <div className="cols sticky-l"><div className="col-l">
          {greet(<>Kumusta, <b style={{ color: B.ink }}>{first}</b> &mdash; here&rsquo;s your first step.</>)}
          <MemberCard flipped={flipped} onFlip={() => setFlipped((f) => !f)} name={form.name} tier="LIFESTYLE MEMBER" points={0} />
          </div><div className="col-r">
          <div className="g-m" style={sectionLbl}>Your first step</div>

          <div style={LIGHT}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="g-m" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#7E6035", fontWeight: 600 }}>Recommended</div>
              <span className="ant" style={{ fontSize: 28, color: C.ink }}>{peso(TRIAL_PRICE)}</span>
            </div>
            <div className="gx-h" style={{ fontSize: 22, marginTop: 4, color: C.ink }}>5-Night Watch</div>
            <div className="inr" style={{ fontSize: 13.5, color: C.mute, marginTop: 8, lineHeight: 1.5 }}>{shipShort()} · 10 capsules · 5 nights · +1 E-Point. The {peso(TRIAL_PRICE)} comes off your first monthly plan.</div>
            <a className="tap" {...shopLink("start-watch")} style={{ ...cta, display: "block", boxSizing: "border-box", textDecoration: "none", textAlign: "center", background: C.cta, color: C.onCta, fontWeight: 700 }}>Start my 5 nights</a>
          </div>
          <a className="tap" {...shopLink("tab-subscribe")} style={{ ...choice(false), marginTop: 12, padding: "15px 16px", boxSizing: "border-box", textDecoration: "none" }}>
            <span style={{ flex: 1 }}>
              <span className="osw" style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.navy }}>Skip the trial, start my plan</span>
              <span className="inr" style={{ display: "block", fontSize: 12.5, color: C.mute, marginTop: 3 }}>Choose your goal, then Monthly or every 3 months.</span>
            </span>
            <span className="osw gx-h" style={{ fontSize: 18, color: C.blue }}>&rsaquo;</span>
          </a>
          <button onClick={() => { setHandoff("card"); setStep("plan"); }} style={{ display: "block", margin: "12px auto 0", fontSize: 13, fontWeight: 600, color: C.blue, textDecoration: "underline", textUnderlineOffset: 3 }}>Later — open my Lifestyle page</button>
          </div></div>
        </section>)}

        {/* ================= HAND-OFF ================= */}
        {step === "plan" && (<section className="fade" style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ ...LIGHT, textAlign: "center", padding: "26px 20px" }}>
            <div className="inr" style={{ color: C.mute, fontSize: 13 }}>Opening</div>
            <div className="gx-h" style={{ fontSize: 26, marginTop: 4, color: C.ink }}>Your Lifestyle page</div>
            <div className="inr" style={{ color: C.mute, fontSize: 13.5, marginTop: 10, lineHeight: 1.55 }}>This goes to <b style={{ color: C.ink }}>{MEMBER_PAGE}</b>, logged in. It opens on My Health{handoff === "card" ? " with your card and your first step." : "."}</div>
          </div>
          <a href={DEMO ? "https://claude.ai/artifact/GGYfp5cEpWgJDezFRfKrWK#" + handoff : "/app"} target="_blank" rel="noopener" className="tap" style={{ ...cta, display: "block", background: C.cta, color: C.onCta, fontWeight: 700, textDecoration: "none", boxSizing: "border-box" }}>Open the Lifestyle page demo</a>
          <div className="inr" style={{ fontSize: 12, color: C.mute, marginTop: 8, textAlign: "center" }}>In this demo, the member page is a separate prototype. It opens in the matching state.</div>
          <button onClick={() => setStep("landing")} style={{ display: "block", margin: "14px auto 0", fontSize: 13, color: C.blue, fontWeight: 600, textDecoration: "underline" }}>Start the demo again</button>
        </section>)}
      </main>

      {toast && <div className="fade gg-toast" style={{ position: "fixed", left: "50%", bottom: 26, transform: "translateX(-50%)", background: C.navy, color: "#fff", padding: "11px 18px", borderRadius: 30, fontSize: 13.5, fontFamily: "var(--font-inter-tight),'Inter Tight',sans-serif", fontWeight: 600, boxShadow: "0 6px 20px rgba(0,0,0,.2)", zIndex: 60, maxWidth: 330, textAlign: "center" }}>{toast}</div>}
    </div>
  );
}

function SheetHead({ title, sub, subColor, onClose }) {
  return (
    <>
    <div className="grab" />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <div>
        <div className="gx-h" style={{ fontSize: 23, color: C.navy }}>{title}</div>
        {sub && <div className="inr" style={{ fontSize: 12.5, color: subColor || C.mute, fontWeight: 600 }}>{sub}</div>}
      </div>
      <button className="tap" onClick={onClose} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, padding: "9px 16px", fontSize: 13, fontWeight: 600, color: C.mute }}>Close</button>
    </div>
    </>
  );
}
function CornerBadge({ n, bg, fg }) {
  return (
    <span style={{ position: "absolute", top: -10, right: -16, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9, background: bg, color: fg, fontSize: 11, fontWeight: 700, fontFamily: "var(--font-inter-tight),'Inter Tight',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", boxShadow: "0 1px 3px rgba(15,36,68,.25)", lineHeight: 1 }}>{n > 99 ? "99+" : n}</span>
  );
}
function Stat({ big, label, tone }) {
  return (
    <div style={{ flex: 1, background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
      <div className="ant" style={{ fontSize: 27, color: tone, lineHeight: 1 }}>{big}</div>
      <div className="osw" style={{ fontSize: 9.5, letterSpacing: 0.5, textTransform: "uppercase", color: C.mute, marginTop: 4 }}>{label}</div>
    </div>
  );
}
function ownCell(s) {
  switch (s) {
    case "proof": return { background: C.good, color: "#fff", border: "none" };
    case "full": return { background: C.goodLt, color: C.navy, border: "none" };
    case "partial": return { background: "#F5E4C4", color: "#8A6414", border: "none" };
    case "missed": return { background: C.miss, color: "#9A6A5E", border: "none" };
    case "today": return { background: "#fff", color: C.blue, border: `2px solid ${C.blue}` };
    default: return { background: C.card, color: "#C3CCD8", border: `1px solid ${C.line}` };
  }
}
function TeamCalendar({ log, onDay }) {
  const fw = new Date(Y, M, 1).getDay();
  const dim = new Date(Y, M + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < fw; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  const state = (d) => { if (d > TODAY) return "future"; if (log[key(d)]?.taken) return log[key(d)].proof ? "proof" : "self"; if (d === TODAY) return "today"; return "missed"; };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
      {WD.map((w, i) => <div key={"h" + i} className="osw" style={{ textAlign: "center", fontSize: 11, color: C.mute, fontWeight: 600 }}>{w}</div>)}
      {cells.map((d, i) => {
        if (!d) return <div key={"b" + i} />;
        const s = state(d);
        const taken = s === "proof" || s === "self";
        const bg = s === "proof" ? C.good : s === "self" ? C.goodLt : s === "missed" ? C.miss : "#fff";
        const col = s === "proof" ? "#fff" : s === "self" ? C.navy : s === "missed" ? "#9A6A5E" : s === "future" ? "#C3CCD8" : C.blue;
        const bd = s === "today" ? `2px solid ${C.blue}` : s === "future" ? `1px solid ${C.line}` : "none";
        return (
          <button key={d} className="tap" onClick={() => onDay(d)} style={{ aspectRatio: "1", borderRadius: 9, fontSize: 13, fontWeight: 600, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: col, border: bd }}>
            {taken ? <><span style={{ position: "absolute", top: 2, left: 4, fontSize: 9, opacity: .85 }}>{d}</span><span style={{ fontSize: 16, fontWeight: 700 }}>&#10003;</span></> : d}
          </button>
        );
      })}
    </div>
  );
}

const navItem = (on) => ({ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "13px 14px", borderRadius: 12, fontSize: 15.5, fontWeight: 600, background: on ? C.navy : "transparent", color: on ? "#fff" : C.ink, border: "none", cursor: "pointer" });
const tabBtn = (on) => ({ flex: 1, padding: "11px 6px", borderRadius: 9, fontSize: 14.5, fontWeight: 600, background: on ? C.navy : "transparent", color: on ? "#fff" : C.mute, border: "none", transition: "background .15s, color .15s" });
const stepBtn = (dis) => ({ width: 34, height: 34, borderRadius: 9, fontSize: 19, fontWeight: 700, background: dis ? "#F1F4F8" : C.navy, color: dis ? "#C3CCD8" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 });
const sheet = { background: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, width: "100%", maxWidth: 430, padding: "18px 16px 26px" };
const lbl = { display: "block", fontSize: 12.5, fontWeight: 600, color: C.navy, marginBottom: 6, letterSpacing: 0.3 };
const inp = { width: "100%", fontSize: 15, padding: "12px 13px", border: "1px solid #D8D2C2", borderRadius: 10, background: C.card };
const whoBtn = (on) => ({ padding: "14px 10px", borderRadius: 12, fontSize: 14.5, fontWeight: 600, lineHeight: 1.3, textAlign: "center", background: on ? C.navy : C.card, color: on ? "#fff" : C.navy, border: `1.5px solid ${on ? C.navy : C.line}` });
const cta = { textAlign: "center", width: "100%", marginTop: 16, padding: "15px", borderRadius: 100, fontSize: 15.5, fontWeight: 600, color: "#fff", background: C.blue };
const ghost = { textAlign: "center", padding: "15px 20px", borderRadius: 100, fontSize: 15, fontWeight: 600, color: C.navy, background: "transparent", border: `1px solid ${C.line}` };

const CONFETTI_COLORS = ["#0608A9", "#2F86C9", "#C9AC7E", "#FF5E3A", "#141019", "#FFFFFF"];
function makePieces(type) {
  const N = { burst: 80, fountain: 90, cascade: 100, radial: 64, streamer: 56 }[type];
  const dur = { burst: 1400, fountain: 1700, cascade: 2200, radial: 1300, streamer: 2000 }[type];
  const arr = [];
  for (let i = 0; i < N; i++) {
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const delay = (i % 12) * 0.03;
    let vars = {}, w = 13, h = 13, x = "50%", y = "45%";
    if (type === "burst") {
      const a = Math.random() * Math.PI * 2;
      vars = { "--tx": `${Math.cos(a) * (20 + Math.random() * 38)}vw`, "--ty": `${Math.sin(a) * (20 + Math.random() * 38)}vh`, "--rot": `${(Math.random() * 2 - 1) * 400}deg` };
    } else if (type === "fountain") {
      x = (35 + Math.random() * 30) + "%"; y = "102%";
      vars = { "--tx": `${(Math.random() * 2 - 1) * 45}vw`, "--ty": `${-(55 + Math.random() * 55)}vh`, "--rot": `${(Math.random() * 2 - 1) * 500}deg` };
    } else if (type === "cascade") {
      x = (Math.random() * 100) + "%"; y = "-6%";
      vars = { "--tx": `${(Math.random() * 2 - 1) * 14}vw`, "--rot": `${(Math.random() * 2 - 1) * 600}deg` };
    } else if (type === "radial") {
      const a = (i / N) * Math.PI * 2, d = 38 + Math.random() * 14;
      vars = { "--tx": `${Math.cos(a) * d}vw`, "--ty": `${Math.sin(a) * d}vh`, "--rot": "0deg" };
    } else {
      w = 7; h = 26; x = (Math.random() * 100) + "%"; y = "-8%";
      vars = { "--tx": `${(Math.random() * 2 - 1) * 18}vw`, "--rot": `${(Math.random() * 2 - 1) * 900}deg` };
    }
    arr.push({ color, w, h, delay, vars, dur, x, y });
  }
  return arr;
}
function Confetti5({ fire }) {
  // Compute the burst ONCE per fire; never regenerate on unrelated re-renders
  // (e.g. scroll/toast state changes) - otherwise the animation restarts.
  const data = React.useMemo(() => {
    if (!fire) return null;
    const types = ["burst", "fountain", "cascade", "radial", "streamer"];
    const type = types[Math.floor(Math.random() * 5)];
    const anim = { burst: "cf-burst", fountain: "cf-burst", cascade: "cf-fall", radial: "cf-burst", streamer: "cf-fall" }[type];
    return { pieces: makePieces(type), anim };
  }, [fire]);
  if (!data) return null;
  return (
    <div key={fire} style={{ position: "fixed", inset: 0, zIndex: 50, pointerEvents: "none", overflow: "hidden" }}>
      {data.pieces.map((p, i) => (
        <span key={i} className="cf-p" style={{ width: p.w, height: p.h, background: p.color, left: p.x, top: p.y, animation: `${data.anim} ${p.dur}ms cubic-bezier(.15,.7,.4,1) ${p.delay}s forwards`, ...p.vars }} />
      ))}
    </div>
  );
}
export default LifestyleLanding;