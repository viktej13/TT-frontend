import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function Header({ currentView, onNavigate, onToggleMobileSidebar }) {
  const { user, isAdmin, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    }
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const viewMetadata = {
    dashboard: {
      title: 'Campus Service Dashboard',
      subtitle: 'Overview of facility requests, real-time metrics & analytics'
    },
    submit: {
      title: 'New Service Request',
      subtitle: 'Submit campus maintenance and facility support requests'
    },
    track: {
      title: 'Track Service Request',
      subtitle: 'Enter your tracking code to view live resolution updates'
    },
    requests: {
      title: 'All Service Requests',
      subtitle: 'Filter, view, and inspect campus maintenance tickets'
    },
    admin: {
      title: 'Administrator Management',
      subtitle: 'Update statuses, manage ticket assignments, and oversee campus requests'
    }
  };

  const meta = viewMetadata[currentView] || viewMetadata.dashboard;

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          className="menu-toggle-btn"
          id="menuToggle"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="page-breadcrumb">
          <h1 className="current-view-title">{meta.title}</h1>
          <p className="current-view-subtitle">{meta.subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {currentTime && <div className="live-clock">{currentTime}</div>}

        {user && (
          <div className="user-profile-widget" id="userProfileWidget">
            <div className="user-info-text">
              <span className="user-name-label">{user.fullName || user.email}</span>
              <span className="user-role-label">{isAdmin ? 'Administrator' : 'Student'}</span>
            </div>
            <button
              type="button"
              className="btn-logout"
              onClick={logout}
              title="Sign Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onNavigate('submit')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Request</span>
        </button>
      </div>
    </header>
  );
}
