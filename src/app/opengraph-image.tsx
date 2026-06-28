import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "World Cup 2026 Knockout Predictor";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(80% 70% at 12% 0%, #ff2151 0%, transparent 45%), radial-gradient(80% 70% at 90% 6%, #2a7bff 0%, transparent 45%), radial-gradient(90% 80% at 50% 120%, #15c06a 0%, transparent 55%), linear-gradient(160deg, #08102a 0%, #0c1738 100%)",
          color: "#eef2ff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 12,
            color: "#ffc83d",
            fontWeight: 800,
          }}
        >
          FIFA WORLD CUP 2026
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 108,
            fontWeight: 900,
            lineHeight: 1.05,
            marginTop: 14,
            background: "linear-gradient(100deg,#ff2151,#ffc83d 38%,#15c06a 68%,#2a7bff)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          KNOCKOUT PREDICTOR
        </div>
        <div
          style={{
            fontSize: 34,
            color: "#aab6dd",
            marginTop: 24,
          }}
        >
          Round of 32 → Final · Pick your champion
        </div>
        <div style={{ display: "flex", fontSize: 58, marginTop: 40, gap: 8 }}>
          🏆 ⚽ 🥇
        </div>
      </div>
    ),
    { ...size }
  );
}
