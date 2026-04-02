export const THEME_STORAGE_KEY = 'hrm_theme';

export const THEME_LIST = [
  {
    id: 'default',
    label: 'Default',
    subtitle: 'Light theme',
    description: 'Clean, familiar, and bright.',
    checkClass: 'theme-check-default',
  },
  {
    id: 'arctic',
    label: 'Arctic Command',
    subtitle: 'Dark blue theme',
    description: 'Cool, focused, and modern.',
    checkClass: 'theme-check-arctic',
  },
  {
    id: 'ember',
    label: 'Ember Ledger',
    subtitle: 'Dark brown theme',
    description: 'Warm, grounded, and refined.',
    checkClass: 'theme-check-ember',
  },
  {
    id: 'forest',
    label: 'Forest Growth',
    subtitle: 'Dark green theme',
    description: 'Calm, natural, and balanced.',
    checkClass: 'theme-check-forest',
  },
];

const normalizeThemeId = (themeId) => {
  const nextTheme = (themeId || '').toString().trim().toLowerCase();
  return THEME_LIST.some((theme) => theme.id === nextTheme) ? nextTheme : 'default';
};

export const getStoredTheme = () => {
  try {
    return normalizeThemeId(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return 'default';
  }
};

export const applyTheme = (themeId) => {
  const nextTheme = normalizeThemeId(themeId);
  if (typeof document !== 'undefined') {
    document.body?.setAttribute('data-theme', nextTheme);
    document.documentElement?.setAttribute('data-theme', nextTheme);
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    // ignore storage failures
  }
  try {
    window.dispatchEvent(new CustomEvent('hrm-theme-changed', { detail: { theme: nextTheme } }));
  } catch {
    // ignore event failures
  }
  return nextTheme;
};

export const applyStoredTheme = () => applyTheme(getStoredTheme());
