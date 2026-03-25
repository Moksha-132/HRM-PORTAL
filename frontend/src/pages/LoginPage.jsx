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
      <section className="section" id="login" style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center' }}>
        <div className="container center">
          <div className="auth-card animate-fade-up" style={{ margin: '0 auto' }}>
            <div className="auth-logo-wrap">
              <span className="auth-brand">shnoor</span>
            </div>
            <h2 className="auth-heading">Welcome back</h2>
            <p className="auth-sub-text">Sign in to your account</p>
            {loginError && (
              <div className="login-error" style={{ display: 'block' }}>
                {loginError}
              </div>
            )}
            <form id="login-form" onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
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
                  name="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError('');
                  }}
                />
              </div>
              <div className="auth-row" style={{ marginBottom: 20 }}>
                <label className="checkbox-label">
                  <input type="checkbox" id="remember-me" /> Remember me
                </label>
                <Link to="/forgot" className="link-small">
                  Forgot password?
                </Link>
              </div>
              <button type="submit" className="btn btn-solid btn-block" id="login-submit" disabled={loginLoading}>
                {loginLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p className="auth-foot-text">
              Do not have an account?{' '}
              <Link to="/register" className="link-small">
                Register
              </Link>
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LoginPage;
