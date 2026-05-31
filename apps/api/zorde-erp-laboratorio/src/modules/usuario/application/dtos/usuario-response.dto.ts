import { UsuarioEntity } from '../../domain/entities/usuario.entity';

export class UsuarioResponseDto {
  id: number;
  email: string;
  nome: string;
  documento: string;
  contato: string;
  ultimoAcesso: Date | null;
  createdAt: Date;
  updatedAt: Date | null;

  static fromEntity(entity: UsuarioEntity): UsuarioResponseDto {
    return {
      id: entity.id,
      email: entity.email,
      nome: entity.nome,
      documento: entity.documento,
      contato: entity.contato,
      ultimoAcesso: entity.ultimoAcesso,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static fromEntities(entities: UsuarioEntity[]): UsuarioResponseDto[] {
    return entities.map(this.fromEntity);
  }
}
