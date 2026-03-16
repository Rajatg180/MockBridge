import { createBrowserRouter, Navigate } from 'react-router-dom';

import ProtectedRoute from '../components/common/ProtectedRoute';
import PublicOnlyRoute from '../components/common/PublicOnlyRoute';
import AppShell from '../components/layout/AppShell';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import InterviewMarketplacePage from '../pages/InterviewMarketplacePage';
import MySlotsPage from '../pages/MySlotsPage';
import MyBookingsPage from '../pages/MyBookingsPage';
import SessionRoomPage from '../pages/SessionRoomPage';
import RouteErrorPage from '../pages/RouteErrorPage';
import NotFoundPage from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'interviewers',
        element: <InterviewMarketplacePage />,
      },
      {
        path: 'slots',
        element: <MySlotsPage />,
      },
      {
        path: 'bookings',
        element: <MyBookingsPage />,
      },
      {
        path: 'session/:roomId',
        element: <SessionRoomPage />,
      },
      {
        path: 'session-room',
        element: <SessionRoomPage />,
      },
    ],
  },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
    errorElement: <RouteErrorPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
