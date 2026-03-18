import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../services/authService';
import {
  getAboutSettings,
  getContactSettings,
  getFeatures,
  getHeaderSettings,
  getPricing,
} from '../services/settingsService';

const LandingPage = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [header, setHeader] = useState({
    title: 'Loading...',
    subtitle: '',
    description: '',
    buttonText: 'Discover More',
    buttonLink: '#features',
    showButton: true,
    backgroundImage: '',
  });
  const [about, setAbout] = useState({
    title: 'Our Story',
    description: 'Loading...',
    mission: 'Loading...',
    vision: 'Loading...',
  });
  const [contact, setContact] = useState({
    address: '',
    email: '',
    phone: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
  });
  const [features, setFeatures] = useState([]);
  const [pricing, setPricing] = useState([]);

  const socialLinks = useMemo(() => {
    return [
      contact.facebook && { href: contact.facebook, icon: 'fab fa-facebook-f', label: 'Facebook' },
      contact.twitter && { href: contact.twitter, icon: 'fab fa-twitter', label: 'Twitter' },
      contact.linkedin && { href: contact.linkedin, icon: 'fab fa-linkedin-in', label: 'LinkedIn' },
      contact.instagram && { href: contact.instagram, icon: 'fab fa-instagram', label: 'Instagram' },
    ].filter(Boolean);
  }, [contact]);

  useEffect(() => {
    let active = true;
    const loadSettings = async () => {
      try {
        const [headerRes, aboutRes, contactRes, featuresRes, pricingRes] = await Promise.allSettled([
          getHeaderSettings(),
          getAboutSettings(),
          getContactSettings(),
          getFeatures(),
          getPricing(),
        ]);

        if (!active) return;

        if (headerRes.status === 'fulfilled' && headerRes.value?.success && headerRes.value?.data) {
          setHeader((prev) => ({ ...prev, ...headerRes.value.data }));
        }
        if (aboutRes.status === 'fulfilled' && aboutRes.value?.success && aboutRes.value?.data) {
          setAbout((prev) => ({ ...prev, ...aboutRes.value.data }));
        }
        if (contactRes.status === 'fulfilled' && contactRes.value?.success && contactRes.value?.data) {
          setContact((prev) => ({ ...prev, ...contactRes.value.data }));
        }
        if (featuresRes.status === 'fulfilled' && featuresRes.value?.success && featuresRes.value?.data) {
          setFeatures(featuresRes.value.data);
        }
        if (pricingRes.status === 'fulfilled' && pricingRes.value?.success && pricingRes.value?.data) {
          setPricing(pricingRes.value.data);
        }
      } catch {
        // ignore
      }
    };

    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const data = await loginRequest({ email: loginEmail.trim(), password: loginPassword });
      if (data.success) {
        localStorage.setItem('shnoor_token', data.token);
        localStorage.setItem('shnoor_role', data.user.role);
        localStorage.setItem('shnoor_email', data.user.email);
        localStorage.setItem('shnoor_admin_email', data.user.email);

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
    <div className="site-mode">
      <header className="navbar">
        <div className="nav-container">
          <a href="#home" className="logo">
            shnoor
          </a>
          <nav className="nav-links">
            <a href="#home" className="nav-link active">
              Home
            </a>
            <a href="#about" className="nav-link">
              About Us
            </a>
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#pricing" className="nav-link">
              Pricing
            </a>
            <a href="#contact" className="nav-link">
              Contact
            </a>
          </nav>
          <div className="nav-right">
            <div className="lang-wrap">
              <span>🌐</span>
              <select id="lang" defaultValue="en">
                <option value="en">EN</option>
                <option value="ar">AR</option>
                <option value="fr">FR</option>
                <option value="ur">UR</option>
              </select>
            </div>
            <a href="#register" className="btn btn-outline">
              Register
            </a>
            <a href="#login" className="btn btn-solid">
              Login
            </a>
          </div>
        </div>
      </header>

      <section className="section hero" id="home">
        <div className="container center">
          {header.subtitle && (
            <div className="hero-badge" id="hero-subtitle">
              {header.subtitle}
            </div>
          )}
          <h1 className="hero-title" id="hero-title">
            {header.title || 'Welcome'}
          </h1>
          {header.description && (
            <p className="hero-desc" id="hero-desc">
              {header.description}
            </p>
          )}
          <div className="btn-row" id="hero-btn-row" style={{ display: header.showButton ? 'flex' : 'none' }}>
            <a href={header.buttonLink || '#features'} className="btn btn-solid" id="hero-btn">
              {header.buttonText || 'Discover More'}
            </a>
            <a href="#features" className="btn btn-outline" id="hero-btn-secondary">
              Explore Features
            </a>
          </div>
          <div
            className="hero-visual"
            id="hero-bg-container"
            style={header.backgroundImage ? { backgroundImage: `url('${header.backgroundImage}')` } : undefined}
          />
        </div>
      </section>

      <section className="section" id="about">
        <div className="container center">
          <div className="section-label">About Us</div>
          <h2 className="section-title" id="about-title">
            {about.title || 'Our Story'}
          </h2>
          <p
            className="section-desc"
            id="about-desc"
            style={{ maxWidth: 800, textAlign: 'center', margin: '0 auto', lineHeight: 1.6 }}
          >
            {about.description || 'Learn more about our mission.'}
          </p>
          <div
            className="grid-2"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 40,
              marginTop: 40,
              textAlign: 'left',
              width: '100%',
            }}
          >
            <div className="card" style={{ background: 'var(--bg-light)', border: 'none' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  marginBottom: 12,
                }}
              >
                Our Mission
              </h3>
              <p style={{ color: 'var(--text-light)', lineHeight: 1.6 }} id="about-mission">
                {about.mission || 'We build tools that empower teams.'}
              </p>
            </div>
            <div className="card" style={{ background: 'var(--bg-light)', border: 'none' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  marginBottom: 12,
                }}
              >
                Our Vision
              </h3>
              <p style={{ color: 'var(--text-light)', lineHeight: 1.6 }} id="about-vision">
                {about.vision || 'A future of connected, productive workplaces.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container center">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything you need</h2>
          <p className="section-desc">
            Tools built for modern HR teams to manage their workforce effectively.
          </p>
          <div className="grid-3" id="features-grid">
            {features.length === 0 ? (
              <div className="card">
                <div className="card-icon" style={{ fontSize: '2rem', marginBottom: 12 }}>
                  ✨
                </div>
                <h3 className="card-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>
                  Feature highlights are coming soon
                </h3>
                <p className="card-text" style={{ fontSize: '0.95rem', color: 'var(--text-light)' }}>
                  Add features from the Admin dashboard to populate this section.
                </p>
              </div>
            ) : (
              features.map((feature) => (
                <div key={feature._id || feature.title} className="card">
                  <div className="card-icon" style={{ fontSize: '2rem', marginBottom: 12 }}>
                    {feature.icon || '✨'}
                  </div>
                  <h3 className="card-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>
                    {feature.title}
                  </h3>
                  <p className="card-text" style={{ fontSize: '0.95rem', color: 'var(--text-light)' }}>
                    {feature.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section bg-light" id="pricing">
        <div className="container center">
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Simple, transparent pricing</h2>
          <p className="section-desc">No hidden fees. Choose the plan that works best for your team.</p>
          <div className="grid-3" id="pricing-grid">
            {pricing.length === 0 ? (
              <div className="card">
                <h3 className="pricing-name" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
                  Starter
                </h3>
                <div className="pricing-price" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', margin: '12px 0' }}>
                  $0
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-light)' }}>/mo</span>
                </div>
                <hr className="divider" style={{ margin: '20px 0' }} />
                <ul className="pricing-features" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <li style={{ fontSize: '0.95rem', color: 'var(--text)', display: 'flex', gap: 8 }}>
                    ✅ <span>Basic HR workflows</span>
                  </li>
                </ul>
                <a href="#register" className="btn btn-outline btn-block" style={{ marginTop: 'auto' }}>
                  Choose Plan
                </a>
              </div>
            ) : (
              pricing.map((plan) => (
                <div key={plan._id || plan.planName} className={`card ${plan.isPopular ? 'card-featured' : ''}`}>
                  <h3 className="pricing-name" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
                    {plan.planName}
                  </h3>
                  <div className="pricing-price" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', margin: '12px 0' }}>
                    ${plan.price}
                    <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-light)' }}>/mo</span>
                  </div>
                  <hr className="divider" style={{ margin: '20px 0' }} />
                  <ul className="pricing-features" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {plan.features?.map((feature) => (
                      <li key={`${plan.planName}-${feature}`} style={{ fontSize: '0.95rem', color: 'var(--text)', display: 'flex', gap: 8 }}>
                        ✅ <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#register" className={`btn ${plan.isPopular ? 'btn-solid' : 'btn-outline'} btn-block`} style={{ marginTop: 'auto' }}>
                    Choose Plan
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section" id="contact">
        <div className="container contact-layout">
          <div className="contact-left">
            <div className="section-label">Contact Us</div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 24 }}>
              Get in touch
            </h2>
            <p className="section-desc" style={{ textAlign: 'left', marginBottom: 30, maxWidth: '100%' }}>
              Have questions? Reach out to our team via email or visit us at our office.
            </p>
            <div className="contact-items">
              {contact.address && (
                <div className="contact-row" id="contact-address-row">
                  <div className="contact-icon">📍</div>
                  <div className="contact-text" id="contact-address">
                    {contact.address}
                  </div>
                </div>
              )}
              {contact.email && (
                <div className="contact-row" id="contact-email-row">
                  <div className="contact-icon">✉️</div>
                  <div className="contact-text" id="contact-email">
                    {contact.email}
                  </div>
                </div>
              )}
              {contact.phone && (
                <div className="contact-row" id="contact-phone-row">
                  <div className="contact-icon">📞</div>
                  <div className="contact-text" id="contact-phone">
                    {contact.phone}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="login">
        <div className="container center">
          <div className="auth-card">
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
                <a href="#forgot" className="link-small">
                  Forgot password?
                </a>
              </div>
              <button type="submit" className="btn btn-solid btn-block" id="login-submit" disabled={loginLoading}>
                {loginLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p className="auth-foot-text">
              Do not have an account?{' '}
              <a href="#register" className="link-small">
                Register
              </a>
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner" style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
          <div className="footer-brand" style={{ alignItems: 'center' }}>
            <span className="logo">shnoor</span>
            <div
              className="footer-text"
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-light)',
                marginTop: 10,
              }}
            >
              Empowering Next-Gen Workforce
            </div>
            <div className="social-row" id="footer-social-row" style={{ marginTop: 20, gap: 20 }}>
              {socialLinks.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="social-icon" title={link.label}>
                  <i className={link.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-bar">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
            &copy; 2026 Shnoor International LLC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
