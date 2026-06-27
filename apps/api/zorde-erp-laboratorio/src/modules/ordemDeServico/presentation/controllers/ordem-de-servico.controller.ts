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
import type { AtualizarOrdemDto } from '../../application/dtos/atualizar-ordem.dto';
import { atualizarOrdemSchema } from '../../application/dtos/atualizar-ordem.dto';
import type { CriarOrdemDto } from '../../application/dtos/criar-ordem.dto';
import { criarOrdemSchema } from '../../application/dtos/criar-ordem.dto';
import type { OrdemDeServicoResponseDto } from '../../application/dtos/ordem-de-servico-response.dto';
import { OrdemDeServicoService } from '../../application/services/ordem-de-servico.service';

@Controller('api/ordens-de-servico')
@UseGuards(JwtAuthGuard)
export class OrdemDeServicoController {
	public constructor(private readonly ordemDeServicoService: OrdemDeServicoService) {}

	@Post()
	@UsePipes(new ZodValidationPipe(criarOrdemSchema))
	public async criar(@Body() dto: CriarOrdemDto, @CurrentUser() user: JwtPayload): Promise<OrdemDeServicoResponseDto> {
		return this.ordemDeServicoService.criar(dto, user.sub);
	}

	@Get()
	public async listar(@CurrentUser() user: JwtPayload): Promise<OrdemDeServicoResponseDto[]> {
		return this.ordemDeServicoService.listarPorUsuario(user.sub);
	}

	@Get(':id')
	public async buscarPorId(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: JwtPayload,
	): Promise<OrdemDeServicoResponseDto> {
		return this.ordemDeServicoService.buscarPorId(id, user.sub);
	}

	@Put(':id')
	@UsePipes(new ZodValidationPipe(atualizarOrdemSchema))
	public async atualizar(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: AtualizarOrdemDto,
		@CurrentUser() user: JwtPayload,
	): Promise<OrdemDeServicoResponseDto> {
		return this.ordemDeServicoService.atualizar(id, dto, user.sub);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async deletar(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload): Promise<void> {
		await this.ordemDeServicoService.deletar(id, user.sub);
	}
}
