import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/database/prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { EntityNotFoundException } from '../shared/exceptions/app.exception';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createProdutoDto: CreateProdutoDto) {
    return this.prisma.produto.create({
      data: createProdutoDto as any,
    });
  }

  findAll() {
    return this.prisma.produto.findMany({
      include: {
        estoques: true,
        compras: true,
      },
    });
  }

  async findOne(id: string) {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
      include: {
        estoques: true,
        compras: true,
      },
    });

    if (!produto) {
      throw new EntityNotFoundException('Produto', id);
    }

    return produto;
  }

  async update(id: string, updateProdutoDto: UpdateProdutoDto) {
    await this.findOne(id);

    return this.prisma.produto.update({
      where: { id },
      data: updateProdutoDto as any,
      include: {
        estoques: true,
        compras: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.produto.delete({
      where: { id },
    });
  }
}
