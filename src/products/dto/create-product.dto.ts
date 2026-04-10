import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsUrl,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Akıllı Telefon X Pro',
    description: 'Ürün adı',
  })
  @IsString()
  @IsNotEmpty({ message: 'Ürün adı boş olamaz' })
  @MaxLength(200, { message: 'Ürün adı en fazla 200 karakter olabilir' })
  name: string;

  @ApiPropertyOptional({
    example: 'En yeni teknoloji ile donatılmış akıllı telefon',
    description: 'Ürün açıklaması',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 4999.99,
    description: 'Ürün fiyatı (TL)',
  })
  @IsNumber({}, { message: 'Fiyat sayısal bir değer olmalıdır' })
  @IsPositive({ message: 'Fiyat pozitif bir değer olmalıdır' })
  price: number;

  @ApiPropertyOptional({
    example: 'https://example.com/images/phone.jpg',
    description: 'Ürün görseli URL',
  })
  @IsUrl({}, { message: 'Geçerli bir URL giriniz' })
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    example: 50,
    description: 'Stok miktarı',
    default: 0,
  })
  @IsInt({ message: 'Stok miktarı tam sayı olmalıdır' })
  @Min(0, { message: 'Stok miktarı 0\'dan küçük olamaz' })
  stockQuantity: number;
}
