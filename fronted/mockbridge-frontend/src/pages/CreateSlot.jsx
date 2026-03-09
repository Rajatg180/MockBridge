import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Shell from "../ui/Shell";
import SectionCard from "../ui/SectionCard";
import StatusBadge from "../ui/StatusBadge";
import { submitCreateSlot } from "../features/interview/interviewSlice";
import { toastAdded } from "../features/ui/uiSlice";

export default function CreateSlot() {
  const dispatch = useDispatch();
  const createSlotStatus = useSelector((s) => s.interview.createSlotStatus);
  const recentCreatedSlot = useSelector((s) => s.interview.recentCreatedSlot);

  const [startTimeUtc, setStartTimeUtc] = useState("");
  const [endTimeUtc, setEndTimeUtc] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!startTimeUtc || !endTimeUtc) {
      dispatch(
        toastAdded({
          type: "error",
          title: "Missing fields",
          message: "Start and end time are required.",
        })
      );
      return;
    }

    const action = await dispatch(
      submitCreateSlot({
        startTimeUtc,
        endTimeUtc,
      })
    );

    if (submitCreateSlot.fulfilled.match(action)) {
      dispatch(
        toastAdded({
          type: "success",
          title: "Slot created",
          message: "Your slot is now OPEN.",
        })
      );
    } else {
      dispatch(
        toastAdded({
          type: "error",
          title: "Create slot failed",
          message: action.payload || "Could not create slot.",
        })
      );
    }
  };

  return (
    <Shell title="Create Slot" subtitle="Any authenticated user can act as interviewer for a slot">
      <div style={{ display: "grid", gap: 16 }}>
        <SectionCard title="New slot form">
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 560 }}>
            <div>
              <label style={labelStyle}>Start time (UTC)</label>
              <input
                type="datetime-local"
                value={startTimeUtc}
                onChange={(e) => setStartTimeUtc(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>End time (UTC)</label>
              <input
                type="datetime-local"
                value={endTimeUtc}
                onChange={(e) => setEndTimeUtc(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button disabled={createSlotStatus === "loading"} style={primaryButton}>
              {createSlotStatus === "loading" ? "Creating..." : "Create Slot"}
            </button>
          </form>
        </SectionCard>

        {recentCreatedSlot ? (
          <SectionCard title="Most recent created slot">
            <div style={{ display: "grid", gap: 8 }}>
              <div><b>Slot ID:</b> {recentCreatedSlot.id}</div>
              <div><b>Interviewer:</b> {recentCreatedSlot.interviewerId}</div>
              <div><b>Start:</b> {recentCreatedSlot.startTimeUtc}</div>
              <div><b>End:</b> {recentCreatedSlot.endTimeUtc}</div>
              <div><StatusBadge value={recentCreatedSlot.status} /></div>
            </div>
          </SectionCard>
        ) : null}
      </div>
    </Shell>
  );
}

const labelStyle = {
  display: "block",
  fontWeight: 800,
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
};

const primaryButton = {
  padding: "10px 12px",
  borderRadius: 12,
  border: 0,
  background: "#0f172a",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
  width: "fit-content",
};