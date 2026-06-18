
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { globalEnvironment } from 'src/config/env.validation';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: globalEnvironment.JWT_SECRET,
      algorithms: ['HS256', 'RS256'],

    });
  }

  public async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
