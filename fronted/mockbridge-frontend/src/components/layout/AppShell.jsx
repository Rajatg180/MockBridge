import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authSlice';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'My Profile' },
  { to: '/interviewers/search', label: 'Search Interviewers' },
  { to: '/slots/open', label: 'Open Slots' },
  { to: '/slots/create', label: 'Create Slot' },
  { to: '/booking-requests', label: 'Booking Requests' },
  { to: '/my-bookings', label: 'My Bookings' },
  { to: '/workspace', label: 'Workspace' },
];

export function AppShell() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  async function handleLogout() {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">MockBridge</p>
          <h2 className="sidebar-title">Frontend for your microservices</h2>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user card subtle">
          <div>
            <p className="label">Signed in as</p>
            <strong>{user?.email}</strong>
            <p className="muted">Role: {user?.role || 'USER'}</p>
          </div>
          <button type="button" className="button button-secondary button-full" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="content-shell">
        <header className="topbar">
          <div>
            <h1 className="topbar-title">MockBridge Control Center</h1>
            <p className="muted">Gateway-backed flows with token refresh and persistent workspace state.</p>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
