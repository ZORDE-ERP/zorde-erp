import { z } from 'zod';
import { criarUsuarioSchema } from '../../application/dtos/criar-usuario.dto';

export const createUserSchema = z.object({
  email: z.email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  documento: z.string().min(11, 'O documento deve ter no mínimo 11 caracteres (CPF/CNPJ)'),
  contato: z.string().min(1, 'Contato é obrigatório'),
  tipoUsuario: z.enum(['ADMIN', 'USUARIO'])
});

export type CreateUserDto = z.infer<typeof createUserSchema>;