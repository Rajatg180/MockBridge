import React from "react";

const styles = {
  OPEN: { background: "#ecfdf5", color: "#166534", border: "#bbf7d0" },
  BOOKED: { background: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  PENDING: { background: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  CONFIRMED: { background: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  CREATED: { background: "#f8fafc", color: "#334155", border: "#cbd5e1" },
  CANCELLED: { background: "#fff1f2", color: "#be123c", border: "#fecdd3" },
  COMPLETED: { background: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
  ENDED: { background: "#f1f5f9", color: "#334155", border: "#cbd5e1" },
};

export default function StatusBadge({ value }) {
  const s = styles[value] || { background: "#f8fafc", color: "#334155", border: "#cbd5e1" };

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${s.border}`,
        background: s.background,
        color: s.color,
        fontWeight: 800,
        fontSize: 12,
      }}
    >
      {value}
    </span>
  );
}