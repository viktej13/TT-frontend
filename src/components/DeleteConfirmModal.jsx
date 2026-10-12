export function DeleteConfirmModal({ request, onConfirm, onClose, loading }) {
  if (!request) return null;

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: 'var(--danger)' }}>Confirm Ticket Deletion</h2>
          <button type="button" className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
            Are you sure you want to permanently delete service request{' '}
            <strong style={{ color: 'var(--text-main)' }}>{request.requestId}</strong>?
          </p>
          <div style={{ padding: '0.85rem', background: 'var(--danger-light)', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca', fontSize: '0.85rem', color: '#991b1b' }}>
            Warning: This action cannot be undone. All request history and remarks will be permanently deleted from PostgreSQL.
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ background: 'var(--danger)' }}
            onClick={() => onConfirm(request.id)}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
