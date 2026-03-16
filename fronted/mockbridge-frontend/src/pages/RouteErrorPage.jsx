import { Link, useRouteError } from 'react-router-dom';

export default function RouteErrorPage() {
  const error = useRouteError();

  return (
    <div className="center-page">
      <div className="card card--narrow">
        <p className="eyebrow">Routing error</p>
        <h1>Something broke while rendering this page</h1>
        <p className="muted">
          {error?.message || 'An unexpected route error occurred.'}
        </p>
        <Link to="/dashboard" className="button button--primary">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
