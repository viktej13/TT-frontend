export function StatusBadge({ status }) {
  const norm = (status || '').toUpperCase();

  if (norm === 'RESOLVED') {
    return (
      <span className="badge badge-resolved">
        <span className="badge-dot dot-resolved"></span>
        Resolved
      </span>
    );
  }

  if (norm === 'IN_PROGRESS') {
    return (
      <span className="badge badge-inprogress">
        <span className="badge-dot dot-inprogress"></span>
        In Progress
      </span>
    );
  }

  return (
    <span className="badge badge-pending">
      <span className="badge-dot dot-pending"></span>
      Pending
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const norm = (priority || '').toUpperCase();

  const map = {
    LOW: { label: 'Low', className: 'badge-priority-low' },
    MEDIUM: { label: 'Medium', className: 'badge-priority-medium' },
    HIGH: { label: 'High', className: 'badge-priority-high' },
    URGENT: { label: 'Urgent', className: 'badge-priority-urgent' }
  };

  const item = map[norm] || map.MEDIUM;

  return (
    <span className={`badge ${item.className}`}>
      {item.label}
    </span>
  );
}
