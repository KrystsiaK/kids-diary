import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const allowedOrigins = (process.env.SERVER_ACTIONS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const s3PublicBaseUrl = process.env.S3_PUBLIC_BASE_URL?.trim();
const remoteImagePatterns = [];
const isProduction = process.env.NODE_ENV === "production";

if (s3PublicBaseUrl) {
  const url = new URL(s3PublicBaseUrl);
  remoteImagePatterns.push({
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    port: url.port,
    pathname: `${url.pathname === "/" ? "" : url.pathname}/**`,
  });
}

const cspImgSources = ["'self'", "data:", "blob:"];
const cspFontSources = ["'self'", "data:", "https://fonts.gstatic.com"];
const cspStyleSources = ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"];
const cspScriptSources = [
  "'self'",
  "'unsafe-inline'",
  "https://www.googletagmanager.com",
  ...(isProduction ? [] : ["'unsafe-eval'"]),
];
const cspConnectSources = [
  "'self'",
  "https://www.google-analytics.com",
  "https://analytics.google.com",
  "https://region1.google-analytics.com",
];
const uploadBodySizeLimit = 100 * 1024 * 1024;

if (s3PublicBaseUrl) {
  cspImgSources.push(new URL(s3PublicBaseUrl).origin);
}
cspImgSources.push("https://www.google-analytics.com");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: remoteImagePatterns,
  },
  experimental: {
    proxyClientMaxBodySize: uploadBodySizeLimit,
    serverActions: {
      bodySizeLimit: uploadBodySizeLimit,
      ...(allowedOrigins.length > 0 ? { allowedOrigins } : {}),
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              `img-src ${cspImgSources.join(" ")}`,
              `font-src ${cspFontSources.join(" ")}`,
              `style-src ${cspStyleSources.join(" ")}`,
              `script-src ${cspScriptSources.join(" ")}`,
              `script-src-elem ${cspScriptSources.join(" ")}`,
              `connect-src ${cspConnectSources.join(" ")}`,
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
