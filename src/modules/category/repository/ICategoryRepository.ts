import type { CategoryDocument } from '../../../models/category.model';
import type { CategoryPaginationQueryDto } from '../dto/category.request.dto';
import type { CategoryPaginatedResponse } from '../dto/category.response.dto';

export interface ICategoryRepository {
  create(data: { name: string; description?: string }): Promise<CategoryDocument>;
  findByName(name: string): Promise<CategoryDocument | null>;
  findById(id: string): Promise<CategoryDocument | null>;

  listAll(includeDeleted?: boolean): Promise<CategoryDocument[]>;

  updateById(
    id: string,
    data: Partial<{ name: string; description?: string; status: 'ACTIVE' | 'INACTIVE' }>,
  ): Promise<CategoryDocument | null>;

  softDelete(id: string): Promise<CategoryDocument | null>;
  restore(id: string): Promise<CategoryDocument | null>;
  getPaginatedCategories(query: CategoryPaginationQueryDto): Promise<CategoryPaginatedResponse>;
}
