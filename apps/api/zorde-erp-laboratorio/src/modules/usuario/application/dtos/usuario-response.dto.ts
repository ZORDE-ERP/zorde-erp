import { UsuarioEntity } from '../../domain/entities/usuario.entity';

export class UsuarioResponseDto {
  id: number;
  email: string;
  nome: string;
  documento: string;
  contato: string;
  senha?: string;
  ativo: boolean;
  tipoUsuario: 'ADMIN' | 'USUARIO';
  ultimoAcesso: Date | null;
  createdAt: Date;
  updatedAt: Date | null;

  static fromEntity(entity: UsuarioEntity): UsuarioResponseDto {
    return {
      id: entity.getId()!,
      email: entity.getEmail(),
      nome: entity.getNome(),
      documento: entity.getDocumento(),
      contato: entity.getContato(),
      senha: entity.getSenha()!,
      ativo: entity.getAtivo()!,
      tipoUsuario: entity.getTipoUsuario(),
      ultimoAcesso: entity.getUltimoAcesso(),
      createdAt: entity.getCreatedAt()!,
      updatedAt: entity.getUpdatedAt(),
    };
  }

  static fromEntities(entities: UsuarioEntity[]): UsuarioResponseDto[] {
    return entities.map(this.fromEntity);
  }
}
