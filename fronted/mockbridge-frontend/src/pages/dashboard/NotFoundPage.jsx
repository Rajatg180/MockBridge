import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="full-page-state">
      <div className="card state-card">
        <h2>Page not found</h2>
        <p className="muted">The route does not exist in this frontend scaffold.</p>
        <Link className="button button-primary" to="/dashboard">Go to dashboard</Link>
      </div>
    </div>
  );
}
