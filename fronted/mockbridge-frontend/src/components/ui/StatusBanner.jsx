export function StatusBanner({ variant = 'info', children }) {
  return <div className={`status-banner ${variant}`}>{children}</div>;
}
