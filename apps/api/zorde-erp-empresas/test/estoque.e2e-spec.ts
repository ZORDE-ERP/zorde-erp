import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/database/prisma/prisma.service';

describe('EstoqueController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const createdEstoqueIds: number[] = [];
  const createdProdutoIds: number[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);

    await app.init();
  });

  afterEach(async () => {
    if (createdEstoqueIds.length > 0) {
      await prisma.estoque.deleteMany({
        where: {
          id: {
            in: createdEstoqueIds,
          },
        },
      });

      createdEstoqueIds.length = 0;
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('cria, lista, busca, atualiza e remove um estoque', async () => {
    const produto = await prisma.produtos.create({
      data: {
        descricao: `Produto Estoque Teste ${Date.now()}`,
        preco: '49.90',
      },
    });
    createdProdutoIds.push(produto.id);

    const createPayload = {
      produto_id: produto.id,
      quantidade: 10,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/estoque')
      .send(createPayload)
      .expect(201);

    expect(createResponse.body).toMatchObject(createPayload);
    expect(createResponse.body.id).toEqual(expect.any(Number));
    expect(createResponse.body.produto).toMatchObject({
      id: produto.id,
      descricao: produto.descricao,
      preco: produto.preco,
    });

    const estoqueId = createResponse.body.id;
    createdEstoqueIds.push(estoqueId);

    const listResponse = await request(app.getHttpServer()).get('/estoque').expect(200);

    expect(listResponse.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: estoqueId, ...createPayload })]),
    );

    await request(app.getHttpServer())
      .get(`/estoque/${estoqueId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: estoqueId,
          ...createPayload,
          produto: {
            id: produto.id,
            descricao: produto.descricao,
            preco: produto.preco,
          },
        });
      });

    const updatePayload = {
      quantidade: 25,
    };

    await request(app.getHttpServer())
      .patch(`/estoque/${estoqueId}`)
      .send(updatePayload)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: estoqueId,
          produto_id: produto.id,
          quantidade: updatePayload.quantidade,
        });
      });

    await request(app.getHttpServer())
      .delete(`/estoque/${estoqueId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: estoqueId,
          produto_id: produto.id,
          quantidade: updatePayload.quantidade,
        });
      });

    createdEstoqueIds.pop();

    await request(app.getHttpServer()).get(`/estoque/${estoqueId}`).expect(404);
  });

  it('retorna 404 ao buscar estoque inexistente', async () => {
    await request(app.getHttpServer()).get('/estoque/2147483647').expect(404);
  });
});
