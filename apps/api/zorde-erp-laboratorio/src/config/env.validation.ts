import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  POSTGRES_DB: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  API_PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string(),
  APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  RESEND_API_KEY: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, any>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error('❌ Erro de validação das variáveis de ambiente:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Variáveis de ambiente inválidas');
  }

  return result.data;
}
