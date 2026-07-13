import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard } from './permission.guard';
import { CHECK_PERMISSION_KEY } from '../../shared/decorators/check-permission.decorator';
import { createMockUserWithPermissions } from '../../../test/factories/user.factory';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: any;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    };

    guard = new PermissionGuard(reflector);
  });

  describe('canActivate', () => {
    it('should return true when no permission is required', () => {
      reflector.get.mockReturnValue(undefined);

      const context = {
        getHandler: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'user-1', permissions: [] },
          }),
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should grant access when user has required permission', () => {
      const mockUser = createMockUserWithPermissions([]);
      mockUser.permissions = [
        { resource: 'pedidos', action: 'read' },
        { resource: 'pedidos', action: 'create' },
      ];

      reflector.get.mockReturnValue({
        resource: 'pedidos',
        action: 'read',
      });

      const context = {
        getHandler: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: mockUser,
          }),
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user lacks permission', () => {
      const mockUser = createMockUserWithPermissions([]);
      mockUser.permissions = [{ resource: 'produtos', action: 'read' }];

      reflector.get.mockReturnValue({
        resource: 'pedidos',
        action: 'delete',
      });

      const context = {
        getHandler: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: mockUser,
          }),
        }),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('pedidos:delete');
    });

    it('should throw ForbiddenException when user is not authenticated', () => {
      reflector.get.mockReturnValue({
        resource: 'pedidos',
        action: 'read',
      });

      const context = {
        getHandler: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: null,
          }),
        }),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Permissão negada');
    });

    it('should throw ForbiddenException when user has no permissions array', () => {
      reflector.get.mockReturnValue({
        resource: 'pedidos',
        action: 'read',
      });

      const context = {
        getHandler: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'user-1' }, // no permissions property
          }),
        }),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should handle wildcard permissions (resource:*)', () => {
      const mockUser = createMockUserWithPermissions([]);
      mockUser.permissions = [
        { resource: 'config_admin', action: '*' }, // Admin wildcard
      ];

      reflector.get.mockReturnValue({
        resource: 'pedidos',
        action: 'read',
      });

      const context = {
        getHandler: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: mockUser,
          }),
        }),
      } as unknown as ExecutionContext;

      // Note: This test documents current behavior, wildcard matching
      // may need to be implemented in the actual guard if desired
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should correctly match exact resource and action', () => {
      const mockUser = createMockUserWithPermissions([]);
      mockUser.permissions = [
        { resource: 'pedidos', action: 'update_stage' },
      ];

      reflector.get.mockReturnValue({
        resource: 'pedidos',
        action: 'update_stage',
      });

      const context = {
        getHandler: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: mockUser,
          }),
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('error cases', () => {
    it('should include resource:action in error message', () => {
      reflector.get.mockReturnValue({
        resource: 'fornecedores',
        action: 'delete',
      });

      const context = {
        getHandler: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'user-1', permissions: [] },
          }),
        }),
      } as unknown as ExecutionContext;

      try {
        guard.canActivate(context);
        fail('Should have thrown ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toContain('fornecedores:delete');
      }
    });
  });
});
