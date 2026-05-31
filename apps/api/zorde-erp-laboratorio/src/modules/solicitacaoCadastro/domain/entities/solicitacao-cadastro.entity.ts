export class SolicitacaoCadastroEntity {
  id: number;
  email: string;
  codigo: string;
  expiracao: Date;
  criadoEm: Date;

  constructor(props: Partial<SolicitacaoCadastroEntity>) {
    Object.assign(this, props);
  }

  static create(props: Omit<SolicitacaoCadastroEntity, 'id' | 'criadoEm'> & { id?: number; criadoEm?: Date }) {
    return new SolicitacaoCadastroEntity({
      ...props,
      criadoEm: props.criadoEm || new Date(),
    });
  }
}
