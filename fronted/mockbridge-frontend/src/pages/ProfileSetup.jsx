import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../ui/Shell.jsx";

import { addSkill, createProfile, deleteSkill, getMyProfile, updateProfile } from "../api/userApi.js";
import { toastAdded } from "../features/ui/uiSlice";
import { useDispatch } from "react-redux";
import { showApiErrorToast } from "../api/apiClient";

export default function ProfileSetup() {
  const nav = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);

  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [years, setYears] = useState(0);

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [newProf, setNewProf] = useState("BEGINNER");

  const load = async () => {
    setLoading(true);
    try {
      const p = await getMyProfile();
      setExists(true);
      setFullName(p.fullName || "");
      setHeadline(p.headline || "");
      setBio(p.bio || "");
      setYears(p.yearsOfExperience || 0);
      setSkills(p.skills || []);
    } catch {
      setExists(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      dispatch(toastAdded({ type: "error", title: "Validation", message: "Full name is required." }));
      return;
    }

    try {
      const payload = {
        fullName: fullName.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        yearsOfExperience: Number(years),
        skills: [],
      };

      const p = exists ? await updateProfile(payload) : await createProfile(payload);
      setExists(true);
      setSkills(p.skills || []);
      dispatch(toastAdded({ type: "success", title: "Saved", message: "Profile updated successfully." }));
      nav("/dashboard");
    } catch (err) {
      showApiErrorToast(err, "Save failed");
    }
  };

  const add = async () => {
    if (!newSkill.trim()) return;
    try {
      const s = await addSkill({ skillName: newSkill.trim(), proficiency: newProf });
      setSkills((prev) => [...prev, s]);
      setNewSkill("");
      setNewProf("BEGINNER");
      dispatch(toastAdded({ type: "success", title: "Added", message: "Skill added." }));
    } catch (err) {
      showApiErrorToast(err, "Add skill failed");
    }
  };

  const remove = async (id) => {
    try {
      await deleteSkill(id);
      setSkills((prev) => prev.filter((x) => x.id !== id));
      dispatch(toastAdded({ type: "info", title: "Deleted", message: "Skill removed." }));
    } catch (err) {
      showApiErrorToast(err, "Delete failed");
    }
  };

  return (
    <Shell title={exists ? "Edit Profile" : "Create Profile"} subtitle="Keep it short and clear">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <form onSubmit={submit} style={{ display: "grid", gap: 10, maxWidth: 720 }}>
            <input
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e2e8f0" }}
            />
            <input
              placeholder="Headline (e.g., Backend Engineer)"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e2e8f0" }}
            />
            <textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e2e8f0", minHeight: 110 }}
            />
            <input
              placeholder="Years of experience"
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e2e8f0" }}
            />

            <button
              style={{
                padding: 12,
                borderRadius: 12,
                border: 0,
                background: "#0b1220",
                color: "white",
                cursor: "pointer",
                fontWeight: 800,
                maxWidth: 240,
              }}
            >
              {exists ? "Update Profile" : "Create Profile"}
            </button>
          </form>

          <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #eef2f7" }}>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>Skills</div>

            <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <input
                placeholder="Skill name (e.g., Spring Boot)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                style={{ flex: 1, minWidth: 240, padding: 12, borderRadius: 12, border: "1px solid #e2e8f0" }}
              />
              <select
                value={newProf}
                onChange={(e) => setNewProf(e.target.value)}
                style={{ padding: 12, borderRadius: 12, border: "1px solid #e2e8f0" }}
              >
                <option>BEGINNER</option>
                <option>INTERMEDIATE</option>
                <option>EXPERT</option>
              </select>
              <button
                type="button"
                onClick={add}
                disabled={!newSkill.trim()}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  cursor: newSkill.trim() ? "pointer" : "not-allowed",
                  fontWeight: 800,
                  opacity: newSkill.trim() ? 1 : 0.6,
                }}
              >
                Add
              </button>
            </div>

            {skills.length === 0 ? (
              <div style={{ color: "#64748b" }}>No skills added yet.</div>
            ) : (
              <ul style={{ paddingLeft: 18 }}>
                {skills.map((s) => (
                  <li key={s.id} style={{ marginBottom: 8, display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ flex: 1 }}>
                      {s.skillName} ({s.proficiency})
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(s.id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        background: "white",
                        cursor: "pointer",
                        fontWeight: 800,
                      }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={() => nav("/dashboard")}
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "white",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Back
            </button>
          </div>
        </>
      )}
    </Shell>
  );
}