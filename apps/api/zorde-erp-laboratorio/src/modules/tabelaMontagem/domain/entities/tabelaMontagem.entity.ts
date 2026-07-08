interface TabelaMontagemProps {
	id?: number | null;
	clienteId: number;
	servicoId: number;
	valor: number;
	createdAt?: Date | null;
	updatedAt?: Date | null;
	deletedAt?: Date | null;
	nomeCliente?: string | null;
	nomeServico?: string | null;
}

export class TabelaMontagemEntity {
	private id?: number | null;
	private clienteId: number;
	private servicoId: number;
	private valor: number;
	private createdAt?: Date | null;
	private updatedAt?: Date | null;
	private deletedAt?: Date | null;
	private nomeCliente?: string | null;
	private nomeServico?: string | null;

	public constructor(props: TabelaMontagemProps) {
		this.id = props.id ?? null;
		this.clienteId = props.clienteId;
		this.servicoId = props.servicoId;
		this.valor = props.valor;
		this.createdAt = props.createdAt ?? null;
		this.updatedAt = props.updatedAt ?? null;
		this.deletedAt = props.deletedAt ?? null;
		this.nomeCliente = props.nomeCliente ?? null;
		this.nomeServico = props.nomeServico ?? null;
	}

	public static create(
		props: Omit<TabelaMontagemProps, 'id' | 'createdAt'> & { id?: number; createdAt?: Date },
	): TabelaMontagemEntity {
		return new TabelaMontagemEntity({
			...props,
			createdAt: props.createdAt || new Date(),
		});
	}

	public getId(): number | null {
		return this.id ?? null;
	}

	public getClienteId(): number {
		return this.clienteId;
	}

	public getServicoId(): number {
		return this.servicoId;
	}

	public getValor(): number {
		return this.valor;
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

	public getNomeCliente(): string | null {
		return this.nomeCliente ?? null;
	}

	public getNomeServico(): string | null {
		return this.nomeServico ?? null;
	}

	public setNomeCliente(nomeCliente: string): void {
		this.nomeCliente = nomeCliente;
	}

	public setNomeServico(nomeServico: string): void {
		this.nomeServico = nomeServico;
	}
}
