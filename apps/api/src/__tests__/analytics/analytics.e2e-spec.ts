import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';

/**
 * Pruebas de integración del módulo de Analytics.
 *
 * Verifica obtención de estadísticas y eventos.
 */
describe('Analytics (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;
  let businessId: string;
  let pageId: string;

  const baseUrl = '/api/v1/analytics';

  async function setupTestData() {
    const email = `analytics-test-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123', name: 'Analytics Test' });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123' });
    accessToken = loginRes.body.accessToken;

    const bizRes = await request(app.getHttpServer())
      .post('/api/v1/businesses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Analytics Test Business' });
    businessId = bizRes.body.id;

    const pageRes = await request(app.getHttpServer())
      .post('/api/v1/pages?businessId=' + businessId)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ slug: 'analytics-test-page' });
    pageId = pageRes.body.id;

    await request(app.getHttpServer())
      .post(`/api/v1/pages/${pageId}/publish?businessId=` + businessId)
      .set('Authorization', `Bearer ${accessToken}`);
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

  describe('GET /analytics/stats', () => {
    it('debe obtener estadísticas de una página', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/stats?pageId=${pageId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('totalViews');
      expect(res.body).toHaveProperty('totalClicks');
    });

    it('debe fallar sin autenticación (401)', async () => {
      await request(app.getHttpServer())
        .get(`${baseUrl}/stats?pageId=${pageId}`)
        .expect(401);
    });
  });

  describe('GET /analytics/export', () => {
    it('debe descargar los eventos como CSV', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/export?pageId=${pageId}&rangeDays=7`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.headers['content-type']).toMatch(/text\/csv; charset=utf-8/);
      expect(res.headers['content-disposition']).toContain('attachment; filename="taply-analytics.csv"');
      expect(res.text).toContain('"fecha","tipo","boton","tagId"');
    });

    it('debe requerir autenticación', async () => {
      await request(app.getHttpServer())
        .get(`${baseUrl}/export?pageId=${pageId}`)
        .expect(401);
    });
  });
});
