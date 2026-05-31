import { z } from 'zod';

export const reenviarCodigoSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

export type ReenviarCodigoDto = z.infer<typeof reenviarCodigoSchema>;
