import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    example: true,
    description: 'Ürünün aktif/pasif durumu',
  })
  @IsBoolean({ message: 'isActive boolean bir değer olmalıdır' })
  @IsOptional()
  isActive?: boolean;
}
