import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleException, EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IClienteRepository } from '../../domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../domain/repositories/cliente.repository';
import type { IFolhaOsRepository } from '../../domain/repositories/folhaOs.repository';
import { IFOLHA_OS_REPOSITORY } from '../../domain/repositories/folhaOs.repository';
import { OsFolhaPdfService } from '../../infrastructure/services/osFolhaPdf.service';
import type { ImpressaoOsDto } from '../dtos/impressaoOs.dto';

export interface ImprimirFolhasOsResult {
	buffer: Buffer;
	filename: string;
	loteId: number;
	quantidade: number;
	codigosFolha: string[];
}

@Injectable()
export class ImprimirFolhasOsUseCase {
	public constructor(
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
		@Inject(IFOLHA_OS_REPOSITORY)
		private readonly folhaOsRepository: IFolhaOsRepository,
		private readonly osFolhaPdfService: OsFolhaPdfService,
	) {}

	public async execute(clienteId: number, usuarioId: number, dto: ImpressaoOsDto): Promise<ImprimirFolhasOsResult> {
		const cliente = await this.clienteRepository.findById(clienteId, usuarioId);
		if (!cliente) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		const qrCodeUrl = cliente.getQrCodeUrl();
		if (!cliente.getQrToken() || !qrCodeUrl) {
			throw new BusinessRuleException('Cliente sem QR Code. Gere o QR antes de imprimir as folhas.');
		}

		const lote = await this.folhaOsRepository.createLoteComFolhas({
			clienteId,
			usuarioId,
			quantidade: dto.quantidade,
		});

		const nomeOtica = cliente.getNomeFantasia() || cliente.getNome();
		const buffer = await this.osFolhaPdfService.generatePdf(
			lote.folhas.map((folha) => ({
				nomeOtica,
				qrCodeUrl,
				codigoFolha: folha.getCodigoFolha(),
			})),
		);

		return {
			buffer,
			filename: `os-folhas-cliente-${clienteId}-lote-${lote.loteId}.pdf`,
			loteId: lote.loteId,
			quantidade: lote.quantidade,
			codigosFolha: lote.folhas.map((f) => f.getCodigoFolha()),
		};
	}
}
