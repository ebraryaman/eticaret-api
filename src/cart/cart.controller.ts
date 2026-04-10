import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({
    summary: 'Sepeti görüntüle',
    description: 'Giriş yapmış kullanıcının sepetini ve toplam tutarı getirir',
  })
  @ApiResponse({
    status: 200,
    description: 'Sepet bilgileri başarıyla getirildi',
    schema: {
      properties: {
        cart: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  quantity: { type: 'number', example: 2 },
                  product: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 1 },
                      name: { type: 'string', example: 'Akıllı Telefon X Pro' },
                      price: { type: 'number', example: 4999.99 },
                      imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
                    },
                  },
                },
              },
            },
          },
        },
        totalItems: { type: 'number', example: 3 },
        totalAmount: { type: 'number', example: 14999.97 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  getCart(@CurrentUser() user: User) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sepete ürün ekle',
    description: 'Giriş yapmış kullanıcının sepetine ürün ekler. Ürün zaten sepette varsa adedi artırılır',
  })
  @ApiResponse({
    status: 200,
    description: 'Ürün sepete başarıyla eklendi',
  })
  @ApiResponse({ status: 400, description: 'Yetersiz stok veya geçersiz veri' })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  addItem(@CurrentUser() user: User, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addItem(user.id, addToCartDto);
  }

  @Put('items/:itemId')
  @ApiOperation({
    summary: 'Sepet ürün adedini güncelle',
    description: 'Sepetteki bir ürünün adedini günceller. Adet 0 gönderilirse ürün sepetten kaldırılır',
  })
  @ApiParam({ name: 'itemId', description: 'Sepet öğesi ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Sepet öğesi başarıyla güncellendi',
  })
  @ApiResponse({ status: 400, description: 'Yetersiz stok veya geçersiz veri' })
  @ApiResponse({ status: 404, description: 'Sepet öğesi bulunamadı' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  updateItem(
    @CurrentUser() user: User,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, itemId, updateCartItemDto);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sepetten ürün çıkar',
    description: 'Belirtilen sepet öğesini sepetten kaldırır',
  })
  @ApiParam({ name: 'itemId', description: 'Sepet öğesi ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Ürün sepetten başarıyla çıkarıldı',
  })
  @ApiResponse({ status: 404, description: 'Sepet öğesi bulunamadı' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  removeItem(
    @CurrentUser() user: User,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.cartService.removeItem(user.id, itemId);
  }
}
