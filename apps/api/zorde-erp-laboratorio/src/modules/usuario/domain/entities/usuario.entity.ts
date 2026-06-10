export interface UsuarioProps {
  id?: number;
  email: string;
  senha?: string;
  nome: string;
  documento: string;
  contato: string;
  ultimoAcesso: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export class UsuarioEntity {
  private readonly id?: number;
  private readonly email: string;
  private  senha?: string;
  private  nome: string;
  private  documento: string;
  private  contato: string;
  private  ultimoAcesso: Date | null;
  private  createdAt?: Date | null;
  private  updatedAt?: Date | null;

  public constructor(props: UsuarioProps) {
    this.id = props.id;
    this.email = props.email;
    this.senha = props.senha;
    this.nome = props.nome;
    this.documento = props.documento;
    this.contato = props.contato;
    this.ultimoAcesso = props.ultimoAcesso || null;
    this.createdAt = props.createdAt || null;
    this.updatedAt = props.updatedAt || null;
  }


  public getId(): number | undefined {
    return this.id;
  }

  public getEmail(): string {
    return this.email;
  }

  public getSenha(): string | undefined {
    return this.senha;
  }

  public getNome(): string {
    return this.nome;
  }

  public getDocumento(): string {
    return this.documento;
  }

  public getContato(): string {
    return this.contato;
  }

  public getUltimoAcesso(): Date | null {
    return this.ultimoAcesso;
  }

  public getCreatedAt(): Date | null {
    return this.createdAt ?? null;
  }

  public getUpdatedAt(): Date | null {
    return this.updatedAt ?? null;
  }
}
