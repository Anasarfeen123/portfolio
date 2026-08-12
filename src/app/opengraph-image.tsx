import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(circle at 15% 15%, rgba(0,230,168,0.16), transparent 45%), radial-gradient(circle at 85% 85%, rgba(245,158,11,0.12), transparent 40%), #030712",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#00e6a8",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 999, background: "#00e6a8", display: "flex" }} />
          AI Engineer &amp; Systems Developer
        </div>
        <div style={{ display: "flex", color: "#ffffff", fontSize: 88, fontWeight: 800, marginTop: 24, letterSpacing: -3 }}>
          Anas Arfeen
        </div>
        <div style={{ display: "flex", color: "#9ca3af", fontSize: 30, marginTop: 20, maxWidth: 900 }}>
          RL agents, LLM tools, computer vision — and full-stack apps people actually use.
        </div>
      </div>
    ),
    { ...size }
  );
}
