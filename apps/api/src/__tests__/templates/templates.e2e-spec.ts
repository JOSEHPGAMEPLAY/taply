import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';

/**
 * Pruebas de integración del módulo de Templates.
 *
 * Verifica CRUD completo de templates globales.
 */
describe('Templates (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;
  let templateId: string;

  const baseUrl = '/api/v1/templates';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    const email = `templates-test-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123', name: 'Templates Test' });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123' });
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /templates', () => {
    it('debe rechazar la creación a usuarios que no son administradores globales', async () => {
      await request(app.getHttpServer())
        .post(baseUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Template de Prueba',
          config: {
            bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            buttonStyle: 'rounded',
          },
        })
        .expect(403);
    });

    it('debe fallar sin autenticación (401)', async () => {
      await request(app.getHttpServer())
        .post(baseUrl)
        .send({ name: 'Sin Auth' })
        .expect(401);
    });
  });

  describe('GET /templates', () => {
    it('debe listar todos los templates', async () => {
      const res = await request(app.getHttpServer())
        .get(baseUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /templates/:id', () => {
    it('debe obtener un template por ID', async () => {
      const templates = await request(app.getHttpServer())
        .get(baseUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      templateId = templates.body[0].id;

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/${templateId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(templateId);
    });

    it('debe fallar si el template no existe (404)', async () => {
      await request(app.getHttpServer())
        .get(`${baseUrl}/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /templates/:id', () => {
    it('debe rechazar la edición a usuarios que no son administradores globales', async () => {
      await request(app.getHttpServer())
        .patch(`${baseUrl}/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Template Actualizado',
        })
        .expect(403);
    });
  });

  describe('DELETE /templates/:id', () => {
    it('debe rechazar el borrado a usuarios que no son administradores globales', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/templates/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });
  });
});
