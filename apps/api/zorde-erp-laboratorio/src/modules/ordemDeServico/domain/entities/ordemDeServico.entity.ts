import type { ClienteEntity } from '../../../cliente/domain/entities/cliente.entity';
import type { TabelaMontagemEntity } from '../../../tabelaMontagem/domain/entities/tabela-montagem.entity';

interface ServiceOrderProps {
	id?: number | null;
	codigoOs: string;
	clienteId: number;
	valor?: string | null;
	tabelaMontagemId?: number | null;
	usuarioId: number;
	createdAt?: Date | null;
	updatedAt?: Date | null;
	deletedAt?: Date | null;
	cliente?: ClienteEntity;
	tabelaMontagem?: TabelaMontagemEntity;
}

export class ServiceOrderEntity {
	private id?: number | null;
	private codigoOs: string;
	private clienteId: number;
	private valor?: string | null;
	private tabelaMontagemId?: number | null;
	private usuarioId: number;
	private createdAt?: Date | null;
	private updatedAt?: Date | null;
	private deletedAt?: Date | null;
	private cliente?: ClienteEntity;
	private tabelaMontagem?: TabelaMontagemEntity;

	public constructor(props: ServiceOrderProps) {
		this.id = props.id ?? null;
		this.codigoOs = props.codigoOs;
		this.clienteId = props.clienteId;
		this.valor = props.valor ?? null;
		this.tabelaMontagemId = props.tabelaMontagemId ?? null;
		this.usuarioId = props.usuarioId;
		this.createdAt = props.createdAt ?? null;
		this.updatedAt = props.updatedAt ?? null;
		this.deletedAt = props.deletedAt ?? null;
		this.cliente = props.cliente;
		this.tabelaMontagem = props.tabelaMontagem;
	}

	public getId(): number | null {
		return this.id ?? null;
	}

	public getCodigoOs(): string {
		return this.codigoOs;
	}

	public getClienteId(): number {
		return this.clienteId;
	}

	public getValor(): string | null {
		return this.valor ?? null;
	}

	public getTabelaMontagemId(): number | null {
		return this.tabelaMontagemId ?? null;
	}

	public getUsuarioId(): number {
		return this.usuarioId;
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

	public getCliente(): ClienteEntity | null {
		return this.cliente ?? null;
	}

	public getTabelaMontagem(): TabelaMontagemEntity | null {
		return this.tabelaMontagem ?? null;
	}

	public setCliente(cliente: ClienteEntity): void {
		this.cliente = cliente;
	}

	public setTabelaMontagem(tabelaMontagem: TabelaMontagemEntity): void {
		this.tabelaMontagem = tabelaMontagem;
	}
}
