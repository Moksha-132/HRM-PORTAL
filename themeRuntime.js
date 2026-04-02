(function () {
  const THEME_STORAGE_KEY = 'hrm_theme';
  const VALID_THEMES = new Set(['default', 'arctic', 'ember', 'forest']);

  function normalizeTheme(theme) {
    const nextTheme = String(theme || '').trim().toLowerCase();
    return VALID_THEMES.has(nextTheme) ? nextTheme : 'default';
  }

  function applyTheme(theme) {
    const nextTheme = normalizeTheme(theme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.body && document.body.setAttribute('data-theme', nextTheme);
    return nextTheme;
  }

  try {
    applyTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    applyTheme('default');
  }

  window.addEventListener('storage', function (event) {
    if (event.key === THEME_STORAGE_KEY) {
      applyTheme(event.newValue);
    }
  });

  window.applyRuntimeTheme = applyTheme;
})();
