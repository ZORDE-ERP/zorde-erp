import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/database/prisma/prisma.service';
import { CreateEstoqueDto } from './dto/create-estoque.dto';
import { UpdateEstoqueDto } from './dto/update-estoque.dto';

@Injectable()
export class EstoqueService {
  constructor(private readonly prisma: PrismaService) {}

  create(createEstoqueDto: CreateEstoqueDto) {
    return this.prisma.estoque.create({
      data: createEstoqueDto,
      include: {
        produto: true,
      },
    });
  }

  findAll() {
    return this.prisma.estoque.findMany({
      include: {
        produto: true,
      },
    });
  }

  async findOne(id: number) {
    const estoque = await this.prisma.estoque.findUnique({
      where: { id },
      include: {
        produto: true,
      },
    });

    if (!estoque) {
      throw new NotFoundException(`Estoque ${id} não encontrado`);
    }

    return estoque;
  }

  async update(id: number, updateEstoqueDto: UpdateEstoqueDto) {
    await this.findOne(id);

    return this.prisma.estoque.update({
      where: { id },
      data: updateEstoqueDto,
      include: {
        produto: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.estoque.delete({
      where: { id },
    });
  }
}
