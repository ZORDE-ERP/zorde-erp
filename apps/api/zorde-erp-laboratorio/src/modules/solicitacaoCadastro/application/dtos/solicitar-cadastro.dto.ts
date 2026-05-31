import { z } from 'zod';

export const solicitarCadastroSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

export type SolicitarCadastroDto = z.infer<typeof solicitarCadastroSchema>;
