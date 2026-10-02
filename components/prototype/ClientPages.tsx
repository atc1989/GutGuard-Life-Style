"use client";

import dynamic from "next/dynamic";

/*
 * The approved prototype pages (Addendum 05) run in the browser only. They read the date,
 * the screen width and saved settings on first render, so a server render would not match.
 * The member page is behind log-in, so nothing is lost for search.
 */
const Loading = () => <div style={{ minHeight: "100vh", background: "#F4F1EA" }} aria-busy="true" />;

export const LifestyleMemberClient = dynamic(() => import("./LifestyleMember"), { ssr: false, loading: Loading });
export const LifestyleLandingClient = dynamic(() => import("./LifestyleLanding"), { ssr: false, loading: Loading });
