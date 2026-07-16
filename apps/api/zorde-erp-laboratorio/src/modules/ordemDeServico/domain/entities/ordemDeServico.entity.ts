import type { ClienteEntity } from '../../../cliente/domain/entities/cliente.entity';
import type { OrigemOrdemServico, OrigemValorItem, StatusOrdemServico } from '../../../../shared/enums/ordem-de-servico.enum';

export interface ServiceOrderItemProps {
	id?: number | null;
	tabelaMontagemId?: number | null;
	descricaoManual?: string | null;
	quantidade: number;
	valorUnitario: number;
	valorTotal: number;
	origemValor: OrigemValorItem;
	nomeServico?: string | null;
}

export class ServiceOrderItemEntity {
	private id?: number | null;
	private tabelaMontagemId?: number | null;
	private descricaoManual?: string | null;
	private quantidade: number;
	private valorUnitario: number;
	private valorTotal: number;
	private origemValor: OrigemValorItem;
	private nomeServico?: string | null;

	public constructor(props: ServiceOrderItemProps) {
		this.id = props.id ?? null;
		this.tabelaMontagemId = props.tabelaMontagemId ?? null;
		this.descricaoManual = props.descricaoManual ?? null;
		this.quantidade = props.quantidade;
		this.valorUnitario = props.valorUnitario;
		this.valorTotal = props.valorTotal;
		this.origemValor = props.origemValor;
		this.nomeServico = props.nomeServico ?? null;
	}

	public getId(): number | null {
		return this.id ?? null;
	}

	public getTabelaMontagemId(): number | null {
		return this.tabelaMontagemId ?? null;
	}

	public getDescricaoManual(): string | null {
		return this.descricaoManual ?? null;
	}

	public getQuantidade(): number {
		return this.quantidade;
	}

	public getValorUnitario(): number {
		return this.valorUnitario;
	}

	public getValorTotal(): number {
		return this.valorTotal;
	}

	public getOrigemValor(): OrigemValorItem {
		return this.origemValor;
	}

	public getNomeServico(): string | null {
		return this.nomeServico ?? null;
	}
}

interface ServiceOrderProps {
	id?: number | null;
	codigoOs: string;
	clienteId: number;
	usuarioId: number;
	valorTotal: number;
	status: StatusOrdemServico;
	origem: OrigemOrdemServico;
	observacao?: string | null;
	createdAt?: Date | null;
	updatedAt?: Date | null;
	deletedAt?: Date | null;
	cliente?: ClienteEntity;
	itens?: ServiceOrderItemEntity[];
}

export class ServiceOrderEntity {
	private id?: number | null;
	private codigoOs: string;
	private clienteId: number;
	private usuarioId: number;
	private valorTotal: number;
	private status: StatusOrdemServico;
	private origem: OrigemOrdemServico;
	private observacao?: string | null;
	private createdAt?: Date | null;
	private updatedAt?: Date | null;
	private deletedAt?: Date | null;
	private cliente?: ClienteEntity;
	private itens: ServiceOrderItemEntity[];

	public constructor(props: ServiceOrderProps) {
		this.id = props.id ?? null;
		this.codigoOs = props.codigoOs;
		this.clienteId = props.clienteId;
		this.usuarioId = props.usuarioId;
		this.valorTotal = props.valorTotal;
		this.status = props.status;
		this.origem = props.origem;
		this.observacao = props.observacao ?? null;
		this.createdAt = props.createdAt ?? null;
		this.updatedAt = props.updatedAt ?? null;
		this.deletedAt = props.deletedAt ?? null;
		this.cliente = props.cliente;
		this.itens = props.itens ?? [];
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

	public getUsuarioId(): number {
		return this.usuarioId;
	}

	public getValorTotal(): number {
		return this.valorTotal;
	}

	public getStatus(): StatusOrdemServico {
		return this.status;
	}

	public getOrigem(): OrigemOrdemServico {
		return this.origem;
	}

	public getObservacao(): string | null {
		return this.observacao ?? null;
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

	public getItens(): ServiceOrderItemEntity[] {
		return this.itens;
	}

	public setCliente(cliente: ClienteEntity): void {
		this.cliente = cliente;
	}
}
