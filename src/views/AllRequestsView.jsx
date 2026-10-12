import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';

export function AllRequestsView({ onInspectRequest, onQuickTrack, onToast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadRequests = async (overrideStatus, overrideCategory, overrideSearch) => {
    setLoading(true);
    try {
      const data = await api.getRequests({
        status: overrideStatus !== undefined ? overrideStatus : statusFilter,
        category: overrideCategory !== undefined ? overrideCategory : categoryFilter,
        search: overrideSearch !== undefined ? overrideSearch : searchQuery
      });
      setRequests(data || []);
    } catch (err) {
      if (onToast) onToast('Failed to load service requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadRequests();
  };

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setSearchQuery('');
    loadRequests('ALL', 'ALL', '');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="view-section active">
      <div className="card">
        {/* Table Controls: Status Tabs, Category Filter & Search */}
        <div className="table-controls">
          <div className="filter-group">
            <div className="status-tabs">
              {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`status-tab-btn ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === 'ALL' && 'All Requests'}
                  {st === 'PENDING' && 'Pending'}
                  {st === 'IN_PROGRESS' && 'In Progress'}
                  {st === 'RESOLVED' && 'Resolved'}
                </button>
              ))}
            </div>

            <select
              className="form-control category-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              <option value="ALL">All Categories</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Wi-Fi">Wi-Fi</option>
              <option value="Classroom Maintenance">Classroom Maintenance</option>
              <option value="Laboratory Equipment">Laboratory Equipment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <form className="search-group" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search by ID, name, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
              onClick={handleResetFilters}
            >
              Reset
            </button>
          </form>
        </div>

        {/* Requests Data Table */}
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Student & Department</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                      Loading requests...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="empty-title">No matching requests found</div>
                        <div className="empty-desc">Try resetting your filters or submit a new service request.</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
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
                        <small className="text-muted">{req.studentId} &bull; {req.department}</small>
                      </td>
                      <td>
                        <span className="badge badge-category">
                          {req.categoryDisplayName || req.serviceCategory}
                        </span>
                      </td>
                      <td>
                        <PriorityBadge priority={req.priority} />
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {formatDate(req.createdAt)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => onInspectRequest(req.id)}
                            title="View Details"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => onQuickTrack(req.requestId)}
                            title="Track Live"
                          >
                            Track
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
