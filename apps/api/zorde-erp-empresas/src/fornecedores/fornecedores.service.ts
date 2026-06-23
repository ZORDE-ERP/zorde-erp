import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/database/prisma/prisma.service';
import { CreateFornecedoreDto } from './dto/create-fornecedore.dto';
import { UpdateFornecedoreDto } from './dto/update-fornecedore.dto';

@Injectable()
export class FornecedoresService {
  constructor(private readonly prisma: PrismaService) {}

  create(createFornecedoreDto: CreateFornecedoreDto) {
    return this.prisma.fornecedores.create({
      data: createFornecedoreDto,
      include: {
        compras: true,
      },
    });
  }

  findAll() {
    return this.prisma.fornecedores.findMany({
      include: {
        compras: true,
      },
    });
  }

  async findOne(id: number) {
    const fornecedor = await this.prisma.fornecedores.findUnique({
      where: { id },
      include: {
        compras: true,
      },
    });

    if (!fornecedor) {
      throw new NotFoundException(`Fornecedor ${id} nao encontrado`);
    }

    return fornecedor;
  }

  async update(id: number, updateFornecedoreDto: UpdateFornecedoreDto) {
    await this.findOne(id);

    return this.prisma.fornecedores.update({
      where: { id },
      data: updateFornecedoreDto,
      include: {
        compras: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.fornecedores.delete({
      where: { id },
    });
  }
}
