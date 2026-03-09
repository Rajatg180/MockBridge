import React from "react";

export default function LoadingBlock({ label = "Loading..." }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
        color: "#334155",
      }}
    >
      {label}
    </div>
  );
}