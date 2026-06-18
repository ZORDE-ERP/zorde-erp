
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { UsuarioEntity } from 'src/modules/usuario/domain/entities/usuario.entity';
import { UsuarioResponseDto } from 'src/modules/usuario/application/dtos/usuario-response.dto';

@Injectable()
export class ValidationUserStrategy extends PassportStrategy(Strategy, 'IsUserValid') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'senha',
    });
  }

  public async validate(email: string, password: string): Promise<UsuarioResponseDto | null> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    // TODO: Salvar os dados do usuario no redis em cache para evitar consultas repetidas;
    return user;
  }
}
