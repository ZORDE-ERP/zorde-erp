import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes } from '@nestjs/common';
import { SolicitarCadastroUseCase } from '../../application/use-cases/solicitar-cadastro.use-case';
import { VerificarEmailUseCase } from '../../application/use-cases/verificar-email.use-case';
import { ReenviarCodigoUseCase } from '../../application/use-cases/reenviar-codigo.use-case';
import { solicitarCadastroSchema } from '../../application/dtos/solicitar-cadastro.dto';
import type { SolicitarCadastroDto } from '../../application/dtos/solicitar-cadastro.dto';
import { verificarEmailSchema } from '../../application/dtos/verificar-email.dto';
import type { VerificarEmailDto } from '../../application/dtos/verificar-email.dto';
import { reenviarCodigoSchema } from '../../application/dtos/reenviar-codigo.dto';
import type { ReenviarCodigoDto } from '../../application/dtos/reenviar-codigo.dto';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';

@Controller('api/auth')
export class SolicitacaoCadastroController {
  constructor(
    private readonly solicitarCadastroUseCase: SolicitarCadastroUseCase,
    private readonly verificarEmailUseCase: VerificarEmailUseCase,
    private readonly reenviarCodigoUseCase: ReenviarCodigoUseCase,
  ) {}

  @Post('solicitar-cadastro')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(solicitarCadastroSchema))
  async solicitarCadastro(@Body() dto: SolicitarCadastroDto) {
    return this.solicitarCadastroUseCase.execute(dto);
  }

  @Post('verificar-email')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(verificarEmailSchema))
  async verificarEmail(@Body() dto: VerificarEmailDto) {
    return this.verificarEmailUseCase.execute(dto);
  }

  @Post('reenviar-codigo')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(reenviarCodigoSchema))
  async reenviarCodigo(@Body() dto: ReenviarCodigoDto) {
    return this.reenviarCodigoUseCase.execute(dto);
  }
}
