import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { registerUser } from '../features/auth/authSlice';
import { addToast } from '../features/ui/uiSlice';
import { getErrorMessage } from '../utils/http';

const initialForm = {
  email: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);

  const [form, setForm] = useState(initialForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Password mismatch',
          message: 'Password and confirm password must match.',
        }),
      );
      return;
    }

    try {
      await dispatch(
        registerUser({
          email: form.email.trim(),
          password: form.password,
        }),
      ).unwrap();

      dispatch(
        addToast({
          type: 'success',
          title: 'Account created',
          message: 'Your account is ready. Complete your profile next.',
        }),
      );

      navigate('/profile', { replace: true });
    } catch (error) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Registration failed',
          message: getErrorMessage(error, 'Unable to create your account.'),
        }),
      );
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">MockBridge</p>
        <h1>Create your account</h1>
        <p className="auth-copy">
          This talks to the auth service through the API gateway.
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
              autoComplete="new-password"
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </label>

          <label className="field">
            <span>Confirm password</span>
            <input
              className="input"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Repeat your password"
              minLength={6}
              required
            />
          </label>

          <button
            className="button button--primary button--full"
            type="submit"
            disabled={status === 'registering'}
          >
            {status === 'registering' ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
