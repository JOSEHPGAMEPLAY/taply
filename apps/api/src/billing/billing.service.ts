import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateOrderDto } from './dto/create-order.dto';

/**
 * BillingService - Gestiona productos y órdenes de facturación.
 */
@Injectable()
export class BillingService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async createProduct(dto: CreateProductDto) {
    return this.prisma.billingProduct.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        price: dto.price,
        currency: dto.currency || 'USD',
        interval: dto.interval,
      },
    });
  }

  async findAllProducts() {
    return this.prisma.billingProduct.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createOrder(dto: CreateOrderDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
    });
    if (!business) throw new NotFoundException('Negocio no encontrado');

    let subtotal = 0;
    const items = await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.prisma.billingProduct.findUnique({
          where: { id: item.productId },
        });
        if (!product) throw new NotFoundException(`Producto ${item.productId} no encontrado`);
        const total = Number(product.price) * item.quantity;
        subtotal += total;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          total,
        };
      }),
    );

    const orderNumber = `ORD-${Date.now()}`;
    return this.prisma.order.create({
      data: {
        businessId: dto.businessId,
        number: orderNumber,
        subtotal,
        total: subtotal,
        currency: 'USD',
        items: { create: items },
      },
      include: { items: true },
    });
  }
}
