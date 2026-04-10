import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Tüm ürünleri listele',
    description: 'Aktif olan tüm ürünleri listeler',
  })
  @ApiResponse({
    status: 200,
    description: 'Ürün listesi başarıyla getirildi',
    type: [Product],
  })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Tekil ürün detayı',
    description: 'Belirtilen ID\'ye sahip ürünün detayını getirir',
  })
  @ApiParam({ name: 'id', description: 'Ürün ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Ürün detayı başarıyla getirildi',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Yeni ürün oluştur',
    description: 'Yeni bir ürün oluşturur (Kimlik doğrulama gerektirir)',
  })
  @ApiResponse({
    status: 201,
    description: 'Ürün başarıyla oluşturuldu',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'Geçersiz istek verisi' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ürün güncelle',
    description: 'Belirtilen ID\'ye sahip ürünü günceller (Kimlik doğrulama gerektirir)',
  })
  @ApiParam({ name: 'id', description: 'Ürün ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Ürün başarıyla güncellendi',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Ürün sil',
    description: 'Belirtilen ID\'ye sahip ürünü pasife alır (Kimlik doğrulama gerektirir)',
  })
  @ApiParam({ name: 'id', description: 'Ürün ID', example: 1 })
  @ApiResponse({ status: 204, description: 'Ürün başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
