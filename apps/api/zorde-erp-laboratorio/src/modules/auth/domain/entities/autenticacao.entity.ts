import { StatusSessao } from '../../../../shared/enums/status-sessao.enum';

interface AutenticacaoProps {
  id?: number;
  idUsuario: number;
  refreshToken: string | null;
  status: StatusSessao;
  ip?: string;
  jti?: string | null;
  dispositivo?: string;
  navegador?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
export class AutenticacaoEntity {
  private readonly id?: number;
  private readonly idUsuario: number;
  private readonly refreshToken: string | null;
  private readonly status: StatusSessao;
  private readonly ip?: string;
  private readonly jti?: string | null;
  private readonly dispositivo?: string;
  private readonly navegador?: string;
  private readonly createdAt?: Date | null;
  private readonly updatedAt?: Date | null;

  public constructor(props: AutenticacaoProps) {
    this.id = props.id;
    this.idUsuario = props.idUsuario;
    this.refreshToken = props.refreshToken ?? null;
    this.status = props.status;
    this.ip = props.ip;
    this.jti = props.jti;
    this.dispositivo = props.dispositivo;
    this.navegador = props.navegador;
  }

  public getId(): number | undefined {
    return this.id;
  }

  public getIdUsuario(): number {
    return this.idUsuario;
  }

  public getRefreshToken(): string | null {
    return this.refreshToken ?? null;
  }

  public getStatus(): StatusSessao {
    return this.status;
  }

  public getIp(): string | undefined {
    return this.ip;
  }
  
  public getJti(): string | null {
    return this.jti || null;
  }

  public getDispositivo(): string | undefined {
    return this.dispositivo;
  }

  public getNavegador(): string | undefined {
    return this.navegador;
  }

  public getCreatedAt(): Date | null {
    return this.createdAt ?? null;
  }

  public getUpdatedAt(): Date | null {
    return this.updatedAt ?? null;
  }
}
