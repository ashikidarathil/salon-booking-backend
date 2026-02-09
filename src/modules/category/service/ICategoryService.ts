import type {
  CreateCategoryDto,
  UpdateCategoryDto,
  SoftDeleteCategoryDto,
  RestoreCategoryDto,
  CategoryPaginationQueryDto,
} from '../dto/category.request.dto';
import type { CategoryResponseDto, CategoryPaginatedResponse } from '../dto/category.response.dto';

export interface ICategoryService {
  create(dto: CreateCategoryDto): Promise<CategoryResponseDto>;
  update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto>;
  list(includeDeleted?: boolean): Promise<CategoryResponseDto[]>;
  softDelete(dto: SoftDeleteCategoryDto): Promise<CategoryResponseDto>;
  restore(dto: RestoreCategoryDto): Promise<CategoryResponseDto>;
  getPaginatedCategories(query: CategoryPaginationQueryDto): Promise<CategoryPaginatedResponse>;
}
