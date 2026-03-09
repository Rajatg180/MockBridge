import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import Shell from "../ui/Shell";
import authApi from "../api/authApi";
import { loggedIn } from "../features/auth/authSlice";
import { toastAdded } from "../features/ui/uiSlice";
import { showApiErrorToast } from "../api/apiClient";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const nav = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (e) => {
    e.preventDefault();

    const em = email.trim().toLowerCase();
    if (!em || !password.trim()) {
      dispatch(
        toastAdded({
          type: "error",
          title: "Missing fields",
          message: "Email and password are required.",
        })
      );
      return;
    }

    if (password.trim().length < 6) {
      dispatch(
        toastAdded({
          type: "error",
          title: "Weak password",
          message: "Password must be at least 6 characters.",
        })
      );
      return;
    }

    setBusy(true);
    try {
      const data = await authApi.registerApi({ email: em, password });
      dispatch(loggedIn(data));
      dispatch(
        toastAdded({
          type: "success",
          title: "Account created",
          message: "Now set up your profile.",
        })
      );
      nav("/profile/setup");
    } catch (error) {
      showApiErrorToast(error, "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Create account" subtitle="It takes less than a minute" withNav={false}>
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
          placeholder="min 6 characters"
          type="password"
          autoComplete="new-password"
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
          {busy ? "Creating..." : "Create Account"}
        </button>

        <div style={{ marginTop: 14, color: "#475569" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </Shell>
  );
}