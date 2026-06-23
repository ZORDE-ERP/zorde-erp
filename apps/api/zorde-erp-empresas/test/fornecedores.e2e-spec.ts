import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/database/prisma/prisma.service';

describe('FornecedoresController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
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
    if (createdFornecedorIds.length === 0) {
      return;
    }

    await prisma.fornecedores.deleteMany({
      where: {
        id: {
          in: createdFornecedorIds,
        },
      },
    });

    createdFornecedorIds.length = 0;
  });

  afterAll(async () => {
    await app.close();
  });

  it('cria, lista, busca, atualiza e remove um fornecedor', async () => {
    const createPayload = {
      nome: 'Fornecedor Teste',
      email: `fornecedor-${Date.now()}@teste.com`,
      telefone: '11999999999',
      endereco: 'Rua dos Testes, 123',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/fornecedores')
      .send(createPayload)
      .expect(201);

    expect(createResponse.body).toMatchObject(createPayload);
    expect(createResponse.body.id).toEqual(expect.any(Number));
    expect(createResponse.body.compras).toEqual([]);

    const fornecedorId = createResponse.body.id;
    createdFornecedorIds.push(fornecedorId);

    const listResponse = await request(app.getHttpServer()).get('/fornecedores').expect(200);

    expect(listResponse.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: fornecedorId, ...createPayload })]),
    );

    await request(app.getHttpServer())
      .get(`/fornecedores/${fornecedorId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ id: fornecedorId, ...createPayload });
      });

    const updatePayload = {
      nome: 'Fornecedor Teste Atualizado',
      telefone: '11888888888',
    };

    await request(app.getHttpServer())
      .patch(`/fornecedores/${fornecedorId}`)
      .send(updatePayload)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: fornecedorId,
          ...createPayload,
          ...updatePayload,
        });
      });

    await request(app.getHttpServer())
      .delete(`/fornecedores/${fornecedorId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: fornecedorId,
          ...createPayload,
          ...updatePayload,
        });
      });

    createdFornecedorIds.pop();

    await request(app.getHttpServer()).get(`/fornecedores/${fornecedorId}`).expect(404);
  });

  it('retorna 404 ao buscar fornecedor inexistente', async () => {
    await request(app.getHttpServer()).get('/fornecedores/2147483647').expect(404);
  });
});
