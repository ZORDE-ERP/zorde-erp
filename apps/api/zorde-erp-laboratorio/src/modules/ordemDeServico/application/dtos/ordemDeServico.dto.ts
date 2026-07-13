import { z } from 'zod';

export const updateOrderSchema = z.object({
	id: z.coerce.number(),
	codigoOs: z.string().min(1, 'O código da OS é obrigatório'),
	clienteId: z.number().int().positive('clienteId inválido'),
	valor: z.number().positive('O valor deve ser positivo'),
	tabelaMontagemId: z.number().int().positive('tabelaMontagemId inválido').optional(),
});

export const createOrderSchema = z.object({
	codigoOs: z.string().min(1, 'O código da OS é obrigatório'),
	clienteId: z.coerce.number().int().positive('clienteId inválido'),
	valor: z.string().optional(),
	tabelaMontagemId: z.coerce.number().int().positive('tabelaMontagemId inválido').optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderDto = z.infer<typeof updateOrderSchema>;
