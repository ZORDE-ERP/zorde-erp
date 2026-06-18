import type { JwtSignOptions } from '@nestjs/jwt';
import { z } from 'zod';

type JwtExpiresIn = NonNullable<JwtSignOptions['expiresIn']>;

const jwtExpiresInSchema = z
  .string()
  .transform((value) => value as JwtExpiresIn);

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  POSTGRES_DB: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  API_PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string(),
  JWT_SECRET_EXPIRES_IN: jwtExpiresInSchema,
  REFRESH_TOKEN_EXPIRES_IN: jwtExpiresInSchema,
  APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  RESEND_API_KEY: z.string(),
  SALT_ROUNDS_BCRYPT: z.coerce.number(),
  SERVER_URL: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export let globalEnvironment: Env;

export function validateEnv(config: Record<string, any>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error('Variáveis de ambiente inválidas');
  }

  globalEnvironment = result.data;

  return result.data;
}
