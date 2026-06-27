import { z } from 'zod';
import { TipoServico } from '../../../../shared/enums/tipo-servico.enum';

export const atualizarTabelaMontagemSchema = z.object({
	clienteId: z.number().int().positive().optional(),
	servico: z
		.nativeEnum(TipoServico, {
			message: 'Serviço inválido. Valores aceitos: MONTAGEM SIMPLES, PARAFUSO, TRANSPOSICAO, COLORACAO, SOMENTE ENCAIXAR',
		})
		.optional(),
	valor: z.number().positive('O valor deve ser um número positivo').optional(),
});

export type AtualizarTabelaMontagemDto = z.infer<typeof atualizarTabelaMontagemSchema>;
