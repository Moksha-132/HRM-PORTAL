import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerPublic } from '../services/authService';

const ManagerRegistration = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Manager' });
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
        setMessage('Manager registration successful! 15-day trial activated. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2500);
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
        <h2 className="auth-title">Manager Registration</h2>
        <p className="auth-sub">Sign up for a 15-day free trial</p>
        
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
              placeholder="e.g. manager@shnoor.com"
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
          
          <div className="trial-info" style={{ 
            padding: '10px 15px', 
            background: '#ebfdf5', 
            border: '1px solid #cef7e2', 
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            color: '#065f46'
          }}>
            <i className="fas fa-gift" style={{ marginRight: '8px' }}></i>
            <strong>15-Day Free Trial:</strong> Once you sign up, you'll have full access to all features for 15 days.
          </div>

          {message && (
            <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '15px' }}>
              {message}
            </div>
          )}

          <button type="submit" className="btn btn-solid w-full" style={{ backgroundColor: '#10b981' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Start 15-Day Trial'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default ManagerRegistration;
