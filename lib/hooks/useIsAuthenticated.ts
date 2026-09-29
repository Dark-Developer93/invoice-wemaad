"use client";

import { useEffect, useState } from "react";

// Public marketing pages (/, /privacy, /terms) only need "is someone logged
// in?" to swap a few links. Calling auth() on the server for that made every
// one of those pages dynamic — a Node render plus a Postgres session lookup
// per visit — instead of static HTML served straight from the CDN. Resolving
// it in the browser after load keeps the pages static; the session endpoint
// returns immediately without touching the DB when there's no session cookie.
//
// One request per page load, shared by every component that asks.
let sessionPromise: Promise<boolean> | null = null;

function fetchIsAuthenticated(): Promise<boolean> {
  sessionPromise ??= fetch("/api/auth/session", { credentials: "same-origin" })
    .then((res) => (res.ok ? res.json() : null))
    .then((session) => Boolean(session?.user))
    .catch(() => false);
  return sessionPromise;
}

export function useIsAuthenticated(): boolean {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchIsAuthenticated().then((value) => {
      if (!cancelled) setIsAuthenticated(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return isAuthenticated;
}
