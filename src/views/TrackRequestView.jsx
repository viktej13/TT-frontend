import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';

export function TrackRequestView({ initialRequestId, onToast }) {
  const [requestIdInput, setRequestIdInput] = useState('');
  const [trackedRequest, setTrackedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialRequestId) {
      setRequestIdInput(initialRequestId);
      handleTrack(initialRequestId);
    }
  }, [initialRequestId]);

  const handleTrack = async (idToSearch) => {
    const query = (idToSearch || requestIdInput).trim();
    if (!query) {
      if (onToast) onToast('Please enter a Request ID', 'warning');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.trackRequest(query);
      setTrackedRequest(data);
    } catch (err) {
      setTrackedRequest(null);
      setError(err.message || 'Request not found with tracking ID: ' + query);
      if (onToast) onToast(err.message || 'Request not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepName) => {
    if (!trackedRequest) return '';
    const s = trackedRequest.status;
    if (stepName === 'PENDING') {
      return 'completed';
    }
    if (stepName === 'IN_PROGRESS') {
      if (s === 'IN_PROGRESS') return 'active';
      if (s === 'RESOLVED') return 'completed';
      return '';
    }
    if (stepName === 'RESOLVED') {
      if (s === 'RESOLVED') return 'completed';
      return '';
    }
    return '';
  };

  const getProgressWidth = () => {
    if (!trackedRequest) return '0%';
    const s = trackedRequest.status;
    if (s === 'PENDING') return '15%';
    if (s === 'IN_PROGRESS') return '50%';
    if (s === 'RESOLVED') return '100%';
    return '0%';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="view-section active">
      <div className="card" style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div className="card-header">
          <h2 className="card-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Track Campus Service Ticket</span>
          </h2>
        </div>
        <div className="card-body">
          {/* Tracking Search Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleTrack(); }}
            style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Enter unique request ID (e.g. REQ-20261012-4821)"
              value={requestIdInput}
              onChange={(e) => setRequestIdInput(e.target.value)}
              style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
            >
              <span>{loading ? 'Searching...' : 'Track Ticket'}</span>
            </button>
          </form>

          {error && (
            <div style={{ padding: '1rem', background: 'var(--danger-light)', borderRadius: 'var(--radius-md)', color: '#b91c1c', border: '1px solid #fecaca', marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          {trackedRequest && (
            <div className="tracking-result-card" style={{ display: 'block' }}>
              {/* Stepper Progress Bar */}
              <div className="tracking-stepper">
                <div
                  className="stepper-progress-line"
                  style={{ width: getProgressWidth() }}
                ></div>

                <div className={`step-item ${getStepStatus('PENDING')}`}>
                  <div className="step-circle">1</div>
                  <span className="step-title">Submitted</span>
                  <span className="step-desc">Pending triage</span>
                </div>

                <div className={`step-item ${getStepStatus('IN_PROGRESS')}`}>
                  <div className="step-circle">2</div>
                  <span className="step-title">In Progress</span>
                  <span className="step-desc">Assigned / Work ongoing</span>
                </div>

                <div className={`step-item ${getStepStatus('RESOLVED')}`}>
                  <div className="step-circle">3</div>
                  <span className="step-title">Resolved</span>
                  <span className="step-desc">Completed</span>
                </div>
              </div>

              {/* Detailed Request Meta Card */}
              <div className="tracking-details-card">
                <div className="detail-item">
                  <span className="detail-label">Request ID</span>
                  <span className="detail-value req-id-badge" style={{ fontSize: '1.1rem' }}>
                    {trackedRequest.requestId}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Current Status</span>
                  <div><StatusBadge status={trackedRequest.status} /></div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Priority Level</span>
                  <div><PriorityBadge priority={trackedRequest.priority} /></div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Student Name</span>
                  <span className="detail-value">{trackedRequest.studentName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Student ID</span>
                  <span className="detail-value">{trackedRequest.studentId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Academic Department</span>
                  <span className="detail-value">{trackedRequest.department}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Service Category</span>
                  <span className="detail-value">{trackedRequest.categoryDisplayName || trackedRequest.serviceCategory}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Campus Location</span>
                  <span className="detail-value">{trackedRequest.location || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created At</span>
                  <span className="detail-value">{formatDate(trackedRequest.createdAt)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Updated</span>
                  <span className="detail-value">{formatDate(trackedRequest.updatedAt)}</span>
                </div>
                <div className="detail-item full-col">
                  <span className="detail-label">Detailed Description</span>
                  <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginTop: '0.25rem' }}>
                    {trackedRequest.description}
                  </div>
                </div>
                <div className="detail-item full-col">
                  <span className="detail-label">Technician / Administrator Remarks</span>
                  <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginTop: '0.25rem' }}>
                    {trackedRequest.adminNotes ? trackedRequest.adminNotes : <em>No administrator remarks recorded yet.</em>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
