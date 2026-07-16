import { z } from 'zod';

export const tabelaMontagemPorQrQuerySchema = z.object({
	token: z.string().min(1, 'token é obrigatório'),
});

export type TabelaMontagemPorQrQueryDto = z.infer<typeof tabelaMontagemPorQrQuerySchema>;
