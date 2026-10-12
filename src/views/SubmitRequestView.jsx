import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function SubmitRequestView({ onSuccess, onToast }) {
  const { user } = useAuth();

  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      if (user.fullName) setStudentName(user.fullName);
      if (user.studentId) setStudentId(user.studentId);
      if (user.department) setDepartment(user.department);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!studentName.trim() || studentName.trim().length < 2) {
      newErrors.studentName = 'Please enter a valid student name (minimum 2 characters)';
    }
    if (!studentId.trim() || studentId.trim().length < 2) {
      newErrors.studentId = 'Please enter a valid student ID';
    }
    if (!department) {
      newErrors.department = 'Please select or enter your department';
    }
    if (!serviceCategory) {
      newErrors.serviceCategory = 'Please select a service category';
    }
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = 'Please describe the problem in detail (minimum 10 characters)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (onToast) onToast('Please correct the highlighted form errors', 'warning');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await api.createRequest({
        studentName: studentName.trim(),
        studentId: studentId.trim(),
        department: department.trim(),
        serviceCategory,
        location: location.trim(),
        priority,
        description: description.trim()
      });

      const created = response.data;
      if (onToast) onToast(`Request ${created.requestId} registered successfully!`, 'success');

      // Clear description & location while preserving student info
      setDescription('');
      setLocation('');
      setServiceCategory('');
      setPriority('MEDIUM');

      if (onSuccess) onSuccess(created.requestId);
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to submit service request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="view-section active">
      <div className="card" style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div className="card-header">
          <h2 className="card-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Submit Campus Service Ticket</span>
          </h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              {/* Student Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="studentNameInput">
                  Student Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="studentNameInput"
                  className={`form-control ${errors.studentName ? 'is-invalid' : ''}`}
                  placeholder="e.g. Alex Morgan"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
                {errors.studentName && <div className="error-message" style={{ display: 'block' }}>{errors.studentName}</div>}
              </div>

              {/* Student ID */}
              <div className="form-group">
                <label className="form-label" htmlFor="studentIdInput">
                  Student ID / Roll No <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="studentIdInput"
                  className={`form-control ${errors.studentId ? 'is-invalid' : ''}`}
                  placeholder="e.g. STU-2024-1049"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
                {errors.studentId && <div className="error-message" style={{ display: 'block' }}>{errors.studentId}</div>}
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="form-label" htmlFor="departmentInput">
                  Academic Department <span className="required">*</span>
                </label>
                <select
                  id="departmentInput"
                  className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Select your department</option>
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Biotechnology">Biotechnology</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Architecture & Planning">Architecture & Planning</option>
                  <option value="Other">Other Department</option>
                </select>
                {errors.department && <div className="error-message" style={{ display: 'block' }}>{errors.department}</div>}
              </div>

              {/* Service Category */}
              <div className="form-group">
                <label className="form-label" htmlFor="categoryInput">
                  Service Category <span className="required">*</span>
                </label>
                <select
                  id="categoryInput"
                  className={`form-control ${errors.serviceCategory ? 'is-invalid' : ''}`}
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  required
                >
                  <option value="">Select service category</option>
                  <option value="Electrical">Electrical (Power, Lights, Switchboards)</option>
                  <option value="Plumbing">Plumbing (Pipes, Taps, Restrooms)</option>
                  <option value="Wi-Fi">Wi-Fi & Campus Network</option>
                  <option value="Classroom Maintenance">Classroom Maintenance (Benches, Projector, AC)</option>
                  <option value="Laboratory Equipment">Laboratory Equipment (Machines, Devices)</option>
                  <option value="Other">Other Maintenance</option>
                </select>
                {errors.serviceCategory && <div className="error-message" style={{ display: 'block' }}>{errors.serviceCategory}</div>}
              </div>

              {/* Campus Location */}
              <div className="form-group full-width">
                <label className="form-label" htmlFor="locationInput">
                  Campus Location / Room / Building
                </label>
                <input
                  type="text"
                  id="locationInput"
                  className="form-control"
                  placeholder="e.g. Engineering Block B, Room 302 or Hostel Wing C, Room 104"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Priority Level */}
              <div className="form-group full-width">
                <label className="form-label">
                  Urgency / Priority Level <span className="required">*</span>
                </label>
                <div className="priority-selector">
                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
                    <label key={p} className={`priority-option ${priority === p ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={priority === p}
                        onChange={() => setPriority(p)}
                      />
                      <span className="priority-label">
                        {p === 'LOW' && 'Low'}
                        {p === 'MEDIUM' && 'Medium'}
                        {p === 'HIGH' && 'High'}
                        {p === 'URGENT' && 'Urgent'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Problem Description */}
              <div className="form-group full-width">
                <label className="form-label" htmlFor="descriptionInput">
                  Detailed Description of Problem <span className="required">*</span>
                </label>
                <textarea
                  id="descriptionInput"
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  rows="4"
                  placeholder="Provide precise details: equipment model, exact room, symptoms, error codes, and when the issue started..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                  required
                ></textarea>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  {errors.description ? (
                    <div className="error-message" style={{ display: 'block' }}>{errors.description}</div>
                  ) : <div></div>}
                  <small className="text-muted" style={{ marginLeft: 'auto' }}>
                    {description.length} / 2000
                  </small>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                <span>{loading ? 'Submitting...' : 'Submit Service Request'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
