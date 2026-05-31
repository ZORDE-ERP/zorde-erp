import { z } from 'zod';

export const criarUsuarioSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  documento: z.string().min(11, 'O documento deve ter no mínimo 11 caracteres (CPF/CNPJ)'),
  contato: z.string().min(1, 'Contato é obrigatório'),
});

export type TCriarUsuario = z.infer<typeof criarUsuarioSchema>;

export class CriarUsuarioDto {
  email: string;
  senha: string;
  nome: string;
  documento: string;
  contato: string;
}
