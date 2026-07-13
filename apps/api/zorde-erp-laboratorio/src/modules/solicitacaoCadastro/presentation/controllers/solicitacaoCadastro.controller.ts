import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes } from '@nestjs/common';
import { Public } from '../../../../shared/decorators/publicRoutes.decorator';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import type { ReenviarCodigoDto } from '../../application/dtos/reenviarCodigo.dto';
import { reenviarCodigoSchema } from '../../application/dtos/reenviarCodigo.dto';
import type { SolicitarCadastroDto } from '../../application/dtos/solicitarCadastro.dto';
import { solicitarCadastroSchema } from '../../application/dtos/solicitarCadastro.dto';
import type { VerificarEmailDto } from '../../application/dtos/verificarEmail.dto';
import { verificarEmailSchema } from '../../application/dtos/verificarEmail.dto';
import { ReenviarCodigoUseCase } from '../../application/use-cases/reenviarCodigo.useCase';
import { SolicitarCadastroUseCase } from '../../application/use-cases/solicitarCadastro.useCase';
import { VerificarEmailUseCase } from '../../application/use-cases/verificarEmail.useCase';

@Controller('api/auth')
export class SolicitacaoCadastroController {
	public constructor(
		private readonly solicitarCadastroUseCase: SolicitarCadastroUseCase,
		private readonly verificarEmailUseCase: VerificarEmailUseCase,
		private readonly reenviarCodigoUseCase: ReenviarCodigoUseCase,
	) {}

	@Public()
	@Post('solicitar-cadastro')
	@HttpCode(HttpStatus.OK)
	@UsePipes(new ZodValidationPipe(solicitarCadastroSchema))
	public async solicitarCadastro(@Body() dto: SolicitarCadastroDto): Promise<{ message: string }> {
		return this.solicitarCadastroUseCase.execute(dto);
	}

	@Public()
	@Post('verificar-email')
	@HttpCode(HttpStatus.OK)
	@UsePipes(new ZodValidationPipe(verificarEmailSchema))
	public async verificarEmail(@Body() dto: VerificarEmailDto): Promise<{ success: boolean; message: string }> {
		return this.verificarEmailUseCase.execute(dto);
	}

	@Public()
	@Post('reenviar-codigo')
	@HttpCode(HttpStatus.OK)
	@UsePipes(new ZodValidationPipe(reenviarCodigoSchema))
	public async reenviarCodigo(@Body() dto: ReenviarCodigoDto): Promise<{ message: string }> {
		return this.reenviarCodigoUseCase.execute(dto);
	}
}
