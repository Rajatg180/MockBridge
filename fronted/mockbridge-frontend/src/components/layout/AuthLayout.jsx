import { Link, Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <p className="eyebrow">MockBridge</p>
          <h1>Mock interview workflow, ready for your gateway setup.</h1>
          <p className="muted">
            Login, profile onboarding, interviewer discovery, slot creation, booking, and session tools.
          </p>
        </div>
        <Outlet />
        <div className="auth-footer">
          <Link to="/login">Login</Link>
          <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>
  );
}
