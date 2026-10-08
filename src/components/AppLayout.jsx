import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/reports', label: 'Reports' },
  { to: '/archive', label: 'Archive' },
  { to: '/settings', label: 'Settings' },
];

export default function AppLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">R</div>
          <div>
            <p className="eyebrow">Property Ops</p>
            <h1>Reservations</h1>
          </div>
        </div>

        <nav className="nav">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          Log out
        </button>
      </aside>

      <main className="content-panel">
        <Outlet />
      </main>
    </div>
  );
}
