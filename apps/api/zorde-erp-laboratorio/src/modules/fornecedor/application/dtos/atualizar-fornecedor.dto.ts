import { z } from 'zod';
import { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';
import { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';

export const atualizarFornecedorSchema = z
  .object({
    nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').optional(),
    email: z.string().email('E-mail inválido').optional(),
    contato: z.string().optional(),
    tipoPessoa: z.nativeEnum(TipoPessoa).optional(),
    documento: z.string().optional(),
    status: z.nativeEnum(StatusPessoa).optional(),
    cep: z.string().optional(),
    uf: z.string().optional(),
    cidade: z.string().optional(),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    observacao: z.string().optional(),
  });

export type AtualizarFornecedorDto = z.infer<typeof atualizarFornecedorSchema>;
