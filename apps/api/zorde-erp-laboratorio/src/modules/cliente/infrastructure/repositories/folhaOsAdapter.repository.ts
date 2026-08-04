import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { StatusFolhaOs } from '../../../../shared/enums/folha-os.enum';
import { ReservarCodigosOsService } from '../../../../shared/infra/services/reservarCodigosOs.service';
import { FolhaOsImpressaEntity } from '../../domain/entities/folhaOsImpressa.entity';
import type { CreateLoteComFolhasResult, IFolhaOsRepository } from '../../domain/repositories/folhaOs.repository';

@Injectable()
export class PrismaFolhaOsRepository implements IFolhaOsRepository {
	public constructor(
		private readonly prisma: PrismaService,
		private readonly reservarCodigosOsService: ReservarCodigosOsService,
	) {}

	public async createLoteComFolhas(params: {
		clienteId: number;
		usuarioId: number;
		quantidade: number;
	}): Promise<CreateLoteComFolhasResult> {
		const { clienteId, usuarioId, quantidade } = params;

		return this.prisma.$transaction(async (tx) => {
			const codigos = await this.reservarCodigosOsService.reservarInTransaction(tx, clienteId, usuarioId, quantidade);

			const lote = await tx.loteImpressaoOs.create({
				data: {
					clienteId,
					usuarioId,
					quantidade,
				},
			});

			const folhas: FolhaOsImpressaEntity[] = [];

			for (const codigoFolha of codigos) {
				const created = await tx.folhaOsImpressa.create({
					data: {
						loteId: lote.id,
						clienteId,
						usuarioId,
						codigoFolha,
						status: 'IMPRESSA',
					},
				});

				folhas.push(this.toDomain(created));
			}

			return {
				loteId: lote.id,
				quantidade,
				folhas,
			};
		});
	}

	public async findById(id: number, usuarioId: number): Promise<FolhaOsImpressaEntity | null> {
		const raw = await this.prisma.folhaOsImpressa.findFirst({
			where: { id, usuarioId },
		});
		return raw ? this.toDomain(raw) : null;
	}

	public async findByCodigoFolha(codigoFolha: string, usuarioId: number): Promise<FolhaOsImpressaEntity | null> {
		const raw = await this.prisma.folhaOsImpressa.findFirst({
			where: { codigoFolha, usuarioId },
		});
		return raw ? this.toDomain(raw) : null;
	}

	public async vincularOrdem(params: {
		folhaId: number;
		ordemDeServicoId: number;
		usuarioId: number;
		status: StatusFolhaOs;
	}): Promise<FolhaOsImpressaEntity> {
		const updated = await this.prisma.folhaOsImpressa.update({
			where: { id: params.folhaId },
			data: {
				ordemDeServicoId: params.ordemDeServicoId,
				status: params.status,
			},
		});
		return this.toDomain(updated);
	}

	private toDomain(raw: {
		id: number;
		loteId: number;
		clienteId: number;
		usuarioId: number;
		codigoFolha: string;
		status: string;
		ordemDeServicoId: number | null;
		createdAt: Date;
	}): FolhaOsImpressaEntity {
		return new FolhaOsImpressaEntity({
			id: raw.id,
			loteId: raw.loteId,
			clienteId: raw.clienteId,
			usuarioId: raw.usuarioId,
			codigoFolha: raw.codigoFolha,
			status: raw.status as StatusFolhaOs,
			ordemDeServicoId: raw.ordemDeServicoId,
			createdAt: raw.createdAt,
		});
	}
}
