import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsNotEmpty, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({
    example: 1,
    description: 'Sepete eklenecek ürünün ID\'si',
  })
  @IsInt({ message: 'Ürün ID tam sayı olmalıdır' })
  @IsPositive({ message: 'Ürün ID pozitif bir değer olmalıdır' })
  @IsNotEmpty({ message: 'Ürün ID boş olamaz' })
  productId: number;

  @ApiProperty({
    example: 1,
    description: 'Eklenecek ürün adedi',
    default: 1,
  })
  @IsInt({ message: 'Adet tam sayı olmalıdır' })
  @Min(1, { message: 'Adet en az 1 olmalıdır' })
  quantity: number;
}
