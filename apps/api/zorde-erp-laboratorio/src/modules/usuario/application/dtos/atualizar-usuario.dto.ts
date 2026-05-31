import { z } from 'zod';
import { criarUsuarioSchema } from './criar-usuario.dto';

export const atualizarUsuarioSchema = criarUsuarioSchema.partial();

export type TAtualizarUsuario = z.infer<typeof atualizarUsuarioSchema>;

export class AtualizarUsuarioDto {
  email?: string;
  senha?: string;
  nome?: string;
  documento?: string;
  contato?: string;
}
