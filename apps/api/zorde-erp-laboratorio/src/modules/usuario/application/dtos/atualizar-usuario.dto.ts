import type { z } from 'zod';
import { criarUsuarioSchema } from './criar-usuario.dto';

export const atualizarUsuarioSchema = criarUsuarioSchema.partial();

export type TAtualizarUsuario = z.infer<typeof atualizarUsuarioSchema>;

export class AtualizarUsuarioDto {
	public email?: string;
	public senha?: string;
	public nome?: string;
	public documento?: string;
	public contato?: string;
}
