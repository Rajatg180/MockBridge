import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Shell from "../ui/Shell.jsx";
import { getMyProfile } from "../api/userApi.js";
import { logoutApi } from "../api/authApi.js";
import { loggedOut } from "../features/auth/authSlice";
import { toastAdded } from "../features/ui/uiSlice";
import { showApiErrorToast } from "../api/apiClient";

export default function Dashboard() {
  const { user, refreshToken } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const p = await getMyProfile();
        if (!alive) return;
        setProfile(p);
      } catch (err) {
        // Profile might not exist yet
        showApiErrorToast(err, "Could not load profile");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const doLogout = async () => {
    try {
      if (refreshToken) await logoutApi(refreshToken);
    } catch {
      // ignore logout errors
    } finally {
      dispatch(loggedOut());
      dispatch(toastAdded({ type: "info", title: "Logged out", message: "See you soon!" }));
      nav("/login");
    }
  };

  return (
    <Shell
      title="Dashboard"
      subtitle={user ? `Logged in as ${user.email} (${user.role})` : ""}
      right={
        <button
          onClick={doLogout}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            background: "white",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Logout
        </button>
      }
    >
      {loading ? (
        <div>Loading profile...</div>
      ) : profile ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 16, border: "1px solid #eef2f7" }}>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>My Profile</div>
            <div><b>Name:</b> {profile.fullName}</div>
            <div><b>Headline:</b> {profile.headline || "-"}</div>
            <div><b>Experience:</b> {profile.yearsOfExperience} yrs</div>
            <div><b>Bio:</b> {profile.bio || "-"}</div>

            <div style={{ marginTop: 10 }}>
              <b>Skills:</b>
              <ul style={{ marginTop: 6 }}>
                {(profile.skills || []).map((s) => (
                  <li key={s.id}>
                    {s.skillName} ({s.proficiency})
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => nav("/profile/setup")}
              style={{
                marginTop: 10,
                padding: "10px 12px",
                borderRadius: 12,
                border: 0,
                background: "#0b1220",
                color: "white",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: "#fff7ed", padding: 16, borderRadius: 16, border: "1px solid #fed7aa" }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Profile not found</div>
          <div style={{ color: "#7c2d12" }}>Please create your profile to continue.</div>
          <button
            onClick={() => nav("/profile/setup")}
            style={{
              marginTop: 10,
              padding: "10px 12px",
              borderRadius: 12,
              border: 0,
              background: "#0b1220",
              color: "white",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            Setup Profile
          </button>
        </div>
      )}
    </Shell>
  );
}