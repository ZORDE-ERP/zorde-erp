import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/database/prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createProdutoDto: CreateProdutoDto) {
    return this.prisma.produtos.create({
      data: createProdutoDto,
    });
  }

  findAll() {
    return this.prisma.produtos.findMany({
      include: {
        estoques: true,
        compras: true,
      },
    });
  }

  async findOne(id: number) {
    const produto = await this.prisma.produtos.findUnique({
      where: { id },
      include: {
        estoques: true,
        compras: true,
      },
    });

    if (!produto) {
      throw new NotFoundException(`Produto ${id} não encontrado`);
    }

    return produto;
  }

  async update(id: number, updateProdutoDto: UpdateProdutoDto) {
    await this.findOne(id);

    return this.prisma.produtos.update({
      where: { id },
      data: updateProdutoDto,
      include: {
        estoques: true,
        compras: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.produtos.delete({
      where: { id },
    });
  }
}
