import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import {
  getAboutSettings,
  getFeatures,
  getHeaderSettings,
  getPricing,
} from '../services/settingsService';

const getFeatureIcon = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('directory') || t.includes('employee')) return 'fas fa-users';
  if (t.includes('time') || t.includes('attendance')) return 'fas fa-clock';
  if (t.includes('payroll') || t.includes('salary') || t.includes('finance')) return 'fas fa-money-check-alt';
  if (t.includes('performance') || t.includes('review')) return 'fas fa-chart-line';
  if (t.includes('portal') || t.includes('self')) return 'fas fa-laptop-house';
  if (t.includes('reporting') || t.includes('analytic')) return 'fas fa-chart-pie';
  return 'fas fa-star';
};

const LandingPage = () => {
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
  const [features, setFeatures] = useState([]);
  const [pricing, setPricing] = useState([]);

  useEffect(() => {
    let active = true;
    const loadSettings = async () => {
      try {
        const [headerRes, aboutRes, featuresRes, pricingRes] = await Promise.allSettled([
          getHeaderSettings(),
          getAboutSettings(),
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

  return (
    <MainLayout>
      <section className="section hero" id="home" style={{ paddingBottom: '60px' }}>
        <div className="container center" style={{ marginTop: '40px' }}>
          {header.subtitle && (
            <div className="hero-badge animate-fade-up" id="hero-subtitle">
              {header.subtitle}
            </div>
          )}
          <h1 className="hero-title animate-fade-up delay-100" id="hero-title">
            {header.title || 'Welcome'}
          </h1>
          {header.description && (
            <p className="hero-desc animate-fade-up delay-200" id="hero-desc">
              {header.description}
            </p>
          )}
          <div className="btn-row animate-fade-up delay-300" id="hero-btn-row" style={{ display: header.showButton ? 'flex' : 'none' }}>
            <Link to="/register" className="btn btn-solid" id="hero-btn">
              {header.buttonText || 'Discover More'}
            </Link>
            <a href="#features" className="btn btn-outline" id="hero-btn-secondary">
              Explore Features
            </a>
          </div>
          <div
            className="hero-visual animate-fade-in delay-400"
            id="hero-bg-container"
            style={{
              backgroundImage: `url('/website-img.jpeg')`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              height: '350px',
              width: '100%',
              borderRadius: '20px',
            }}
          />
        </div>
      </section>

      <section className="section bg-light" id="about">
        <div className="container center animate-fade-up">
          <div className="section-label">About Us</div>
          <h2 className="section-title" id="about-title">
            {about.title || 'Our Story'}
          </h2>
          <p
            className="section-desc"
            id="about-desc"
            style={{ maxWidth: 800, textAlign: 'center', margin: '0 auto', lineHeight: 1.7 }}
          >
            {about.description || 'Learn more about our mission.'}
          </p>
          
          <div className="grid-2" style={{ marginTop: 60 }}>
            <div className="card animate-slide-left delay-100" style={{ background: '#fff', textAlign: 'left', borderTop: '4px solid var(--primary)' }}>
              <div className="card-icon" style={{ fontSize: '2rem', marginBottom: 20 }}><i className="fas fa-bullseye"></i></div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                Our Mission
              </h3>
              <p style={{ color: 'var(--text-light)', lineHeight: 1.7 }} id="about-mission">
                {about.mission || 'We build tools that empower teams.'}
              </p>
            </div>
            
            <div className="card animate-slide-right delay-200" style={{ background: '#fff', textAlign: 'left', borderTop: '4px solid #a855f7' }}>
              <div className="card-icon" style={{ fontSize: '2rem', marginBottom: 20 }}><i className="fas fa-eye"></i></div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                Our Vision
              </h3>
              <p style={{ color: 'var(--text-light)', lineHeight: 1.7 }} id="about-vision">
                {about.vision || 'A future of connected, productive workplaces.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container center">
          <div className="section-label animate-fade-up">Features</div>
          <h2 className="section-title animate-fade-up delay-100">Everything you need</h2>
          <p className="section-desc animate-fade-up delay-200">
            Tools built for modern HR teams to manage their workforce effortlessly and effectively.
          </p>
          <div className="grid-3" id="features-grid" style={{ marginTop: 40 }}>
            {features.length === 0 ? (
              <div className="card animate-fade-up delay-300">
                <div className="card-icon">✨</div>
                <h3 className="card-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
                  Feature highlights are coming soon
                </h3>
                <p className="card-text" style={{ fontSize: '1rem', color: 'var(--text-light)', lineHeight: 1.6 }}>
                  Add features from the Admin dashboard to populate this section.
                </p>
              </div>
            ) : (
              features.map((feature, index) => (
                <div key={feature._id || feature.title} className={`card animate-fade-up delay-${(index % 3 + 1) * 100}`}>
                  <div className="card-icon">
                    <i className={getFeatureIcon(feature.title)}></i>
                  </div>
                  <h3 className="card-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
                    {feature.title}
                  </h3>
                  <p className="card-text" style={{ fontSize: '1rem', color: 'var(--text-light)', lineHeight: 1.6 }}>
                    {feature.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section bg-light" id="pricing">
        <div className="container center animate-fade-up">
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Simple, transparent pricing</h2>
          <p className="section-desc">No hidden fees. Choose the plan that works best for your team.</p>
          
          <div className="grid-3" id="pricing-grid" style={{ marginTop: 40 }}>
            {pricing.length === 0 ? (
              <div className="card animate-fade-up delay-100" style={{ textAlign: 'center' }}>
                <h3 className="pricing-name" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)' }}>
                  Starter
                </h3>
                <div className="pricing-price">
                  ₹0
                  <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-light)' }}>/mo</span>
                </div>
                <hr className="divider" />
                <ul className="pricing-features" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <li style={{ fontSize: '1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ color: '#10b981' }}>✓</span> <span>Basic HR workflows</span>
                  </li>
                </ul>
                <Link to="/register" className="btn btn-outline btn-block" style={{ marginTop: 40 }}>
                  Choose Plan
                </Link>
              </div>
            ) : (
              pricing.map((plan, index) => (
                <div key={plan._id || plan.planName} className={`card ${plan.isPopular ? 'card-featured' : ''} animate-fade-up delay-${(index % 3 + 1) * 100}`} style={{ textAlign: 'center' }}>
                  {plan.isPopular && (
                    <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-gradient)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, padding: '4px 16px', borderRadius: '20px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      Most Popular
                    </div>
                  )}
                  <h3 className="pricing-name" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)' }}>
                    {plan.planName}
                  </h3>
                  <div className="pricing-price">
                    ₹{plan.price}
                    <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-light)' }}>/mo</span>
                  </div>
                  <hr className="divider" />
                  <ul className="pricing-features" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left', margin: '0 auto', maxWidth: '80%' }}>
                    {plan.features?.map((feature) => (
                      <li key={`${plan.planName}-${feature}`} style={{ fontSize: '1rem', color: 'var(--text)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className={`btn ${plan.isPopular ? 'btn-solid' : 'btn-outline'} btn-block`} style={{ marginTop: 40 }}>
                    Choose Plan
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
