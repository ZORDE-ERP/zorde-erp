import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { createMockUser, createMockUserWithPermissions } from '../../../test/factories/user.factory';
import { createMockPrismaService } from '../../../test/factories/prisma.factory';
import { EntityNotFoundException, UnauthorizedException } from '../../shared/exceptions/app.exception';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: any;

  beforeEach(async () => {
    prismaService = createMockPrismaService();
    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token-123'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return formatted user on successful login', async () => {
      const mockUser = createMockUserWithPermissions();
      mockUser.senha = '$argon2id$v=19$m=65536,t=3,p=4$rI+...'; // mock hashed password
      mockUser.role = {
        name: 'Admin',
        permissions: [
          {
            permission: { resource: 'pedidos', action: 'read' },
          },
        ],
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Mock argon2 verify to return true
      jest.spyOn(require('argon2'), 'verify').mockResolvedValue(true);

      const result = await service.validateUser(mockUser.email, 'password123');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        nome: mockUser.nome,
        organizationId: mockUser.organizationId,
        roleId: mockUser.roleId,
        role: {
          name: 'Admin',
          permissions: expect.any(Array),
        },
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });
    });

    it('should throw EntityNotFoundException when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser('nonexistent@example.com', 'password')).rejects.toThrow(
        EntityNotFoundException,
      );
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      const mockUser = createMockUser();
      mockUser.senha = '$argon2id$v=19$m=65536,t=3,p=4$rI+...';
      mockUser.role = {
        name: 'Admin',
        permissions: [],
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Mock argon2 verify to return false
      jest.spyOn(require('argon2'), 'verify').mockResolvedValue(false);

      await expect(service.validateUser(mockUser.email, 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token with correct payload', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        nome: 'Test User',
        organizationId: 'org-1',
        roleId: 'role-admin',
        role: {
          name: 'Admin',
        },
        permissions: [
          {
            permission: { resource: 'pedidos', action: 'read' },
          },
          {
            permission: { resource: 'pedidos', action: 'create' },
          },
        ],
      };

      const result = await service.generateToken(mockUser);

      expect(result).toEqual({
        accessToken: 'jwt-token-123',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          nome: mockUser.nome,
          organizationId: mockUser.organizationId,
          role: 'Admin',
        },
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        organizationId: mockUser.organizationId,
        roleId: mockUser.roleId,
        permissions: [
          { resource: 'pedidos', action: 'read' },
          { resource: 'pedidos', action: 'create' },
        ],
      });
    });

    it('should include organizationId in JWT payload', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        nome: 'Test User',
        organizationId: 'org-2',
        roleId: 'role-operator',
        role: { name: 'Operator' },
        permissions: [],
      };

      await service.generateToken(mockUser);

      const callArgs = jwtService.sign.mock.calls[0][0];
      expect(callArgs.organizationId).toBe('org-2');
    });
  });

  describe('hashPassword', () => {
    it('should hash password using argon2', async () => {
      const hashSpy = jest.spyOn(require('argon2'), 'hash').mockResolvedValue('hashed-password');

      const result = await service.hashPassword('mypassword');

      expect(result).toBe('hashed-password');
      expect(hashSpy).toHaveBeenCalledWith('mypassword');
    });
  });

  describe('verifyPassword', () => {
    it('should verify password and return true on match', async () => {
      const verifySpy = jest.spyOn(require('argon2'), 'verify').mockResolvedValue(true);

      const result = await service.verifyPassword('mypassword', 'hashed-password');

      expect(result).toBe(true);
      expect(verifySpy).toHaveBeenCalledWith('hashed-password', 'mypassword');
    });

    it('should verify password and return false on mismatch', async () => {
      const verifySpy = jest.spyOn(require('argon2'), 'verify').mockResolvedValue(false);

      const result = await service.verifyPassword('wrongpassword', 'hashed-password');

      expect(result).toBe(false);
    });
  });
});
