import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppBootstrap } from "../components/routing/AppBootstrap";
import { ProtectedRoute } from "../components/routing/ProtectedRoute";
import { GuestRoute } from "../components/routing/GuestRoute";
import { ProfileCompletionGuard } from "../components/routing/ProfileCompletionGuard";
import { AppShell } from "../components/layout/AppShell";

import { AuthLayout } from "../components/layout/AuthLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";

import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { ProfileSetupPage } from "../pages/profile/ProfileSetupPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { EditProfilePage } from "../pages/profile/EditProfilePage";
import { PublicProfilePage } from "../pages/profile/PublicProfilePage";

import { SearchInterviewersPage } from "../pages/profile/SearchInterviewersPage";

import { OpenSlotsPage } from "../pages/slots/OpenSlotsPage";
import { CreateSlotPage } from "../pages/slots/CreateSlotPage";

import { BookingRequestsPage } from "../pages/interviews/BookingRequestsPage";
import { MyBookingsPage } from "../pages/interviews/MyBookingsPage";
import { SessionPage } from "../pages/interviews/SessionPage";
import { WorkspacePage } from "../pages/interviews/WorkspacePage";

import { NotFoundPage } from "../pages/dashboard/NotFoundPage";
import { MySlotsPage } from '../pages/interviews/MySlotsPage';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppBootstrap />,
    children: [
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { index: true, element: <Navigate to="/login" replace /> },
              { path: "login", element: <LoginPage /> },
              { path: "register", element: <RegisterPage /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "profile/setup", element: <ProfileSetupPage /> },

          {
            element: <ProfileCompletionGuard />,
            children: [
              {
                element: <AppShell />,
                children: [
                  { path: "dashboard", element: <DashboardPage /> },

                  { path: "profile", element: <ProfilePage /> },
                  { path: "profile/edit", element: <EditProfilePage /> },
                  { path: "profiles/:userId", element: <PublicProfilePage /> },

                  { path: "interviewers/search", element: <SearchInterviewersPage /> },

                  { path: "slots/open", element: <OpenSlotsPage /> },
                  { path: "slots/create", element: <CreateSlotPage /> },

                  { path: "booking-requests", element: <BookingRequestsPage /> },

                  /* STUDENT BOOKINGS */
                  { path: "my-bookings", element: <MyBookingsPage /> },

                  /* VIDEO SESSION */
                  { path: "session/:bookingId", element: <SessionPage /> },

                  { path: 'my-slots', element: <MySlotsPage /> },

                  { path: "workspace", element: <WorkspacePage /> },
                ],
              },
            ],
          },
        ],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);