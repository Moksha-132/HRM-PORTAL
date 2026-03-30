import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

const PrivacyPolicyPage = () => {
  const [accepted, setAccepted] = useState(() => localStorage.getItem('privacyAccepted') === 'true');

  useEffect(() => {
    localStorage.setItem('privacyAccepted', accepted ? 'true' : 'false');
  }, [accepted]);

  return (
    <MainLayout>
      <section className="section" style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center' }}>
        <div className="container center">
          <div className="auth-card animate-fade-up" style={{ margin: '0 auto', maxWidth: 600 }}>
            <h2 className="auth-heading">Privacy Policy</h2>
            <div style={{ textAlign: 'left', margin: '24px 0', fontSize: '1rem', color: '#444' }}>
              <p>Our Privacy Policy covers the following important points:</p>
              <ul style={{ maxHeight: 220, overflowY: 'auto', paddingLeft: 20 }}>
                <li>We respect your privacy and protect your data.</li>
                <li>Your information will not be shared with third parties without consent.</li>
                <li>We use cookies to enhance your experience.</li>
                <li>We collect data to improve our services.</li>
                <li>We comply with all applicable data protection laws.</li>
                <li>We may update this policy from time to time.</li>
              </ul>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              I have read and accept the Privacy Policy
            </label>
            <div style={{ marginTop: 16 }}>
              <Link to="/login" className="btn btn-outline">Back to Login</Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default PrivacyPolicyPage;
