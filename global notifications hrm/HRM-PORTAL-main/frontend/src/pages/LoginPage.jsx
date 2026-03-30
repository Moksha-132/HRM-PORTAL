import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { login as loginRequest } from '../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState(() => new URLSearchParams(window.location.search).get('email') || '');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const data = await loginRequest({ email: loginEmail.trim(), password: loginPassword });
      if (data.success) {
        sessionStorage.setItem('shnoor_token', data.token);
        sessionStorage.setItem('shnoor_role', data.user.role);
        sessionStorage.setItem('shnoor_email', data.user.email);

        localStorage.setItem('shnoor_token', data.token);
        localStorage.setItem('shnoor_role', data.user.role);
        localStorage.setItem('shnoor_email', data.user.email);
        localStorage.setItem('hrm_last_email', data.user.email);

        if (data.user.role === 'Admin' || data.user.role === 'Super Admin') {
          sessionStorage.setItem('shnoor_admin_email', data.user.email);
          localStorage.setItem('shnoor_admin_email', data.user.email);
        } else {
          sessionStorage.removeItem('shnoor_admin_email');
          localStorage.removeItem('shnoor_admin_email');
        }

        try {
          if (window.globalNotificationClient) {
            window.globalNotificationClient.disconnect();
            window.globalNotificationClient.connect();
          }
        } catch {
          // ignore
        }

        if (data.user.role === 'Manager') {
          navigate('/manager');
        } else if (data.user.role === 'Employee') {
          navigate('/employee');
        } else {
          navigate('/admin');
        }
      } else {
        setLoginError(data.error || 'Invalid email or password.');
      }
    } catch (err) {
      const message = err?.response?.data?.error || 'Network error. Please try again.';
      setLoginError(message);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="login-card-modern">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span className="auth-brand">shnoor</span>
          </div>
          
          <h2 className="auth-heading">Welcome back</h2>
          <p className="auth-sub-text">Please enter your details to sign in.</p>
          
          {loginError && (
            <div className="login-error" style={{ marginBottom: '24px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                type="email"
                id="login-email"
                placeholder="name@company.com"
                required
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  setLoginError('');
                }}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                placeholder="••••••••"
                required
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  setLoginError('');
                }}
              />
            </div>

            <div className="auth-row">
              <label className="checkbox-label">
                <input type="checkbox" id="remember-me" /> Remember for 30 days
              </label>
              <Link to="/forgot" className="link-small">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn btn-solid btn-block" disabled={loginLoading}>
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-foot-text" style={{ marginTop: '32px' }}>
            Don't have an account? {' '}
            <Link to="/register" className="link-small">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
