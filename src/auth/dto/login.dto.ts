import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'ahmet@example.com',
    description: 'Kullanıcı e-posta adresi',
  })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @IsNotEmpty({ message: 'E-posta adresi boş olamaz' })
  email: string;

  @ApiProperty({
    example: 'guclu_sifre123',
    description: 'Kullanıcı şifresi',
  })
  @IsString()
  @IsNotEmpty({ message: 'Şifre boş olamaz' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password: string;
}
