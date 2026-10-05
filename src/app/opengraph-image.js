import { ImageResponse } from "next/og"

export const alt = "EsteBot – SEO and security audits for any website"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#fafafa",
          color: "#18181b",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700 }}>
          EsteBot
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
            SEO &amp; security audits for any website
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#52525b" }}>
            Meta tags, headings, structured data, HTTPS and security headers – in seconds.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {["SEO Audit", "Security Audit"].map(label => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "12px 28px",
                borderRadius: 12,
                background: "#000",
                color: "#fff",
                fontSize: 26,
                fontWeight: 600
              }}
            >
              {label}
            </div>
          ))}
          <div style={{ display: "flex", marginLeft: "auto", alignSelf: "center", fontSize: 26, color: "#71717a" }}>
            woztech.world/Esteban
          </div>
        </div>
      </div>
    ),
    size
  )
}
