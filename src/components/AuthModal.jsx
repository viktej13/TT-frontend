import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function AuthModal({ onToast }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'error' | 'success', message: '' }

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!loginEmail.trim() || !loginPassword) {
      setAlert({ type: 'error', message: 'Please enter both email and password' });
      return;
    }

    setLoading(true);
    try {
      const user = await login(loginEmail.trim(), loginPassword);
      if (onToast) onToast(`Welcome back, ${user.fullName || user.email}!`, 'success');
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Invalid email or password' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!regFullName.trim() || !regStudentId.trim() || !regDepartment.trim() || !regEmail.trim() || !regPassword) {
      setAlert({ type: 'error', message: 'Please fill in all registration fields' });
      return;
    }

    if (regPassword.length < 6) {
      setAlert({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: regFullName.trim(),
        studentId: regStudentId.trim(),
        department: regDepartment.trim(),
        email: regEmail.trim(),
        password: regPassword,
        confirmPassword: regConfirmPassword
      });

      setAlert({
        type: 'success',
        message: 'Account registered successfully! Please sign in with your password.'
      });
      setLoginEmail(regEmail.trim());
      setLoginPassword('');
      setTab('login');
      if (onToast) onToast('Student account registered! Please sign in.', 'success');
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" id="authOverlay">
      <div className="auth-card">
        <div className="auth-header-hero">
          <div className="auth-logo-circle">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
          </div>
          <h1>Smart Campus</h1>
          <p>Service Management & Facility Support</p>
        </div>

        <div className="auth-nav-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setAlert(null); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setAlert(null); }}
          >
            Student Register
          </button>
        </div>

        <div className="auth-body">
          {alert && (
            <div className={`auth-alert auth-alert-${alert.type} show`}>
              {alert.message}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} autoComplete="on">
              <div className="form-group">
                <label className="form-label" htmlFor="loginEmail">Email Address</label>
                <input
                  type="email"
                  id="loginEmail"
                  className="form-control"
                  placeholder="student@campus.edu or admin@campus.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="loginPassword">Password</label>
                <input
                  type="password"
                  id="loginPassword"
                  className="form-control"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center' }}
                disabled={loading}
              >
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} autoComplete="on">
              <div className="form-group">
                <label className="form-label" htmlFor="regFullName">Full Name</label>
                <input
                  type="text"
                  id="regFullName"
                  className="form-control"
                  placeholder="e.g. Alex Morgan"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="regStudentId">Student ID</label>
                  <input
                    type="text"
                    id="regStudentId"
                    className="form-control"
                    placeholder="e.g. STU-1001"
                    value={regStudentId}
                    onChange={(e) => setRegStudentId(e.target.value)}
                    required
                    maxLength={50}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="regDepartment">Department</label>
                  <input
                    type="text"
                    id="regDepartment"
                    className="form-control"
                    placeholder="e.g. CSE"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    required
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label" htmlFor="regEmail">Campus Email</label>
                <input
                  type="email"
                  id="regEmail"
                  className="form-control"
                  placeholder="student@campus.edu"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="regPassword">Password</label>
                  <input
                    type="password"
                    id="regPassword"
                    className="form-control"
                    placeholder="Min 6 chars"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="regConfirmPassword">Confirm</label>
                  <input
                    type="password"
                    id="regConfirmPassword"
                    className="form-control"
                    placeholder="Re-enter"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center', background: '#0f766e' }}
                disabled={loading}
              >
                <span>{loading ? 'Creating Account...' : 'Create Student Account'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
