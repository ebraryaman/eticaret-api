import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'eskiSifre123' })
  @IsString()
  @IsNotEmpty({ message: 'Mevcut şifre boş olamaz' })
  currentPassword: string;

  @ApiProperty({ example: 'yeniSifre123' })
  @IsString()
  @IsNotEmpty({ message: 'Yeni şifre boş olamaz' })
  @MinLength(6, { message: 'Yeni şifre en az 6 karakter olmalıdır' })
  @MaxLength(50, { message: 'Yeni şifre en fazla 50 karakter olabilir' })
  newPassword: string;
}
