import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo" aria-label="Shnoor Home">
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
            <div className="lang-wrap" aria-label="Language selector">
              <span style={{ fontWeight: 700, color: 'var(--text-light)' }}>Lang</span>
              <select id="lang" defaultValue="en" aria-label="Language">
                <option value="en">EN</option>
                <option value="ar">AR</option>
                <option value="fr">FR</option>
                <option value="ur">UR</option>
              </select>
            </div>
            <Link to="/register" className="btn btn-outline">
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

