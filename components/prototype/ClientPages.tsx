"use client";

import { useEffect, useState, type ComponentProps } from "react";
import LifestyleMember from "./LifestyleMember";

/*
 * The member page (Addendum 05) draws in the browser only: it keeps the signed-in member's
 * data in module state, which must never be shared between requests on the server. It is
 * imported directly, so its code downloads together with the page, not after it.
 */
const Loading = () => <div style={{ minHeight: "100vh", background: "#F4F1EA" }} aria-busy="true" />;

export function LifestyleMemberClient(props: ComponentProps<typeof LifestyleMember>) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready ? <LifestyleMember {...props} /> : <Loading />;
}
