export interface UsuarioResponseDto {
	id: number;
	email: string;
	nome: string;
	documento: string;
	contato: string;
	senha?: string;
	ativo: boolean;
	tipoUsuario: 'ADMIN' | 'USUARIO';
	ultimoAcesso: Date | null;
	createdAt: Date;
	updatedAt: Date | null;
}
