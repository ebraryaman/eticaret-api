import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    example: 3,
    description: 'Güncellenecek ürün adedi (0 gönderilirse ürün sepetten kaldırılır)',
    minimum: 0,
  })
  @IsInt({ message: 'Adet tam sayı olmalıdır' })
  @Min(0, { message: 'Adet 0\'dan küçük olamaz' })
  quantity: number;
}
