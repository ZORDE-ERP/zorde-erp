export const createMockUser = (overrides = {}) => ({
  id: 'user-uuid-1',
  email: 'test@example.com',
  senha: 'hashed-password-123',
  organizationId: 'org-1',
  roleId: 'role-admin',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockUserWithPermissions = (permissions = [], overrides = {}) => ({
  ...createMockUser(overrides),
  permissions: [
    {
      resource: 'pedidos',
      action: 'read',
    },
    {
      resource: 'pedidos',
      action: 'create',
    },
    {
      resource: 'pedidos',
      action: 'update_stage',
    },
    {
      resource: 'config_admin',
      action: '*',
    },
    ...permissions,
  ],
});

export const createMockRole = (overrides = {}) => ({
  id: 'role-admin',
  organizationId: 'org-1',
  name: 'Admin',
  createdAt: new Date(),
  ...overrides,
});

export const createMockPermission = (overrides = {}) => ({
  id: 'perm-1',
  resource: 'pedidos',
  action: 'read',
  createdAt: new Date(),
  ...overrides,
});
