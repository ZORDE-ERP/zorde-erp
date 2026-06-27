import { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';
import type { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';

export class ClienteEntity {
	public id: number;
	public nome: string;
	public email: string;
	public contato?: string;
	public tipoPessoa: TipoPessoa;
	public documento: string;
	public status: StatusPessoa;
	public cep?: string;
	public uf?: string;
	public cidade?: string;
	public logradouro?: string;
	public numero?: string;
	public bairro?: string;
	public observacao?: string;
	public usuarioId: number;
	public createdAt: Date;
	public updatedAt?: Date;
	public deletedAt?: Date;

	public constructor(props: Partial<ClienteEntity>) {
		Object.assign(this, props);
	}

	public static create(props: Omit<ClienteEntity, 'id' | 'createdAt'> & { id?: number; createdAt?: Date }): ClienteEntity {
		return new ClienteEntity({
			...props,
			createdAt: props.createdAt || new Date(),
			status: props.status || StatusPessoa.ATIVO,
		});
	}
}
