import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;
  let serviceMock: any;

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
    serviceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      addPermission: jest.fn(),
      removePermission: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  describe('findAll', () => {
    it('should return all roles for organization', async () => {
      const roles = [mockRole];
      serviceMock.findAll.mockResolvedValue(roles);

      const result = await controller.findAll('org-1');

      expect(result).toEqual(roles);
      expect(serviceMock.findAll).toHaveBeenCalledWith('org-1');
    });
  });

  describe('findOne', () => {
    it('should return role by id', async () => {
      serviceMock.findOne.mockResolvedValue(mockRole);

      const result = await controller.findOne('org-1', 'role-1');

      expect(result).toEqual(mockRole);
      expect(serviceMock.findOne).toHaveBeenCalledWith('org-1', 'role-1');
    });
  });

  describe('create', () => {
    it('should create role', async () => {
      serviceMock.create.mockResolvedValue(mockRole);

      const result = await controller.create('org-1', { name: 'Operador' });

      expect(result).toEqual(mockRole);
      expect(serviceMock.create).toHaveBeenCalledWith('org-1', { name: 'Operador' });
    });
  });

  describe('addPermission', () => {
    it('should add permission to role', async () => {
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
      serviceMock.addPermission.mockResolvedValue(roleWithPerm);

      const result = await controller.addPermission('org-1', 'role-1', 'perm-1');

      expect(result.permissions.length).toBe(1);
      expect(serviceMock.addPermission).toHaveBeenCalledWith('org-1', 'role-1', 'perm-1');
    });
  });

  describe('removePermission', () => {
    it('should remove permission from role', async () => {
      serviceMock.removePermission.mockResolvedValue(mockRole);

      const result = await controller.removePermission('org-1', 'role-1', 'perm-1');

      expect(result).toEqual(mockRole);
      expect(serviceMock.removePermission).toHaveBeenCalledWith('org-1', 'role-1', 'perm-1');
    });
  });
});
