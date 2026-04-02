import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

const RegisterPage = () => {
  return (
    <MainLayout>
      <section className="section" style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', background: 'var(--site-background)' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="center" style={{ marginBottom: '40px' }}>
            <h2 className="auth-heading" style={{ fontSize: '2.5rem' }}>Join the Platform</h2>
            <p className="auth-sub-text" style={{ fontSize: '1.1rem' }}>Choose your account type to get started</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* Admin Option */}
            <div className="auth-card" style={{ padding: '40px 30px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', background: 'var(--card-bg)' }}>
              <div style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '20px' }}>
                <i className="fas fa-user-shield"></i>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>Platform Admin</h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '30px', minHeight: '60px' }}>
                Full control over the system, roles, and company settings.
              </p>
              <Link to="/register/admin" className="btn btn-solid w-full" style={{ display: 'block', textDecoration: 'none' }}>
                Register as Admin
              </Link>
            </div>

            {/* Manager Option */}
            <div className="auth-card" style={{ padding: '40px 30px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', borderTop: '4px solid var(--primary)' }}>
              <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                 <span style={{ background: 'var(--primary)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>FREE TRIAL</span>
              </div>
              <div style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '20px' }}>
                <i className="fas fa-users-cog"></i>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>Team Manager</h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '30px', minHeight: '60px' }}>
                Manage departments, employees, and team performance with a free trial.
              </p>
              <Link to="/register/manager" className="btn btn-solid w-full" style={{ display: 'block', textDecoration: 'none', backgroundColor: 'var(--primary)' }}>
                Start Free Trial
              </Link>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
             <p className="auth-foot-text">
               Already part of our portal? <Link to="/login" className="link-small">Login to your account</Link>
             </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default RegisterPage;
