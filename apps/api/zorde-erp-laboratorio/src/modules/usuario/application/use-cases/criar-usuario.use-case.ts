import { Inject, Injectable } from '@nestjs/common';
import { I_USUARIO_REPOSITORY } from '../../domain/repositories/i-usuario.repository';
import type { IUsuarioRepository } from '../../domain/repositories/i-usuario.repository';
import { PasswordHashingService } from '../../../auth/infra/services/password-hashing.service';
import { CriarUsuarioDto } from '../dtos/criar-usuario.dto';
import { UsuarioResponseDto } from '../dtos/usuario-response.dto';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { ConflictException } from '../../../../shared/errors/app.exception';

@Injectable()
export class CriarUsuarioUseCase {
  constructor(
    @Inject(I_USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}

  async execute(dto: CriarUsuarioDto): Promise<UsuarioResponseDto> {
    // Verificar se já existe um usuário com o mesmo email
    const usuarioPorEmail = await this.usuarioRepository.buscarPorEmail(dto.email);
    if (usuarioPorEmail) {
      throw new ConflictException('E-mail já cadastrado');
    }

    // Verificar se já existe um usuário com o mesmo documento
    const usuarioPorDoc = await this.usuarioRepository.buscarPorDocumento(dto.documento);
    if (usuarioPorDoc) {
      throw new ConflictException('Documento já cadastrado');
    }

    // Gerar hash de senha
    const hashedPassword = await this.passwordHashingService.hash(dto.senha);

    const usuario = UsuarioEntity.create({
      email: dto.email,
      senha: hashedPassword,
      nome: dto.nome,
      documento: dto.documento,
      contato: dto.contato,
      ultimoAcesso: null,
      updatedAt: null,
    });

    const created = await this.usuarioRepository.criar(usuario);

    return UsuarioResponseDto.fromEntity(created);
  }
}
