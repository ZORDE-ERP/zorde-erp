import type { ClienteEntity } from '../../../cliente/domain/entities/cliente.entity';
import type { TabelaMontagemEntity } from '../../../tabelaMontagem/domain/entities/tabela-montagem.entity';

export class OrdemDeServicoEntity {
	public id: number;
	public codigoOs: string;
	public clienteId: number;
	public valor?: number;
	public tabelaMontagemId?: number;
	public usuarioId: number;
	public createdAt: Date;
	public updatedAt?: Date;
	public deletedAt?: Date;

	// Relacionamentos carregados opcionalmente
	public cliente?: ClienteEntity;
	public tabelaMontagem?: TabelaMontagemEntity;

	public constructor(props: Partial<OrdemDeServicoEntity>) {
		Object.assign(this, props);
	}

	public static create(
		props: Omit<OrdemDeServicoEntity, 'id' | 'createdAt'> & { id?: number; createdAt?: Date },
	): OrdemDeServicoEntity {
		return new OrdemDeServicoEntity({
			...props,
			createdAt: props.createdAt || new Date(),
		});
	}
}
