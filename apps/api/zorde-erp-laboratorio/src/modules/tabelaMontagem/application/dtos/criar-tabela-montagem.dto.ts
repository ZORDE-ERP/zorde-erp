import { z } from 'zod';
import { TipoServico } from '../../../../shared/enums/tipo-servico.enum';

export const criarTabelaMontagemSchema = z.object({
  clienteId: z.number().int().positive('clienteId deve ser um número inteiro positivo'),
  servico: z.nativeEnum(TipoServico, {
    message: 'Serviço inválido. Valores aceitos: MONTAGEM SIMPLES, PARAFUSO, TRANSPOSICAO, COLORACAO, SOMENTE ENCAIXAR',
  }),
  valor: z.number().positive('O valor deve ser um número positivo'),
});

export type CriarTabelaMontagemDto = z.infer<typeof criarTabelaMontagemSchema>;
