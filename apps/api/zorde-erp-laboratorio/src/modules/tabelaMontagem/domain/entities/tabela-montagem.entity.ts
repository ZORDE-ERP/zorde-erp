import type { TipoServico } from '../../../../shared/enums/tipo-servico.enum';

export class TabelaMontagemEntity {
	public id: number;
	public clienteId: number;
	public servico: TipoServico;
	public valor: number;
	public createdAt: Date;
	public updatedAt?: Date;
	public deletedAt?: Date;

	// Campo enriquecido opcionalmente populado na infra/use cases
	public nomeCliente?: string;

	public constructor(props: Partial<TabelaMontagemEntity>) {
		Object.assign(this, props);
	}

	public static create(
		props: Omit<TabelaMontagemEntity, 'id' | 'createdAt'> & { id?: number; createdAt?: Date },
	): TabelaMontagemEntity {
		return new TabelaMontagemEntity({
			...props,
			createdAt: props.createdAt || new Date(),
		});
	}
}
