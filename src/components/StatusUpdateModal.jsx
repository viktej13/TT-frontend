import { useState, useEffect } from 'react';

export function StatusUpdateModal({ request, onSave, onClose }) {
  const [status, setStatus] = useState('PENDING');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (request) {
      setStatus(request.status || 'PENDING');
      setAdminNotes(request.adminNotes || '');
    }
  }, [request]);

  if (!request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(request.id, { status, adminNotes: adminNotes.trim() });
      onClose();
    } catch {
      // Handled by parent toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">Update Status: {request.requestId}</h2>
          <button type="button" className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Set Current Status</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                <label className={`priority-option ${status === 'PENDING' ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="modalStatus"
                    value="PENDING"
                    checked={status === 'PENDING'}
                    onChange={() => setStatus('PENDING')}
                  />
                  <span className="priority-label" style={{ textAlign: 'center', width: '100%', padding: '0.6rem 0.2rem' }}>Pending</span>
                </label>
                <label className={`priority-option ${status === 'IN_PROGRESS' ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="modalStatus"
                    value="IN_PROGRESS"
                    checked={status === 'IN_PROGRESS'}
                    onChange={() => setStatus('IN_PROGRESS')}
                  />
                  <span className="priority-label" style={{ textAlign: 'center', width: '100%', padding: '0.6rem 0.2rem' }}>In Progress</span>
                </label>
                <label className={`priority-option ${status === 'RESOLVED' ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="modalStatus"
                    value="RESOLVED"
                    checked={status === 'RESOLVED'}
                    onChange={() => setStatus('RESOLVED')}
                  />
                  <span className="priority-label" style={{ textAlign: 'center', width: '100%', padding: '0.6rem 0.2rem' }}>Resolved</span>
                </label>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label" htmlFor="modalAdminNotes">Technician / Administrator Remarks</label>
              <textarea
                id="modalAdminNotes"
                className="form-control"
                rows="4"
                placeholder="Enter actions taken, resolution notes, or technician details..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving Changes...' : 'Save Status Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
