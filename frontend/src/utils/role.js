const ROLE_MAP = {
  admin: 'Admin',
  'super admin': 'Super Admin',
  superadmin: 'Super Admin',
  manager: 'Manager',
  employee: 'Employee',
};

export const normalizeRole = (role) => {
  const key = (role || '').toString().trim().toLowerCase();
  return ROLE_MAP[key] || '';
};
