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
	UseGuards,
	UsePipes,
} from '@nestjs/common';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import type { JwtPayload } from '../../../../shared/interfaces/jwt-payload.interface';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import type { AtualizarClienteDto } from '../../application/dtos/atualizar-cliente.dto';
import { atualizarClienteSchema } from '../../application/dtos/atualizar-cliente.dto';
import type { ClienteResponseDto } from '../../application/dtos/cliente-response.dto';
import type { CriarClienteDto } from '../../application/dtos/criar-cliente.dto';
import { criarClienteSchema } from '../../application/dtos/criar-cliente.dto';
import { ClienteService } from '../../application/services/cliente.service';

@Controller('api/clientes')
@UseGuards(JwtAuthGuard)
export class ClienteController {
	public constructor(private readonly clienteService: ClienteService) {}

	@Post()
	@UsePipes(new ZodValidationPipe(criarClienteSchema))
	public async criar(@Body() dto: CriarClienteDto, @CurrentUser() user: JwtPayload): Promise<ClienteResponseDto> {
		return this.clienteService.criar(dto, user.sub);
	}

	@Get()
	public async listar(@CurrentUser() user: JwtPayload): Promise<ClienteResponseDto[]> {
		return this.clienteService.listarPorUsuario(user.sub);
	}

	@Get(':id')
	public async buscarPorId(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: JwtPayload,
	): Promise<ClienteResponseDto> {
		return this.clienteService.buscarPorId(id, user.sub);
	}

	@Put(':id')
	@UsePipes(new ZodValidationPipe(atualizarClienteSchema))
	public async atualizar(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: AtualizarClienteDto,
		@CurrentUser() user: JwtPayload,
	): Promise<ClienteResponseDto> {
		return this.clienteService.atualizar(id, dto, user.sub);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async deletar(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload): Promise<void> {
		await this.clienteService.deletar(id, user.sub);
	}
}
