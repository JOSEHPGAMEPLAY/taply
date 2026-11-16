import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * BillingController - Endpoints de facturación.
 *
 * Todos los endpoints requieren autenticación JWT.
 *
 * Endpoints:
 * - POST /billing/products - Crear producto
 * - GET /billing/products - Listar productos
 * - POST /billing/orders - Crear orden
 */
@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('products')
  @ApiOperation({ summary: 'Crear producto de facturación', description: 'Crea un nuevo producto (one-time o subscription).' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.billingService.createProduct(dto);
  }

  @Get('products')
  @ApiOperation({ summary: 'Listar productos', description: 'Retorna todos los productos de facturación disponibles.' })
  @ApiResponse({ status: 200, description: 'Lista de productos' })
  async findAllProducts() {
    return this.billingService.findAllProducts();
  }

  @Post('orders')
  @ApiOperation({ summary: 'Crear orden', description: 'Crea una nueva orden con items de facturación.' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Orden creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Negocio o producto no encontrado' })
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.billingService.createOrder(dto);
  }
}
