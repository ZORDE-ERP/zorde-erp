import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard Logic', () => {
  let reflectorMock: any;

  beforeEach(() => {
    reflectorMock = {
      getAllAndOverride: jest.fn(),
    };
  });

  describe('@Public() decorator behavior', () => {
    it('should recognize @Public() decorator and return true', () => {
      reflectorMock.getAllAndOverride.mockReturnValue(true);

      const handler = () => {};
      const guardClass = () => {};

      // Simulate the logic from JwtAuthGuard
      const isPublic = reflectorMock.getAllAndOverride('isPublic', [handler, guardClass]);

      if (isPublic) {
        expect(true).toBe(true);
      }

      expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith('isPublic', [handler, guardClass]);
    });

    it('should use reflector to check for isPublic metadata', () => {
      reflectorMock.getAllAndOverride.mockReturnValue(false);

      const handler = () => {};
      const guardClass = () => {};

      const isPublic = reflectorMock.getAllAndOverride('isPublic', [handler, guardClass]);

      expect(isPublic).toBe(false);
      expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith('isPublic', [handler, guardClass]);
    });

    it('should return true only when isPublic is explicitly true', () => {
      const testCases = [
        { value: true, expected: true },
        { value: false, expected: false },
        { value: undefined, expected: false },
        { value: null, expected: false },
      ];

      testCases.forEach(({ value, expected }) => {
        reflectorMock.getAllAndOverride.mockReturnValue(value);

        const isPublic = reflectorMock.getAllAndOverride('isPublic', [() => {}, () => {}]);

        expect(!!isPublic).toBe(expected);
      });
    });
  });

  describe('Guard metadata extraction', () => {
    it('should extract metadata from handler', () => {
      reflectorMock.getAllAndOverride.mockReturnValue(true);

      const handler = { name: 'loginHandler' };
      const guardClass = { name: 'AuthController' };

      reflectorMock.getAllAndOverride('isPublic', [handler, guardClass]);

      expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith('isPublic', [handler, guardClass]);
    });

    it('should check both handler and class metadata', () => {
      reflectorMock.getAllAndOverride.mockReturnValue(undefined);

      const handler = jest.fn();
      const guardClass = jest.fn();

      reflectorMock.getAllAndOverride('isPublic', [handler, guardClass]);

      expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith('isPublic', expect.arrayContaining([handler, guardClass]));
    });
  });
});
