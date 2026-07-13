import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const argon2Config: argon2.Options = {
	type: argon2.argon2id,
	timeCost: 3,
	memoryCost: 65536,
	parallelism: 4,
	hashLength: 32,
};

async function main(): Promise<void> {
	const email = 'admin@zorde.com';
	const documento = '00000000000';

	const existente = await prisma.usuario.findUnique({ where: { email } });

	if (existente) {
		throw new Error(`Usuário "${email}" já existe. Nenhuma ação necessária.`);
	}

	const senhaHash = await argon2.hash('Admin@123', argon2Config);

	await prisma.usuario.create({
		data: {
			email,
			senha: senhaHash,
			nome: 'Administrador',
			documento,
			contato: '(00) 00000-0000',
		},
	});
}

main()
	.catch((_) => {
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});
