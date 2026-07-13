import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/database/prisma/prisma.service';
import { EntityNotFoundException } from '../shared/exceptions/app.exception';
import { CreateFornecedoreDto } from './dto/create-fornecedore.dto';
import { UpdateFornecedoreDto } from './dto/update-fornecedore.dto';

@Injectable()
export class FornecedoresService {
  constructor(private readonly prisma: PrismaService) {}

  create(createFornecedoreDto: CreateFornecedoreDto) {
    return this.prisma.fornecedor.create({
      data: createFornecedoreDto as any,
      include: {
        compras: true,
      },
    });
  }

  findAll() {
    return this.prisma.fornecedor.findMany({
      include: {
        compras: true,
      },
    });
  }

  async findOne(id: string) {
    const fornecedor = await this.prisma.fornecedor.findUnique({
      where: { id },
      include: {
        compras: true,
      },
    });

    if (!fornecedor) {
      throw new EntityNotFoundException('Fornecedor', id);
    }

    return fornecedor;
  }

  async update(id: string, updateFornecedoreDto: UpdateFornecedoreDto) {
    await this.findOne(id);

    return this.prisma.fornecedor.update({
      where: { id },
      data: updateFornecedoreDto as any,
      include: {
        compras: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.fornecedor.delete({
      where: { id },
    });
  }
}
