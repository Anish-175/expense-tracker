import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category, CategoryType } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from '../user/entities/user.entity';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';
import { CategoryResponseDto } from './dto/category-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // create a new category
  async create(
    createCategoryDto: CreateCategoryDto,
    user: CurrentUserPayload, //get user from payload
  ): Promise<CategoryResponseDto> {
    try {
      const { name } = createCategoryDto; //destructure category fields from the dto

      // Check if category with that name exists, including soft-deleted
      const existingCategory = await this.categoryRepository.findOne({
        where: {
          name,
          user: { id: user.userId },
        },
        withDeleted: true,
        relations: ['user'],
      });
      // Case 1: Already exists and is active
      if (existingCategory && !existingCategory.deleted_at) {
        throw new ConflictException(
          'Category name already exists for this scope',
        );
      }

      // Case 2: Soft-deleted — restore it
      if (existingCategory && existingCategory.deleted_at) {
        await this.categoryRepository.recover(existingCategory);

        // Optionally update other fields (like icon, type) if provided in DTO
        Object.assign(existingCategory, createCategoryDto);
        const restored = await this.categoryRepository.save(existingCategory);

        return plainToInstance(CategoryResponseDto, restored, {
          excludeExtraneousValues: true,
        });
      }

      //case-3 new category
      const foundUser = await this.userRepository.findOne({
        where: { id: user.userId },
        select: { id: true }, //only get id field.
      });

      //in case user does not exist
      if (!foundUser) {
        throw new NotFoundException('User not found');
      }

      //create a category with select fields and user is categoryUser
      const category = this.categoryRepository.create({
        ...createCategoryDto,
        user: foundUser, //assign the found user data to category, userId in this case.
      });

      const savedCategory = await this.categoryRepository.save(category); //saves data to database

      return plainToInstance(CategoryResponseDto, savedCategory, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      //other errors
      console.error('Error in CategoryService.create:', {
        message: error.message,
        stack: error.stack,
        user,
        createCategoryDto,
      });
      throw new InternalServerErrorException(
        `Failed to create category: ${error.message}`,
      );
    }
  }

  //returns all categories

  async findAll(user: CurrentUserPayload): Promise<CategoryResponseDto[]> {
    try {
      const categories = await this.categoryRepository.find({
        where: { user: { id: user.userId } },
      });

      return plainToInstance(CategoryResponseDto, categories, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error in CategoryService.findAll:', {
        message: error.message,
        stack: error.stack,
        user,
      });
      throw new InternalServerErrorException(
        `Failed to fetch categories: ${error.message}`,
      );
    }
  }

  //returns a single category by id
  async findOne(
    id: number,
    user: CurrentUserPayload,
  ): Promise<CategoryResponseDto> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
        relations: ['user'],
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      if (
        category.user &&
        category.user.id !== user.userId //only the user can access private categories
      ) {
        throw new ForbiddenException(
          'You do not have permission to access this category',
        );
      }
      return plainToInstance(CategoryResponseDto, category, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error in CategoryService.findOne:', {
        message: error.message,
        stack: error.stack,
        id,
        user,
      });
      throw new InternalServerErrorException(
        `Failed to fetch category: ${error.message}`,
      );
    }
  }
  //update a category by id
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    user: CurrentUserPayload,
  ): Promise<CategoryResponseDto> {
    try {
      const category = await this.findOne(id, user); // Get existing category

      if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
        // Check if a category (active or deleted) with the new name exists
        const existingWithDeleted = await this.categoryRepository.findOne({
          where: {
            name: updateCategoryDto.name,
            user: { id: user.userId },
          },
          withDeleted: true, // includes soft-deleted records
        });

        if (existingWithDeleted) {
          if (!existingWithDeleted.deleted_at) {
            // Active category with the same name already exists
            throw new ConflictException(
              'Category name already exists for this scope',
            );
          } else if (existingWithDeleted.id !== id) {
            // Soft-deleted category with the same name exists — restore it or error
            await this.categoryRepository.recover(existingWithDeleted);
            await this.categoryRepository.recover(existingWithDeleted);
            return plainToInstance(CategoryResponseDto, existingWithDeleted, {
              excludeExtraneousValues: true,
            });
          }
        }
      }
      // Merge updates
      Object.assign(category, updateCategoryDto);

      const savedCategory = await this.categoryRepository.save(category);

      return plainToInstance(CategoryResponseDto, savedCategory, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error in CategoryService.update:', {
        message: error.message,
        stack: error.stack,
        id,
        user,
        updateCategoryDto,
      });
      throw new InternalServerErrorException(
        `Failed to update category: ${error.message}`,
      );
    }
  }

  //remove a category
  async remove(
    id: number,
    user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    try {
      const category = await this.findOne(id, user);
      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      await this.categoryRepository.softDelete(id);
      return { message: 'Category deleted successfully' };
    } catch (error) {
      console.error('Error in CategoryService.remove:', {
        message: error.message,
        stack: error.stack,
        id,
        user,
      });
      throw new InternalServerErrorException(
        `Failed to delete category: ${error.message}`,
      );
    }
  }

  //seed default categories on registration
  async initializeDefaultCategories(user: User): Promise<void> {
    try {
      const defaultCategories: Partial<Category>[] = [
        {
          name: 'Food',
          type: CategoryType.EXPENSE,
          color: '#FF0000',
        },
        {
          name: 'Rent',
          type: CategoryType.EXPENSE,
          color: '#FFA500',
        },
        {
          name: 'Utilities',
          type: CategoryType.EXPENSE,
          color: '#008000',
        },
        {
          name: 'Entertainment',
          type: CategoryType.EXPENSE,
          color: '#0000FF',
        },
        {
          name: 'Salary',
          type: CategoryType.INCOME,
          color: '#800080',
        },
      ];

      for (const cat of defaultCategories) {
        const existing = await this.categoryRepository.findOne({
          where: { name: cat.name, user: { id: user.id } },
          withDeleted: true,
        });

        if (existing) {
          if (existing.deleted_at) {
            // recover soft-deleted
            await this.categoryRepository.recover(existing);
          }
          continue; // skip creation if already exists (active or soft-deleted)
        }

        const newCategory = this.categoryRepository.create({
          ...cat,
          is_default: true,
          user,
        });

        await this.categoryRepository.save(newCategory);
      }
    } catch (error) {
      console.error('Error in initializeDefaultCategoriesForUser:', {
        message: error.message,
        stack: error.stack,
        userId: user.id,
      });
      throw new InternalServerErrorException(
        `Failed to initialize default categories for user ${user.id}: ${error.message}`,
      );
    }
  }
}
