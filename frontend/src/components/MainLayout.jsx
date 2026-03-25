import React, { useState, useEffect, useMemo } from 'react';
import Header from './Header';
import Footer from './Footer';
import { getContactSettings } from '../services/settingsService';

const MainLayout = ({ children }) => {
  const [contact, setContact] = useState({
    email: '',
    phone: '',
    address: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
  });

  useEffect(() => {
    let active = true;
    const loadSettings = async () => {
      try {
        const contactRes = await getContactSettings();
        if (active && contactRes?.success && contactRes?.data) {
          setContact((prev) => ({ ...prev, ...contactRes.data }));
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

  const socialLinks = useMemo(() => {
    return [
      contact.facebook && { href: contact.facebook, icon: 'fab fa-facebook-f', label: 'Facebook' },
      contact.twitter && { href: contact.twitter, icon: 'fab fa-twitter', label: 'Twitter' },
      contact.linkedin && { href: contact.linkedin, icon: 'fab fa-linkedin-in', label: 'LinkedIn' },
      contact.instagram && { href: contact.instagram, icon: 'fab fa-instagram', label: 'Instagram' },
    ].filter(Boolean);
  }, [contact]);

  return (
    <div className="site-mode" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer contact={contact} socialLinks={socialLinks} />
    </div>
  );
};

export default MainLayout;
