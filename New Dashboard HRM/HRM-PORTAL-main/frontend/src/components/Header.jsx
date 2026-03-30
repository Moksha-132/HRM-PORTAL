import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState('/logo.avif');

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  React.useEffect(() => {
    let active = true;
    import('../services/settingsService').then(({ getWebsiteSettings }) => {
       getWebsiteSettings().then(res => {
         if (active && res.success && res.data?.logoUrl) {
            setLogoUrl(res.data.logoUrl);
         }
       }).catch(() => {});
    });
    return () => { active = false; };
  }, []);

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo" aria-label="Shnoor Home" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logoUrl} alt="Company Logo" style={{ height: '48px', objectFit: 'contain' }} />
            shnoor
          </Link>

          <button
            type="button"
            className="hamburger"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? '×' : '☰'}
          </button>

          <nav className={`nav-links${mobileOpen ? ' open' : ''}`} aria-label="Main navigation">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              Home
            </NavLink>
            <a href="/#about" className="nav-link">
              About Us
            </a>
            <a href="/#features" className="nav-link">
              Features
            </a>
            <a href="/#pricing" className="nav-link">
              Pricing
            </a>
            <NavLink to="/contact" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              Contact
            </NavLink>
          </nav>

          <div className="nav-right">
            <Link to="/register" className="btn btn-outline" style={{ marginLeft: 'auto' }}>
              Register
            </Link>
            <Link to="/login" className="btn btn-solid">
              Login
            </Link>
          </div>
        </div>
      </header>

      <div className={`nav-mobile-backdrop${mobileOpen ? ' open' : ''}`} role="presentation" onClick={() => setMobileOpen(false)} />
    </>
  );
};

export default Header;

