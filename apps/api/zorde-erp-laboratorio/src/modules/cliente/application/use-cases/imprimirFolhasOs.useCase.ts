import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleException, EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IClienteRepository } from '../../domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../domain/repositories/cliente.repository';
import type { IFolhaOsRepository } from '../../domain/repositories/folhaOs.repository';
import { IFOLHA_OS_REPOSITORY } from '../../domain/repositories/folhaOs.repository';
import { OsFolhaPdfService } from '../../infrastructure/services/osFolhaPdf.service';
import { QrCodeImageService } from '../../infrastructure/services/qrCodeImage.service';
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
		private readonly qrCodeImageService: QrCodeImageService,
	) {}

	public async execute(clienteId: number, usuarioId: number, dto: ImpressaoOsDto): Promise<ImprimirFolhasOsResult> {
		const cliente = await this.clienteRepository.findById(clienteId, usuarioId);
		if (!cliente) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		const qrToken = cliente.getQrToken();
		if (!qrToken || !cliente.getQrCodeUrl()) {
			throw new BusinessRuleException('Cliente sem QR Code. Gere o QR antes de imprimir as folhas.');
		}

		const lote = await this.folhaOsRepository.createLoteComFolhas({
			clienteId,
			usuarioId,
			quantidade: dto.quantidade,
		});

		const nomeOtica = cliente.getNomeFantasia() || cliente.getNome();
		const folhasPdf = await Promise.all(
			lote.folhas.map(async (folha) => {
				const codigoFolha = folha.getCodigoFolha();
				const scanUrl = this.qrCodeImageService.buildScanUrl(clienteId, qrToken, codigoFolha);
				const qrCodeDataUrl = await this.qrCodeImageService.generatePngDataUrl(scanUrl);

				return {
					nomeOtica,
					qrCodeDataUrl,
					codigoFolha,
					clienteId: cliente.getId() ?? undefined,
					contato: cliente.getContato() ?? undefined,
					cnpj: cliente.getDocumento() ?? undefined,
					logoUrl: cliente.getLogoUrl() ?? undefined,
					clienteLogoUrl: cliente.getLogoUrl() ?? undefined,
				};
			}),
		);

		const buffer = await this.osFolhaPdfService.generatePdf(folhasPdf);

		return {
			buffer,
			filename: `os-folhas-cliente-${clienteId}-lote-${lote.loteId}.pdf`,
			loteId: lote.loteId,
			quantidade: lote.quantidade,
			codigosFolha: lote.folhas.map((f) => f.getCodigoFolha()),
		};
	}
}
