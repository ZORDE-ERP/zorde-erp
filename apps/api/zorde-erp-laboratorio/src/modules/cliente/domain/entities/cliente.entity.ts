import { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';
import type { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';

interface ClienteProps {
	id?: number | null;
	nome: string;
	email: string;
	contato?: string | null;
	tipoPessoa: TipoPessoa;
	documento: string;
	status: StatusPessoa;
	cep?: string | null;
	razaoSocial?: string | null;
	nomeFantasia?: string | null;
	observacao?: string | null;
	usuarioId: number;
	logradouro?: string | null;
	complemento?: string | null;
	bairro?: string | null;
	cidade?: string | null;
	uf?: string | null;
	ibge?: string | null;
	numeroEndereco?: string | null;
	qrToken?: string | null;
	qrGeradoEm?: Date | null;
	qrCodeUrl?: string | null;
	qrCodePublicId?: string | null;
	logoUrl?: string | null;
	logoPublicId?: string | null;
	createdAt?: Date | null;
	updatedAt?: Date | null;
	deletedAt?: Date | null;
}
export class ClienteEntity {
	private id?: number | null;
	private nome: string;
	private email: string;
	private contato?: string | null;
	private tipoPessoa: TipoPessoa;
	private documento: string;
	private status: StatusPessoa;
	private cep?: string | null;
	private razaoSocial?: string | null;
	private nomeFantasia?: string | null;
	private observacao?: string | null;
	private usuarioId: number;
	private logradouro?: string | null;
	private complemento?: string | null;
	private bairro?: string | null;
	private cidade?: string | null;
	private uf?: string | null;
	private ibge?: string | null;
	private numeroEndereco?: string | null;
	private qrToken?: string | null;
	private qrGeradoEm?: Date | null;
	private qrCodeUrl?: string | null;
	private qrCodePublicId?: string | null;
	private logoUrl?: string | null;
	private logoPublicId?: string | null;
	private createdAt?: Date | null;
	private updatedAt?: Date | null;
	private deletedAt?: Date | null;

	public constructor(props: ClienteProps) {
		this.id = props.id ?? null;
		this.nome = props.nome;
		this.email = props.email;
		this.contato = props.contato ?? null;
		this.tipoPessoa = props.tipoPessoa;
		this.documento = props.documento;
		this.status = props.status;
		this.cep = props.cep ?? null;
		this.razaoSocial = props.razaoSocial ?? null;
		this.nomeFantasia = props.nomeFantasia ?? null;
		this.observacao = props.observacao ?? null;
		this.usuarioId = props.usuarioId;
		this.logradouro = props.logradouro ?? null;
		this.complemento = props.complemento ?? null;
		this.bairro = props.bairro ?? null;
		this.cidade = props.cidade ?? null;
		this.uf = props.uf ?? null;
		this.ibge = props.ibge ?? null;
		this.numeroEndereco = props.numeroEndereco ?? null;
		this.qrToken = props.qrToken ?? null;
		this.qrGeradoEm = props.qrGeradoEm ?? null;
		this.qrCodeUrl = props.qrCodeUrl ?? null;
		this.qrCodePublicId = props.qrCodePublicId ?? null;
		this.logoUrl = props.logoUrl ?? null;
		this.logoPublicId = props.logoPublicId ?? null;
		this.createdAt = props.createdAt ?? null;
		this.updatedAt = props.updatedAt ?? null;
		this.deletedAt = props.deletedAt ?? null;
	}

	public getId(): number | null {
		return this.id ?? null;
	}

	public getNome(): string {
		return this.nome;
	}

	public getEmail(): string {
		return this.email;
	}

	public getContato(): string | null {
		return this.contato ?? null;
	}

	public getTipoPessoa(): TipoPessoa {
		return this.tipoPessoa;
	}

	public getDocumento(): string {
		return this.documento;
	}

	public getStatus(): StatusPessoa {
		return this.status;
	}

	public getCep(): string | null {
		return this.cep ?? null;
	}

	public getRazaoSocial(): string | null {
		return this.razaoSocial ?? null;
	}

	public getNomeFantasia(): string | null {
		return this.nomeFantasia ?? null;
	}

	public getObservacao(): string | null {
		return this.observacao ?? null;
	}

	public getUsuarioId(): number {
		return this.usuarioId;
	}

	public getNumeroEndereco(): string | null {
		return this.numeroEndereco ?? null;
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

	public getLogradouro(): string | null {
		return this.logradouro ?? null;
	}

	public getComplemento(): string | null {
		return this.complemento ?? null;
	}

	public getBairro(): string | null {
		return this.bairro ?? null;
	}

	public getCidade(): string | null {
		return this.cidade ?? null;
	}

	public getUf(): string | null {
		return this.uf ?? null;
	}

	public getIbge(): string | null {
		return this.ibge ?? null;
	}

	public getQrToken(): string | null {
		return this.qrToken ?? null;
	}

	public getQrGeradoEm(): Date | null {
		return this.qrGeradoEm ?? null;
	}

	public getQrCodeUrl(): string | null {
		return this.qrCodeUrl ?? null;
	}

	public getQrCodePublicId(): string | null {
		return this.qrCodePublicId ?? null;
	}

	public getLogoUrl(): string | null {
		return this.logoUrl ?? null;
	}

	public getLogoPublicId(): string | null {
		return this.logoPublicId ?? null;
	}
}
