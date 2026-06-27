import { z } from 'zod';

export const criarOrdemSchema = z.object({
	codigoOs: z.string().min(1, 'O código da OS é obrigatório'),
	clienteId: z.number().int().positive('clienteId inválido'),
	valor: z.number().positive('O valor deve ser positivo').optional(),
	tabelaMontagemId: z.number().int().positive('tabelaMontagemId inválido').optional(),
});

export type CriarOrdemDto = z.infer<typeof criarOrdemSchema>;
