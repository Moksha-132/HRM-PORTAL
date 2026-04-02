import React, { useEffect, useState } from 'react';
import { applyTheme, getStoredTheme, THEME_LIST } from '../../utils/theme';

const ThemeChooserSection = () => {
  const [selectedTheme, setSelectedTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    const handleThemeChange = (event) => {
      const nextTheme = event?.detail?.theme || getStoredTheme();
      setSelectedTheme(nextTheme);
    };

    const handleStorageChange = () => setSelectedTheme(getStoredTheme());

    window.addEventListener('hrm-theme-changed', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('hrm-theme-changed', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <section className="section theme-section bg-light" id="theme">
      <div className="container center animate-fade-up">
        <div className="section-label">Personalization</div>
        <h2 className="section-title">Choose Your Theme</h2>
        <p className="section-desc theme-section-desc">
          Pick a visual style that matches your taste. Applied instantly across the entire platform.
        </p>

        <div className="theme-grid" role="list" aria-label="Theme options">
          {THEME_LIST.map((theme) => {
            const isActive = selectedTheme === theme.id;

            return (
              <button
                key={theme.id}
                type="button"
                className={`theme-card theme-${theme.id}${isActive ? ' is-selected' : ''}`}
                onClick={() => setSelectedTheme(applyTheme(theme.id))}
                aria-pressed={isActive}
                role="listitem"
              >
                <div className="theme-card-preview" aria-hidden="true">
                  <div className="theme-preview-shell">
                    <div className="theme-preview-topbar">
                      <span className="theme-preview-chip" />
                      <div className="theme-preview-dots">
                        <span />
                        <span />
                      </div>
                    </div>
                    <div className="theme-preview-body">
                      <div className="theme-preview-line theme-preview-line-lg" />
                      <div className="theme-preview-line theme-preview-line-md" />
                      <div className="theme-preview-metrics">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="theme-card-body">
                  <div>
                    <h3 className="theme-card-title">{theme.label}</h3>
                    <p className="theme-card-subtitle">{theme.subtitle}</p>
                  </div>
                  <p className="theme-card-copy">{theme.description}</p>
                  <div className="theme-card-footer">
                    <div className="theme-swatches" aria-hidden="true">
                      {theme.id === 'default' && <span className="swatch swatch-primary" />}
                      {theme.id === 'arctic' && <><span className="swatch swatch-navy" /><span className="swatch swatch-ice" /></>}
                      {theme.id === 'ember' && <><span className="swatch swatch-ember" /><span className="swatch swatch-cream" /></>}
                      {theme.id === 'forest' && <><span className="swatch swatch-forest" /><span className="swatch swatch-mint" /></>}
                    </div>
                    <span className="theme-selected-indicator">
                      <i className={`fas fa-check ${isActive ? 'visible' : ''}`} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ThemeChooserSection;
