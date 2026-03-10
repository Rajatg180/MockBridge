import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";
import OpenSlots from "./pages/OpenSlots";
import CreateSlot from "./pages/CreateSlot";
import BookingActions from "./pages/BookingActions";
// import SessionRoom from "./pages/SessionRoom";
import NotFound from "./pages/NotFound";

import RequireAuth from "./auth/RequireAuth";
import RedirectIfAuth from "./auth/RedirectIfAuth";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          <RedirectIfAuth>
            <Login />
          </RedirectIfAuth>
        }
      />

      <Route
        path="/register"
        element={
          <RedirectIfAuth>
            <Register />
          </RedirectIfAuth>
        }
      />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      <Route
        path="/profile/setup"
        element={
          <RequireAuth>
            <ProfileSetup />
          </RequireAuth>
        }
      />

      <Route
        path="/interviews/open-slots"
        element={
          <RequireAuth>
            <OpenSlots />
          </RequireAuth>
        }
      />

      <Route
        path="/interviews/create-slot"
        element={
          <RequireAuth>
            <CreateSlot />
          </RequireAuth>
        }
      />

      <Route
        path="/interviews/actions"
        element={
          <RequireAuth>
            <BookingActions />
          </RequireAuth>
        }
      />

      {/* <Route
        path="/interviews/session/:bookingId"
        element={
          <RequireAuth>
            <SessionRoom />
          </RequireAuth>
        }
      /> */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}