import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerPublic } from '../services/authService';

const AdminRegistration = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Admin' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await registerPublic(form);
      if (res.success) {
        setMessage('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Admin Registration</h2>
        <p className="auth-sub">Create your administrator account</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              className="input" 
              value={form.name} 
              onChange={(e) => setForm({...form, name: e.target.value})} 
              required 
              placeholder="Enter your full name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              className="input" 
              type="email" 
              value={form.email} 
              onChange={(e) => setForm({...form, email: e.target.value})} 
              required 
              placeholder="e.g. admin@company.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              className="input" 
              type="password" 
              value={form.password} 
              onChange={(e) => setForm({...form, password: e.target.value})} 
              required 
              placeholder="Min. 6 characters"
            />
          </div>
          
          {message && (
            <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '15px' }}>
              {message}
            </div>
          )}

          <button type="submit" className="btn btn-solid w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register as Admin'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRegistration;
