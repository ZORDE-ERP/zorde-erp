import { z } from 'zod';
import { TipoServico } from '../../../../shared/enums/tipo-servico.enum';

export const createTabelaMontagemSchema = z.object({
	clienteId: z.coerce.number().int().positive('clienteId deve ser um número inteiro positivo'),
	servico: z.enum(TipoServico, {
		message: 'Serviço inválido. Valores aceitos: MONTAGEM SIMPLES, PARAFUSO, TRANSPOSICAO, COLORACAO, SOMENTE ENCAIXAR',
	}),
	valor: z.coerce.number().positive('O valor deve ser um número positivo'),
});

export const updateTabelaMontagemSchema = z.object({
	clienteId: z.coerce.number().int().positive().optional(),
	servico: z
		.enum(TipoServico, {
			message: 'Serviço inválido. Valores aceitos: MONTAGEM SIMPLES, PARAFUSO, TRANSPOSICAO, COLORACAO, SOMENTE ENCAIXAR',
		})
		.optional(),
	valor: z.coerce.number().positive('O valor deve ser um número positivo').optional(),
});

export const listTabelaMontagemQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).default(10),
	search: z.string().optional().default(''),
});

export type CreateTabelaMontagemDto = z.infer<typeof createTabelaMontagemSchema>;
export type UpdateTabelaMontagemDto = z.infer<typeof updateTabelaMontagemSchema>;
export type ListTabelaMontagemQueryDto = z.infer<typeof listTabelaMontagemQuerySchema>;
