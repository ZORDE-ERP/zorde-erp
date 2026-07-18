import type { StatusFolhaOs } from '../../../../shared/enums/folha-os.enum';

interface FolhaOsImpressaProps {
	id?: number | null;
	loteId: number;
	clienteId: number;
	usuarioId: number;
	codigoFolha: string;
	status: StatusFolhaOs;
	ordemDeServicoId?: number | null;
	createdAt?: Date | null;
}

export class FolhaOsImpressaEntity {
	private id?: number | null;
	private loteId: number;
	private clienteId: number;
	private usuarioId: number;
	private codigoFolha: string;
	private status: StatusFolhaOs;
	private ordemDeServicoId?: number | null;
	private createdAt?: Date | null;

	public constructor(props: FolhaOsImpressaProps) {
		this.id = props.id ?? null;
		this.loteId = props.loteId;
		this.clienteId = props.clienteId;
		this.usuarioId = props.usuarioId;
		this.codigoFolha = props.codigoFolha;
		this.status = props.status;
		this.ordemDeServicoId = props.ordemDeServicoId ?? null;
		this.createdAt = props.createdAt ?? null;
	}

	public getId(): number | null {
		return this.id ?? null;
	}

	public getLoteId(): number {
		return this.loteId;
	}

	public getClienteId(): number {
		return this.clienteId;
	}

	public getUsuarioId(): number {
		return this.usuarioId;
	}

	public getCodigoFolha(): string {
		return this.codigoFolha;
	}

	public getStatus(): StatusFolhaOs {
		return this.status;
	}

	public getOrdemDeServicoId(): number | null {
		return this.ordemDeServicoId ?? null;
	}

	public getCreatedAt(): Date | null {
		return this.createdAt ?? null;
	}
}
