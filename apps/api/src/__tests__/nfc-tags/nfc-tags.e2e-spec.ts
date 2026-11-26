import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';

/**
 * Pruebas de integración del módulo de NFC Tags.
 *
 * Verifica CRUD, asignación/desasignación y escaneo de etiquetas NFC.
 */
describe('NFC Tags (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;
  let businessId: string;
  let pageId: string;
  let tagId: string;

  const baseUrl = '/api/v1/nfc-tags';

  async function setupTestData() {
    const email = `nfc-test-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123', name: 'NFC Test' });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123' });
    accessToken = loginRes.body.accessToken;

    const bizRes = await request(app.getHttpServer())
      .post('/api/v1/businesses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'NFC Test Business' });
    businessId = bizRes.body.id;

    const pageRes = await request(app.getHttpServer())
      .post('/api/v1/pages?businessId=' + businessId)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ slug: 'nfc-test-page' });
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

  describe('POST /nfc-tags', () => {
    it('debe crear una etiqueta NFC exitosamente', async () => {
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('token');
      expect(res.body.status).toBe('INVENTORY');
      tagId = res.body.id;
    });

    it('debe fallar sin autenticación (401)', async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}?businessId=${businessId}`)
        .send({})
        .expect(401);
    });
  });

  describe('GET /nfc-tags', () => {
    it('debe listar las etiquetas del negocio', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /nfc-tags/:id', () => {
    it('debe obtener una etiqueta por ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/${tagId}?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(tagId);
    });
  });

  describe('POST /nfc-tags/:id/assign', () => {
    it('debe asignar una etiqueta a una página', async () => {
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/${tagId}/assign?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ pageId })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('ACTIVE');
    });
  });

  describe('POST /nfc-tags/:id/scan', () => {
    it('debe registrar un escaneo de etiqueta (requiere auth)', async () => {
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/${tagId}/scan`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(res.body).toHaveProperty('scanned');
    });
  });

  describe('POST /nfc-tags/:id/unassign', () => {
    it('debe desasignar una etiqueta y devolverla al inventario', async () => {
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/${tagId}/unassign?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(res.body.id).toBe(tagId);
      expect(res.body.status).toBe('INVENTORY');

      const tagRes = await request(app.getHttpServer())
        .get(`${baseUrl}/${tagId}?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(tagRes.body.status).toBe('INVENTORY');
    });

    it('debe rechazar una etiqueta que ya no tiene una asignación activa', async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}/${tagId}/unassign?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  describe('DELETE /nfc-tags/:id', () => {
    it('debe eliminar una etiqueta y dejar de encontrarla', async () => {
      const createRes = await request(app.getHttpServer())
        .post(`${baseUrl}?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(201);

      const deleteRes = await request(app.getHttpServer())
        .delete(`${baseUrl}/${createRes.body.id}?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(deleteRes.body.message).toBe('Etiqueta eliminada exitosamente');

      await request(app.getHttpServer())
        .get(`${baseUrl}/${createRes.body.id}?businessId=${businessId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
