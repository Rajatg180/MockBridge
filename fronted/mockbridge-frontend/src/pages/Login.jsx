import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import Shell from "../ui/Shell";
import authApi from "../api/authApi";
import { loggedIn } from "../features/auth/authSlice";
import { toastAdded } from "../features/ui/uiSlice";
import { showApiErrorToast } from "../api/apiClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const nav = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const from = location.state?.from?.pathname || "/dashboard";

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      dispatch(
        toastAdded({
          type: "error",
          title: "Missing fields",
          message: "Email and password are required.",
        })
      );
      return;
    }

    setBusy(true);
    try {
      const data = await authApi.loginApi({
        email: email.trim().toLowerCase(),
        password,
      });

      dispatch(loggedIn(data));
      dispatch(
        toastAdded({
          type: "success",
          title: "Welcome back",
          message: "Login successful.",
        })
      );
      nav(from, { replace: true });
    } catch (error) {
      showApiErrorToast(error, "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="MockBridge" subtitle="Sign in to continue" withNav={false}>
      <form onSubmit={onSubmit} style={{ maxWidth: 420 }}>
        <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 12 }}
        />

        <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          type="password"
          autoComplete="current-password"
          style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 14 }}
        />

        <button
          disabled={busy}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: 0,
            cursor: busy ? "not-allowed" : "pointer",
            background: "#0b1220",
            color: "white",
            fontWeight: 800,
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? "Signing in..." : "Sign In"}
        </button>

        <div style={{ marginTop: 14, color: "#475569" }}>
          Don’t have an account? <Link to="/register">Create one</Link>
        </div>
      </form>
    </Shell>
  );
}