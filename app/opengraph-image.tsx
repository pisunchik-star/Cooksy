import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        padding: 90,
        background: "#FFFAF5",
        color: "#231F1A",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 38 }}>
        <div
          style={{
            width: 190,
            height: 190,
            borderRadius: 54,
            background: "#F55220",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 100,
          }}
        >
          ♨
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 800 }}>
            Cook<span style={{ color: "#F55220" }}>sy</span>
          </div>
          <div style={{ marginTop: 16, fontSize: 35, color: "#817970" }}>
            Рецепты на любой вкус
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
