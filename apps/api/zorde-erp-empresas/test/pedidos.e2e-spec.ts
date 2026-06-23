import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/database/prisma/prisma.service';

describe('PedidosController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const createdPedidoIds: number[] = [];
  const createdProdutoIds: number[] = [];
  const createdFornecedorIds: number[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);

    await app.init();
  });

  afterEach(async () => {
    if (createdPedidoIds.length > 0) {
      await prisma.compras.deleteMany({
        where: {
          id: {
            in: createdPedidoIds,
          },
        },
      });

      createdPedidoIds.length = 0;
    }

    if (createdProdutoIds.length > 0) {
      await prisma.produtos.deleteMany({
        where: {
          id: {
            in: createdProdutoIds,
          },
        },
      });

      createdProdutoIds.length = 0;
    }

    if (createdFornecedorIds.length > 0) {
      await prisma.fornecedores.deleteMany({
        where: {
          id: {
            in: createdFornecedorIds,
          },
        },
      });

      createdFornecedorIds.length = 0;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('cria, lista, busca, atualiza e remove um pedido', async () => {
    const produto = await prisma.produtos.create({
      data: {
        descricao: `Produto Pedido Teste ${Date.now()}`,
        preco: '19.90',
      },
    });
    createdProdutoIds.push(produto.id);

    const fornecedor = await prisma.fornecedores.create({
      data: {
        nome: 'Fornecedor Pedido Teste',
        email: `fornecedor-pedido-${Date.now()}@teste.com`,
        telefone: '11777777777',
        endereco: 'Rua Pedido, 123',
      },
    });
    createdFornecedorIds.push(fornecedor.id);

    const createPayload = {
      fornecedor_id: fornecedor.id,
      produto_id: produto.id,
      data: new Date('2026-06-23T12:00:00.000Z').toISOString(),
      total: '39.80',
      valor_unitario: '19.90',
      quantidade: 2,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/pedidos')
      .send(createPayload)
      .expect(201);

    expect(createResponse.body).toMatchObject({
      fornecedor_id: fornecedor.id,
      produto_id: produto.id,
      data: createPayload.data,
      total: createPayload.total,
      valor_unitario: createPayload.valor_unitario,
      quantidade: createPayload.quantidade,
    });
    expect(createResponse.body.id).toEqual(expect.any(Number));
    expect(createResponse.body.produto).toMatchObject({
      id: produto.id,
      descricao: produto.descricao,
      preco: produto.preco,
    });
    expect(createResponse.body.fornecedor).toMatchObject({
      id: fornecedor.id,
      nome: fornecedor.nome,
      email: fornecedor.email,
    });

    const pedidoId = createResponse.body.id;
    createdPedidoIds.push(pedidoId);

    const listResponse = await request(app.getHttpServer()).get('/pedidos').expect(200);

    expect(listResponse.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: pedidoId, produto_id: produto.id })]),
    );

    await request(app.getHttpServer())
      .get(`/pedidos/${pedidoId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: pedidoId,
          fornecedor_id: fornecedor.id,
          produto_id: produto.id,
          data: createPayload.data,
          total: createPayload.total,
          valor_unitario: createPayload.valor_unitario,
          quantidade: createPayload.quantidade,
        });
      });

    const updatePayload = {
      total: '59.70',
      quantidade: 3,
    };

    await request(app.getHttpServer())
      .patch(`/pedidos/${pedidoId}`)
      .send(updatePayload)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: pedidoId,
          fornecedor_id: fornecedor.id,
          produto_id: produto.id,
          total: updatePayload.total,
          quantidade: updatePayload.quantidade,
        });
      });

    await request(app.getHttpServer())
      .delete(`/pedidos/${pedidoId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: pedidoId,
          fornecedor_id: fornecedor.id,
          produto_id: produto.id,
          total: updatePayload.total,
          quantidade: updatePayload.quantidade,
        });
      });

    createdPedidoIds.pop();

    await request(app.getHttpServer()).get(`/pedidos/${pedidoId}`).expect(404);
  });

  it('retorna 404 ao buscar pedido inexistente', async () => {
    await request(app.getHttpServer()).get('/pedidos/2147483647').expect(404);
  });
});
