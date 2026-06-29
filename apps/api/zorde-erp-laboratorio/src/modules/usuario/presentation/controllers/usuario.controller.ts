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
	UsePipes,
} from '@nestjs/common';
import { JwtAuthGuardStrategy } from 'src/modules/auth/presentation/guards/jwtAuth.guard';
import { Public } from 'src/shared/decorators/publicRoutes.decorator';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import { type AtualizarUsuarioDto, atualizarUsuarioSchema } from '../../application/dtos/atualizar-usuario.dto';
import type { UsuarioResponseDto } from '../../application/dtos/usuario-response.dto';
import { UsuarioService } from '../../application/services/usuario.service';
import { type CreateUserDto, createUserSchema } from '../dto/userDto';

@Controller('api/usuarios')
export class UsuarioController {
	public constructor(private readonly usuarioService: UsuarioService) {}

	@Public()
	@Post()
	@HttpCode(HttpStatus.CREATED)
	@UsePipes(new ZodValidationPipe(createUserSchema))
	public async criar(@Body() dto: CreateUserDto): Promise<UsuarioResponseDto> {
		return this.usuarioService.criar(dto);
	}

	@Get()
	@UseGuards(JwtAuthGuardStrategy)
	public async handleFindByEmail(@Query('email') email: string): Promise<UsuarioResponseDto | null> {
		return this.usuarioService.findByEmail(email);
	}

	@Put(':id')
	@UseGuards(JwtAuthGuardStrategy)
	@UsePipes(new ZodValidationPipe(atualizarUsuarioSchema))
	public async atualizar(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: AtualizarUsuarioDto,
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
