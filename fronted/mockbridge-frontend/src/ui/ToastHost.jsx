import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastRemoved } from "../features/ui/uiSlice";

const styles = {
  wrap: {
    position: "fixed",
    right: 16,
    top: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    zIndex: 9999,
    maxWidth: 420,
  },
  toast: (type) => ({
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.08)",
    background:
      type === "error" ? "#fff1f2" : type === "success" ? "#ecfdf5" : "#eff6ff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
  }),
  title: { fontWeight: 700, marginBottom: 4 },
  msg: { opacity: 0.9, lineHeight: 1.3 },
  close: {
    marginTop: 10,
    background: "transparent",
    border: "1px solid rgba(0,0,0,0.15)",
    padding: "6px 10px",
    borderRadius: 10,
    cursor: "pointer",
  },
};

export default function ToastHost() {
  const toasts = useSelector((s) => s.ui.toasts);
  const dispatch = useDispatch();

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch(toastRemoved(t.id)), 3500)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  return (
    <div style={styles.wrap}>
      {toasts.map((t) => (
        <div key={t.id} style={styles.toast(t.type)}>
          {t.title ? <div style={styles.title}>{t.title}</div> : null}
          <div style={styles.msg}>{t.message}</div>
          <button style={styles.close} onClick={() => dispatch(toastRemoved(t.id))}>
            Close
          </button>
        </div>
      ))}
    </div>
  );
}