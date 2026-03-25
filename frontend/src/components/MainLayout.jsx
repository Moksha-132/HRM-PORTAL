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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const observeNodes = () => {
      const els = document.querySelectorAll(
        '.animate-fade-up, .animate-fade-in, .animate-slide-left, .animate-slide-right'
      );
      els.forEach((el) => observer.observe(el));
    };

    observeNodes();

    const mutationObserver = new MutationObserver(() => {
      observeNodes();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      active = false;
      observer.disconnect();
      mutationObserver.disconnect();
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
      <main style={{ flex: 1, marginTop: 'var(--nav-h, 70px)' }}>{children}</main>
      <Footer contact={contact} socialLinks={socialLinks} />
    </div>
  );
};

export default MainLayout;
