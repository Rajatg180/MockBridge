import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../ui/Shell";
import { useDispatch, useSelector } from "react-redux";
import {
  createSkill,
  fetchMyProfile,
  removeSkill,
  saveProfile,
} from "../features/profile/profileSlice";
import { toastAdded } from "../features/ui/uiSlice";
import LoadingBlock from "../ui/LoadingBlock";

export default function ProfileSetup() {
  const nav = useNavigate();
  const dispatch = useDispatch();

  const profile = useSelector((s) => s.profile.data);
  const status = useSelector((s) => s.profile.status);
  const saveStatus = useSelector((s) => s.profile.saveStatus);
  const skillStatus = useSelector((s) => s.profile.skillStatus);

  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [years, setYears] = useState(0);
  const [newSkill, setNewSkill] = useState("");
  const [newProf, setNewProf] = useState("BEGINNER");

  useEffect(() => {
    if (!profile && status !== "loading") {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, profile, status]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setHeadline(profile.headline || "");
      setBio(profile.bio || "");
      setYears(profile.yearsOfExperience || 0);
    }
  }, [profile]);

  const exists = Boolean(profile);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      dispatch(
        toastAdded({
          type: "error",
          title: "Validation",
          message: "Full name is required.",
        })
      );
      return;
    }

    const action = await dispatch(
      saveProfile({
        exists,
        payload: {
          fullName: fullName.trim(),
          headline: headline.trim(),
          bio: bio.trim(),
          yearsOfExperience: Number(years),
          skills: [],
        },
      })
    );

    if (saveProfile.fulfilled.match(action)) {
      dispatch(
        toastAdded({
          type: "success",
          title: exists ? "Profile updated" : "Profile created",
          message: "Saved successfully.",
        })
      );
      nav("/dashboard");
    } else {
      dispatch(
        toastAdded({
          type: "error",
          title: "Save failed",
          message: action.payload || "Could not save profile.",
        })
      );
    }
  };

  const onAddSkill = async () => {
    if (!newSkill.trim()) return;

    const action = await dispatch(
      createSkill({ skillName: newSkill.trim(), proficiency: newProf })
    );

    if (createSkill.fulfilled.match(action)) {
      dispatch(
        toastAdded({
          type: "success",
          title: "Skill added",
          message: "Your skill was added.",
        })
      );
      setNewSkill("");
      setNewProf("BEGINNER");
    } else {
      dispatch(
        toastAdded({
          type: "error",
          title: "Add skill failed",
          message: action.payload || "Could not add skill.",
        })
      );
    }
  };

  const onDeleteSkill = async (skillId) => {
    const action = await dispatch(removeSkill(skillId));
    if (removeSkill.fulfilled.match(action)) {
      dispatch(
        toastAdded({
          type: "info",
          title: "Skill deleted",
          message: "The skill was removed.",
        })
      );
    } else {
      dispatch(
        toastAdded({
          type: "error",
          title: "Delete failed",
          message: action.payload || "Could not delete skill.",
        })
      );
    }
  };

  return (
    <Shell title={exists ? "Edit Profile" : "Create Profile"} subtitle="Keep it short and clear">
      {status === "loading" ? (
        <LoadingBlock label="Loading profile..." />
      ) : (
        <>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 720 }}>
            <input
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              style={inputStyle}
            />
            <textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ ...inputStyle, minHeight: 110 }}
            />
            <input
              placeholder="Years of experience"
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              style={inputStyle}
            />

            <button style={primaryButton} disabled={saveStatus === "loading"}>
              {saveStatus === "loading"
                ? "Saving..."
                : exists
                ? "Update Profile"
                : "Create Profile"}
            </button>
          </form>

          <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #eef2f7" }}>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>Skills</div>

            {exists ? (
              <>
                <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                  <input
                    placeholder="Skill name"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    style={{ ...inputStyle, flex: 1, minWidth: 240 }}
                  />
                  <select
                    value={newProf}
                    onChange={(e) => setNewProf(e.target.value)}
                    style={inputStyle}
                  >
                    <option>BEGINNER</option>
                    <option>INTERMEDIATE</option>
                    <option>EXPERT</option>
                  </select>
                  <button
                    type="button"
                    onClick={onAddSkill}
                    disabled={!newSkill.trim() || skillStatus === "loading"}
                    style={secondaryButton}
                  >
                    {skillStatus === "loading" ? "Adding..." : "Add"}
                  </button>
                </div>

                {(profile?.skills || []).length === 0 ? (
                  <div style={{ color: "#64748b" }}>No skills added yet.</div>
                ) : (
                  <ul style={{ paddingLeft: 18 }}>
                    {profile.skills.map((s) => (
                      <li
                        key={s.id}
                        style={{
                          marginBottom: 8,
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <span style={{ flex: 1 }}>
                          {s.skillName} ({s.proficiency})
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteSkill(s.id)}
                          style={secondaryButton}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div style={{ color: "#64748b" }}>
                Save the profile first, then add skills.
              </div>
            )}

            <button onClick={() => nav("/dashboard")} style={{ ...secondaryButton, marginTop: 14 }}>
              Back
            </button>
          </div>
        </>
      )}
    </Shell>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
};

const primaryButton = {
  padding: 12,
  borderRadius: 12,
  border: 0,
  background: "#0b1220",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
  maxWidth: 240,
};

const secondaryButton = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "white",
  cursor: "pointer",
  fontWeight: 800,
};