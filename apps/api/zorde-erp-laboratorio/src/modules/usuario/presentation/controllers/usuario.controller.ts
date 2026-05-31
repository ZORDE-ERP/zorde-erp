import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ParseIntPipe,
} from '@nestjs/common';
import { UsuarioService } from '../../application/services/usuario.service';
import { CriarUsuarioDto, criarUsuarioSchema } from '../../application/dtos/criar-usuario.dto';
import { AtualizarUsuarioDto, atualizarUsuarioSchema } from '../../application/dtos/atualizar-usuario.dto';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';

@Controller('api/usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(criarUsuarioSchema))
  async criar(@Body() dto: CriarUsuarioDto) {
    return this.usuarioService.criar(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listar() {
    return this.usuarioService.listar();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(atualizarUsuarioSchema))
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarUsuarioDto,
  ) {
    return this.usuarioService.atualizar(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletar(@Param('id', ParseIntPipe) id: number) {
    await this.usuarioService.deletar(id);
  }
}
