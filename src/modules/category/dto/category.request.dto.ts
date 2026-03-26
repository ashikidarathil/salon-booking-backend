import { CategoryStatus } from '../constants/category.constants';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  status?: CategoryStatus;
}

export interface SoftDeleteCategoryDto {
  id: string;
}

export interface RestoreCategoryDto {
  id: string;
}

export interface CategoryPaginationQueryDto extends PaginationQueryDto {
  status?: CategoryStatus;
}
