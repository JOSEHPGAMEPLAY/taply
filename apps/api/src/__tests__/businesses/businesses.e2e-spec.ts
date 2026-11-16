import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';

/**
 * Pruebas de integración del módulo de Negocios.
 *
 * Verifica CRUD completo con ownership verification y control de acceso.
 */
describe('Businesses (E2E)', () => {
  let app: INestApplication;
  let accessToken1: string;
  let accessToken2: string;
  let businessId: string;

  const baseUrl = '/api/v1/businesses';

  // Helper para registrar e iniciar sesión
  async function loginAs(email: string, password: string): Promise<string> {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password, name: 'Test User' });

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password });

    return res.body.accessToken;
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

    // Crear dos usuarios para probar ownership
    accessToken1 = await loginAs(
      `biz-owner-${Date.now()}@example.com`,
      'Password123'
    );
    accessToken2 = await loginAs(
      `biz-other-${Date.now()}@example.com`,
      'Password123'
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /businesses', () => {
    it('debe crear un negocio exitosamente', async () => {
      const res = await request(app.getHttpServer())
        .post(baseUrl)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({
          name: 'Mi Negocio de Prueba',
          description: 'Descripción de prueba',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Mi Negocio de Prueba');
      expect(res.body).toHaveProperty('slug');
      expect(res.body.status).toBe('PROSPECT');

      businessId = res.body.id;
    });

    it('debe fallar sin autenticación (401)', async () => {
      await request(app.getHttpServer())
        .post(baseUrl)
        .send({
          name: 'Sin Auth',
        })
        .expect(401);
    });
  });

  describe('GET /businesses', () => {
    it('debe listar los negocios del usuario', async () => {
      const res = await request(app.getHttpServer())
        .get(baseUrl)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('debe retornar lista vacía para usuario sin negocios', async () => {
      const res = await request(app.getHttpServer())
        .get(baseUrl)
        .set('Authorization', `Bearer ${accessToken2}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe('GET /businesses/:id', () => {
    it('debe obtener un negocio por ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/${businessId}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(res.body.id).toBe(businessId);
    });

    it('debe fallar si el negocio no existe (404)', async () => {
      await request(app.getHttpServer())
        .get(`${baseUrl}/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(404);
    });
  });

  describe('PATCH /businesses/:id', () => {
    it('debe actualizar un negocio', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${baseUrl}/${businessId}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({
          name: 'Negocio Actualizado',
        })
        .expect(200);

      expect(res.body.name).toBe('Negocio Actualizado');
    });

    it('debe fallar si otro usuario intenta actualizar (404 o 403)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${baseUrl}/${businessId}`)
        .set('Authorization', `Bearer ${accessToken2}`)
        .send({
          name: 'Intento no autorizado',
        });
      expect([403, 404]).toContain(res.status);
    });
  });

  describe('DELETE /businesses/:id', () => {
    it('debe eliminar un negocio', async () => {
      // Crear un negocio para eliminar
      const createRes = await request(app.getHttpServer())
        .post(baseUrl)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({
          name: 'Negocio a Eliminar',
        })
        .expect(201);

      const deleteRes = await request(app.getHttpServer())
        .delete(`${baseUrl}/${createRes.body.id}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(deleteRes.body).toHaveProperty('message');
    });

    it('debe fallar si otro usuario intenta eliminar (404 o 403)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${baseUrl}/${businessId}`)
        .set('Authorization', `Bearer ${accessToken2}`);
      expect([403, 404]).toContain(res.status);
    });
  });
});
