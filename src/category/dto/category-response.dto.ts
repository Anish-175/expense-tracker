import { Expose } from 'class-transformer';
import { CategoryType } from '../entities/category.entity';

export class CategoryResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  type: CategoryType;

  @Expose()
  color: string;

  @Expose()
  createdAt: Date;
}
