import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  POSTGRES_DB: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  API_PORT: z.coerce.number().default(3001),
  APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error('Erro de validacao das variaveis de ambiente:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Variaveis de ambiente invalidas');
  }

  return result.data;
}
