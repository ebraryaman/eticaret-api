import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

export interface CartSummary {
  cart: Cart;
  totalItems: number;
  totalAmount: number;
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
  ) {}

  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user: { id: userId } as any,
        items: [],
      });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async getCart(userId: number): Promise<CartSummary> {
    const cart = await this.getOrCreateCart(userId);
    return this.buildCartSummary(cart);
  }

  async addItem(userId: number, addToCartDto: AddToCartDto): Promise<CartSummary> {
    const { productId, quantity } = addToCartDto;

    const product = await this.productsService.findOneByIdForCart(productId);

    if (product.stockQuantity < quantity) {
      throw new BadRequestException(
        `'${product.name}' için yeterli stok bulunmamaktadır. Mevcut stok: ${product.stockQuantity}`,
      );
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItem = cart.items?.find(
      (item) => item.product?.id === productId,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (product.stockQuantity < newQuantity) {
        throw new BadRequestException(
          `'${product.name}' için yeterli stok bulunmamaktadır. Mevcut stok: ${product.stockQuantity}, Sepetteki miktar: ${existingItem.quantity}`,
        );
      }

      existingItem.quantity = newQuantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const cartItem = this.cartItemRepository.create({
        cart: { id: cart.id } as any,
        product: { id: productId } as any,
        quantity,
      });
      await this.cartItemRepository.save(cartItem);
    }

    const updatedCart = await this.getOrCreateCart(userId);
    return this.buildCartSummary(updatedCart);
  }

  async updateItem(
    userId: number,
    itemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartSummary> {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cart: { id: cart.id } },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException(`Sepet öğesi bulunamadı (ID: ${itemId})`);
    }

    if (updateCartItemDto.quantity === 0) {
      await this.cartItemRepository.remove(cartItem);
    } else {
      if (cartItem.product.stockQuantity < updateCartItemDto.quantity) {
        throw new BadRequestException(
          `'${cartItem.product.name}' için yeterli stok bulunmamaktadır. Mevcut stok: ${cartItem.product.stockQuantity}`,
        );
      }

      cartItem.quantity = updateCartItemDto.quantity;
      await this.cartItemRepository.save(cartItem);
    }

    const updatedCart = await this.getOrCreateCart(userId);
    return this.buildCartSummary(updatedCart);
  }

  async removeItem(userId: number, itemId: number): Promise<CartSummary> {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cart: { id: cart.id } },
    });

    if (!cartItem) {
      throw new NotFoundException(`Sepet öğesi bulunamadı (ID: ${itemId})`);
    }

    await this.cartItemRepository.remove(cartItem);

    const updatedCart = await this.getOrCreateCart(userId);
    return this.buildCartSummary(updatedCart);
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    await this.cartItemRepository.delete({ cart: { id: cart.id } });
  }

  private buildCartSummary(cart: Cart): CartSummary {
    const totalItems = cart.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
    const totalAmount = cart.items?.reduce(
      (sum, item) => sum + Number(item.product?.price ?? 0) * item.quantity,
      0,
    ) ?? 0;

    return {
      cart,
      totalItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }
}
