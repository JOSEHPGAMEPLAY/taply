import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';

/**
 * Pruebas de integración del módulo de Páginas.
 *
 * Verifica CRUD completo, publish/unpublish y cambio de estado.
 */
describe('Pages (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;
  let businessId: string;
  let pageId: string;

  const baseUrl = '/api/v1/pages';

  async function setupTestData() {
    const email = `pages-test-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123', name: 'Pages Test' });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123' });
    accessToken = loginRes.body.accessToken;

    const bizRes = await request(app.getHttpServer())
      .post('/api/v1/businesses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Pages Test Business' });
    businessId = bizRes.body.id;
  }

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

    await setupTestData();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /pages', () => {
    it('debe crear una página exitosamente', async () => {
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ slug: 'test-page' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.slug).toBe('test-page');
      pageId = res.body.id;
    });

    it('debe fallar sin autenticación (401)', async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}?businessId=${businessId}`)
        .send({ slug: 'no-auth' })
        .expect(401);
    });
  });

  describe('GET /pages', () => {
    it('debe listar las páginas del negocio', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /pages/:id', () => {
    it('debe obtener una página por ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/${pageId}?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(pageId);
    });
  });

  describe('PATCH /pages/:id', () => {
    it('debe actualizar los botones de una página', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${baseUrl}/${pageId}?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          buttons: [
            { key: 'website', label: 'Sitio Web', url: 'https://example.com' },
          ],
        })
        .expect(200);

      expect(res.body.id).toBe(pageId);
      const pageRes = await request(app.getHttpServer())
        .get(`${baseUrl}/${pageId}?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(pageRes.body.versions[0].buttons).toEqual([
        { key: 'website', label: 'Sitio Web', url: 'https://example.com' },
      ]);
    });
  });

  describe('POST /pages/:id/publish', () => {
    it('debe publicar una página', async () => {
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/${pageId}/publish?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(res.body.id).toBe(pageId);
      expect(res.body.status).toBe('PUBLISHED');
      expect(res.body.publishedVersionId).toBeTruthy();
    });
  });

  describe('POST /pages/:id/unpublish', () => {
    it('debe despublicar una página publicada', async () => {
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/${pageId}/unpublish?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(res.body.id).toBe(pageId);
      expect(res.body.status).toBe('DRAFT');
      expect(res.body.publishedVersionId).toBeNull();
    });
  });

  describe('PATCH /pages/:id/status', () => {
    it('debe cambiar el estado de la página', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${baseUrl}/${pageId}/status?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'PAUSED' })
        .expect(200);

      expect(res.body.status).toBe('PAUSED');
    });
  });

  describe('DELETE /pages/:id', () => {
    it('debe eliminar una página', async () => {
      const createRes = await request(app.getHttpServer())
        .post(`${baseUrl}?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ slug: 'page-to-delete' })
        .expect(201);

      const deleteRes = await request(app.getHttpServer())
        .delete(`${baseUrl}/${createRes.body.id}?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(deleteRes.body).toHaveProperty('message');
      await request(app.getHttpServer())
        .get(`${baseUrl}/${createRes.body.id}?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
