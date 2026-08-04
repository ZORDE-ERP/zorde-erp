import {
	Body,
	Controller,
	Delete,
	Get,
	Header,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	Res,
	StreamableFile,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { UserInfo } from 'src/shared/interfaces/user.interface';
import { User } from '../../../../shared/decorators/user.decorator';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import {
	type AtualizarClienteDto,
	atualizarClienteSchema,
	type CriarClienteDto,
	criarClienteSchema,
	type ListClienteQueryDto,
	listClienteQuerySchema,
} from '../../application/dtos/cliente.dto';
import type { ClienteQrCodeResponseDto } from '../../application/dtos/clienteQrCodeResponse.dto';
import type { ClienteResponseDto } from '../../application/dtos/clienteResponse.dto';
import { type ImpressaoOsDto, impressaoOsSchema } from '../../application/dtos/impressaoOs.dto';
import {
	type TabelaMontagemPorQrQueryDto,
	tabelaMontagemPorQrQuerySchema,
} from '../../application/dtos/tabelaMontagemPorQr.dto';
import { ClienteService } from '../../application/services/cliente.service';
import type { ListClientesResult } from '../../application/use-cases/listarClientes.useCase';
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
	public async listar(
		@Query(new ZodValidationPipe(listClienteQuerySchema)) query: ListClienteQueryDto,
		@User() user: UserInfo,
	): Promise<ListClientesResult> {
		return this.clientService.listar(query, user.userId);
	}

	@Post(':id/qrcode')
	public async gerarQrCode(
		@Param('id', ParseIntPipe) id: number,
		@User() user: UserInfo,
	): Promise<ClienteQrCodeResponseDto> {
		return this.clientService.gerarQrCode(id, user.userId);
	}

	@Post(':id/logo')
	@UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }))
	public async uploadLogo(
		@Param('id', ParseIntPipe) id: number,
		@UploadedFile() file: { buffer: Buffer; mimetype: string; size: number } | undefined,
		@User() user: UserInfo,
	): Promise<ClienteResponseDto> {
		return this.clientService.uploadLogo(id, user.userId, {
			buffer: file?.buffer ?? Buffer.alloc(0),
			mimetype: file?.mimetype ?? '',
			size: file?.size ?? 0,
		});
	}

	@Delete(':id/logo')
	public async removerLogo(@Param('id', ParseIntPipe) id: number, @User() user: UserInfo): Promise<ClienteResponseDto> {
		return this.clientService.removerLogo(id, user.userId);
	}

	@Post(':id/impressao-os')
	@Header('Content-Type', 'application/pdf')
	public async imprimirFolhasOs(
		@Param('id', ParseIntPipe) id: number,
		@Body(new ZodValidationPipe(impressaoOsSchema)) body: ImpressaoOsDto,
		@User() user: UserInfo,
		@Res({ passthrough: true }) res: Response,
	): Promise<StreamableFile> {
		const result = await this.clientService.imprimirFolhasOs(id, user.userId, body);
		res.setHeader('X-Lote-Id', String(result.loteId));
		res.setHeader('X-Quantidade-Folhas', String(result.quantidade));
		res.setHeader('X-Codigo-Folha', result.codigosFolha[0] ?? '');
		res.setHeader('Access-Control-Expose-Headers', 'X-Lote-Id, X-Quantidade-Folhas, X-Codigo-Folha');
		return new StreamableFile(result.buffer, {
			type: 'application/pdf',
			disposition: `attachment; filename="${result.filename}"`,
		});
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
