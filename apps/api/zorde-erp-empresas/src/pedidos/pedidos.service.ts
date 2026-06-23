import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/database/prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPedidoDto: CreatePedidoDto) {
    return this.prisma.compras.create({
      data: createPedidoDto,
      include: {
        produto: true,
        fornecedor: true,
      },
    });
  }

  findAll() {
    return this.prisma.compras.findMany({
      include: {
        produto: true,
        fornecedor: true,
      },
    });
  }

  async findOne(id: number) {
    const pedido = await this.prisma.compras.findUnique({
      where: { id },
      include: {
        produto: true,
        fornecedor: true,
      },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido ${id} não encontrado`);
    }

    return pedido;
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    await this.findOne(id);

    return this.prisma.compras.update({
      where: { id },
      data: updatePedidoDto,
      include: {
        produto: true,
        fornecedor: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.compras.delete({
      where: { id },
    });
  }
}
