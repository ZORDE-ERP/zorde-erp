export class UsuarioEntity {
  id: number;
  email: string;
  senha?: string;
  nome: string;
  documento: string;
  contato: string;
  ultimoAcesso: Date | null;
  createdAt: Date;
  updatedAt: Date | null;

  constructor(props: Partial<UsuarioEntity>) {
    Object.assign(this, props);
  }

  static create(props: Omit<UsuarioEntity, 'id' | 'createdAt'> & { id?: number; createdAt?: Date }) {
    return new UsuarioEntity({
      ...props,
      createdAt: props.createdAt || new Date(),
    });
  }
}
