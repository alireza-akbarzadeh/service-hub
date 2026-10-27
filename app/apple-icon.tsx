import { ImageResponse } from "next/og"

export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 35%, #2a1538 0%, #0b0714 80%, #050308 100%)",
          borderRadius: "40px",
          border: "4px solid #ea580c",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "140px",
            height: "140px",
            background: "radial-gradient(circle, #f97316 0%, transparent 70%)",
            opacity: 0.5,
          }}
        />
        <div style={{ fontSize: 96, lineHeight: 1 }}>🔥</div>
      </div>
    ),
    {
      ...size,
    }
  )
}
