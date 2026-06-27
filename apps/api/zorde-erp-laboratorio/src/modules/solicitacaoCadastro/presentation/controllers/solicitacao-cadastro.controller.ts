import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import type { ReenviarCodigoDto } from '../../application/dtos/reenviar-codigo.dto';
import { reenviarCodigoSchema } from '../../application/dtos/reenviar-codigo.dto';
import type { SolicitarCadastroDto } from '../../application/dtos/solicitar-cadastro.dto';
import { solicitarCadastroSchema } from '../../application/dtos/solicitar-cadastro.dto';
import type { VerificarEmailDto } from '../../application/dtos/verificar-email.dto';
import { verificarEmailSchema } from '../../application/dtos/verificar-email.dto';
import { ReenviarCodigoUseCase } from '../../application/use-cases/reenviar-codigo.use-case';
import { SolicitarCadastroUseCase } from '../../application/use-cases/solicitar-cadastro.use-case';
import { VerificarEmailUseCase } from '../../application/use-cases/verificar-email.use-case';

@Controller('api/auth')
export class SolicitacaoCadastroController {
	public constructor(
		private readonly solicitarCadastroUseCase: SolicitarCadastroUseCase,
		private readonly verificarEmailUseCase: VerificarEmailUseCase,
		private readonly reenviarCodigoUseCase: ReenviarCodigoUseCase,
	) {}

	@Post('solicitar-cadastro')
	@HttpCode(HttpStatus.OK)
	@UsePipes(new ZodValidationPipe(solicitarCadastroSchema))
	public async solicitarCadastro(@Body() dto: SolicitarCadastroDto): Promise<{ message: string }> {
		return this.solicitarCadastroUseCase.execute(dto);
	}

	@Post('verificar-email')
	@HttpCode(HttpStatus.OK)
	@UsePipes(new ZodValidationPipe(verificarEmailSchema))
	public async verificarEmail(@Body() dto: VerificarEmailDto): Promise<{ success: boolean; message: string }> {
		return this.verificarEmailUseCase.execute(dto);
	}

	@Post('reenviar-codigo')
	@HttpCode(HttpStatus.OK)
	@UsePipes(new ZodValidationPipe(reenviarCodigoSchema))
	public async reenviarCodigo(@Body() dto: ReenviarCodigoDto): Promise<{ message: string }> {
		return this.reenviarCodigoUseCase.execute(dto);
	}
}
