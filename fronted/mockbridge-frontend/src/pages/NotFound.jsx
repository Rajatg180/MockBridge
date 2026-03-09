import React from "react";
import { Link } from "react-router-dom";
import Shell from "../ui/Shell";

export default function NotFound() {
  return (
    <Shell title="404" subtitle="The page you are looking for does not exist">
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ color: "#475569" }}>
          Check the URL or go back to the dashboard.
        </div>
        <div>
          <Link to="/dashboard">Go to dashboard</Link>
        </div>
      </div>
    </Shell>
  );
}