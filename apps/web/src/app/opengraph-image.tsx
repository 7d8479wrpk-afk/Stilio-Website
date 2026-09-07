import { ImageResponse } from "next/og";

export const alt = "Stilio — Interior Design & Renovation Studio, Amman";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social card for any page that doesn't supply its own image.
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
          background: "#16140F",
          color: "#F3EFE6",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ fontSize: 128, letterSpacing: 14, fontWeight: 500 }}>STILIO</div>
        <div
          style={{
            marginTop: 36,
            width: 120,
            height: 1,
            background: "#B0894C",
          }}
        />
        <div
          style={{
            marginTop: 34,
            fontSize: 30,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#CBAE7B",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Interior Design &amp; Renovation · Amman
        </div>
      </div>
    ),
    { ...size },
  );
}
