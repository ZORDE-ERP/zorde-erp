import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
	schema: 'prisma/zordeLabs.prisma',
	migrations: {
		path: 'prisma/migrations',
		seed: 'ts-node --project tsconfig.seed.json prisma/seed.ts',
	},
	datasource: {
		url: process.env.DATABASE_URL,
	},
});
