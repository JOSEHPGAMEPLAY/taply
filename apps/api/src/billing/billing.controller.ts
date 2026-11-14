import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * BillingController - Endpoints de facturación.
 */
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('products')
  async createProduct(@Body() dto: CreateProductDto) {
    return this.billingService.createProduct(dto);
  }

  @Get('products')
  async findAllProducts() {
    return this.billingService.findAllProducts();
  }

  @Post('orders')
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.billingService.createOrder(dto);
  }
}
