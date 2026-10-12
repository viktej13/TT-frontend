import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { RequestDetailsModal } from './components/RequestDetailsModal';
import { StatusUpdateModal } from './components/StatusUpdateModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SuccessModal } from './components/SuccessModal';

import { DashboardView } from './views/DashboardView';
import { SubmitRequestView } from './views/SubmitRequestView';
import { TrackRequestView } from './views/TrackRequestView';
import { AllRequestsView } from './views/AllRequestsView';
import { AdminView } from './views/AdminView';

export function App() {
  const { user, loading, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Modal states
  const [inspectRequest, setInspectRequest] = useState(null);
  const [statusModalRequest, setStatusModalRequest] = useState(null);
  const [deleteModalRequest, setDeleteModalRequest] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successModalId, setSuccessModalId] = useState(null);
  const [trackSearchId, setTrackSearchId] = useState('');
  const [adminRefreshTrigger, setAdminRefreshTrigger] = useState(0);

  // Sync hash with view
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      const valid = ['dashboard', 'submit', 'track', 'requests', 'admin'];
      if (valid.includes(hash)) {
        if (hash === 'admin' && !isAdmin) {
          setCurrentView('dashboard');
          window.location.hash = 'dashboard';
          return;
        }
        setCurrentView(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [isAdmin]);

  const navigateTo = (view) => {
    if (view === 'admin' && !isAdmin) {
      addToast('Administrator privileges required', 'warning');
      navigateTo('dashboard');
      return;
    }
    setCurrentView(view);
    window.location.hash = view;
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Inspect request by ID
  const handleInspectRequest = async (id) => {
    try {
      const data = await api.getRequestById(id);
      setInspectRequest(data);
    } catch (err) {
      addToast(err.message || 'Failed to load request details', 'error');
    }
  };

  // Quick track helper
  const handleQuickTrack = (requestId) => {
    setTrackSearchId(requestId);
    navigateTo('track');
  };

  // Save status update
  const handleSaveStatusUpdate = async (id, payload) => {
    try {
      await api.updateRequestStatus(id, payload);
      addToast('Request status updated successfully!', 'success');
      setAdminRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
      throw err;
    }
  };

  // Confirm delete
  const handleConfirmDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await api.deleteRequest(id);
      addToast('Service request deleted successfully!', 'success');
      setDeleteModalRequest(null);
      setAdminRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      addToast(err.message || 'Failed to delete request', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Copy Request ID
  const handleCopyId = () => {
    if (successModalId) {
      navigator.clipboard.writeText(successModalId).then(() => {
        addToast('Request ID copied to clipboard!', 'success');
      }).catch(() => {
        addToast('Failed to copy ID', 'error');
      });
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="status-dot" style={{ width: '16px', height: '16px', margin: '0 auto 1rem auto' }}></div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Connecting to Smart Campus System...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* If user is not authenticated, show Auth Modal */}
      {!user && <AuthModal onToast={addToast} />}

      <div className="app-container">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={navigateTo}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Wrapper */}
        <div className="main-wrapper">
          <Header
            currentView={currentView}
            onNavigate={navigateTo}
            onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />

          <main className="content-body">
            {currentView === 'dashboard' && (
              <DashboardView
                onNavigate={navigateTo}
                onInspectRequest={handleInspectRequest}
                onQuickTrack={handleQuickTrack}
              />
            )}

            {currentView === 'submit' && (
              <SubmitRequestView
                onSuccess={(newId) => setSuccessModalId(newId)}
                onToast={addToast}
              />
            )}

            {currentView === 'track' && (
              <TrackRequestView
                initialRequestId={trackSearchId}
                onToast={addToast}
              />
            )}

            {currentView === 'requests' && (
              <AllRequestsView
                onInspectRequest={handleInspectRequest}
                onQuickTrack={handleQuickTrack}
                onToast={addToast}
              />
            )}

            {currentView === 'admin' && (
              <AdminView
                onInspectRequest={handleInspectRequest}
                onOpenStatusModal={(req) => setStatusModalRequest(req)}
                onOpenDeleteModal={(req) => setDeleteModalRequest(req)}
                onToast={addToast}
                refreshTrigger={adminRefreshTrigger}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      {inspectRequest && (
        <RequestDetailsModal
          request={inspectRequest}
          onClose={() => setInspectRequest(null)}
        />
      )}

      {statusModalRequest && (
        <StatusUpdateModal
          request={statusModalRequest}
          onSave={handleSaveStatusUpdate}
          onClose={() => setStatusModalRequest(null)}
        />
      )}

      {deleteModalRequest && (
        <DeleteConfirmModal
          request={deleteModalRequest}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteModalRequest(null)}
          loading={deleteLoading}
        />
      )}

      {successModalId && (
        <SuccessModal
          requestId={successModalId}
          onCopy={handleCopyId}
          onTrackNow={() => {
            const id = successModalId;
            setSuccessModalId(null);
            handleQuickTrack(id);
          }}
          onClose={() => setSuccessModalId(null)}
        />
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export default App;
