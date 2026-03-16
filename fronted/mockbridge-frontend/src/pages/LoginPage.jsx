import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { loginUser } from '../features/auth/authSlice';
import { addToast } from '../features/ui/uiSlice';
import { getErrorMessage } from '../utils/http';

const initialForm = {
  email: '',
  password: '',
};

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { status } = useSelector((state) => state.auth);

  const [form, setForm] = useState(initialForm);

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await dispatch(
        loginUser({
          email: form.email.trim(),
          password: form.password,
        }),
      ).unwrap();

      dispatch(
        addToast({
          type: 'success',
          title: 'Welcome back',
          message: 'You have signed in successfully.',
        }),
      );

      navigate(redirectTo, { replace: true });
    } catch (error) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Sign in failed',
          message: getErrorMessage(error, 'Please verify your credentials.'),
        }),
      );
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">MockBridge</p>
        <h1>Sign in</h1>
        <p className="auth-copy">
          Use your email and password issued by the auth service.
        </p>

        <form className="stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
          </label>

          <button
            className="button button--primary button--full"
            type="submit"
            disabled={status === 'signingIn'}
          >
            {status === 'signingIn' ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
