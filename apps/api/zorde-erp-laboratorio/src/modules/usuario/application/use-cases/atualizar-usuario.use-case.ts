import { Inject, Injectable } from '@nestjs/common';
import { IUSUARIO_REPOSITORY } from '../../domain/repositories/i-usuario.repository';
import type { IUsuarioRepository } from '../../domain/repositories/i-usuario.repository';
import { PasswordHashingService } from '../../../auth/infra/services/password-hashing.service';
import { AtualizarUsuarioDto } from '../dtos/atualizar-usuario.dto';
import { UsuarioResponseDto } from '../dtos/usuario-response.dto';
import { ConflictException, EntityNotFoundException } from '../../../../shared/errors/app.exception';

@Injectable()
export class AtualizarUsuarioUseCase {
  constructor(
    @Inject(IUSUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}

  async execute(id: number, dto: AtualizarUsuarioDto): Promise<UsuarioResponseDto> {
    const existing = await this.usuarioRepository.buscarPorId(id);
    if (!existing) {
      throw new EntityNotFoundException('Usuário não encontrado');
    }

    const updateData: any = {};

    if (dto.nome !== undefined) updateData.nome = dto.nome;
    if (dto.contato !== undefined) updateData.contato = dto.contato;

    if (dto.email !== undefined && dto.email !== existing.getEmail()) {
      const other = await this.usuarioRepository.buscarPorEmail(dto.email);
      if (other && other.getId() !== id) {
        throw new ConflictException('E-mail já em uso por outro usuário');
      }
      updateData.email = dto.email;
    }

    if (dto.documento !== undefined && dto.documento !== existing.getDocumento()) {
      const other = await this.usuarioRepository.buscarPorDocumento(dto.documento);
      if (other && other.getId() !== id) {
        throw new ConflictException('Documento já em uso por outro usuário');
      }
      updateData.documento = dto.documento;
    }

    if (dto.senha !== undefined) {
      updateData.senha = await this.passwordHashingService.hash(dto.senha);
    }

    updateData.updatedAt = new Date();

    const updated = await this.usuarioRepository.atualizar(id, updateData);

    return UsuarioResponseDto.fromEntity(updated);
  }
}
