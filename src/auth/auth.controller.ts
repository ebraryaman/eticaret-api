import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Yeni kullanıcı kaydı',
    description: 'Yeni bir kullanıcı hesabı oluşturur ve JWT token döner',
  })
  @ApiResponse({
    status: 201,
    description: 'Kullanıcı başarıyla oluşturuldu',
    schema: {
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Ahmet Yılmaz' },
            email: { type: 'string', example: 'ahmet@example.com' },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Bu e-posta adresi zaten kullanılıyor' })
  @ApiResponse({ status: 400, description: 'Geçersiz istek verisi' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Kullanıcı girişi',
    description: 'E-posta ve şifre ile giriş yaparak JWT token alır',
  })
  @ApiResponse({
    status: 200,
    description: 'Giriş başarılı',
    schema: {
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Ahmet Yılmaz' },
            email: { type: 'string', example: 'ahmet@example.com' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'E-posta adresi veya şifre hatalı' })
  @ApiResponse({ status: 400, description: 'Geçersiz istek verisi' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kullanıcı profili',
    description: 'Giriş yapmış kullanıcının profil bilgilerini döner (Korumalı endpoint)',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil bilgileri',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }
}
