import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';

/**
 * Pruebas de integración del módulo de códigos QR.
 *
 * Verifica generación y obtención de QR codes para páginas.
 */
describe('QR (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;
  let businessId: string;
  let pageId: string;

  const qrBaseUrl = '/api/v1/qr';

  // Helper para registrar, crear negocio y página publicada
  async function setupTestData() {
    const email = `qr-test-${Date.now()}@example.com`;

    // Register
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123', name: 'QR Test' });

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123' });
    accessToken = loginRes.body.accessToken;

    // Create business
    const bizRes = await request(app.getHttpServer())
      .post('/api/v1/businesses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'QR Test Business' });
    businessId = bizRes.body.id;

    // Create page
    const pageRes = await request(app.getHttpServer())
      .post('/api/v1/pages?businessId=' + businessId)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ slug: 'qr-test-page' });
    pageId = pageRes.body.id;

    // Publish page
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

  describe('POST /qr/generate', () => {
    it('debe generar un QR code para una página publicada', async () => {
      const res = await request(app.getHttpServer())
        .post(`${qrBaseUrl}/generate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ pageId })
        .expect(201);

      expect(res.body).toHaveProperty('dataUrl');
      expect(res.body.dataUrl).toMatch(/^data:image\/png;base64,/);
      expect(res.body).toHaveProperty('publicUrl');
    });

    it('debe fallar sin autenticación (401)', async () => {
      await request(app.getHttpServer())
        .post(`${qrBaseUrl}/generate`)
        .send({ pageId })
        .expect(401);
    });

    it('debe fallar con pageId inválido (404)', async () => {
      await request(app.getHttpServer())
        .post(`${qrBaseUrl}/generate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ pageId: '00000000-0000-0000-0000-000000000000' })
        .expect(404);
    });
  });

  describe('GET /qr/:pageId', () => {
    it('debe obtener el QR code existente para una página', async () => {
      const res = await request(app.getHttpServer())
        .get(`${qrBaseUrl}/${pageId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('dataUrl');
      expect(res.body.dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('debe fallar si la página no tiene QR (404)', async () => {
      // Crear otra página sin QR
      const pageRes = await request(app.getHttpServer())
        .post('/api/v1/pages?businessId=' + businessId)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ slug: 'no-qr-page' });

      await request(app.getHttpServer())
        .get(`${qrBaseUrl}/${pageRes.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
