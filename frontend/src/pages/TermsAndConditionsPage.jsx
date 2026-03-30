import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

const TermsAndConditionsPage = () => {
  const [accepted, setAccepted] = useState(() => localStorage.getItem('termsAccepted') === 'true');

  useEffect(() => {
    localStorage.setItem('termsAccepted', accepted ? 'true' : 'false');
  }, [accepted]);

  return (
    <MainLayout>
      <section className="section" style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center' }}>
        <div className="container center">
          <div className="auth-card animate-fade-up" style={{ margin: '0 auto', maxWidth: 600 }}>
            <h2 className="auth-heading">Terms & Conditions</h2>
            <div style={{ textAlign: 'left', margin: '24px 0', fontSize: '1rem', color: '#444' }}>
              <p>Our Terms & Conditions include the following important points:</p>
              <ul style={{ maxHeight: 220, overflowY: 'auto', paddingLeft: 20 }}>
                <li>By using this service, you agree to our terms.</li>
                <li>Do not misuse the platform or attempt unauthorized access.</li>
                <li>Respect the rights and privacy of other users.</li>
                <li>Do not upload harmful or illegal content.</li>
                <li>We may suspend accounts for policy violations.</li>
                <li>We reserve the right to update these terms at any time.</li>
              </ul>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              I have read and accept the Terms & Conditions
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

export default TermsAndConditionsPage;
