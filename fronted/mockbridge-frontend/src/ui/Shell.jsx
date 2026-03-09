import React from "react";
import TopNav from "./TopNav";

export default function Shell({ title, subtitle, children, right, withNav = true }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", padding: 24 }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          background: "white",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #eef2f7" }}>
          <div
            style={{
              display: "flex",
              alignItems: "start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{title}</div>
              {subtitle ? <div style={{ marginTop: 4, color: "#475569" }}>{subtitle}</div> : null}
            </div>
            {right}
          </div>

          {withNav ? <div style={{ marginTop: 14 }}><TopNav /></div> : null}
        </div>

        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}