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
  const [policyAccepted, setPolicyAccepted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setRegisterError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!policyAccepted) {
      setRegisterError('You must accept the Privacy Policy and Terms & Conditions to register.');
      return;
    }

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
          <div className="auth-card animate-fade-up" style={{ margin: '0 auto', maxWidth: 420, padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <div className="auth-logo-wrap" style={{ marginBottom: 18 }}>
              <span className="auth-brand" style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: 1 }}>shnoor</span>
            </div>
            <h2 className="auth-heading">Create an account</h2>
            <p className="auth-sub-text">Join us today to manage your workforce</p>
            {registerError && (
              <div className="login-error" style={{ display: 'block' }}>
                {registerError}
              </div>
            )}
            <form id="register-form" onSubmit={handleRegister} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="register-name" style={{ marginBottom: 6, fontWeight: 500 }}>Full Name</label>
                <input
                  type="text"
                  id="register-name"
                  name="name"
                  placeholder="Full Name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: '1rem', marginBottom: 0 }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="register-email" style={{ marginBottom: 6, fontWeight: 500 }}>Email</label>
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  placeholder="Email address"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: '1rem', marginBottom: 0 }}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', gap: 10, marginBottom: 0 }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="register-password" style={{ marginBottom: 6, fontWeight: 500 }}>Password</label>
                  <input
                    type="password"
                    id="register-password"
                    name="password"
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: '1rem', marginBottom: 0 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="register-confirm" style={{ marginBottom: 6, fontWeight: 500 }}>Confirm Password</label>
                  <input
                    type="password"
                    id="register-confirm"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: '1rem', marginBottom: 0 }}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="register-role" style={{ marginBottom: 6, fontWeight: 500 }}>Register As</label>
                <select 
                  id="register-role" 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: '1rem' }}
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div style={{ margin: '10px 0 8px', fontSize: '0.95rem', color: '#666', textAlign: 'left' }}>
                By registering, you agree to our
                <span style={{ margin: '0 4px', textDecoration: 'underline', cursor: 'pointer', color: '#3b82f6' }}>
                  <Link to="/privacy-policy" style={{ color: '#3b82f6' }}> Privacy Policy </Link>
                </span>
                and
                <span style={{ margin: '0 4px', textDecoration: 'underline', cursor: 'pointer', color: '#3b82f6' }}>
                  <Link to="/terms-and-conditions" style={{ color: '#3b82f6' }}> Terms & Conditions </Link>
                </span>
                .
              </div>
              <div style={{ marginBottom: 16, marginTop: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.95rem' }}>
                  <input
                    type="checkbox"
                    checked={policyAccepted}
                    onChange={(e) => setPolicyAccepted(e.target.checked)}
                    style={{ marginRight: 8 }}
                  />
                  I accept the Privacy Policy and Terms & Conditions
                </label>
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
