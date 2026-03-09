import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RedirectIfAuth({ children }) {
  const accessToken = useSelector((s) => s.auth.accessToken);
  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}