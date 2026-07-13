import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { createMockPrismaService } from '../../../test/factories/prisma.factory';
import { ConflictException, EntityNotFoundException } from '../../shared/exceptions/app.exception';

describe('RolesService', () => {
  let service: RolesService;
  let prismaService: any;

  const mockRole = {
    id: 'role-1',
    organizationId: 'org-1',
    name: 'Operador',
    description: 'Operador de pedidos',
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: [],
    _count: { users: 0 },
  };

  beforeEach(async () => {
    prismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  describe('create', () => {
    it('should create role', async () => {
      prismaService.role.findFirst.mockResolvedValue(null);
      prismaService.role.create.mockResolvedValue(mockRole);

      const result = await service.create('org-1', { name: 'Operador' });

      expect(result).toEqual(mockRole);
      expect(prismaService.role.findFirst).toHaveBeenCalledWith({
        where: { organizationId: 'org-1', name: 'Operador' },
      });
    });

    it('should throw ConflictException if role name exists', async () => {
      prismaService.role.findFirst.mockResolvedValue(mockRole);

      await expect(service.create('org-1', { name: 'Operador' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should include permissions in created role', async () => {
      const roleWithPermissions = {
        ...mockRole,
        permissions: [
          {
            roleId: 'role-1',
            permissionId: 'perm-1',
            permission: { id: 'perm-1', resource: 'pedidos', action: 'read' },
          },
        ],
      };

      prismaService.role.findFirst.mockResolvedValue(null);
      prismaService.role.create.mockResolvedValue(roleWithPermissions);

      const result = await service.create('org-1', { name: 'Operador' });

      expect(result.permissions.length).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return all roles for organization', async () => {
      const roles = [mockRole, { ...mockRole, id: 'role-2', name: 'Admin' }];
      prismaService.role.findMany.mockResolvedValue(roles);

      const result = await service.findAll('org-1');

      expect(result).toEqual(roles);
      expect(prismaService.role.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-1' },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: { users: true },
          },
        },
      });
    });

    it('should return empty array when no roles exist', async () => {
      prismaService.role.findMany.mockResolvedValue([]);

      const result = await service.findAll('org-1');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return role by id', async () => {
      prismaService.role.findFirst.mockResolvedValue(mockRole);

      const result = await service.findOne('org-1', 'role-1');

      expect(result).toEqual(mockRole);
    });

    it('should throw EntityNotFoundException if not found', async () => {
      prismaService.role.findFirst.mockResolvedValue(null);

      await expect(service.findOne('org-1', 'nonexistent')).rejects.toThrow(
        EntityNotFoundException,
      );
    });

    it('should include user count in response', async () => {
      const roleWithUsers = { ...mockRole, _count: { users: 5 } };
      prismaService.role.findFirst.mockResolvedValue(roleWithUsers);

      const result = await service.findOne('org-1', 'role-1');

      expect(result._count.users).toBe(5);
    });
  });

  describe('addPermission', () => {
    it('should add permission to role', async () => {
      const roleWithoutPerm = { ...mockRole, permissions: [] };
      const roleWithPerm = {
        ...mockRole,
        permissions: [
          {
            roleId: 'role-1',
            permissionId: 'perm-1',
            permission: { id: 'perm-1', resource: 'pedidos', action: 'read' },
          },
        ],
      };

      prismaService.role.findFirst.mockResolvedValueOnce(roleWithoutPerm);
      prismaService.rolePermission.create.mockResolvedValue({});
      prismaService.role.findFirst.mockResolvedValueOnce(roleWithPerm);

      const result = await service.addPermission('org-1', 'role-1', 'perm-1');

      expect(result.permissions.length).toBe(1);
      expect(prismaService.rolePermission.create).toHaveBeenCalledWith({
        data: { roleId: 'role-1', permissionId: 'perm-1' },
      });
    });

    it('should throw ConflictException if permission already associated', async () => {
      const roleWithPerm = {
        ...mockRole,
        permissions: [
          {
            roleId: 'role-1',
            permissionId: 'perm-1',
            permission: { id: 'perm-1', resource: 'pedidos', action: 'read' },
          },
        ],
      };

      prismaService.role.findFirst.mockResolvedValue(roleWithPerm);

      await expect(service.addPermission('org-1', 'role-1', 'perm-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('removePermission', () => {
    it('should remove permission from role', async () => {
      const roleWithPerm = {
        ...mockRole,
        permissions: [
          {
            roleId: 'role-1',
            permissionId: 'perm-1',
            permission: { id: 'perm-1', resource: 'pedidos', action: 'read' },
          },
        ],
      };
      const roleWithoutPerm = { ...mockRole, permissions: [] };

      prismaService.role.findFirst.mockResolvedValueOnce(roleWithPerm);
      prismaService.rolePermission.delete.mockResolvedValue({});
      prismaService.role.findFirst.mockResolvedValueOnce(roleWithoutPerm);

      const result = await service.removePermission('org-1', 'role-1', 'perm-1');

      expect(result.permissions.length).toBe(0);
      expect(prismaService.rolePermission.delete).toHaveBeenCalledWith({
        where: {
          roleId_permissionId: {
            roleId: 'role-1',
            permissionId: 'perm-1',
          },
        },
      });
    });

    it('should throw EntityNotFoundException if role not found', async () => {
      prismaService.role.findFirst.mockResolvedValue(null);

      await expect(service.removePermission('org-1', 'nonexistent', 'perm-1')).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });
});
