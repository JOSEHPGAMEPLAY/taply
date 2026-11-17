import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';

/**
 * Pruebas de integración del módulo de Autenticación.
 *
 * Verifica que el flujo completo de registro, login y acceso
 * a rutas protegidas funciona correctamente contra la API real.
 */
describe('Auth (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  const baseUrl = '/api/v1/auth';

  describe('POST /auth/register', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      const email = `test-${Date.now()}@example.com`;
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send({
          email,
          password: 'Password123',
          name: 'Usuario Prueba',
        })
        .expect(201);

      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(email);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('debe fallar con email duplicado (409)', async () => {
      const email = `duplicate-${Date.now()}@example.com`;
      // Primer registro
      await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send({
          email,
          password: 'Password123',
          name: 'Usuario Duplicado',
        })
        .expect(201);

      // Segundo registro con el mismo email
      await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send({
          email,
          password: 'Password123',
          name: 'Otro Usuario',
        })
        .expect(409);
    });

    it('debe fallar con contraseña inválida (400)', async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send({
          email: `weak-${Date.now()}@example.com`,
          password: '123',
          name: 'Contraseña Débil',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    const loginEmail = `login-${Date.now()}@example.com`;

    beforeAll(async () => {
      // Registrar usuario para las pruebas de login
      await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send({
          email: loginEmail,
          password: 'Password123',
          name: 'Login Test User',
        });
    });

    it('debe iniciar sesión con credenciales válidas', async () => {
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/login`)
        .send({
          email: loginEmail,
          password: 'Password123',
        })
        .expect(201);

      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(loginEmail);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');

      accessToken = res.body.accessToken;
    });

    it('debe fallar con credenciales inválidas (401)', async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}/login`)
        .send({
          email: loginEmail,
          password: 'WrongPassword1',
        })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('debe fallar sin token (401)', async () => {
      await request(app.getHttpServer())
        .get(`${baseUrl}/me`)
        .expect(401);
    });

    it('debe retornar el perfil con token válido', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('name');
    });
  });
});
