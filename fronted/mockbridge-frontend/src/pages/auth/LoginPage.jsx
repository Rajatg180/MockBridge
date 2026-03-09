import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loginUser } from '../../features/auth/authSlice';
import { fetchMyProfile } from '../../features/profile/profileSlice';
import { useToast } from '../../components/ui/ToastProvider';
import { StatusBanner } from '../../components/ui/StatusBanner';
import { TextField } from '../../components/ui/FormFields';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { pushToast } = useToast();
  const auth = useAppSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  function validate() {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    if (!form.password.trim()) nextErrors.password = 'Password is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    try {
      await dispatch(loginUser(form)).unwrap();
      const profileResult = await dispatch(fetchMyProfile());

      pushToast({ title: 'Welcome back', description: 'Authentication succeeded.', variant: 'success' });

      const from = location.state?.from?.pathname;
      if (fetchMyProfile.rejected.match(profileResult) && profileResult.payload?.status === 404) {
        navigate('/profile/setup', { replace: true });
        return;
      }

      navigate(from && from !== '/login' ? from : '/dashboard', { replace: true });
    } catch (errorMessage) {
      pushToast({ title: 'Login failed', description: errorMessage, variant: 'error' });
    }
  }

  return (
    <div>
      <div className="auth-copy">
        <h2>Login</h2>
        <p className="muted">Use the JWT-based auth flow from your auth service.</p>
      </div>

      {auth.error ? <StatusBanner variant="error">{auth.error}</StatusBanner> : null}

      <form className="stack" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <TextField
          label="Password"
          type="password"
          value={form.password}
          error={errors.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <button type="submit" className="button button-primary button-full" disabled={auth.status === 'loading'}>
          {auth.status === 'loading' ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="muted auth-helper">
        Need an account? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}
