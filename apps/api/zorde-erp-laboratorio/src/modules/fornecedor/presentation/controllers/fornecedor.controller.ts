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
import { FornecedorService } from '../../application/services/fornecedor.service';
import { criarFornecedorSchema } from '../../application/dtos/criar-fornecedor.dto';
import type { CriarFornecedorDto } from '../../application/dtos/criar-fornecedor.dto';
import { atualizarFornecedorSchema } from '../../application/dtos/atualizar-fornecedor.dto';
import type { AtualizarFornecedorDto } from '../../application/dtos/atualizar-fornecedor.dto';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';

@Controller('api/fornecedores')
@UseGuards(JwtAuthGuard)
export class FornecedorController {
  constructor(private readonly fornecedorService: FornecedorService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(criarFornecedorSchema))
  async criar(@Body() dto: CriarFornecedorDto, @CurrentUser() user: any) {
    return this.fornecedorService.criar(dto, user.sub);
  }

  @Get()
  async listar(@CurrentUser() user: any) {
    return this.fornecedorService.listarPorUsuario(user.sub);
  }

  @Get(':id')
  async buscarPorId(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.fornecedorService.buscarPorId(id, user.sub);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(atualizarFornecedorSchema))
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarFornecedorDto,
    @CurrentUser() user: any,
  ) {
    return this.fornecedorService.atualizar(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletar(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    await this.fornecedorService.deletar(id, user.sub);
  }
}
