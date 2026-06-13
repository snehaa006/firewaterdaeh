import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-mark" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C9 6 6 9.5 6 13a6 6 0 0012 0c0-3.5-3-7-6-11z"
                stroke="var(--color-accent-deep)"
                strokeWidth="1.6"
                fill="var(--color-fire-bg)"
              />
            </svg>
          </div>
          <div>
            <h1>Fire &amp; Water Safety</h1>
            <p>Building Monitoring Dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="field">
            <span className="field-label">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. John"
              autoComplete="username"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <div className="login-error" role="alert">{error}</div>}

          <button type="submit" className="login-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="login-footer">
          <p>Access is provisioned by your system administrator.</p>
          <p className="login-hint">
            Demo credentials: <code>John</code> / <code>fire@123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
