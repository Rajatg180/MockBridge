import React from "react";

export default function EmptyState({ title, message, action }) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 16,
        border: "1px dashed #cbd5e1",
        background: "#f8fafc",
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 6 }}>{title}</div>
      <div style={{ color: "#64748b" }}>{message}</div>
      {action ? <div style={{ marginTop: 12 }}>{action}</div> : null}
    </div>
  );
}