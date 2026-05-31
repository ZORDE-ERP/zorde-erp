import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TabelaMontagemService } from '../../application/services/tabela-montagem.service';
import { criarTabelaMontagemSchema } from '../../application/dtos/criar-tabela-montagem.dto';
import type { CriarTabelaMontagemDto } from '../../application/dtos/criar-tabela-montagem.dto';
import { atualizarTabelaMontagemSchema } from '../../application/dtos/atualizar-tabela-montagem.dto';
import type { AtualizarTabelaMontagemDto } from '../../application/dtos/atualizar-tabela-montagem.dto';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { z } from 'zod';

const listarQuerySchema = z.object({
  page: z.preprocess((val) => Number(val || 1), z.number().int().min(1)).default(1),
  limit: z.preprocess((val) => Number(val || 10), z.number().int().min(1)).default(10),
  search: z.string().optional().default(''),
});

type ListarQueryDto = z.infer<typeof listarQuerySchema>;

@Controller('api/tabela-montagem')
@UseGuards(JwtAuthGuard)
export class TabelaMontagemController {
  constructor(private readonly tabelaMontagemService: TabelaMontagemService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(criarTabelaMontagemSchema))
  async criar(@Body() dto: CriarTabelaMontagemDto, @CurrentUser() user: any) {
    return this.tabelaMontagemService.criar(dto, user.sub);
  }

  @Get()
  @UsePipes(new ZodValidationPipe(listarQuerySchema))
  async listar(@Query() query: ListarQueryDto, @CurrentUser() user: any) {
    return this.tabelaMontagemService.listarPaginado(query, user.sub);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(atualizarTabelaMontagemSchema))
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarTabelaMontagemDto,
    @CurrentUser() user: any,
  ) {
    return this.tabelaMontagemService.atualizar(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletar(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    await this.tabelaMontagemService.deletar(id, user.sub);
  }
}
