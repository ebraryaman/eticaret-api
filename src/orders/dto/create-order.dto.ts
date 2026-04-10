import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @ApiPropertyOptional({
    example: 'Atatürk Cad. No:1, Kadıköy, İstanbul',
    description: 'Teslimat adresi',
  })
  @IsString({ message: 'Teslimat adresi metin olmalıdır' })
  @IsOptional()
  @MaxLength(500, { message: 'Teslimat adresi en fazla 500 karakter olabilir' })
  shippingAddress?: string;
}
