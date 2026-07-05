import { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';
import type { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';

interface FornecedorProps {
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
	createdAt?: Date | null;
	updatedAt?: Date | null;
	deletedAt?: Date | null;
}

export class FornecedorEntity {
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
	private createdAt?: Date | null;
	private updatedAt?: Date | null;
	private deletedAt?: Date | null;

	public constructor(props: FornecedorProps) {
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
}
