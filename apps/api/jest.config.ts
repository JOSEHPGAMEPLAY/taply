/**
 * Configuración de Jest para el backend de Taply.
 *
 * Usa ts-jest para compilar TypeScript y ejecuta pruebas de integración
 * contra la API real con Supertest. Carga las variables de entorno desde
 * el archivo .env del proyecto para conectar a PostgreSQL.
 */
import type { Config } from 'jest';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Para pruebas locales, usar localhost:5433 (puerto expuesto por Docker) en lugar de postgres:5432
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('@postgres:5432', '@localhost:5433');
}

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        useESM: false,
      },
    ],
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.(t|j)s',
    '!**/*.e2e-spec.(t|j)s',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  verbose: true,
};

export default config;
