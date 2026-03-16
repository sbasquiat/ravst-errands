import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Ravst — Your Errands, Handled With Proof";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          backgroundColor: "#faf8f5",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: "#c17f59",
          }}
        />

        {/* Logo */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#1a1a1a",
            letterSpacing: -2,
            marginBottom: 16,
          }}
        >
          ravst
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#6b6b6b",
            marginBottom: 24,
          }}
        >
          Your Errands, Handled With Proof
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: "#c17f59",
            marginBottom: 40,
          }}
        >
          Returns · Pickups · Collections — Dublin, Ireland
        </div>

        {/* CTA pill */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#c17f59",
            borderRadius: 12,
            padding: "14px 32px",
            fontSize: 16,
            fontWeight: 600,
            color: "#ffffff",
          }}
        >
          Book an Errand →
        </div>
      </div>
    ),
    { ...size }
  );
}
