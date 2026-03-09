import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Shell from "../ui/Shell";
import SectionCard from "../ui/SectionCard";
import StatusBadge from "../ui/StatusBadge";
import LoadingBlock from "../ui/LoadingBlock";
import EmptyState from "../ui/EmptyState";
import { fetchMyProfile } from "../features/profile/profileSlice";

export default function Dashboard() {
  const nav = useNavigate();
  const dispatch = useDispatch();

  const auth = useSelector((s) => s.auth);
  const profile = useSelector((s) => s.profile.data);
  const profileStatus = useSelector((s) => s.profile.status);
  const interview = useSelector((s) => s.interview || {});

  useEffect(() => {
    if (!profile && profileStatus !== "loading") {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, profile, profileStatus]);

  return (
    <Shell
      title="Dashboard"
      subtitle={auth.user ? `Signed in as ${auth.user.email} (${auth.user.role})` : ""}
    >
      <div style={{ display: "grid", gap: 16 }}>
        <SectionCard title="Quick actions">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => nav("/profile/setup")} style={buttonPrimary}>
              Profile
            </button>
            <button onClick={() => nav("/interviews/open-slots")} style={buttonSecondary}>
              Browse Open Slots
            </button>
            <button onClick={() => nav("/interviews/create-slot")} style={buttonSecondary}>
              Create Slot
            </button>
            <button onClick={() => nav("/interviews/actions")} style={buttonSecondary}>
              Booking Actions
            </button>
          </div>
        </SectionCard>

        <SectionCard title="My profile" subtitle="Current snapshot from user service">
          {profileStatus === "loading" ? (
            <LoadingBlock label="Loading profile..." />
          ) : profile ? (
            <div style={{ display: "grid", gap: 8 }}>
              <div><b>Name:</b> {profile.fullName}</div>
              <div><b>Headline:</b> {profile.headline || "-"}</div>
              <div><b>Experience:</b> {profile.yearsOfExperience} years</div>
              <div><b>Bio:</b> {profile.bio || "-"}</div>
              <div>
                <b>Skills:</b>{" "}
                {(profile.skills || []).length > 0
                  ? profile.skills.map((s) => `${s.skillName} (${s.proficiency})`).join(", ")
                  : "No skills yet"}
              </div>
            </div>
          ) : (
            <EmptyState
              title="Profile not found"
              message="Create your profile to complete onboarding."
              action={
                <button onClick={() => nav("/profile/setup")} style={buttonPrimary}>
                  Setup Profile
                </button>
              }
            />
          )}
        </SectionCard>

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <SectionCard title="Recent created slot">
            {interview.recentCreatedSlot ? (
              <div style={{ display: "grid", gap: 8 }}>
                <div><b>Slot ID:</b> {interview.recentCreatedSlot.id}</div>
                <div><b>Start:</b> {interview.recentCreatedSlot.startTimeUtc}</div>
                <div><b>End:</b> {interview.recentCreatedSlot.endTimeUtc}</div>
                <div><StatusBadge value={interview.recentCreatedSlot.status} /></div>
              </div>
            ) : (
              <EmptyState title="No slot created yet" message="Create your first slot to start mock interviews." />
            )}
          </SectionCard>

          <SectionCard title="Recent booking">
            {interview.recentBooking ? (
              <div style={{ display: "grid", gap: 8 }}>
                <div><b>Booking ID:</b> {interview.recentBooking.bookingId}</div>
                <div><b>Slot ID:</b> {interview.recentBooking.slotId}</div>
                <div><StatusBadge value={interview.recentBooking.status} /></div>
                <button
                  onClick={() => nav("/interviews/actions", { state: { bookingId: interview.recentBooking.bookingId } })}
                  style={buttonSecondary}
                >
                  Use Booking ID
                </button>
              </div>
            ) : (
              <EmptyState title="No booking yet" message="Book an open slot to continue the session flow." />
            )}
          </SectionCard>

          <SectionCard title="Recent session">
            {interview.recentConfirmedSession ? (
              <div style={{ display: "grid", gap: 8 }}>
                <div><b>Session ID:</b> {interview.recentConfirmedSession.sessionId}</div>
                <div><b>Booking ID:</b> {interview.recentConfirmedSession.bookingId}</div>
                <div><b>Room:</b> {interview.recentConfirmedSession.roomId}</div>
                <div><StatusBadge value={interview.recentConfirmedSession.sessionStatus} /></div>
                <button
                  onClick={() => nav(`/interviews/session/${interview.recentConfirmedSession.bookingId}`)}
                  style={buttonPrimary}
                >
                  Open Session
                </button>
              </div>
            ) : (
              <EmptyState title="No session yet" message="A session appears after booking confirmation." />
            )}
          </SectionCard>
        </div>
      </div>
    </Shell>
  );
}

const buttonPrimary = {
  padding: "10px 12px",
  borderRadius: 12,
  border: 0,
  background: "#0f172a",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const buttonSecondary = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "white",
  cursor: "pointer",
  fontWeight: 800,
};