import { hash } from 'argon2';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Carregar .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar (opcional - comentar se não quiser limpar)
  // await prisma.orderStatusHistory.deleteMany();
  // await prisma.pedido.deleteMany();
  // await prisma.compra.deleteMany();
  // await prisma.estoque.deleteMany();
  // await prisma.produto.deleteMany();
  // await prisma.cliente.deleteMany();
  // await prisma.fornecedor.deleteMany();
  // await prisma.rolePermission.deleteMany();
  // await prisma.role.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.pipelineStage.deleteMany();
  // await prisma.organization.deleteMany();
  // await prisma.permission.deleteMany();

  // Criar organização
  const org = await prisma.organization.create({
    data: {
      name: 'Lab Visão Perfeita',
      type: 'LABORATORIO',
      email: 'lab@test.com',
      telefone: '(11) 99999-9999',
      endereco: 'São Paulo, SP',
    },
  });
  console.log(`✅ Organização criada: ${org.name}`);

  // Criar permissões padrão
  const permissionsData = [
    { resource: 'config_admin', action: 'manage' },
    { resource: 'pedidos', action: 'create' },
    { resource: 'pedidos', action: 'read' },
    { resource: 'pedidos', action: 'update' },
    { resource: 'pedidos', action: 'delete' },
    { resource: 'pedidos', action: 'update_stage' },
    { resource: 'produtos', action: 'create' },
    { resource: 'produtos', action: 'read' },
    { resource: 'produtos', action: 'update' },
    { resource: 'produtos', action: 'delete' },
    { resource: 'estoque', action: 'create' },
    { resource: 'estoque', action: 'read' },
    { resource: 'estoque', action: 'update' },
    { resource: 'estoque', action: 'delete' },
    { resource: 'fornecedores', action: 'create' },
    { resource: 'fornecedores', action: 'read' },
    { resource: 'fornecedores', action: 'update' },
    { resource: 'fornecedores', action: 'delete' },
    { resource: 'clientes', action: 'create' },
    { resource: 'clientes', action: 'read' },
    { resource: 'clientes', action: 'update' },
    { resource: 'clientes', action: 'delete' },
    { resource: 'compras', action: 'create' },
    { resource: 'compras', action: 'read' },
    { resource: 'compras', action: 'update' },
    { resource: 'compras', action: 'delete' },
  ];

  const permissions: Array<{ id: string; resource: string; action: string }> =
    [];
  for (const permData of permissionsData) {
    try {
      const perm = await prisma.permission.create({
        data: permData,
      });
      permissions.push(perm);
    } catch (e: any) {
      if (e.code === 'P2002') {
        // Já existe
        const existing = await prisma.permission.findFirst({
          where: permData,
        });
        if (existing) permissions.push(existing);
      } else {
        throw e;
      }
    }
  }
  console.log(`✅ ${permissions.length} permissões criadas/verificadas`);

  // Criar role ADMIN
  const adminRole = await prisma.role.create({
    data: {
      organizationId: org.id,
      name: 'ADMIN',
      description: 'Administrador total',
      permissions: {
        create: permissions.map((p) => ({
          permissionId: p.id,
        })),
      },
    },
  });
  console.log(`✅ Role ADMIN criada`);

  // Criar role OPERATOR
  const operatorPerms = permissions.filter(
    (p) =>
      [
        'pedidos',
        'produtos',
        'estoque',
        'fornecedores',
        'clientes',
        'compras',
      ].includes(p.resource),
  );

  const operatorRole = await prisma.role.create({
    data: {
      organizationId: org.id,
      name: 'OPERATOR',
      description: 'Operador - acesso a pedidos, estoque e compras',
      permissions: {
        create: operatorPerms.map((p) => ({
          permissionId: p.id,
        })),
      },
    },
  });
  console.log(`✅ Role OPERATOR criada`);

  // Criar usuário admin
  const adminUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'admin@lab.com',
      senha: await hash('admin123'),
      nome: 'Admin Lab',
      roleId: adminRole.id,
    },
  });
  console.log(`✅ Usuário admin criado: admin@lab.com / admin123`);

  // Criar usuário operador
  const operatorUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'operador@lab.com',
      senha: await hash('operator123'),
      nome: 'Operador Lab',
      roleId: operatorRole.id,
    },
  });
  console.log(`✅ Usuário operador criado: operador@lab.com / operator123`);

  // Criar pipeline stages
  const stages = await Promise.all([
    prisma.pipelineStage.create({
      data: {
        organizationId: org.id,
        name: 'PEDIDO_RECEBIDO',
        order: 1,
        isTerminal: false,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        organizationId: org.id,
        name: 'LENTE_PEDIDA',
        order: 2,
        isTerminal: false,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        organizationId: org.id,
        name: 'LENTE_RECEBIDA',
        order: 3,
        isTerminal: false,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        organizationId: org.id,
        name: 'EM_MONTAGEM',
        order: 4,
        isTerminal: false,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        organizationId: org.id,
        name: 'TESTES_QUALIDADE',
        order: 5,
        isTerminal: false,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        organizationId: org.id,
        name: 'PRONTO_ENVIO',
        order: 6,
        isTerminal: true,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        organizationId: org.id,
        name: 'ENTREGUE',
        order: 7,
        isTerminal: true,
      },
    }),
  ]);
  console.log(`✅ ${stages.length} etapas de pipeline criadas`);

  // Criar produtos
  const produto1 = await prisma.produto.create({
    data: {
      organizationId: org.id,
      descricao: 'Lente Monofocal',
      preco: '150.00',
    },
  });

  const produto2 = await prisma.produto.create({
    data: {
      organizationId: org.id,
      descricao: 'Lente Progressiva',
      preco: '350.00',
    },
  });
  console.log(`✅ 2 produtos criados`);

  // Criar estoque
  await prisma.estoque.create({
    data: {
      organizationId: org.id,
      produtoId: produto1.id,
      quantidade: 50,
    },
  });

  await prisma.estoque.create({
    data: {
      organizationId: org.id,
      produtoId: produto2.id,
      quantidade: 30,
    },
  });
  console.log(`✅ Estoque criado`);

  // Criar fornecedor
  const fornecedor = await prisma.fornecedor.create({
    data: {
      organizationId: org.id,
      nome: 'Lentes Brasil Ltda',
      email: 'vendas@lentes.com',
      telefone: '(11) 3333-3333',
      endereco: 'São Paulo, SP',
    },
  });
  console.log(`✅ Fornecedor criado`);

  // Criar cliente
  const cliente = await prisma.cliente.create({
    data: {
      organizationId: org.id,
      nome: 'Ótica Visão Legal',
      email: 'contato@visaolegal.com',
      telefone: '(11) 2222-2222',
      endereco: 'São Paulo, SP',
    },
  });
  console.log(`✅ Cliente criado`);

  // Criar primeiro pedido
  const primeiroStage = stages[0];
  const pedido = await prisma.pedido.create({
    data: {
      organizationId: org.id,
      clienteId: cliente.id,
      produtoId: produto1.id,
      currentStageId: primeiroStage.id,
    },
  });

  // Registrar no histórico
  await prisma.orderStatusHistory.create({
    data: {
      pedidoId: pedido.id,
      toStageId: primeiroStage.id,
      changedById: adminUser.id,
    },
  });
  console.log(`✅ Pedido de teste criado`);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📝 Credenciais de teste:');
  console.log('   Admin:    admin@lab.com / admin123');
  console.log('   Operador: operador@lab.com / operator123');
  console.log('\n🔗 API: http://localhost:3001/api/v1');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
