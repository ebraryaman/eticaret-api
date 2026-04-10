import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Ahmet Yılmaz',
    description: 'Kullanıcı adı soyadı',
  })
  @IsString()
  @IsNotEmpty({ message: 'Ad Soyad boş olamaz' })
  @MaxLength(100, { message: 'Ad Soyad en fazla 100 karakter olabilir' })
  name: string;

  @ApiProperty({
    example: 'ahmet@example.com',
    description: 'Kullanıcı e-posta adresi',
  })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @IsNotEmpty({ message: 'E-posta adresi boş olamaz' })
  email: string;

  @ApiProperty({
    example: 'guclu_sifre123',
    description: 'Kullanıcı şifresi (en az 6 karakter)',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Şifre boş olamaz' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  @MaxLength(50, { message: 'Şifre en fazla 50 karakter olabilir' })
  password: string;
}
