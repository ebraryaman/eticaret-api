import {
  Controller,
  Get,
  Post,
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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Sipariş oluştur',
    description: 'Sepetteki ürünleri siparişe dönüştürür. Sepet temizlenir ve stok güncellenir',
  })
  @ApiResponse({
    status: 201,
    description: 'Sipariş başarıyla oluşturuldu',
    type: Order,
  })
  @ApiResponse({ status: 400, description: 'Sepet boş veya yetersiz stok' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  createOrder(
    @CurrentUser() user: User,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createFromCart(user.id, createOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Siparişleri listele',
    description: 'Giriş yapmış kullanıcının tüm siparişlerini listeler',
  })
  @ApiResponse({
    status: 200,
    description: 'Sipariş listesi başarıyla getirildi',
    type: [Order],
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  findAll(@CurrentUser() user: User) {
    return this.ordersService.findAllByUser(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Sipariş detayı',
    description: 'Belirtilen ID\'ye sahip siparişin detayını getirir',
  })
  @ApiParam({ name: 'id', description: 'Sipariş ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Sipariş detayı başarıyla getirildi',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  findOne(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOne(user.id, id);
  }
}
