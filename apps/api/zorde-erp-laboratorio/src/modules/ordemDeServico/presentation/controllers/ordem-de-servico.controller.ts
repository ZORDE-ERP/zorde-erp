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
import { OrdemDeServicoService } from '../../application/services/ordem-de-servico.service';
import { criarOrdemSchema } from '../../application/dtos/criar-ordem.dto';
import type { CriarOrdemDto } from '../../application/dtos/criar-ordem.dto';
import { atualizarOrdemSchema } from '../../application/dtos/atualizar-ordem.dto';
import type { AtualizarOrdemDto } from '../../application/dtos/atualizar-ordem.dto';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';

@Controller('api/ordens-de-servico')
@UseGuards(JwtAuthGuard)
export class OrdemDeServicoController {
  constructor(private readonly ordemDeServicoService: OrdemDeServicoService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(criarOrdemSchema))
  async criar(@Body() dto: CriarOrdemDto, @CurrentUser() user: any) {
    return this.ordemDeServicoService.criar(dto, user.sub);
  }

  @Get()
  async listar(@CurrentUser() user: any) {
    return this.ordemDeServicoService.listarPorUsuario(user.sub);
  }

  @Get(':id')
  async buscarPorId(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.ordemDeServicoService.buscarPorId(id, user.sub);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(atualizarOrdemSchema))
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarOrdemDto,
    @CurrentUser() user: any,
  ) {
    return this.ordemDeServicoService.atualizar(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletar(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    await this.ordemDeServicoService.deletar(id, user.sub);
  }
}
