import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { registerUser } from '../../features/auth/authSlice';
import { useToast } from '../../components/ui/ToastProvider';
import { StatusBanner } from '../../components/ui/StatusBanner';
import { TextField } from '../../components/ui/FormFields';

export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pushToast } = useToast();
  const auth = useAppSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  function validate() {
    const nextErrors = {};

    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    if (!form.password.trim()) nextErrors.password = 'Password is required.';
    if (form.password.trim() && form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    try {
      await dispatch(registerUser({ email: form.email, password: form.password })).unwrap();
      pushToast({ title: 'Account created', description: 'Complete your profile to continue.', variant: 'success' });
      navigate('/profile/setup', { replace: true });
    } catch (errorMessage) {
      pushToast({ title: 'Registration failed', description: errorMessage, variant: 'error' });
    }
  }

  return (
    <div>
      <div className="auth-copy">
        <h2>Create account</h2>
        <p className="muted">This calls your `/auth/register` endpoint and immediately stores tokens.</p>
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
          placeholder="Create a password"
          autoComplete="new-password"
        />
        <TextField
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          error={errors.confirmPassword}
          onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
          placeholder="Repeat your password"
          autoComplete="new-password"
        />

        <button type="submit" className="button button-primary button-full" disabled={auth.status === 'loading'}>
          {auth.status === 'loading' ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="muted auth-helper">
        Already registered? <Link to="/login">Go to login</Link>
      </p>
    </div>
  );
}
