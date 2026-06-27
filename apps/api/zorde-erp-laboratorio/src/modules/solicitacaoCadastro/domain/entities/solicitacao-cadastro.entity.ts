export class SolicitacaoCadastroEntity {
	public id: number;
	public email: string;
	public codigo: string;
	public expiracao: Date;
	public criadoEm: Date;

	public constructor(props: Partial<SolicitacaoCadastroEntity>) {
		Object.assign(this, props);
	}

	public static create(
		props: Omit<SolicitacaoCadastroEntity, 'id' | 'criadoEm'> & { id?: number; criadoEm?: Date },
	): SolicitacaoCadastroEntity {
		return new SolicitacaoCadastroEntity({
			...props,
			criadoEm: props.criadoEm || new Date(),
		});
	}
}
