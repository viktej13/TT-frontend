import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export function DashboardView({ onNavigate, onInspectRequest, onQuickTrack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const categoryIcons = {
    'Electrical': '⚡',
    'Plumbing': '🔧',
    'Wi-Fi': '📶',
    'Classroom Maintenance': '🏫',
    'Laboratory Equipment': '🔬',
    'Other': '📋'
  };

  const total = stats?.totalRequests || 0;
  const pending = stats?.pendingRequests || 0;
  const inProgress = stats?.inProgressRequests || 0;
  const resolved = stats?.resolvedRequests || 0;

  return (
    <section className="view-section active">
      {/* 4 Quick Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-info">
            <span className="stat-label">Total Requests</span>
            <span className="stat-value">{loading ? '...' : total}</span>
          </div>
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-info">
            <span className="stat-label">Pending Review</span>
            <span className="stat-value">{loading ? '...' : pending}</span>
          </div>
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="stat-card inprogress">
          <div className="stat-info">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{loading ? '...' : inProgress}</span>
          </div>
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <div className="stat-card resolved">
          <div className="stat-info">
            <span className="stat-label">Resolved</span>
            <span className="stat-value">{loading ? '...' : resolved}</span>
          </div>
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Dashboard Grid: Recent Activity & Categories */}
      <div className="dashboard-grid">
        {/* Recent Requests */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Recent Service Requests</span>
            </h2>
            <div className="card-actions">
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                onClick={() => onNavigate('requests')}
              >
                View All
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Student & Department</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading recent tickets...</td>
                    </tr>
                  ) : !stats?.recentRequests || stats.recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        <div className="empty-title">No service requests found</div>
                        <div className="empty-desc">Submit your first request using the "New Request" button.</div>
                      </td>
                    </tr>
                  ) : (
                    stats.recentRequests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <span
                            className="req-id-badge"
                            onClick={() => onQuickTrack(req.requestId)}
                            title="Click to Track"
                          >
                            {req.requestId}
                          </span>
                        </td>
                        <td>
                          <div><strong>{req.studentName}</strong></div>
                          <small className="text-muted">{req.department}</small>
                        </td>
                        <td>
                          <span className="badge badge-category">
                            {req.categoryDisplayName || req.serviceCategory}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={req.status} />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
                            onClick={() => onInspectRequest(req.id)}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Service Categories</span>
            </h2>
          </div>
          <div className="card-body">
            <div className="category-stat-list">
              {stats?.categoryCounts &&
                Object.entries(stats.categoryCounts).map(([catName, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const icon = categoryIcons[catName] || '🛠️';
                  return (
                    <div key={catName} className="category-stat-item">
                      <div className="category-stat-header">
                        <span className="category-name">{icon} {catName}</span>
                        <span className="category-count">{count} ({pct}%)</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-bar" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
