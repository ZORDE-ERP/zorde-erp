import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import {
  EntityNotFoundException,
  ConflictException,
} from '../../shared/exceptions/app.exception';
import { CurrentOrganization } from '../../shared/decorators/current-user.decorator';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(
    organizationId: string,
    data: { name: string; description?: string },
  ) {
    const existing = await this.prisma.role.findFirst({
      where: { organizationId, name: data.name },
    });

    if (existing) {
      throw new ConflictException(`Role '${data.name}' já existe nesta organização`);
    }

    return this.prisma.role.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.role.findMany({
      where: { organizationId },
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
  }

  async findOne(organizationId: string, roleId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, organizationId },
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

    if (!role) {
      throw new EntityNotFoundException('Role', roleId);
    }

    return role;
  }

  async addPermission(
    organizationId: string,
    roleId: string,
    permissionId: string,
  ) {
    const role = await this.findOne(organizationId, roleId);

    const existing = role.permissions.some(
      (rp) => rp.permissionId === permissionId,
    );

    if (existing) {
      throw new ConflictException('Permissão já associada a este role');
    }

    await this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });

    return this.findOne(organizationId, roleId);
  }

  async removePermission(
    organizationId: string,
    roleId: string,
    permissionId: string,
  ) {
    await this.findOne(organizationId, roleId);

    await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    return this.findOne(organizationId, roleId);
  }
}
