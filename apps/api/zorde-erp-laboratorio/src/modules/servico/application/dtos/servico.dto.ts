import { z } from 'zod';

export const createServicoSchema = z.object({
	nome: z.string().min(1, 'O nome é obrigatório'),
	descricao: z.string().optional(),
});

export const updateServicoSchema = z.object({
	nome: z.string().min(1, 'O nome é obrigatório').optional(),
	descricao: z.string().optional(),
});

export const listServicoQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).default(10),
	search: z.string().optional().default(''),
});

export type CreateServicoDto = z.infer<typeof createServicoSchema>;
export type UpdateServicoDto = z.infer<typeof updateServicoSchema>;
export type ListServicoQueryDto = z.infer<typeof listServicoQuerySchema>;
