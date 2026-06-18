import { z } from 'zod';

export const loginDtoSchema = z.object({
  email: z.email('Email inválido'),
  senha: z.string().min(5, 'A senha deve ter no mínimo 5 caracteres'), // TODO, preciso implementar depois uma validação mais segura para a senha
});

export type LoginDto = z.infer<typeof loginDtoSchema>;