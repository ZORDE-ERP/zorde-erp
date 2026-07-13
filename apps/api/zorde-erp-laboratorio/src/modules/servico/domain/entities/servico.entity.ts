interface ServicoProps {
	id?: number | null;
	usuarioId: number;
	nome: string;
	descricao?: string | null;
	createdAt?: Date | null;
	updatedAt?: Date | null;
}

export class ServicoEntity {
	private id?: number | null;
	private usuarioId: number;
	private nome: string;
	private descricao?: string | null;
	private createdAt?: Date | null;
	private updatedAt?: Date | null;

	public constructor(props: ServicoProps) {
		this.id = props.id ?? null;
		this.usuarioId = props.usuarioId;
		this.nome = props.nome;
		this.descricao = props.descricao ?? null;
		this.createdAt = props.createdAt ?? null;
		this.updatedAt = props.updatedAt ?? null;
	}

	public getId(): number | null {
		return this.id ?? null;
	}

	public getUsuarioId(): number {
		return this.usuarioId;
	}

	public getNome(): string {
		return this.nome;
	}

	public getDescricao(): string | null {
		return this.descricao ?? null;
	}

	public getCreatedAt(): Date | null {
		return this.createdAt ?? null;
	}

	public getUpdatedAt(): Date | null {
		return this.updatedAt ?? null;
	}
}
