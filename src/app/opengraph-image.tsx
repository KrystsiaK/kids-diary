import { ImageResponse } from "next/og";

import { siteConfig } from "@/shared/config/site";

export const alt = "Explorer's Journal — Atlas of Wonder";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background:
            "radial-gradient(circle at 16% 12%, rgba(119, 96, 184, 0.42), transparent 30%), radial-gradient(circle at 82% 20%, rgba(89, 145, 181, 0.34), transparent 32%), linear-gradient(135deg, #080c12 0%, #151725 52%, #071015 100%)",
          color: "#f8f4ee",
          display: "flex",
          fontFamily: "Georgia, serif",
          height: "100%",
          padding: 64,
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(255, 255, 255, 0.18)",
            borderRadius: 48,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            padding: 56,
            width: "100%",
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: 22,
            }}
          >
            <div
              style={{
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                borderRadius: 999,
                display: "flex",
                fontSize: 34,
                height: 82,
                justifyContent: "center",
                width: 82,
              }}
            >
              A
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 44 }}>{siteConfig.name}</div>
              <div
                style={{
                  color: "rgba(248, 244, 238, 0.62)",
                  fontFamily: "Arial, sans-serif",
                  fontSize: 18,
                  letterSpacing: 10,
                  textTransform: "uppercase",
                }}
              >
                Atlas of Wonder
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              maxWidth: 820,
            }}
          >
            <div
              style={{
                fontSize: 88,
                lineHeight: 0.96,
              }}
            >
              Moments, mysteries, and field notes.
            </div>
            <div
              style={{
                color: "rgba(248, 244, 238, 0.7)",
                fontFamily: "Arial, sans-serif",
                fontSize: 30,
                lineHeight: 1.35,
              }}
            >
              {siteConfig.description}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
