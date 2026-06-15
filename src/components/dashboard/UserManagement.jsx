import { useEffect, useState } from 'react';
import { fetchUsers, createUser, toggleUserActive } from '../../services/api';
import './UserManagement.css';

const ROLES = ['ADMIN', 'FIRE_OFFICER', 'BUILDING_MANAGER', 'VIEWER'];

const ROLE_BADGE = {
  ADMIN: 'role-admin',
  FIRE_OFFICER: 'role-operator',
  BUILDING_MANAGER: 'role-operator',
  VIEWER: 'role-viewer',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'operator',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setIsLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }

  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!form.username.trim()) return setFormError('Username is required.');
    if (!form.email.trim()) return setFormError('Email is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setFormError('Enter a valid email.');
    if (form.password.length < 8) return setFormError('Password must be at least 8 characters.');
    if (form.password !== form.confirmPassword) return setFormError('Passwords do not match.');

    try {
      setSubmitting(true);
      await createUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      setSuccessMsg(`User "${form.username}" created successfully.`);
      setForm({ username: '', email: '', password: '', confirmPassword: '', role: 'operator' });
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(user) {
    try {
      await toggleUserActive(user.id, !user.is_active);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (err) {
      setError(err.message || 'Failed to update user.');
    }
  }

  return (
    <section className="um-section">
      <div className="um-header">
        <div>
          <h3 className="um-title">User Management</h3>
          <p className="um-subtitle">Manage system access and roles</p>
        </div>
        <button
          className="um-add-btn"
          onClick={() => {
            setShowForm((v) => !v);
            setFormError('');
            setSuccessMsg('');
          }}
        >
          {showForm ? (
            <>
              <span>✕</span> Cancel
            </>
          ) : (
            <>
              <span>+</span> Add User
            </>
          )}
        </button>
      </div>

      {successMsg && <div className="um-alert um-alert--success">{successMsg}</div>}
      {error && <div className="um-alert um-alert--error">{error}</div>}

      {showForm && (
        <div className="um-form-card">
          <h4 className="um-form-title">New User</h4>
          <div className="um-form">
            <div className="um-form-row">
              <div className="um-field">
                <label className="um-label">Username</label>
                <input
                  className="um-input"
                  name="username"
                  value={form.username}
                  onChange={handleFormChange}
                  placeholder="e.g. john_doe"
                  autoComplete="off"
                />
              </div>
              <div className="um-field">
                <label className="um-label">Email</label>
                <input
                  className="um-input"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="e.g. john@company.com"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="um-form-row">
              <div className="um-field">
                <label className="um-label">Password</label>
                <input
                  className="um-input"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleFormChange}
                  placeholder="Min. 8 characters"
                />
              </div>
              <div className="um-field">
                <label className="um-label">Confirm Password</label>
                <input
                  className="um-input"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleFormChange}
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <div className="um-form-row um-form-row--footer">
              <div className="um-field um-field--role">
                <label className="um-label">Role</label>
                <select
                  className="um-select"
                  name="role"
                  value={form.role}
                  onChange={handleFormChange}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="um-form-actions">
                {formError && <span className="um-form-error">{formError}</span>}
                <button
                  className="um-submit-btn"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="um-loading">Loading users…</div>
      ) : (
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={!u.is_active ? 'um-row--inactive' : ''}>
                  <td className="um-cell-user">
                    <div className="um-avatar">{u.username.charAt(0).toUpperCase()}</div>
                    <span>{u.username}</span>
                  </td>
                  <td className="um-cell-muted">{u.email}</td>
                  <td>
                    <span className={`um-role-badge ${ROLE_BADGE[u.role] || 'role-viewer'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`um-status-dot ${u.is_active ? 'dot--active' : 'dot--inactive'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="um-cell-muted">
                    {new Date(u.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <button
                      className={`um-toggle-btn ${u.is_active ? 'btn--deactivate' : 'btn--activate'}`}
                      onClick={() => handleToggleActive(u)}
                      title={u.is_active ? 'Deactivate user' : 'Activate user'}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
