"use client";

import { useEffect } from "react";

// Mapbox GL cancels in-flight tile/style requests whenever a map instance
// unmounts (e.g. toggling the live-map fullscreen view). That rejects with
// an AbortError which is harmless, but surfaces as a noisy runtime error
// overlay/console error. Swallow just that specific rejection.
export default function GlobalErrorGuards() {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const isAbortError =
        reason?.name === "AbortError" ||
        (typeof reason?.message === "string" && reason.message.includes("Actor removed"));

      if (isAbortError) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  return null;
}
