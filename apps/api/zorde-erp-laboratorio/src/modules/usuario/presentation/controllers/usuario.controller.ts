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
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuardStrategy } from 'src/modules/auth/presentation/guards/jwtAuth.guard';
import { Public } from 'src/shared/decorators/publicRoutes.decorator';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import {
	type AtualizarUsuarioDto,
	atualizarUsuarioSchema,
	type CriarUsuarioDto,
	criarUsuarioSchema,
} from '../../application/dtos/usuario.dto';
import type { UsuarioResponseDto } from '../../application/dtos/usuarioResponse.dto';
import { UsuarioService } from '../../application/services/usuario.service';

@Controller('api/usuarios')
export class UsuarioController {
	public constructor(private readonly usuarioService: UsuarioService) {}

	@Public()
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async criar(@Body(new ZodValidationPipe(criarUsuarioSchema)) dto: CriarUsuarioDto): Promise<UsuarioResponseDto> {
		return this.usuarioService.criar(dto);
	}

	@Get()
	@UseGuards(JwtAuthGuardStrategy)
	public async handleFindByEmail(@Query('email') email: string): Promise<UsuarioResponseDto | null> {
		const result = await this.usuarioService.findByEmail(email);
		return result;
	}

	@Put(':id')
	@UseGuards(JwtAuthGuardStrategy)
	public async atualizar(
		@Param('id', ParseIntPipe) id: number,
		@Body(new ZodValidationPipe(atualizarUsuarioSchema)) dto: AtualizarUsuarioDto,
	): Promise<UsuarioResponseDto> {
		return this.usuarioService.atualizar(id, dto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuardStrategy)
	@HttpCode(HttpStatus.NO_CONTENT)
	public async deletar(@Param('id', ParseIntPipe) id: number): Promise<void> {
		await this.usuarioService.deletar(id);
	}
}
