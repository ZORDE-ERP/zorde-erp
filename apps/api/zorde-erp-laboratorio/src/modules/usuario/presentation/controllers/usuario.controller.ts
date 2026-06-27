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
  Query,
} from '@nestjs/common';
import { UsuarioService } from '../../application/services/usuario.service';
import { AtualizarUsuarioDto, atualizarUsuarioSchema } from '../../application/dtos/atualizar-usuario.dto';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import { createUserSchema } from '../dto/userDto';
import type { CreateUserDto } from '../dto/userDto';
import { JwtAuthGuardStrategy } from 'src/modules/auth/presentation/guards/jwtAuth.guard';

@Controller('api/usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async criar(@Body() dto: CreateUserDto) {
    return this.usuarioService.criar(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuardStrategy)
  async handleFindByEmail(@Query('email') email: string) {
    return this.usuarioService.findByEmail(email);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuardStrategy)
  @UsePipes(new ZodValidationPipe(atualizarUsuarioSchema))
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarUsuarioDto,
  ) {
    return this.usuarioService.atualizar(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardStrategy)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletar(@Param('id', ParseIntPipe) id: number) {
    await this.usuarioService.deletar(id);
  }
}
