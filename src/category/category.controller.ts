import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';
import { CategoryService } from './category.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: CurrentUserPayload, // full payload from token
  ) {
    return this.categoryService.create(createCategoryDto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<CategoryResponseDto[]> {
    return this.categoryService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseIntPipe()) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.update(id, updateCategoryDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseIntPipe()) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    return this.categoryService.remove(id, user);
  }
}
