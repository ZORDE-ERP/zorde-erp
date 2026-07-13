import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { UnauthorizedException, EntityNotFoundException } from '../../shared/exceptions/app.exception';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, senha: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
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

    if (!user) {
      throw new EntityNotFoundException('Usuário', email);
    }

    const isPasswordValid = await verify(user.senha, senha);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    return this.formatUserForToken(user);
  }

  async generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      roleId: user.roleId,
      permissions: user.permissions.map((rp) => ({
        resource: rp.permission.resource,
        action: rp.permission.action,
      })),
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        organizationId: user.organizationId,
        role: user.role.name,
      },
    };
  }

  private formatUserForToken(user: any) {
    return {
      id: user.id,
      email: user.email,
      nome: user.nome,
      organizationId: user.organizationId,
      roleId: user.roleId,
      role: {
        name: user.role.name,
        permissions: user.role.permissions,
      },
    };
  }

  async hashPassword(password: string): Promise<string> {
    return hash(password);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return verify(hash, password);
  }
}
