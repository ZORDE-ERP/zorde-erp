import { Inject, Injectable } from '@nestjs/common';
import { StatusFolhaOs } from '../../../../shared/enums/folha-os.enum';
import { ConflictException, EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IFolhaOsRepository } from '../../domain/repositories/folhaOs.repository';
import { IFOLHA_OS_REPOSITORY } from '../../domain/repositories/folhaOs.repository';
import type { FolhaOsStatusResponseDto } from '../dtos/folhaOsStatus.dto';

@Injectable()
export class BuscarStatusFolhaOsUseCase {
	public constructor(
		@Inject(IFOLHA_OS_REPOSITORY)
		private readonly folhaOsRepository: IFolhaOsRepository,
	) {}

	public async execute(codigoFolha: string, clienteId: number, usuarioId: number): Promise<FolhaOsStatusResponseDto> {
		const folha = await this.folhaOsRepository.findByCodigoFolha(codigoFolha, usuarioId);

		if (!folha || folha.getClienteId() !== clienteId) {
			throw new EntityNotFoundException('Folha de OS não encontrada');
		}

		if (folha.getStatus() === StatusFolhaOs.LANCADA || folha.getStatus() === StatusFolhaOs.CANCELADA) {
			throw new ConflictException('Esta OS impressa já foi lançada');
		}

		return {
			codigoFolha: folha.getCodigoFolha(),
			clienteId: folha.getClienteId(),
			status: folha.getStatus(),
			ordemDeServicoId: folha.getOrdemDeServicoId(),
		};
	}
}
