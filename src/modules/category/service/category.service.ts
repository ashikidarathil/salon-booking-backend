import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { MESSAGES } from '../constants/category.messages';
import type { ICategoryService } from './ICategoryService';
import type { ICategoryRepository } from '../repository/ICategoryRepository';
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
  SoftDeleteCategoryDto,
  RestoreCategoryDto,
  CategoryPaginationQueryDto,
} from '../dto/category.request.dto';
import type { CategoryPaginatedResponse } from '../dto/category.response.dto';
import { CategoryMapper } from '../mapper/category.mapper';

@injectable()
export class CategoryService implements ICategoryService {
  constructor(@inject(TOKENS.CategoryRepository) private readonly _repo: ICategoryRepository) {}

  async create(dto: CreateCategoryDto) {
    const name = dto.name?.trim();
    if (!name) throw new AppError(MESSAGES.CATEGORY.NAME_REQUIRED, HttpStatus.BAD_REQUEST);

    const exists = await this._repo.findByName(name);
    if (exists) throw new AppError(MESSAGES.CATEGORY.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);

    const doc = await this._repo.create({ name, description: dto.description });
    return CategoryMapper.toDto(doc);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const update: Partial<{
      name: string;
      description?: string;
      status: 'ACTIVE' | 'INACTIVE';
    }> = {};

    if (dto.name?.trim()) {
      update.name = dto.name.trim().toLowerCase();
    }

    if (dto.description !== undefined) {
      update.description = dto.description?.trim();
    }

    if (dto.status) {
      update.status = dto.status;
    }

    const doc = await this._repo.updateById(id, update);
    if (!doc) {
      throw new AppError(MESSAGES.CATEGORY.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return CategoryMapper.toDto(doc);
  }

  async list(includeDeleted = false) {
    const docs = await this._repo.listAll(includeDeleted);
    return docs.map(CategoryMapper.toDto);
  }

  async softDelete(dto: SoftDeleteCategoryDto) {
    const doc = await this._repo.softDelete(dto.id);
    if (!doc) throw new AppError(MESSAGES.CATEGORY.NOT_FOUND, HttpStatus.NOT_FOUND);
    return CategoryMapper.toDto(doc);
  }

  async restore(dto: RestoreCategoryDto) {
    const doc = await this._repo.restore(dto.id);
    if (!doc) throw new AppError(MESSAGES.CATEGORY.NOT_FOUND, HttpStatus.NOT_FOUND);
    return CategoryMapper.toDto(doc);
  }

  async getPaginatedCategories(
    query: CategoryPaginationQueryDto,
  ): Promise<CategoryPaginatedResponse> {
    return this._repo.getPaginatedCategories(query);
  }
}
