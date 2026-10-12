/**
 * Smart Campus Service Management System (SCSMS)
 * Main Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // App State
  const state = {
    currentView: 'dashboard',
    userRole: 'student', // 'student' or 'admin'
    filters: {
      status: 'ALL',
      category: 'ALL',
      search: ''
    },
    adminFilters: {
      status: 'ALL',
      category: 'ALL',
      search: ''
    },
    selectedRequestId: null,
    stats: null,
    requests: []
  };

  // DOM Elements
  const elements = {
    sidebar: document.getElementById('sidebar'),
    menuToggle: document.getElementById('menuToggle'),
    liveClock: document.getElementById('liveClock'),
    viewTitle: document.getElementById('viewTitle'),
    viewSubtitle: document.getElementById('viewSubtitle'),
    navItems: document.querySelectorAll('.nav-item'),
    viewSections: document.querySelectorAll('.view-section'),
    roleButtons: document.querySelectorAll('.role-btn'),

    // Dashboard Stats
    statTotal: document.getElementById('statTotal'),
    statPending: document.getElementById('statPending'),
    statInProgress: document.getElementById('statInProgress'),
    statResolved: document.getElementById('statResolved'),
    categoryStatContainer: document.getElementById('categoryStatContainer'),
    recentRequestsTableBody: document.getElementById('recentRequestsTableBody'),

    // Request Form
    requestForm: document.getElementById('requestForm'),
    descInput: document.getElementById('descriptionInput'),
    descCounter: document.getElementById('descCounter'),
    submitBtn: document.getElementById('submitBtn'),

    // Tracking
    trackForm: document.getElementById('trackForm'),
    trackInput: document.getElementById('trackInput'),
    trackingResultContainer: document.getElementById('trackingResultContainer'),
    stepperProgress: document.getElementById('stepperProgress'),
    stepNodes: document.querySelectorAll('.step-item'),

    // Requests List Table
    requestsTableBody: document.getElementById('requestsTableBody'),
    statusFilterTabs: document.querySelectorAll('.status-tab-btn'),
    categoryFilterSelect: document.getElementById('categoryFilterSelect'),
    searchInput: document.getElementById('searchInput'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),

    // Admin Table
    adminTableBody: document.getElementById('adminTableBody'),
    adminStatusFilter: document.getElementById('adminStatusFilter'),
    adminCategoryFilter: document.getElementById('adminCategoryFilter'),
    adminSearchInput: document.getElementById('adminSearchInput'),

    // Modals
    detailsModal: document.getElementById('detailsModal'),
    detailsModalBody: document.getElementById('detailsModalBody'),
    statusModal: document.getElementById('statusModal'),
    statusModalForm: document.getElementById('statusModalForm'),
    deleteModal: document.getElementById('deleteModal'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    deleteTargetId: document.getElementById('deleteTargetId'),
    successModal: document.getElementById('successModal'),
    successRequestId: document.getElementById('successRequestId'),
    copyIdBtn: document.getElementById('copyIdBtn'),
    trackFromSuccessBtn: document.getElementById('trackFromSuccessBtn'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // Initialize Application
  init();

  function init() {
    setupEventListeners();
    startClock();
    handleHashNavigation();
    loadDashboardStats();
    loadRequests();
  }

  // ================= Event Listeners =================
  function setupEventListeners() {
    // Mobile Sidebar Toggle
    if (elements.menuToggle) {
      elements.menuToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('mobile-open');
      });
    }

    // Close sidebar on clicking outside in mobile view
    document.addEventListener('click', (e) => {
      if (elements.sidebar.classList.contains('mobile-open') &&
          !elements.sidebar.contains(e.target) &&
          !elements.menuToggle.contains(e.target)) {
        elements.sidebar.classList.remove('mobile-open');
      }
    });

    // Navigation Click Handlers
    elements.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        switchView(view);
        if (window.innerWidth <= 900) {
          elements.sidebar.classList.remove('mobile-open');
        }
      });
    });

    // Hash navigation (browser back/forward)
    window.addEventListener('hashchange', handleHashNavigation);

    // Role Switcher Handlers
    elements.roleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-role');
        setUserRole(role);
      });
    });

    // Form Description Character Counter
    if (elements.descInput && elements.descCounter) {
      elements.descInput.addEventListener('input', () => {
        const len = elements.descInput.value.length;
        elements.descCounter.textContent = `${len} / 2000`;
      });
    }

    // Submit Request Form
    if (elements.requestForm) {
      elements.requestForm.addEventListener('submit', handleRequestSubmit);
    }

    // Track Form Submit
    if (elements.trackForm) {
      elements.trackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const reqId = elements.trackInput.value.trim();
        if (reqId) {
          trackRequestById(reqId);
        } else {
          showToast('Please enter a Request ID', 'warning');
        }
      });
    }

    // Status Filter Tabs in All Requests
    elements.statusFilterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.statusFilterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.filters.status = tab.getAttribute('data-status');
        loadRequests();
      });
    });

    // Category Filter in All Requests
    if (elements.categoryFilterSelect) {
      elements.categoryFilterSelect.addEventListener('change', (e) => {
        state.filters.category = e.target.value;
        loadRequests();
      });
    }

    // Search Input in All Requests (debounced)
    if (elements.searchInput) {
      let timeout = null;
      elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          state.filters.search = e.target.value;
          loadRequests();
        }, 350);
      });
    }

    // Reset Filters Button
    if (elements.resetFiltersBtn) {
      elements.resetFiltersBtn.addEventListener('click', () => {
        state.filters.status = 'ALL';
        state.filters.category = 'ALL';
        state.filters.search = '';
        if (elements.searchInput) elements.searchInput.value = '';
        if (elements.categoryFilterSelect) elements.categoryFilterSelect.value = 'ALL';
        elements.statusFilterTabs.forEach(t => {
          if (t.getAttribute('data-status') === 'ALL') t.classList.add('active');
          else t.classList.remove('active');
        });
        loadRequests();
      });
    }

    // Admin Filter Listeners
    if (elements.adminStatusFilter) {
      elements.adminStatusFilter.addEventListener('change', (e) => {
        state.adminFilters.status = e.target.value;
        loadAdminRequests();
      });
    }
    if (elements.adminCategoryFilter) {
      elements.adminCategoryFilter.addEventListener('change', (e) => {
        state.adminFilters.category = e.target.value;
        loadAdminRequests();
      });
    }
    if (elements.adminSearchInput) {
      let adminSearchTimeout = null;
      elements.adminSearchInput.addEventListener('input', (e) => {
        clearTimeout(adminSearchTimeout);
        adminSearchTimeout = setTimeout(() => {
          state.adminFilters.search = e.target.value;
          loadAdminRequests();
        }, 350);
      });
    }

    // Status Modal Form Submission
    if (elements.statusModalForm) {
      elements.statusModalForm.addEventListener('submit', handleStatusUpdateSubmit);
    }

    // Delete Confirmation
    if (elements.confirmDeleteBtn) {
      elements.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    }

    // Success Modal Actions
    if (elements.copyIdBtn) {
      elements.copyIdBtn.addEventListener('click', () => {
        const id = elements.successRequestId.textContent;
        navigator.clipboard.writeText(id).then(() => {
          showToast('Request ID copied to clipboard!', 'success');
        }).catch(() => {
          showToast('Failed to copy ID', 'error');
        });
      });
    }

    if (elements.trackFromSuccessBtn) {
      elements.trackFromSuccessBtn.addEventListener('click', () => {
        const id = elements.successRequestId.textContent;
        closeAllModals();
        switchView('track');
        elements.trackInput.value = id;
        trackRequestById(id);
      });
    }

    // Close Modals on close button or backdrop click
    document.querySelectorAll('.modal-close, [data-modal-close]').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeAllModals();
        }
      });
    });
  }

  // ================= Navigation & View Switching =================
  function handleHashNavigation() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const validViews = ['dashboard', 'submit', 'track', 'requests', 'admin'];
    if (validViews.includes(hash)) {
      switchView(hash, false);
    }
  }

  function switchView(viewName, updateHash = true) {
    state.currentView = viewName;
    if (updateHash) {
      window.location.hash = viewName;
    }

    // Update Nav Links
    elements.navItems.forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update View Sections
    elements.viewSections.forEach(section => {
      if (section.id === `${viewName}View`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    // Update Header Titles
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

    const meta = viewMetadata[viewName] || viewMetadata.dashboard;
    elements.viewTitle.textContent = meta.title;
    elements.viewSubtitle.textContent = meta.subtitle;

    // View-specific data loads
    if (viewName === 'dashboard') {
      loadDashboardStats();
    } else if (viewName === 'requests') {
      loadRequests();
    } else if (viewName === 'admin') {
      loadAdminRequests();
    }
  }

  function setUserRole(role) {
    state.userRole = role;
    elements.roleButtons.forEach(btn => {
      if (btn.getAttribute('data-role') === role) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const adminNavItem = document.querySelector('.nav-item[data-view="admin"]');
    if (role === 'admin') {
      if (adminNavItem) adminNavItem.style.display = 'flex';
      showToast('Switched to Administrator Mode', 'info');
      if (state.currentView === 'admin') {
        loadAdminRequests();
      }
    } else {
      if (adminNavItem) adminNavItem.style.display = 'flex'; // Keep visible or accessible
      showToast('Switched to Student Mode', 'info');
      if (state.currentView === 'admin') {
        switchView('dashboard');
      }
    }
  }

  // ================= Dashboard Logic =================
  async function loadDashboardStats() {
    try {
      const stats = await Api.getDashboardStats();
      state.stats = stats;
      renderDashboardStats(stats);
    } catch (err) {
      showToast('Failed to load dashboard statistics', 'error');
    }
  }

  function renderDashboardStats(stats) {
    if (!stats) return;

    // Numerical Counters
    elements.statTotal.textContent = stats.totalRequests || 0;
    elements.statPending.textContent = stats.pendingRequests || 0;
    elements.statInProgress.textContent = stats.inProgressRequests || 0;
    elements.statResolved.textContent = stats.resolvedRequests || 0;

    // Category Distribution Bars
    if (elements.categoryStatContainer && stats.categoryCounts) {
      const total = stats.totalRequests || 1;
      let html = '';

      const categoryIcons = {
        'Electrical': '⚡',
        'Plumbing': '🔧',
        'Wi-Fi': '📶',
        'Classroom Maintenance': '🏫',
        'Laboratory Equipment': '🔬',
        'Other': '📋'
      };

      for (const [catName, count] of Object.entries(stats.categoryCounts)) {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const icon = categoryIcons[catName] || '🛠️';

        html += `
          <div class="category-stat-item">
            <div class="category-stat-header">
              <span class="category-name">${icon} ${catName}</span>
              <span class="category-count">${count} (${pct}%)</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      }
      elements.categoryStatContainer.innerHTML = html;
    }

    // Recent Requests Table
    if (elements.recentRequestsTableBody) {
      if (!stats.recentRequests || stats.recentRequests.length === 0) {
        elements.recentRequestsTableBody.innerHTML = `
          <tr>
            <td colspan="5" class="empty-state">
              <div class="empty-title">No service requests found</div>
              <div class="empty-desc">Submit your first request using the "New Request" button.</div>
            </td>
          </tr>
        `;
      } else {
        elements.recentRequestsTableBody.innerHTML = stats.recentRequests.map(req => `
          <tr>
            <td>
              <span class="req-id-badge" onclick="window.app.quickTrack('${req.requestId}')">${req.requestId}</span>
            </td>
            <td>
              <div><strong>${escapeHtml(req.studentName)}</strong></div>
              <small class="text-muted">${escapeHtml(req.department)}</small>
            </td>
            <td>
              <span class="badge badge-category">${escapeHtml(req.categoryDisplayName || req.serviceCategory)}</span>
            </td>
            <td>
              ${getStatusBadge(req.status)}
            </td>
            <td>
              <button class="btn btn-outline" style="padding: 0.3rem 0.7rem; font-size: 0.75rem;" onclick="window.app.openDetails(${req.id})">
                Inspect
              </button>
            </td>
          </tr>
        `).join('');
      }
    }
  }

  // ================= Requests Management & Table =================
  async function loadRequests() {
    try {
      const requests = await Api.getRequests(state.filters);
      state.requests = requests;
      renderRequestsTable(requests);
    } catch (err) {
      showToast('Could not load service requests', 'error');
    }
  }

  function renderRequestsTable(requests) {
    if (!elements.requestsTableBody) return;

    if (!requests || requests.length === 0) {
      elements.requestsTableBody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div class="empty-title">No matching requests found</div>
              <div class="empty-desc">Try resetting your filters or submit a new service request.</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    elements.requestsTableBody.innerHTML = requests.map(req => `
      <tr>
        <td>
          <span class="req-id-badge" onclick="window.app.quickTrack('${req.requestId}')">${req.requestId}</span>
        </td>
        <td>
          <div><strong>${escapeHtml(req.studentName)}</strong></div>
          <small class="text-muted">${escapeHtml(req.studentId)} &bull; ${escapeHtml(req.department)}</small>
        </td>
        <td>
          <span class="badge badge-category">${escapeHtml(req.categoryDisplayName || req.serviceCategory)}</span>
        </td>
        <td>
          ${getPriorityBadge(req.priority)}
        </td>
        <td>
          ${getStatusBadge(req.status)}
        </td>
        <td>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${formatDate(req.createdAt)}</span>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-outline" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" onclick="window.app.openDetails(${req.id})" title="View Details">
              View
            </button>
            <button class="btn btn-secondary" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" onclick="window.app.quickTrack('${req.requestId}')" title="Track Live">
              Track
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // ================= Admin Portal Logic =================
  async function loadAdminRequests() {
    try {
      const requests = await Api.getRequests(state.adminFilters);
      renderAdminTable(requests);
    } catch (err) {
      showToast('Could not load administrative requests', 'error');
    }
  }

  function renderAdminTable(requests) {
    if (!elements.adminTableBody) return;

    if (!requests || requests.length === 0) {
      elements.adminTableBody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <div class="empty-title">No requests found</div>
              <div class="empty-desc">There are no requests matching your admin filter criteria.</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    elements.adminTableBody.innerHTML = requests.map(req => `
      <tr>
        <td>
          <span class="req-id-badge" onclick="window.app.quickTrack('${req.requestId}')">${req.requestId}</span>
        </td>
        <td>
          <div><strong>${escapeHtml(req.studentName)}</strong></div>
          <small class="text-muted">${escapeHtml(req.department)} (${escapeHtml(req.studentId)})</small>
        </td>
        <td>
          <span class="badge badge-category">${escapeHtml(req.categoryDisplayName || req.serviceCategory)}</span>
        </td>
        <td>
          ${getPriorityBadge(req.priority)}
        </td>
        <td>
          ${getStatusBadge(req.status)}
        </td>
        <td>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${formatDate(req.createdAt)}</span>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-primary" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" onclick="window.app.openStatusModal(${req.id}, '${req.status}', '${escapeHtml(req.adminNotes || '')}')" title="Update Status">
              Update
            </button>
            <button class="btn btn-icon" onclick="window.app.openDetails(${req.id})" title="Details">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button class="btn btn-icon btn-danger" onclick="window.app.openDeleteModal(${req.id}, '${req.requestId}')" title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // ================= Submit Request Handler =================
  async function handleRequestSubmit(e) {
    e.preventDefault();

    // Reset validations
    document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));

    const studentName = document.getElementById('studentNameInput').value.trim();
    const studentId = document.getElementById('studentIdInput').value.trim();
    const department = document.getElementById('departmentInput').value.trim();
    const serviceCategory = document.getElementById('categoryInput').value;
    const location = document.getElementById('locationInput').value.trim();
    const description = elements.descInput.value.trim();
    const priorityRadio = document.querySelector('input[name="priority"]:checked');
    const priority = priorityRadio ? priorityRadio.value : 'MEDIUM';

    let hasError = false;

    if (!studentName || studentName.length < 2) {
      showFieldError('studentNameInput', 'Please enter a valid student name (minimum 2 characters)');
      hasError = true;
    }
    if (!studentId || studentId.length < 2) {
      showFieldError('studentIdInput', 'Please enter a valid student ID');
      hasError = true;
    }
    if (!department) {
      showFieldError('departmentInput', 'Please select or enter your department');
      hasError = true;
    }
    if (!serviceCategory) {
      showFieldError('categoryInput', 'Please select a service category');
      hasError = true;
    }
    if (!description || description.length < 10) {
      showFieldError('descriptionInput', 'Please describe the problem in detail (minimum 10 characters)');
      hasError = true;
    }

    if (hasError) {
      showToast('Please correct the highlighted form errors', 'warning');
      return;
    }

    const payload = {
      studentName,
      studentId,
      department,
      serviceCategory,
      location,
      description,
      priority
    };

    // Button loading state
    elements.submitBtn.disabled = true;
    elements.submitBtn.textContent = 'Submitting...';

    try {
      const response = await Api.createRequest(payload);
      const created = response.data;

      // Reset form
      elements.requestForm.reset();
      if (elements.descCounter) elements.descCounter.textContent = '0 / 2000';

      // Open Success Modal
      elements.successRequestId.textContent = created.requestId;
      openModal(elements.successModal);

      showToast(`Request ${created.requestId} registered successfully!`, 'success');

      // Refresh Stats & Lists in background
      loadDashboardStats();
    } catch (err) {
      showToast(err.message || 'Failed to submit service request', 'error');
    } finally {
      elements.submitBtn.disabled = false;
      elements.submitBtn.textContent = 'Submit Service Request';
    }
  }

  function showFieldError(inputId, message) {
    const el = document.getElementById(inputId);
    if (el) {
      el.classList.add('is-invalid');
      const errorMsgEl = el.parentElement.querySelector('.error-message');
      if (errorMsgEl) errorMsgEl.textContent = message;
    }
  }

  // ================= Tracking Logic =================
  async function trackRequestById(requestId) {
    try {
      elements.trackingResultContainer.style.display = 'block';
      elements.trackingResultContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div class="status-dot" style="display: inline-block; width: 12px; height: 12px; margin-bottom: 0.5rem;"></div>
          <div>Searching campus database for ${escapeHtml(requestId)}...</div>
        </div>
      `;

      const req = await Api.trackRequest(requestId);
      renderTrackingResult(req);
    } catch (err) {
      elements.trackingResultContainer.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div class="empty-title">Request Not Found</div>
          <div class="empty-desc">${err.message || 'No request matches the specified ID. Please verify your tracking ID and try again.'}</div>
        </div>
      `;
    }
  }

  function renderTrackingResult(req) {
    // Stepper nodes calculation
    let progressPct = 0;
    const step1 = document.getElementById('stepSubmitted');
    const step2 = document.getElementById('stepInProgress');
    const step3 = document.getElementById('stepResolved');

    // Reset steps
    [step1, step2, step3].forEach(s => s && s.classList.remove('active', 'completed'));

    if (req.status === 'PENDING') {
      progressPct = 0;
      step1.classList.add('active');
    } else if (req.status === 'IN_PROGRESS') {
      progressPct = 50;
      step1.classList.add('completed');
      step2.classList.add('active');
    } else if (req.status === 'RESOLVED') {
      progressPct = 100;
      step1.classList.add('completed');
      step2.classList.add('completed');
      step3.classList.add('completed');
    }

    elements.stepperProgress.style.width = `${progressPct}%`;

    elements.trackingResultContainer.innerHTML = `
      <div class="card" style="margin-top: 1.5rem;">
        <div class="card-header">
          <div class="card-title">
            <span>Tracking:</span>
            <span class="req-id-badge" style="font-size: 1rem;">${req.requestId}</span>
          </div>
          <div class="card-actions">
            ${getStatusBadge(req.status)}
            ${getPriorityBadge(req.priority)}
          </div>
        </div>
        <div class="card-body">
          <div class="tracking-details-card">
            <div class="detail-item">
              <span class="detail-label">Student Name</span>
              <span class="detail-value">${escapeHtml(req.studentName)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Student ID</span>
              <span class="detail-value">${escapeHtml(req.studentId)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Department</span>
              <span class="detail-value">${escapeHtml(req.department)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Service Category</span>
              <span class="detail-value">${escapeHtml(req.categoryDisplayName || req.serviceCategory)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Location / Room</span>
              <span class="detail-value">${escapeHtml(req.location || 'Not specified')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Submitted On</span>
              <span class="detail-value">${formatDate(req.createdAt)}</span>
            </div>
            <div class="detail-item full-col">
              <span class="detail-label">Issue Description</span>
              <div style="background: #ffffff; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-top: 0.25rem;">
                ${escapeHtml(req.description)}
              </div>
            </div>
            ${req.adminNotes ? `
              <div class="detail-item full-col">
                <span class="detail-label" style="color: var(--secondary);">Administrator / Technician Notes</span>
                <div style="background: var(--secondary-light); padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid #c7d2fe; margin-top: 0.25rem; color: #312e81;">
                  ${escapeHtml(req.adminNotes)}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // ================= Status Modal Logic =================
  async function handleStatusUpdateSubmit(e) {
    e.preventDefault();
    const id = state.selectedRequestId;
    const selectedStatusRadio = document.querySelector('input[name="modalStatus"]:checked');
    const adminNotes = document.getElementById('modalAdminNotes').value.trim();

    if (!selectedStatusRadio) {
      showToast('Please select a status', 'warning');
      return;
    }

    const newStatus = selectedStatusRadio.value;

    try {
      await Api.updateRequestStatus(id, newStatus, adminNotes);
      showToast('Request status updated successfully!', 'success');
      closeAllModals();

      // Refresh all views
      loadDashboardStats();
      loadRequests();
      loadAdminRequests();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  }

  // ================= Delete Modal Logic =================
  async function handleConfirmDelete() {
    const id = state.selectedRequestId;
    if (!id) return;

    try {
      await Api.deleteRequest(id);
      showToast('Service request deleted successfully', 'success');
      closeAllModals();

      // Refresh views
      loadDashboardStats();
      loadRequests();
      loadAdminRequests();
    } catch (err) {
      showToast(err.message || 'Failed to delete service request', 'error');
    }
  }

  // ================= Modal Helpers =================
  function openModal(modalEl) {
    if (modalEl) {
      modalEl.classList.add('show');
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('show');
    });
  }

  // ================= Utilities & Formatters =================
  function startClock() {
    function updateClock() {
      if (elements.liveClock) {
        const now = new Date();
        const options = {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        };
        elements.liveClock.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>${now.toLocaleString('en-US', options)}</span>
        `;
      }
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  function showToast(message, type = 'info', duration = 4000) {
    if (!elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`,
      error: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ef4444"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f59e0b"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
      info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#3b82f6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
    };

    toast.innerHTML = `
      ${icons[type] || icons.info}
      <div class="toast-message">${escapeHtml(message)}</div>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function getStatusBadge(status) {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING') return `<span class="badge badge-pending">&bull; Pending</span>`;
    if (s === 'IN_PROGRESS') return `<span class="badge badge-inprogress">&bull; In Progress</span>`;
    if (s === 'RESOLVED') return `<span class="badge badge-resolved">&bull; Resolved</span>`;
    return `<span class="badge">${escapeHtml(status)}</span>`;
  }

  function getPriorityBadge(priority) {
    const p = (priority || '').toUpperCase();
    if (p === 'URGENT') return `<span class="badge badge-priority-urgent">🔥 Urgent</span>`;
    if (p === 'HIGH') return `<span class="badge badge-priority-high">High</span>`;
    if (p === 'MEDIUM') return `<span class="badge badge-priority-medium">Medium</span>`;
    return `<span class="badge badge-priority-low">Low</span>`;
  }

  function formatDate(isoStr) {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ================= Public Application API for HTML Callbacks =================
  window.app = {
    quickTrack(requestId) {
      switchView('track');
      elements.trackInput.value = requestId;
      trackRequestById(requestId);
    },

    async openDetails(id) {
      try {
        const req = await Api.getRequestById(id);
        elements.detailsModalBody.innerHTML = `
          <div class="tracking-details-card">
            <div class="detail-item">
              <span class="detail-label">Request ID</span>
              <span class="detail-value req-id-badge" style="font-size: 1rem;">${req.requestId}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Current Status</span>
              <div>${getStatusBadge(req.status)}</div>
            </div>
            <div class="detail-item">
              <span class="detail-label">Priority Level</span>
              <div>${getPriorityBadge(req.priority)}</div>
            </div>
            <div class="detail-item">
              <span class="detail-label">Student Name</span>
              <span class="detail-value">${escapeHtml(req.studentName)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Student ID</span>
              <span class="detail-value">${escapeHtml(req.studentId)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Department</span>
              <span class="detail-value">${escapeHtml(req.department)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Service Category</span>
              <span class="detail-value">${escapeHtml(req.categoryDisplayName || req.serviceCategory)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Location / Room</span>
              <span class="detail-value">${escapeHtml(req.location || 'Not specified')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Submitted On</span>
              <span class="detail-value">${formatDate(req.createdAt)}</span>
            </div>
            <div class="detail-item full-col">
              <span class="detail-label">Detailed Description</span>
              <div style="background: #ffffff; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-top: 0.25rem;">
                ${escapeHtml(req.description)}
              </div>
            </div>
            <div class="detail-item full-col">
              <span class="detail-label">Admin / Technician Remarks</span>
              <div style="background: var(--bg-card); padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-top: 0.25rem;">
                ${req.adminNotes ? escapeHtml(req.adminNotes) : '<em>No administrator remarks recorded yet.</em>'}
              </div>
            </div>
          </div>
        `;
        openModal(elements.detailsModal);
      } catch (err) {
        showToast('Failed to load request details', 'error');
      }
    },

    openStatusModal(id, currentStatus, currentNotes) {
      state.selectedRequestId = id;
      const radio = document.querySelector(`input[name="modalStatus"][value="${currentStatus}"]`);
      if (radio) radio.checked = true;
      document.getElementById('modalAdminNotes').value = currentNotes || '';
      openModal(elements.statusModal);
    },

    openDeleteModal(id, requestId) {
      state.selectedRequestId = id;
      elements.deleteTargetId.textContent = requestId;
      openModal(elements.deleteModal);
    }
  };
});
