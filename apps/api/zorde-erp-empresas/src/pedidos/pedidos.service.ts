import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/database/prisma/prisma.service';
import { EntityNotFoundException } from '../shared/exceptions/app.exception';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPedidoDto: CreatePedidoDto) {
    return this.prisma.pedido.create({
      data: createPedidoDto as any,
      include: {
        produto: true,
        currentStage: true,
      },
    });
  }

  findAll() {
    return this.prisma.pedido.findMany({
      include: {
        produto: true,
        currentStage: true,
      },
    });
  }

  async findOne(id: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: {
        produto: true,
        currentStage: true,
      },
    });

    if (!pedido) {
      throw new EntityNotFoundException('Pedido', id);
    }

    return pedido;
  }

  async update(id: string, updatePedidoDto: UpdatePedidoDto) {
    await this.findOne(id);

    return this.prisma.pedido.update({
      where: { id },
      data: updatePedidoDto as any,
      include: {
        produto: true,
        currentStage: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.pedido.delete({
      where: { id },
    });
  }
}
