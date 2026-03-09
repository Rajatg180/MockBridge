export function EmptyState({ title, description, action }) {
  return (
    <div className="card empty-state">
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
