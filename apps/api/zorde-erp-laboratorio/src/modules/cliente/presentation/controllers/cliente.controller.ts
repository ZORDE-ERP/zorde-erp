import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import type { UserInfo } from 'src/shared/interfaces/user.interface';
import { User } from '../../../../shared/decorators/user.decorator';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import {
	type AtualizarClienteDto,
	atualizarClienteSchema,
	type CriarClienteDto,
	criarClienteSchema,
} from '../../application/dtos/cliente.dto';
import type { ClienteQrCodeResponseDto } from '../../application/dtos/clienteQrCodeResponse.dto';
import type { ClienteResponseDto } from '../../application/dtos/clienteResponse.dto';
import {
	type TabelaMontagemPorQrQueryDto,
	tabelaMontagemPorQrQuerySchema,
} from '../../application/dtos/tabelaMontagemPorQr.dto';
import { ClienteService } from '../../application/services/cliente.service';
import type { TabelaMontagemPorQrItemDto } from '../../application/use-cases/listarTabelaMontagemPorQr.useCase';

@Controller('api/clientes')
export class ClienteController {
	public constructor(private readonly clientService: ClienteService) {}

	@Post()
	public async criar(
		@Body(new ZodValidationPipe(criarClienteSchema)) body: CriarClienteDto,
		@User() user: UserInfo,
	): Promise<ClienteResponseDto | null> {
		return this.clientService.create(body, user.userId);
	}

	@Get()
	public async listar(@User() user: UserInfo): Promise<ClienteResponseDto[]> {
		return this.clientService.findByUsuarioId(user.userId);
	}

	@Post(':id/qrcode')
	public async gerarQrCode(
		@Param('id', ParseIntPipe) id: number,
		@User() user: UserInfo,
	): Promise<ClienteQrCodeResponseDto> {
		return this.clientService.gerarQrCode(id, user.userId);
	}

	@Get(':id/tabela-montagem')
	public async listarTabelaMontagemPorQr(
		@Param('id', ParseIntPipe) id: number,
		@Query(new ZodValidationPipe(tabelaMontagemPorQrQuerySchema)) query: TabelaMontagemPorQrQueryDto,
		@User() user: UserInfo,
	): Promise<{ clienteId: number; itens: TabelaMontagemPorQrItemDto[] }> {
		return this.clientService.listarTabelaMontagemPorQr(id, query.token, user.userId);
	}

	@Get(':id')
	public async buscarPorId(@Param('id', ParseIntPipe) id: number, @User() user: UserInfo): Promise<ClienteResponseDto> {
		return this.clientService.findById(id, user.userId);
	}

	@Put()
	public async atualizar(
		@Body(new ZodValidationPipe(atualizarClienteSchema)) body: AtualizarClienteDto,
		@User() user: UserInfo,
	): Promise<ClienteResponseDto> {
		return this.clientService.update(body, user.userId);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async delete(@Param('id', ParseIntPipe) id: number, @User() user: UserInfo): Promise<void> {
		await this.clientService.delete(id, user.userId);
	}
}
