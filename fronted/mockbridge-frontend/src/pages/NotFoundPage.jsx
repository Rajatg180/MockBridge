import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="center-page">
      <div className="card card--narrow">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="muted">
          The page you requested does not exist in this frontend.
        </p>
        <Link to="/dashboard" className="button button--primary">
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}
