import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { registerPublic } from '../services/authService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Employee'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setRegisterError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (formData.password !== formData.confirmPassword) {
      setRegisterError('Passwords do not match.');
      return;
    }

    setRegisterLoading(true);
    try {
      const data = await registerPublic({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      if (data.success) {
        navigate('/login');
      } else {
        setRegisterError(data.error || data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      const message = err?.response?.data?.error || 'Network error. Please try again.';
      setRegisterError(message);
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="section" id="register" style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center' }}>
        <div className="container center">
          <div className="auth-card animate-fade-up" style={{ margin: '0 auto' }}>
            <div className="auth-logo-wrap">
              <span className="auth-brand">shnoor</span>
            </div>
            <h2 className="auth-heading">Create an account</h2>
            <p className="auth-sub-text">Join us today to manage your workforce</p>
            {registerError && (
              <div className="login-error" style={{ display: 'block' }}>
                {registerError}
              </div>
            )}
            <form id="register-form" onSubmit={handleRegister} noValidate>
              <div className="form-group">
                <label htmlFor="register-name">Full Name</label>
                <input
                  type="text"
                  id="register-name"
                  name="name"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="register-email">Email</label>
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="register-password">Password</label>
                  <input
                    type="password"
                    id="register-password"
                    name="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="register-confirm">Confirm Password</label>
                  <input
                    type="password"
                    id="register-confirm"
                    name="confirmPassword"
                    placeholder="••••••••"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="register-role">Register As</label>
                <select 
                  id="register-role" 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.95rem' }}
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <button type="submit" className="btn btn-solid btn-block" id="register-submit" disabled={registerLoading}>
                {registerLoading ? 'Creating Account...' : 'Register'}
              </button>
            </form>
            <p className="auth-foot-text">
              Already have an account?{' '}
              <Link to="/login" className="link-small">
                Login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default RegisterPage;
