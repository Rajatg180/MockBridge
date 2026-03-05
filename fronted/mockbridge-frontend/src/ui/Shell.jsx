import React from "react";

export default function Shell({ title, subtitle, children, right }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", padding: 24 }}>
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          background: "white",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #eef2f7",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
            {subtitle ? (
              <div style={{ marginTop: 2, color: "#475569" }}>{subtitle}</div>
            ) : null}
          </div>
          {right}
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}