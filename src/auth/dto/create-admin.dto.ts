import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'Admin Kullanıcı' })
  @IsString()
  @IsNotEmpty({ message: 'Ad Soyad boş olamaz' })
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'admin2@eticaret.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta giriniz' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'gucluSifre123' })
  @IsString()
  @IsNotEmpty({ message: 'Şifre boş olamaz' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  @MaxLength(50)
  password: string;
}
