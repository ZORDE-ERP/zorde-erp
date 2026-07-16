import { z } from 'zod';

export const impressaoOsSchema = z.object({
	quantidade: z.coerce
		.number()
		.int('quantidade deve ser inteiro')
		.min(1, 'quantidade mínima é 1')
		.max(1000, 'quantidade máxima é 1000'),
});

export type ImpressaoOsDto = z.infer<typeof impressaoOsSchema>;
