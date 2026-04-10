import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException(`Ürün bulunamadı (ID: ${id})`);
    }

    return product;
  }

  async findOneByIdForCart(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException(`Ürün bulunamadı (ID: ${id})`);
    }

    if (product.stockQuantity < 1) {
      throw new BadRequestException(`'${product.name}' ürünü stokta bulunmamaktadır`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Ürün bulunamadı (ID: ${id})`);
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Ürün bulunamadı (ID: ${id})`);
    }

    product.isActive = false;
    await this.productRepository.save(product);
  }

  async decreaseStock(productId: number, quantity: number): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Ürün bulunamadı (ID: ${productId})`);
    }

    if (product.stockQuantity < quantity) {
      throw new BadRequestException(
        `'${product.name}' için yeterli stok bulunmamaktadır. Mevcut stok: ${product.stockQuantity}`,
      );
    }

    product.stockQuantity -= quantity;
    await this.productRepository.save(product);
  }
}
