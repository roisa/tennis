import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET(req: Request) {
  const title = (new URL(req.url).searchParams.get("title") ?? "Beyond the Court.").slice(0, 110);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#152D28", color: "#F1EFE7", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32"><path d="M8.5 15a7.5 7.5 0 0 1 15 0z" fill="#C7E45B" /><path d="M3 15.5h26M10 15.5 5 29M22 15.5 27 29M16 15.5V29M7.4 22.5h17.2" stroke="#F1EFE7" strokeWidth="1.6" fill="none" /></svg>
          <div style={{ fontSize: 30, letterSpacing: 10, fontWeight: 700 }}>COURTSCAPE</div>
        </div>
        <div style={{ fontSize: title.length > 60 ? 64 : 84, lineHeight: 1.02, maxWidth: 1000, fontFamily: "serif" }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#C7E45B", letterSpacing: 4 }}>
          <span>BEYOND THE COURT.</span><span>DISCOVER · PLAY · EXPLORE</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
