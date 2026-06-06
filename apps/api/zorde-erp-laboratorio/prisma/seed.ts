import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const argon2Config = {
  type: argon2.argon2id,
  timeCost: 3,
  memoryCost: 65536,
  parallelism: 4,
  hashLength: 32,
};

async function main() {
  const email = 'admin@zorde.com';
  const documento = '00000000000';

  const existente = await prisma.usuario.findUnique({ where: { email } });

  if (existente) {
    console.log(`Usuário "${email}" já existe. Nenhuma ação necessária.`);
    return;
  }

  const senhaHash = await argon2.hash('Admin@123', argon2Config);

  const usuario = await prisma.usuario.create({
    data: {
      email,
      senha: senhaHash,
      nome: 'Administrador',
      documento,
      contato: '(00) 00000-0000',
    },
  });

  console.log(`Usuário criado com sucesso:`);
  console.log(`  ID:       ${usuario.id}`);
  console.log(`  Nome:     ${usuario.nome}`);
  console.log(`  E-mail:   ${usuario.email}`);
  console.log(`  Senha:    Admin@123`);
  console.log(`  Documento: ${usuario.documento}`);
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
