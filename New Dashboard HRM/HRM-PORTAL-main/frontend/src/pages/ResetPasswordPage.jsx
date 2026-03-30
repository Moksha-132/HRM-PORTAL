import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import api from '../services/api';
import { useSiteLogo } from '../hooks/useSiteLogo';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const search = useLocation().search;
  const urlParams = new URL(window.location.href);
  const tokenFromUrl = window.location.pathname.split('/').pop(); // /reset-password/TOKEN
  // Alternative: support ?token=TOKEN
  const queryToken = new URLSearchParams(search).get('token');
  const role = new URLSearchParams(search).get('role');
  
  const token = queryToken || tokenFromUrl;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const logoUrl = useSiteLogo();

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.put(`/api/v1/auth/resetpassword/${token}${role ? '?role=employee' : ''}`, {
        password
      });

      if (data.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.error || 'Password reset failed.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="login-card-modern" style={{ maxWidth: 450 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img src={logoUrl} alt="Company Logo" style={{ height: '56px', objectFit: 'contain' }} />
          </div>
          
          <h2 className="auth-heading">Set New Password</h2>
          <p className="auth-sub-text">Please enter your new password below.</p>
          
          {error && <div className="login-error" style={{ marginBottom: 20 }}>{error}</div>}
          {success && (
            <div style={{ marginBottom: 20, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#166534', padding: '12px', borderRadius: 10, fontSize: '0.9rem' }}>
              {success}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  id="new-password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  id="confirm-password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="form-group mb" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="show-reset-pwd"
                  checked={showPasswords}
                  onChange={(e) => setShowPasswords(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="show-reset-pwd" style={{ margin: 0, fontSize: '0.85rem', cursor: 'pointer', color: '#64748b' }}>
                  Show Passwords
                </label>
              </div>

              <button type="submit" className="btn btn-solid btn-block" disabled={loading || !token}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResetPasswordPage;
