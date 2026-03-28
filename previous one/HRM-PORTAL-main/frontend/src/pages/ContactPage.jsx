import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { getContactSettings } from '../services/settingsService';

const ContactPage = () => {
  const [contactInfo, setContactInfo] = useState({
    address: 'Loading...',
    email: 'Loading...',
    phone: 'Loading...',
  });

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [submitStatus, setSubmitStatus] = useState({ loading: false, success: false, error: '' });

  useEffect(() => {
    let active = true;
    const loadSettings = async () => {
      try {
        const contactRes = await getContactSettings();
        if (active && contactRes?.success && contactRes?.data) {
          setContactInfo((prev) => ({ ...prev, ...contactRes.data }));
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

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, success: false, error: '' });
    
    try {
      // Simulate API call to submit contact form
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Successfully submitted
      setSubmitStatus({ loading: false, success: true, error: '' });
      setFormState({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setSubmitStatus({ loading: false, success: false, error: 'Failed to send message. Please try again later.' });
    }
  };

  return (
    <MainLayout>
      <section className="section" id="contact" style={{ padding: '80px 0' }}>
        <div className="container contact-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'flex-start' }}>
          
          <div className="contact-left animate-fade-up">
            <div className="section-label">Contact Us</div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 24 }}>
              Get in touch
            </h2>
            <p className="section-desc" style={{ textAlign: 'left', marginBottom: 30, maxWidth: '100%' }}>
              Have questions? Reach out to our team via email or visit us at our office. We are here to help you manage your workforce better.
            </p>
            <div className="contact-items">
              {contactInfo.address && contactInfo.address !== 'Loading...' && (
                <div className="contact-row" id="contact-address-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div className="contact-icon" style={{ fontSize: '1.5rem', marginRight: '15px' }}>📍</div>
                  <div className="contact-text" id="contact-address">
                    {contactInfo.address}
                  </div>
                </div>
              )}
              {contactInfo.email && contactInfo.email !== 'Loading...' && (
                <div className="contact-row" id="contact-email-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div className="contact-icon" style={{ fontSize: '1.5rem', marginRight: '15px' }}>✉️</div>
                  <div className="contact-text" id="contact-email">
                    {contactInfo.email}
                  </div>
                </div>
              )}
              {contactInfo.phone && contactInfo.phone !== 'Loading...' && (
                <div className="contact-row" id="contact-phone-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div className="contact-icon" style={{ fontSize: '1.5rem', marginRight: '15px' }}>📞</div>
                  <div className="contact-text" id="contact-phone">
                    {contactInfo.phone}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="contact-right animate-fade-in delay-200">
            <div className="card" style={{ padding: '30px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: 600 }}>Send us a message</h3>
              
              {submitStatus.success && (
                <div style={{ padding: '15px', backgroundColor: '#e2f5e8', color: '#10743b', borderRadius: '6px', marginBottom: '20px' }}>
                  Your message has been sent successfully! We will get back to you shortly.
                </div>
              )}
              {submitStatus.error && (
                <div style={{ padding: '15px', backgroundColor: '#fde8e8', color: '#c53030', borderRadius: '6px', marginBottom: '20px' }}>
                  {submitStatus.error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label htmlFor="contact-name">Your Name</label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    required
                    value={formState.name}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label htmlFor="contact-email">Your Email</label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    required
                    value={formState.email}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label htmlFor="contact-subject">Subject</label>
                  <input
                    type="text"
                    id="contact-subject"
                    name="subject"
                    required
                    value={formState.subject}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows="5"
                    required
                    value={formState.message}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'inherit' }}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-solid btn-block" disabled={submitStatus.loading}>
                  {submitStatus.loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>
    </MainLayout>
  );
};

export default ContactPage;
