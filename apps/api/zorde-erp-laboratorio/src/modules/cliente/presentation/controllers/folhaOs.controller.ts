import { Controller, Get, Query } from '@nestjs/common';
import type { UserInfo } from 'src/shared/interfaces/user.interface';
import { User } from '../../../../shared/decorators/user.decorator';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import {
	type FolhaOsStatusQueryDto,
	type FolhaOsStatusResponseDto,
	folhaOsStatusQuerySchema,
} from '../../application/dtos/folhaOsStatus.dto';
import { ClienteService } from '../../application/services/cliente.service';

@Controller('api/folhas-os')
export class FolhaOsController {
	public constructor(private readonly clientService: ClienteService) {}

	@Get('por-codigo')
	public async buscarStatusPorCodigo(
		@Query(new ZodValidationPipe(folhaOsStatusQuerySchema)) query: FolhaOsStatusQueryDto,
		@User() user: UserInfo,
	): Promise<FolhaOsStatusResponseDto> {
		return this.clientService.buscarStatusFolhaOs(query.codigoFolha, query.clienteId, user.userId);
	}
}
