import { useAuth } from '../context/AuthContext';

export function Sidebar({ currentView, onNavigate, mobileOpen, onCloseMobile }) {
  const { isAdmin } = useAuth();

  const handleNav = (view) => {
    onNavigate(view);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99
          }}
          onClick={onCloseMobile}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <div className="brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">Smart Campus</span>
            <span className="brand-subtitle">Service Management</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Portal</div>

          <a
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            href="#dashboard"
            onClick={(e) => { e.preventDefault(); handleNav('dashboard'); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </a>

          <a
            className={`nav-item ${currentView === 'submit' ? 'active' : ''}`}
            href="#submit"
            onClick={(e) => { e.preventDefault(); handleNav('submit'); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Submit Request</span>
          </a>

          <a
            className={`nav-item ${currentView === 'track' ? 'active' : ''}`}
            href="#track"
            onClick={(e) => { e.preventDefault(); handleNav('track'); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Track Request</span>
          </a>

          <a
            className={`nav-item ${currentView === 'requests' ? 'active' : ''}`}
            href="#requests"
            onClick={(e) => { e.preventDefault(); handleNav('requests'); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>All Requests</span>
          </a>

          {isAdmin && (
            <>
              <div className="nav-section-title" style={{ marginTop: '1rem' }}>Administration</div>
              <a
                className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
                href="#admin"
                onClick={(e) => { e.preventDefault(); handleNav('admin'); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Admin Panel</span>
              </a>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="system-status-indicator">
            <div className="status-dot"></div>
            <span>Campus System Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}
