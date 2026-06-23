import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/database/prisma/prisma.service';

describe('ProdutosController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
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
    if (createdProdutoIds.length === 0) {
      return;
    }

    await prisma.produtos.deleteMany({
      where: {
        id: {
          in: createdProdutoIds,
        },
      },
    });

    createdProdutoIds.length = 0;
  });

  afterAll(async () => {
    await app.close();
  });

  it('cria, lista, busca, atualiza e remove um produto', async () => {
    const createPayload = {
      descricao: `Produto Teste ${Date.now()}`,
      preco: '99.90',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/produtos')
      .send(createPayload)
      .expect(201);

    expect(createResponse.body).toMatchObject(createPayload);
    expect(createResponse.body.id).toEqual(expect.any(Number));

    const produtoId = createResponse.body.id;
    createdProdutoIds.push(produtoId);

    const listResponse = await request(app.getHttpServer()).get('/produtos').expect(200);

    expect(listResponse.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: produtoId, ...createPayload })]),
    );

    await request(app.getHttpServer())
      .get(`/produtos/${produtoId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: produtoId,
          ...createPayload,
          estoques: [],
          compras: [],
        });
      });

    const updatePayload = {
      descricao: 'Produto Teste Atualizado',
      preco: '149.90',
    };

    await request(app.getHttpServer())
      .patch(`/produtos/${produtoId}`)
      .send(updatePayload)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: produtoId,
          ...updatePayload,
          estoques: [],
          compras: [],
        });
      });

    await request(app.getHttpServer())
      .delete(`/produtos/${produtoId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: produtoId,
          ...updatePayload,
        });
      });

    createdProdutoIds.pop();

    await request(app.getHttpServer()).get(`/produtos/${produtoId}`).expect(404);
  });

  it('retorna 404 ao buscar produto inexistente', async () => {
    await request(app.getHttpServer()).get('/produtos/2147483647').expect(404);
  });
});
