import { Inject, Injectable } from '@nestjs/common';
import { IUSUARIO_REPOSITORY } from '../../domain/repositories/i-usuario.repository';
import type { IUsuarioRepository } from '../../domain/repositories/i-usuario.repository';
import { PasswordHashingService } from '../../../auth/infra/services/password-hashing.service';
import { CriarUsuarioDto } from '../dtos/criar-usuario.dto';
import { UsuarioResponseDto } from '../dtos/usuario-response.dto';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { ConflictException } from '../../../../shared/errors/app.exception';
import { CreateUserDto } from '../../presentation/dto/userDto';
import { BcryptService } from 'src/shared/utils/bcrypt.service';

@Injectable()
export class CriarUsuarioUseCase {
  constructor(
    @Inject(IUSUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}

  async execute(dto: CreateUserDto): Promise<UsuarioResponseDto> {
    const user = await this.usuarioRepository.buscarPorEmail(dto.email);
    if (user) throw new ConflictException('E-mail já cadastrado');

    const hashedPassword = await this.passwordHashingService.hash(dto.senha);

    const newUser = new UsuarioEntity({
      email: dto.email,
      senha: hashedPassword,
      nome: dto.nome,
      documento: dto.documento,
      contato: dto.contato,
      ultimoAcesso: null,
      tipoUsuario: dto.tipoUsuario,
    });

    const created = await this.usuarioRepository.criar(newUser);

    return UsuarioResponseDto.fromEntity(created);
  }
}
