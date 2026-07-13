import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { createMockUser } from '../../test/factories/user.factory';
import { EntityNotFoundException, UnauthorizedException } from '../shared/exceptions/app.exception';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    authService = {
      validateUser: jest.fn(),
      generateToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('POST /auth/login', () => {
    it('should return token and user on successful login', async () => {
      const mockUser = createMockUser();
      const mockToken = {
        accessToken: 'jwt-token-123',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          nome: mockUser.nome,
          organizationId: mockUser.organizationId,
          role: 'Admin',
        },
      };

      authService.validateUser.mockResolvedValue(mockUser);
      authService.generateToken.mockResolvedValue(mockToken);

      const result = await controller.login({
        email: 'test@example.com',
        senha: 'password123',
      });

      expect(result).toEqual(mockToken);
      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(authService.generateToken).toHaveBeenCalledWith(mockUser);
    });

    it('should throw error on invalid email format', async () => {
      await expect(
        controller.login({
          email: 'not-an-email',
          senha: 'password123',
        }),
      ).rejects.toThrow();
    });

    it('should throw error on password too short', async () => {
      await expect(
        controller.login({
          email: 'test@example.com',
          senha: '12345',
        }),
      ).rejects.toThrow();
    });

    it('should propagate UnauthorizedException on invalid credentials', async () => {
      authService.validateUser.mockRejectedValue(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      await expect(
        controller.login({
          email: 'test@example.com',
          senha: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should propagate EntityNotFoundException on user not found', async () => {
      authService.validateUser.mockRejectedValue(new EntityNotFoundException('Usuário'));

      await expect(
        controller.login({
          email: 'nonexistent@example.com',
          senha: 'password123',
        }),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('should return token with user permissions', async () => {
      const mockUser = createMockUser();
      const mockToken = {
        accessToken: 'jwt-token-456',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          nome: mockUser.nome,
          organizationId: mockUser.organizationId,
          role: 'Admin',
        },
      };

      authService.validateUser.mockResolvedValue(mockUser);
      authService.generateToken.mockResolvedValue(mockToken);

      const result = await controller.login({
        email: mockUser.email,
        senha: 'password123',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.user.organizationId).toBe('org-1');
    });
  });
});
