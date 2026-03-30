import { useState, useEffect } from 'react';
import { getWebsiteSettings } from '../services/settingsService';

export const useSiteLogo = () => {
  const [logoUrl, setLogoUrl] = useState('/logo.avif');

  useEffect(() => {
    let active = true;

    const loadLogo = () => {
      getWebsiteSettings()
        .then((res) => {
          if (!active) return;
          setLogoUrl(res?.success && res.data?.logoUrl ? res.data.logoUrl : '/logo.avif');
        })
        .catch(() => {
          if (active) setLogoUrl('/logo.avif');
        });
    };

    const onLogoUpdate = (event) => {
      const nextLogo = event?.detail?.logoUrl;
      setLogoUrl(nextLogo || '/logo.avif');
    };

    loadLogo();
    window.addEventListener('site-logo-updated', onLogoUpdate);

    return () => {
      active = false;
      window.removeEventListener('site-logo-updated', onLogoUpdate);
    };
  }, []);

  return logoUrl;
};
