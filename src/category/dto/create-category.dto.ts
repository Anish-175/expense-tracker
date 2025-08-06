import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  Length,
  Matches,
} from 'class-validator';
import { CategoryType} from '../entities/category.entity';

export class CreateCategoryDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsEnum(CategoryType)
  type: CategoryType;

  @IsString()
  @Length(7, 7)
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex code (e.g., #FF0000)',
  })
  color: string;

  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}
