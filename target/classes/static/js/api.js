/**
 * Smart Campus Service Management System (SCSMS)
 * Frontend API Service Layer with Session & CSRF Handling
 */

const Api = (function () {
  const BASE_URL = '/api';

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
  }

  async function request(endpoint, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const method = (options.method || 'GET').toUpperCase();
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      const xsrf = getCookie('XSRF-TOKEN');
      if (xsrf) {
        defaultHeaders['X-XSRF-TOKEN'] = xsrf;
      }
    }

    const config = {
      credentials: 'same-origin',
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      let data = null;
      try {
        data = await response.json();
      } catch (e) {
        // Response may be empty (e.g. 204 or logout)
      }

      if (!response.ok) {
        let errorMsg = 'An unexpected error occurred';
        if (data) {
          if (data.message) errorMsg = data.message;
          else if (data.validationErrors) errorMsg = Object.values(data.validationErrors).join(', ');
          else if (data.error) errorMsg = data.error;
        } else if (response.status === 401) {
          errorMsg = 'Session expired or not authenticated. Please log in.';
        } else if (response.status === 403) {
          errorMsg = 'Access denied. You do not have permission for this action.';
        }

        const error = new Error(errorMsg);
        error.status = response.status;
        error.response = data;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`API Error on [${method}] ${endpoint}:`, err);
      throw err;
    }
  }

  return {
    /**
     * Initialize CSRF cookie from backend
     */
    async initCsrf() {
      try {
        await request('/auth/csrf');
      } catch (e) {
        // Non-blocking
      }
    },

    /**
     * Authenticate user with email and password
     */
    async login(email, password) {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      return res.data;
    },

    /**
     * Register a new student account
     */
    async register(data) {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return res.data;
    },

    /**
     * Get currently authenticated user profile
     */
    async getCurrentUser() {
      try {
        const res = await request('/auth/me');
        return res ? res.data : null;
      } catch (err) {
        if (err.status === 401) {
          return null;
        }
        throw err;
      }
    },

    /**
     * Logout and destroy session
     */
    async logout() {
      return await request('/auth/logout', {
        method: 'POST'
      });
    },

    /**
     * Get dashboard summary statistics
     */
    async getDashboardStats() {
      const res = await request('/requests/stats');
      return res.data;
    },

    /**
     * Fetch requests with optional filtering
     */
    async getRequests(params = {}) {
      const query = new URLSearchParams();
      if (params.status && params.status !== 'ALL') query.append('status', params.status);
      if (params.category && params.category !== 'ALL') query.append('category', params.category);
      if (params.search && params.search.trim()) query.append('search', params.search.trim());

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await request(`/requests${qs}`);
      return res.data || [];
    },

    /**
     * Get single request by database ID
     */
    async getRequestById(id) {
      const res = await request(`/requests/${id}`);
      return res.data;
    },

    /**
     * Track request by human-readable Request ID
     */
    async trackRequest(requestId) {
      const res = await request(`/requests/track/${encodeURIComponent(requestId.trim())}`);
      return res.data;
    },

    /**
     * Submit a new service request
     */
    async createRequest(payload) {
      const res = await request('/requests', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return res;
    },

    /**
     * Update request status & admin notes (Admin only)
     */
    async updateRequestStatus(id, status, adminNotes = '') {
      const res = await request(`/requests/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminNotes })
      });
      return res.data;
    },

    /**
     * Delete request by ID (Admin only)
     */
    async deleteRequest(id) {
      const res = await request(`/requests/${id}`, {
        method: 'DELETE'
      });
      return res;
    }
  };
})();

// Export globally
window.Api = Api;
