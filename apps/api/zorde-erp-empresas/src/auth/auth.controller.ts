import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { Public } from '../shared/decorators/public.decorator';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
});

type LoginDto = z.infer<typeof loginSchema>;

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  async login(@Body() { email, senha }: LoginDto) {
    const result = loginSchema.safeParse({ email, senha });

    if (!result.success) {
      throw new Error('Email e senha são obrigatórios');
    }

    const user = await this.authService.validateUser(email, senha);
    return this.authService.generateToken(user);
  }
}
