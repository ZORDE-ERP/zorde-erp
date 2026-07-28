import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infra/database/prisma/prisma.service';

type TransactionClient = Prisma.TransactionClient;

@Injectable()
export class ReservarCodigosOsService {
	public constructor(private readonly prisma: PrismaService) {}

	public async reservar(clienteId: number, usuarioId: number, quantidade: number): Promise<string[]> {
		if (quantidade < 1) {
			return [];
		}

		return this.prisma.$transaction((tx) => this.reservarInTransaction(tx, clienteId, usuarioId, quantidade));
	}

	public async reservarInTransaction(
		tx: TransactionClient,
		clienteId: number,
		usuarioId: number,
		quantidade: number,
	): Promise<string[]> {
		if (quantidade < 1) {
			return [];
		}

		await tx.$executeRaw`
			INSERT INTO entidades."SequenciaCodigoOs" ("usuarioId", "clienteId", "proximoNumero", "updatedAt")
			VALUES (${usuarioId}, ${clienteId}, 1, NOW())
			ON CONFLICT ("usuarioId", "clienteId") DO NOTHING
		`;

		const locked = await tx.$queryRaw<Array<{ proximoNumero: number }>>`
			SELECT "proximoNumero"
			FROM entidades."SequenciaCodigoOs"
			WHERE "usuarioId" = ${usuarioId} AND "clienteId" = ${clienteId}
			FOR UPDATE
		`;

		const start = locked[0]?.proximoNumero ?? 1;
		const end = start + quantidade;

		await tx.sequenciaCodigoOs.updateMany({
			where: { usuarioId, clienteId },
			data: { proximoNumero: end },
		});

		return Array.from({ length: quantidade }, (_, index) => this.formatCodigo(clienteId, start + index));
	}

	private formatCodigo(clienteId: number, numero: number): string {
		return `OS-${clienteId}-${String(numero).padStart(6, '0')}`;
	}
}
