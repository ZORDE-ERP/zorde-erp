import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UsePipes,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClienteService } from '../../application/services/cliente.service';
import { criarClienteSchema } from '../../application/dtos/criar-cliente.dto';
import type { CriarClienteDto } from '../../application/dtos/criar-cliente.dto';
import { atualizarClienteSchema } from '../../application/dtos/atualizar-cliente.dto';
import type { AtualizarClienteDto } from '../../application/dtos/atualizar-cliente.dto';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';

@Controller('api/clientes')
@UseGuards(JwtAuthGuard)
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(criarClienteSchema))
  async criar(@Body() dto: CriarClienteDto, @CurrentUser() user: any) {
    return this.clienteService.criar(dto, user.sub);
  }

  @Get()
  async listar(@CurrentUser() user: any) {
    return this.clienteService.listarPorUsuario(user.sub);
  }

  @Get(':id')
  async buscarPorId(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.clienteService.buscarPorId(id, user.sub);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(atualizarClienteSchema))
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarClienteDto,
    @CurrentUser() user: any,
  ) {
    return this.clienteService.atualizar(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletar(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    await this.clienteService.deletar(id, user.sub);
  }
}
