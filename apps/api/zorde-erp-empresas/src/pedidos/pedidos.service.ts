import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../infra/database/prisma/prisma.service';
import { EntityNotFoundException } from '../shared/exceptions/app.exception';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { PedidoStatusChangedEvent } from '../events/pedido.events';

@Injectable()
export class PedidosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
    const oldPedido = await this.findOne(id);

    const updatedPedido = await this.prisma.pedido.update({
      where: { id },
      data: updatePedidoDto as any,
      include: {
        produto: true,
        currentStage: true,
      },
    });

    // Emit event if stage changed
    if (updatePedidoDto.currentStageId && updatePedidoDto.currentStageId !== oldPedido.currentStageId) {
      const event = new PedidoStatusChangedEvent(
        id,
        oldPedido.currentStageId,
        updatePedidoDto.currentStageId,
        oldPedido.organizationId,
        'system', // TODO: Get from request context
      );
      this.eventEmitter.emit('pedido.status-changed', event);
    }

    return updatedPedido;
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.pedido.delete({
      where: { id },
    });
  }
}
