import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
  ) {}

  async createFromCart(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    const { cart, totalAmount } = await this.cartService.getCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Sepetiniz boş. Sipariş oluşturmak için sepete ürün ekleyiniz');
    }

    for (const item of cart.items) {
      if (item.product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `'${item.product.name}' ürünü için yeterli stok bulunmamaktadır. Mevcut stok: ${item.product.stockQuantity}, Sepetteki miktar: ${item.quantity}`,
        );
      }
    }

    const order = this.orderRepository.create({
      user: { id: userId } as any,
      totalAmount,
      status: OrderStatus.PENDING,
      shippingAddress: createOrderDto.shippingAddress,
    });

    const savedOrder = await this.orderRepository.save(order);

    const orderItems = cart.items.map((cartItem) => {
      const unitPrice = Number(cartItem.product.price);
      const itemTotalPrice = unitPrice * cartItem.quantity;

      return this.orderItemRepository.create({
        order: { id: savedOrder.id } as any,
        product: { id: cartItem.product.id } as any,
        quantity: cartItem.quantity,
        unitPrice,
        totalPrice: Math.round(itemTotalPrice * 100) / 100,
      });
    });

    await this.orderItemRepository.save(orderItems);

    for (const item of cart.items) {
      await this.productsService.decreaseStock(item.product.id, item.quantity);
    }

    await this.cartService.clearCart(userId);

    return this.findOne(userId, savedOrder.id);
  }

  async findAllByUser(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: number, orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Sipariş bulunamadı (ID: ${orderId})`);
    }

    return order;
  }
}
