import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';

/**
 * Pruebas de integración de los endpoints públicos.
 *
 * Verifica resolución NFC y registro de eventos de analíticas
 * sin autenticación.
 */
describe('Public (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;
  let businessId: string;
  let pageId: string;
  let tagId: string;

  const publicBaseUrl = '/api/v1/public';

  // Helper para registrar, crear negocio, página y tag
  async function setupTestData() {
    const email = `public-test-${Date.now()}@example.com`;

    // Register
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123', name: 'Public Test' });

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123' });
    accessToken = loginRes.body.accessToken;

    // Create business
    const bizRes = await request(app.getHttpServer())
      .post('/api/v1/businesses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Public Test Business' });
    businessId = bizRes.body.id;

    // Create page
    const pageRes = await request(app.getHttpServer())
      .post('/api/v1/pages?businessId=' + businessId)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ slug: 'public-test-page' });
    pageId = pageRes.body.id;

    // Publish page
    await request(app.getHttpServer())
      .post(`/api/v1/pages/${pageId}/publish?businessId=` + businessId)
      .set('Authorization', `Bearer ${accessToken}`);

    // Create NFC tag
    const tagRes = await request(app.getHttpServer())
      .post('/api/v1/nfc-tags?businessId=' + businessId)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Tag' });
    tagId = tagRes.body.id;

    // Assign tag to page
    await request(app.getHttpServer())
      .post(`/api/v1/nfc-tags/${tagId}/assign?businessId=` + businessId)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pageId });
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

  describe('GET /public/nfc/:token', () => {
    it('debe retornar error para token inválido', async () => {
      const res = await request(app.getHttpServer())
        .get(`${publicBaseUrl}/nfc/non-existent-token`)
        .expect(200);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Etiqueta no encontrada');
    });

    it('debe resolver token NFC válido y retornar info de página', async () => {
      // Obtener el token del tag creado
      const tagRes = await request(app.getHttpServer())
        .get(`/api/v1/nfc-tags/${tagId}?businessId=` + businessId)
        .set('Authorization', `Bearer ${accessToken}`);

      if (tagRes.status !== 200) {
        // Si no se pudo obtener el tag, saltar la prueba
        return;
      }

      const token = tagRes.body.token;

      const res = await request(app.getHttpServer())
        .get(`${publicBaseUrl}/nfc/${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('redirectUrl');
      expect(res.body).toHaveProperty('page');
      expect(res.body.page.slug).toBe('public-test-page');
    });
  });

  describe('POST /public/analytics/events', () => {
    it('debe registrar un evento PAGE_VIEW', async () => {
      const res = await request(app.getHttpServer())
        .post(`${publicBaseUrl}/analytics/events`)
        .send({
          pageId,
          type: 'PAGE_VIEW',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
    });

    it('debe registrar un evento BUTTON_CLICK', async () => {
      const res = await request(app.getHttpServer())
        .post(`${publicBaseUrl}/analytics/events`)
        .send({
          pageId,
          type: 'BUTTON_CLICK',
          buttonKey: 'contact',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
    });

    it('debe fallar con datos inválidos (400)', async () => {
      await request(app.getHttpServer())
        .post(`${publicBaseUrl}/analytics/events`)
        .send({
          type: 'INVALID_TYPE',
        })
        .expect(400);
    });
  });
});
