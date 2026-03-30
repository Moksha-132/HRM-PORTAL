export const hasAcceptedPolicies = () =>
  localStorage.getItem('privacyAccepted') === 'true' &&
  localStorage.getItem('termsAccepted') === 'true';

export const acceptPolicies = () => {
  localStorage.setItem('privacyAccepted', 'true');
  localStorage.setItem('termsAccepted', 'true');
};

export const clearAcceptedPolicies = () => {
  localStorage.removeItem('privacyAccepted');
  localStorage.removeItem('termsAccepted');
};
