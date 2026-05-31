import { z } from 'zod';

export const atualizarOrdemSchema = z.object({
  codigoOs: z.string().min(1, 'O código da OS é obrigatório').optional(),
  clienteId: z.number().int().positive('clienteId inválido').optional(),
  valor: z.number().positive('O valor deve ser positivo').optional(),
  tabelaMontagemId: z.number().int().positive('tabelaMontagemId inválido').optional(),
});

export type AtualizarOrdemDto = z.infer<typeof atualizarOrdemSchema>;
