import React from "react";

export default function SectionCard({ title, subtitle, children, right }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 16,
      }}
    >
      {(title || right) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "start",
            marginBottom: 12,
          }}
        >
          <div>
            {title ? <div style={{ fontSize: 16, fontWeight: 900 }}>{title}</div> : null}
            {subtitle ? <div style={{ marginTop: 4, color: "#64748b" }}>{subtitle}</div> : null}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}