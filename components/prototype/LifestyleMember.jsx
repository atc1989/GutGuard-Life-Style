"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { persistDose, persistStory } from "@/lib/actions/member";
import { markGutGuardian, requestChange, saveMyDose } from "@/lib/actions/lifestyle";
/* production: a request for Gutguard to confirm, never a change that only shows on screen */
const sendRequest = (kind, detail, flash) => requestChange({ kind, detail }).then((r) => flash(r && r.ok === false ? "Not sent. Check your connection." : "Request sent · Gutguard confirms it before your next refill")).catch(() => flash("Not sent. Check your connection."));
/* Production port (Addendum 05). DEMO=1 brings back the prototype demo bar and seeded data. */
const DEMO = process.env.NEXT_PUBLIC_PROTOTYPE_DEMO === "1";
/* The signed-in member, set by the page before the first render (see LifestyleMemberPage below). */
let LIVE = null;
const WEBSITE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL || "https://gutguard.ph").replace(/\/$/, "");
const HUB_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
const isoDay = (d) => `${Y}-${String(M + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
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
let CARD_NO = "0240 5578 9012 3456";
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
const CH = { call: { label: "Call", tone: C.call }, sms: { label: "SMS", tone: C.sms }, messenger: { label: "Messenger", tone: C.messenger }, viber: { label: "Viber", tone: C.viber } };
const CHANGES = ["More energy", "Better sleep", "Better digestion", "Less discomfort", "Calmer / focused", "Better mood", "Better appetite", "More active", "Clearer skin"];
const SOUND_OPTS = [["jingle", "Jingle"], ["default", "Chime"], ["silent", "Silent"]];
const WD = ["S", "M", "T", "W", "T", "F", "S"];
const now = new Date();
const Y = now.getFullYear(), M = now.getMonth(), TODAY = now.getDate();
const key = (d) => { const x = new Date(Y, M, d); return `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`; }; /* d may be 0 or less: last month */
const keyDate = (k) => { const [a, b, c] = String(k).split("-").map(Number); return new Date(a, b - 1, c); };
/* production: capsules and trial nights count from LIVE.countSince (trial start or current refill) */
const counted = (log) => Object.entries(log).filter(([k]) => !LIVE || !LIVE.countSince || keyDate(k) >= keyDate(LIVE.countSince)).map(([, v]) => v);

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
let STORIES_TOTAL = 1247;
let NEW_STORIES = 5; // new Stories of Hope since the member last opened the tab // total Stories of Hope posted community-wide
let STORIES = [
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
let TEAM = [
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

let ME = { name: "Rey Aquino", phone: "0917 111 2233", city: "Davao City", sponsor: "Ana Cruz", address: "12 Rizal St., Lagao, General Santos City", province: "South Cotabato" };
/* One-time items (Addendum 01 prices). 1 blister = 10 capsules = 1 E-Point; bottle = 3 E-Points */
const peso = (n) => "₱" + n.toLocaleString("en-PH");

/* Dose by goal — Addendum 01, Section 3. Reveille = morning, Taps = night. */
const META = {
  morning: { label: "Reveille", note: "before meals · empty stomach" },
  lunch: { label: "Midday", note: "after lunch" },
  dreams: { label: "Taps", note: "before bedtime" },
};
const DOSE_KEYS = ["morning", "lunch", "dreams"];
const INVITE_URL = HUB_URL ? HUB_URL + "/" : DEMO ? "https://claude.ai/artifact/9tPTTKyCSRCkaeFwuMku3J" : typeof location !== "undefined" ? location.origin + "/" : "/"; /* production: gutguard.ph/lifestyle/join?ref=[member code] */
const GOALS = {
  keep:   { label: "Keep healthy",  level: "Maintenance", glis: "GLIS Moderate",      caps: 2, per: { morning: 1, dreams: 1 }, mo: 6,  q: 18 },
  better: { label: "Feel better",   level: "Support",     glis: "GLIS Slightly High", caps: 4, per: { morning: 2, dreams: 2 }, mo: 12, q: 36 },
  full:   { label: "Full recovery", level: "Intensive",   glis: "GLIS High",          caps: 6, per: { morning: 2, lunch: 2, dreams: 2 }, mo: 18, q: 54 },
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
const hashParts = () => { const doQ = typeof location !== "undefined" ? new URLSearchParams(location.search).get("do") : null; if (doQ && !DEMO) return { stage: "", action: doQ }; let h = (typeof location !== "undefined" ? location.hash : "").replace("#", ""); try { h = decodeURIComponent(h); } catch (e) {} const [a, b] = h.split(/[|~]/); /* "~" from the artifact viewer, which drops "|" */ return b !== undefined ? { stage: a, action: b } : { stage: a, action: a }; };
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
  const [w, setW] = useState(() => typeof matchMedia !== "undefined" && matchMedia(WIDE_Q).matches);
  useEffect(() => { const m = matchMedia(WIDE_Q); const f = () => setW(m.matches); f(); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, []);
  return w;
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

function LifestyleMember() {
  useFieldInView();
  const [stage, setStageRaw] = useState(LIVE ? LIVE.stage : hashStage());
  const [tab, setTab] = useState("health");
  const [flipped, setFlipped] = useState(false);
  const [cardOpen, setCardOpen] = useState(false); // full card from the slim strip
  const wideView = useWide(); // desktop has room for the full card next to the doses
  const [courier, setCourier] = useState("paid"); // paid | shipped | delivered — from the courier status feed
  const [toast, setToast] = useState("");
  const fmtT = (t) => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; };
  const [toolsOpen, setToolsOpen] = useState(() => { try { return localStorage.getItem("gg-tools-open") === "1"; } catch (e) { return false; } }); // closed by default
  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2300); };
  const [fire, setFire] = useState(0);

  const [plan, setPlan] = useState(LIVE ? LIVE.plan : stage === "trial" || stage === "ordered" || stage === "card" ? null : stage === "builder" ? { ...defaultPlan(), goal: "full" } : defaultPlan()); /* demo: the Builder is on Full recovery (6 a day) to show the Midday option */
  const [points, setPoints] = useState(LIVE ? LIVE.points : stage === "card" ? 0 : stage === "trial" || stage === "ordered" ? 1 : 15);
  const [goalChanged, setGoalChanged] = useState(false);
  const [log, setLog] = useState(LIVE ? LIVE.log : stage === "ordered" || stage === "card" ? {} : stage === "trial" ? seedTrial() : seedOwn());
  const [proofs, setProofs] = useState({});
  const [viewDay, setViewDay] = useState(null);
  const fileRef = useRef(null);
  const pending = useRef(null);

  // sheets
  const [builder, setBuilder] = useState(null); // null | { mode: "new" | "plan" | "goal", step }
  const [bGoal, setBGoal] = useState("keep");
  const [bFreq, setBFreq] = useState("monthly");
  const [bPay, setBPay] = useState("card");
  const [bAgree, setBAgree] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(null); // points | skip | pause | payment | cancel | settings
  const [pauseDays, setPauseDays] = useState(30);
  const [leaveWhy, setLeaveWhy] = useState(null);
  const [payPick, setPayPick] = useState("card");
  const [feel, setFeel] = useState({ sleep: 0, energy: 0, digestion: 0 });
  const [feelSaved, setFeelSaved] = useState(false);
  const [times, setTimes] = useState(() => { try { const t = JSON.parse(localStorage.getItem("gg-times") || "null"); if (t && t.morning) return t; } catch (e) {} return { morning: "07:00", lunch: "12:30", dreams: "21:00" }; }); /* reminder times: kept on this phone */
  /* The member's own dose. null = the recommended dose for the goal. Any change shows "Adjusted". */
  const [myDose, setMyDoseRaw] = useState(() => { if (LIVE) return LIVE.dose; try { return JSON.parse(localStorage.getItem("gg-dose") || "null"); } catch (e) { return null; } });
  const setMyDose = (v) => { setMyDoseRaw(v); if (LIVE) { saveMyDose(v || null).catch(() => {}); return; } try { if (v) localStorage.setItem("gg-dose", JSON.stringify(v)); else localStorage.removeItem("gg-dose"); } catch (e) {} };
  const [sound, setSound] = useState("jingle");
  const [lang, setLang] = useState("EN");

  // team (Daily)
  const [detail, setDetail] = useState(null);
  const [teamProofDay, setTeamProofDay] = useState(null);
  const [follow, setFollow] = useState(null);
  const [showChange, setShowChange] = useState(false);
  const [doneFollow, setDoneFollow] = useState({});

  // Story of Hope — consent flow (Daily)
  const [consentOpen, setConsentOpen] = useState(false);
  const [cStep, setCStep] = useState(1);
  const [who, setWho] = useState("self");
  const [subjName, setSubjName] = useState("");
  const [relation, setRelation] = useState("");
  const [changed, setChanged] = useState({});
  const [customList, setCustomList] = useState([]);
  const [customText, setCustomText] = useState("");
  const [lab, setLab] = useState({ before: false, after: false });
  const [labDates, setLabDates] = useState({ before: "", after: "" });
  const [daysField, setDaysField] = useState("");
  const [capsField, setCapsField] = useState("");
  const addCustom = () => { const v = customText.trim(); if (v && !customList.includes(v)) setCustomList((L) => [...L, v]); setCustomText(""); };
  const [story, setStory] = useState("");
  const [cks, setCks] = useState({ a: false, b: false, c: false });
  const [signName, setSignName] = useState("");
  const [refNo, setRefNo] = useState(null);

  const copyMsg = (m) => { try { const r = navigator.clipboard && navigator.clipboard.writeText(m); if (r && r.catch) r.catch(() => {}); } catch (e) {} };
  const goto = (u) => { try { window.open(u, "_blank"); } catch (e) {} };

  /* demo stage switch — not part of the product */
  const setStage = (s) => {
    setStageRaw(s);
    setCourier("paid");
    const wasTrial = stage === "trial" || stage === "ordered" || stage === "card";
    if (s === "card") { setPlan(null); setPoints(0); setLog({}); }
    else if (s === "trial" || s === "ordered") { setPlan(null); setPoints(1); setLog(s === "trial" ? seedTrial() : {}); }
    else { setPlan((p) => (p && p.status !== "cancelled" ? p : defaultPlan())); setPoints((p) => (wasTrial ? 15 : p)); if (wasTrial) setLog(seedOwn()); }
    if (s !== "builder" && tab === "team") setTab("health");
    setFlipped(false);
    try { history.replaceState(null, "", "#" + s); } catch (e) {}
  };
  useEffect(() => {
    /* Option C: members buy on the website Shop. The website sends them back here with |welcome after paying. */
    const { action } = hashParts();
    if (action === "welcome") { setFire((f) => f + 1); flash("Welcome · your order is in and your card is active"); }
    if (action === "manage") setTimeout(() => setSheetOpen("manage"), 300);
    if (action === "guardian") { setFire((f) => f + 1); setTimeout(() => setGuardianMoment("plan"), 400); }
  }, []);
  /* Plans this member pays for (bought for family or friends on the website). Demo: one plan for Nanay. */
  const [gifts, setGifts] = useState(() => LIVE ? [] /* plans paid for others: back-end task (Addendum 05) */ : [{ id: "g1", name: "Lorna Aquino", goal: "Feel better", caps: 4, blisters: 12, freq: "Monthly", amt: 11868, status: "active", next: new Date(+now + 21 * 864e5) }]);
  const [giftSel, setGiftSel] = useState(null);
  const showGifts = (stage === "member" || stage === "builder") && gifts.some((g) => g.status !== "cancelled");

  const startTrial = (auto) => { setStageRaw("trial"); setLog({}); try { history.replaceState(null, "", "#trial"); } catch (e) {} setFire((f) => f + 1); flash(auto ? "Your pack was delivered · Night 1 starts tonight" : "Night 1 starts tonight · 1 capsule at Taps"); };
  useEffect(() => { if (courier === "delivered" && stage === "ordered") startTrial(true); }, [courier]);
  const isCard = stage === "card";                    // free card, nothing bought yet
  const isWaiting = stage === "ordered";               // ₱499 paid, pack not yet arrived
  const isTrial = stage === "trial" || isWaiting;
  const isBuilder = stage === "builder";
  /* Gut Guardian: earned by finishing the 5-Night Watch, or by starting with any pack or plan. Card-only and trial members are Lifestyle Members. */
  const [guardianEarned, setEarnedRaw] = useState(() => { if (LIVE) return LIVE.guardian; try { return localStorage.getItem("gg-guardian") === "1"; } catch (e) { return false; } });
  const setEarned = () => { setEarnedRaw(true); if (LIVE) { (LIVE.lastSave || Promise.resolve()).then(() => markGutGuardian()).catch(() => {}); return; } try { localStorage.setItem("gg-guardian", "1"); } catch (e) {} };
  const [guardianMoment, setGuardianMoment] = useState(null); /* null | "watch" (Night 5 done) | "plan" (first pack or plan) */
  const isGuardian = stage === "member" || stage === "base" || (stage === "trial" && guardianEarned);
  const tier = isBuilder ? "GENTREP · 2LT" : isGuardian ? "GUT GUARDIAN" : "LIFESTYLE MEMBER";
  const active = plan && plan.status === "active";
  const G = plan ? GOALS[plan.goal] : null;

  // dose
  // 5-Night Watch = 10 capsules: Night 1 Taps · Days 2–5 Reveille + Taps · Day 6 Reveille
  const recDose = isTrial ? { morning: 1, lunch: 0, dreams: 1 } : { morning: 0, lunch: 0, dreams: 0, ...(G ? G.per : { morning: 1, dreams: 1 }) };
  const canAdjust = !isTrial && !isWaiting && !isCard; /* the 5-Night Watch dose is fixed */
  const dose = canAdjust && myDose ? myDose : recDose;
  const adjusted = canAdjust && !!myDose && DOSE_KEYS.some((k) => (myDose[k] || 0) !== (recDose[k] || 0));
  const stepDose = (k, d) => { const n = { ...dose, [k]: Math.max(0, Math.min(4, (dose[k] || 0) + d)) }; if (DOSE_KEYS.reduce((a, x) => a + n[x], 0) < 1) return; setMyDose(DOSE_KEYS.every((x) => n[x] === recDose[x]) ? null : n); };
  const nightNow = isWaiting || isCard ? 0 : Math.min(5, counted(log).length + 1);
  const SLOTS = isWaiting || isCard ? [] : isTrial && nightNow === 1 ? ["dreams"] : ["morning", "lunch", "dreams"].filter((k) => dose[k] > 0);
  const DAILY = SLOTS.reduce((a, k) => a + dose[k], 0);
  const perRefill = plan ? (plan.qty || (plan.freq === "monthly" ? G.mo : G.q)) : 0;

  /* Buying happens on the website Shop (Addendum 04). These open it, logged in. */
  const SITE_SHOP = DEMO ? "https://claude.ai/artifact/EU7uvgH4zxnXT3E4DSpiRo#/shop" : WEBSITE_URL + "/shop"; /* production: https://gutguard.ph/#/shop, same tab */
  const siteWho = stage === "card" ? "card" : stage === "ordered" || stage === "trial" ? "trial" : "sub";
  /* Links to the website Shop are real <a> links (new tab in the demo). A page opened by script (window.open) is refused
     by the artifact viewer for most people, and the viewer passes only a plain #word, so the Shop reads tokens:
     #shop~who-sub~tab-protocol. Production: same domain, same tab, normal /shop?tab=protocol links. */
  const shopHref = (q) => SITE + "#shop~who-" + siteWho + (q ? "~" + q : "");
  const SHOP_PLAN = "tab-subscribe~goal-" + (plan ? plan.goal : "better");
  const extLink = (q) => ({ href: shopHref(q), target: "_blank", rel: "noopener" });
  const aBtn = { display: "block", boxSizing: "border-box", textDecoration: "none", textAlign: "center" };
  const TOTAL_CAPS = isTrial ? 10 : Math.max(perRefill * 10, 60);

  const dayLog = (d) => log[key(d)] || {};
  /* Each day is judged by the doses planned that day, so switching to 3 times a day does not break past streaks */
  const slotsFor = (d) => { if (d === TODAY) return SLOTS; const L = dayLog(d); return L.slots || SLOTS.filter((s) => s !== "lunch" || L.lunch); };
  const doneCount = (d) => slotsFor(d).filter((s) => dayLog(d)[s]).length;
  const dayFull = (d) => slotsFor(d).length > 0 && doneCount(d) === slotsFor(d).length;
  let takenCaps = 0;
  /* capsules taken: each day counted with its own dose, so the supply does not jump when the member adjusts */
  const perSlot = (day) => day.dose || recDose; /* each day keeps the dose it was taken with */
  counted(log).forEach((day) => ["morning", "lunch", "dreams"].forEach((s) => { if (day[s]) takenCaps += perSlot(day)[s] || 0; }));
  const remaining = Math.max(0, TOTAL_CAPS - takenCaps);
  const daysLeft = DAILY ? Math.floor(remaining / DAILY) : 0;
  let streak = 0;
  for (let d = TODAY; d >= TODAY - 119 && SLOTS.length; d--) { if (dayFull(d)) streak++; else if (d !== TODAY) break; else continue; }
  const todayDone = doneCount(TODAY);
  const daysUsed = counted(log).length;
  const proofDays = Object.values(log).filter((d) => d.proof).length;
  const night = isWaiting ? 0 : Math.min(5, daysUsed + 1);
  const protocolDay = Math.min(90, daysUsed + 1);
  const phaseIdx = protocolDay <= 28 ? 0 : protocolDay <= 56 ? 1 : 2;

  // billing (calendar months)
  const cycle = plan ? (plan.freq === "monthly" ? 1 : 3) : 1;
  const nextRefill = plan ? addMonths(plan.start, cycle * (1 + plan.skips)) : null;
  const refillAmt = plan ? perRefill * PRICE[plan.freq] : 0;
  const bioDay = [30, 60, 90].find((d) => d >= protocolDay) || 90;

  const confirm = (slot, withProof, dataUrl) => {
    setLog((L) => { const t = { ...(L[key(TODAY)] || {}) }; t[slot] = true; t.slots = SLOTS; t.dose = dose; if (withProof) t.proof = true; return { ...L, [key(TODAY)]: t }; });
    if (LIVE) LIVE.lastSave = persistDose(isoDay(TODAY), slot === "lunch" ? "midday" : slot, true).then((r) => { if (r && r.ok === false) flash("Not saved. Check your connection."); }).catch(() => flash("Not saved. Check your connection."));
    if (withProof && dataUrl) setProofs((P) => ({ ...P, [`${key(TODAY)}-${slot}`]: dataUrl }));
    setFire((f) => f + 1);
    const left = SLOTS.filter((s) => s !== slot && !dayLog(TODAY)[s]).length;
    if (isTrial && night === 5 && slot === "dreams" && !guardianEarned) { setEarned(); setTimeout(() => setGuardianMoment("watch"), 700); return; } /* Night 5 Taps: the watch is complete */
    flash(left === 0 ? "Today's watch is complete." : `${META[slot].label} done. Watch kept.`); /* the Gut Guardian voice lives in the moments */
  };
  const onPhoto = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f || !pending.current) return;
    const slot = pending.current;
    const r = new FileReader();
    r.onload = () => confirm(slot, true, r.result);
    r.readAsDataURL(f);
    e.target.value = ""; pending.current = null;
  };
  const openCam = (slot) => { pending.current = slot; fileRef.current && fileRef.current.click(); };

  // team (Daily)
  const rows = TEAM.map((p) => { const a = analyze(p.log); const dl = Math.floor(p.capsLeft / 4); return { ...p, ...a, daysLeft: dl, rf: refillOf(dl) }; })
    .sort((x, z) => ORDER[x.status] - ORDER[z.status] || x.daysLeft - z.daysLeft);
  const need = rows.filter((r) => r.status !== "drinking").length;
  const stoppedCount = rows.filter((r) => r.status === "stopped").length;
  const drinkingCount = rows.length - need;
  const refillCount = rows.filter((r) => r.rf).length;
  const contact = (p, channel) => {
    const msg = template(p.name, p.via, p.status, p.rf);
    const enc = encodeURIComponent(msg);
    if (channel === "call") { goto(`tel:${p.phone}`); flash(`Calling ${p.via || p.name}...`); }
    else if (channel === "sms") { goto(`sms:${p.phone}?body=${enc}`); flash("Opening SMS..."); }
    else if (channel === "messenger") { copyMsg(msg); goto(`https://m.me/${p.messenger}`); flash("Copied - paste in Messenger"); }
    else { copyMsg(msg); goto(`viber://chat?number=${encodeURIComponent(p.phone)}`); flash("Copied - paste in Viber"); }
    setDoneFollow((d) => ({ ...d, [p.name]: true })); setFollow(null); setShowChange(false);
  };

  // Story of Hope (Daily)
  const changedCount = Object.values(changed).filter(Boolean).length + customList.length;
  const expOk = (changedCount > 0 || story.trim().length > 4) && Number(daysField) > 0 && Number(capsField) > 0;
  const otherOk = who === "self" || (subjName.trim().length > 2 && relation.trim().length > 1);
  const consentValid = cks.a && cks.b && cks.c && signName.trim().length > 2 && expOk && otherOk;
  const submitConsent = () => {
    if (LIVE) persistStory({ about: story.trim() || Object.keys(changed).filter((k) => changed[k]).concat(customList).join(", "), relationship: who === "other" ? `${subjName.trim()} (${relation.trim()})` : undefined, days: String(daysField), capsules: String(capsField), outcomes: Object.keys(changed).filter((k) => changed[k]).concat(customList) }).catch(() => {});
    const ref = "GG-" + Y + String(M + 1).padStart(2, "0") + String(TODAY).padStart(2, "0") + "-" + Math.floor(1000 + Math.random() * 9000);
    setRefNo(ref); setCStep(5); setFire((f) => f + 1);
  };

  // calendar (Daily)
  const firstWeekday = new Date(Y, M, 1).getDay();
  const daysInMonth = new Date(Y, M + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const trialStart = TODAY - counted(log).length;
  const firstLogged = Object.keys(log).reduce((m, k) => { const [yy, mm, dd] = k.split("-").map(Number); return yy === Y && mm === M + 1 ? Math.min(m, dd) : m; }, TODAY);
  const cellState = (d) => {
    if (d > TODAY || (isTrial && d < trialStart) || (!isTrial && d < firstLogged)) return "future";
    const n = doneCount(d);
    if (dayFull(d)) return dayLog(d).proof ? "proof" : "full";
    if (n > 0) return "partial";
    if (d === TODAY) return "today";
    return "missed";
  };
  const monthName = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  /* ---------------- plan builder ---------------- */
  const openBuilder = (mode) => {
    if (mode === "new") { setBGoal("keep"); setBFreq("monthly"); setBPay("card"); setBAgree(false); }
    else { setBGoal(plan.goal); setBFreq(plan.freq); }
    setBuilder({ mode, step: mode === "plan" ? 2 : 1 });
  };
  const bG = GOALS[bGoal];
  const bBlisters = bFreq === "monthly" ? bG.mo : bG.q;
  const bAmt = bBlisters * PRICE[bFreq];
  const creditOk = DEMO && isTrial && bFreq === "monthly";
  const bToday = bAmt - (creditOk ? TRIAL_CREDIT : 0);
  const bNext = addMonths(now, bFreq === "monthly" ? 1 : 3);
  const payNow = () => {
    const earned = bBlisters;
    setPlan({ goal: bGoal, freq: bFreq, pay: bPay, status: "active", start: new Date(now), skips: 0, pausedUntil: null });
    setPoints((p) => p + earned);
    if (isTrial || isCard) { setStageRaw("member"); try { history.replaceState(null, "", "#member"); } catch (e) {} }
    setBuilder(null); setFire((f) => f + 1);
    flash(`Payment confirmed · +${earned} E-Points`);
  };
  const saveChange = () => {
    if (LIVE) { sendRequest(builder.mode === "goal" ? "goal" : "payment", { goal: bGoal, freq: bFreq }, flash); setBuilder(null); return; }
    if (builder.mode === "goal" && bGoal !== plan.goal) setGoalChanged(true);
    setPlan((p) => ({ ...p, goal: bGoal, freq: bFreq }));
    setBuilder(null);
    flash(`Saved · applies from your next refill`);
  };

  const Steps = ({ n }) => (
    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
      {["Goal", "Plan", "Pay"].map((l, i) => (
        <div key={l} style={{ flex: 1 }}>
          <div style={{ height: 4, borderRadius: 3, background: i < n ? C.blue : C.line }} />
          <div className="osw" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: i < n ? C.blue : C.mute, marginTop: 5, fontWeight: 600 }}>{i + 1} · {l}</div>
        </div>
      ))}
    </div>
  );

  /* ---------------- render ---------------- */
  const wordmark = (
    <div className="g-w" style={{ fontSize: 18, fontWeight: 800, color: B.navy, whiteSpace: "nowrap" }}>
      Gutguard<span style={{ fontFamily: "var(--font-fraunces),'Fraunces', Georgia, serif", fontStyle: "italic", fontWeight: 600, color: B.brand, marginLeft: 4 }}>Lifestyle</span>
    </div>
  );
  const tabs = [
    { id: "health", label: "My Health", icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" /> },
    { id: "story", label: "My Story", icon: <><path d="M23 6l-9.5 9.5-5-5L1 18" /><path d="M17 6h6v6" /></> },
    ...(isBuilder ? [{ id: "team", label: "My Team", icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>, badge: need }] : []),
  ];

  const planSection = (<>
          {/* ---- MY PLAN ---- */}
          {!isCard && <div className="g-m" style={sectionLbl}>My plan</div>}
          {isCard ? null : (!plan || plan.status === "cancelled") ? (
            <div style={{ ...LIGHT }}>
              <div className="g-m" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#7E6035", fontWeight: 600 }}>{isTrial ? "After Night 5" : plan ? "Start again" : "Gutguard Daily"}</div>
              <div className="osw gx-h" style={{ fontSize: 20, fontWeight: 700, marginTop: 6, lineHeight: 1.25 }}>{isTrial ? "Keep going with your plan" : plan ? "Your plan is cancelled" : "Never run out"}</div>
              <div className="inr" style={{ fontSize: 13.5, color: C.mute, marginTop: 8, lineHeight: 1.5 }}>
                {isTrial ? <>Choose your goal. We show how many blisters you need.{DEMO ? <> Your <b style={{ color: C.ink }}>{peso(TRIAL_CREDIT)} credit</b> comes off your first monthly order.</> : null}</> : plan ? "Choose your goal and plan to start again anytime." : "Two questions and your cart is ready. Delivered every month or every 3 months."}
              </div>
              <a className="tap" {...extLink(SHOP_PLAN)} style={todayDone < SLOTS.length && !isWaiting ? { ...cta, ...aBtn, background: "transparent", color: C.cta, border: `1.5px solid ${C.cta}`, boxShadow: "none", fontWeight: 700 } : { ...cta, ...aBtn, background: C.cta, color: C.onCta, fontWeight: 700 }}>{isTrial ? "Choose my plan" : "Choose a plan in the Shop"}</a>
            </div>
          ) : (
            <div style={box}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="gx-h" style={{ fontSize: 19, color: C.navy }}>Gutguard Daily · {plan.freq === "monthly" ? "Monthly" : "Every 3 months"}</div>
                <span style={pill(plan.status === "active" ? C.good : C.goldD)}>{plan.status === "active" ? "ACTIVE" : "PAUSED"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 12 }}>
                <span className="inr" style={{ fontSize: 13, color: C.mute }}>{plan.status === "paused" ? "Starts again" : "Next refill"}</span>
                <span className="gx-h" style={{ fontSize: 18, color: C.navy }}>{plan.status === "paused" ? fmtDate(plan.pausedUntil) : `${fmtDate(nextRefill)} · ${peso(refillAmt)}`}</span>
              </div>
              <div className="inr" style={{ fontSize: 12.5, color: C.mute, marginTop: 6, lineHeight: 1.5 }}>{G.label} · {G.caps} a day · {perRefill} blisters · {PAY[plan.pay].short}</div>
              {plan.status === "paused"
                ? <button className="tap" onClick={() => { setPlan((p) => ({ ...p, status: "active", pausedUntil: null, start: new Date(now) })); flash("Welcome back · plan resumed"); }} style={{ ...cta, background: C.blue }}>Resume now</button>
                : <button className="tap" onClick={() => setSheetOpen("manage")} style={{ ...manageBtn, width: "100%", marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>Manage my plan <span style={{ color: C.blue }}>&rsaquo;</span></button>}
            </div>
          )}

          {/* ---- PLANS YOU PAY FOR — bought for someone else on the website ---- */}
          {showGifts && (<>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginTop: 22, marginBottom: 8 }}><div className="g-m" style={{ ...sectionLbl, margin: 0 }}>Family you guard</div><span className="inr" style={{ fontSize: 12, color: C.mute }}>Plans you pay for</span></div>
            {gifts.filter((g) => g.status !== "cancelled").map((g) => (
              <button key={g.id} className="tap" onClick={() => { setGiftSel(g.id); setSheetOpen("gift"); }} style={{ ...box, width: "100%", display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "14px 16px" }}>
                <span className="g-m" style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid #D8D2C2", background: "#F4F1EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#7E6035", flexShrink: 0 }}>{g.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="gx-h" style={{ display: "block", fontSize: 17, color: C.navy }}>{g.name}</span>
                  <span className="inr" style={{ display: "block", fontSize: 12.5, color: C.mute, marginTop: 2 }}>{g.status === "paused" ? "Paused" : `${g.goal} · next refill ${fmtDate(g.next)} · ${peso(g.amt)}`}</span>
                </span>
                <span className="g-m" style={{ fontSize: 11, letterSpacing: ".06em", color: C.blue, whiteSpace: "nowrap" }}>MANAGE ›</span>
              </button>
            ))}
          </>)}

          {/* ---- GUARD SOMEONE — the Gut Guardian's duty to others (advocacy), for members who have earned the name ---- */}
          {isGuardian && !isTrial && (
            <div style={{ ...box, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid #C9AC7E", background: "#FCFAF5", color: "#7E6035", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{LI.shield(19)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="gx-h" style={{ fontSize: 18, color: C.navy }}>Guard someone</div>
                  <div className="inr" style={{ fontSize: 12.5, color: C.mute, marginTop: 2 }}>Gut Guardians don&rsquo;t guard alone.</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                <button className="tap" onClick={() => setSheetOpen("invite")} style={{ ...choice(false), margin: 0, padding: "11px 10px", justifyContent: "center", textAlign: "center", fontSize: 13.5, fontWeight: 600, color: C.blue }}>Invite family</button>
                <button className="tap" onClick={() => { setConsentOpen(true); setCStep(refNo ? 5 : 1); setDaysField(String(daysUsed)); setCapsField(String(DAILY)); }} style={{ ...choice(false), margin: 0, padding: "11px 10px", justifyContent: "center", textAlign: "center", fontSize: 13.5, fontWeight: 600, color: C.blue }}>Share my story</button>
              </div>
            </div>
          )}

          {/* ---- BioScan — shown on My Health only in the week before a check ---- */}
          {!isTrial && !isCard && bioDay - protocolDay <= 7 && (
            <div style={{ ...box, marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 42, height: 42, borderRadius: "50%", border: "1px solid #D8D2C2", background: C.paper, display: "flex", alignItems: "center", justifyContent: "center", color: C.good, flexShrink: 0 }}>{LI.scan(20)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="osw" style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>BioScan · Day {bioDay}</span>
                  <span style={pill(C.goldD)}>BETA</span>
                </div>
                <div className="inr" style={{ fontSize: 12.5, color: C.mute, marginTop: 2 }}>Your next check is in {bioDay - protocolDay} days. Checks on Day 30, 60 and 90.</div>
              </div>
            </div>
          )}
  </>);
  return (
    <div className="g" style={{ minHeight: "100vh", background: B.field, display: "flex", flexDirection: "column" }}>
      <Style />
      <style>{`
        .osw{font-family:var(--font-inter-tight),'Inter Tight',system-ui,sans-serif;} .ant{font-family:var(--font-fraunces),'Fraunces',system-ui,sans-serif;letter-spacing:.2px;} .baloo{font-family:var(--font-inter-tight),'Inter Tight',system-ui,sans-serif;} .inr{font-family:var(--font-inter-tight),'Inter Tight',system-ui,sans-serif;}
        button{font-family:var(--font-inter-tight),'Inter Tight',system-ui,sans-serif;}
        input,textarea{font-family:var(--font-inter-tight),'Inter Tight',system-ui,sans-serif;}
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
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPhoto} style={{ display: "none" }} />
      <Confetti5 fire={fire} />

      {/* demo controls — not part of the product */}
      <div style={{ display: DEMO ? "block" : "none", background: "#fff", borderBottom: `1px solid ${B.edge}`, padding: "7px 12px" }}>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>
          <div className="g-m" style={{ fontSize: 8.5, letterSpacing: ".12em", color: B.amberDeep, textAlign: "center", marginBottom: 5, fontWeight: 700 }}>DEMO · MEMBER STAGE (NOT PART OF THE PRODUCT)</div>

          {stage === "trial" && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <button onClick={() => { setEarned(); setFire((f) => f + 1); setGuardianMoment("watch"); }} className="g-m" style={{ fontSize: 9, letterSpacing: ".05em", padding: "5px 10px", borderRadius: 99, border: `1px solid ${B.amberDeep}`, color: B.amberDeep, fontWeight: 700 }}>SHOW: NIGHT 5 DONE</button>
            </div>
          )}
          {stage === "ordered" && (
            <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 6 }}>
              <span className="g-m" style={{ fontSize: 8.5, letterSpacing: ".08em", color: B.ledger, alignSelf: "center" }}>COURIER FEED:</span>
              {[["paid", "PAID"], ["shipped", "SHIPPED"], ["delivered", "DELIVERED"]].map(([k, l]) => (
                <button key={k} onClick={() => setCourier(k)} className="g-m" style={{ fontSize: 9, letterSpacing: ".05em", padding: "5px 10px", borderRadius: 99, border: `1px solid ${courier === k ? B.amberDeep : B.edge}`, color: courier === k ? B.amberDeep : B.ledger, fontWeight: courier === k ? 700 : 500 }}>{l}</button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 2, background: B.edge, borderRadius: 8, padding: 3 }}>
            {STAGES.map(([k, l]) => (
              <button key={k} onClick={() => setStage(k)} className="g-m" style={{ flex: 1, fontSize: 9, letterSpacing: ".05em", padding: "8px 3px", borderRadius: 6, color: stage === k ? B.blue : B.ledger, background: stage === k ? "#fff" : "transparent", fontWeight: stage === k ? 700 : 500, textAlign: "center" }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="gg-shell">
      <div className="gg-body">
      <WebNav right={<>
        <button className="lw-pts tap" onClick={() => setSheetOpen("points")} aria-label={points + " E-Points"}><b>{points}</b><span>E-POINTS</span></button>
        <a className="lw-icon tap" {...extLink("")} aria-label="Shop"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 11h14l-1 9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" /><path d="M9 11 12 4l3 7" /><line x1="3" y1="11" x2="21" y2="11" /></svg></a>
        <button className="lw-icon tap" onClick={() => setSheetOpen("settings")} aria-label="Settings"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg></button>
      </>} />
      <div className="lw-tabs"><div className="lw-tabs-in">
        {tabs.map((t) => <button key={t.id} className={"lw-tab" + (tab === t.id ? " on" : "")} onClick={() => { setTab(t.id); window.scrollTo(0, 0); }}>{t.label}{t.badge > 0 && <span className="bd">{t.badge}</span>}</button>)}
      </div></div>

      <main className="gg-main" style={{ flex: 1, padding: "18px 16px 104px", margin: "0 auto", width: "100%" }}>

        {/* ============ SHOP: Dosing guide → Review and pay → Done ============ */}
        {tab === "health" && (<section className="fade cols sticky-l"><div className="col-l">
          <div className="lw-greet">Kumusta, {ME.name.split(" ")[0]}.</div>
          <div className="lw-greet-sub">{isBuilder ? <span className="lw-id gg">{LI.shield(13)} Gut Guardian · Gentrep</span> : <span className={"lw-id" + (isGuardian ? " gg" : "")}>{isGuardian ? <>{LI.shield(13)} Gut Guardian</> : isTrial ? `Lifestyle Member · ${Math.max(1, 6 - night)} night${6 - night === 1 ? "" : "s"} to Gut Guardian` : "Lifestyle Member"}</span>}{isTrial ? null : <>{" · "}{new Date(now).toLocaleDateString("en-PH", { weekday: "long", day: "numeric", month: "long" })}</>}</div>
          {/* Day 1 (card only, pack on its way): the full card. After that, today's doses come first and the card becomes a slim strip. */}
          {isCard || isWaiting || wideView ? (<>
          <MemberCard flipped={flipped} onFlip={() => setFlipped((f) => !f)} name={ME.name} tier={tier} points={points} onPoints={() => setSheetOpen("points")} />
          <div className="g-m" style={{ textAlign: "center", fontSize: 11.5, color: B.ledger, margin: "10px 0 2px" }}>Tap the card to show your QR at events.</div>
          </>) : (
          <div style={{ display: "flex", alignItems: "stretch", borderRadius: 16, overflow: "hidden", background: "#FCFAF5", border: "1px solid #D8D2C2" }}>
            <button className="tap" onClick={() => { setFlipped(false); setCardOpen(true); }} aria-label="Show my Lifestyle card and QR" style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", textAlign: "left", color: C.ink, minWidth: 0 }}>
              <span className="lw-sc" style={{ width: 52, height: 33, borderRadius: 6, background: "linear-gradient(135deg,#0A31B4,#00249C 60%,#001a73)", flexShrink: 0, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 3, boxShadow: "0 6px 14px -8px rgba(0,36,156,.8)" }}><span style={{ width: 13, height: 13, background: "#fff", borderRadius: 2, display: "flex" }}><QR seed={ME.name} size={13} /></span></span>
              <span style={{ minWidth: 0 }}>
                <span className="gx-h" style={{ display: "block", fontSize: 18, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ME.name}</span>
                <span className="g-m" style={{ display: "block", fontSize: 10.5, letterSpacing: ".08em", color: isGuardian ? "#7E6035" : "#6B6B7A", fontWeight: isGuardian ? 600 : 400, marginTop: 3 }}>{tier}</span>
              </span>
              <span className="g-m lw-scta" style={{ marginLeft: "auto", fontSize: 11, letterSpacing: ".06em", color: C.blue, whiteSpace: "nowrap" }}>CARD ›</span>
            </button>
            <button className="tap lw-sp" onClick={() => setSheetOpen("points")} aria-label={points + " E-Points"} style={{ padding: "8px 16px", borderLeft: "1px solid #D8D2C2", textAlign: "center" }}>
              <span className="ant" style={{ display: "block", fontSize: 24, color: "#7E6035", lineHeight: 1 }}>{points}</span>
              <span className="g-m" style={{ display: "block", fontSize: 10, letterSpacing: ".08em", color: "#6B6B7A", marginTop: 3 }}>E-POINTS</span>
            </button>
          </div>
          )}
          {/* BUSINESS TOOLS — Builders only, right under the card */}
          {isBuilder && (
            <div style={{ ...box, marginTop: 12, padding: toolsOpen ? "12px 12px 10px" : "12px 12px" }}>
              <button onClick={() => setToolsOpen((v) => { const n = !v; try { localStorage.setItem("gg-tools-open", n ? "1" : "0"); } catch (e) {} return n; })} aria-expanded={toolsOpen} aria-controls="gg-tools" style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "2px 2px", marginBottom: toolsOpen ? 10 : 0, textAlign: "left" }}>
                <span className="g-m" style={{ ...sectionLbl, margin: 0, flex: 1 }}>Business tools</span>
                {!toolsOpen && <span style={{ display: "flex", gap: 4 }}>{APPS.map((a) => <span key={a.id} aria-hidden style={{ width: 22, height: 22, borderRadius: 6, background: a.tone, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{LI[APP_ICON[a.id]](13)}</span>)}</span>}
                {toolsOpen && <span className="inr" style={{ fontSize: 11, color: C.mute }}>Same login</span>}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: C.mute, transition: "transform .2s", transform: toolsOpen ? "rotate(180deg)" : "none", flexShrink: 0 }}><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {toolsOpen && <div id="gg-tools" className="fade" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
                {APPS.map((a) => (
                  <button key={a.id} className="tap" onClick={() => flash(`Opening ${a.name}...`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "12px 6px 10px", borderRadius: 12, background: C.paper, border: `1px solid ${C.line}`, textAlign: "center" }}>
                    <span style={{ width: 42, height: 42, borderRadius: 11, background: a.tone, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{LI[APP_ICON[a.id]](20)}</span>
                    <span className="osw" style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, lineHeight: 1.2 }}>{a.name}</span>
                    <span className="osw" style={{ fontSize: 11, fontWeight: 600, color: C.blue }}>Open &rsaquo;</span>
                  </button>
                ))}
              </div>}
            </div>
          )}
          {isWaiting && (
            <div style={{ ...box, marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="gx-h" style={{ fontSize: 19, color: C.navy }}>5-Night Watch</div>
                <span style={pill(C.goldD)}>ON ITS WAY</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
                {[["Paid", true], ["Shipped", courier !== "paid"], ["Delivered", courier === "delivered"]].map(([l, on], i) => (
                  <React.Fragment key={l}>
                    {i > 0 && <span style={{ flex: 1, height: 2, background: on ? C.good : C.line }} />}
                    <span className="inr" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: on ? C.good : C.mute }}><span style={{ width: 16, height: 16, borderRadius: "50%", background: on ? C.good : C.line, color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{on ? "\u2713" : ""}</span>{l}</span>
                  </React.Fragment>
                ))}
              </div>
              <div className="inr" style={{ fontSize: 13, color: C.mute, marginTop: 10, lineHeight: 1.55 }}>{courier === "paid" ? (DEMO ? "10 capsules. We text you when it ships." : "10 capsules. Night 1 starts the day it is delivered.") : "On its way with the courier. Night 1 starts by itself the day it is delivered."}</div>
              {courier === "shipped" && <button className="tap" onClick={() => flash("Opens the courier tracking page")} style={{ ...cta, background: C.blue }}>Track my order</button>}
              <button className="tap" onClick={startTrial} style={{ display: "block", margin: "12px auto 0", fontSize: 12.5, fontWeight: 600, color: C.blue, textDecoration: "underline", textUnderlineOffset: 3 }}>Already have your pack? Start Night 1 now</button>
            </div>
          )}
          {isTrial && !isWaiting && (
            <div style={{ ...box, marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="gx-h" style={{ fontSize: 19, color: C.navy }}>5-Night Watch</div>
                <span style={pill(C.blue)}>NIGHT {night} OF 5</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                <div style={{ flex: 1 }}><SeamBar pct={(night / 5) * 100} marks={5} /></div>
              </div>
              <div className="inr" style={{ fontSize: 13.5, color: C.ink, marginTop: 12, lineHeight: 1.5 }}>{night === 1 ? "Tonight: 1 capsule at Taps." : night < 5 ? "Today: 1 at Reveille and 1 at Taps." : "Last night tonight. Tonight's Taps makes you a Gut Guardian."}</div>
            </div>
          )}

          <div className="lw-wide">{planSection}</div>
          </div><div className="col-r">
          {isCard && (
            <div style={{ ...LIGHT, marginTop: 16 }}>
              <div className="g-m" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#7E6035", fontWeight: 600 }}>Your first step</div>
              <div className="osw gx-h" style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>5-Night Watch</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                <span className="ant" style={{ fontSize: 30, color: C.ink }}>{peso(499)}</span>
                <span className="inr" style={{ fontSize: 13, color: C.mute }}>{shipShort()} · +1 E-Point</span>
              </div>
              <div className="inr" style={{ fontSize: 13.5, color: C.mute, marginTop: 8, lineHeight: 1.5 }}>10 capsules for 5 nights. Finish them and you become a <b style={{ color: C.ink }}>Gut Guardian</b>. If you continue monthly, the {peso(499)} comes off your first month.</div>
              <a className="tap" {...extLink("start-watch")} style={{ ...cta, ...aBtn, background: C.cta, color: C.onCta, fontWeight: 700 }}>Start my 5 nights</a>
              <a className="tap" {...extLink(SHOP_PLAN)} style={{ display: "block", textAlign: "center", margin: "12px auto 0", fontSize: 13, fontWeight: 600, color: C.ink, textDecoration: "underline", textUnderlineOffset: 3 }}>or skip the trial and choose a plan</a>
            </div>
          )}
          {!isWaiting && !isCard && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "22px 2px 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div className="g-m" style={{ ...sectionLbl, margin: 0 }}>{night === 1 ? "Tonight's dose" : "Today's doses"}</div>{adjusted ? <button className="lw-adj" onClick={() => setSheetOpen("settings")} aria-label="Adjusted dose. Open Settings">Adjusted</button> : null}</div>
            <div className="g-m" style={{ fontSize: 11, color: todayDone === SLOTS.length ? C.good : C.mute, letterSpacing: ".06em" }}>{todayDone === SLOTS.length ? "ALL DONE ✓" : fmtT(times[SLOTS.find((x) => !dayLog(TODAY)[x]) || SLOTS[0]]) + " NEXT"}</div>
          </div>}
          {plan && plan.status === "paused" ? (
            <div className="inr" style={{ ...box, fontSize: 13.5, color: C.mute }}>Your plan is paused. Doses start again on <b style={{ color: C.navy }}>{fmtDate(plan.pausedUntil)}</b>.</div>
          ) : SLOTS.map((s) => {
            const done = dayLog(TODAY)[s];
            const ph = proofs[`${key(TODAY)}-${s}`];
            const isNext = !done && s === SLOTS.find((x) => !dayLog(TODAY)[x]);
            return (
              <div key={s} className={"lw-dose" + (done ? " done" : isNext ? " next" : "")}>
                <span className="ic">{done ? LI.check(20) : SLOT_ICON[s](20)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="gx-h" style={{ fontSize: 20, color: C.navy, lineHeight: 1.1 }}>{META[s].label}{isNext && <span className="tag">NEXT</span>}</div>
                  <div className="meta"><b style={{ color: C.ink, fontWeight: 600, whiteSpace: "nowrap" }}>{fmtT(times[s])}</b> · <span style={{ whiteSpace: "nowrap" }}>{dose[s]} capsule{dose[s] > 1 ? "s" : ""}</span></div>
                  {!done && <div className="nt">{META[s].note}</div>}
                </div>
                {done ? (<>
                  {ph && <img src={ph} alt="" style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover" }} />}
                  <button className="lw-undo" onClick={() => { setLog((L) => { const t = { ...(L[key(TODAY)] || {}) }; delete t[s]; return { ...L, [key(TODAY)]: t }; }); flash(`${META[s].label} undone`); }}>{LI.undo(14)} Undo</button>
                </>) : (<>
                  <button className="lw-cam tap" onClick={() => openCam(s)} aria-label={`Take a photo of your ${META[s].label} dose`}>{LI.camera(19)}</button>
                  <button className={"lw-done tap" + (isNext ? "" : " soft")} onClick={() => confirm(s, false)}>Done</button>
                </>)}
              </div>
            );
          })}
          {!isWaiting && !isCard && <StatRow items={[isTrial ? [6 - night, "Nights left"] : [`${daysLeft}d`, "Supply left", daysLeft <= 5], [streak, "Day streak"], [`${todayDone}/${SLOTS.length}`, "Today"]]} />}
          {!isTrial && !isCard && daysLeft <= 5 && !active && <div className="lw-note">{LI.capsule(16)} Running low. <a {...extLink("tab-protocol")}>Get more in the Shop</a></div>}
          {!isTrial && !isCard && daysLeft <= 5 && active && <div className="lw-note">{LI.truck(16)} Your refill arrives {fmtDate(nextRefill)}.</div>}

          <div className="lw-narrow">{planSection}</div>


          </div>
        </section>)}

        {/* ============ MY STORY ============ */}
        {tab === "story" && (<section className="fade cols sticky-l"><div className="col-l">
          <div style={{ ...LIGHT, textAlign: "center" }}>
            <div className="inr" style={{ color: C.mute, fontSize: 13 }}>{isCard ? "Your Gutguard journey" : isTrial ? "Your 5-Night Watch · Night 5 makes you a Gut Guardian" : "Your 90-Day Protocol"}</div>
            {isGuardian && !isTrial ? <div className="g-m lw-id gg" style={{ display: "flex", justifyContent: "center", marginTop: 4, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase" }}>{LI.shield(12)} Gut Guardian since {fmtDate(planStart)}</div> : null}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><Capsule w={96} /></div>
            <div className="ant" style={{ color: C.ink, fontSize: isWaiting ? 44 : 62, lineHeight: 1, margin: "4px 0" }}>{isCard ? "Day 0" : isWaiting ? "On its way" : isTrial ? `Night ${night}` : `Day ${protocolDay}`}</div>
            <div className="inr" style={{ color: C.mute, fontSize: 13 }}>{isCard ? "starts with your first pack" : `of ${isTrial ? 5 : 90}`}</div>
            <div style={{ marginTop: 16 }}><SeamBar h={8} pct={Math.round(((isTrial ? night : protocolDay) / (isTrial ? 5 : 90)) * 100)} marks={isTrial ? 5 : 3} /></div>
            {!isTrial && !isCard && (
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                {PHASES.map(([p, w], i) => (
                  <div key={p} style={{ flex: 1, borderRadius: 9, padding: "7px 4px", background: i === phaseIdx ? "#EFE3CC" : "#F4F1EA", color: i === phaseIdx ? C.ink : C.mute, border: i === phaseIdx ? "1px solid #C9AC7E" : "1px solid transparent" }}>
                    <div className="osw" style={{ fontSize: 12.5, fontWeight: 700 }}>{p}</div>
                    <div className="inr" style={{ fontSize: 10.5, opacity: .85 }}>{w}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="inr" style={{ color: C.mute, fontSize: 12, marginTop: 10 }}>{!isTrial && !isCard ? <>Next BioScan: <b style={{ color: C.ink }}>Day {bioDay}</b> (Beta) · </> : null}Padayon lang — every day counts.</div>
          </div>

          {!isCard && <StatRow items={[[daysUsed, "Days taken"], [streak, "Day streak"], [proofDays, "With photo"]]} />}
          {!isWaiting && !isCard && <><div className="gx-h" style={{ fontSize: 20, color: C.navy, margin: "24px 0 12px" }}>{monthName}</div>
          <div className="lw-cal">
            {WD.map((w, i) => <div key={"h" + i} className="wd">{w}</div>)}
            {cells.map((d, i) => {
              if (!d) return <div key={"b" + i} className="c" style={{ background: "#F7F4EE" }} />;
              const st = cellState(d);
              const dot = st === "proof" || st === "full" ? "full" : st === "partial" ? "half" : st === "missed" ? "miss" : null;
              return (
                <button key={d} className={"c" + (st === "future" ? " fu" : "") + (d === TODAY ? " td" : "")} onClick={() => doneCount(d) > 0 && setViewDay(d)} aria-label={`Day ${d}`}>
                  {st === "proof" && <span className="ph">{LI.camera(11)}</span>}
                  <span>{d}</span>
                  <span className={"dt" + (dot ? " " + dot : "")} style={dot ? null : { background: "transparent" }} />
                </button>
              );
            })}
          </div>
          <div className="lw-legend"><span><i style={{ background: "#1E6FB8" }} />All doses</span><span><i style={{ background: "linear-gradient(90deg,#1E6FB8 50%,#D8D2C2 50%)" }} />Some</span><span><i style={{ background: "#E7B8A6" }} />Missed</span><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{LI.camera(11)} Photo</span></div></>}

          {/* BASE — only while BASE is in progress */}
          {stage === "base" && (
            <div style={{ marginTop: 12, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.line}`, background: C.card }}>
              <div style={{ background: "#F4F1EA", borderBottom: "1px solid #D8D2C2", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="g-m" style={{ fontSize: 10.5, letterSpacing: ".14em", color: "#7E6035", fontWeight: 600 }}>BASE ACTIVATION</div>
                  <div className="osw gx-h" style={{ fontSize: 19, fontWeight: 700, color: C.ink, marginTop: 2 }}>{BASE_DONE} of 5 done</div>
                </div>
                <div style={{ fontSize: 22, letterSpacing: 2 }}>{[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ color: i < BASE_DONE ? "#C9AC7E" : "#E2DCCD" }}>&#9733;</span>)}</div>
              </div>
              <div style={{ padding: "6px 16px 12px" }}>
                {BASE_STEPS.map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: i < 4 ? `1px solid ${C.line}` : "none" }}>
                    <span style={{ fontSize: 17, color: i < BASE_DONE ? C.gold : "#c3ccd8" }}>&#9733;</span>
                    <span className="inr" style={{ flex: 1, fontSize: 14, fontWeight: 600, color: i < BASE_DONE ? C.navy : C.mute }}>{s}</span>
                    <span className="inr" style={{ fontSize: 12, fontWeight: 600, color: i < BASE_DONE ? C.good : i === BASE_DONE ? C.blue : C.mute }}>{i < BASE_DONE ? "Done" : i === BASE_DONE ? "Next" : ""}</span>
                  </div>
                ))}
                <div className="inr" style={{ fontSize: 12.5, color: C.mute, marginTop: 10, lineHeight: 1.5 }}>Your sponsor, <b style={{ color: C.navy }}>{ME.sponsor}</b>, guides each step. My Team opens when BASE is complete and you enrol as a Builder.</div>
              </div>
            </div>
          )}

          {/* How I feel — weekly check */}
          {!isCard && <div style={{ ...box, marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div className="osw" style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: C.mute, fontWeight: 600 }}>How I feel this week</div>
              <div className="inr" style={{ fontSize: 11.5, color: C.mute }}>1 low · 5 great</div>
            </div>
            {[["sleep", "Sleep"], ["energy", "Energy"], ["digestion", "Digestion"]].map(([k, l]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 11 }}>
                <span className="inr" style={{ width: 78, fontSize: 13.5, fontWeight: 600, color: C.navy }}>{l}</span>
                <div style={{ flex: 1, display: "flex", gap: 6 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} className="tap" onClick={() => { setFeel((f) => ({ ...f, [k]: n })); setFeelSaved(false); }} style={{ flex: 1, height: 36, borderRadius: 9, fontSize: 14, fontWeight: 700, textAlign: "center", background: feel[k] === n ? C.navy : C.paper, color: feel[k] === n ? "#fff" : C.navy, border: `1px solid ${feel[k] === n ? C.navy : C.line}` }}>{n}</button>
                  ))}
                </div>
              </div>
            ))}
            <button className="tap" disabled={!(feel.sleep && feel.energy && feel.digestion) || feelSaved} onClick={() => { setFeelSaved(true); if (LIVE) { try { localStorage.setItem("gg-feel-" + isoDay(TODAY), JSON.stringify(feel)); } catch (e) {} flash("Saved on this phone · next check in 7 days"); return; } flash("Saved · next check in 7 days"); }} style={{ ...cta, marginTop: 14, padding: 13, fontSize: 15, background: feelSaved ? C.good : (feel.sleep && feel.energy && feel.digestion) ? C.blue : "#c3ccd8" }}>{feelSaved ? "Saved ✓" : "Save this week"}</button>
          </div>}

          </div><div className="col-r">
          {!isCard && <>
          <button className="tap" onClick={() => { setConsentOpen(true); setCStep(refNo ? 5 : 1); setDaysField(String(daysUsed)); setCapsField(String(DAILY)); }} style={{ width: "100%", marginTop: 16, padding: "16px", borderRadius: 100, fontSize: 16, fontWeight: 600, color: "#FCFAF5", background: C.blue, textAlign: "center" }}>
            {refNo ? "My Story of Hope · " + refNo : "Share my Story of Hope"}
          </button>
          <p className="inr" style={{ fontSize: 12, color: C.mute, textAlign: "center", marginTop: 9, lineHeight: 1.5 }}>Your story is the reward — no points, no cash. It is shared only with your consent.</p>
          </>}

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "26px 0 12px" }}>
            <div className="gx-h" style={{ fontSize: 19, color: C.navy }}>Stories of Hope</div>
            <div className="inr" style={{ fontSize: 12.5, color: C.mute }}><b className="osw" style={{ color: C.gold, fontSize: 15 }}>{STORIES_TOTAL.toLocaleString()}</b> shared so far</div>
          </div>
          {!STORIES.length ? <div className="inr" style={{ fontSize: 13, color: C.mute, padding: "6px 2px 10px" }}>No approved stories yet. Yours could be the first.</div> : null}
          {STORIES.slice(0, 6).map((st, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "13px 14px", marginBottom: 9 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="osw" style={{ width: 34, height: 34, borderRadius: "50%", background: C.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{st.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="inr" style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{st.name} {st.city ? <span style={{ color: C.mute, fontWeight: 400, fontSize: 12 }}>· {st.city}</span> : null}</div>
                  <div className="inr" style={{ fontSize: 11.5, color: C.mute }}>Day {st.days}{st.ago ? ` · ${st.ago} ago` : ""}</div>
                </div>
              </div>
              <div className="inr" style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.5, marginTop: 9 }}>“{st.text}”</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
                {st.tags.map((tg) => <span key={tg} className="inr" style={{ fontSize: 11, fontWeight: 600, color: C.good, background: C.goodBg, borderRadius: 20, padding: "3px 9px" }}>{tg}</span>)}
              </div>
            </div>
          ))}
          {(stage === "trial" || stage === "member") && (
            <p className="inr" style={{ fontSize: 12.5, color: C.mute, textAlign: "center", margin: "18px 0 4px" }}>Interested in building with Gutguard? <b style={{ color: C.navy }}>Ask your sponsor.</b></p>
          )}
          </div>
        </section>)}

        {/* ============ MY TEAM — Builders only ============ */}
        {tab === "team" && isBuilder && (<section className="fade cols sticky-l"><div className="col-l">
          <div className="g-m" style={{ ...sectionLbl, margin: "0 0 4px" }}>Gentrep · 2Lt</div>
          <div className="osw gx-h" style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 12 }}>My Team</div>
          <StatRow items={[[rows.length, "Members"], [drinkingCount + 1, "Active this month"], [LIVE ? 0 : 2, "Pay-ins this week"]]} />


          </div><div className="col-r">
          <div className="g-m" style={{ ...sectionLbl, margin: "28px 0 4px" }}>Gut Guardian Community</div>
          <div className="inr" style={{ fontSize: 13, color: C.mute, marginBottom: 12 }}>
            <b style={{ color: C.good }}>{drinkingCount} drinking</b> · <b style={{ color: need ? C.clay : C.mute }}>{need} need you</b> · <b style={{ color: refillCount ? C.gold : C.mute }}>{refillCount} refill</b>
          </div>
          {rows.map((p) => {
            const st = ST[p.status];
            return (
              <div key={p.name} className="tap" role="button" tabIndex={0} aria-label={`Open ${p.name}'s calendar and proof`} onClick={() => { setDetail(p); setTeamProofDay(null); }} onKeyDown={(e) => { if (e.key === "Enter") { setDetail(p); setTeamProofDay(null); } }} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 18px", marginBottom: 12, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="gx-h" style={{ fontSize: 19 }}>{p.name}{p.via && <span style={{ color: C.mute, fontWeight: 400, fontSize: 12.5 }}> · via {p.via}</span>}</div>
                    <div className="inr" style={{ fontSize: 12.5, color: C.ink, fontWeight: 600, marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
                      <i style={{ width: 8, height: 8, borderRadius: "50%", background: st.tone, display: "inline-block" }} />{st.label}<span style={{ color: C.mute, fontWeight: 400 }}>{p.status === "drinking" ? ` · ${p.streak}-day streak` : ` · last dose ${p.last === 0 ? "today" : p.last === 1 ? "yesterday" : p.last === null ? "over 4 weeks ago" : p.last + " days ago"}`}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="osw gx-h" style={{ fontSize: 20, fontWeight: 700, color: p.rf ? p.rf.tone : C.navy, lineHeight: 1 }}>{p.capsLeft}</div>
                    <div className="osw" style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.mute }}>caps left</div>
                  </div>
                </div>
                {p.rf && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 9, background: `${p.rf.tone}15`, border: `1px solid ${p.rf.tone}66`, borderRadius: 20, padding: "4px 11px" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.rf.tone }} />
                    <span className="inr" style={{ fontSize: 12, fontWeight: 600, color: p.rf.tone }}>{p.rf.label}</span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                  <span className="g-m" style={{ fontSize: 10.5, letterSpacing: ".08em", color: C.mute }}>LAST 7 DAYS</span>
                  <span style={{ display: "flex", gap: 7 }}>
                  {Array.from({ length: 7 }).map((_, i) => {
                    const back = 6 - i, d = TODAY - back;
                    const t = d >= 1 && p.log[key(d)]?.taken;
                    const ph = d >= 1 && p.log[key(d)]?.proof;
                    return <span key={i} title={t ? (ph ? "Taken, with photo" : "Taken") : "Missed"} style={{ width: 12, height: 12, borderRadius: "50%", background: t ? "#1E6FB8" : back === 0 ? "transparent" : "#E7B8A6", boxShadow: ph ? "0 0 0 2px #FCFAF5, 0 0 0 3.5px #1E6FB8" : back === 0 && !t ? "inset 0 0 0 1.5px #0608A9" : "none" }} />;
                  })}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 11 }}>
                  <span className="g-m" style={{ flex: 1, fontSize: 11, letterSpacing: ".06em", color: C.blue }}>CALENDAR & PROOF ›</span>
                  {(p.status !== "drinking" || p.daysLeft <= 5) && (
                    <button className="tap" onClick={(e) => { e.stopPropagation(); setFollow(p); setShowChange(false); }} style={{ padding: "9px 18px", borderRadius: 100, fontSize: 13.5, fontWeight: 600, textAlign: "center", color: doneFollow[p.name] ? C.mute : p.status === "stopped" ? "#FCFAF5" : C.blue, background: doneFollow[p.name] ? "transparent" : p.status === "stopped" ? C.blue : "transparent", border: doneFollow[p.name] ? "1.5px solid #D8D2C2" : `1.5px solid ${C.blue}` }}>{doneFollow[p.name] ? "Followed up ✓" : "Follow up"}</button>
                  )}
                </div>
              </div>
            );
          })}
          <p className="inr" style={{ fontSize: 11.5, color: C.mute, textAlign: "center", marginTop: 6 }}>Income and genealogy are in GG Verse.</p>
          </div>
        </section>)}

                {/* ---- own proof viewer ---- */}
        {viewDay && (
          <Overlay onClose={() => setViewDay(null)} center>
            <div style={{ background: C.card, borderRadius: 16, overflow: "hidden", maxWidth: 330, width: "100%" }}>
              <div style={{ background: C.navy, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="osw" style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{monthName.split(" ")[0]} {viewDay}</span>
                <span className="osw" style={{ color: C.good, fontSize: 13, fontWeight: 600 }}>{doneCount(viewDay)}/{SLOTS.length} taken</span>
              </div>
              <div style={{ padding: 16 }}>
                {SLOTS.map((s) => {
                  const ph = proofs[`${key(viewDay)}-${s}`];
                  const done = dayLog(viewDay)[s];
                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                      <span className="inr" style={{ flex: 1, fontSize: 14, fontWeight: 500, color: done ? C.ink : C.mute }}>{META[s].label}</span>
                      {ph ? <img src={ph} alt="" style={{ width: 34, height: 34, borderRadius: 6, objectFit: "cover" }} /> : done ? <span className="osw" style={{ color: C.good, fontSize: 18 }}>&#10003;</span> : <span className="inr" style={{ color: C.mute, fontSize: 12 }}>missed</span>}
                    </div>
                  );
                })}
                <button className="tap" onClick={() => setViewDay(null)} style={{ width: "100%", marginTop: 14, padding: "13px", borderRadius: 10, fontSize: 15, fontWeight: 600, color: "#fff", background: C.blue }}>Close</button>
              </div>
            </div>
          </Overlay>
        )}

        {/* ---- team drilldown ---- */}
        {detail && (
          <Overlay onClose={() => setDetail(null)}>
            <div className="up" style={sheet}>
              <SheetHead title={detail.name} sub={`${ST[detail.status].label} · ${detail.capsLeft} caps left`} subColor={ST[detail.status].tone} onClose={() => setDetail(null)} />
              <TeamCalendar log={detail.log} onDay={(d) => detail.log[key(d)]?.taken && setTeamProofDay(d)} />
              {teamProofDay ? (
                <div className="fade" style={{ marginTop: 14, background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ background: C.navy, padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
                    <span className="osw" style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{now.toLocaleString("en-US", { month: "short" })} {teamProofDay}</span>
                    <span className="osw" style={{ color: C.good, fontSize: 13, fontWeight: 600 }}>&#10003; Taken</span>
                  </div>
                  <div className="inr" style={{ padding: "20px 16px", textAlign: "center", color: C.mute, fontSize: 14 }}>
                    {detail.log[key(teamProofDay)]?.proof ? "Photo proof on file (from server in real build)" : "Confirmed - no photo (self-reported)"}
                  </div>
                </div>
              ) : <p className="inr" style={{ fontSize: 12, color: C.mute, textAlign: "center", marginTop: 12 }}>Tap a checked day to see its proof.</p>}
            </div>
          </Overlay>
        )}

        {/* ---- follow-up sheet ---- */}
        {follow && (
          <Overlay onClose={() => { setFollow(null); setShowChange(false); }}>
            <div className="up" style={sheet}>
              <SheetHead title={`Follow up · ${follow.name}`} onClose={() => { setFollow(null); setShowChange(false); }} />
              <div className="inr" style={{ fontSize: 15, background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "13px 15px", lineHeight: 1.45 }}>{template(follow.name, follow.via, follow.status, follow.rf)}</div>
              {!showChange ? (
                <div style={{ marginTop: 13 }}>
                  <button className="tap" onClick={() => contact(follow, follow.defaultCh)} style={{ width: "100%", padding: "16px", borderRadius: 11, fontSize: 17, fontWeight: 600, color: "#fff", background: CH[follow.defaultCh].tone }}>Send by {CH[follow.defaultCh].label}</button>
                  <button className="tap" onClick={() => setShowChange(true)} style={{ display: "block", margin: "10px auto 0", background: "transparent", color: C.mute, fontSize: 13.5, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>Change channel</button>
                </div>
              ) : (
                <div className="fade" style={{ marginTop: 13, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                  {Object.keys(CH).map((k) => <button key={k} className="tap" onClick={() => contact(follow, k)} style={{ padding: "15px 8px", borderRadius: 11, fontSize: 15, fontWeight: 600, color: "#fff", background: CH[k].tone }}>{CH[k].label}</button>)}
                </div>
              )}
            </div>
          </Overlay>
        )}

        {/* ---- STORY OF HOPE - basic consent (V1 essentials) ---- */}
        {consentOpen && (
          <Overlay onClose={() => setConsentOpen(false)}>
            <div className="up" style={{ ...sheet, maxHeight: "92vh", overflowY: "auto" }}>
              <SheetHead title="Story of Hope" sub={cStep < 5 ? `Step ${cStep} of 4` : "Salamat!"} onClose={() => setConsentOpen(false)} />

              {cStep === 1 && (
                <div className="fade">
                  <p className="inr" style={{ fontSize: 14, color: C.mute, margin: "0 0 12px", lineHeight: 1.5 }}>Whose story is this? <span style={{ fontStyle: "italic" }}>Para kanino ang kwento?</span></p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                    <button className="tap" onClick={() => setWho("self")} style={whoBtn(who === "self")}>My own story<br /><span style={{ fontSize: 11.5, fontWeight: 400, opacity: .8 }}>Aking karanasan</span></button>
                    <button className="tap" onClick={() => setWho("other")} style={whoBtn(who === "other")}>A family member<br /><span style={{ fontSize: 11.5, fontWeight: 400, opacity: .8 }}>e.g. my child, my father</span></button>
                  </div>
                  {who === "other" && (
                    <div className="fade" style={{ marginTop: 12, borderLeft: `3px solid ${C.gold}`, paddingLeft: 12 }}>
                      <label className="osw" style={lbl}>Their name</label>
                      <input value={subjName} onChange={(e) => setSubjName(e.target.value)} placeholder="e.g. Pedro Dela Cruz" style={inp} />
                      <label className="osw" style={{ ...lbl, marginTop: 10 }}>Your relationship</label>
                      <input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="e.g. my son, my mother" style={inp} />
                      <p className="inr" style={{ fontSize: 11.5, color: C.mute, marginTop: 8 }}>By continuing you confirm you may give consent for them (as parent, guardian, or with their permission).</p>
                    </div>
                  )}
                  <button className="tap" onClick={() => setCStep(2)} disabled={!otherOk} style={{ ...cta, opacity: otherOk ? 1 : 0.4 }}>Next →</button>
                </div>
              )}

              {cStep === 2 && (
                <div className="fade">
                  <p className="inr" style={{ fontSize: 13.5, color: C.mute, margin: "0 0 12px" }}>Already filled from your record — just check it.</p>
                  <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "13px 15px" }}>
                    {[["Shared by", ME.name], ["Mobile", ME.phone], ["Location", ME.city], ["Sponsor", ME.sponsor], ["Team", ME.team], ...(who === "other" ? [["Story about", `${subjName} (${relation})`]] : [])].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.line}` }}>
                        <span className="osw" style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.mute }}>{k}</span>
                        <span className="inr" style={{ fontSize: 13.5, fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
                    <button className="tap" onClick={() => setCStep(1)} style={ghost}>Back</button>
                    <button className="tap" onClick={() => setCStep(3)} style={{ ...cta, flex: 1, marginTop: 0 }}>Looks right →</button>
                  </div>
                </div>
              )}

              {cStep === 3 && (
                <div className="fade">
                  <label className="osw" style={lbl}>What got better? <span style={{ color: C.mute, fontWeight: 400, fontSize: 12 }}>tap all that apply</span></label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
                    {CHANGES.map((c) => {
                      const on = !!changed[c];
                      return (
                        <button key={c} className="tap" onClick={() => setChanged((x) => ({ ...x, [c]: !x[c] }))} style={{ padding: "10px 14px", borderRadius: 22, fontSize: 13.5, fontWeight: 600, background: on ? C.good : C.card, color: on ? "#fff" : C.ink, border: `1.5px solid ${on ? C.good : C.line}` }}>
                          {on ? "✓ " : ""}{c}
                        </button>
                      );
                    })}
                    {customList.map((c) => (
                      <button key={c} className="tap" onClick={() => setCustomList((L) => L.filter((x) => x !== c))} style={{ padding: "10px 14px", borderRadius: 22, fontSize: 13.5, fontWeight: 600, background: C.good, color: "#fff", border: `1.5px solid ${C.good}` }}>
                        ✓ {c} <span style={{ opacity: .8, marginLeft: 2 }}>✕</span>
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 9 }}>
                    <input value={customText} onChange={(e) => setCustomText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} placeholder="Others — add your own" style={{ ...inp, flex: 1 }} />
                    <button className="tap" onClick={addCustom} disabled={!customText.trim()} style={{ ...cta, marginTop: 0, width: "auto", padding: "0 18px", fontSize: 15, opacity: customText.trim() ? 1 : 0.4 }}>Add</button>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label className="osw" style={lbl}>Days taking Gutguard</label>
                      <input type="number" inputMode="numeric" value={daysField} onChange={(e) => setDaysField(e.target.value)} placeholder="e.g. 45" style={inp} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="osw" style={lbl}>Capsules per day</label>
                      <input type="number" inputMode="numeric" value={capsField} onChange={(e) => setCapsField(e.target.value)} placeholder="e.g. 4" style={inp} />
                    </div>
                  </div>
                  <p className="inr" style={{ fontSize: 11.5, color: C.mute, marginTop: 7 }}>Pre-filled from the record — adjust if the story is about someone else.</p>

                  <label className="osw" style={{ ...lbl, marginTop: 18 }}>Do you have laboratory test results? <span style={{ color: C.mute, fontWeight: 400, fontSize: 12 }}>optional</span></label>
                  {[["before", "Before starting Gutguard"], ["after", "After taking Gutguard"]].map(([k, label]) => (
                    <div key={k} style={{ background: C.card, border: `1.5px solid ${lab[k] ? C.good : C.line}`, borderRadius: 11, padding: "11px 13px", marginBottom: 8 }}>
                      <label style={{ display: "flex", gap: 11, alignItems: "center", cursor: "pointer" }}>
                        <input type="checkbox" checked={lab[k]} onChange={() => setLab((x) => ({ ...x, [k]: !x[k] }))} style={{ width: 19, height: 19, accentColor: C.good, flexShrink: 0 }} />
                        <span className="inr" style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{label}</span>
                      </label>
                      {lab[k] && (
                        <div className="fade" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 9, paddingLeft: 30 }}>
                          <span className="inr" style={{ fontSize: 12.5, color: C.mute }}>Test date</span>
                          <input type="date" value={labDates[k]} onChange={(e) => setLabDates((d) => ({ ...d, [k]: e.target.value }))} style={{ fontSize: 14, fontWeight: 600, padding: "7px 10px", border: `1.5px solid ${C.line}`, borderRadius: 9, background: C.paper, color: C.navy }} />
                        </div>
                      )}
                    </div>
                  ))}
                  <p className="inr" style={{ fontSize: 11.5, color: C.mute, marginTop: 2, marginBottom: 2 }}>Your sponsor can help you upload the actual results later.</p>

                  <label className="osw" style={{ ...lbl, marginTop: 16 }}>Anything else? <span style={{ color: C.mute, fontWeight: 400, fontSize: 12 }}>optional</span></label>
                  <textarea value={story} onChange={(e) => setStory(e.target.value)} placeholder="Isang linya lang — in your own words." style={{ ...inp, minHeight: 78, lineHeight: 1.5, resize: "vertical" }} />
                  <p className="inr" style={{ fontSize: 11.5, color: C.mute, marginTop: 7 }}>Genuine experience only — Gutguard is a food supplement, not a medicine.</p>

                  <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
                    <button className="tap" onClick={() => setCStep(2)} style={ghost}>Back</button>
                    <button className="tap" onClick={() => setCStep(4)} disabled={!expOk} style={{ ...cta, flex: 1, marginTop: 0, opacity: expOk ? 1 : 0.4 }}>Next →</button>
                  </div>
                </div>
              )}

              {cStep === 4 && (
                <div className="fade">
                  {[["a", "This story is truthful and shared voluntarily."], ["b", "I allow Gutguard to use this story, name, and photo in its materials, and to process the data under the Data Privacy Act (RA 10173). I can withdraw anytime."], ["c", "I understand Gutguard is a food supplement with no approved therapeutic claims — results vary."]].map(([k, t]) => (
                    <label key={k} style={{ display: "flex", gap: 11, alignItems: "flex-start", background: C.card, border: `1.5px solid ${cks[k] ? C.good : C.line}`, borderRadius: 11, padding: "12px 13px", marginBottom: 9, cursor: "pointer" }}>
                      <input type="checkbox" checked={cks[k]} onChange={() => setCks((c) => ({ ...c, [k]: !c[k] }))} style={{ width: 19, height: 19, accentColor: C.good, marginTop: 1, flexShrink: 0 }} />
                      <span className="inr" style={{ fontSize: 13, lineHeight: 1.45 }}>{t}</span>
                    </label>
                  ))}
                  <label className="osw" style={{ ...lbl, marginTop: 12 }}>Sign with your full name <span style={{ color: C.clay }}>*</span></label>
                  <input value={signName} onChange={(e) => setSignName(e.target.value)} placeholder={ME.name} style={{ ...inp, fontSize: 17, fontStyle: "italic" }} />
                  <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
                    <button className="tap" onClick={() => setCStep(3)} style={ghost}>Back</button>
                    <button className="tap" onClick={submitConsent} disabled={!consentValid} style={{ ...cta, flex: 1, marginTop: 0, background: C.good, opacity: consentValid ? 1 : 0.4 }}>Sign & share</button>
                  </div>
                </div>
              )}

              {cStep === 5 && (
                <div className="fade" style={{ textAlign: "center", padding: "14px 0 6px" }}>
                  <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.good, color: "#fff", fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>&#10003;</div>
                  <div className="osw" style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>Salamat, {ME.name.split(" ")[0]}!</div>
                  <div className="inr" style={{ fontSize: 14, color: C.mute, marginTop: 6, lineHeight: 1.55 }}>Your Story of Hope is recorded.<br />Reference <b style={{ color: C.navy }}>{refNo}</b></div>
                  <div className="inr" style={{ fontSize: 12, color: C.mute, marginTop: 12, background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 13px", lineHeight: 1.5 }}>A copy of your consent and the privacy notice will be sent to you. Your sponsor may follow up to add a photo or lab records — optional.</div>
                  <button className="tap" onClick={() => setConsentOpen(false)} style={{ ...cta, background: C.navy }}>Done</button>
                </div>
              )}
            </div>
          </Overlay>
        )}


        {/* ---- PLAN BUILDER ---- */}
        {builder && (
          <Overlay onClose={() => setBuilder(null)}>
            <div className="up" style={{ ...sheet, maxHeight: "92vh", overflowY: "auto" }}>
              <SheetHead title={builder.mode === "new" ? "Choose my plan" : builder.mode === "plan" ? "Change plan" : "Change goal"} sub={builder.mode === "new" ? (isTrial ? `${peso(TRIAL_CREDIT)} credit on your first monthly order` : "Gutguard Daily subscription") : "Applies from your next refill"} subColor={builder.mode === "new" && isTrial ? C.good : undefined} onClose={() => setBuilder(null)} />
              {builder.mode === "new" && <Steps n={builder.step} />}

              {builder.step === 1 && (<div className="fade">
                <div className="osw" style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 10 }}>What is your goal?</div>
                {Object.entries(GOALS).map(([k, g]) => (
                  <button key={k} className="tap" onClick={() => setBGoal(k)} style={choice(bGoal === k)}>
                    <span style={radio(bGoal === k)} />
                    <span style={{ flex: 1 }}>
                      <span className="osw" style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.navy }}>{g.label}</span>
                      <span className="inr" style={{ display: "block", fontSize: 12, color: C.mute, marginTop: 2 }}>If you have a GLIS score: {g.glis.replace("GLIS ", "")}</span>
                    </span>
                    <span style={{ textAlign: "right" }}>
                      <span className="ant" style={{ display: "block", fontSize: 22, color: C.navy, lineHeight: 1 }}>{g.caps}</span>
                      <span className="osw" style={{ fontSize: 9, letterSpacing: .5, textTransform: "uppercase", color: C.mute }}>a day</span>
                    </span>
                  </button>
                ))}
                <div className="inr" style={{ fontSize: 12, color: C.mute, lineHeight: 1.5, marginTop: 4 }}>Half at Reveille, half at Taps. {bGoal === "full" ? "A Gutguard coach calls you within 48 hours to welcome you." : "No GLIS score? Just choose how you want to feel."}</div>
                {builder.mode === "goal" && <div className="inr" style={{ fontSize: 12, color: C.goldD, fontWeight: 600, marginTop: 8 }}>You can change your goal once before your first BioScan.</div>}
                {builder.mode === "goal"
                  ? <button className="tap" onClick={() => setBuilder({ ...builder, step: 2 })} style={{ ...cta, background: C.blue }}>Next</button>
                  : <button className="tap" onClick={() => setBuilder({ ...builder, step: 2 })} style={{ ...cta, background: C.blue }}>Next · see my blisters</button>}
              </div>)}

              {builder.step === 2 && (<div className="fade">
                <div style={{ ...LIGHT, padding: "16px 16px", textAlign: "center" }}>
                  <div className="inr" style={{ fontSize: 12.5, color: C.mute }}>{bG.label} · {bG.caps} capsules a day</div>
                  <div className="osw gx-h" style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>You need <span className="ant" style={{ fontSize: 34, color: C.gold, letterSpacing: .5 }}>{bG.mo}</span> blisters a month</div>
                </div>
                <div className="osw" style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: "16px 0 10px" }}>How often?</div>
                {[["monthly", "Monthly", bG.mo, "every month"], ["quarterly", "Every 3 months", bG.q, "every 3 months"]].map(([k, l, n, per]) => (
                  <button key={k} className="tap" onClick={() => setBFreq(k)} style={choice(bFreq === k)}>
                    <span style={radio(bFreq === k)} />
                    <span style={{ flex: 1 }}>
                      <span className="osw" style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.navy }}>{l} <span style={{ ...pill(C.good), marginLeft: 4, fontSize: 9.5, ...(k === "quarterly" ? { background: C.good, color: "#FCFAF5", borderColor: C.good } : null) }}>SAVE {Math.floor((1 - PRICE[k] / 1499) * 100)}%</span></span>
                      <span className="inr" style={{ display: "block", fontSize: 12, color: C.mute, marginTop: 2 }}>{n} blisters {per} · {peso(PRICE[k])} each</span>
                    </span>
                    <span style={{ textAlign: "right" }}>
                      <span className="osw" style={{ display: "block", fontSize: 15, fontWeight: 700, color: C.navy }}>{peso(n * PRICE[k])}</span>
                      <span className="inr" style={{ fontSize: 11, color: C.goldD, fontWeight: 600 }}>+{n} E-Points</span>
                    </span>
                  </button>
                ))}
                <div className="inr" style={{ fontSize: 11.5, color: C.mute, margin: "2px 2px 4px" }}>Savings compared with buying single Blisters at {peso(1499)}.</div>
                {DEMO && isTrial && builder.mode === "new" && <div className="inr" style={{ fontSize: 12, color: bFreq === "monthly" ? C.good : C.mute, fontWeight: 600, marginTop: 2 }}>{bFreq === "monthly" ? `Your ${peso(TRIAL_CREDIT)} credit comes off your first month.` : `The ${peso(TRIAL_CREDIT)} credit is for Monthly plans only.`}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  {builder.mode !== "plan" && <button className="tap" onClick={() => setBuilder({ ...builder, step: 1 })} style={{ ...ghost, marginTop: 16 }}>Back</button>}
                  {builder.mode === "new"
                    ? <button className="tap" onClick={() => setBuilder({ ...builder, step: 3 })} style={{ ...cta, background: C.blue }}>Next · pay</button>
                    : <button className="tap" onClick={saveChange} style={{ ...cta, background: C.blue }}>Save change</button>}
                </div>
              </div>)}

              {builder.step === 3 && (<div className="fade">
                <div style={{ ...box, padding: "6px 14px" }}>
                  {[
                    ["Goal", `${bG.label} · ${bG.caps} a day`],
                    ["Plan", `${bFreq === "monthly" ? "Monthly" : "Every 3 months"} · ${bBlisters} blisters`],
                    ["Each refill", peso(bAmt)],
                    ...(creditOk ? [["Trial credit", "−" + peso(TRIAL_CREDIT)]] : []),
                    ["Next charge", fmtDate(bNext)],
                    ["E-Points each refill", `+${bBlisters}`],
                  ].map(([a, b]) => (
                    <div key={a} style={rowLine}>
                      <span className="inr" style={{ fontSize: 13, color: C.mute }}>{a}</span>
                      <span className="inr" style={{ fontSize: 13.5, fontWeight: 600, color: a === "Trial credit" ? C.good : a === "E-Points each refill" ? C.goldD : C.ink }}>{b}</span>
                    </div>
                  ))}
                  <div style={{ ...rowLine, borderBottom: "none" }}>
                    <span className="osw" style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Pay today</span>
                    <span className="ant" style={{ fontSize: 24, color: C.navy }}>{peso(bToday)}</span>
                  </div>
                </div>
                <div className="osw" style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: "16px 0 10px" }}>Pay with</div>
                {Object.entries(PAY).map(([k, p]) => (
                  <button key={k} className="tap" onClick={() => setBPay(k)} style={choice(bPay === k)}>
                    <span style={radio(bPay === k)} />
                    <span style={{ flex: 1 }}>
                      <span className="osw" style={{ display: "block", fontSize: 15, fontWeight: 700, color: C.navy }}>{p.label}</span>
                      <span className="inr" style={{ display: "block", fontSize: 12, color: C.mute, marginTop: 2 }}>{p.note}</span>
                    </span>
                  </button>
                ))}
                <label className="inr" style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12.5, color: C.ink, lineHeight: 1.5, marginTop: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={bAgree} onChange={(e) => setBAgree(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, accentColor: C.blue, flexShrink: 0 }} />
                  <span>I agree to the <u>Subscription Terms</u> and <u>Privacy Notice</u>. My plan renews {bFreq === "monthly" ? "every month" : "every 3 months"} until I cancel.</span>
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="tap" onClick={() => setBuilder({ ...builder, step: 2 })} style={{ ...ghost, marginTop: 16 }}>Back</button>
                  <button className="tap" disabled={!bAgree} onClick={payNow} style={{ ...cta, background: bAgree ? C.gold : "#c3ccd8", color: bAgree ? C.navy : "#fff", fontWeight: 700 }}>{bPay === "gcash" ? `Get GCash link · ${peso(bToday)}` : `Pay ${peso(bToday)}`}</button>
                </div>
                <div className="inr" style={{ fontSize: 11.5, color: C.mute, textAlign: "center", marginTop: 10 }}>Change, skip, pause or cancel anytime on this page.</div>
              </div>)}
            </div>
          </Overlay>
        )}

        {/* ---- E-POINTS ---- */}
        {sheetOpen === "points" && (
          <Overlay onClose={() => setSheetOpen(null)}>
            <div className="up" style={{ ...sheet, maxHeight: "90vh", overflowY: "auto" }}>
              <SheetHead title="E-Points" sub="1 E-Point for every blister you pay for" onClose={() => setSheetOpen(null)} />
              <div style={{ background: `linear-gradient(150deg, ${B.royal}, #001B75)`, borderRadius: 16, padding: "18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div className="g-ant" style={{ fontSize: 44, color: B.amber, lineHeight: .9 }}>{points}</div>
                  <div className="g-m" style={{ fontSize: 9, letterSpacing: ".16em", color: "rgba(255,255,255,.65)", marginTop: 4 }}>E-POINTS</div>
                </div>
                <div className="inr" style={{ textAlign: "right", color: "#fff", fontSize: 13, lineHeight: 1.5 }}>
                  {active ? <>+{perRefill} on your next refill<br /><span style={{ color: "rgba(255,255,255,.65)" }}>{fmtDate(nextRefill)}</span></> : isTrial ? <>Earned from your<br />5-Night Watch</> : "Start a plan to earn more"}
                </div>
              </div>
              <div className="osw" style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: C.mute, fontWeight: 600, margin: "18px 0 9px" }}>Rewards</div>
              {REWARDS.map((r) => {
                const ok = points >= r.pts;
                return (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 13px", marginBottom: 8 }}>
                    <span style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid #D8D2C2", background: C.paper, display: "flex", alignItems: "center", justifyContent: "center", color: C.goldD, flexShrink: 0 }}>{LI[REWARD_ICON[r.id]](19)}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="osw" style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: C.navy }}>{r.label}</span>
                      <span className="inr" style={{ fontSize: 12, color: C.mute }}>{r.pts} E-Points · {r.note}</span>
                    </span>
                    <button className="tap" disabled={!ok} onClick={() => { if (LIVE) { sendRequest("redeem", { reward: r.id, points: r.pts }, flash); return; } setPoints((p) => p - r.pts); flash(`Reward saved · ${r.note.toLowerCase()}`); }} style={{ padding: "9px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, background: ok ? C.blue : C.paper, color: ok ? "#FCFAF5" : C.mute, border: ok ? "none" : `1px solid ${C.line}`, flexShrink: 0, textAlign: "center" }}>{ok ? "Redeem" : `${r.pts - points} more`}</button>
                  </div>
                );
              })}
              <div className="inr" style={{ fontSize: 12, color: C.mute, lineHeight: 1.6, marginTop: 8, background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 13px" }}>
                E-Points are for rewards only. They are never money off an order.<br />E-Points expire 12 months after you earn them.<br />They are added when your payment is confirmed.
              </div>
            </div>
          </Overlay>
        )}

        {/* ---- SKIP ---- */}
        {/* ---- MANAGE MY PLAN — all monthly actions, one tap away from My Health ---- */}
        {sheetOpen === "manage" && plan && (
          <Overlay onClose={() => setSheetOpen(null)}>
            <div className="up" style={{ ...sheet, maxHeight: "90vh", overflowY: "auto" }}>
              <SheetHead title="Manage my plan" sub={`Next refill ${fmtDate(nextRefill)} · ${peso(refillAmt)}`} onClose={() => setSheetOpen(null)} />
              {[
                ["Change plan", plan.freq === "monthly" ? `Every 3 months saves ${Math.floor((1 - PRICE.quarterly / 1499) * 100)}% (Monthly saves ${Math.floor((1 - PRICE.monthly / 1499) * 100)}%)` : "Switch to monthly", () => openBuilder("plan")],
                ["Change goal", goalChanged ? "Already changed once" : `Now: ${G.label} · ${G.caps} a day. Once, before your first BioScan`, () => (goalChanged ? flash("Goal already changed once") : openBuilder("goal"))],
                ["Skip next refill", "Move your next refill by one cycle. Once every 90 days", () => setSheetOpen("skip")],
                ["Pause", "Up to 60 days. Your goal and E-Points stay", () => setSheetOpen("pause")],
                ["Update payment", `Now: ${PAY[plan.pay].short}`, () => { setPayPick(plan.pay); setSheetOpen("payment"); }],
                ["Add a one-time order", "Packages, a blister or a bottle. Opens the Shop", null, "tab-protocol"],
              ].map(([t, sub, fn, link]) => {
                const inner = (<>
                  <span style={{ flex: 1 }}>
                    <span className="osw" style={{ display: "block", fontSize: 15, fontWeight: 700, color: t === "Change goal" && goalChanged ? C.mute : C.navy }}>{t}</span>
                    <span className="inr" style={{ display: "block", fontSize: 12, color: C.mute, marginTop: 2 }}>{sub}</span>
                  </span>
                  <span className="osw gx-h" style={{ fontSize: 18, color: C.blue }}>&rsaquo;</span>
                </>);
                return link
                  ? <a key={t} className="tap" {...extLink(link)} onClick={() => setSheetOpen(null)} style={{ ...choice(false), padding: "14px 15px", boxSizing: "border-box", textDecoration: "none" }}>{inner}</a>
                  : <button key={t} className="tap" onClick={() => { setSheetOpen(null); setTimeout(fn, 0); }} style={{ ...choice(false), padding: "14px 15px" }}>{inner}</button>;
              })}
              <button className="tap" onClick={() => { setSheetOpen(null); setLeaveWhy(null); setTimeout(() => setSheetOpen("cancel"), 0); }} style={{ display: "block", margin: "10px auto 0", fontSize: 13, fontWeight: 600, color: C.clay, textDecoration: "underline", textUnderlineOffset: 3 }}>Cancel my plan</button>
            </div>
          </Overlay>
        )}

        {/* ---- A plan this member pays for ---- */}
        {sheetOpen === "gift" && (() => { const g = gifts.find((x) => x.id === giftSel); if (!g) return null; const upd = (ch, msg) => { setGifts((L) => L.map((x) => (x.id === g.id ? { ...x, ...ch } : x))); setSheetOpen(null); flash(msg); }; const first = g.name.split(" ")[0]; return (
          <Overlay onClose={() => setSheetOpen(null)}>
            <div className="up" style={{ ...sheet, maxHeight: "90vh", overflowY: "auto" }}>
              <SheetHead title={`${first}'s plan`} sub={`${g.goal} · ${g.caps} a day · ${g.freq} · you pay`} onClose={() => setSheetOpen(null)} />
              {[
                ["Skip next refill", `Moves ${fmtDate(g.next)} by one month`, () => upd({ next: new Date(+g.next + 30 * 864e5) }, `${first}'s next refill skipped`)],
                [g.status === "paused" ? "Resume" : "Pause", g.status === "paused" ? "Refills start again" : "Up to 60 days", () => upd({ status: g.status === "paused" ? "active" : "paused" }, g.status === "paused" ? `${first}'s plan resumed` : `${first}'s plan paused`)],
                ["Change goal or payment", "Same choices as your own plan", () => { setSheetOpen(null); flash("Opens the same steps as your own plan"); }],
              ].map(([t, sub, fn]) => (
                <button key={t} className="tap" onClick={fn} style={{ ...choice(false), padding: "14px 15px" }}>
                  <span style={{ flex: 1 }}>
                    <span className="osw" style={{ display: "block", fontSize: 15, fontWeight: 700, color: C.navy }}>{t}</span>
                    <span className="inr" style={{ display: "block", fontSize: 12, color: C.mute, marginTop: 2 }}>{sub}</span>
                  </span>
                  <span className="osw gx-h" style={{ fontSize: 18, color: C.blue }}>&rsaquo;</span>
                </button>
              ))}
              <div className="inr" style={{ fontSize: 12, color: C.mute, margin: "8px 2px 0", lineHeight: 1.5 }}>{first} tracks her doses in her own Lifestyle page. Her plan shows &ldquo;Paid by {ME.name.split(" ")[0]}&rdquo;.</div>
              <button className="tap" onClick={() => upd({ status: "cancelled" }, `${first}'s plan cancelled`)} style={{ display: "block", margin: "12px auto 0", fontSize: 13, fontWeight: 600, color: C.clay, textDecoration: "underline", textUnderlineOffset: 3 }}>Cancel {first}'s plan</button>
            </div>
          </Overlay>
        ); })()}

        {sheetOpen === "skip" && plan && (
          <Overlay onClose={() => setSheetOpen(null)}>
            <div className="up" style={sheet}>
              <SheetHead title="Skip next refill?" onClose={() => setSheetOpen(null)} />
              <div className="inr" style={{ fontSize: 14, color: C.ink, lineHeight: 1.6 }}>Your next refill moves from <b>{fmtDate(nextRefill)}</b> to <b>{fmtDate(addMonths(plan.start, cycle * (2 + plan.skips)))}</b>. You can skip once every 90 days.</div>
              {plan.skips > 0 ? <div className="inr" style={{ fontSize: 13, color: C.clay, fontWeight: 600, marginTop: 12 }}>You already skipped a refill in the last 90 days.</div> : null}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="tap" onClick={() => setSheetOpen(null)} style={{ ...ghost, marginTop: 16 }}>Keep</button>
                <button className="tap" disabled={plan.skips > 0} onClick={() => { if (LIVE) { sendRequest("skip", {}, flash); setSheetOpen(null); return; } setPlan((p) => ({ ...p, skips: p.skips + 1 })); setSheetOpen(null); flash("Next refill skipped"); }} style={{ ...cta, background: plan.skips > 0 ? "#c3ccd8" : C.blue }}>Skip refill</button>
              </div>
            </div>
          </Overlay>
        )}

        {/* ---- PAUSE ---- */}
        {sheetOpen === "pause" && plan && (
          <Overlay onClose={() => setSheetOpen(null)}>
            <div className="up" style={sheet}>
              <SheetHead title="Pause my plan" sub="Up to 60 days" onClose={() => setSheetOpen(null)} />
              {[30, 60].map((d) => (
                <button key={d} className="tap" onClick={() => setPauseDays(d)} style={choice(pauseDays === d)}>
                  <span style={radio(pauseDays === d)} />
                  <span style={{ flex: 1 }}>
                    <span className="osw" style={{ display: "block", fontSize: 15, fontWeight: 700, color: C.navy }}>{d} days</span>
                    <span className="inr" style={{ fontSize: 12, color: C.mute }}>Starts again on {fmtDate(addDays(now, d))}</span>
                  </span>
                </button>
              ))}
              <div className="inr" style={{ fontSize: 12.5, color: C.mute, lineHeight: 1.5, marginTop: 4 }}>We send an SMS 3 days before your plan starts again. Your goal and E-Points stay.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="tap" onClick={() => setSheetOpen(null)} style={{ ...ghost, marginTop: 16 }}>Back</button>
                <button className="tap" onClick={() => { if (LIVE) { sendRequest("pause", { days: pauseDays }, flash); setSheetOpen(null); return; } setPlan((p) => ({ ...p, status: "paused", pausedUntil: addDays(now, pauseDays) })); setSheetOpen(null); flash(`Plan paused for ${pauseDays} days`); }} style={{ ...cta, background: C.navy }}>Pause {pauseDays} days</button>
              </div>
            </div>
          </Overlay>
        )}

        {/* ---- PAYMENT ---- */}
        {sheetOpen === "payment" && plan && (
          <Overlay onClose={() => setSheetOpen(null)}>
            <div className="up" style={sheet}>
              <SheetHead title="Update payment" sub={`Now: ${PAY[plan.pay].short}`} onClose={() => setSheetOpen(null)} />
              {Object.entries(PAY).map(([k, p]) => (
                <button key={k} className="tap" onClick={() => setPayPick(k)} style={choice(payPick === k)}>
                  <span style={radio(payPick === k)} />
                  <span style={{ flex: 1 }}>
                    <span className="osw" style={{ display: "block", fontSize: 15, fontWeight: 700, color: C.navy }}>{p.label}</span>
                    <span className="inr" style={{ fontSize: 12, color: C.mute }}>{p.note}</span>
                  </span>
                </button>
              ))}
              <button className="tap" onClick={() => { if (LIVE) { sendRequest("payment", { method: payPick }, flash); setSheetOpen(null); return; } setPlan((p) => ({ ...p, pay: payPick })); setSheetOpen(null); flash(payPick === "gcash" ? "Saved · pay links will come by SMS" : `Saved · ${PAY[payPick].label} confirmed`); }} style={{ ...cta, background: C.blue }}>{payPick === "gcash" ? "Save" : `Confirm ${PAY[payPick].label}`}</button>
            </div>
          </Overlay>
        )}

        {/* ---- CANCEL ---- */}
        {sheetOpen === "cancel" && plan && (
          <Overlay onClose={() => setSheetOpen(null)}>
            <div className="up" style={sheet}>
              <SheetHead title="Why are you leaving?" onClose={() => setSheetOpen(null)} />
              {LEAVE.map((r) => (
                <button key={r} className="tap" onClick={() => setLeaveWhy(r)} style={choice(leaveWhy === r)}>
                  <span style={radio(leaveWhy === r)} />
                  <span className="inr" style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: C.navy }}>{r}</span>
                </button>
              ))}
              {leaveWhy && <div className="inr" style={{ fontSize: 12.5, color: C.mute, lineHeight: 1.5, marginTop: 4 }}>{leaveWhy === LEAVE[1] ? `You can skip or pause instead. Your plan stays and your next refill waits.` : "Your E-Points stay in your wallet until they expire."}</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="tap" onClick={() => setSheetOpen(null)} style={{ ...cta, background: C.blue }}>Keep my plan</button>
                <button className="tap" disabled={!leaveWhy} onClick={() => { if (LIVE) { sendRequest("cancel", { reason: leaveWhy }, flash); setSheetOpen(null); return; } setPlan((p) => ({ ...p, status: "cancelled" })); setSheetOpen(null); flash("Plan cancelled"); }} style={{ ...ghost, marginTop: 16, color: leaveWhy ? C.clay : "#c3ccd8", borderColor: leaveWhy ? C.clay : C.line, whiteSpace: "nowrap" }}>Cancel plan</button>
              </div>
            </div>
          </Overlay>
        )}

        {/* ---- GUARD SOMEONE: the invite, shown so the member can read, copy and send it ---- */}
        {sheetOpen === "invite" && (() => { const msg = `I am a Gut Guardian. I guard my health every day, and I want to guard yours too. Get your free Gutguard Lifestyle card: ${INVITE_URL}\n\nGutguard. We Gut You.`; const doCopy = () => { try { navigator.clipboard.writeText(msg).then(() => flash("Invite copied. Send it to someone you guard."), () => { const el = document.getElementById("gg-invite"); if (el) { el.focus(); el.select(); } flash("Select the text and copy it"); }); } catch (e) { flash("Select the text and copy it"); } }; return (
          <Overlay onClose={() => setSheetOpen(null)}>
            <div className="up" style={sheet}>
              <SheetHead title="Invite family" sub="They get their own free card and join under you" onClose={() => setSheetOpen(null)} />
              <textarea id="gg-invite" readOnly value={msg} rows={5} style={{ ...inp, width: "100%", boxSizing: "border-box", fontSize: 14, lineHeight: 1.5, resize: "none" }} onFocus={(e) => e.target.select()} />
              <button className="tap" onClick={doCopy} style={{ ...cta, background: C.cta, color: C.onCta, fontWeight: 700 }}>Copy the invite</button>
              <div className="inr" style={{ fontSize: 12, color: C.mute, textAlign: "center", marginTop: 8 }}>Send it by Messenger, Viber or SMS.</div>
            </div>
          </Overlay>
        ); })()}

        {/* ---- THE EARNED MOMENT: Lifestyle Member → Gut Guardian ---- */}
        {guardianMoment && (
          <Overlay center onClose={() => setGuardianMoment(null)}>
            <div className="up" onClick={(e) => e.stopPropagation()} style={{ ...sheet, maxWidth: 420, borderRadius: 24, textAlign: "center", padding: "26px 22px 22px" }}>
              <div style={{ display: "flex", justifyContent: "center" }}><Capsule w={92} /></div>
              <div className="g-m" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#7E6035", fontWeight: 600, marginTop: 12 }}>{guardianMoment === "watch" ? "5-Night Watch complete" : "Welcome"}</div>
              <div className="gx-h" style={{ fontSize: 28, lineHeight: 1.15, color: C.ink, marginTop: 6 }}>You are now a Gut Guardian.</div>
              <div className="inr" style={{ fontSize: 14, color: C.mute, lineHeight: 1.6, marginTop: 10 }}>{guardianMoment === "watch" ? "You took the watch. " : ""}You now stand with every Gut Guardian against the Silent Fire.</div>
              <div className="gx-h" style={{ fontSize: 17, lineHeight: 1.55, color: C.ink, marginTop: 12 }}>I guard myself.<br />I guard my family.<br />I guard my community.</div>
              <div className="inr" style={{ fontSize: 12.5, color: C.mute, marginTop: 8 }}>You are living the Gutguard Lifestyle.</div>
              <div className="gx-h" style={{ fontSize: 18, fontStyle: "italic", color: "#7E6035", marginTop: 6 }}>We Gut You.</div>
              <div style={{ margin: "16px auto 0", width: 230, height: 132, borderRadius: 14, background: "linear-gradient(135deg,#0A31B4,#00249C 60%,#001a73)", color: "#fff", textAlign: "left", padding: "14px 16px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 14px 30px -14px rgba(0,36,156,.8)" }}>
                <span className="g-m" style={{ fontSize: 9.5, letterSpacing: ".14em", color: "#F5B301", alignSelf: "flex-end", fontWeight: 600 }}>GUT GUARDIAN</span>
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: ".04em" }}>{ME.name.toUpperCase()}</span>
              </div>
              {guardianMoment === "watch"
                ? <><a className="tap" {...extLink(SHOP_PLAN)} onClick={() => setGuardianMoment(null)} style={{ ...cta, ...aBtn, background: C.cta, color: C.onCta, fontWeight: 700 }}>Choose my plan</a>
                  {DEMO ? <div className="inr" style={{ fontSize: 12.5, color: C.mute, marginTop: 8 }}>Your {peso(TRIAL_CREDIT)} comes off your first month.</div> : null}
                  <button onClick={() => setGuardianMoment(null)} style={{ display: "block", margin: "10px auto 0", fontSize: 13, fontWeight: 600, color: C.ink, textDecoration: "underline", textUnderlineOffset: 3 }}>Later</button></>
                : <button className="tap" onClick={() => setGuardianMoment(null)} style={{ ...cta, background: C.cta, color: C.onCta, fontWeight: 700 }}>Start my first watch</button>}
            </div>
          </Overlay>
        )}

        {/* ---- SETTINGS — same look and words as the dose cards on My Health ---- */}
        {sheetOpen === "settings" && (
          <Overlay onClose={() => setSheetOpen(null)}>
            <div className="up" style={{ ...sheet, maxHeight: "90vh", overflowY: "auto" }}>
              <SheetHead title="Settings" sub={G && !isTrial ? `${G.label} · ${DAILY} capsules a day` : isTrial ? "5-Night Watch · 10 capsules" : "Reminders"} onClose={() => setSheetOpen(null)} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 8px" }}>
                <div className="g-m" style={{ ...sectionLbl, margin: 0 }}>Your doses</div>
                {adjusted ? <span className="lw-adj">Adjusted</span> : null}
              </div>
              {(isTrial ? SLOTS : DOSE_KEYS).map((k) => { const n = dose[k] || 0; return (
                <div key={k} className={"lw-dose lw-set" + (n ? "" : " off")}>
                  <span className="ic">{SLOT_ICON[k](20)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="gx-h" style={{ fontSize: 19, color: C.navy, lineHeight: 1.1 }}>{META[k].label}</div>
                    <div className="meta">{n ? META[k].note : "Off · tap + to add"}</div>
                    {canAdjust ? (
                      <div className="lw-step" aria-label={`${META[k].label} capsules`}>
                        <button onClick={() => stepDose(k, -1)} aria-label={`One less capsule at ${META[k].label}`} disabled={!n}>−</button>
                        <b>{n}</b><span>capsule{n === 1 ? "" : "s"}</span>
                        <button onClick={() => stepDose(k, 1)} aria-label={`One more capsule at ${META[k].label}`} disabled={n >= 4}>+</button>
                      </div>
                    ) : <div className="meta"><b style={{ color: C.ink, fontWeight: 600 }}>{n} capsule{n === 1 ? "" : "s"}</b></div>}
                  </div>
                  {n ? <input type="time" aria-label={`${META[k].label} reminder time`} value={times[k]} onChange={(e) => setTimes((t) => ({ ...t, [k]: e.target.value }))} className="lw-time" /> : null}
                </div>); })}
              <div className="inr" style={{ fontSize: 12.5, color: C.mute, lineHeight: 1.55 }}>
                {isTrial ? "The 5-Night Watch dose is fixed." : !G ? "" : adjusted ? (<>
                  You take <b style={{ color: C.ink }}>{DAILY} a day</b>. Recommended for {G.label}: {recDose.morning} at Reveille, {recDose.dreams} at Taps ({G.caps} a day).{" "}
                  <button onClick={() => setMyDose(null)} style={{ color: C.blue, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>Use recommended</button>
                  {DAILY > G.caps ? <span style={{ display: "block", marginTop: 6, color: C.clay }}>At {DAILY} a day, your capsules run out before the next refill. To get more each month, use Change goal.</span> : null}
                </>) : <>Recommended for {G.label}: {recDose.morning} at Reveille, {recDose.dreams} at Taps. You can change the capsules and add Midday.</>}
              </div>
              <div className="g-m" style={{ ...sectionLbl, margin: "22px 0 8px" }}>Alarm sound</div>
              <div className="lw-seg x3" role="radiogroup" aria-label="Alarm sound">
                {SOUND_OPTS.map(([v, label]) => <button key={v} role="radio" aria-checked={sound === v} className={sound === v ? "on" : ""} onClick={() => setSound(v)}><b>{label}</b></button>)}
              </div>
              <div className="g-m" style={{ ...sectionLbl, margin: "22px 0 8px" }}>Language</div>
              <div className="lw-seg" role="radiogroup" aria-label="Language">
                {[["EN", "English"], ["TL", "Taglish"]].map(([code, full]) => <button key={code} role="radio" aria-checked={lang === code} className={lang === code ? "on" : ""} onClick={() => setLang(code)}><b>{full}</b></button>)}
              </div>
              <button className="tap" onClick={() => { try { localStorage.setItem("gg-times", JSON.stringify(times)); } catch (e) {} setSheetOpen(null); flash("Settings saved"); }} style={{ ...cta, background: C.cta, color: C.onCta, fontWeight: 700 }}>Save changes</button>
            </div>
          </Overlay>
        )}
      </main>
      </div>
      </div>

      {/* bottom nav — MemberDashboard pattern; My Team appears only for Builders */}
      {cardOpen && (
        <Overlay center onClose={() => { setCardOpen(false); setFlipped(false); }}>
          <div style={{ width: "100%", padding: "0 16px" }}>
            <MemberCard flipped={flipped} onFlip={() => setFlipped((f) => !f)} name={ME.name} tier={tier} points={points} onPoints={() => { setCardOpen(false); setSheetOpen("points"); }} />
            <div className="g-m" style={{ textAlign: "center", fontSize: 12, color: "#E6ECF5", margin: "12px 0 0" }}>Show the QR at Gutguard events. Tap the card to flip it.</div>
            <button className="tap" onClick={() => { setCardOpen(false); setFlipped(false); }} style={{ display: "block", margin: "14px auto 0", padding: "11px 26px", borderRadius: 99, background: "#fff", color: C.navy, fontWeight: 700, fontSize: 14, textAlign: "center" }}>Close</button>
          </div>
        </Overlay>
      )}


      {/* sticky action bar while shopping — phone and tablet only */}
      {toast && <div className="fade gg-toast" style={{ position: "fixed", left: "50%", bottom: 84, transform: "translateX(-50%)", background: C.navy, color: "#fff", padding: "11px 18px", borderRadius: 30, fontSize: 13.5, fontFamily: "var(--font-inter-tight),'Inter Tight',sans-serif", fontWeight: 600, boxShadow: "0 6px 20px rgba(0,0,0,.2)", zIndex: 60, maxWidth: 330, textAlign: "center" }}>{toast}</div>}
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
/* Production entry. `live` comes from lib/lifestyle/load-prototype-member.ts (server, member's own session);
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
}