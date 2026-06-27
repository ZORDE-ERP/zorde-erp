import { z } from 'zod';

export const verificarEmailSchema = z.object({
	email: z.string().email('E-mail inválido'),
	codigo: z.string().length(6, 'O código deve ter exatamente 6 dígitos'),
});

export type VerificarEmailDto = z.infer<typeof verificarEmailSchema>;
