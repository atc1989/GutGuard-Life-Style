// Test harness for test_member_live.js: the member page with a real-looking member, database calls stubbed.
import React from "react";
import { createRoot } from "react-dom/client";
import Page from "../../../components/prototype/LifestyleMember.jsx";
const t = new Date(); const k = (n) => { const d = new Date(t); d.setDate(d.getDate() - n); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const live = { name: "Maria Santos", mobile: "+639171112233", cardNo: "0240 1111 2222 3333", sponsor: "Ana Cruz", team: "GenSan", points: 42,
  stage: "member", trialStartedOn: null, countSince: null, plan: { goal: "full", freq: "monthly", status: "active", start: new Date(t.getTime() - 5 * 864e5).toISOString().slice(0, 10), skips: 0, pausedUntil: null },
  dose: null, guardian: true, log: { [k(1)]: { morning: true, lunch: true, dreams: true }, [k(2)]: { morning: true, lunch: false, dreams: true } } };
const feed = [{ id: "s1", name: "Lorna", about: "Mas maganda ang tulog ko.", outcomes: ["Better sleep"], days: "30" }];
createRoot(document.getElementById("root")).render(<Page live={live} feed={feed} />);
