import { StatusSessao } from '../../../../shared/enums/status-sessao.enum';

export class AutenticacaoEntity {
  id: number;
  idUsuario: number;
  refreshToken: string;
  status: StatusSessao;
  ip: string;
  dispositivo: string;
  navegador: string;
  createdAt: Date;
  updatedAt?: Date;

  constructor(props: Partial<AutenticacaoEntity>) {
    Object.assign(this, props);
  }

  static create(props: Omit<AutenticacaoEntity, 'id' | 'createdAt'> & { id?: number; createdAt?: Date }) {
    return new AutenticacaoEntity({
      ...props,
      status: props.status || StatusSessao.LOGADO,
      createdAt: props.createdAt || new Date(),
    });
  }
}
