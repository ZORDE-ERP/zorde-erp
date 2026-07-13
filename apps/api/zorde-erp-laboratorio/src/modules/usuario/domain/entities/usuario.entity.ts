export interface UsuarioProps {
	id?: number;
	email: string;
	senha?: string;
	nome: string;
	documento: string;
	contato: string;
	tipoUsuario: 'ADMIN' | 'USUARIO';
	ultimoAcesso: Date | null;
	createdAt?: Date | null;
	updatedAt?: Date | null;
	ativo?: boolean;
	deletedAt?: Date | null;
}

export class UsuarioEntity {
	private readonly id?: number;
	private readonly email: string;
	private senha?: string;
	private nome: string;
	private documento: string;
	private contato: string;
	private tipoUsuario: 'ADMIN' | 'USUARIO';
	private ultimoAcesso: Date | null;
	private createdAt?: Date | null;
	private updatedAt?: Date | null;
	private ativo?: boolean;
	private deletedAt?: Date | null;

	public constructor(props: UsuarioProps) {
		this.id = props.id;
		this.email = props.email;
		this.senha = props.senha;
		this.nome = props.nome;
		this.documento = props.documento;
		this.contato = props.contato;
		this.tipoUsuario = props.tipoUsuario;
		this.ultimoAcesso = props.ultimoAcesso || null;
		this.ativo = props.ativo;
		this.createdAt = props.createdAt || null;
		this.updatedAt = props.updatedAt || null;
		this.deletedAt = props.deletedAt || null;
	}

	public getId(): number | undefined {
		return this.id;
	}

	public getTipoUsuario(): 'ADMIN' | 'USUARIO' {
		return this.tipoUsuario;
	}

	public getEmail(): string {
		return this.email;
	}

	public getSenha(): string | undefined {
		return this.senha;
	}

	public getNome(): string {
		return this.nome;
	}

	public getDocumento(): string {
		return this.documento;
	}

	public getContato(): string {
		return this.contato;
	}

	public getUltimoAcesso(): Date | null {
		return this.ultimoAcesso;
	}

	public getAtivo(): boolean | undefined {
		return this.ativo;
	}

	public getCreatedAt(): Date | null {
		return this.createdAt ?? null;
	}

	public getUpdatedAt(): Date | null {
		return this.updatedAt ?? null;
	}

	public getDeletedAt(): Date | null {
		return this.deletedAt ?? null;
	}
}
