import { StatusBadge, PriorityBadge } from './StatusBadge';

export function RequestDetailsModal({ request, onClose }) {
  if (!request) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
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
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">Request Inspection Details</h2>
          <button type="button" className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="tracking-details-card">
            <div className="detail-item">
              <span className="detail-label">Request ID</span>
              <span className="detail-value req-id-badge" style={{ fontSize: '1rem' }}>{request.requestId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Current Status</span>
              <div><StatusBadge status={request.status} /></div>
            </div>
            <div className="detail-item">
              <span className="detail-label">Priority Level</span>
              <div><PriorityBadge priority={request.priority} /></div>
            </div>
            <div className="detail-item">
              <span className="detail-label">Student Name</span>
              <span className="detail-value">{request.studentName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Student ID</span>
              <span className="detail-value">{request.studentId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Department</span>
              <span className="detail-value">{request.department}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Service Category</span>
              <span className="detail-value">{request.categoryDisplayName || request.serviceCategory}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Location / Room</span>
              <span className="detail-value">{request.location || 'Not specified'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Submitted On</span>
              <span className="detail-value">{formatDate(request.createdAt)}</span>
            </div>
            <div className="detail-item full-col">
              <span className="detail-label">Detailed Description</span>
              <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginTop: '0.25rem' }}>
                {request.description}
              </div>
            </div>
            <div className="detail-item full-col">
              <span className="detail-label">Admin / Technician Remarks</span>
              <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginTop: '0.25rem' }}>
                {request.adminNotes ? request.adminNotes : <em>No administrator remarks recorded yet.</em>}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
