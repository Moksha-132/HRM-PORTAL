import { useState, useEffect } from 'react';
import { getWebsiteSettings } from '../services/settingsService';

export const useSiteLogo = () => {
  const [logoUrl, setLogoUrl] = useState('/logo.avif');

  useEffect(() => {
    let active = true;
    getWebsiteSettings()
      .then((res) => {
        if (active && res?.success && res.data?.logoUrl) {
          setLogoUrl(res.data.logoUrl);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return logoUrl;
};
