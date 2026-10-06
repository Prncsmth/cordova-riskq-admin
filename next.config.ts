import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// The browser origins this dashboard talks to, read from the same env vars
// the app uses: the REST API and the Socket.IO server (whose WebSocket
// upgrade needs the ws/wss form of the same host).
function originsOf(...urls: (string | undefined)[]): string[] {
  const origins = new Set<string>();
  for (const url of urls) {
    if (!url) continue;
    try {
      const { protocol, host } = new URL(url);
      origins.add(`${protocol}//${host}`);
      origins.add(`${protocol === "https:" ? "wss:" : "ws:"}//${host}`);
    } catch {
      // Not a valid URL -- leave it out rather than break the policy.
    }
  }
  return [...origins];
}

const backendOrigins = originsOf(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_SOCKET_URL,
);

// Mapbox GL JS (via react-map-gl): style/tile/geocoding requests, telemetry,
// and its map workers, which it starts from blob: URLs.
const MAPBOX = ["https://api.mapbox.com", "https://*.tiles.mapbox.com", "https://events.mapbox.com"];

// Directives that can't break any resource the dashboard loads, so they're
// ENFORCED: no framing (clickjacking), no plugins, no <base> hijacking, and
// forms only post back to this site.
const ENFORCED_CSP = [
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

// The full resource policy, built from what the dashboard actually uses:
// Next.js App Router inline hydration scripts and inline styles (hence
// 'unsafe-inline'), self-hosted next/font files, local alert sounds, the
// API + Socket.IO origins, and Mapbox. Shipped as REPORT-ONLY: the browser
// logs any violation to the console but blocks nothing. Once the dashboard
// has been used with no violations reported (login, live map, sockets,
// charts, alert sounds), move this into Content-Security-Policy.
const REPORT_ONLY_CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${MAPBOX.join(" ")}`,
  "font-src 'self' data:",
  "media-src 'self'",
  `connect-src 'self' ${[...backendOrigins, ...MAPBOX].join(" ")}${isProd ? "" : " ws: http://localhost:*"}`,
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: ENFORCED_CSP },
  { key: "Content-Security-Policy-Report-Only", value: REPORT_ONLY_CSP },
  // Same as frame-ancestors 'none', for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The dashboard uses none of these device features.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // HTTPS only, in production (meaningless on local http).
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Pins the workspace root to this project -- without this, Turbopack walks
  // up the directory tree, finds an unrelated package-lock.json sitting in
  // the home directory, and mistakenly treats that as the workspace root.
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
