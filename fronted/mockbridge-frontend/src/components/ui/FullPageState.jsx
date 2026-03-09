export function FullPageState({ title, description }) {
  return (
    <div className="full-page-state">
      <div className="card state-card">
        <div className="spinner" />
        <h2>{title}</h2>
        <p className="muted">{description}</p>
      </div>
    </div>
  );
}
