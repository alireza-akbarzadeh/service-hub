import { ImageResponse } from "next/og"

export const size = {
  width: 48,
  height: 48,
}
export const contentType = "image/png"

export default function Icon() {
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
          borderRadius: "12px",
          border: "2px solid #ea580c",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "36px",
            height: "36px",
            background: "radial-gradient(circle, #f97316 0%, transparent 70%)",
            opacity: 0.4,
          }}
        />
        <div style={{ fontSize: 26, lineHeight: 1 }}>🔥</div>
      </div>
    ),
    {
      ...size,
    }
  )
}
